---
layout: page
title: "ARNA Remote Teleoperation & Semi-Autonomous Grasping"
description: "Full-stack distributed teleoperation system for ARNA using ROS1 and Next.js with Cloudflare ingress and low-latency browser video streaming. Implemented semi-autonomous pick-and-place using FastSAM segmentation and Contact-GraspNet for point-and-click grasp execution."
img:
importance: 2
category: work
tech: [ROS1, Next.js, WebSockets, rosbridge, FastSAM, Contact-GraspNet, Cloudflare, Python, C++]
---

Architected a distributed teleoperation stack combining ROS1 with a Next.js web frontend, enabling operators to control ARNA from a browser over Cloudflare-tunneled WebSocket connections with multi-channel rosbridge streaming and low-latency RTSP video.

Implemented semi-autonomous grasping using FastSAM for real-time object segmentation and Contact-GraspNet for grasp pose estimation, allowing point-and-click pick-and-place execution from the browser UI.
