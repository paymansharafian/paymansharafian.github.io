# About Page Redesign — Design Spec

## Goal

Redesign the About page to use a two-column sidebar layout: photo + contact links on the left, bio + education + skills on the right. Education and Skills sections follow the bijanmehr.github.io visual style — accent-color headings, filled-dot bullet list, uniform dark pill tags.

## Architecture

Three files change:

| File                     | Change                                                                          |
| ------------------------ | ------------------------------------------------------------------------------- |
| `_layouts/about.liquid`  | Replace Bootstrap float layout with custom flexbox sidebar layout               |
| `_sass/_components.scss` | Append new `.about-*` CSS classes                                               |
| `_pages/about.md`        | Add `education` and `skills` arrays to front matter; keep `profile.align: left` |

No new files. No data files. Education and skills live in `about.md` front matter so the user can edit them without touching layout code.

---

## Section 1 — Layout (`_layouts/about.liquid`)

Replace the current `<div class="profile float-...">` float approach with a flex container:

```
.about-wrapper (flex, row)
├── .about-sidebar (fixed ~170px wide)
│   ├── profile photo (img-fluid, blue border + glow)
│   └── .about-contact (contact rows with FA icons)
└── .about-main (flex: 1)
    ├── page title  "About."  (h1 with accent dot)
    ├── subtitle / role line
    ├── bio paragraph  ({{ content }})
    ├── Education section  (if page.education)
    │   └── <ul> — one <li> per entry  (dot + bold degree + light dates)
    └── Skills section  (if page.skills)
        └── pill tags  (one <span> per skill)
```

The layout reads `page.education` and `page.skills` from front matter. Social links use Font Awesome / Academicons `<i>` tags matching the icons already loaded by the theme (`fa-envelope`, `ai-google-scholar`, `fa-github`, `fa-linkedin`).

The page title is rendered as `About<span class="accent-dot">.</span>` using the existing `.accent-dot` CSS (already defined in `home-hero.liquid` inline style — needs to be moved or duplicated in `_components.scss`).

---

## Section 2 — CSS (`_sass/_components.scss`)

New classes appended at end of file:

```scss
/* ── About page sidebar layout ── */
.about-wrapper          // flex row, gap 2.5rem, align-items flex-start
.about-sidebar          // width 170px, flex-shrink 0
.about-profile-img      // width 100%, border-radius 10px, border 2.5px solid var(--global-theme-color), box-shadow 0 0 24px rgba(88,166,255,0.18)
.about-contact          // margin-top 1rem
.about-contact-row      // display flex, align-items center, gap 8px, font-size 0.82rem, color var(--global-text-color-light), margin-bottom 0.45rem
.about-contact-row i    // width 14px, color var(--global-theme-color), font-size 0.8rem
.about-contact-row a    // color var(--global-text-color-light), text-decoration none, hover: color var(--global-theme-color)
.about-main             // flex 1, min-width 0
.about-section-heading  // font-size 1.15rem, font-weight 700, color var(--global-theme-color), margin 1.5rem 0 0.75rem
.about-edu-list         // list-style none, padding 0, margin 0
.about-edu-item         // display flex, align-items baseline, gap 0.6rem, margin-bottom 0.75rem, font-size same as body (0.95rem)
.about-edu-dot          // width 9px, height 9px, background var(--global-theme-color), border-radius 50%, flex-shrink 0, margin-top 5px
.about-skills-wrap      // display flex, flex-wrap wrap, gap 0.5rem
.skill-pill             // background var(--global-card-bg-color), border 1px solid var(--global-divider-color), color var(--global-text-color), font-size 0.82rem, padding 4px 14px, border-radius 20px

// Mobile breakpoint at 640px: .about-wrapper becomes flex-column; sidebar goes full width; photo max-width 140px
```

---

## Section 3 — Front Matter (`_pages/about.md`)

```yaml
---
layout: about
title: About
permalink: /about/
nav: true
nav_order: 2
subtitle: Robotics Research Engineer | Ph.D. Candidate | Full-Stack Roboticist

profile:
  align: left
  image: My_photo2.jpg
  image_circular: false

education:
  - degree: "Ph.D. Robotics Engineering"
    school: "University of Louisville"
    dates: "2021 – Present"
  - degree: "M.Sc. Mechatronics Engineering"
    school: "University of Tehran"
    dates: "2018 – 2021"
  - degree: "B.Sc. Electrical Power Engineering"
    school: "University of Tehran"
    dates: "2014 – 2018"

skills:
  - Python
  - C / C++
  - ROS / ROS2
  - MATLAB
  - Simulink
  - MoveIt
  - Gazebo
  - PyTorch
  - FastSAM
  - OpenCV
  - Contact GraspNet
  - MPC-CBF
  - FABRIK IK
  - Docker
  - Git

selected_papers: false
social: false
---
Bio paragraph (kept as-is for now; user will update later).
```

`social: false` — social icons are now rendered manually in the sidebar with more control. The existing `{% social_links %}` block at bottom of the layout is removed.

---

## Decisions

- **Bullet dot size**: same as body text baseline (0.95rem line), dot is 9×9px — visually matches text height.
- **Icons**: inline `<i class="...">` tags using Font Awesome + Academicons already loaded by the theme. No new assets needed.
- **`more_info` field**: removed from front matter — contact info is now structured rows in the sidebar.
- **Accent dot**: `.accent-dot { color: var(--global-theme-color); }` added to `_components.scss`. The existing inline definition in `home-hero.liquid` is left as-is (harmless duplication).
- **Description update**: user will edit the bio paragraph in `about.md` directly in the future.
