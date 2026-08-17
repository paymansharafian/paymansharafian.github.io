---
layout: page
title: "Tactile Handlebar and Deep Learning for Safe Interaction with a Robot Nursing Assistant"
description: "A sensorized handlebar that reads grip finger by finger, paired with deep sequence models that flag adverse events such as panic grips and one-hand releases while a patient is walking with ARNA. Under review at IEEE Transactions on Medical Robotics and Bionics."
img: assets/img/tactile/tactile_handlebar_thumb.jpg
importance: 7
category: work
paper_status: "Under Review: IEEE Transactions on Medical Robotics and Bionics"
tech: [ROS, Python, PyTorch, TCN, Kalman Filter, FSR Array, ATI F/T, Arduino, SLA 3D Printing, PCB Design]
---

A robotic walker that reads its user through a single six-axis force/torque sensor knows the _net_ push on the handlebar and nothing else. That is enough to move the robot compliantly, but far too coarse for safety. A patient tightening into a panic grip, letting go with one hand, or losing balance produces a distributed change in how their fingers press, and a single-point sensor averages exactly that signal away. This project asks whether measuring grip at finger resolution lets the robot see a fall coming before it becomes one. As first author I led it end to end, covering the handlebar design and sensor placement, the signal-conditioning hardware, the filtering and deep-learning pipeline, and the deployment and human-subject trials on the robot.

<div class="row">
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/tactile/tactile_handlebar_old.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="The previous ARNA handlebar, a plain bar mounted on a six-axis force/torque sensor" %}
  </div>
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/tactile/tactile_handlebar_new.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="The new sensorized handlebar with force sensing resistors in each grip, force/torque sensor, adjustable frame and mount" %}
  </div>
</div>
<div class="caption">Before and after. The previous handlebar (left) was a plain bar on a six-axis force/torque sensor. The new design (right) keeps that sensor and adds eight force-sensing resistors, four per handle, inside ergonomic grips on an adjustable frame.</div>

The handlebar carries **eight piezoresistive force sensors, four per handle**, using FlexiForce A201s positioned to sit under the thumb, index, middle/ring and pinky contact points. Each one is epoxied into a custom button behind a load-concentrating puck, so grip pressure reaches the sensor evenly instead of as a stress point. The whole assembly lives inside SLA-printed ergonomic casings on a mild-steel frame, and the industrial six-axis sensor stays in place underneath, so the design adds tactile detail without giving up the kinetic measurement the walker controller already depends on.

<div class="row">
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/tactile/tactile_internal_layout.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Internal layout of the handlebar casing showing the FlexiForce sensor, puck, and finger buttons" %}
  </div>
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/tactile/tactile_force_path.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Cross-section showing how grip pressure travels through the button and puck into the sensor" %}
  </div>
</div>
<div class="caption">Left, the vertical distribution of the four sensors in one handle. Right, how grip pressure reaches a sensor, travelling through the button and load-concentrating puck against the internal reaction of the pipe.</div>

Behind the sensors sits a custom signal-conditioning board built around an Arduino Mega and a bank of non-inverting amplifier stages, one per channel, each with an adjustable feedback resistor so a channel's sensitivity can be matched to the grip force it actually sees. Digitised readings are published into ROS at 122 Hz alongside the force/torque stream. Before trusting the array, the two sensing modalities were characterised against each other, correlating every pressure channel with the ground-truth force/torque signal to confirm that grip patterns encode directional intent rather than noise.

{% include figure.liquid loading="lazy" path="assets/img/tactile/tactile_correlation.png" class="img-fluid rounded z-depth-1" zoomable=true alt="Spearman correlation heatmap between all eight pressure sensor channels and the six force/torque axes" caption="Spearman correlation between the eight pressure channels and the six force/torque axes, used to verify that distributed grip patterns carry directional intent complementary to the F/T sensor." %}

On the software side, the raw channels are first passed through a **Kalman filter** using a Singer motion model per channel, chosen over constant-acceleration because human grip changes speed constantly. The filter yields a denoised force and its rate of change. Those are aggregated into per-hand grip magnitude and grip velocity, then windowed into sequences for a classifier. Three temporal architectures were compared on the same data, a bidirectional LSTM, a CNN-GRU with attention, and a **Temporal Convolutional Network**. The comparison was framed around generalisation and convergence behaviour rather than headline accuracy, since a model that only fits the training subjects is useless for a safety system. A bidirectional model is also disqualified in principle, because it needs future samples to classify the present.

{% include figure.liquid loading="lazy" path="assets/img/tactile/tactile_tcn_arch.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Temporal Convolutional Network architecture with dilated causal convolutions, residual blocks, and last-step aggregation" caption="The TCN, built from dilated causal convolutions in residual blocks with last-step aggregation into the event-probability head. It is strictly causal, so it never needs a future sample to classify the present." %}

Training data came from **20 participants** walking assisted paths with the robot, a U-path, a figure-8, and a forked route, with two safety-critical events staged along the way. The events were a panic grip and lifting one hand off the handlebar. The fitted model was then deployed back onto the physical robot and validated live with **10 new participants** who had never contributed training data, which is the test that matters for a safety claim.

<div class="row justify-content-center">
  <div class="col-md-7 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/tactile/tactile_paths.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Diagram of the U-path, figure-8, and forked walking routes with panic grip and hand lifting events marked" %}
  </div>
</div>
<div class="caption">The walking routes, with the staged panic-grip and hand-lifting events marked along each.</div>

Under subject-wise 5-fold cross-validation, where every subject's data is confined to a single fold so no model is ever scored on someone it has seen, the TCN came out ahead.

| Model   | AUROC           | F1 Score        | Recall          | Precision       |
| ------- | --------------- | --------------- | --------------- | --------------- |
| BiLSTM  | 0.83 ± 0.04     | 0.61 ± 0.04     | 0.56 ± 0.05     | 0.69 ± 0.11     |
| CNN-GRU | 0.86 ± 0.02     | 0.64 ± 0.04     | 0.60 ± 0.08     | **0.73 ± 0.06** |
| TCN     | **0.87 ± 0.03** | **0.67 ± 0.04** | **0.63 ± 0.06** | 0.72 ± 0.11     |

Recall is the metric that matters here. A missed panic grip is a patient the robot fails to help, while a false alarm is only an interruption. The TCN wins on recall while holding precision, and its training curves stay stable where the CNN-GRU diverges into overfitting. With only twenty subjects, a recurrent model has enough capacity to memorise individual tremor frequencies and hand sizes instead of learning grip dynamics. Recall in the low 0.6s is also less of a ceiling than it appears, since only 219 of the 1,986 windows contain an event. That roughly 1:9 imbalance caps what a deliberately conservative classifier can reach.

Deployed to the physical robot, the model was exported to ONNX and run **entirely on ARNA's onboard computer**, a VersaLogic EPU-4562, with no cloud round-trip. It re-evaluates its full 512-sample window on every incoming sample, one inference every 8.2 ms. Ten previously unseen participants then walked all three paths.

| Path                 | Detection rate | Mean latency | False alarms  |
| -------------------- | -------------- | ------------ | ------------- |
| Figure-8             | 90.0%          | 2.03 s       | 1.64 /min     |
| U-Path               | 80.0%          | 2.07 s       | 2.19 /min     |
| Y-Path (no events)   | n/a            | n/a          | 0.51 /min     |
| **Overall (N = 10)** | **85.0%**      | **2.05 s**   | **1.45 /min** |

{% include figure.liquid loading="lazy" path="assets/img/tactile/tactile_detection_timeline.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Real-time event probability trace over a walking session, rising above threshold during each shaded panic grip and hand lift window" caption="Live output during one U-Path session. The model's event probability (blue) sits near baseline through normal walking and jumps above the 0.6 threshold within each shaded event window, first two panic grips and then two one-hand lifts." %}

That is 68 of the 80 staged events caught. Detection was **better on the curved figure-8 path (90%) than on the straight U-path (80%)**, which we did not expect, since turning is where conventional admittance-controlled walkers fail and asymmetric steering forces get misread as instability. Feeding the model the _rate of change_ of grip rather than grip magnitude alone is what avoids this. A panic grip is a synchronised bilateral squeeze while steering is asymmetric, so the derivative features separate the two cleanly. The Y-path shows this most clearly. It contains the most aggressive manoeuvring of the three, pulling the robot backwards away from an obstacle, which produces large derivatives, and it has no staged events at all, yet it produced the fewest alarms of any path at 0.51 per minute. Path complexity does not degrade detection, which is a prerequisite for a device meant to work in a real ward where people constantly change direction around furniture.

The false-alarm figure needs reading carefully. Of the 1.45 alarms per minute overall, 86% are the decay of the output after a genuine event rather than spurious detections. The sliding window still contains the event once it has ended, so the probability takes a median 1.87 s to clear. Excluding those tails leaves **0.35 independent alarms per minute**, roughly one every three minutes, mostly during hand repositioning. Tightening the threshold or requiring the probability to persist cuts alarms further at a cost of about a point of detection rate, and we kept the sensitive setting for this first validation.

Three things bound the claims. The participants were healthy adults performing scripted events, and the cohort skewed male and White with a mean age of 33.6, so patients with tremor, spasticity, fatigue or grip deficits may produce far weaker signals. The residual false alarms still matter over a long shift and argue for a threshold that adapts to context rather than a fixed one. The system also reads tactile data alone, and pairing it with lower-limb kinematics is the obvious way to corroborate an ambiguous grip. This is a proof of concept, not a claim of clinical readiness.

This manuscript is **under review at _IEEE Transactions on Medical Robotics and Bionics_**. Detailed results will be provided after publication.
