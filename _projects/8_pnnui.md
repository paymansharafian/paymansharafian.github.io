---
layout: page
title: "Parallel Neural Networks Adaptive User Interface for Robot Teleoperation"
description: "First-author IEEE Robotics and Automation Letters paper introducing PNNUI, a teleoperation interface built from two parallel neural networks, one trained offline by a genetic algorithm to prioritize task completion time and one trained online to minimize motion jerk. Tested with 20 subjects."
img: assets/img/pnnui/pnnui_thumb.jpg
importance: 2
category: work
tech: [ROS Melodic, Python, PyGAD, Genetic Algorithms, Neural Networks, SGD, Gazebo, RViz, AMCL, R, Turtlebot2]
paper_url: https://doi.org/10.1109/LRA.2024.3518085
paper_venue: "IEEE Robotics and Automation Letters"
related_publications: sharafianardakani2024adaptive
---

The objective of this work is to optimize the mapping between human-generated control signals, reported by an M-dimensional input device, and the actuators of a remotely controlled robot, which has N output degrees of freedom.

A user interface receives signals from a controller device, such as a joystick, and generates actuator signals to control a mobile robot. That relationship can be written as $$v = g_a(u)$$, where $$u$$ is the input signal, $$v$$ is the output signal, and the parameter vector $$a$$ is unknown. This relationship may be intuitive or unintuitive, and our focus is on exploring unintuitive relationships, meaning the cases where the operator cannot simply be told which way to push the stick.

{% include figure.liquid loading="eager" path="assets/img/pnnui/pnnui_architecture.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="PNNUI architecture: the user interface as an input-output map, and the parallel FCNN and JMNN networks feeding a robot twist command" caption="a) The user interface defined as an input–output map. b) The parallel neural network architecture: FCNN generates the twist, and JMNN fine-tunes it using the actual jerk measured on the robot." %}

**PNNUI** adopts a two-parallel neural network architecture to learn the optimal UI map.

The first network is trained offline in an unsupervised manner and prioritizes task completion time, which reduces the learning curve and can be helpful for applications in which various users with different skills are involved. This **fast-completion neural network (FCNN)** generates a desired robot state, minimizing the initial learning time.

The second network, the **jerk-minimization neural network (JMNN)**, is trained online with user interaction data and the corresponding jerk values, and focuses on smooth control by minimizing the motion jerks. JMNN generates a control signal, fine-tunes the FCNN output, and guides the robot's state while suppressing abrupt movements.

Once FCNN is trained, its weights are fixed. JMNN then operates in parallel and online for each new user.

<div class="row">
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/pnnui/pnnui_fcnn.png" class="img-fluid rounded z-depth-1" zoomable=true alt="FCNN network diagram mapping joystick x, y, theta inputs through a hidden layer to linear and angular velocity" %}
  </div>
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/pnnui/pnnui_jmnn.png" class="img-fluid rounded z-depth-1" zoomable=true alt="JMNN network diagram mapping joystick inputs through two hidden layers to predicted linear and angular jerk" %}
  </div>
</div>
<div class="caption">FCNN (left) is a one-layer NN with two neurons in a single hidden layer and two outputs for the robot's linear and angular velocities. JMNN (right) has 3 inputs, two hidden layers with 6 and 2 neurons, plus two neurons in the output generating linear and angular jerk. All activation functions are the hyperbolic tangent.</div>

## FCNN optimization using a genetic algorithm

A genetic algorithm is one approach for finding optimal weights in a neural network in an unsupervised manner, and it fits here because the cost is a property of the completed task rather than something differentiable. The cost function to be minimized was time to complete the task, defined as the number of time steps, 100 ms each, required for the robot to reach the goal position.

Including biases, the parameter vector (chromosome length) was **14**, and the population size was set to twice that, at **28**. Fitness is calculated from an **adjusted cost**, which adds a penalty that grows with the age of a chromosome. This penalty was introduced to avoid one good chromosome permanently affecting the algorithm for many generations. Roulette Wheel Selection chooses pairs of chromosomes for crossover and mutation based on their fitness score; we used single-point crossover and random mutation of two genes out of the 14. The implementation used the PyGAD library.

Algorithm 1 provided a new NN weight vector for each trial, starting from a random initial condition. In this experiment, a single, generic user attempted to drive the robot from a fixed starting point A to a fixed goal point B while navigating along a taped corridor. If the robot deviated from the corridor, the trial was skipped and repeated with new NN weights, and populations were updated based only on successful trials.

Once the robot reached the goal, it was returned to the starting position for the next trial, and for this purpose we designed an auto-home using the **AMCL** package, after first mapping the corridor and working the runs out in Gazebo and RViz. The experiment was conducted ten times, with eight successful trials and two skipped, and the mean of component variance below 0.1 was used as the stop criterion. At the completion of this experiment, which took approximately **one hour**, the tuned interface allowed us to operate the Turtlebot2 using a joystick without guessing or pre-tuning the input device gains.

## JMNN optimization using stochastic gradient descent

JMNN receives the same **M** inputs as FCNN and generates predicted jerks. Simultaneously, we record the actual jerks from the robot, and the loss is the mean-square error between the two. The desired jerk was assumed to be between −0.1 and 0.1, corresponding to acceleration or deceleration.

Because the network trains during operation, the optimizer has to be fast, robust, and able to escape saddle points, which is why stochastic gradient descent was used rather than a heavier method. The learning rate was 0.1, decreased by multiplying it by 0.99 every 3 seconds to prevent overtraining as JMNN continuously updates its weights for new user inputs.

From the predicted jerk we derive a predicted acceleration, and from that a predicted velocity $$\Delta \hat{v}$$. Since $$\Delta \hat{v}$$ is employed to fine-tune the FCNN's output, we introduce the **adjusted velocity** $$\tilde{v}$$, calculated as the difference between $$v$$, the output of FCNN, and the predicted velocity:

$$
\tilde{v} = v - \Delta \hat{v}
$$

## Experiments with PNNUI

To demonstrate the effectiveness of the algorithm, we carried out experiments in our lab to compare the performance of PNNUI (FCNN + JMNN) with the FCNN algorithm alone, by quantifying the magnitude of the linear and angular jerks and the time required to complete the task.

A total of **20 subjects** were recruited, all at least 18 years old, under University of Louisville Institutional Review Board approval no. 18.0659. Each subject used a joystick to manipulate the robot along a particular rectangular path, with and without an obstacle. We utilized the Logitech Freedom 2.4 wireless joystick, offering three axes of control (x, y, and θ for angular rotation) and outputting values from −1 to 1 per axis; the default sensitivity settings were not changed. The robot was a Turtlebot2, a nonholonomic differential drive platform. ROS Melodic was used for communication and control, with Python 3 managing data, and all trials were collected from saved rosbag files.

A repeated measures design was used across four conditions: PNN+NOBS, FCNN+NOBS, PNN+OBS and FCNN+OBS. For the PNN experiments, the robot was first trained with the user's inputs in a short learning task by teleoperation through a short corridor, so that JMNN learned from all directions. To investigate the smoothness of the task, motion jerk was calculated from the odometry ROS topic; since the data is discrete, the actual jerk was calculated as the second derivative of velocity changes from the robot.

Linear mixed-effects models with a random intercept were used, because the data were collected in a repeated measures experiment design, with the random intercept over subject ID accounting for correlation between observations from the same subject. Analysis used the lme4, lmerTest and multcomp libraries in R.

<div style="text-align: center; margin: 1.25rem auto;">
{% include figure.liquid loading="lazy" path="assets/img/pnnui/pnnui_experiment_path.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Laboratory test path: a taped rectangular path marked A and B with an obstacle, driven by the Turtlebot2" caption="Experiment path, the same for both the PNN and FCNN tasks." max-width="700px" %}
</div>

<div class="row justify-content-center">
  <div class="col-md-5 mt-3 mt-md-0">
    <div class="video-embed video-embed-vertical z-depth-1">
      <iframe
        src="https://www.youtube.com/embed/5VMUEUGS8ds"
        title="PNNUI trial, driving the Turtlebot2 through the learned interface"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    </div>
  </div>
</div>
<div class="caption">A trial in progress, with an operator driving the Turtlebot2 around the path through the learned interface.</div>

## Results

| Task      | Mean linear jerk | Mean angular jerk |
| --------- | ---------------- | ----------------- |
| PNN+NOBS  | **0.87**         | **2.60**          |
| FCNN+NOBS | 1.74             | 8.51              |
| PNN+OBS   | **0.95**         | **2.71**          |
| FCNN+OBS  | 1.76             | 8.61              |

The median and mean linear and angular jerks using the PNN algorithm, in both the NOBS and OBS tasks, are considerably smaller than for the FCNN algorithm in the similar tasks. FCNN and PNN had statistically significant differences in both tasks for linear jerk (β = 0.87 and 0.89, both p < .001) and for angular jerk (β = 5.91 and 6.02, both p < .001, R² = 86%). The difference between the OBS and NOBS tasks was not significant for either measure.

However, we could not find any improvement in the time required to complete the task when either of the algorithms was used, and the time did not significantly increase either. These findings indicate that the PNNUI architecture enhanced smoothness without compromising task completion time.

To quantitatively assess transparency, we measured the error between the actual jerks and the desired jerk value. The mean square error served as the indicator, where lower MSE values indicate higher transparency. MSE was clearly lower in the tasks using PNNUI, with a median of 1.14 against 5.28 for linear jerk without the obstacle, and 10.46 against 143.90 for angular jerk.

Our real-time neural network loop measured an average compute time of **0.6 milliseconds**, and the system response time through the adaptive interface was largely the same as with the wireless joystick and fixed gains.

<div class="row">
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/pnnui/pnnui_linear_jerk.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Box plot of mean linear jerk across the four experimental conditions" %}
  </div>
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/pnnui/pnnui_angular_jerk.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Box plot of mean angular jerk across the four experimental conditions" %}
  </div>
</div>
<div class="caption">Mean linear (left) and angular (right) jerk for all 20 subjects across the four tasks. Both PNN conditions sit well below the matching FCNN-only condition, and the gap is larger in rotation than in forward motion.</div>

Because the cost metric depends only on the learned parameters, more generally any cost dependent on those parameters can be optimized, and the method is not tied to this particular joystick or this particular robot. Full equations, algorithms and statistics are in the paper {% cite sharafianardakani2024adaptive %}.
