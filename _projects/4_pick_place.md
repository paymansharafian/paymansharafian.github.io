---
layout: page
title: "ARNA Semi-Autonomous Pick Place"
description: "One click on one pixel, and the robot does the rest — FastSAM turns the click into an object mask, Contact-GraspNet proposes 6-DOF grasps, and a staged Cartesian sequence with a closed-loop re-grasp executes the pick while the safety layers stay live underneath."
img: assets/img/teleop/teleop_thumb_pick.jpg
importance: 5
category: work
tech: [ROS1, Python, PyTorch, FastSAM, Contact-GraspNet, PointNet++, Kinova Gen3, RGBD, TF2, CUDA]
---

Teleoperating a 7-DOF arm through a compressed video feed with a quarter-second of lag is miserable. The operator has no depth cues, no force feedback, and every correction they make arrives late. Asking them to servo a gripper onto a bottle that way is asking for a long, frustrating, error-prone approach to a task the robot could do itself in a few seconds. **So the operator's entire contribution is reduced to one click on one pixel** — which object — and everything after that is autonomous.

{% include figure.liquid loading="eager" path="assets/img/teleop/robot_41.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="ARNA's Kinova Gen3 arm extended toward a workbench in the lab" caption="ARNA's Kinova Gen3 with the wrist-mounted RGBD camera that both shows the operator the scene and supplies the depth the grasp network runs on." %}

This page covers the manipulation pipeline. It sits on top of the [browser interface]({{ '/projects/3_remote_ui/' | relative_url }}) the click comes from, and inside the [five-layer safety architecture]({{ '/projects/2_mpc_cbf/' | relative_url }}) that governs the robot while it runs.

## From a pixel to a grasp

The click arrives as a point in the wrist camera image, and four stages turn it into a pose the arm can reach for.

**FastSAM** segments the object. The small variant runs on CPU, taking the colour frame and the click point and returning the instance mask containing that point. Three post-processing steps clean it up: the largest contour is filled solid, killing holes and stray background blobs; the mask is resized back to full frame resolution; and a light Gaussian smooth softens the boundary so aliasing at the edge does not bias the point cloud extracted from it. The result is overlaid as a green contour on the operator's live feed, so they can see what the robot thinks they clicked.

**Contact-GraspNet** proposes the grasps. The masked region plus registered depth and camera intrinsics is unprojected into a segmented point cloud, and a PointNet++ encoder with a grasp-contact decoder returns a set of full SE(3) poses with confidence scores.

Replacing what came before it is the substantive change here. The earlier pipeline fitted a **cylinder** to the depth image and commanded a pre-computed approach angle from it. That works for bottles, cans and cups, and fails completely on anything flat, irregular or asymmetric — boxes, bags, tape dispensers, tools — with no grasp-quality score to tell you it was about to fail. It produced one deterministic answer whether or not that answer was any good. The learned model is shape-agnostic: trained across thousands of object categories, it proposes ranked grasps for convex and concave geometry alike.

Getting it onto the robot took some care, because the network was trained for a Panda gripper and runs on a 4 GB laptop GPU. The gripper mismatch is geometric and correctable — the Panda's fingertips sit about 85 mm ahead of its wrist and the Kinova Robotiq's are shorter, so the predicted wrist position is translated 90 mm forward along the grasp approach axis. The memory constraint needed more: inference is cropped to a bounding region around the clicked object rather than run over the full scene, which cuts input size by roughly 10× for small objects; gradients are disabled; and the model is warm-loaded once at node startup so weights stay resident across every pick instead of being allocated and freed each time, which is what fragments a small VRAM budget until it fails. The original full-scene implementation would not fit on this hardware at all.

## Choosing a grasp, and committing to it

Contact-GraspNet returns many candidates and some are unusable: it will happily propose grasps that approach from beneath the table, which the arm cannot execute without putting itself under the table. Each candidate's approach direction is rotated into the robot's base frame and any with an upward component is discarded outright.

The surviving grasps are then re-ranked **by how top-down they are, not by the network's confidence**. That is a deliberate substitution. A high-scoring grasp is one the network believes will hold; a top-down grasp is one this arm, at this height, at table level, can actually reach. Reachability is the binding constraint in practice, so it is what the sort key measures.

Execution is then **one-shot**: the pipeline commits to the single best candidate and does not fall through to the next one on failure. That sounds unnecessarily brittle and is the opposite — when the best grasp is out of reach, the lower-ranked ones almost always are too, so cycling through them mostly produces a slow sequence of failures instead of a fast one. Because the camera is on the wrist, the recovery that actually works is to move the robot: the arm returns home, and the operator drives a little closer and clicks again from a better viewpoint.

## Looking again before committing

Estimating a grasp once from the arm's starting pose and then executing it blind accumulates several centimetres of error — from Cartesian controller inaccuracy, from depth noise that is much worse at range, and from camera-to-tip calibration error amplified over distance.

So the pipeline looks again. Once the arm reaches the pre-grasp stand-off, the wrist camera is much closer to the object and in a different pose than when it first looked. After a 300 ms settle, the node re-fetches the current transform, reprojects the object's known 3-D position into the new image, and re-runs segmentation and grasp estimation from there — updating the target **position** with a much better view of it. If anything in that chain fails, the original estimate is kept and execution continues without interruption.

## Position-only, on purpose

Every move in the pick is position-only: the wrist orientation captured at the start is held fixed throughout, and Contact-GraspNet is used solely to decide _where_ to put the gripper.

That is a concession to the hardware rather than a simplification for its own sake. The Kinova Gen3's Cartesian controller rejects combined position-and-orientation goals for straight-down approaches at table height — a workspace constraint of the controller, separate from whether the arm can physically reach. Meanwhile the Robotiq 2F is an adaptive gripper that conforms as it closes, so it grasps reliably in the arm's natural approach orientation and orientation accuracy buys very little on table-top objects. Decoupling the motion into position-only stages solves one sub-problem at a time, which maximises IK success and keeps the executed trajectory predictable.

| Stage | Action                                        | Target                        |
| ----- | --------------------------------------------- | ----------------------------- |
| —     | Open gripper                                  | —                             |
| 0     | Rise above pre-grasp _(side approaches only)_ | 0.15 m above stand-off        |
| 1     | Move to pre-grasp stand-off                   | 150 mm behind the grasp point |
| —     | **Re-segment and re-estimate**                | updated grasp position        |
| 2     | Advance along the approach axis               | the grasp point               |
| 3     | Close gripper                                 | —                             |
| 3.5   | Lift straight up                              | vertical clearance            |
| 4     | Carry to home configuration                   | home joints                   |

Stage 0 only runs for non-top-down approaches, giving the planner a feasible descend-from-above path rather than a lateral swipe. A failure in stages 0–2 aborts cleanly to the start pose for the operator to retry; the lift is non-fatal; and on success the arm carries the object home rather than returning to the viewpoint it started from.

## Staying safe while it runs

The autonomous pick creates a coordination problem: two controllers now want the arm. The trajectory controller is executing a planned Cartesian path, and the arm safety filter exists to overwrite arm commands that look unsafe. Left alone they fight, and the result is worse than either.

The resolution is that **Layer 1 stands down for the duration of the pick** — the one filter whose actuator is under autonomous control — while Layers 0, 2, 3 and 4 stay live. The base is still filtered against obstacles, the network monitor still classifies the link, and the watchdog still governs the whole system and can still force a full stop. The robot never becomes unsupervised; one specific filter yields to a planner that already knows where the arm is going.

---

This pipeline is part of a larger remote-teleoperation system currently being prepared for publication. It has been exercised by 30 remote operators as the autonomy condition of a user study whose analysis is still being finalised, so no results from it are reported here yet.
