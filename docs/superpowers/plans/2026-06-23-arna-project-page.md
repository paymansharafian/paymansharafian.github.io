# ARNA Project Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `_projects/1_arna.md` into a recruiter-facing 7-section case study for the ARNA robot, split the old teleoperation project into two, and renumber the projects collection so the two scenario clusters stay grouped.

**Architecture:** Jekyll al-folio static site. The ARNA page keeps `layout: page` and supplies all custom sections as raw HTML in the markdown body, styled by new `.arna-*` classes appended to `_sass/_components.scss`. Project cross-links are plain `<a>` tags built with the Liquid `relative_url` filter against the final renumbered URLs. Images are copied into `assets/img/arna/` and referenced with direct `<img>` tags.

**Tech Stack:** Jekyll, Liquid, kramdown (Markdown), SCSS, Docker (al-folio image `amirpourmand/al-folio:v0.16.3`), Prettier + `@shopify/prettier-plugin-liquid`.

## Global Constraints

- **Patent wording:** the user is NOT a named inventor. Copy must read "The ARNA platform is protected under US Patent US12090629B2" — never imply the user is an inventor.
- **No patient-identifiable media** anywhere. No video on this page. Only the cleared hero photo `IMG_20240924_111056.jpg` is used.
- **Contribution copy uses "I"** (first person) to isolate the user's work from the lab's.
- **Final project URL map** (every cross-link must target these exact slugs):
  `1_arna`, `2_mpc_cbf`, `3_remote_ui`, `4_pick_place`, `5_nac`, `6_intent`, `7_tactile`, `8_pnnui`.
- **Theme variables only** for colors: `--global-theme-color`, `--global-card-bg-color`, `--global-divider-color`, `--global-text-color`, `--global-text-color-light` (defined for both light and dark themes). Reuse the existing `.project-tag` class for tech pills.
- **Git:** create a feature branch before implementing (do not commit directly to `main`). Commit locally per task. Do not push or open a PR until the user asks.
- **Markdown body is raw HTML:** keep all custom HTML block-level and unindented so kramdown passes it through. Use HTML entities (`&amp;`) not literal `&`. Liquid `{{ ... }}` inside HTML attributes is fine.

## File Structure

| File                        | Responsibility                               | Change                          |
| --------------------------- | -------------------------------------------- | ------------------------------- |
| `assets/img/arna/`          | ARNA page images                             | Create (5 files)                |
| `_projects/1_arna.md`       | ARNA case-study page                         | Rewrite body + front matter     |
| `_projects/2_mpc_cbf.md`    | MPC-CBF project (was `3_mpc_cbf.md`)         | Rename + retitle + importance 2 |
| `_projects/3_remote_ui.md`  | Remote UI project (was `2_teleoperation.md`) | Rename + rewrite                |
| `_projects/4_pick_place.md` | Pick-place project (new, split half)         | Create                          |
| `_projects/5_nac.md`        | NAC project (was `4_nac.md`)                 | Rename + importance 5           |
| `_projects/6_intent.md`     | Intent project (was `5_intent.md`)           | Rename + importance 6           |
| `_projects/7_tactile.md`    | Tactile project (was `6_tactile.md`)         | Rename + importance 7           |
| `_projects/8_pnnui.md`      | PNNUI project (was `7_pnnui.md`)             | Rename + importance 8           |
| `_sass/_components.scss`    | Component styles                             | Append `.arna-*` block          |

---

### Task 1: Copy ARNA images into `assets/img/arna/`

**Files:**

- Create: `assets/img/arna/arna_hero_clinical.jpg`
- Create: `assets/img/arna/arna_hardware_scheme.jpg`
- Create: `assets/img/arna/arna_software_architecture.png`
- Create: `assets/img/arna/arna_electrical_diagram.jpg`
- Create: `assets/img/arna/arna_internals.png`

**Interfaces:**

- Produces: five image assets at the paths above. Task 4 references the first four with `<img src="{{ '/assets/img/arna/<name>' | relative_url }}">`; the ARNA card thumbnail (Task 4 front matter `img:`) references `arna_hero_clinical.jpg`.

- [ ] **Step 1: Create the folder and copy all five sources**

```bash
cd /home/peycool/CV/paymansharafian.github.io
mkdir -p assets/img/arna
cp "/mnt/c/Users/peyma/OneDrive - University of Louisville/PHD/LARRI/Hospital Trial/IMG_20240924_111056.jpg" assets/img/arna/arna_hero_clinical.jpg
cp "/mnt/c/Users/peyma/OneDrive - University of Louisville/PHD/LARRI/Handlebar_data/2025 version/TMRB submission/T_MRB_Tactile_Handlebar_and_Deep_Learning_for_Safe_Interaction_with_a_Robot_Nursing_Assistant/ARNA_Scheme2.jpg" assets/img/arna/arna_hardware_scheme.jpg
cp "/home/peycool/.claude/image-cache/9497c4b2-c41d-4b9b-b965-ead8a4408e7e/9.png" assets/img/arna/arna_software_architecture.png
cp "/mnt/c/Users/peyma/OneDrive - University of Louisville/PHD/LARRI/ARNA Long Distance Tele/Presentation/ARNA Scheme - Frame 1.jpg" assets/img/arna/arna_electrical_diagram.jpg
cp "/home/peycool/.claude/image-cache/9497c4b2-c41d-4b9b-b965-ead8a4408e7e/7.png" assets/img/arna/arna_internals.png
```

- [ ] **Step 2: Verify all five files exist and are valid images**

Run:

```bash
cd /home/peycool/CV/paymansharafian.github.io
ls -la assets/img/arna/ && file assets/img/arna/*
```

Expected: 5 files listed, each non-zero size, and `file` reports `JPEG image data` for the three `.jpg` and `PNG image data` for the two `.png`. No "cannot open" errors.

- [ ] **Step 3: Commit**

```bash
cd /home/peycool/CV/paymansharafian.github.io
git add assets/img/arna/
git commit -m "feat(arna): add ARNA project page images"
```

---

### Task 2: Restructure the projects collection (split + renumber + retitle)

**Files:**

- Rename: `_projects/3_mpc_cbf.md` → `_projects/2_mpc_cbf.md`
- Rename: `_projects/2_teleoperation.md` → `_projects/3_remote_ui.md` (then rewrite)
- Create: `_projects/4_pick_place.md`
- Rename: `_projects/4_nac.md` → `_projects/5_nac.md`
- Rename: `_projects/5_intent.md` → `_projects/6_intent.md`
- Rename: `_projects/6_tactile.md` → `_projects/7_tactile.md`
- Rename: `_projects/7_pnnui.md` → `_projects/8_pnnui.md`

**Interfaces:**

- Produces: the 8 final project URLs listed in Global Constraints. Task 4's cross-links depend on these exact slugs existing.

- [ ] **Step 1: Rename files with `git mv` (no target collisions — every target stem is unique)**

```bash
cd /home/peycool/CV/paymansharafian.github.io/_projects
git mv 7_pnnui.md 8_pnnui.md
git mv 6_tactile.md 7_tactile.md
git mv 5_intent.md 6_intent.md
git mv 4_nac.md 5_nac.md
git mv 3_mpc_cbf.md 2_mpc_cbf.md
git mv 2_teleoperation.md 3_remote_ui.md
```

- [ ] **Step 2: Update the `importance` field in each renumbered file to match its new number**

Edit `_projects/2_mpc_cbf.md`: change `importance: 3` → `importance: 2`, and change the title line
`title: "Network-Aware MPC-CBF for Safe Teleoperation"` →
`title: "Network-Aware MPC-CBF for Safe Remote Teleoperation of ARNA"`.

Edit `_projects/5_nac.md`: change `importance: 4` → `importance: 5`.
Edit `_projects/6_intent.md`: change `importance: 5` → `importance: 6`.
Edit `_projects/7_tactile.md`: change `importance: 6` → `importance: 7`.
Edit `_projects/8_pnnui.md`: change `importance: 7` → `importance: 8`.

- [ ] **Step 3: Overwrite `_projects/3_remote_ui.md` with the Remote UI content**

Replace the entire file with:

```markdown
---
layout: page
title: "ARNA Remote User Interface Design"
description: "Browser-based remote control interface for ARNA. A Next.js frontend streams low-latency video and multi-channel robot state over Cloudflare-tunneled WebSocket/rosbridge connections, letting operators drive the robot from any location."
img:
importance: 3
category: work
tech: [ROS1, Next.js, WebSockets, rosbridge, Cloudflare, RTSP, Python, JavaScript]
---

Architected a distributed teleoperation frontend combining ROS1 with a Next.js web application, enabling operators to control ARNA from a browser over Cloudflare-tunneled WebSocket connections with multi-channel rosbridge streaming and low-latency video.
```

- [ ] **Step 4: Create `_projects/4_pick_place.md`**

```markdown
---
layout: page
title: "ARNA Semi-Autonomous Pick Place"
description: "Point-and-click semi-autonomous grasping for ARNA. FastSAM provides real-time object segmentation and Contact-GraspNet estimates grasp poses, letting an operator trigger reliable pick-and-place from a single click in the remote UI."
img:
importance: 4
category: work
tech: [ROS1, Python, C++, FastSAM, Contact-GraspNet, MoveIt, Perception]
---

Implemented semi-autonomous grasping using FastSAM for real-time object segmentation and Contact-GraspNet for grasp pose estimation, allowing point-and-click pick-and-place execution from the browser UI.
```

- [ ] **Step 5: Verify the collection — 8 files, correct titles, correct importance, no stale references**

Run:

```bash
cd /home/peycool/CV/paymansharafian.github.io/_projects
ls -1 *.md
echo "--- titles + importance ---"
grep -H "^title:\|^importance:" *.md
echo "--- stale-link check (expect no output) ---"
grep -rn "projects/3_mpc_cbf\|projects/4_nac\|projects/5_intent\|projects/6_tactile\|projects/7_pnnui\|2_teleoperation" /home/peycool/CV/paymansharafian.github.io/_pages /home/peycool/CV/paymansharafian.github.io/_projects /home/peycool/CV/paymansharafian.github.io/_includes /home/peycool/CV/paymansharafian.github.io/_layouts /home/peycool/CV/paymansharafian.github.io/_data
```

Expected: exactly these 8 files —
`1_arna.md 2_mpc_cbf.md 3_remote_ui.md 4_pick_place.md 5_nac.md 6_intent.md 7_tactile.md 8_pnnui.md`.
Titles/importance match the Global Constraints map (e.g. `2_mpc_cbf.md` → importance 2 and title "Network-Aware MPC-CBF for Safe Remote Teleoperation of ARNA"). The stale-link grep prints **nothing**.

- [ ] **Step 6: Commit**

```bash
cd /home/peycool/CV/paymansharafian.github.io
git add _projects/
git commit -m "feat(projects): split teleoperation into Remote UI + Pick Place, renumber collection"
```

---

### Task 3: Append `.arna-*` styles to `_sass/_components.scss`

**Files:**

- Modify: `_sass/_components.scss` (append at end of file)

**Interfaces:**

- Produces: CSS classes consumed by Task 4's HTML: `arna-badges`, `arna-badge`, `arna-hero-img`, `arna-lead`, `arna-section-heading`, `arna-overview`, `arna-overview-fig`, `arna-contrib-grid`, `arna-contrib-card`, `arna-scenario-intro`, `arna-scenarios`, `arna-scenario-panel`, `arna-scenario-links`, `arna-figure`, `arna-caption`, `arna-techstack`, `arna-patent`.

- [ ] **Step 1: Append the style block to the end of `_sass/_components.scss`**

```scss
// ── ARNA project page ──

.arna-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.5rem 0 1.25rem;
}

.arna-badge {
  background: var(--global-card-bg-color);
  border: 1px solid var(--global-theme-color);
  color: var(--global-theme-color);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  white-space: nowrap;
}

.arna-hero-img {
  width: 100%;
  max-height: 460px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid var(--global-divider-color);
  box-shadow: 0 0 24px rgba(88, 166, 255, 0.15);
  display: block;
  margin-bottom: 1rem;
}

.arna-lead {
  font-size: 1.15rem;
  line-height: 1.6;
  color: var(--global-text-color);
  border-left: 3px solid var(--global-theme-color);
  padding-left: 1rem;
  margin: 1rem 0 2rem;
}

.arna-section-heading {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--global-theme-color);
  margin: 2rem 0 1rem;
}

.arna-overview {
  overflow: hidden; // clearfix for the floated figure
}

.arna-overview-fig {
  width: 40%;
  float: right;
  margin: 0 0 1rem 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--global-divider-color);
}

.arna-contrib-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1rem 0 2rem;
}

.arna-contrib-card {
  background: var(--global-card-bg-color);
  border: 1px solid var(--global-divider-color);
  border-radius: 8px;
  padding: 1rem 1.25rem;

  h3 {
    font-size: 1rem;
    font-weight: 700;
    color: var(--global-theme-color);
    margin: 0 0 0.6rem;
  }

  ul {
    margin: 0;
    padding-left: 1.1rem;
  }

  li {
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 0.35rem;
  }
}

.arna-scenario-intro {
  margin: 1rem 0 1.5rem;
  line-height: 1.7;
}

.arna-scenarios {
  display: flex;
  gap: 1.5rem;
  margin: 1rem 0 2rem;
}

.arna-scenario-panel {
  flex: 1;
  min-width: 0;
  background: var(--global-card-bg-color);
  border: 1px solid var(--global-divider-color);
  border-radius: 8px;
  padding: 1.25rem;

  h3 {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--global-text-color);
    margin: 0 0 0.5rem;
  }

  p {
    font-size: 0.9rem;
    line-height: 1.6;
    color: var(--global-text-color-light);
    margin-bottom: 0.9rem;
  }
}

.arna-scenario-links {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  a {
    font-size: 0.875rem;
    color: var(--global-theme-color);
    text-decoration: none;
    padding-left: 1.1rem;
    position: relative;

    &::before {
      content: "→";
      position: absolute;
      left: 0;
    }

    &:hover {
      text-decoration: underline;
    }
  }
}

.arna-figure {
  margin: 1.5rem 0;

  img {
    width: 100%;
    border-radius: 8px;
    border: 1px solid var(--global-divider-color);
  }
}

.arna-caption {
  font-size: 0.82rem;
  color: var(--global-text-color-light);
  text-align: center;
  margin-top: 0.5rem;
}

.arna-techstack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0 2rem;
}

.arna-patent {
  border-left: 4px solid var(--global-theme-color);
  background: var(--global-card-bg-color);
  border-radius: 0 8px 8px 0;
  padding: 1rem 1.25rem;
  margin: 1rem 0 2rem;

  a {
    color: var(--global-theme-color);
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

@media (max-width: 768px) {
  .arna-contrib-grid {
    grid-template-columns: 1fr;
  }

  .arna-scenarios {
    flex-direction: column;
  }

  .arna-overview-fig {
    width: 100%;
    float: none;
    margin: 0 0 1rem;
  }
}
```

- [ ] **Step 2: Verify the block was appended and braces are balanced**

Run:

```bash
cd /home/peycool/CV/paymansharafian.github.io
grep -c "arna-" _sass/_components.scss
python3 -c "s=open('_sass/_components.scss').read(); print('balanced' if s.count('{')==s.count('}') else 'UNBALANCED %d/%d'%(s.count('{'),s.count('}')))"
```

Expected: the `grep -c` count is `> 25`, and the brace check prints `balanced`. (Full SCSS compilation is verified by the Docker build in Task 5.)

- [ ] **Step 3: Commit**

```bash
cd /home/peycool/CV/paymansharafian.github.io
git add _sass/_components.scss
git commit -m "feat(arna): add ARNA project page component styles"
```

---

### Task 4: Rewrite `_projects/1_arna.md` (7 sections)

**Files:**

- Modify: `_projects/1_arna.md` (full replacement)

**Interfaces:**

- Consumes: image assets from Task 1; the `.arna-*` classes from Task 3; the project URLs `/projects/2_mpc_cbf/`, `/projects/3_remote_ui/`, `/projects/4_pick_place/`, `/projects/5_nac/`, `/projects/6_intent/`, `/projects/7_tactile/` from Task 2.

- [ ] **Step 1: Replace the entire contents of `_projects/1_arna.md`**

```markdown
---
layout: page
title: "ARNA — Adaptive Nursing Assistant Robot"
description: "NSF-funded omnidirectional mobile manipulator for clinical nursing assistance — Kinova Gen3 arm on a Mecanum base with LiDAR and ATI Axia 80 F/T sensing. Primary engineer across hardware, software, control, and clinical deployment since 2023."
img: assets/img/arna/arna_hero_clinical.jpg
importance: 1
category: work
tech: [ROS1, Python, C++, Kinova Gen3, Mecanum Base, LiDAR, ATI F/T, EtherCAT, Jetson, Linux]
---

<div class="arna-badges">
  <span class="arna-badge">NSF-Funded</span>
  <span class="arna-badge">Patent US12090629B2</span>
  <span class="arna-badge">58+ Nursing Students</span>
  <span class="arna-badge">15+ Patients</span>
  <span class="arna-badge">2023–Present</span>
</div>

<img class="arna-hero-img" src="{{ '/assets/img/arna/arna_hero_clinical.jpg' | relative_url }}" alt="Demonstrating ARNA to a patient during a hospital trial" loading="eager" />

<p class="arna-lead">I led full-stack development of ARNA — from PCB repair to clinical deployment — as the primary engineer since 2023.</p>

<h2 class="arna-section-heading">Platform Overview</h2>
<div class="arna-overview">
  <img class="arna-overview-fig" src="{{ '/assets/img/arna/arna_hardware_scheme.jpg' | relative_url }}" alt="Annotated ARNA hardware: Kinova arm, sensorized handlebar, LiDAR, RGBD cameras, and onboard sensors" loading="lazy" />
  <p>ARNA (Adaptive Nursing Assistant Robot) is an NSF-funded omnidirectional mobile manipulator developed at LARRI for clinical nursing assistance. The platform pairs a Kinova Gen3 arm with a Mecanum-wheel base, LiDAR, ultrasonic/bump/IMU sensing, ATI Axia 80 force/torque sensors, and a sensorized handlebar, all running on a distributed ROS1 stack across an onboard PC and Jetson.</p>
  <p>ARNA targets two of the most physically demanding parts of nursing work — patient ambulation and fetch-and-carry tasks — by acting as both a smart walker and a teleoperable assistant, reducing strain on healthcare staff.</p>
</div>

<h2 class="arna-section-heading">My Contributions</h2>
<div class="arna-contrib-grid">
  <div class="arna-contrib-card">
    <h3>Hardware &amp; Electronics</h3>
    <ul>
      <li>Repaired and upgraded the motor-controller PCBs</li>
      <li>Made the sonar and bump sensors functional and integrated them into ROS</li>
      <li>Improved onboard wiring and sensor integration</li>
      <li>Integrated and repurposed the LiDAR for navigation</li>
    </ul>
  </div>
  <div class="arna-contrib-card">
    <h3>Software &amp; Perception</h3>
    <ul>
      <li>Built numerous ROS nodes across the control and sensing stack</li>
      <li>Developed perception pipelines for object detection and grasping</li>
      <li>Maintained the distributed onboard-PC / Jetson software system</li>
    </ul>
  </div>
  <div class="arna-contrib-card">
    <h3>Control Systems</h3>
    <ul>
      <li>Implemented and tuned the navigation stack</li>
      <li>Developed arm control and safety systems</li>
      <li>Debugged and fixed the pHRI controllers (NAC, HIE-NAC)</li>
    </ul>
  </div>
  <div class="arna-contrib-card">
    <h3>Clinical Deployment</h3>
    <ul>
      <li>Designed and ran nurse trials (58+ nursing students)</li>
      <li>Designed and ran hospital patient trials (15+ patients)</li>
      <li>Led study design and data collection</li>
    </ul>
  </div>
</div>

<h2 class="arna-section-heading">Operational Scenarios</h2>
<p class="arna-scenario-intro">ARNA supports two primary operational scenarios, each with dedicated control strategies and interfaces: the <strong>Walker scenario</strong> for physical human-robot interaction (pHRI), where a patient guides the robot as a mobility aid; and the <strong>Sitter/Teleoperation scenario</strong> for HRI tasks, where a patient or Nurse controls the robot <a href="{{ '/projects/2_mpc_cbf/' | relative_url }}"><strong>remotely</strong></a>.</p>

<div class="arna-scenarios">
  <div class="arna-scenario-panel">
    <h3>Walker Scenario (pHRI)</h3>
    <p>Patient physically guides ARNA using the sensorized handlebar. Control algorithms interpret intent through force/torque sensing and adapt robot behavior in real time.</p>
    <div class="arna-scenario-links">
      <a href="{{ '/projects/5_nac/' | relative_url }}">Neuroadaptive Admittance Controller</a>
      <a href="{{ '/projects/6_intent/' | relative_url }}">Neural Human Intent Estimator for ARNA</a>
      <a href="{{ '/projects/7_tactile/' | relative_url }}">Tactile Handlebar &amp; Deep Learning for Safe HRI</a>
    </div>
  </div>
  <div class="arna-scenario-panel">
    <h3>Sitter / Teleoperation Scenario (HRI)</h3>
    <p>Nurses or patients can control ARNA remotely from any location safely. The system provides semi-autonomous grasping assistance and network-aware safety guarantees. This feature reduces the physical strain on healthcare professionals.</p>
    <div class="arna-scenario-links">
      <a href="{{ '/projects/2_mpc_cbf/' | relative_url }}">Network-Aware MPC-CBF for Safe Remote Teleoperation of ARNA</a>
      <a href="{{ '/projects/3_remote_ui/' | relative_url }}">ARNA Remote User Interface Design</a>
      <a href="{{ '/projects/4_pick_place/' | relative_url }}">ARNA Semi-Autonomous Pick Place</a>
    </div>
  </div>
</div>

<h2 class="arna-section-heading">System Architecture</h2>
<figure class="arna-figure">
  <img src="{{ '/assets/img/arna/arna_software_architecture.png' | relative_url }}" alt="ARNA distributed software and networking architecture" loading="lazy" />
  <figcaption class="arna-caption">Distributed software &amp; networking architecture — sensors, instrumentation board, onboard PC (BlackBird), Jetson, and the Kinova arm communicating over Ethernet, USB, and Wi-Fi.</figcaption>
</figure>
<figure class="arna-figure">
  <img src="{{ '/assets/img/arna/arna_electrical_diagram.jpg' | relative_url }}" alt="ARNA power and motor-control wiring diagram" loading="lazy" />
  <figcaption class="arna-caption">Power and motor-control wiring — battery banks, inverter, instrumentation PCB, Sabertooth motor controllers, and the EtherCAT motor-control chain.</figcaption>
</figure>

<h2 class="arna-section-heading">Tech Stack</h2>
<div class="arna-techstack">
  <span class="project-tag">ROS1</span>
  <span class="project-tag">Python</span>
  <span class="project-tag">C++</span>
  <span class="project-tag">Kinova Gen3</span>
  <span class="project-tag">Mecanum Base</span>
  <span class="project-tag">LiDAR</span>
  <span class="project-tag">ATI F/T</span>
  <span class="project-tag">EtherCAT</span>
  <span class="project-tag">Teensy</span>
  <span class="project-tag">Jetson</span>
  <span class="project-tag">Linux</span>
</div>

<h2 class="arna-section-heading">Patent</h2>
<div class="arna-patent">
  The ARNA platform is protected under <a href="https://patents.google.com/patent/US12090629B2/en" target="_blank" rel="noopener">US Patent US12090629B2</a>, covering its physical human-robot interaction architecture.
</div>
```

- [ ] **Step 2: Verify the page content statically**

Run:

```bash
cd /home/peycool/CV/paymansharafian.github.io
grep -c "arna-section-heading" _projects/1_arna.md
grep -o "projects/[0-9]_[a-z_]*/" _projects/1_arna.md | sort -u
grep -c "US12090629B2" _projects/1_arna.md
```

Expected: `arna-section-heading` count is `6` (Platform Overview, My Contributions, Operational Scenarios, System Architecture, Tech Stack, Patent); the URL list is exactly
`projects/2_mpc_cbf/`, `projects/3_remote_ui/`, `projects/4_pick_place/`, `projects/5_nac/`, `projects/6_intent/`, `projects/7_tactile/`; the patent count is `2` (badge + patent block).

- [ ] **Step 3: Commit**

```bash
cd /home/peycool/CV/paymansharafian.github.io
git add _projects/1_arna.md
git commit -m "feat(arna): rebuild ARNA project page with 7-section case study"
```

---

### Task 5: Integration verification (build, links, format)

**Files:**

- Modify: none (verification + formatting only; may touch any file via Prettier)

**Interfaces:**

- Consumes: all prior tasks.

- [ ] **Step 1: Format with Prettier**

```bash
cd /home/peycool/CV/paymansharafian.github.io
npm install --save-dev prettier @shopify/prettier-plugin-liquid   # first time only
npx prettier . --write
```

Expected: Prettier reports files reformatted/unchanged with no parse errors.

- [ ] **Step 2: Build the site with Docker**

```bash
cd /home/peycool/CV/paymansharafian.github.io
docker compose up --build -d
```

Wait ~60–90s for the build. Expected: container starts, no Liquid/SCSS build errors in `docker compose logs`.

- [ ] **Step 3: Verify the projects list and all 8 project pages return HTTP 200 in the right order**

Run:

```bash
for u in 1_arna 2_mpc_cbf 3_remote_ui 4_pick_place 5_nac 6_intent 7_tactile 8_pnnui; do
  printf "%s -> " "$u"; curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:8080/projects/$u/"
done
echo "--- projects list card order ---"
curl -s http://localhost:8080/projects/ | grep -o 'project-row-title[^<]*<a[^>]*>[^<]*' | sed 's/.*>//'
```

Expected: every project URL prints `200`. The card-order list shows the 8 titles in importance order, starting with "ARNA — Adaptive Nursing Assistant Robot" then "Network-Aware MPC-CBF for Safe Remote Teleoperation of ARNA".

- [ ] **Step 4: Verify the ARNA page renders its sections, images, and resolved links**

Run:

```bash
cd /home/peycool/CV/paymansharafian.github.io
curl -s http://localhost:8080/projects/1_arna/ > /tmp/arna.html
echo "sections:"; grep -c "arna-section-heading" /tmp/arna.html
echo "hero img:"; grep -c "arna_hero_clinical.jpg" /tmp/arna.html
echo "scheme img:"; grep -c "arna_hardware_scheme.jpg" /tmp/arna.html
echo "arch img:"; grep -c "arna_software_architecture.png" /tmp/arna.html
echo "elec img:"; grep -c "arna_electrical_diagram.jpg" /tmp/arna.html
echo "resolved project links:"; grep -o '/projects/[0-9]_[a-z_]*/' /tmp/arna.html | sort -u
echo "patent link:"; grep -c "patents.google.com/patent/US12090629B2" /tmp/arna.html
echo "image assets reachable:"
for f in arna_hero_clinical.jpg arna_hardware_scheme.jpg arna_software_architecture.png arna_electrical_diagram.jpg; do
  printf "%s -> " "$f"; curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:8080/assets/img/arna/$f"
done
```

Expected: sections = `6`; each image grep ≥ `1`; resolved project links include `2_mpc_cbf`, `3_remote_ui`, `4_pick_place`, `5_nac`, `6_intent`, `7_tactile`; patent link ≥ `1`; all four image assets return `200`.

- [ ] **Step 5: Manual visual check (you, in a browser)**

Open `http://localhost:8080/projects/1_arna/` and confirm:

- Badge bar, hero photo, and lead sentence render at top.
- Hardware scheme floats right beside the overview text (desktop width).
- Contribution grid shows 2×2 cards; Operational Scenarios shows two side-by-side panels with working links.
- Both architecture figures display with captions; tech pills and the patent block render.
- Toggle dark/light mode — colors stay legible.
- Narrow the window to ≤640px — the contribution grid and scenario panels stack to one column; the overview figure goes full width.
- Open `http://localhost:8080/projects/` — the ARNA card shows the hero thumbnail.

- [ ] **Step 6: Stop the container and commit any formatting changes**

```bash
cd /home/peycool/CV/paymansharafian.github.io
docker compose down
git add -A
git commit -m "chore(arna): prettier formatting after ARNA page build" || echo "nothing to format-commit"
```

---

## Self-Review

**Spec coverage:**

- Part 1 ARNA page (7 sections, layout `page`, image plan, front matter) → Task 4 (+ Task 1 images, Task 3 CSS). ✓
- Part 2 split `2_teleoperation.md` → `3_remote_ui.md` + `4_pick_place.md` → Task 2 Steps 3–4. ✓
- Part 3 rename + renumber + MPC-CBF retitle + link-integrity grep → Task 2 Steps 1–2, 5. ✓
- Patent wording / no patient media / "I" voice → Global Constraints + Task 4 copy. ✓
- CSS `.arna-*` classes, reuse `.project-tag`, theme variables → Task 3. ✓
- Verification (build, 8 cards, links, dark mode, mobile, prettier) → Task 5. ✓

**Placeholder scan:** No TBD/TODO; every step has exact code or commands. ✓

**Type/name consistency:** The 17 `.arna-*` classes defined in Task 3 are exactly those used in Task 4's HTML. The six project URLs produced by Task 2 match the six links consumed in Task 4. Image filenames in Task 1 match the `src`/`img` references in Task 4. ✓

## Execution Handoff

Choose an execution approach (see end of this conversation).
