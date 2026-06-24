---
layout: page
title: "Network-Aware MPC-CBF for Safe Remote Teleoperation of ARNA"
description: "Safety-critical shared control architecture for remote teleoperation of ARNA under degraded network conditions. Implements MPC-CBF and CBF-QP safety filters, dynamic watchdog coordination, LiDAR obstacle constraints, and a PGD-based operator intent estimator for adaptive autonomy blending."
img:
importance: 2
category: work
tech: [ROS1, Python, C++, CasADi, qpOASES, MPC, CBF, LiDAR, Dynamic Reconfigure]
---

Developed a network-aware safety layer for arm and base teleoperation combining MPC-CBF and CBF-QP filters with dynamic watchdog coordination and LiDAR obstacle avoidance constraints.

Includes a PGD-based operator intent estimator that blends autonomous safety corrections with operator commands adaptively under degraded communication conditions.
