---
layout: page
title: "Adaptive User Interface With Parallel Neural Networks for Robot Teleoperation"
description: "First-author IEEE Robotics and Automation Letters paper introducing PNNUI, a teleoperation interface built from two neural networks running in parallel — one trained offline by a genetic algorithm to minimize task time, one trained online to suppress motion jerk. Validated with 20 human subjects."
img: assets/img/pnnui/pnnui_experiment_path.jpg
importance: 2
category: work
tech: [ROS Melodic, Python, PyGAD, Genetic Algorithms, Neural Networks, SGD, Gazebo, RViz, AMCL, R, Turtlebot2]
paper_url: https://doi.org/10.1109/LRA.2024.3518085
paper_venue: "IEEE Robotics and Automation Letters"
related_publications: sharafianardakani2024adaptive
---

Every teleoperation setup has to answer the same question: how should the axes of a hand-held input device map onto the degrees of freedom of a robot? When the mapping is intuitive, operators barely notice it. When it is not — an arbitrary $$M$$-dimensional device driving an $$N$$-DOF robot — they fight the interface, and no amount of practice fully fixes it.

This work refuses to model that relationship at all. **The device and the robot are treated as a black box:** $$M$$ input channels and $$N$$ output degrees of freedom, with no kinematic model of either and no assumption that any axis of the controller corresponds to anything in particular on the robot. That framing is exactly why a genetic algorithm fits — it never needs to differentiate through the mapping, only to score how well a candidate mapping performs the task. Swap in an unfamiliar controller and the same search still finds a usable interface. **The goal was to learn that mapping automatically, and to do it without trading away either speed or smoothness.** The result is PNNUI, the Parallel Neural Networks Adaptive User Interface.

{% include figure.liquid loading="eager" path="assets/img/pnnui/pnnui_architecture.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="PNNUI architecture: the user interface as an input-output map, and the parallel FCNN and JMNN networks feeding a robot twist command" caption="PNNUI architecture. Left: the interface treated as a learnable input–output map. Right: the two networks running in parallel — FCNN produces the twist command, JMNN corrects it online from measured jerk." %}

The core idea is to stop treating the interface as fixed gains and start treating it as a nonlinear map that two networks learn together. **FCNN** (fast-completion) learns the map offline and unsupervised: a genetic algorithm searches its 14 weights for the mapping that minimizes task-completion time, with each candidate chromosome evaluated by having a user actually drive the robot. **JMNN** (jerk-minimization) then runs online during teleoperation, trained by stochastic gradient descent against the robot's measured jerk, and continuously corrects FCNN's output to suppress abrupt motion. FCNN is trained once on a single generic user and reused; JMNN adapts live to whoever is holding the joystick — which is what removes the per-user retraining that our earlier genetic-algorithm interface required.

<div class="row">
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/pnnui/pnnui_fcnn.png" class="img-fluid rounded z-depth-1" zoomable=true alt="FCNN network diagram mapping joystick x, y, theta inputs through a hidden layer to linear and angular velocity" %}
  </div>
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/pnnui/pnnui_jmnn.png" class="img-fluid rounded z-depth-1" zoomable=true alt="JMNN network diagram mapping joystick inputs through two hidden layers to predicted linear and angular jerk" %}
  </div>
</div>
<div class="caption">The two networks. FCNN (left) maps the joystick's three axes through a single hidden layer to the robot's linear and angular velocity — 14 weights, optimized offline by a genetic algorithm. JMNN (right) predicts linear and angular jerk through two hidden layers and is trained online by SGD.</div>

Training FCNN this way means running the task over and over — every candidate chromosome is scored by an actual driving trial — so the training loop had to run largely unattended. I built the rig on the ROS navigation stack: I mapped the taped course, worked the runs out in Gazebo and RViz first, and used AMCL localization to auto-home the robot to its start pose after each trial. That turned a generation into a hands-off sequence of trials instead of a manual reset every time, and the algorithm converged in about an hour.

I evaluated the system on a Turtlebot2 differential-drive robot commanded from a three-axis joystick over ROS, and ran a 20-subject human study under IRB approval. FCNN was trained first in a taped corridor until the genetic algorithm converged; every subject then drove the same rectangular course from point A to point B under four conditions — PNNUI and FCNN-only, each with and without obstacles. I logged joystick input and odometry to rosbag, derived jerk as the second derivative of velocity, and analyzed the repeated-measures data with linear mixed-effects models in R.

{% include figure.liquid loading="lazy" path="assets/img/pnnui/pnnui_experiment_path.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Laboratory test course: a taped rectangular path marked A and B with an obstacle, driven by the Turtlebot2" caption="The test course. Each subject drove the Turtlebot2 from A to B along the taped rectangular path, with and without the obstacle in the loop." %}

<div class="row justify-content-center">
  <div class="col-md-6 mt-3 mt-md-0">
    {% include video.liquid path="assets/video/pnnui_demo.mp4" class="img-fluid rounded z-depth-1" controls=true muted=true poster="/assets/img/pnnui/pnnui_demo_poster.jpg" %}
  </div>
</div>
<div class="caption">A trial in progress — an operator drives the Turtlebot2 around the course through the learned interface.</div>

**Key results:**

- **Linear jerk was roughly halved** by adding the online network — mean 0.87 with PNNUI vs. 1.74 with FCNN alone on the obstacle-free course, and 0.95 vs. 1.76 with obstacles ($$\beta = 0.87$$ and $$0.89$$, both $$p < .001$$).
- **Angular jerk dropped by about 3×** — 2.60 vs. 8.51 without obstacles and 2.71 vs. 8.61 with them ($$\beta = 5.91$$ and $$6.02$$, both $$p < .001$$), with the model explaining 86% of the variance.
- **Task-completion time did not increase.** This is the result that matters: the smoothness was not bought with slower driving, which is the usual trade-off.
- Mean-squared error between actual and desired jerk was far lower under PNNUI, the quantitative stand-in for **transparency** — the operator feels like they are moving the robot directly rather than negotiating with it.
- The real-time network loop averaged **0.6 ms** per update and tolerated network delays up to **100 ms**, so the adaptation is cheap enough to leave running during teleoperation.

<div class="row">
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/pnnui/pnnui_linear_jerk.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Box plot of mean linear jerk across the four experimental conditions" %}
  </div>
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/pnnui/pnnui_angular_jerk.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Box plot of mean angular jerk across the four experimental conditions" %}
  </div>
</div>
<div class="caption">Mean linear (left) and angular (right) jerk across all 20 subjects for the four conditions. The two PNNUI conditions sit well below their FCNN-only counterparts, and the gap is larger in rotation than in translation.</div>

Because the cost function is abstract rather than tied to this particular joystick or robot, the same formulation carries over to other devices — an earlier version of this line of work learned a controllable interface from an electromyographic gesture armband on the same robot, which is the black-box premise paying off in practice. Full derivations, algorithms, and statistics are in the paper {% cite sharafianardakani2024adaptive %}.
