---
layout: page
title: "Neural Human Intent Estimator for an Adaptive Robotic Nursing Assistant"
description: "IEEE CASE 2024 paper on HIE-NAC, a model-free neural estimator that infers where a user intends to walk from handlebar forces alone and feeds a neuroadaptive controller. Lyapunov-proven stability, validated with 10 participants across three guided paths."
img: assets/img/intent/intent_architecture.png
importance: 8
category: work
tech: [ROS1, C++, Neural Networks, Adaptive Control, Lyapunov Stability, pHRI, Mecanum Base, ATI F/T, R]
paper_url: https://doi.org/10.1109/CASE59546.2024.10711531
paper_venue: "IEEE CASE 2024"
video_url: https://youtu.be/SPxjS806RLY
related_publications: trombley2024neural
---

When a patient leans on ARNA and walks, the robot has exactly one channel of information about where they want to go: the forces they put into the handlebar. Turning that into motion is usually done with an admittance model — but a fixed model has to be tuned, every person pushes differently, and the result is motion that fights the user and feels jerky. **The goal here was to estimate the user's intent online, without a model of the human and without per-person tuning.**

{% include figure.liquid loading="eager" path="assets/img/intent/intent_arna_labeled.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="ARNA robot with labeled Kinova arm, handlebar, force/torque sensor, electronics assembly, base, and LiDAR" caption="ARNA, the platform used in this study — a 7-DOF Kinova arm on a four-wheel Mecanum base, with the sensorized handlebar and its 6-axis force/torque sensor as the only pHRI input." %}

The answer is **HIE-NAC**, a cascaded scheme with a human intent estimator in the outer loop and a neuroadaptive controller in the inner loop. The outer loop treats the person as a low-pass filter whose gains are unknown and personal, and runs two single-hidden-layer networks against it: one estimates those human gain matrices, the second turns them into the position and velocity the user is actually asking for. The inner-loop NAC — a third network — then computes the wheel torques that track that trajectory while cancelling ARNA's own mass and Coriolis nonlinearities. Nothing is trained in batch. All three networks update their weights online, and the update laws are derived from a Lyapunov function, which is what makes the whole cascade provably bounded rather than merely well-behaved in testing. It runs in C++ under ROS — inner loop at 300 Hz, intent estimator at 100 Hz.

{% include figure.liquid loading="lazy" path="assets/img/intent/intent_architecture.png" class="img-fluid rounded z-depth-1" zoomable=true alt="HIE-NAC block diagram showing NN1 estimating human gains, NN2 estimating the reference trajectory, and the inner-loop NAC producing wheel torques" caption="The HIE-NAC architecture. NN1 estimates the user's gain matrices, NN2 converts them into a reference pose and velocity, and the inner-loop NAC turns that reference into wheel torques." %}

Ten participants with no prior experience of the robot guided ARNA along three reference paths — a 5 m straight line, a 3 m × 3 m square, and a straight run with a chair to steer around — under both HIE-NAC and a tuned conventional admittance baseline, in a repeated-measures design. We logged reference and actual velocities from the wheel encoders, derived motion jerk, and fitted mixed-effects regression models. As third author I supported the experiments and data collection, contributed to the statistical analysis and the writing, and [presented the work](https://youtu.be/SPxjS806RLY) at IEEE CASE 2024 in Bari, Italy.

{% include figure.liquid loading="lazy" path="assets/img/intent/intent_floor_paths.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Laboratory floor showing the taped straight-line path, square path, and obstacle position used in the experiments" caption="The three evaluation paths taped on the lab floor: a 5 m straight line, a 3 m square, and a straight run with an obstacle to navigate around." %}

**Key results:**

- **Motion jerk dropped significantly** under HIE-NAC — a main effect of $$\beta = -45.55$$ ($$p = 0.006$$) in the mixed-effects model, with the jerk model explaining 73% of the variance.
- **The harder the path, the bigger the gain.** The interaction terms were larger than the main effect: $$\beta = -66.97$$ ($$p = 0.001$$) on the obstacle course and $$\beta = -84.95$$ ($$p < .001$$) on the square path. Where a fixed admittance model struggles most — turns and avoidance — is exactly where estimating intent pays off.
- **Stability is proven, not just observed.** The weight-update laws come out of a Lyapunov analysis that bounds the tracking error, so the adaptation is guaranteed to stay well-behaved as long as the user's own intent is smooth and bounded.

{% include figure.liquid loading="lazy" path="assets/img/intent/intent_jerk.png" class="img-fluid rounded z-depth-1" zoomable=true alt="Box plots of motion jerk for the baseline NAC versus the proposed HIE-NAC across the three paths and three axes" caption="Motion jerk for the baseline NAC and the proposed HIE-NAC across all three paths and axes. The separation is large and consistent in every condition." %}

The result is a nurse-assistant robot that is noticeably smoother to walk with, without giving up stability guarantees — and one that gets there by reading the user rather than by being tuned to them. Full derivations, the stability proof, and the statistics are in the paper {% cite trombley2024neural %}.
