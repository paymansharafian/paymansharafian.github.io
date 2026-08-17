---
layout: page
title: "Network-Aware MPC-CBF for Safe Remote Teleoperation of ARNA"
description: "A five-layer safety architecture that keeps hard guarantees when both the operator and the connection are unreliable. Predictive MPC-CBF filters on the arm and the base, a watchdog that widens margins as the connection degrades, and an authority layer that adapts to the operator — each validated on hardware."
img: assets/img/teleop/teleop_thumb.jpg
importance: 3
category: work
paper_status: "In progress: Scheduled for IEEE Transactions on Robotics"
tech: [ROS1, Python, C++, OSQP, CasADi, MPC, Control Barrier Functions, LiDAR, Dynamic Reconfigure, Kinova Gen3]
---

The integration of Human-Robot Interaction (HRI) in healthcare has increased remarkably in recent years, driven by the need for efficient and adaptable robotic solutions. Aging populations, staff shortages, and the demand for better patient care increasingly challenge hospitals and other healthcare settings. A substantial portion of nursing time is consumed by non-clinical logistical tasks, such as fetching medical supplies or delivering items, and physical interaction with infectious patients (e.g., in isolation rooms) poses significant health risks to staff. Assistive robots such as our ARNA robot offer a promising solution, and remote teleoperation is how they can be deployed safely. Full autonomy is not the way to get there. A hospital ward is crowded, changes hour to hour, and is occupied by people who are frail and hard to predict; the cost of a wrong action is measured in harm rather than in a dropped object. **Teleoperation is the practical answer — a human supplies the judgement autonomy cannot yet be trusted with, and the robot supplies the legs.**

However, remote teleoperation introduces two unreliable components of its own, and they compound each other. The **operator** is not a trained roboticist, and even a trained one makes mistakes driving a robot they can only see through a camera, so safety cannot rest on operator skill. The **connection** is harder still: across a real internet path, latency is not an edge case but the normal condition. Commands arrive late, and sometimes they do not arrive at all — while the robot must go on protecting itself, its surroundings and anyone nearby. **This project asks how to keep hard safety guarantees when both the operator and the connection are unreliable.**

{% include figure.liquid loading="eager" path="assets/img/teleop/teleop_thumb.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Block diagram of the five-layer safety architecture split across the Legion laptop and the Blackbird base controller" caption="The architecture, labelled &quot;Phase&quot; in the diagram. Layer 0 measures the connection, Layer 3 turns that into a single safety mode for the whole system, Layers 1 and 2 filter every arm and base command, and Layer 4 adapts authority to the operator. The division down the middle is physical: arm-side layers run on the lab host, the base filter on the robot's own controller." %}

The architecture is five layers, each with one responsibility, bound by a single rule: **the adaptive layers can only make the robot more cautious, never less safe.** What they scale is the tracking target in the optimiser's cost. The barrier constraints themselves are never relaxed — at any network state, for any operator.

This page covers the control architecture. The same system is described from two other angles: the [browser interface and the tunnel that carries it]({{ '/projects/3_remote_ui/' | relative_url }}) operators drive from, and the [one-click semi-autonomous pick]({{ '/projects/4_pick_place/' | relative_url }}) that runs on top of it.

## Layer 0 — network monitoring

The browser pings over the WebSocket bridge every 100 ms. A ROS node holds a rolling 300-sample (30 s) window and estimates one-way delay as **δ = P₉₉(RTT) / 2** — the 99th percentile rather than the mean, so a burst of late packets is not averaged away by the good ones around it. That yields one of four states at 10 Hz:

| State    | Trigger                     |
| -------- | --------------------------- |
| NOMINAL  | δ < 80 ms **and** loss < 1% |
| DEGRADED | 80–200 ms **or** 1–5% loss  |
| POOR     | ≥ 200 ms **or** ≥ 5% loss   |
| FAILED   | nothing received for 500 ms |

## Layer 3 — a single authority

Everything downstream depends on that state, so exactly one node is allowed to act on it. The watchdog reads Layer 0 at 10 Hz and pushes one safety mode to both filters through dynamic reconfigure: safety margins scale ×1.0, ×1.3 and ×1.8 as the connection worsens, the arm's prediction horizon stretches, and λ<sub>network</sub> steps 0 → 0.3 → 0.6 → 1.0. Neither filter decides for itself.

Three design decisions matter more than the thresholds:

- **Degrade fast, recover slowly.** A worse state applies immediately; returning to a better one requires a 3-second dwell. That asymmetry keeps the mode from chattering when the connection sits on a threshold.
- **Two speeds of adaptation.** The watchdog sets the baseline margin at 10 Hz while each filter adds its own jitter term locally at 50–100 Hz — slow policy, fast reflex.
- **Delay buys prediction.** The arm's horizon _grows_ with measured delay rather than shrinking, so more lag means the solver plans further ahead instead of reacting later.

If the connection goes quiet for more than a second, the watchdog forces FAILED and floods both actuators with zero-velocity commands at 20 Hz. The robot stops on its own, with no operator involvement.

## Layers 1 and 2 — the safety filters

Both filters enforce the same discrete-time barrier condition, **h(x<sub>k+1</sub>) ≥ (1 − γ)·h(x<sub>k</sub>)**, at _every predicted step_ of the horizon rather than only at the current one. That is the difference between decelerating on a plan and arriving at a constraint boundary with no room left. Every operator command is replaced by the nearest safe one; slack variables exist but carry a 10⁶ penalty, making relaxation a genuine last resort rather than a routine escape hatch.

<div class="row">
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_workspace_box.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Diagram of a robot arm enclosed in a rectangular workspace box" %}
  </div>
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_lidar_sectors.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Diagram of the LiDAR split into eight sectors with the forward three highlighted" %}
  </div>
</div>
<div class="caption">Left: the arm's workspace box — six faces, each its own barrier function. Right: the base's LiDAR divided into eight sectors, of which only the forward 135° cone is armed, since the robot primarily drives forward and the rear sectors see its own body.</div>

The **arm filter** runs at 100 Hz against a 12-state Cartesian model with a 50 ms velocity lag, holding the end-effector inside a physical box under both a speed cap and an acceleration cap, with jerk penalised as a soft cost. Its horizon is set by Layer 3 from the measured delay, 10 to 25 steps at 10 ms each. It operates during teleoperation and stands down for the autonomous pick, so the trajectory controller and the safety filter never contend for the same arm.

The **base filter** runs at 50 Hz on the robot's own controller, solving a 20-step horizon — 400 ms of predictive braking — over a three-state velocity-lag model, warm-started in OSQP so only the cost vectors change each tick. A sector arms when an obstacle enters 1.50 m and the robot is held off by 0.40 m, both widening automatically with measured RTT jitter.

## Layer 4 — adapting to the operator

The final layer answers a question the other four cannot: _how hard is this operator working against the filter?_ For each subsystem it computes the normalised intervention magnitude

$$
d_s = \frac{\lVert \mathbf{u}_{H,s} - \mathbf{u}_{R,s} \rVert}{\max\!\left(\lVert \mathbf{u}_{H,s} \rVert,\; v_{\mathrm{ref},s}\right)},
\qquad s \in \{\text{arm},\, \text{base}\}
$$

where **u<sub>H</sub>** is the raw operator command and **u<sub>R</sub>** the filtered safe reference. Arm and base are evaluated separately, since their units and scales differ and must never be concatenated, and the larger of the two is taken — so whichever subsystem is being contested dominates while an idle one contributes nothing. The result is smoothed, mapped linearly onto λ<sub>operator</sub> ∈ [0.1, 0.9], and multiplied by λ<sub>network</sub> to give the combined authority term.

## Validating each layer independently

Before any of this was placed in front of an operator, every layer was tested in isolation with injected inputs and known-answer checks.

{% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_network_classifier.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Injected round-trip-time trace above and the classifier's network state track below, showing exact correspondence" caption="Layer 0 against seven injected RTT and packet-loss conditions. The state track follows the injected RTT exactly; all seven were classified correctly." %}

**Layer 0** classified all seven injected conditions correctly, detecting an RTT step in 0.48 s against a 1 s requirement. Loss-driven transitions take 15–24 s, which is inherent rather than a shortfall — a loss _rate_ needs a long averaging window before it can be trusted — and the requirement was 35 s.

{% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_arm_validation.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Four-panel validation of the arm filter: solve time versus horizon, closest approach per workspace face, jerk cost raw versus filtered, and selected horizon versus network delay" caption="Layer 1, driven straight at every workspace face ten times per direction: zero violations in sixty runs, jerk cost cut by two to three orders of magnitude, and — fourth panel — the horizon selected by Layer 3 tracking the delay-based prediction exactly." %}

**Layer 1** was driven straight at all six workspace faces, ten runs each: **zero boundary violations in sixty runs**. Filtered jerk cost came out roughly 200–440× lower than the raw operator input, turning abrupt joystick commands into gentle motion. Solve time grows with horizon, from 2.7 ms at N = 10 to a 59.6 ms mean at N = 25. The fourth panel is the one worth dwelling on, because it is a _cross-layer_ result: the horizon actually selected tracks the delay-based prediction exactly, showing Layer 3 driving Layer 1 end to end rather than two components that merely pass their own tests.

The same difference is easier to see than to read off a log scale:

<div class="row">
  <div class="col-md-6 mt-3 mt-md-0">
    {% include video.liquid cache_bust=true path="assets/video/mpc_arm_jerk_off.mp4" class="img-fluid rounded z-depth-1" controls=true muted=true loop=true poster="/assets/img/teleop/mpc_arm_jerk_off_poster.jpg" %}
  </div>
  <div class="col-md-6 mt-3 mt-md-0">
    {% include video.liquid cache_bust=true path="assets/video/mpc_arm_jerk_on.mp4" class="img-fluid rounded z-depth-1" controls=true muted=true loop=true poster="/assets/img/teleop/mpc_arm_jerk_on_poster.jpg" %}
  </div>
</div>
<div class="caption">The arm under the same abrupt operator input. Left, with the filter disabled, the command reaches the hardware unaltered and the arm executes it as a jolt. Right, with MPC-CBF active, the jerk term in the cost reshapes the same input into a smooth, continuous move.</div>

<div class="row justify-content-center">
  <div class="col-md-8 mt-3 mt-md-0">
    {% include video.liquid cache_bust=true path="assets/video/mpc_arm_workspace.mp4" class="img-fluid rounded z-depth-1" controls=true muted=true loop=true poster="/assets/img/teleop/mpc_arm_workspace_poster.jpg" %}
  </div>
</div>
<div class="caption">The workspace box enforced on hardware. The operator drives the end-effector straight at a face of the box; the filter decelerates it onto the boundary and holds it there instead of allowing it through.</div>

<div class="row">
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_base_headon.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Distance-to-obstacle curves for four head-on approach speeds, each decelerating smoothly to a stable stand-off" %}
  </div>
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_base_oblique.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Distance-to-obstacle curves for head-on and plus or minus forty-five degree approaches at the fastest speed" %}
  </div>
</div>
<div class="caption">Layer 2 driving at an obstacle. Left: four head-on speeds. Right: three approach angles at the fastest speed. The bench runs shown used a more conservative 0.5 m safety distance and 2.0 m activation than the deployed configuration.</div>

**Layer 2** braked predictively at every speed and angle tested, with zero margin violations. Two details show that it plans rather than reacts. The stand-off _grows with speed_ — about 0.58 m at 0.05 m/s, about 1.0 m at the fastest approaches — because a longer effective lookahead buys room earlier, precisely when it is needed. And oblique approaches stop **earlier** than head-on ones, around 1.19 m against 1.0 m, because at ±45° the forward cone catches the obstacle across several sectors at once. The +45° and −45° curves lie almost on top of each other, confirming no left–right bias in the sector logic.

<div class="row justify-content-center">
  <div class="col-md-5 mt-3 mt-md-0">
    {% include video.liquid cache_bust=true path="assets/video/mpc_base_obstacle.mp4" class="img-fluid rounded z-depth-1" controls=true muted=true loop=true poster="/assets/img/teleop/mpc_base_obstacle_poster.jpg" %}
  </div>
</div>
<div class="caption">Predictive obstacle avoidance on the base. The operator keeps commanding forward motion; the filter plans the deceleration ahead of the obstacle and settles the robot at its stand-off distance rather than braking at the last moment.</div>

<div class="row">
  <div class="col-md-6 mt-3 mt-md-0">
    {% include video.liquid cache_bust=true path="assets/video/mpc_base_jerk_off.mp4" class="img-fluid rounded z-depth-1" controls=true muted=true loop=true poster="/assets/img/teleop/mpc_base_jerk_off_poster.jpg" %}
  </div>
  <div class="col-md-6 mt-3 mt-md-0">
    {% include video.liquid cache_bust=true path="assets/video/mpc_base_jerk_on.mp4" class="img-fluid rounded z-depth-1" controls=true muted=true loop=true poster="/assets/img/teleop/mpc_base_jerk_on_poster.jpg" %}
  </div>
</div>
<div class="caption">The same comparison on the base. Left, unfiltered, the operator's speed changes pass straight to the wheels. Right, with the filter on, the receding-horizon solution smooths them into a continuous motion profile — the difference a user feels most when walking beside the robot.</div>

<div style="text-align: center; margin: 1.25rem auto;">
  {% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_watchdog.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Four stacked traces showing injected network state, resulting safety mode, lambda network, and epsilon margin multipliers moving together" caption="Layer 3 through a full mode lifecycle. Margins and λ move in lockstep with the mode, and the intended asymmetry is visible — degradation applies immediately, recovery waits out its dwell." max-width="700px" %}
</div>

**Layer 3** tracked the injected state through every transition. The asymmetry is not only designed but measured: degradation is applied in about 100 ms against a 200 ms requirement across 60 transitions, while recovery consistently waits 3.0 s with a standard deviation of 0.05, so the margins never chatter.

{% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_layer4_validation.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Three-panel Layer 4 validation: alignment tracking one minus D, the lambda mapping and network gating, and exponential-moving-average step responses for three smoothing gains" caption="Layer 4 checked against its own specification. Left: the alignment signal tracks 1 − D across the full injected range. Centre: λ operator follows its linear map and λ combined equals the product with λ network. Right: the smoothing settles at the analytically predicted rate for every gain tested." %}

**Layer 4** was verified by injecting known operator/filter disagreements into the live node and comparing its published output against the formulas — correctness, the gating law, and the dynamics of the smoothing filter, each confirmed independently.

## Evaluation with operators

With every layer verified independently, the complete architecture was evaluated with **30 remote operators** on an L-shaped course: drive out, pick up a bottle, return and release. Each operator completed the task under three conditions — manual teleoperation, manual with the safety filters and adaptive authority, and the full system including the autonomous pick — in a counterbalanced within-subjects design.

<div style="text-align: center; margin: 1.25rem auto;">
  {% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_course.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Laboratory floor marked with an L-shaped taped course and a labelled start and end point" caption="The evaluation course. Operators drove out along the L, collected the bottle, and returned to the start — none of them in the room with the robot." max-width="700px" %}
</div>

---

This work is being prepared for submission to **IEEE Transactions on Robotics**. Results from the operator study will be added here after publication.
