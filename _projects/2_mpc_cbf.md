---
layout: page
title: "Network-Aware MPC-CBF for Safe Remote Teleoperation of ARNA"
description: "A five-layer safety architecture that keeps hard guarantees when both the operator and the network are unreliable. Predictive MPC-CBF filters on the arm and the base, a watchdog that widens margins as the link degrades, and an authority layer that adapts to how hard the operator is fighting the filter — each validated on hardware."
img: assets/img/teleop/teleop_thumb_mpc.jpg
importance: 3
category: work
tech: [ROS1, Python, C++, OSQP, CasADi, MPC, Control Barrier Functions, LiDAR, Dynamic Reconfigure, Kinova Gen3]
---

Remote teleoperation of a nursing robot has two unreliable components, and they compound each other. The **operator** is not a trained roboticist, and even a trained one makes mistakes driving a robot they can only see through a camera — so safety cannot rest on operator skill. The **network** is worse: over a real internet link, latency is not an edge case, it is the normal condition. Commands arrive late, and sometimes they do not arrive at all. The robot still has to protect itself, its surroundings and anyone nearby while that is happening. **This project asks how to keep hard safety guarantees when both the human and the link are unreliable.**

{% include figure.liquid loading="eager" path="assets/img/teleop/teleop_layers.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Block diagram of the five-layer safety architecture split across the Legion laptop and the Blackbird base controller" caption="The architecture (the diagram labels the layers &quot;Phase&quot;). Layer 0 measures the link, Layer 3 turns that into a single safety mode for the whole system, Layers 1 and 2 filter every arm and base command, and Layer 4 adapts authority to the operator. The split down the middle is physical — arm-side layers run on the lab host, the base filter runs on the robot's own controller." %}

The answer is five layers, each with one job, and one rule that binds them: **the adaptive layers can only make the robot more cautious — never less safe.** Everything they touch is the tracking target in the optimiser's cost. The barrier constraints themselves are never relaxed, at any network state, for any operator.

This page covers the control architecture. The same system is described from two other angles: the [browser interface and the tunnel that carries it]({{ '/projects/3_remote_ui/' | relative_url }}) that operators actually drive from, and the [one-click semi-autonomous pick]({{ '/projects/4_pick_place/' | relative_url }}) that runs on top of it.

## Layer 0 — measuring the link

The browser pings over the WebSocket bridge every 100 ms. A ROS node keeps a rolling 300-sample (30 s) window and estimates one-way delay as **δ = P₉₉(RTT) / 2**, deliberately using the 99th percentile rather than the mean so that a burst of late packets is not averaged away by the good ones around it. That produces one of four states at 10 Hz:

| State    | Trigger                     |
| -------- | --------------------------- |
| NOMINAL  | δ < 80 ms **and** loss < 1% |
| DEGRADED | 80–200 ms **or** 1–5% loss  |
| POOR     | ≥ 200 ms **or** ≥ 5% loss   |
| FAILED   | nothing received for 500 ms |

## Layer 3 — one authority

Every layer downstream trusts that state, so exactly one node is allowed to act on it. The watchdog reads Layer 0 at 10 Hz and pushes a single safety mode to both filters through dynamic reconfigure: safety margins scale ×1.0, ×1.3 and ×1.8 as the link worsens, the arm's prediction horizon stretches, and λ<sub>network</sub> steps 0 → 0.3 → 0.6 → 1.0. Neither filter is permitted to decide for itself.

Three decisions in that design matter more than the thresholds:

- **Degrade fast, recover slowly.** A worse state applies immediately; returning to a better one requires a 3-second dwell. That asymmetry is what stops the mode chattering when the link sits on a threshold.
- **Two speeds of adaptation.** The watchdog sets the baseline margin at 10 Hz, but each filter adds its own jitter term locally at 50–100 Hz. Slow policy, fast reflex.
- **Delay buys prediction.** The arm's horizon _grows_ with measured delay rather than shrinking. More lag means the solver plans further ahead instead of reacting later.

If the link goes quiet for more than a second, the watchdog forces FAILED and floods both actuators with zero-velocity commands at 20 Hz. The robot stops on its own, with no operator involvement.

## Layers 1 and 2 — the safety filters

Both filters implement the same discrete-time barrier condition, **h(x<sub>k+1</sub>) ≥ (1 − γ)·h(x<sub>k</sub>)**, enforced not just now but at _every predicted step_ of the horizon. That is the difference between decelerating on a plan and slamming into a constraint boundary. Every operator command is replaced by the closest safe one; slack variables exist but carry a 10⁶ penalty, so relaxation is a genuine last resort rather than a routine escape hatch.

<div class="row">
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_workspace_box.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Diagram of a robot arm enclosed in a rectangular workspace box" %}
  </div>
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_lidar_sectors.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Diagram of the LiDAR split into eight sectors with the forward three highlighted" %}
  </div>
</div>
<div class="caption">Left: the arm's workspace box — six faces, each its own barrier function. Right: the base's LiDAR divided into eight sectors, of which only the forward 135° cone is armed, because the robot primarily drives forward and the rear sectors see its own body.</div>

The **arm filter** runs at 100 Hz against a 12-state Cartesian model with a 50 ms velocity lag, holding the end-effector inside a physical box, under a speed cap and under an acceleration cap, with jerk penalised as a soft cost. Its horizon is set by Layer 3 from the measured delay, 10 to 25 steps at 10 ms each. It runs during teleoperation and deliberately stands down during the autonomous pick, so the trajectory controller and the safety filter never fight over the same arm.

The **base filter** runs at 50 Hz on the robot's own controller, solving a 20-step horizon — 400 ms of predictive braking — over a three-state velocity-lag model, warm-started in OSQP so only the cost vectors change each tick. A sector arms when an obstacle enters 1.50 m and the robot is held off by 0.40 m, both widening automatically with measured RTT jitter.

## Layer 4 — adapting to the operator

The last layer asks a question the other four cannot: _how hard is this person fighting the filter?_ For each subsystem it computes the normalised intervention magnitude

$$
d_s = \frac{\lVert \mathbf{u}_{H,s} - \mathbf{u}_{R,s} \rVert}{\max\!\left(\lVert \mathbf{u}_{H,s} \rVert,\; v_{\mathrm{ref},s}\right)},
\qquad s \in \{\text{arm},\, \text{base}\}
$$

where **u<sub>H</sub>** is the raw operator command and **u<sub>R</sub>** the filtered safe reference. Arm and base are computed separately — they have different units and scales and must never be concatenated — and the larger of the two is taken, so whichever subsystem is being fought dominates while an idle one contributes nothing. The result is smoothed, mapped linearly to λ<sub>operator</sub> ∈ [0.1, 0.9], and multiplied by λ<sub>network</sub>.

The interesting part is what this replaced. The earlier design fitted **u<sub>H</sub> ≈ α·u<sub>R</sub>** and used the least-squares α as an alignment score. That formulation is degenerate: u<sub>R</sub> is itself a scaled, CBF-projected copy of u<sub>H</sub>, so the ratio saturates at 1 — analytically α ≡ 1 under orthogonal projection. It pinned the caution term at its floor _precisely when the operator was pushing into a constraint_, which is the one moment it was built for. Replacing the ratio with the intervention **difference** removes the degeneracy entirely.

## Validating each layer on its own

Before any of this went in front of a person, every layer was tested in isolation with injected inputs and known-answer checks.

{% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_network_classifier.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Injected round-trip-time trace above and the classifier's network state track below, showing exact correspondence" caption="Layer 0 against seven injected RTT and packet-loss conditions. The state track follows the injected RTT exactly; all seven were classified correctly." %}

**Layer 0** classified all seven injected conditions correctly. It detects an RTT step in 0.48 s against a 1 s requirement. Loss-driven transitions take 15–24 s, which sounds slow until you notice it is inherent rather than a defect — a loss _rate_ needs a long averaging window before it can be trusted — and the requirement was 35 s.

{% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_arm_validation.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Four-panel validation of the arm filter: solve time versus horizon, closest approach per workspace face, jerk cost raw versus filtered, and selected horizon versus network delay" caption="Layer 1, driven straight at every workspace face ten times per direction. Zero violations in sixty runs, jerk cost cut by two to three orders of magnitude, and — fourth panel — the horizon selected by Layer 3 tracking the delay-based prediction exactly." %}

**Layer 1** was driven straight at all six workspace faces, ten runs each: **zero boundary violations in sixty runs**. Filtered jerk cost came out roughly 200–440× lower than the raw operator input — abrupt joystick commands leaving the filter as gentle motion. Solve time grows with horizon, from 2.7 ms at N = 10 to a 59.6 ms mean at N = 25. The fourth panel is the one worth dwelling on because it is a _cross-layer_ result: the horizon actually selected tracks the delay-based prediction exactly, which is Layer 3 driving Layer 1 end to end rather than two components that merely pass their own tests.

<div class="row">
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_base_headon.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Distance-to-obstacle curves for four head-on approach speeds, each decelerating smoothly to a stable stand-off" %}
  </div>
  <div class="col-md-6 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_base_oblique.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Distance-to-obstacle curves for head-on and plus or minus forty-five degree approaches at the fastest speed" %}
  </div>
</div>
<div class="caption">Layer 2 driving at an obstacle. Left: four head-on speeds. Right: three approach angles at the fastest speed. The bench runs shown used a more conservative 0.5 m safety distance and 2.0 m activation than the deployed configuration.</div>

**Layer 2** braked predictively at every speed and angle tested, with zero margin violations. Two details make the case that it is planning rather than reacting. The stand-off _grows with speed_ — about 0.58 m at 0.05 m/s, about 1.0 m at the fastest approaches — because a longer effective lookahead buys room earlier, exactly when it is needed. And oblique approaches stop **earlier** than head-on ones, around 1.19 m against 1.0 m, because at ±45° the forward cone catches the obstacle across several sectors at once. The +45° and −45° curves lie almost on top of each other, so there is no left–right bias hiding in the sector logic.

{% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_watchdog.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Four stacked traces showing injected network state, resulting safety mode, lambda network, and epsilon margin multipliers moving together" caption="Layer 3 through a full mode lifecycle. Margins and λ move in lockstep with the mode, and the deliberate asymmetry is visible: degradation applies immediately, recovery waits out its dwell." %}

**Layer 3** tracked the injected state through every transition. The asymmetry is not just designed but measured: degradation is applied in about 100 ms against a 200 ms requirement across 60 transitions, while recovery consistently waits 3.0 s with a standard deviation of 0.05 — so the margins never chatter.

**Layer 4** was tested by injecting known operator/filter disagreements into the live node and checking its published output against the formulas: the alignment signal tracks 1 − D across the full range, λ<sub>operator</sub> follows its linear map, λ<sub>combined</sub> equals the product exactly, and the smoothing settles at the analytically predicted rate for every gain tested.

That test also earned its keep by finding a real bug. The idle reset did not work. On idle the node correctly zeroed the smoothed disagreement — but the very next tick recomputed the raw disagreement from the last _latched_ command, which was still non-zero, and the filter pulled it straight back up. The alignment signal never actually returned to 1 when the operator let go of the joystick. It is fixed, and there is now a regression test that would catch it coming back. That is the argument for module-level validation in a single example: the system looked fine end to end, and the bug was only visible when the layer was interrogated on its own terms.

---

A 30-operator human-subjects study has been run on this architecture, comparing manual teleoperation against the safety filters and against the full system with autonomy. That analysis is still being finalised, so no results from it are reported here yet.
