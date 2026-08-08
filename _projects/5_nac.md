---
layout: page
title: "Evaluation of a Neuroadaptive Admittance Controller for Ambulation"
description: "First-author Intelligent Service Robotics paper evaluating NAC, a neural-network torque controller that gives ARNA its compliance as a robotic walker. Benchmarked against a classical PD controller with 10 users, then re-tuned and re-tested with 63 nursing students."
img: assets/img/nac/nac_gazebo.jpg
importance: 6
category: work
tech: [ROS Kinetic, Gazebo, MATLAB, MLP, Neural Networks, Lyapunov Stability, Admittance Control, Mecanum Base, ATI F/T, SolidWorks]
paper_url: https://doi.org/10.1007/s11370-025-00649-3
paper_venue: "Intelligent Service Robotics"
related_publications: sharafianardakani2025evaluation
---

A robotic walker has to feel compliant. The user pushes on the handlebar and the robot should move the way they meant, with no sense of dragging a machine that is resisting them. Admittance control is the standard way to get that behaviour, but it depends on a dynamic model of the robot — and ARNA's dynamics are anything but fixed. Payload changes when a hospital bed is docked to the front, friction changes with the floor, and every user pushes differently. **The question this paper asks is whether replacing the model-based inner loop with one that learns online produces a measurably better walking experience.**

{% include figure.liquid loading="eager" path="assets/img/nac/nac_architecture.png" class="img-fluid rounded z-depth-1" zoomable=true alt="Block diagram of the neuroadaptive admittance controller: force/torque sensor into an admittance model and inverse kinematics, feeding an inner-loop NAC with a neural network approximating the robot dynamics" caption="The controller. Handlebar forces pass through an admittance model and inverse kinematics to produce a reference trajectory; the inner-loop NAC tracks it, using a neural network to approximate ARNA's unmodelled dynamics in real time." %}

The outer loop is a conventional admittance model that turns handlebar force into a desired Cartesian velocity, then into wheel references through the Mecanum inverse kinematics. The interesting part is the inner loop. Instead of a model, the **NAC** uses a two-layer perceptron — a 20-element state vector in, fifteen sigmoid hidden units, four wheel torques out — to approximate whatever nonlinear dynamics the robot actually has at that moment. Crucially there is **no offline training phase and no dataset**: the weights adapt continuously while the user walks, following tuning laws derived from a Lyapunov analysis, with an e-modification term that stops the weights growing without bound. On hardware the inner loop runs at 333 Hz against a 125 Hz admittance model, so the controller responds well ahead of the compliance it is shaping.

I built the system in Gazebo first — ARNA's SolidWorks CAD converted to URDF, Mecanum wheels modelled with tuned friction and inertia — which made it possible to tune the controller before risking hardware. Simulated runs covered both an unloaded robot and one dragging a 250 kg hospital bed and a 5 kg IV pole, the realistic worst case for a nursing assistant.

<div class="row">
  <div class="col-md-7 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/nac/nac_gazebo.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="ARNA robot simulated in Gazebo alongside a hospital bed and IV pole" %}
  </div>
  <div class="col-md-5 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/nac/nac_paths.png" class="img-fluid rounded z-depth-1" zoomable=true alt="Diagram of the square, clockwise, counterclockwise, and sloped paths used in the user experiments" %}
  </div>
</div>
<div class="caption">Left: the Gazebo model, used to tune the controller against a 250 kg hospital bed and IV pole before touching hardware. Right: the four evaluation paths — a 5.5 m × 6.0 m square, clockwise and counterclockwise loops, and a 5.87° incline.</div>

Ten users with no prior experience of the robot then walked ARNA along four paths under both NAC and a classical PD velocity controller. The square path exercises all three directions of the omnidirectional base including sideways travel, the two loop directions test whether the asymmetric weight distribution matters, and the slope stands in for a ramp. User torque and odometry were logged from ROS bags and paired with a subjective questionnaire.

**Against the PD baseline:**

- **Tracking accuracy improved by up to 32%** on the square path and up to 18% on the slope.
- **Motion jerk fell by up to 52% laterally and 43% longitudinally** across all four paths — the largest gaps appearing during sideways segments, where a user's hands move faster than their feet can follow and the controller has to absorb the correction.
- **Users worked up to 10% less** to move the robot, with the controller taking on up to 13% more actuator effort to compensate. Moving effort from the person to the machine is the entire point in an assistive walker.
- Drives finished up to **6% faster** on flat ground, so the smoothness costs nothing in efficiency.

Because those ten users had no medical background, we then ran a second study with **63 nursing students**, re-tuning the controller gains on their feedback — 34 walked the robot with the baseline controller and 29 with the fine-tuned version, along a U-shaped path marked on the lab floor.

{% include figure.liquid loading="lazy" path="assets/img/nac/nac_walk_path.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Laboratory floor marked with the U-shaped path and a start/stop point used in the nursing student study" caption="The U-shaped path walked by the 63 nursing students, with clockwise and counterclockwise segments and a rotation at the far end." %}

**After tuning on practitioner feedback:**

- **Velocity tracking error dropped from 0.0157 m/s to 0.0105 m/s.**
- **Actuator effort roughly halved** — a mean robot torque norm of 1.79 Nm against 3.66 Nm for the baseline.
- **Jerk fell 41% laterally and 42% longitudinally**, making the robot meaningfully smoother to walk beside.

<div class="row">
  <div class="col-md-4 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/nac/nac_velocity_error.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Box plot comparing velocity tracking error for the tuned and baseline NAC" %}
  </div>
  <div class="col-md-4 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/nac/nac_robot_torque.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Box plot comparing robot torque norm for the tuned and baseline NAC" %}
  </div>
  <div class="col-md-4 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/nac/nac_jerk_x.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Box plot comparing average jerk in the x direction for the tuned and baseline NAC" %}
  </div>
</div>
<div class="caption">Tuned versus baseline NAC across all 63 participants — velocity tracking error, robot torque norm, and average jerk. Tuning on practitioner feedback moved every one of them in the right direction.</div>

The result is a controller that earns its compliance rather than being tuned into it: no model of the robot, no offline learning phase, and stability that comes from a proof rather than from careful gain-setting. Full derivations, the controller formulation, and both user studies are in the paper {% cite sharafianardakani2025evaluation %}.
