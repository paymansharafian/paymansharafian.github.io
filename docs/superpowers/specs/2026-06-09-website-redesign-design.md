# Website Redesign: Sleek Modern Dark + Projects Page

**Date:** 2026-06-09  
**Author:** Payman Sharafianardakani  
**Status:** Approved

---

## Goals

1. Replace the default al-folio light theme with a forced dark "Sleek Modern Dark" aesthetic suited to a robotics researcher
2. Add a dedicated Home page with an interactive robot arm hero element
3. Build out the Projects page with 7 real project cards (replacing placeholder content)
4. Trim navigation to 5 meaningful pages
5. Change accent color from purple to electric blue throughout

---

## Global Theme

### Forced Dark Mode

- Remove the light/dark toggle button from the navbar entirely
- Lock `html[data-theme="dark"]` permanently in the base layout (`_layouts/default.html`) via a script that sets the attribute on `<html>` before first paint (prevents flash)
- Delete or disable the theme-toggle include

### Color Variables (`_sass/_themes.scss`)

Override the dark theme CSS variables:

| Variable                    | Old value          | New value                 |
| --------------------------- | ------------------ | ------------------------- |
| `--global-bg-color`         | `#1c1c1d`          | `#0d1117`                 |
| `--global-card-bg-color`    | (light)            | `#0d1f2d`                 |
| `--global-theme-color`      | `#b509ac` (purple) | `#58a6ff` (electric blue) |
| `--global-hover-color`      | `#b509ac`          | `#58a6ff`                 |
| `--global-text-color`       | white              | `#e6edf3`                 |
| `--global-text-color-light` | grey               | `#7d8590`                 |
| `--global-divider-color`    | `rgba(0,0,0,0.1)`  | `#1a3a5a`                 |

### Accent Color (`_sass/_variables.scss`)

Change `$purple-color` usage to blue where it flows through to light-mode fallbacks. Primary change is the CSS variables above; variables.scss edit ensures no purple bleeds through anywhere.

---

## Navigation

### Pages to keep

| Label        | File                     | Permalink        |
| ------------ | ------------------------ | ---------------- |
| Home         | `_pages/home.md`         | `/`              |
| About        | `_pages/about.md`        | `/about/`        |
| Projects     | `_pages/projects.md`     | `/projects/`     |
| Publications | `_pages/publications.md` | `/publications/` |
| CV           | `_pages/cv.md`           | `/cv/`           |

### Pages to remove

Delete these files (all contain placeholder content only):

- `_pages/blog.md`
- `_pages/books.md`
- `_pages/dropdown.md`
- `_pages/news.md`
- `_pages/profiles.md`
- `_pages/repositories.md`
- `_pages/teaching.md`
- `_pages/about_einstein.md`

Update `_config.yml` navbar order to reflect the 5 remaining pages.

---

## Home Page

### File

New file: `_pages/home.md` with `permalink: /` and a new custom layout `home-hero`.

### Layout (`_layouts/home-hero.html`)

A minimal full-viewport hero layout. No sidebar, no profile photo here.

### Hero Structure

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   Hi, I'm                                       │
│   Payman Sharafian          [robot arm canvas]  │
│                                                 │
│   [What I'm doing →]   [Get in touch]           │
│                                                 │
└─────────────────────────────────────────────────┘
```

- **Heading:** "Hi, I'm" in muted text (`#7d8590`), `font-size: 1.4rem`; "Payman Sharafian" on the next line in bold white, `font-size: 3rem`
- **Subtitle:** "Robotics Research Engineer · Ph.D. Candidate" in muted text below the name
- **CTA buttons:** Two outlined buttons side by side
  - "What I'm doing →" → links to `/projects/`
  - "Get in touch" → links to `mailto:p0shar12@louisville.edu`
  - Style: transparent background, `1px solid #58a6ff`, blue text, `border-radius: 6px`, hover fills with `#58a6ff22`
- **Robot arm canvas:** `<canvas id="robot-arm">` positioned in the right half of the hero, `width: 400px, height: 400px`. Falls back to slow idle sweep animation when no cursor is present on desktop, hidden on mobile (below `768px`).

### Robot Arm (IK Canvas) — `assets/js/robot-arm.js`

- **Joints:** 3-segment planar arm (shoulder fixed, elbow and wrist free)
- **Segment lengths:** ~120px, ~90px, ~70px (approximate, tunable)
- **IK solver:** FABRIK (Forward And Backward Reaching IK) — simple, stable, no matrix math
- **Target:** Mouse position relative to canvas. Arm end-effector smoothly follows cursor
- **Idle animation:** When cursor leaves the window or on mobile, arm sweeps a slow figure-8 path
- **Rendering style:** Thin strokes (`2px`), electric blue (`#58a6ff`), circular joints with slight glow (`box-shadow` equivalent via canvas `shadowBlur`), dark background transparent (canvas overlays the page)
- **Performance:** `requestAnimationFrame` loop, no external dependencies

---

## About Page

### Changes

- Change `permalink: /` → `permalink: /about/` in `_pages/about.md` front matter
- Content unchanged (bio, profile photo, research interests, social links stay as-is)
- `selected_papers: false` stays (publications page handles this)

---

## Projects Page

### Layout

Vertical list of full-width horizontal rows — one row per project. No grid. Each row is a self-contained entry with a fixed-width thumbnail on the left and content on the right.

### Row Design

Each project renders as a horizontal row:

```
┌────────────────┬───────────────────────────────────────────┐
│                │  Project Title                            │
│  [thumbnail]   │  Short description (2–3 sentences)        │
│  280 × 180px   │  [tag] [tag] [tag]                        │
│                │  [Paper]  [Video]  [GitHub]               │
└────────────────┴───────────────────────────────────────────┘
```

- **Thumbnail:** fixed 280px wide × 180px tall, `object-fit: cover`, `border-radius: 6px`. Gradient placeholder (`linear-gradient(135deg, #0a2540, #0d3060)`) until real images are supplied.
- **Title:** bold white, `1.1rem`, links to the individual project page (`/projects/project-slug/`)
- **Description:** muted text (`#7d8590`), 2–3 sentences, stays below title
- **Tech tags:** blue pill badges (rendered from `tech:` front matter array)
- **Action links:** inline text links styled as `[Paper]`, `[Video]`, `[GitHub]` — only rendered if the corresponding front matter field is present (`paper_url`, `video_url`, `github_url`). Color: `#58a6ff`.
- **Hover effect:** left border of the row highlights to `#58a6ff` (4px accent bar), title color brightens
- **Divider:** subtle `1px solid #1a3a5a` line between rows

### Individual Project Pages

Each project `.md` in `_projects/` automatically generates a full page at `/projects/slug/`. Content per page (added project-by-project as papers and media are provided):

- Full abstract / description
- Image gallery or embedded video
- Paper citation block
- Links (arXiv, IEEE, GitHub, demo)

This is out of scope for the initial implementation — placeholder content used until each project's materials are ready.

### Project Files

Replace all 9 existing placeholder `_projects/*.md` files with 7 real project files. Placeholder content drawn from CV; final content updated project-by-project as papers and media are provided.

| File                           | Title                                         | Category |
| ------------------------------ | --------------------------------------------- | -------- |
| `_projects/1_arna.md`          | ARNA — Adaptive Nursing Assistant Robot       | work     |
| `_projects/2_teleoperation.md` | ARNA Teleoperation & Semi-Autonomous Grasping | work     |
| `_projects/3_mpc_cbf.md`       | Network-Aware MPC-CBF for Safe Teleoperation  | work     |
| `_projects/4_nac.md`           | Neuroadaptive Admittance Controller           | work     |
| `_projects/5_intent.md`        | Neural Human Intent Estimator                 | work     |
| `_projects/6_tactile.md`       | Tactile Handlebar for Safe HRI                | work     |
| `_projects/7_pnnui.md`         | PNNUI — Parallel Neural Network UI            | work     |

### Tech Stack Tags

Each project `.md` file includes a custom `tech:` front matter list (YAML array). The project card Liquid template (`_includes/projects/project-card.html` or equivalent) must be updated to iterate over `page.tech` and render each item as a pill badge. Example tags per project:

- ARNA: `ROS1, Python, C++, Kinova Gen3, LiDAR, ATI F/T`
- Teleoperation: `ROS1, Next.js, WebSockets, FastSAM, Contact-GraspNet, Cloudflare`
- MPC-CBF: `ROS1, Python, C++, CasADi, qpOASES, MPC, CBF`
- NAC: `MATLAB, Simulink, ROS, MLP, Lyapunov, Admittance Control`
- Intent Estimator: `ROS1, Python, C++, PyTorch, PGD`
- Tactile Handlebar: `PyTorch, TCN, ATI F/T, FSR, SolidWorks, 3D Printing`
- PNNUI: `ROS1, Gazebo, Bash, PyGAD, Neural Networks, RTOS`

---

## File Change Summary

### New files

- `_pages/home.md`
- `_layouts/home-hero.html`
- `assets/js/robot-arm.js`
- `_projects/1_arna.md` through `_projects/7_pnnui.md`

### Modified files

- `_pages/about.md` — permalink change only
- `_sass/_themes.scss` — dark theme color variables
- `_sass/_variables.scss` — accent color
- `_layouts/default.html` — force dark mode (inject `document.documentElement.setAttribute('data-theme','dark')` before first paint), remove `{% include theme-toggle.html %}` or equivalent include
- `_config.yml` — navbar order, remove unused pages
- `_includes/projects/project-card.html` (or equivalent) — add `tech:` tag rendering loop

### Deleted files

- `_pages/blog.md`, `books.md`, `dropdown.md`, `news.md`, `profiles.md`, `repositories.md`, `teaching.md`, `about_einstein.md`
- `_projects/1_project.md` through `_projects/9_project.md` (placeholder files)

---

## Out of Scope

- Individual project page content (will be updated project-by-project as papers/media are provided)
- Publications page restyling (uses existing al-folio BibTeX rendering, content already in `papers.bib`)
- CV page (already populated, no changes needed)
- Mobile-specific hero layout beyond basic responsiveness (canvas hidden on mobile)
