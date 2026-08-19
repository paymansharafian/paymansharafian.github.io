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
  - degree: "Ph.D. Electrical & Robotics Engineering"
    school: "University of Louisville"
    dates: "2022 – 2026 (expected)"
  - degree: "M.Sc. Mechatronics Engineering"
    school: "University of Tehran"
    dates: "2017 – 2021"
  - degree: "B.Sc. Electrical Power Engineering"
    school: "Islamic Azad University, Varamin"
    dates: "2012 – 2017"

skills:
  - group: "Robotics & Control"
    items:
      - ROS / ROS2
      - MoveIt
      - Gazebo
      - RViz
      - Navigation & AMCL
      - MPC
      - Control Barrier Functions
      - Adaptive & Neuroadaptive Control
      - Lyapunov Stability
      - Admittance Control
      - Kalman Filtering
  - group: "Machine Learning & Perception"
    items:
      - PyTorch
      - ONNX
      - Temporal Convolutional Networks
      - LSTM / GRU
      - Genetic Algorithms
      - OpenCV
      - FastSAM
      - Contact-GraspNet
      - Point Clouds
  - group: "Software & Systems"
    items:
      - Python
      - C / C++
      - MATLAB / Simulink
      - Linux
      - Docker
      - Git
      - Next.js
      - JavaScript
      - WebSockets / rosbridge
      - Cloudflare Tunnel
  - group: "Hardware"
    items:
      - Kinova Gen3
      - Mecanum Base
      - ATI F/T Sensors
      - LiDAR
      - Jetson
      - Arduino
      - PCB Design
      - EtherCAT
      - SLA 3D Printing
  - group: "Research Methods"
    items:
      - Human-Subjects Study Design
      - IRB Protocols
      - Statistical Analysis
      - Mixed-Effects Models
      - Technology Acceptance Model

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

I'm a robotics engineer who ended up learning the whole stack because a real robot doesn't let you specialize. For the past three years I've been the lead engineer on ARNA, an NSF-funded robotic nursing assistant, a 7-DOF Kinova arm on a Mecanum base which means I've spent my time everywhere from soldering its motor-controller PCB back to life to designing adaptive controls and user interfaces, and running several trials including one with actual patients and nurses on an active UofL hospital unit.

The parts I like most are the ones where a whole layer has to hold together at once. A neuroadaptive admittance controller that learns the robot's unmodeled dynamics online at 333 Hz, with the update laws falling out of a Lyapunov proof rather than a tuning session. A five-layer MPC-CBF shared-control stack that keeps hard safety guarantees when both the operator and their internet connection are unreliable. A sensorized handlebar I designed from the FSRs up, running a temporal convolutional network onboard in ONNX that re-checks for a panic grip every 8.2 ms.

I care a lot about whether things actually work outside the lab, which is why I keep ending up in IRB paperwork. Thirty remote operators in different U.S. cities driving a robot in Louisville over the public internet. Sixty-three nursing students. Ten patients and five nurses in a hospital. The numbers I quote are the ones I measured.

Five peer-reviewed journal papers, three as first author (IEEE RA-L, Intelligent Service Robotics and IEEE CASE), with two more first-author manuscripts in the pipeline. I finish my Ph.D. in Electrical & Robotics Engineering at the University of Louisville in December 2026, and I'm looking for work where the hardware and the software have to survive contact with real people.
