(function () {
  const canvas = document.getElementById('robot-arm');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const BLUE = '#58a6ff';
  const BLUE_DIM = 'rgba(88,166,255,0.35)';
  const BLUE_GLOW = 'rgba(88,166,255,0.22)';

  let W, H, scale;
  let baseX, baseY, baseTargetX;
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

  // Isometric box dimensions (in scale units)
  const BASE_W = 160, BASE_H = 50, BASE_D = 60;

  function iso(bx, by, bw, bh, bd) {
    // Returns the 8 key 2D points for the isometric box
    const dx = bd * 0.52, dy = bd * 0.26;
    return {
      // Front face (4 corners)
      fbl: { x: bx - bw/2,      y: by },
      fbr: { x: bx + bw/2,      y: by },
      ftl: { x: bx - bw/2,      y: by - bh },
      ftr: { x: bx + bw/2,      y: by - bh },
      // Back face (offset by dx, dy)
      bbl: { x: bx - bw/2 + dx, y: by - dy },
      bbr: { x: bx + bw/2 + dx, y: by - dy },
      btl: { x: bx - bw/2 + dx, y: by - bh - dy },
      btr: { x: bx + bw/2 + dx, y: by - bh - dy },
    };
  }

  function resize() {
    const hero = canvas.closest('.vh-hero') || document.body;
    W = canvas.width = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
    scale = Math.min(W, H) / 700;

    baseX = W * 0.52;
    baseTargetX = baseX;
    baseY = H * 0.75;

    SEGS = [95, 78, 63, 50, 36].map(s => s * scale);
    LINK_W = [8, 6.5, 5, 4, 3].map(w => w * scale);

    updateArmRoot();
    resetJoints();
    rawTarget = { x: W * 0.35, y: H * 0.28 };
    smooth = { ...rawTarget };
  }

  function updateArmRoot() {
    const bw = BASE_W * scale, bh = BASE_H * scale, bd = BASE_D * scale;
    const dx = bd * 0.52, dy = bd * 0.26;
    // Center of top face
    armRoot.x = baseX + dx * 0.5;
    armRoot.y = baseY - bh - dy * 0.5;
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
    const cx = baseX - W * 0.08;
    const cy = armRoot.y - H * 0.1;
    return {
      x: cx + W * 0.16 * Math.sin(idleT * 0.38),
      y: cy + H * 0.15 * Math.sin(idleT * 0.61),
    };
  }

  function glow(color, blur) { ctx.shadowColor = color; ctx.shadowBlur = blur; }
  function noGlow() { ctx.shadowBlur = 0; }

  function poly(pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
  }

  function drawMobileBase() {
    const bx = baseX, by = baseY;
    const bw = BASE_W * scale, bh = BASE_H * scale, bd = BASE_D * scale;
    const p = iso(bx, by, bw, bh, bd);

    ctx.save();

    // ── Top face ─────────────────────────────────────────────────
    glow(BLUE_GLOW, 14);
    poly([p.ftl, p.ftr, p.btr, p.btl]);
    ctx.fillStyle = 'rgba(14,22,35,0.97)';
    ctx.fill();
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    noGlow();

    // Top face grid lines
    ctx.strokeStyle = BLUE_DIM;
    ctx.lineWidth = 0.6;
    const tMidX1 = (p.ftl.x + p.ftr.x) / 2, tMidY1 = (p.ftl.y + p.ftr.y) / 2;
    const tMidX2 = (p.btl.x + p.btr.x) / 2, tMidY2 = (p.btl.y + p.btr.y) / 2;
    ctx.beginPath(); ctx.moveTo(tMidX1, tMidY1); ctx.lineTo(tMidX2, tMidY2); ctx.stroke();
    const tMidX3 = (p.ftl.x + p.btl.x) / 2, tMidY3 = (p.ftl.y + p.btl.y) / 2;
    const tMidX4 = (p.ftr.x + p.btr.x) / 2, tMidY4 = (p.ftr.y + p.btr.y) / 2;
    ctx.beginPath(); ctx.moveTo(tMidX3, tMidY3); ctx.lineTo(tMidX4, tMidY4); ctx.stroke();

    // ── Front face ────────────────────────────────────────────────
    glow(BLUE_GLOW, 10);
    poly([p.ftl, p.ftr, p.fbr, p.fbl]);
    ctx.fillStyle = 'rgba(8,11,15,0.95)';
    ctx.fill();
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    noGlow();

    // Red panel on front face (lower 45%)
    const redTop = p.ftl.y + bh * 0.55;
    poly([
      { x: p.ftl.x, y: redTop }, { x: p.ftr.x, y: redTop },
      { x: p.fbr.x, y: p.fbr.y }, { x: p.fbl.x, y: p.fbl.y }
    ]);
    ctx.fillStyle = 'rgba(160,24,24,0.38)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(200,40,40,0.4)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Front face detail line
    ctx.beginPath();
    ctx.moveTo(p.ftl.x + 8 * scale, p.ftl.y + 6 * scale);
    ctx.lineTo(p.ftr.x - 8 * scale, p.ftr.y + 6 * scale);
    ctx.strokeStyle = BLUE_DIM;
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // ── Right side face ───────────────────────────────────────────
    glow(BLUE_GLOW, 8);
    poly([p.ftr, p.btr, p.bbr, p.fbr]);
    ctx.fillStyle = 'rgba(6,9,12,0.97)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(88,166,255,0.55)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    noGlow();

    // Right side red stripe
    const rRedTop = p.ftr.y + bh * 0.55;
    const rRedTopB = p.btr.y + bh * 0.55;
    poly([
      { x: p.ftr.x, y: rRedTop }, { x: p.btr.x, y: rRedTopB },
      { x: p.bbr.x, y: p.bbr.y }, { x: p.fbr.x, y: p.fbr.y }
    ]);
    ctx.fillStyle = 'rgba(140,20,20,0.28)';
    ctx.fill();

    // ── Wheels on front face ──────────────────────────────────────
    const wheelR = 14 * scale;
    const wheelY = by - 5 * scale;
    [-0.3, 0.3].forEach(ox => {
      const wx = bx + (BASE_W * scale) * ox;
      ctx.beginPath();
      ctx.arc(wx, wheelY, wheelR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(14,18,26,0.98)';
      ctx.fill();
      ctx.strokeStyle = BLUE;
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(wx, wheelY, 2 * scale, 0, Math.PI * 2);
      ctx.fillStyle = BLUE_DIM;
      ctx.fill();
    });

    // ── Arm mount ring on top face ────────────────────────────────
    glow(BLUE_GLOW, 18);
    ctx.beginPath();
    ctx.arc(armRoot.x, armRoot.y, 11 * scale, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(8,11,15,0.95)';
    ctx.fill();
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(armRoot.x, armRoot.y, 4.5 * scale, 0, Math.PI * 2);
    ctx.fillStyle = BLUE;
    ctx.fill();
    noGlow();

    ctx.restore();
  }

  function drawLink(x1, y1, x2, y2, w) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len, ny = dx / len;

    ctx.save();
    glow(BLUE_GLOW, 10);

    // Link body
    ctx.beginPath();
    ctx.moveTo(x1 + nx * w, y1 + ny * w);
    ctx.lineTo(x2 + nx * w * 0.7, y2 + ny * w * 0.7);
    ctx.lineTo(x2 - nx * w * 0.7, y2 - ny * w * 0.7);
    ctx.lineTo(x1 - nx * w, y1 - ny * w);
    ctx.closePath();

    // Cylindrical gradient across the link width
    const gx1 = (x1 + x2) / 2 + nx * w;
    const gy1 = (y1 + y2) / 2 + ny * w;
    const gx2 = (x1 + x2) / 2 - nx * w;
    const gy2 = (y1 + y2) / 2 - ny * w;
    const grad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
    grad.addColorStop(0,   'rgba(30,50,75,0.75)');
    grad.addColorStop(0.3, 'rgba(12,20,32,0.92)');
    grad.addColorStop(0.7, 'rgba(8,14,22,0.95)');
    grad.addColorStop(1,   'rgba(4,8,14,0.85)');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Specular highlight strip
    ctx.beginPath();
    ctx.moveTo(x1 + nx * w * 0.55, y1 + ny * w * 0.55);
    ctx.lineTo(x2 + nx * w * 0.38, y2 + ny * w * 0.38);
    ctx.strokeStyle = 'rgba(165,214,255,0.22)';
    ctx.lineWidth = w * 0.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    noGlow();
    ctx.restore();
  }

  function drawJoint(x, y, r) {
    ctx.save();
    glow(BLUE_GLOW, 16);

    // Spherical radial gradient
    const rg = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.05, x, y, r);
    rg.addColorStop(0,   'rgba(88,166,255,0.55)');
    rg.addColorStop(0.4, 'rgba(20,35,55,0.92)');
    rg.addColorStop(1,   'rgba(6,10,16,0.97)');

    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = rg; ctx.fill();
    ctx.strokeStyle = BLUE; ctx.lineWidth = 1.4; ctx.stroke();

    // Center dot
    ctx.beginPath(); ctx.arc(x, y, r * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(88,166,255,0.7)'; ctx.fill();

    noGlow();
    ctx.restore();
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
    drawMobileBase();

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

    // Base slow drift
    if (!hasMouseEntered) {
      baseTargetX = W * 0.52 + Math.sin(idleT * 0.22) * W * 0.05;
    }
    baseX += (baseTargetX - baseX) * 0.012;
    updateArmRoot();
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
