---
layout: page
title: "Parallel Neural Networks Adaptive User Interface for Robot Teleoperation"
description: "First-author IEEE Robotics and Automation Letters paper introducing PNNUI, a teleoperation interface built from two neural networks running in parallel — one trained offline by a genetic algorithm to reduce task time, one trained online to reduce motion jerk. Tested with 20 people."
img: assets/img/pnnui/pnnui_thumb.jpg
importance: 2
category: work
tech: [ROS Melodic, Python, PyGAD, Genetic Algorithms, Neural Networks, SGD, Gazebo, RViz, AMCL, R, Turtlebot2]
paper_url: https://doi.org/10.1109/LRA.2024.3518085
paper_venue: "IEEE Robotics and Automation Letters"
related_publications: sharafianardakani2024adaptive
---

Every teleoperation system has to decide how the axes of a hand-held device should move the robot. A joystick reports **M** values; the robot accepts **N** commands. When that mapping matches what the operator expects, driving feels natural. When it does not, the operator drives slowly and in short, sharp corrections.

The usual fix is to tune the mapping by hand for each device and each robot. **This work learns it instead.** The mapping is treated as an unknown function to be found by search, with no model of the device and no assumption that a given axis of the controller corresponds to anything in particular on the robot. Because the search only has to score how well a candidate mapping performs the task, it works just as well when the relationship between device and robot is not intuitive. The result is **PNNUI**, the Parallel Neural Networks Adaptive User Interface.

{% include figure.liquid loading="eager" path="assets/img/pnnui/pnnui_architecture.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="PNNUI architecture: the user interface as an input-output map, and the parallel FCNN and JMNN networks feeding a robot twist command" caption="PNNUI. Left: the interface seen as a map from input signals to actuator commands. Right: the two networks running side by side — FCNN produces the velocity command, JMNN adjusts it using the jerk measured on the robot." %}

Two networks run at the same time and each has one job.

**FCNN** (fast-completion) produces the velocity command. It is trained once, before use, by a genetic algorithm that searches for the mapping which completes the task in the least time. **JMNN** (jerk-minimization) runs during teleoperation. It predicts the jerk that the current command will produce and subtracts a small correction from FCNN's output, so sudden changes in motion are smoothed away as the person drives.

The split matters because the two goals need different training. Finding a usable mapping from scratch takes many full trials and cannot be done while someone is trying to work, so it happens offline and only once. Smoothing depends on the individual — how quickly a person moves the stick, how hard they correct — so it has to happen live. FCNN is trained once and then fixed; JMNN starts fresh for each new user and keeps learning while they drive.

<div class="row">
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/pnnui/pnnui_fcnn.png" class="img-fluid rounded z-depth-1" zoomable=true alt="FCNN network diagram mapping joystick x, y, theta inputs through a hidden layer to linear and angular velocity" %}
  </div>
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/pnnui/pnnui_jmnn.png" class="img-fluid rounded z-depth-1" zoomable=true alt="JMNN network diagram mapping joystick inputs through two hidden layers to predicted linear and angular jerk" %}
  </div>
</div>
<div class="caption">The two networks. FCNN (left) takes the joystick's three axes through one hidden layer of two neurons and outputs the robot's linear and angular velocity — 14 trainable values including biases. JMNN (right) takes the same three inputs through hidden layers of six and two neurons and predicts linear and angular jerk. Both use tanh activations.</div>

## Training FCNN with a genetic algorithm

A genetic algorithm suits this problem because it never needs a derivative of the mapping. It only needs a score for each candidate, and the score here is simply how long the task took: the number of 100 ms steps the robot needed to reach the goal.

Each candidate is a list of the 14 network values. One candidate is loaded, the user drives the robot from point A to point B along a taped corridor, and the time is recorded. If the robot leaves the corridor the trial is skipped and repeated with a new candidate, and failed trials are not used to update the population. Successful trials feed a population of 28 candidates, which is renewed each generation by roulette-wheel selection, single-point crossover, and random mutation of two of the 14 values. A candidate's score also carries a small penalty that grows with its age, so that one early success cannot dominate the search for many generations.

Running this by hand would mean walking the robot back to the start after every trial. Instead the corridor was mapped first and tried in Gazebo and RViz, and the **AMCL** package was used to send the robot back to its starting pose automatically once it reached the goal. Training then ran as a continuous sequence of trials. The search was run ten times, eight of which completed, and stopped when the spread across the population fell below a set threshold — about **one hour** in total. After that, the interface could drive the Turtlebot2 with no hand-tuning of joystick gains at all.

## Training JMNN while the robot is driven

JMNN reads the same three joystick axes and predicts the linear and angular jerk that will result. At the same time, the actual jerk is measured from the robot's odometry. The difference between the two is the training error, and stochastic gradient descent updates the weights on every time step to reduce it.

The target is not zero jerk but a small value, ±0.1, which keeps normal acceleration and deceleration available while removing abrupt changes. The predicted jerk is integrated once to get an acceleration and again to get a velocity change, and that velocity change is subtracted from FCNN's output before the command reaches the robot. The learning rate starts at 0.1 and is multiplied by 0.99 every three seconds, so the network settles instead of continuing to chase every new input.

## Testing with 20 people

Twenty people took part under University of Louisville IRB approval (no. 18.0659). They drove a Turtlebot2 with a Logitech Freedom 2.4 wireless joystick — three axes, each reporting −1 to 1, left at its default sensitivity — over ROS Melodic, with joystick input and odometry recorded to rosbag.

Each person drove the same rectangular course under four conditions: PNNUI and FCNN alone, each with and without an obstacle on the path. Before the PNNUI runs, each person first drove a short corridor so that JMNN saw movement in every direction. Jerk was calculated as the second derivative of velocity from the odometry, and the results were analysed with linear mixed-effects models in R, using a random intercept per person to account for repeated measurements.

{% include figure.liquid loading="lazy" path="assets/img/pnnui/pnnui_experiment_path.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Laboratory test course: a taped rectangular path marked A and B with an obstacle, driven by the Turtlebot2" caption="The test course. Each person drove the Turtlebot2 from A to B along the taped rectangular path, with and without the obstacle." %}

<div class="row justify-content-center">
  <div class="col-md-6 mt-3 mt-md-0">
    {% include video.liquid path="assets/video/pnnui_demo.mp4" class="img-fluid rounded z-depth-1" controls=true muted=true poster="/assets/img/pnnui/pnnui_demo_poster.jpg" %}
  </div>
</div>
<div class="caption">A trial in progress — an operator drives the Turtlebot2 around the course through the learned interface.</div>

## Results

| Condition                | Mean linear jerk | Mean angular jerk |
| ------------------------ | ---------------- | ----------------- |
| PNNUI, no obstacle       | **0.87**         | **2.60**          |
| FCNN only, no obstacle   | 1.74             | 8.51              |
| PNNUI, with obstacle     | **0.95**         | **2.71**          |
| FCNN only, with obstacle | 1.76             | 8.61              |

Adding the online network **halved linear jerk and cut angular jerk to about a third**. Both differences were significant with and without the obstacle (linear: β = 0.87 and 0.89; angular: β = 5.91 and 6.02; all p < .001). The obstacle itself made no significant difference to either measure, so the improvement holds whether or not the driver has to steer around something.

**Task time did not get worse.** This is the result that matters most, because smoothing a control signal usually costs speed. The difference in completion time between PNNUI and FCNN alone was not significant.

The error between actual and target jerk was also much lower with PNNUI — a median of 1.14 against 5.28 for linear jerk without the obstacle, and 10.5 against 143.9 for angular jerk. A smaller error here means the robot moves closer to how the operator intended, which is the practical meaning of a transparent interface.

The online network cost **0.6 ms per update** on average, small enough to leave running throughout teleoperation without slowing the response the operator feels.

<div class="row">
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/pnnui/pnnui_linear_jerk.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Box plot of mean linear jerk across the four experimental conditions" %}
  </div>
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/pnnui/pnnui_angular_jerk.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Box plot of mean angular jerk across the four experimental conditions" %}
  </div>
</div>
<div class="caption">Mean linear (left) and angular (right) jerk for all 20 people across the four conditions. Both PNNUI conditions sit well below the matching FCNN-only condition, and the gap is larger in rotation than in forward motion.</div>

Because the cost the genetic algorithm minimises is just task time, nothing in the method is tied to this joystick or this robot. The same procedure applies to any input device with a fixed number of channels and any robot with a fixed number of commands. Full equations, algorithms and statistics are in the paper {% cite sharafianardakani2024adaptive %}.
