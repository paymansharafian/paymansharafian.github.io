(function () {
  const canvas = document.getElementById('robot-arm');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const BLUE = '#58a6ff';
  const BLUE_DIM = 'rgba(88,166,255,0.35)';
  const BLUE_GLOW = 'rgba(88,166,255,0.22)';

  let W, H, scale;
  let baseX, baseY, baseTargetX;
  let columnH, columnTargetH;
  let armRoot = { x: 0, y: 0 };

  const N_SEGS = 5;
  const N = N_SEGS + 1;
  let joints = [];
  let SEGS, LINK_W;

  const TRAIL_LEN = 45;
  let trail = [];
  let rawTarget = { x: 0, y: 0 };
  let smooth = { x: 0, y: 0 };
  let hasMouseEntered = false;
  let idleT = 0;
  let gripperOpen = 0;

  function resize() {
    const hero = canvas.closest('.vh-hero') || document.body;
    W = canvas.width = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
    scale = Math.min(W, H) / 700;

    baseX = W * 0.52;
    baseTargetX = baseX;
    baseY = H * 0.75;
    columnH = H * 0.3;
    columnTargetH = columnH;

    SEGS = [95, 78, 63, 50, 36].map(s => s * scale);
    LINK_W = [8.5, 7, 5.5, 4.5, 3.5].map(w => w * scale);

    updateArmRoot();
    resetJoints();
    rawTarget = { x: W * 0.35, y: H * 0.28 };
    smooth = { ...rawTarget };
  }

  function updateArmRoot() {
    armRoot.x = baseX;
    armRoot.y = baseY - columnH;
  }

  function resetJoints() {
    joints = [];
    let acc = 0;
    for (let i = 0; i < N; i++) {
      joints.push({ x: armRoot.x, y: armRoot.y - acc });
      if (i < N_SEGS) acc += SEGS[i];
    }
  }

  window.addEventListener('resize', () => { resize(); });

  const hero = canvas.closest('.vh-hero');
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      rawTarget.x = e.clientX - r.left;
      rawTarget.y = e.clientY - r.top;
      hasMouseEntered = true;
    });
    hero.addEventListener('mouseleave', () => { hasMouseEntered = false; });
  }

  resize();

  function fabrik(target, iters) {
    const ROOT = armRoot;
    const total = SEGS.reduce((a, b) => a + b, 0);
    const dx = target.x - ROOT.x, dy = target.y - ROOT.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > total * 0.97) {
      for (let i = 0; i < N - 1; i++) {
        const d = Math.sqrt((target.x - joints[i].x) ** 2 + (target.y - joints[i].y) ** 2) || 1;
        const l = SEGS[i] / d;
        joints[i + 1].x = (1 - l) * joints[i].x + l * target.x;
        joints[i + 1].y = (1 - l) * joints[i].y + l * target.y;
      }
      return;
    }

    for (let k = 0; k < iters; k++) {
      joints[N - 1].x = target.x; joints[N - 1].y = target.y;
      for (let i = N - 2; i >= 0; i--) {
        const d = Math.sqrt((joints[i+1].x-joints[i].x)**2+(joints[i+1].y-joints[i].y)**2)||1;
        const l = SEGS[i] / d;
        joints[i].x = (1-l)*joints[i+1].x + l*joints[i].x;
        joints[i].y = (1-l)*joints[i+1].y + l*joints[i].y;
      }
      joints[0].x = ROOT.x; joints[0].y = ROOT.y;
      for (let i = 0; i < N - 1; i++) {
        const d = Math.sqrt((joints[i+1].x-joints[i].x)**2+(joints[i+1].y-joints[i].y)**2)||1;
        const l = SEGS[i] / d;
        joints[i+1].x = (1-l)*joints[i].x + l*joints[i+1].x;
        joints[i+1].y = (1-l)*joints[i].y + l*joints[i+1].y;
      }
    }
  }

  function getIdleTarget() {
    const cx = baseX - W * 0.1;
    const cy = armRoot.y - H * 0.08;
    return {
      x: cx + W * 0.16 * Math.sin(idleT * 0.38),
      y: cy + H * 0.14 * Math.sin(idleT * 0.63),
    };
  }

  // ── Drawing helpers ────────────────────────────────────────────

  function glow(color, blur) { ctx.shadowColor = color; ctx.shadowBlur = blur; }
  function noGlow() { ctx.shadowBlur = 0; }

  function rrect(x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y); ctx.arcTo(x+w, y, x+w, y+r, r);
      ctx.lineTo(x + w, y + h - r); ctx.arcTo(x+w, y+h, x+w-r, y+h, r);
      ctx.lineTo(x + r, y + h); ctx.arcTo(x, y+h, x, y+h-r, r);
      ctx.lineTo(x, y + r); ctx.arcTo(x, y, x+r, y, r);
      ctx.closePath();
    }
  }

  function drawWalkerFrame() {
    const bx = baseX, by = baseY;
    const fw = 95 * scale;
    const fh = 320 * scale;
    const thick = 6 * scale;

    ctx.save();
    ctx.strokeStyle = 'rgba(100,145,190,0.22)';
    ctx.lineWidth = thick;
    ctx.lineCap = 'square';

    // Left pillar
    ctx.beginPath();
    ctx.moveTo(bx - fw * 0.5, by + 2 * scale);
    ctx.lineTo(bx - fw * 0.5, by - fh);
    ctx.stroke();

    // Right pillar
    ctx.beginPath();
    ctx.moveTo(bx + fw * 0.5, by + 2 * scale);
    ctx.lineTo(bx + fw * 0.5, by - fh);
    ctx.stroke();

    // Top bar
    ctx.lineWidth = thick * 1.2;
    ctx.beginPath();
    ctx.moveTo(bx - fw * 0.5 - 12 * scale, by - fh);
    ctx.lineTo(bx + fw * 0.5 + 12 * scale, by - fh);
    ctx.stroke();

    // Mid cross bar
    ctx.lineWidth = thick * 0.7;
    ctx.strokeStyle = 'rgba(100,145,190,0.14)';
    ctx.beginPath();
    ctx.moveTo(bx - fw * 0.5, by - fh * 0.55);
    ctx.lineTo(bx + fw * 0.5, by - fh * 0.55);
    ctx.stroke();

    // Diagonal bracing (subtle)
    ctx.strokeStyle = 'rgba(100,145,190,0.08)';
    ctx.lineWidth = 2.5 * scale;
    ctx.beginPath();
    ctx.moveTo(bx - fw * 0.5, by); ctx.lineTo(bx + fw * 0.5, by - fh * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx + fw * 0.5, by); ctx.lineTo(bx - fw * 0.5, by - fh * 0.5);
    ctx.stroke();

    ctx.restore();
  }

  function drawMobileBase() {
    const bx = baseX, by = baseY;
    const bw = 125 * scale, bh = 42 * scale;
    const r = 10 * scale;

    ctx.save();

    // Main body
    glow(BLUE_GLOW, 18);
    rrect(bx - bw * 0.5, by - bh, bw, bh, r);
    ctx.fillStyle = 'rgba(8,11,15,0.93)';
    ctx.fill();
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    noGlow();

    // Red accent panel (ARNA's red)
    rrect(bx - bw * 0.5, by - bh * 0.52, bw, bh * 0.44, [0, 0, r * 0.7, r * 0.7]);
    ctx.fillStyle = 'rgba(180,28,28,0.32)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(200,40,40,0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Top edge detail line
    ctx.beginPath();
    ctx.moveTo(bx - bw * 0.45, by - bh + 7 * scale);
    ctx.lineTo(bx + bw * 0.45, by - bh + 7 * scale);
    ctx.strokeStyle = BLUE_DIM;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Wheels
    const wheelR = 11 * scale;
    const wheelY = by - 5 * scale;
    [-0.42, -0.18, 0.18, 0.42].forEach(ox => {
      const wx = bx + bw * ox;
      ctx.beginPath();
      ctx.ellipse(wx, wheelY, wheelR * 0.45, wheelR, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16,20,28,0.97)';
      ctx.fill();
      ctx.strokeStyle = BLUE;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // Wheel hub
      ctx.beginPath();
      ctx.arc(wx, wheelY, 2.5 * scale, 0, Math.PI * 2);
      ctx.fillStyle = BLUE_DIM;
      ctx.fill();
    });

    // Small logo circles (UofL nod)
    [-0.3, 0.3].forEach(ox => {
      ctx.beginPath();
      ctx.arc(bx + bw * ox, by - bh * 0.72, 7 * scale, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(200,40,40,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    ctx.restore();
  }

  function drawColumn() {
    const bx = baseX, by = baseY;
    const cw = 13 * scale;
    const ch = columnH;

    ctx.save();

    // Outer shell
    glow(BLUE_GLOW, 10);
    ctx.beginPath();
    ctx.rect(bx - cw * 0.5, by - ch, cw, ch - 30 * scale);
    ctx.fillStyle = 'rgba(8,11,15,0.92)';
    ctx.fill();
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    noGlow();

    // Telescoping inner segment
    ctx.beginPath();
    ctx.rect(bx - cw * 0.3, by - ch * 0.7, cw * 0.6, ch * 0.45);
    ctx.strokeStyle = BLUE_DIM;
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // Mounting flange at top
    ctx.beginPath();
    ctx.rect(bx - cw, by - ch - 4 * scale, cw * 2, 8 * scale);
    ctx.fillStyle = 'rgba(8,11,15,0.9)';
    ctx.fill();
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Joint circle at column top
    glow(BLUE_GLOW, 16);
    ctx.beginPath(); ctx.arc(bx, by - ch, 10 * scale, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(8,11,15,0.92)'; ctx.fill();
    ctx.strokeStyle = BLUE; ctx.lineWidth = 1.8; ctx.stroke();
    ctx.beginPath(); ctx.arc(bx, by - ch, 4 * scale, 0, Math.PI * 2);
    ctx.fillStyle = BLUE; ctx.fill();
    noGlow();

    ctx.restore();
  }

  function drawLink(x1, y1, x2, y2, w) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len, ny = dx / len;
    ctx.save();
    glow(BLUE_GLOW, 11);
    ctx.beginPath();
    ctx.moveTo(x1 + nx * w, y1 + ny * w);
    ctx.lineTo(x2 + nx * w * 0.65, y2 + ny * w * 0.65);
    ctx.lineTo(x2 - nx * w * 0.65, y2 - ny * w * 0.65);
    ctx.lineTo(x1 - nx * w, y1 - ny * w);
    ctx.closePath();
    ctx.fillStyle = 'rgba(8,11,15,0.82)'; ctx.fill();
    ctx.strokeStyle = BLUE; ctx.lineWidth = 1.3; ctx.stroke();
    noGlow(); ctx.restore();
  }

  function drawJoint(x, y, r) {
    ctx.save();
    glow(BLUE_GLOW, 14);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(8,11,15,0.9)'; ctx.fill();
    ctx.strokeStyle = BLUE; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, r * 0.38, 0, Math.PI * 2);
    ctx.fillStyle = BLUE_DIM; ctx.fill();
    noGlow(); ctx.restore();
  }

  function drawGripper(x, y, angle, openAmt) {
    const s = scale;
    const gap = (6 + openAmt * 11) * s;
    const len = (15 + openAmt * 3) * s;
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    glow(BLUE_GLOW, 9);
    ctx.strokeStyle = BLUE; ctx.lineWidth = 1.8 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-gap, 0); ctx.lineTo(-gap, len); ctx.lineTo(-gap + 4 * s, len + 5 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(gap, 0); ctx.lineTo(gap, len); ctx.lineTo(gap - 4 * s, len + 5 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-gap - 2 * s, 0); ctx.lineTo(gap + 2 * s, 0); ctx.stroke();
    noGlow(); ctx.restore();
  }

  function drawTrail() {
    if (trail.length < 2) return;
    for (let i = 1; i < trail.length; i++) {
      const t = i / trail.length;
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.strokeStyle = `rgba(88,166,255,${t * 0.2})`;
      ctx.lineWidth = t * 2.8;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawTrail();
    drawWalkerFrame();
    drawMobileBase();
    drawColumn();

    const sz = scale;
    const jointR = [0, 6.5, 5.5, 5, 4.5, 4].map(r => r * sz);
    for (let i = 0; i < N - 1; i++) drawLink(joints[i].x, joints[i].y, joints[i+1].x, joints[i+1].y, LINK_W[i] || 3 * sz);
    for (let i = 1; i < N; i++) drawJoint(joints[i].x, joints[i].y, jointR[i] || 3.5 * sz);

    const ex = joints[N - 1], ep = joints[N - 2];
    const angle = Math.atan2(ex.y - ep.y, ex.x - ep.x) + Math.PI / 2;
    drawGripper(ex.x, ex.y, angle, gripperOpen);
  }

  function loop() {
    idleT += 0.007;

    // Base drift
    if (!hasMouseEntered) {
      baseTargetX = W * 0.52 + Math.sin(idleT * 0.22) * W * 0.055;
    }
    baseX += (baseTargetX - baseX) * 0.012;

    // Column height oscillation
    if (!hasMouseEntered) {
      columnTargetH = H * 0.3 + Math.sin(idleT * 0.28) * H * 0.025;
    }
    columnH += (columnTargetH - columnH) * 0.018;
    updateArmRoot();

    // Pin FABRIK root to column top
    joints[0].x = armRoot.x;
    joints[0].y = armRoot.y;

    if (hasMouseEntered) {
      smooth.x += (rawTarget.x - smooth.x) * 0.09;
      smooth.y += (rawTarget.y - smooth.y) * 0.09;
      gripperOpen = Math.min(1, gripperOpen + 0.04);
    } else {
      const t = getIdleTarget();
      smooth.x += (t.x - smooth.x) * 0.03;
      smooth.y += (t.y - smooth.y) * 0.03;
      gripperOpen = Math.max(0, gripperOpen - 0.02);
    }

    fabrik(smooth, 12);

    const ee = joints[N - 1];
    trail.push({ x: ee.x, y: ee.y });
    if (trail.length > TRAIL_LEN) trail.shift();

    draw();
    requestAnimationFrame(loop);
  }

  loop();
})();
