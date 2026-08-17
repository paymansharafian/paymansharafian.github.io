---
layout: page
title: "ARNA Hospital Trial: Clinical Acceptability Study"
description: "First-author IEEE CASE 2025 study evaluating the clinical acceptability of ARNA with 10 patients and 5 nurses at University of Louisville Hospital, using the Technology Acceptance Model across tablet vs. joystick teleoperation and a shared-control walker scenario."
img: assets/img/arna/arna_with_supervisor.jpg
importance: 9
category: work
tech: [Clinical Trial, Technology Acceptance Model, HRI, Teleoperation, ROS, R, Mixed-Effects Models]
paper_url: https://doi.org/10.1109/CASE58245.2025.11163757
paper_venue: "IEEE CASE 2025"
related_publications: sharafianardakani2025hospital
---

Hospitals face a growing shortage of nursing staff, and patient-handling tasks such as fetching items and helping patients walk are a leading source of caregiver strain and injury. ARNA (Adaptive Robotic Nursing Assistant) was built to take on those two tasks, but a robot only helps if the people at the bedside will actually accept it. This trial measured that acceptance directly, with real patients and nurses, inside an active hospital rather than a lab.

I designed and led the study around two clinical scenarios. In the **Patient Sitter** scenario, ten patients teleoperated ARNA's arm to fetch and deliver objects, using a touchscreen tablet in one trial and a joystick in another so the two interfaces could be compared directly. In the **Nurse Walker** scenario, five nurses walked with ARNA as a shared-control robotic walker driven by a neuroadaptive force/torque controller. I instrumented the robot to log objective task-completion times and collected Technology Acceptance Model (TAM) surveys covering perceived usefulness, ease of use, behavioral intention, and satisfaction, then analyzed the data with linear mixed-effects models in R.

<div class="row">
  <div class="col-md-4 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/arna/arna_hero_clinical.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Bedside teleoperation session during the Patient Sitter scenario at University of Louisville Hospital" %}
  </div>
  <div class="col-md-4 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/arna/arna_joystick.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Joystick controller used by patients to teleoperate ARNA" %}
  </div>
  <div class="col-md-4 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/arna/arna_tablet_ui.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Tablet teleoperation interface for ARNA showing live camera feeds and touch controls" %}
  </div>
</div>
<div class="caption">Patient Sitter scenario. Running a bedside session at University of Louisville Hospital (left), and the two interfaces patients used to drive ARNA's arm, a joystick (center) and a touchscreen tablet app (right). The joystick proved significantly easier for patients to use.</div>

{% include figure.liquid loading="lazy" path="assets/img/arna/arna_hospital_corridor.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Nurse guiding ARNA along the trial route on an active hospital unit, with the sensorized handlebar shown inset" caption="Nurse Walker scenario. A nurse guides ARNA along the trial route (red path) on an active hospital unit, steering it through the sensorized handlebar (inset) under shared control." %}

Key results:

- The joystick was the better patient interface. It was significantly easier to use and more likely to be adopted (p ≈ 0.02–0.03), even though objective task times between the two were statistically similar.
- Prior video-game experience strongly predicted acceptance, which is a concrete signal that onboarding and training matter, especially for older patients (mean patient age ≈ 64).
- The core TAM chain held with high explanatory power. Ease of use drove perceived usefulness, which drove intention to use, confirming that both patients and nurses saw ARNA as genuinely useful rather than only novel.
- Nurses rated the shared-control walker positively overall, supporting ARNA as a credible aid for assisting patients during ambulation.

Running the robot on a working hospital unit with real patients and nurses, rather than a lab surrogate, is what makes this evaluation unusual. Full methods and statistics are in the paper {% cite sharafianardakani2025hospital %}.
