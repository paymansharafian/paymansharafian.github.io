// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-home",
    title: "Home",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-about",
          title: "About",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/about/";
          },
        },{id: "nav-projects",
          title: "Projects",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-publications",
          title: "Publications",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-cv",
          title: "CV",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "post-google-gemini-updates-flash-1-5-gemma-2-and-project-astra",
        
          title: 'Google Gemini updates: Flash 1.5, Gemma 2 and Project Astra <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "We’re sharing updates across our Gemini family of models and a glimpse of Project Astra, our vision for the future of AI assistants.",
        section: "Posts",
        handler: () => {
          
            window.open("https://blog.google/technology/ai/google-gemini-update-flash-ai-assistant-io-2024/", "_blank");
          
        },
      },{id: "post-displaying-external-posts-on-your-al-folio-blog",
        
          title: 'Displaying External Posts on Your al-folio Blog <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.open("https://medium.com/@al-folio/displaying-external-posts-on-your-al-folio-blog-b60a1d241a0a?source=rss-17feae71c3c4------2", "_blank");
          
        },
      },{id: "books-the-godfather",
          title: 'The Godfather',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/the_godfather/";
            },},{id: "news-a-simple-inline-announcement",
          title: 'A simple inline announcement.',
          description: "",
          section: "News",},{id: "news-a-long-announcement-with-details",
          title: 'A long announcement with details',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/announcement_2/";
            },},{id: "news-a-simple-inline-announcement-with-markdown-emoji-sparkles-smile",
          title: 'A simple inline announcement with Markdown emoji! :sparkles: :smile:',
          description: "",
          section: "News",},{id: "projects-perceived-usefulness-of-robotic-technology-for-patient-fall-prevention",
          title: 'Perceived Usefulness of Robotic Technology for Patient Fall Prevention',
          description: "Peer-reviewed study (Workplace Health &amp; Safety, 2024) on whether ARNA improves the perceived usefulness of assisted patient ambulation for fall prevention. 38 nursing students rated three conditions, a human gait belt, an ARNA gait belt, and an ARNA harness, with both robot conditions scoring significantly higher.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/10_fall_prevention/";
            },},{id: "projects-arna-adaptive-robotic-nursing-assistant",
          title: 'ARNA: Adaptive Robotic Nursing Assistant',
          description: "NSF-funded omnidirectional mobile manipulator for clinical nursing assistance, built around a Kinova Gen3 arm on a Mecanum base with LiDAR and ATI Axia 80 F/T sensing. Primary engineer across hardware, software, control, and clinical deployment since 2023.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/1_arna/";
            },},{id: "projects-network-aware-mpc-cbf-for-safe-remote-teleoperation-of-arna",
          title: 'Network-Aware MPC-CBF for Safe Remote Teleoperation of ARNA',
          description: "A five-layer safety architecture that keeps hard guarantees when both the operator and the connection are unreliable. Predictive MPC-CBF filters on the arm and the base, a watchdog that widens margins as the connection degrades, and an authority layer that adapts to the operator, each validated on hardware.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2_mpc_cbf/";
            },},{id: "projects-remote-teleoperation-front-end-design-with-secure-network-transport",
          title: 'Remote Teleoperation Front-End Design with Secure Network Transport',
          description: "A browser-based teleoperation front end for ARNA with no client software and no VPN. A Next.js GUI reaches the robot through an authenticated Cloudflare tunnel on three isolated WebSocket channels, and the same connection is measured continuously to tell the safety layers how much delay to expect.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/3_remote_ui/";
            },},{id: "projects-arna-semi-autonomous-pick-place",
          title: 'ARNA Semi-Autonomous Pick Place',
          description: "One click on one pixel and the robot does the rest. FastSAM turns the click into an object mask, Contact-GraspNet proposes 6-DOF grasps, and a staged Cartesian sequence with a closed-loop re-grasp executes the pick while the safety layers stay live underneath.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/4_pick_place/";
            },},{id: "projects-evaluation-of-a-neuroadaptive-admittance-controller-for-ambulation",
          title: 'Evaluation of a Neuroadaptive Admittance Controller for Ambulation',
          description: "First-author Intelligent Service Robotics paper evaluating NAC, a neural-network torque controller that gives ARNA its compliance as a robotic walker. Benchmarked against a classical PD controller with 10 users, then re-tuned and re-tested with 63 nursing students.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/5_nac/";
            },},{id: "projects-neural-human-intent-estimator-for-an-adaptive-robotic-nursing-assistant",
          title: 'Neural Human Intent Estimator for an Adaptive Robotic Nursing Assistant',
          description: "IEEE CASE 2024 paper on HIE-NAC, a model-free neural estimator that infers where a user intends to walk from handlebar forces alone and feeds a neuroadaptive controller. Lyapunov-proven stability, validated with 10 participants across three guided paths.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/6_intent/";
            },},{id: "projects-tactile-handlebar-and-deep-learning-for-safe-interaction-with-a-robot-nursing-assistant",
          title: 'Tactile Handlebar and Deep Learning for Safe Interaction with a Robot Nursing Assistant...',
          description: "A sensorized handlebar that reads grip finger by finger, paired with deep sequence models that flag adverse events such as panic grips and one-hand releases while a patient is walking with ARNA. Under review at IEEE Transactions on Medical Robotics and Bionics.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/7_tactile/";
            },},{id: "projects-parallel-neural-networks-adaptive-user-interface-for-robot-teleoperation",
          title: 'Parallel Neural Networks Adaptive User Interface for Robot Teleoperation',
          description: "First-author IEEE Robotics and Automation Letters paper introducing PNNUI, a teleoperation interface built from two parallel neural networks, one trained offline by a genetic algorithm to prioritize task completion time and one trained online to minimize motion jerk. Tested with 20 subjects.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/8_pnnui/";
            },},{id: "projects-arna-hospital-trial-clinical-acceptability-study",
          title: 'ARNA Hospital Trial: Clinical Acceptability Study',
          description: "First-author IEEE CASE 2025 study evaluating the clinical acceptability of ARNA with 10 patients and 5 nurses at University of Louisville Hospital, using the Technology Acceptance Model across tablet vs. joystick teleoperation and a shared-control walker scenario.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/9_hospital_trial/";
            },},{id: "teachings-data-science-fundamentals",
          title: 'Data Science Fundamentals',
          description: "This course covers the foundational aspects of data science, including data collection, cleaning, analysis, and visualization. Students will learn practical skills for working with real-world datasets.",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/data-science-fundamentals/";
            },},{id: "teachings-introduction-to-machine-learning",
          title: 'Introduction to Machine Learning',
          description: "This course provides an introduction to machine learning concepts, algorithms, and applications. Students will learn about supervised and unsupervised learning, model evaluation, and practical implementations.",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/introduction-to-machine-learning/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%70%30%73%68%61%72%31%32@%6C%6F%75%69%73%76%69%6C%6C%65.%65%64%75", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=FZB0nFkAAAAJ", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/paymansharafian", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/paymansharafian", "_blank");
        },
      },];
