# ARNA Project Page — Design Spec

**Date:** 2026-06-23
**Status:** Approved
**Audience:** Job recruiters and technical hiring managers (robotics roles)

## Goal

Rebuild `_projects/1_arna.md` from a two-paragraph stub into a rich, recruiter-facing
case-study page for ARNA (Adaptive Nursing Assistant Robot) — the custom robot the user
has been primary engineer on since 2023. The page must establish, within the first
5 seconds, that the user owns the **full stack**: hardware, software, control, and
clinical deployment. As part of the same change, split the existing
"ARNA Remote Teleoperation & Semi-Autonomous Grasping" project into two focused
projects and renumber the projects collection so the two scenario clusters stay grouped.

## Intent / Framing

This is the robot the user worked with, not a generic side project. Recruiters spend
30–60 seconds on a project page, so the page is **impact-first**: badges and a clinical
hero photo up top, depth (architecture, contributions) below. Contribution language uses
**"I"** to isolate the user's work from the lab's.

## Audience Constraints (legal/ethics)

- **Cleared for use:** lab/demo footage, hardware photos, architecture diagrams, and the
  hero photo (`IMG_20240924_111056.jpg`) — already published in a paper, shows the user's
  face while explaining the robot.
- **Excluded:** any patient-controlled video or identifiable-patient media. HIPAA + IRB
  consent make these unpublishable without explicit compliance review. No patient video is
  used anywhere on the page.
- **Patent wording:** the user is NOT a named inventor. Copy must say the _platform is
  protected under_ US Patent US12090629B2 — never imply the user is an inventor.

---

## Part 1 — ARNA Page (`_projects/1_arna.md`)

**Layout:** keep `layout: page`. The theme's `page.liquid` auto-renders the title (`h1`)
and `description` (subtitle) at the top, then `{{ content }}`. The body provides the
sections below; it does NOT repeat the title.

**Front matter:**

```yaml
---
layout: page
title: "ARNA — Adaptive Nursing Assistant Robot"
description: "NSF-funded omnidirectional mobile manipulator for clinical nursing assistance — Kinova Gen3 arm on a Mecanum base with LiDAR and ATI Axia 80 F/T sensing. Primary engineer across hardware, software, control, and clinical deployment since 2023."
img: assets/img/arna/arna_hero_clinical.jpg
importance: 1
category: work
tech: [ROS1, Python, C++, Kinova Gen3, Mecanum Base, LiDAR, ATI F/T, EtherCAT, Jetson, Linux]
---
```

### Section 1 — Hero

- Badge bar (single row, wraps on mobile):
  `NSF-Funded` · `Patent US12090629B2` · `58+ Nursing Students` · `15+ Patients` · `2023–Present`
- Hero image: `assets/img/arna/arna_hero_clinical.jpg` (full width).
- One-line statement:
  > I led full-stack development of ARNA — from PCB repair to clinical deployment — as the primary engineer since 2023.

### Section 2 — Platform Overview

- Annotated hardware scheme (`arna_hardware_scheme.jpg`) floated right (~40%).
- Two short paragraphs: what ARNA is + the clinical problem it solves. Refined from the
  existing stub:
  > ARNA (Adaptive Nursing Assistant Robot) is an NSF-funded omnidirectional mobile
  > manipulator developed at LARRI for clinical nursing assistance. The platform pairs a
  > Kinova Gen3 arm with a Mecanum-wheel base, LiDAR, ultrasonic/bump/IMU sensing, ATI
  > Axia 80 force/torque sensors, and a sensorized handlebar, all running on a distributed
  > ROS1 stack across an onboard PC and Jetson.
  >
  > ARNA targets two of the most physically demanding parts of nursing work — patient
  > ambulation and fetch-and-carry tasks — by acting as both a smart walker and a
  > teleoperable assistant, reducing strain on healthcare staff.

### Section 3 — My Contributions (2×2 card grid)

Each card: heading + 3–4 "I" bullets.

- **Hardware & Electronics**
  - Repaired and upgraded the motor-controller PCBs
  - Made the sonar and bump sensors functional and integrated them into ROS
  - Improved onboard wiring and sensor integration
  - Integrated and repurposed the LiDAR for navigation
- **Software & Perception**
  - Built numerous ROS nodes across the control and sensing stack
  - Developed perception pipelines for object detection and grasping
  - Maintained the distributed onboard-PC / Jetson software system
- **Control Systems**
  - Implemented and tuned the navigation stack
  - Developed arm control and safety systems
  - Debugged and fixed the pHRI controllers (NAC, HIE-NAC)
- **Clinical Deployment**
  - Designed and ran nurse trials (58+ nursing students)
  - Designed and ran hospital patient trials (15+ patients)
  - Led study design and data collection

### Section 4 — Operational Scenarios

Intro paragraph (exact copy; **remotely** links to `2_mpc_cbf`):

> ARNA supports two primary operational scenarios, each with dedicated control strategies
> and interfaces: the **Walker scenario** for physical human-robot interaction (pHRI),
> where a patient guides the robot as a mobility aid; and the **Sitter/Teleoperation
> scenario** for HRI tasks, where a patient or Nurse controls the robot
> [**remotely**](/projects/2_mpc_cbf/).

Two side-by-side panels:

**Walker Scenario (pHRI)**

> Patient physically guides ARNA using the sensorized handlebar. Control algorithms
> interpret intent through force/torque sensing and adapt robot behavior in real time.

Linked project cards:

- Neuroadaptive Admittance Controller → `/projects/5_nac/`
- Neural Human Intent Estimator for ARNA → `/projects/6_intent/`
- Tactile Handlebar & Deep Learning for Safe HRI → `/projects/7_tactile/`

**Sitter / Teleoperation Scenario (HRI)**

> Nurses or patients can control ARNA remotely from any location safely. The system
> provides semi-autonomous grasping assistance and network-aware safety guarantees. This
> feature reduces the physical strain on healthcare professionals.

Linked project cards (no video):

- Network-Aware MPC-CBF for Safe Remote Teleoperation of ARNA → `/projects/2_mpc_cbf/`
- ARNA Remote User Interface Design → `/projects/3_remote_ui/`
- ARNA Semi-Autonomous Pick Place → `/projects/4_pick_place/`

### Section 5 — System Architecture

- Software/networking diagram (`arna_software_architecture.png`) full width + caption.
- Electrical/power diagram (`arna_electrical_diagram.jpg`) as a secondary figure + caption.

### Section 6 — Tech Stack

Pill row reusing the existing tag style:
`ROS1` `Python` `C++` `Kinova Gen3` `Mecanum Base` `LiDAR` `ATI F/T` `EtherCAT` `Teensy` `Jetson` `Linux`

### Section 7 — Patent

Styled link block:

> The ARNA platform is protected under **US Patent US12090629B2**, covering its physical
> human-robot interaction architecture.

Link: https://patents.google.com/patent/US12090629B2/en (new tab, `rel="noopener"`).

---

## Image Plan

New folder `assets/img/arna/`. Copy (not move) each source into the repo:

| Destination (`assets/img/arna/`) | Source path                                                                                                                                                                                                                   | Used in                          |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `arna_hero_clinical.jpg`         | `/mnt/c/Users/peyma/OneDrive - University of Louisville/PHD/LARRI/Hospital Trial/IMG_20240924_111056.jpg`                                                                                                                     | Hero + card thumbnail            |
| `arna_hardware_scheme.jpg`       | `/mnt/c/Users/peyma/OneDrive - University of Louisville/PHD/LARRI/Handlebar_data/2025 version/TMRB submission/T_MRB_Tactile_Handlebar_and_Deep_Learning_for_Safe_Interaction_with_a_Robot_Nursing_Assistant/ARNA_Scheme2.jpg` | Platform Overview                |
| `arna_software_architecture.png` | `/home/peycool/.claude/image-cache/9497c4b2-c41d-4b9b-b965-ead8a4408e7e/9.png`                                                                                                                                                | Architecture                     |
| `arna_electrical_diagram.jpg`    | `/mnt/c/Users/peyma/OneDrive - University of Louisville/PHD/LARRI/ARNA Long Distance Tele/Presentation/ARNA Scheme - Frame 1.jpg`                                                                                             | Architecture (secondary)         |
| `arna_internals.png`             | `/home/peycool/.claude/image-cache/9497c4b2-c41d-4b9b-b965-ead8a4408e7e/7.png`                                                                                                                                                | Hardware contribution (optional) |

Images render through the theme's `figure.liquid` include (responsive + lazy) where they
sit in normal flow; the hero may use a direct `<img>` for full-bleed control. The
projects-list card `img` points at `arna_hero_clinical.jpg` (replaces the missing
`publication_preview/arna_preview.jpg`).

---

## Part 2 — Split & Rename Project Files

Split `2_teleoperation.md` into two files; divide the existing content faithfully.

**`3_remote_ui.md` — ARNA Remote User Interface Design**

```yaml
---
layout: page
title: "ARNA Remote User Interface Design"
description: "Browser-based remote control interface for ARNA. A Next.js frontend streams low-latency video and multi-channel robot state over Cloudflare-tunneled WebSocket/rosbridge connections, letting operators drive the robot from any location."
img:
importance: 3
category: work
tech: [ROS1, Next.js, WebSockets, rosbridge, Cloudflare, RTSP, Python, JavaScript]
---
```

Body (from the UI half of the original):

> Architected a distributed teleoperation frontend combining ROS1 with a Next.js web
> application, enabling operators to control ARNA from a browser over Cloudflare-tunneled
> WebSocket connections with multi-channel rosbridge streaming and low-latency video.

**`4_pick_place.md` — ARNA Semi-Autonomous Pick Place**

```yaml
---
layout: page
title: "ARNA Semi-Autonomous Pick Place"
description: "Point-and-click semi-autonomous grasping for ARNA. FastSAM provides real-time object segmentation and Contact-GraspNet estimates grasp poses, letting an operator trigger reliable pick-and-place from a single click in the remote UI."
img:
importance: 4
category: work
tech: [ROS1, Python, C++, FastSAM, Contact-GraspNet, MoveIt, Perception]
---
```

Body (from the grasping half of the original):

> Implemented semi-autonomous grasping using FastSAM for real-time object segmentation and
> Contact-GraspNet for grasp pose estimation, allowing point-and-click pick-and-place
> execution from the browser UI.

Delete `2_teleoperation.md` after both replacements exist.

---

## Part 3 — Rename & Renumber Collection

Rename the MPC-CBF title and renumber files via `git mv` so filename numbers match
`importance`. Final state:

| File                                | Title                                                       | importance |
| ----------------------------------- | ----------------------------------------------------------- | ---------- |
| `1_arna.md`                         | ARNA — Adaptive Nursing Assistant Robot                     | 1          |
| `2_mpc_cbf.md` (was `3_mpc_cbf.md`) | Network-Aware MPC-CBF for Safe Remote Teleoperation of ARNA | 2          |
| `3_remote_ui.md` (new)              | ARNA Remote User Interface Design                           | 3          |
| `4_pick_place.md` (new)             | ARNA Semi-Autonomous Pick Place                             | 4          |
| `5_nac.md` (was `4_nac.md`)         | Neuroadaptive Admittance Controller                         | 5          |
| `6_intent.md` (was `5_intent.md`)   | Neural Human Intent Estimator for ARNA                      | 6          |
| `7_tactile.md` (was `6_tactile.md`) | Tactile Handlebar & Deep Learning for Safe HRI              | 7          |
| `8_pnnui.md` (was `7_pnnui.md`)     | PNNUI — Parallel Neural Network User Interface              | 8          |

For `2_mpc_cbf.md`: change only the title (`...Safe Teleoperation` →
`...Safe Remote Teleoperation of ARNA`) and `importance` (3 → 2). Update each renumbered
file's `importance` to match its new number.

**Link-integrity check:** before finalizing, grep the repo for references to the old
project URLs/filenames (`grep -rn "projects/3_mpc_cbf\|projects/4_nac\|projects/5_intent\|projects/6_tactile\|projects/7_pnnui\|2_teleoperation"` across `_pages`, `_projects`,
`_includes`, `_layouts`, `_data`). Fix any hits. The projects-list page sorts by
`importance` and builds URLs from `project.url`, so it needs no manual edits.

---

## CSS (append to `_sass/_components.scss`)

New `.arna-*` classes, following the existing `.project-row` / `.skill-pill` patterns and
`--global-*` variables:

- `.arna-badges` / `.arna-badge` — inline-flex wrapping badge bar.
- `.arna-hero-img` — full-width rounded hero with subtle border/shadow.
- `.arna-lead` — larger lead sentence.
- `.arna-overview` — clearfix wrapper; `.arna-overview-fig` floats right ~40% on ≥768px,
  full width below.
- `.arna-contrib-grid` — CSS grid, 2 columns ≥768px, 1 column below.
- `.arna-contrib-card` — card using `--global-card-bg-color` + `--global-divider-color`.
- `.arna-scenarios` — 2-column flex, stacks below 768px.
- `.arna-scenario-panel` — bordered panel.
- `.arna-scenario-links` — vertical list of internal project links.
- `.arna-figure` / `.arna-caption` — figure + centered caption.
- `.arna-patent` — accent-bordered link block.

Reuse `.project-tag` (already defined) for the tech-stack pills.

---

## Out of Scope

- No new layout file — the existing `page` layout is reused.
- No patient video, no patient-identifiable media.
- No content authoring for the other project pages beyond the split (their bodies stay as
  the existing stubs); only titles/importance/filenames change where listed.
- No changes to the projects-list page (`_pages/projects.md`) — it is data-driven.

## Verification

1. `docker compose up --build`, visit `http://localhost:8080/projects/` — 8 cards, correct
   order, ARNA card shows the hero thumbnail.
2. Visit `/projects/1_arna/` — all 7 sections render; hero, scheme, architecture, and
   electrical images load; badges and contribution grid display; tech pills present;
   patent link opens in a new tab.
3. Click every Section 4 link and the inline **remotely** link — all resolve to live
   project pages (no 404).
4. Check dark mode and mobile width (≤640px): scenarios and contribution grid stack;
   overview figure goes full width.
5. `npx prettier . --write` before commit.
