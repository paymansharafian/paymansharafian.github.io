---
layout: page
title: "ARNA — Adaptive Robotic Nursing Assistant"
description: "NSF-funded omnidirectional mobile manipulator for clinical nursing assistance — Kinova Gen3 arm on a Mecanum base with LiDAR and ATI Axia 80 F/T sensing. Primary engineer across hardware, software, control, and clinical deployment since 2023."
img: assets/img/arna/ARNA_Thumbnail.jpg
importance: 1
category: work
tech: [ROS1, Python, C++, Kinova Gen3, Mecanum Base, LiDAR, ATI F/T, EtherCAT, Jetson, Linux]
---

<!-- <div class="arna-badges">
  <span class="arna-badge">NSF-Funded</span>
  <span class="arna-badge">Patent US12090629B2</span>
  <span class="arna-badge">58+ Nursing Students</span>
  <span class="arna-badge">15+ Patients</span>
  <span class="arna-badge">2023–Present</span>
</div> -->

{% include figure.liquid loading="eager" path="assets/img/arna/arna_research_scope.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Venn diagram of three research areas — Robotics and Advanced Control, Human-Robot Interaction, and Healthcare and Human Factors — meeting at ARNA, beside a photo of the robot at a patient bedside" caption="ARNA sits where three fields overlap, and that is what makes it a research platform rather than a product: control work is only useful here if a person can guide it intuitively, and neither matters unless clinicians accept it at the bedside. Every project below belongs to one of these circles." %}

<h2 class="arna-section-heading">Platform Overview</h2>
<div class="arna-overview">
  <img class="arna-overview-fig" src="{{ '/assets/img/arna/arna_hardware_scheme.jpg' | relative_url }}" alt="Annotated ARNA hardware: Kinova arm, sensorized handlebar, LiDAR, RGBD cameras, and onboard sensors" loading="lazy" />
  <p>ARNA (Adaptive Robotic Nursing Assistant) is an NSF-funded omnidirectional mobile manipulator developed at LARRI for clinical nursing assistance. The platform pairs a Kinova Gen3 arm with a Mecanum-wheel base, LiDAR, ultrasonic/bump/IMU sensing, ATI Axia 80 force/torque sensors, and a sensorized handlebar, all running on a distributed ROS1 stack across an onboard PC and Jetson.</p>
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

<div class="arna-clinical-pair">
  <img src="{{ '/assets/img/arna/arna_nurse_clinical.jpg' | relative_url }}" alt="Nurse using ARNA as a shared-control robotic walker during a clinical trial" loading="lazy" />
  <img src="{{ '/assets/img/arna/arna_hero_clinical.jpg' | relative_url }}" alt="Demonstrating ARNA to a patient during a hospital trial" loading="lazy" />
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
      <a href="{{ '/projects/3_remote_ui/' | relative_url }}">Remote Teleoperation Front-End Design with Secure Network Transport</a>
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
