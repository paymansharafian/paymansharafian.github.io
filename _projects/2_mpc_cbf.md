---
layout: page
title: "Network-Aware MPC-CBF for Safe Remote Teleoperation of ARNA"
description: "A five-layer safety architecture that keeps the robot inside its safety constraints when both the operator and the connection are unreliable. Predictive MPC-CBF filters on the arm and the base, a watchdog that widens margins as the connection degrades, and an authority layer that adapts to the operator only when the network degrades, each validated on hardware and with 30 remote operators."
img: assets/img/teleop/teleop_thumb.jpg
importance: 3
category: work
paper_status: "In progress: Scheduled for IEEE Transactions on Robotics"
tech: [ROS1, Python, C++, OSQP, CasADi, MPC, Control Barrier Functions, LiDAR, Dynamic Reconfigure, Kinova Gen3]
---

The integration of Human-Robot Interaction (HRI) in healthcare has grown in recent years, driven by the need for efficient and adaptable robotic solutions. Hospitals and other healthcare settings face aging populations and staff shortages while being asked to improve patient care. A substantial portion of nursing time is consumed by non-clinical logistical tasks, such as fetching medical supplies or delivering items, and physical interaction with infectious patients (e.g., in isolation rooms) poses significant health risks to staff. Assistive robots such as our ARNA robot can help, and remote teleoperation is how they can be deployed safely. Full autonomy is not the way to get there. A hospital ward is crowded and changes hour to hour, and the people in it are frail and hard to predict. A wrong action there can injure someone. Teleoperation keeps a person in charge of those judgements while the robot does the physical work.

However, remote teleoperation introduces two unreliable components of its own, and they compound each other. The operator is not a trained roboticist, and even a trained one makes mistakes driving a robot they can only see through a camera, so safety cannot rest on operator skill. The connection is the harder problem. Across a real internet path, latency is not constant. Commands arrive late, and sometimes they do not arrive at all, while the robot still has to protect itself and its surroundings, including anyone nearby. This project asks how to keep hard safety guarantees when both the operator and the connection are unreliable.

{% include figure.liquid loading="eager" path="assets/img/teleop/teleop_thumb.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Architecture of the system: the operator's browser, the Cloudflare tunnel, and the five layers split across the lab workstation and the robot's two onboard computers" caption="The architecture. The operator's browser reaches the lab through an outbound-only Cloudflare tunnel. Layer 0 measures the connection, Layer 3 turns that into a single safety mode for the whole system, Layers 1 and 2 filter every arm and base command, and Layer 4 adapts authority to the operator. The arm-side layers and the pick pipeline run on the lab workstation, and the base filter runs on the robot's real-time computer." %}

The architecture is five layers, each with one responsibility. The adaptive layers can only make the robot more cautious, never less safe. What they scale is the tracking target in the optimiser's cost, and the barrier constraints are never relaxed for any network state or any operator.

This page covers the control architecture. The same system is described from two other angles, the [browser interface and the tunnel that carries it]({{ '/projects/3_remote_ui/' | relative_url }}) that operators drive from, and the [one-click semi-autonomous pick]({{ '/projects/4_pick_place/' | relative_url }}) that runs on top of it.

## Layer 0: network monitoring

The browser pings over the WebSocket bridge every 100 ms. A ROS node holds a rolling 300-sample (30 s) window and takes three numbers from it: the tail one-way delay Δ<sub>max</sub> = P₉₉(RTT) / 2, the standard deviation σ<sub>RTT</sub> of the round trip, and the fraction of probes whose echo never came back. Using the 99th percentile rather than the mean means a burst of late packets is not averaged away by the good ones around it. Delay and probe loss together yield one of four states at 10 Hz.

| State    | Trigger                                   |
| -------- | ----------------------------------------- |
| NOMINAL  | Δ<sub>max</sub> < 80 ms **and** loss < 1% |
| DEGRADED | neither NOMINAL nor POOR                  |
| POOR     | Δ<sub>max</sub> ≥ 200 ms **or** loss ≥ 5% |
| FAILED   | no probe returned for 500 ms              |

## Layer 3: a single authority

Everything downstream depends on that state, so exactly one node is allowed to act on it. The watchdog reads Layer 0 at 10 Hz and pushes one safety mode to both filters through dynamic reconfigure. Safety margins scale ×1.0, ×1.3 and ×1.8 as the connection worsens and hold at ×1.8 once it fails, the arm's prediction horizon stretches, and λ<sub>network</sub> steps 0 → 0.3 → 0.6 → 1.0. Neither filter decides for itself.

A worse network state applies immediately, but returning to a better one requires a 3-second dwell, which keeps the mode from chattering when the connection sits on a threshold. The watchdog sets the mode multiplier m<sub>q</sub> at 10 Hz, and each filter adds its own jitter term locally at 50 to 100 Hz, so every margin follows

$$
\varepsilon = m_q\,\varepsilon_0 + \kappa\,\sigma_{\mathrm{RTT}}
$$

where ε<sub>0</sub> is the baseline margin and κ its sensitivity to jitter. The arm's horizon also grows with measured delay rather than shrinking, N = clip(⌈Δ<sub>max</sub> / Δt⌉, N<sub>min</sub>, N<sub>max</sub>), so the filter always predicts at least as far ahead as a command can be stale. Both laws are design rules that make the filters more cautious as the operator's view of the scene gets older, not bounds derived from the delay.

If no probe returns for 500 ms, or the Layer 0 estimate itself stops for 1.0 s, the watchdog forces FAILED and floods both filters with zero-velocity commands at 20 Hz. The robot stops on its own, with no operator involvement.

## Layers 1 and 2: the safety filters

Both filters enforce a barrier condition at _every predicted step_ of the horizon rather than only at the current one. The arm uses the discrete-time form h(x<sub>k+1</sub>) ≥ (1 − γ)·h(x<sub>k</sub>), and the base uses the velocity form n<sub>s</sub><sup>⊤</sup>ν<sub>k</sub> ≤ γ<sub>b</sub>·h<sub>s</sub> for each LiDAR sector s, where h<sub>s</sub> is the sector's distance beyond its safety margin. This lets the robot decelerate on a plan instead of arriving at a constraint boundary with no room left. Every operator command is replaced by the closest safe one the tracking cost can reach. Slack variables exist but carry heavy penalties, 10⁶ on the workspace and obstacle constraints and 10⁵ and 10⁴ on the arm's speed and acceleration limits, so the solver only relaxes a constraint when there is no feasible alternative.

<div class="row">
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_workspace_box.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Diagram of a robot arm enclosed in a rectangular workspace box" %}
  </div>
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_lidar_sectors.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Diagram of the LiDAR split into eight sectors with the forward three highlighted" %}
  </div>
</div>
<div class="caption">Left, the arm's workspace box, six faces with each its own barrier function. Right, the base's LiDAR divided into eight sectors, of which only the forward 135° cone is armed, since the LiDAR sits at the front of the base and the other sectors see the robot's own body. Sonars and bumpers around the base cover the rest.</div>

The **arm filter** runs at 100 Hz against a 12-state Cartesian model with a 50 ms velocity lag, holding the end-effector inside a physical box under both a speed cap and an acceleration cap, with jerk penalised as a soft cost. Its horizon is computed from the measured delay and clipped to bounds Layer 3 sets per network mode, 10 to 25 steps at 10 ms each. It operates during teleoperation and stands down for the autonomous pick, so the trajectory controller and the safety filter never contend for the same arm.

The **base filter** runs at 50 Hz on the robot's own controller, solving a 20-step (400 ms) horizon over a three-state velocity-lag model. It is warm-started in OSQP so only the cost and bound vectors change each tick and the factored KKT matrix is reused. A sector arms when an obstacle enters a fixed 1.50 m, and the robot is held off by 0.40 m, a margin that widens automatically with measured RTT jitter. The sector distance is held at its latest scan over the horizon, so the horizon accounts for the velocity lag and the command smoothing rather than for the approach itself. The early slowdown comes from the barrier, which caps the closing speed in proportion to the remaining distance, about 0.07 m/s when an obstacle first enters 1.50 m.

## Layer 4: adapting to the operator

Layer 4 continuously estimates how much the operator is fighting the safety filter and uses it to scale extra caution. For each subsystem it computes the normalised intervention magnitude

$$
d_j = \frac{\lVert \mathbf{u}_{H,j} - \mathbf{u}_{R,j} \rVert}{\max\!\left(\lVert \mathbf{u}_{H,j} \rVert,\; v_{\mathrm{ref},j}\right)},
\qquad j \in \{\text{arm},\, \text{base}\}
$$

where u<sub>H</sub> is the raw operator command and u<sub>R</sub> the filtered safe reference. Arm and base are evaluated separately, since their units and scales differ and must never be concatenated, and the larger of the two is taken, so whichever subsystem is being contested dominates while an idle one contributes nothing. The result is smoothed, mapped linearly onto λ<sub>operator</sub> ∈ [0.1, 0.9], and multiplied by λ<sub>network</sub> to give the combined authority term, which scales the command both filters track.

$$
\lambda_{\mathrm{combined}} = \lambda_{\mathrm{network}}\,\lambda_{\mathrm{operator}},
\qquad
\tilde{\mathbf{u}}_H = \left(1 - \lambda_{\mathrm{combined}}\right)\mathbf{u}_H
$$

Because λ<sub>network</sub> = 0 on a NOMINAL connection, an operator on a good network keeps full authority, however hard they push against the filter. λ<sub>combined</sub> enters only the tracking target in the cost and never the constraints, so it cannot make the robot less safe, and the paper shows that, under stated assumptions, this authority loop converges to a unique fixed point.

## Validating each layer independently

Before any of this was placed in front of an operator, every layer was tested in isolation with injected inputs and known-answer checks.

{% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_network_classifier.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Injected round-trip-time trace above and the classifier's network state track below, showing exact correspondence" caption="Layer 0 against seven injected RTT and packet-loss conditions. The state track follows the injected RTT exactly, and all seven were classified correctly." %}

**Layer 0** classified all seven injected conditions correctly and detected an RTT step in 0.48 s against a 1 s requirement. Loss-driven transitions take 15 to 24 s against a 35 s requirement. That delay is inherent, because a loss _rate_ needs a long averaging window before it can be trusted.

{% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_arm_validation.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Box plot of the arm filter's solve time against its prediction horizon N, with the 10 ms control period marked" caption="Solve time of the arm filter against its horizon over 5000 cycles each, with the median labelled. At the nominal horizon of 10 steps no solve exceeded the 10 ms control period." %}

**Layer 1** was driven straight at all six workspace faces, ten runs each, with **zero boundary violations in sixty runs**. Filtered jerk cost came out 220 to 440 times lower than the raw operator input, turning abrupt joystick commands into gentle motion. Median solve time grows with the horizon, from 4.3 ms at N = 10 to 21.4 ms at N = 25. The longer horizons are only selected outside NOMINAL, and there the update rate falls gradually rather than failing, to about 44 Hz at N = 25. At the 0.4 m/s speed limit, holding a command that long moves the end effector about 1 cm farther than the model predicts, which stays inside the workspace margin of at least 2 cm. Across ten injected delays, the horizon actually selected matched the delay law every time, which shows Layer 0's delay estimate and Layer 3's mode bounds reaching Layer 1 in the running system rather than each component passing its own test in isolation.

<div class="row">
  <div class="col-md-6 mt-3 mt-md-0">
    {% include video.liquid preload="metadata" path="assets/video/mpc_arm_jerk_off.mp4" class="img-fluid rounded z-depth-1" controls=true muted=true loop=true poster="/assets/img/teleop/mpc_arm_jerk_off_poster.jpg" %}
  </div>
  <div class="col-md-6 mt-3 mt-md-0">
    {% include video.liquid preload="metadata" path="assets/video/mpc_arm_jerk_on.mp4" class="img-fluid rounded z-depth-1" controls=true muted=true loop=true poster="/assets/img/teleop/mpc_arm_jerk_on_poster.jpg" %}
  </div>
</div>
<div class="caption">The arm under the same abrupt operator input. Left, with the filter disabled, the command reaches the hardware unaltered and the arm executes it as a jolt. Right, with MPC-CBF active, the jerk term in the cost reshapes the same input into a smooth, continuous move.</div>

<div class="row justify-content-center">
  <div class="col-md-8 mt-3 mt-md-0">
    {% include video.liquid preload="metadata" path="assets/video/mpc_arm_workspace.mp4" class="img-fluid rounded z-depth-1" controls=true muted=true loop=true poster="/assets/img/teleop/mpc_arm_workspace_poster.jpg" %}
  </div>
</div>
<div class="caption">The workspace box enforced on hardware. The operator drives the end-effector straight at a face of the box, and the filter decelerates it onto the boundary and holds it there instead of allowing it through.</div>

<div class="row">
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_base_headon.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Distance-to-obstacle curves for four commanded head-on speeds, each settling at a stable stand-off above the safety distance" %}
  </div>
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_base_oblique.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Distance-to-obstacle curves for head-on and plus or minus forty-five degree approaches at the fastest speed" %}
  </div>
</div>
<div class="caption">Layer 2 driving at an obstacle with the deployed 0.40 m safety distance and 1.50 m activation, mean and spread of three runs. Left (a), four commanded speeds head-on. Right (b), three approach angles at a commanded 0.20 m/s.</div>

**Layer 2** stopped the base without contact in all 36 runs, never closer than 0.49 m. The wheels apply velocity commands open loop, so the base actually approached at 0.20 to 0.29 m/s in every run, and the speed in the legend is the command Layer 2 received. Commands of 0.10 to 0.20 m/s were limited as soon as the obstacle entered 1.50 m, while 0.05 m/s passed unmodified to about 1.2 m. The stand-off grew with the command, from 0.78 m at 0.05 m/s to 1.27 m at 0.20 m/s, because the filter tracks the command at every step of its horizon and a larger command pulls the first input further below the barrier's bound. At 0.20 m/s the base first reached 1.07 m, then reversed briefly to its stand-off. The three armed sectors also cover oblique approaches, which stopped at 1.23 m for +45° and 1.06 m for −45°.

<div class="row justify-content-center">
  <div class="col-md-5 mt-3 mt-md-0">
    {% include video.liquid preload="metadata" path="assets/video/mpc_base_obstacle.mp4" class="img-fluid rounded z-depth-1" controls=true muted=true loop=true poster="/assets/img/teleop/mpc_base_obstacle_poster.jpg" %}
  </div>
</div>
<div class="caption">Obstacle avoidance on the base. The operator keeps commanding forward motion, and the barrier caps the closing speed in proportion to the remaining distance, so the base slows progressively and settles at its stand-off rather than braking at the last moment.</div>

<div class="row">
  <div class="col-md-6 mt-3 mt-md-0">
    {% include video.liquid preload="metadata" path="assets/video/mpc_base_jerk_off.mp4" class="img-fluid rounded z-depth-1" controls=true muted=true loop=true poster="/assets/img/teleop/mpc_base_jerk_off_poster.jpg" %}
  </div>
  <div class="col-md-6 mt-3 mt-md-0">
    {% include video.liquid preload="metadata" path="assets/video/mpc_base_jerk_on.mp4" class="img-fluid rounded z-depth-1" controls=true muted=true loop=true poster="/assets/img/teleop/mpc_base_jerk_on_poster.jpg" %}
  </div>
</div>
<div class="caption">The same comparison on the base. Left, unfiltered, the operator's speed changes pass straight to the wheels. Right, with the filter on, the receding-horizon solution smooths them into a continuous motion profile.</div>

<div style="text-align: center; margin: 1.25rem auto;">
  {% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_watchdog.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Four stacked traces showing injected network state, resulting safety mode, lambda network, and epsilon margin multipliers moving together" caption="Layer 3 through a full mode lifecycle. Margins and λ move in lockstep with the mode, and the intended asymmetry is visible. Degradation applies immediately, and recovery waits out its dwell." max-width="700px" %}
</div>

**Layer 3** tracked the injected state through every transition. The asymmetry was measured. Degradation is applied in 98.8 ± 7.6 ms against a 200 ms requirement across 60 transitions, and recovery waits 3.06 ± 0.05 s, so the margins never chatter.

{% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_layer4_validation.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Three-panel Layer 4 validation: alignment tracking one minus D, the lambda mapping and network gating, and exponential-moving-average step responses for three smoothing gains" caption="Layer 4 checked against its own specification. On the left the alignment signal tracks 1 − D across the full injected range. In the centre λ operator follows its linear map and λ combined equals the product with λ network. On the right the smoothing settles at the analytically predicted rate for every gain tested." %}

**Layer 4** was verified by injecting known operator/filter disagreements into the live node and comparing its published output against the formulas. The alignment signal, the gating law, and the dynamics of the smoothing filter were each confirmed independently.

## Evaluation with operators

With every layer verified independently, the complete architecture was evaluated with **30 remote operators** on an L-shaped course. The task was to drive out, pick up a can from a chair, and return to drop it. Each operator completed it under three conditions in a counterbalanced within-subjects design. The conditions were manual teleoperation, manual with the safety filters and adaptive authority, and the full system including the autonomous pick.

<div style="text-align: center; margin: 1.25rem auto;">
  {% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_course.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Laboratory floor marked with an L-shaped taped course and a labelled start and end point" caption="The evaluation course. Operators drove out along the L, collected the can, and returned to the start. None of them were in the room with the robot." max-width="700px" %}
</div>

The connection was outside NOMINAL for nearly a third of the operating time, and 24 of the 30 operators saw it degrade, even though the median round trip stayed below 50 ms. Under those conditions the safety filters halved base jerk and raised the minimum clearance to obstacles from 0.66 to 0.72 m without slowing the operators. Workload (raw NASA-TLX, 0 to 100) fell from 22.4 with manual control to 16.5 with the filters and 10.1 with the full system. Layer 4 engaged in every degraded trial but stayed small, with a median gain of 0.056, so operators whose commands agreed with the filters kept nearly full authority. The study compared the filters on and off. It did not compare network-aware margins against fixed ones, and that comparison is planned next.

---

This work is being prepared for submission to **IEEE Transactions on Robotics**.
