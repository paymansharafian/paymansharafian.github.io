---
layout: page
title: "Tactile Handlebar and Deep Learning for Safe Interaction with a Robot Nursing Assistant"
description: "A sensorized handlebar that reads grip finger by finger, paired with deep sequence models that flag adverse events — panic grips, one-hand releases — while a patient is walking with ARNA. Under review at IEEE Transactions on Medical Robotics and Bionics."
img: assets/img/tactile/tactile_handlebar_new.jpg
importance: 8
category: work
tech: [ROS, Python, PyTorch, TCN, Kalman Filter, FSR Array, ATI F/T, Arduino, SLA 3D Printing, PCB Design]
---

A robotic walker that reads its user through a single six-axis force/torque sensor knows the _net_ push on the handlebar and nothing else. That is enough to move the robot compliantly, but it is far too coarse for safety: a patient tightening into a panic grip, letting go with one hand, or losing balance produces a distributed change in how their fingers press — and a single-point sensor averages exactly that signal away. **This project asks whether measuring grip at finger resolution lets the robot see a fall coming before it becomes one.**

<div class="row">
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/tactile/tactile_handlebar_old.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="The previous ARNA handlebar, a plain bar mounted on a six-axis force/torque sensor" %}
  </div>
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/tactile/tactile_handlebar_new.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="The new sensorized handlebar with force sensing resistors in each grip, force/torque sensor, adjustable frame and mount" %}
  </div>
</div>
<div class="caption">Before and after. The previous handlebar (left) was a plain bar on a six-axis force/torque sensor. The new design (right) keeps that sensor but adds eight force-sensing resistors — four per handle — inside ergonomic grips on an adjustable frame.</div>

The handlebar carries **eight piezoresistive force sensors, four per handle**, positioned to sit under the thumb, index, middle/ring and pinky contact points. Each one is epoxied into a custom button behind a load-concentrating puck, so grip pressure reaches the sensor evenly instead of as a stress point, and the whole assembly lives inside SLA-printed ergonomic casings on a mild-steel frame — the industrial six-axis sensor stays in place underneath, so the design adds tactile detail without giving up the kinetic measurement the walker controller already depends on.

<div class="row">
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/tactile/tactile_internal_layout.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Internal layout of the handlebar casing showing the FlexiForce sensor, puck, and finger buttons" %}
  </div>
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/tactile/tactile_force_path.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Cross-section showing how grip pressure travels through the button and puck into the sensor" %}
  </div>
</div>
<div class="caption">Left: the vertical distribution of the four sensors in one handle. Right: how grip pressure reaches a sensor — through the button and load-concentrating puck, against the internal reaction of the pipe.</div>

Behind the sensors sits a custom signal-conditioning board built around an Arduino Mega and a bank of non-inverting amplifier stages, one per channel, each with an adjustable feedback resistor so a channel's sensitivity can be matched to the grip force it actually sees. Digitised readings are published into ROS at 122 Hz alongside the force/torque stream. Before trusting the array, the two sensing modalities were characterised against each other — correlating every pressure channel with the ground-truth force/torque signal to confirm that grip patterns really do encode directional intent rather than noise.

{% include figure.liquid loading="lazy" path="assets/img/tactile/tactile_correlation.png" class="img-fluid rounded z-depth-1" zoomable=true alt="Spearman correlation heatmap between all eight pressure sensor channels and the six force/torque axes" caption="Spearman correlation between the eight pressure channels and the six force/torque axes, used to verify that distributed grip patterns carry directional intent complementary to the F/T sensor." %}

On the software side, the raw channels are first passed through a **Kalman filter** — a Singer motion model per channel, chosen over constant-acceleration because human grip is anything but steady — which yields not just a denoised force but its rate of change. Those are aggregated into per-hand grip magnitude and grip velocity, then windowed into sequences for a classifier. Three temporal architectures were compared head-to-head on the same data: a bidirectional LSTM, a CNN-GRU with attention, and a **Temporal Convolutional Network**. The comparison was deliberately framed around generalisation and convergence behaviour rather than headline accuracy, since a model that merely fits the training subjects is useless for a safety system — and a bidirectional model is disqualified in principle anyway, because it needs future samples to classify the present.

{% include figure.liquid loading="lazy" path="assets/img/tactile/tactile_tcn_arch.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Temporal Convolutional Network architecture with dilated causal convolutions, residual blocks, and last-step aggregation" caption="The TCN — dilated causal convolutions in residual blocks, with last-step aggregation into the event-probability head. Strictly causal, so it never needs a future sample to classify the present." %}

Training data came from **20 participants** walking assisted paths with the robot — a U-path, a figure-8, and a forked route — with two safety-critical events staged along the way: a panic grip, and lifting one hand off the handlebar. The fitted model was then deployed back onto the physical robot and validated live with **10 new participants** who had never contributed training data, which is the test that matters for a safety claim.

<div class="row justify-content-center">
  <div class="col-md-7 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/tactile/tactile_paths.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Diagram of the U-path, figure-8, and forked walking routes with panic grip and hand lifting events marked" %}
  </div>
</div>
<div class="caption">The walking routes, with the staged panic-grip and hand-lifting events marked along each.</div>

The TCN came out ahead — better generalisation to unseen users, and causal by construction, so it runs in real time on the robot rather than in post-processing. Detecting distress from steering dynamics during a complex turn is the hard case, and the deployed system handled it.

This manuscript is **under review at _IEEE Transactions on Medical Robotics and Bionics_**. Detailed results are held back here until the paper is through revision.
