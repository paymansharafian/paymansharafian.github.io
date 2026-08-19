---
layout: page
title: "Perceived Usefulness of Robotic Technology for Patient Fall Prevention"
description: "Peer-reviewed study (Workplace Health & Safety, 2024) on whether ARNA improves the perceived usefulness of assisted patient ambulation for fall prevention. 38 nursing students rated three conditions, a human gait belt, an ARNA gait belt, and an ARNA harness, with both robot conditions scoring significantly higher."
img: assets/img/arna/arna_harness.jpg
importance: 10
category: work
tech: [Technology Acceptance Model, Fall Prevention, Nursing Simulation, HRI, Regression Analysis]
paper_url: https://doi.org/10.1177/21650799241262812
paper_venue: "Workplace Health & Safety"
related_publications: logsdon2024perceived
---

Patient falls, and the caregiver injuries that happen while preventing them, are among the most costly and persistent problems in nursing. A robotic assistant can only reduce those injuries if nurses find it useful enough to actually use it. This study tested the perceived usefulness of ARNA (Adaptive Robotic Nursing Assistant) for the specific, high-risk task of walking a patient, which is the prerequisite for any fall-prevention technology to earn adoption on the floor.

Thirty-eight pre-licensure nursing students ambulated a simulated patient along a marked path in a mock hospital corridor in our lab under three conditions. The conditions were a traditional human-held **gait belt**, which is today's standard of care, a **gait belt attached to ARNA**, and a **full-body harness attached to ARNA**. After each condition, participants rated perceived usefulness on a validated Technology Acceptance Model scale, and the responses were analyzed with multiple regression. As the trials' robotics engineer and a co-author, I operated ARNA throughout the study, deploying the ROS commands that drove the robot through each ambulation run, and recorded the trial data for more than 30 participants.

{% include figure.liquid loading="lazy" path="assets/img/arna/arna_fall_setup.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Study setup showing the ambulation path, gait-belt condition, and ARNA harness condition with labeled safety components" caption="Study setup, showing (A) the marked ambulation path, (B) the human gait-belt condition, and (C) ARNA's harness condition with its safety frame, D-ring, harness, and emergency stop. Tap or click to enlarge." %}

Key results:

- Both ARNA-assisted conditions were rated significantly more useful than the human-only gait belt (p < .01), with large effect sizes (Cohen's d ≈ 0.7–0.9).
- Mean perceived usefulness rose from 3.66 / 5 for the manual gait belt to 4.5 / 5 with ARNA's gait belt and 4.33 / 5 with the harness.
- There was no meaningful difference between the two robot configurations, so either attachment is a viable design path, which is a useful finding for how ARNA should be engineered.
- Together the results support ARNA as an acceptable tool for safer patient ambulation and reduced physical strain on healthcare providers.

See the full study in _Workplace Health & Safety_ {% cite logsdon2024perceived %}.
