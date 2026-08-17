---
layout: page
title: "Remote Teleoperation Front-End Design with Secure Network Transport"
description: "A browser-based teleoperation front end for ARNA — no client software, no VPN. A Next.js GUI reaches the robot through an authenticated Cloudflare tunnel on three isolated WebSocket channels, and the same connection is measured continuously to tell the safety layers how much delay to expect."
img: assets/img/teleop/teleop_thumb_ui.jpg
importance: 4
category: work
paper_status: "In progress: Scheduled for IEEE Transactions on Robotics"
tech: [ROS1, Next.js, JavaScript, WebSockets, rosbridge, Cloudflare Tunnel, Python, Image Compression]
---

Remote operation is only practical if the operator can begin immediately. A nurse working from another building — or another state — cannot reasonably be asked to install client software, obtain a VPN profile, or wait for a firewall exception. The interface therefore has to be a URL they open, authenticate against, and drive. That constraint shapes the entire design: **everything the operator needs travels over ordinary web protocols, and the robot exposes no inbound port to the internet.**

<div class="row justify-content-center">
  <div class="col-md-8 mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/teleop/teleop_ui_full.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="The ARNA control interface: arm and base camera views with a Run Pick button, speed control, position control with plane tabs and a Z-axis slider, gripper control, base joysticks and wrist rotation sliders" %}
  </div>
</div>
<div class="caption">The operator's whole world: camera feeds and the one-click pick trigger, arm position control with selectable plane, base driving joysticks, and gripper and wrist controls. Everything shown here crosses the public internet.</div>

The operator opens a Next.js application in a normal browser and authenticates by identity — single sign-on or an emailed code — rather than by shared credentials. From there, a **Cloudflare tunnel** carries the session. The important property is directional: the lab runs an outbound tunnel client, so there is no port forwarding, no inbound firewall exception, and no VPN for the operator to configure.

{% include video.liquid preload="metadata" path="assets/video/gui_overview_v2.mp4" class="img-fluid rounded z-depth-1" controls=true muted=true poster="/assets/img/teleop/gui_overview_poster.jpg" %}

<div class="caption">A full session from the operator's side: identity authentication through Cloudflare Access, then live camera feeds, base driving, arm control and the gripper — all over the tunnel.</div>

{% include figure.liquid loading="lazy" path="assets/img/teleop/teleop_network_arch.jpg" class="img-fluid rounded z-depth-1" zoomable=true alt="Network diagram showing the remote operator PC connecting through Cloudflare to the lab host and the ARNA robot" caption="Remote site to lab. The tunnel client dials out from the lab, so the robot never exposes an inbound port. Control and the two camera feeds ride separate WebSocket channels rather than sharing one." %}

## Three channels, not one

Control traffic and video traffic have opposite requirements. Video is bulk, continuous and tolerant of loss; control is small, frequent and latency-critical. Carrying both on one WebSocket exposes the control path to **head-of-line blocking** — under load, a 30 KB camera frame queued just ahead of a 50-byte joystick command delays that command by the full frame transmission time, stalling control behind traffic that could safely have waited.

The session therefore runs on three independent rosbridge instances, isolated at the OS socket level:

| Channel       | Port | Traffic                                  |
| ------------- | ---- | ---------------------------------------- |
| Control plane | 9090 | Joystick, services, gripper, pick topics |
| Base camera   | 9091 | Compressed base RGB stream               |
| Arm camera    | 9092 | Compressed wrist stream                  |

The browser opens three separate clients, so camera bursts on 9091 and 9092 physically cannot block the TCP send queue of 9090. The control channel always has bandwidth. Video and control now degrade independently, which is the right failure mode — a stuttering picture is recoverable, a stalled stop command is not.

## Compressing the video path

Raw frames are not viable over a tunnel. A single uncompressed 640 × 480 image is around 900 KB; at even 5 FPS that is a ~36 Mbps stream, beyond both the tunnel and rosbridge's own serialization.

Compression is applied at both ends of the wire. At the source, the wrist frame is halved in each dimension and JPEG-encoded at quality 30, taking a ~900 KB frame down to 15–25 KB, while the base camera compresses in the driver at quality 25 with the depth, IR and depth-registration pipelines switched off entirely — nothing but RGB is needed for the operator's view. In the browser, subscriptions request **CBOR** rather than rosbridge's default base64, which would otherwise add 33% to every frame, and the raw bytes are wrapped in a Blob and handed to `URL.createObjectURL`, keeping a base64 decode out of the per-frame render path. Frame rates are throttled per stream according to their role — the wrist camera at 30 FPS as the grasping view, the base camera at 12.5 FPS as the driving view. Together these measures give roughly a **35–40× reduction in per-frame data volume**.

On the lab side, a Legion host runs the ROS master, the rosbridge instances and the compression node; the robot runs its Blackbird base controller on the local network.

## Measuring the connection where the commands travel

The transport does double duty. The browser pings over the control WebSocket every 100 ms, and those round-trip times are published into ROS as a first-class topic.

That single stream is what the entire [safety architecture]({{ '/projects/2_mpc_cbf/' | relative_url }}) runs on: it classifies the connection into four states, and from there the watchdog widens the arm and base safety margins, stretches the predictive horizon, and reduces how closely the filters track the operator's command. The interface is therefore not merely a client of the safety system but the source of the measurement it depends on — and because that measurement is taken on the same socket that carries the commands, it reflects the delay those commands actually experience rather than a synthetic probe over a different route.

## Driven from across the country

The interface has been used by **30 operators**, all of them genuinely remote — some elsewhere in Louisville, some in other cities around the country. Every command in every trial crossed the public internet, so the latency the safety layers compensate for is real rather than simulated.

Related pages: the [five-layer safety architecture]({{ '/projects/2_mpc_cbf/' | relative_url }}) that filters every command this interface sends, and the [one-click semi-autonomous pick]({{ '/projects/4_pick_place/' | relative_url }}) reached from the button under the camera view.

---

This work is being prepared for submission to **IEEE Transactions on Robotics**. Results from the 30-operator study will be added here after publication.
