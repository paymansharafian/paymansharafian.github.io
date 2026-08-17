# About Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Bootstrap float-based About page layout with a custom flexbox sidebar layout — photo + contact icons on the left, bio + Education + Skills on the right.

**Architecture:** Three files change in isolation. `_pages/about.md` provides data (education/skills arrays) via front matter. `_sass/_components.scss` gets new CSS classes appended at the end. `_layouts/about.liquid` is fully replaced with the new flexbox structure. No new files. No data files.

**Tech Stack:** Jekyll Liquid templates, SCSS with CSS custom properties (`var(--global-theme-color)` etc.), Font Awesome 6 + Academicons (already loaded by the al-folio theme), Docker dev server.

---

## File Map

| File                     | Action                 | Responsibility                                                                                                                                                                                      |
| ------------------------ | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_pages/about.md`        | Modify front matter    | Provides `education[]` and `skills[]` to the layout; removes `more_info` and `social: true`                                                                                                         |
| `_sass/_components.scss` | Append CSS at line 372 | Defines `.about-wrapper`, `.about-sidebar`, `.about-profile-img`, `.about-contact-row`, `.about-main`, `.about-section-heading`, `.about-edu-*`, `.about-skills-wrap`, `.skill-pill`, `.accent-dot` |
| `_layouts/about.liquid`  | Full rewrite           | Renders sidebar + main column; reads `page.education` and `page.skills` from front matter; builds contact rows from `site.data.socials.*`                                                           |

---

## Task 1: Update `_pages/about.md` front matter

**Files:**

- Modify: `_pages/about.md`

Current file is 33 lines. The changes are:

- Remove `profile.more_info` block
- Change `profile.align` to `left` (already set to `right`)
- Add `education` array
- Add `skills` array
- Change `social: true` → `social: false`

- [ ] **Step 1: Replace the entire `_pages/about.md` with updated content**

Write this exact content to `_pages/about.md` (overwrites the file):

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

announcements:
  enabled: false
  scrollable: true
  limit: 5

latest_posts:
  enabled: false
  scrollable: true
  limit: 3
---
I am a robotics research engineer and Ph.D. candidate at the University of Louisville, working with the Louisville Automation and Robotics Research Institute (LARRI). My work bridges physical human-robot interaction, sensor fusion, adaptive control, and full-stack robot teleoperation. My background combines robotics software, hardware integration, and technical mentorship. I have supported clinical deployment work, written lab manuals and SOPs, and mentored students in hands-on robotics research.
```

- [ ] **Step 2: Commit**

```bash
git add _pages/about.md
git commit -m "feat: add education and skills front matter to about page"
```

---

## Task 2: Append About page CSS to `_sass/_components.scss`

**Files:**

- Modify: `_sass/_components.scss` (append after line 372, after the existing `@media (max-width: 640px)` block for `.project-row`)

- [ ] **Step 1: Append CSS block at end of `_sass/_components.scss`**

Add the following after the last `}` in the file:

```scss
// ── About page sidebar layout ──

.accent-dot {
  color: var(--global-theme-color);
}

.about-wrapper {
  display: flex;
  gap: 2.5rem;
  align-items: flex-start;
}

.about-sidebar {
  width: 170px;
  flex-shrink: 0;
}

.about-profile-img {
  width: 100%;
  border-radius: 10px;
  border: 2.5px solid var(--global-theme-color);
  box-shadow: 0 0 24px rgba(88, 166, 255, 0.18);
  display: block;
}

.about-contact {
  margin-top: 1rem;
}

.about-contact-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--global-text-color-light);
  margin-bottom: 0.45rem;

  i {
    width: 14px;
    color: var(--global-theme-color);
    font-size: 0.8rem;
    text-align: center;
    flex-shrink: 0;
  }

  a {
    color: var(--global-text-color-light);
    text-decoration: none;
    word-break: break-all;

    &:hover {
      color: var(--global-theme-color);
    }
  }
}

.about-main {
  flex: 1;
  min-width: 0;
}

.about-section-heading {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--global-theme-color);
  margin: 1.5rem 0 0.75rem;
}

.about-edu-list {
  list-style: none;
  padding: 0;
  margin: 0 0 0.5rem;
}

.about-edu-item {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.about-edu-dot {
  width: 9px;
  height: 9px;
  background: var(--global-theme-color);
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 5px;
}

.about-edu-degree {
  font-weight: 700;
}

.about-edu-meta {
  color: var(--global-text-color-light);
  font-size: 0.875rem;
}

.about-skills-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.skill-pill {
  background: var(--global-card-bg-color);
  border: 1px solid var(--global-divider-color);
  color: var(--global-text-color);
  font-size: 0.82rem;
  padding: 4px 14px;
  border-radius: 20px;
}

@media (max-width: 640px) {
  .about-wrapper {
    flex-direction: column;
  }

  .about-sidebar {
    width: 100%;
  }

  .about-profile-img {
    max-width: 140px;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add _sass/_components.scss
git commit -m "feat: add about page sidebar CSS classes"
```

---

## Task 3: Rewrite `_layouts/about.liquid`

**Files:**

- Modify: `_layouts/about.liquid` (full rewrite)

Contact link data is read from `site.data.socials.*` (Jekyll reads `_data/socials.yml` as `site.data.socials`):

- `site.data.socials.email` → `p0shar12@louisville.edu`
- `site.data.socials.scholar_userid` → `FZB0nFkAAAAJ`
- `site.data.socials.github_username` → `paymansharafian`
- `site.data.socials.linkedin_username` → `paymansharafian`

Icon classes (already loaded by al-folio theme):

- Email: `fa-solid fa-envelope`
- Scholar: `ai ai-google-scholar`
- GitHub: `fa-brands fa-github`
- LinkedIn: `fa-brands fa-linkedin`

- [ ] **Step 1: Replace entire `_layouts/about.liquid` with new content**

Write this exact content to `_layouts/about.liquid`:

```liquid
---
layout: default
---
<div class="post">
  <div class="about-wrapper">
    {% if page.profile and page.profile.image %}
      <div class="about-sidebar">
        {% assign profile_image_path = page.profile.image | prepend: 'assets/img/' %}
        <img
          src="{{ profile_image_path | relative_url }}"
          alt="{{ page.profile.image }}"
          class="about-profile-img"
          loading="eager"
        >
        <div class="about-contact">
          {% if site.data.socials.email %}
            <div class="about-contact-row">
              <i class="fa-solid fa-envelope" aria-hidden="true"></i>
              <a href="mailto:{{ site.data.socials.email }}">{{ site.data.socials.email }}</a>
            </div>
          {% endif %}
          {% if site.data.socials.scholar_userid %}
            <div class="about-contact-row">
              <i class="ai ai-google-scholar" aria-hidden="true"></i>
              <a
                href="https://scholar.google.com/citations?user={{ site.data.socials.scholar_userid }}"
                target="_blank"
                rel="noopener noreferrer"
                >Google Scholar</a
              >
            </div>
          {% endif %}
          {% if site.data.socials.github_username %}
            <div class="about-contact-row">
              <i class="fa-brands fa-github" aria-hidden="true"></i>
              <a
                href="https://github.com/{{ site.data.socials.github_username }}"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{- site.data.socials.github_username -}}
              </a>
            </div>
          {% endif %}
          {% if site.data.socials.linkedin_username %}
            <div class="about-contact-row">
              <i class="fa-brands fa-linkedin" aria-hidden="true"></i>
              <a
                href="https://linkedin.com/in/{{ site.data.socials.linkedin_username }}"
                target="_blank"
                rel="noopener noreferrer"
                >LinkedIn</a
              >
            </div>
          {% endif %}
        </div>
      </div>
    {% endif %}

    <div class="about-main">
      <header class="post-header">
        <h1 class="post-title">
          {{ page.title -}}
          <span class="accent-dot">.</span>
        </h1>
        <p class="desc">{{ page.subtitle }}</p>
      </header>

      <article>
        {{ content }}

        {% if page.education %}
          <h2 class="about-section-heading">Education</h2>
          <ul class="about-edu-list">
            {% for entry in page.education %}
              <li class="about-edu-item">
                <div class="about-edu-dot"></div>
                <div>
                  <span class="about-edu-degree">{{ entry.degree }}</span>
                  <span class="about-edu-meta"> — {{ entry.dates }} &middot; {{ entry.school }}</span>
                </div>
              </li>
            {% endfor %}
          </ul>
        {% endif %}

        {% if page.skills %}
          <h2 class="about-section-heading">Skills</h2>
          <div class="about-skills-wrap">
            {% for skill in page.skills %}
              <span class="skill-pill">{{ skill }}</span>
            {% endfor %}
          </div>
        {% endif %}

        {% if page.announcements and page.announcements.enabled %}
          <h2>
            <a href="{{ '/news/' | relative_url }}" style="color: inherit">news</a>
          </h2>
          {% include news.liquid limit=true %}
        {% endif %}

        {% if page.latest_posts and page.latest_posts.enabled %}
          <h2>
            <a href="{{ '/blog/' | relative_url }}" style="color: inherit">latest posts</a>
          </h2>
          {% include latest_posts.liquid %}
        {% endif %}

        {% if page.selected_papers %}
          <h2>
            <a href="{{ '/publications/' | relative_url }}" style="color: inherit">selected publications</a>
          </h2>
          {% include selected_papers.liquid %}
        {% endif %}

        {% if site.newsletter and site.newsletter.enabled and site.footer_fixed %}
          {% include newsletter.liquid center=true %}
        {% endif %}
      </article>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add _layouts/about.liquid
git commit -m "feat: replace about layout with flexbox sidebar design"
```

---

## Task 4: Format, Build, and Verify

**Files:** None changed — this is a verify + format pass.

- [ ] **Step 1: Format with Prettier**

Run from `paymansharafian.github.io/`:

```bash
npx prettier . --write
```

Expected: files reformatted, no errors. If Prettier hasn't been installed yet, first run:

```bash
npm install --save-dev prettier @shopify/prettier-plugin-liquid
```

- [ ] **Step 2: Start Docker dev server**

```bash
docker compose up
```

Wait for the line: `Server address: http://0.0.0.0:4000/` (may take 30-60 seconds).
Site is accessible at `http://localhost:8080`.

- [ ] **Step 3: Verify the About page**

Open `http://localhost:8080/about/` and check:

| Item                      | Expected                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| Layout                    | Photo on the left, text on the right — not stacked                                         |
| Photo                     | Blue border + subtle glow, rounded corners, ~170px wide                                    |
| Contact rows              | Email, Scholar, GitHub, LinkedIn each on its own row with the matching FA/Academicons icon |
| Heading                   | "About." with blue accent dot                                                              |
| Subtitle                  | "Robotics Research Engineer \| Ph.D. Candidate \| Full-Stack Roboticist"                   |
| Bio                       | Bio paragraph appears below subtitle                                                       |
| Education heading         | "Education" in blue accent color                                                           |
| Education list            | 3 entries, each with a filled blue dot, bold degree name, light date/school                |
| Skills heading            | "Skills" in blue accent color                                                              |
| Skills                    | 15 pills in dark card background with border, no color variation                           |
| Mobile (resize to <640px) | Layout stacks vertically, photo shrinks to max 140px                                       |

- [ ] **Step 4: Stop dev server and commit any Prettier-only changes**

```bash
docker compose down
git add -A
git commit -m "style: format about page files with prettier"
```

If Prettier made no additional changes after Task 1-3 commits, skip this step.
