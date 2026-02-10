// Content data for the 8 core service area detail pages
// This content should be used exactly as provided - do not summarize or change

export interface GuideContent {
  title: string
  subtitle: string
  shortOverview: string
  highlights: string[]
  storybookIntro: string
  whatYouWillLearn: string[]
  courseIntro?: string
  whatYouWillPractice?: string[]
}

export const GUIDE_CONTENT: Record<string, GuideContent> = {
  'ghc': {
    title: 'The GHC (Golden Honeycomb of Competencies)',
    subtitle: 'The Master Map',
    shortOverview: 'The Golden Honeycomb of Competencies (GHC) defines how work is organised at Digital Qatalyst. It brings together our direction, culture, and ways of working into one clear system that guides how decisions are made and work gets done.\n\nGHC exists to create clarity at every level. By connecting organisational goals to everyday work, it helps associates understand how their contributions matter and how to move work forward with confidence.\n\nGHC allows DQ to grow, adapt, and solve difficult problems without losing alignment. It enables consistent collaboration, clear execution, and reliable delivery across the organisation, through seven connected competencies: Vision, House of Values, Persona, Agile TMS, Agile SoS, Agile Flows, and Agile 6xD.',
    highlights: [
      'Clear Direction: Understand what matters most so your efforts stay aligned instead of pulling in different directions.',
      'Confidence in Change: Adapt to new challenges with a structure that helps you shift priorities without losing focus or momentum.',
      'Better Collaboration: Coordinate and move work forward with others using a shared approach that removes constant clarification.',
      'Meaningful Impact: Link daily tasks to broader goals to see how your effort contributes to real outcomes and not just activity.',
      'Consistent Growth: Use GHC tools to develop your skills and take on new responsibilities as our work evolves.'
    ],
    storybookIntro: 'The Golden Honeycomb of competencies isn\'t just a framework; it is what drives us in Digital Qatalyst. It shows exactly how we design our work, make decisions, and stay aligned as one team.\n\nGet to know the seven core elements that make up our DNA. Instead of seeing them as separate rules, you will see how they link together; how our Culture drives our Execution, and how our Vision shapes your daily Tasks.\n\nWhen you understand the Golden Honeycomb of competencies, You will see clearly where your role fits into the team, making it easier to prioritize work, collaborate with teammates, and move forward with total confidence; even when the path gets complex.',
    whatYouWillLearn: [
      'The seven competencies: What each one represents and how they connect as one system.',
      'How the system fits together: How direction, culture, roles, and execution work in sync.',
      'Your place in the system: How your role connects to the broader way of working.',
      'How decisions stay aligned: How priorities, choices, and outcomes move together as work changes.',
      'How work turns into outcomes: How ideas progress from intent to delivery, even in complex situations.'
    ],
    courseIntro: 'Start with the GHC Overview video to understand the full picture of how work operates at Digital Qatalyst. It shows how our vision, culture, and ways of working connect and how that system shapes the work you do every day.\n\nUse the Golden Honeycomb whenever you are planning work, setting priorities, or making decisions. It helps you connect daily tasks to shared goals, clarify what matters most, and move forward without second-guessing your focus.\n\nAs work evolves, apply the Golden Honeycomb when priorities shift, collaboration becomes complex, or new challenges appear. It becomes a practical guide for decision-making and teamwork, helping you stay aligned, confident, and effective; even in uncertain situations.',
    whatYouWillPractice: [
      'The full picture: See how the seven competencies connect and work together as one system.',
      'Purposeful action: Turn daily tasks into meaningful progress by linking work directly to shared goals.',
      'Clear decision-making: Make confident choices using a shared logic without waiting for permission.',
      'Seamless collaboration: Work across teams using a common language that keeps everyone aligned.',
      'Staying agile: Maintain focus and momentum as priorities shift and work evolves.'
    ]
  },
  'dq-vision': {
    title: 'The Vision (Purpose)',
    subtitle: 'Why We Are Here',
    shortOverview: 'Our North Star. We exist to make life easier. Our goal is to use technology to make every transaction faster, smarter, and friendlier for everyone.',
    highlights: [
      'Solving Chaos: Using digital blueprints to fix messy problems.',
      'Being Proactive: Fixing things before they even break.',
      'Global Impact: Improving lives in every sector of the economy.'
    ],
    storybookIntro: 'Explore Our Mission: This storybook explains \'Accelerating Life\'s Transactions.\' Read this to understand the big, audacious goal we are all aiming for.',
    whatYouWillLearn: [
      'The Mission: Deeply understand what drives us every day.',
      'The Strategy: How we plan to reach this big goal.',
      'The Story: How to explain our purpose to others.'
    ],
    courseIntro: 'Start with the Vision course to understand why Digital Qatalyst exists and what we aim to achieve. It shows how our mission shapes every decision and connects to the work you do every day.\n\nUse the Vision whenever you need to align your work with our purpose, communicate our goals to others, or make strategic decisions. It helps you see the bigger picture and understand how your contributions matter.\n\nAs challenges arise, apply the Vision to stay focused on what truly matters. It becomes your compass for prioritizing work, making trade-offs, and ensuring every action moves us closer to our mission.',
    whatYouWillPractice: [
      'Mission alignment: Connect your daily work to our overarching purpose and strategic goals.',
      'Strategic thinking: Make decisions that advance our mission of accelerating life\'s transactions.',
      'Purpose communication: Articulate why we exist and what we\'re working toward with clarity and conviction.',
      'Impact focus: Prioritize work that creates meaningful progress toward our vision.',
      'Long-term perspective: Balance immediate tasks with our broader mission and future direction.'
    ]
  },
  'dq-hov': {
    title: 'The HoV (Culture)',
    subtitle: 'How We Behave',
    shortOverview: 'Our House of Values. This is our code of conduct. It isn\'t just about what we do, but how we treat each other. It defines how we behave when no one is watching.',
    highlights: [
      'Building Trust: How we create a safe place to work.',
      'Acting Right: The specific behaviors that define a true Qatalyst.',
      'Staying Honest: Making ethical choices in every situation.'
    ],
    storybookIntro: 'Explore Our Culture: Dive into the \'House of Values.\' This guide illustrates the specific behaviors that build trust, safety, and respect in our team.',
    whatYouWillLearn: [
      'Team Rules: How to work well with your colleagues.',
      'Culture Code: Practical examples of our values in action.',
      'Decision Making: How to use our values to make tough choices.'
    ],
    courseIntro: 'Start with the House of Values course to understand the behaviors and principles that define our culture. It shows how our values guide interactions, decisions, and the way we work together every day.\n\nUse the House of Values whenever you face ethical decisions, navigate team dynamics, or need to resolve conflicts. It helps you act with integrity and build trust in every interaction.\n\nAs situations become complex, apply the House of Values to stay grounded in what matters most. It becomes your guide for making principled choices and fostering a culture of respect and collaboration.',
    whatYouWillPractice: [
      'Values-based decisions: Make choices that reflect our core principles and cultural standards.',
      'Trust building: Create psychological safety and foster authentic relationships with teammates.',
      'Ethical behavior: Navigate difficult situations with integrity and transparency.',
      'Cultural alignment: Embody the behaviors that define what it means to be a Qatalyst.',
      'Conflict resolution: Address disagreements using our shared values as common ground.'
    ]
  },
  'dq-persona': {
    title: 'The Personas (Identity)',
    subtitle: 'Who We Are',
    shortOverview: 'Finding Your Role. We are more than just job titles. We have unique roles—or \'Personas\'—that help us collaborate. This defines who plays what part in our team.',
    highlights: [
      'Role Clarity: Knowing exactly what is expected of you.',
      'Team Harmony: Understanding how different roles work together.',
      'Growth: Seeing how your role can evolve over time.'
    ],
    storybookIntro: 'Explore Your Identity: Meet the characters of our ecosystem. This storybook explains the different roles we play and the superpowers each one brings to the table.',
    whatYouWillLearn: [
      'Your Superpower: Discover the core strengths of your persona.',
      'Respecting Others: Learn how to work with people who think differently than you.',
      'Career Path: See the journey of growth for your specific role.'
    ],
    courseIntro: 'Start with the Personas course to understand the different roles at Digital Qatalyst and how they work together. It shows how each persona contributes unique strengths and how collaboration happens across the team.\n\nUse Personas whenever you need to understand team dynamics, delegate work effectively, or collaborate across functions. It helps you leverage everyone\'s strengths and communicate in ways that resonate.\n\nAs teams evolve, apply Personas to build better working relationships and grow in your role. It becomes your guide for understanding yourself and others, making collaboration seamless and purposeful.',
    whatYouWillPractice: [
      'Role understanding: Identify your persona and leverage your unique strengths in daily work.',
      'Cross-functional collaboration: Work effectively with different personas using their preferred styles.',
      'Strength recognition: Appreciate and utilize the diverse capabilities each role brings to the team.',
      'Communication adaptation: Adjust your approach based on who you\'re working with for better outcomes.',
      'Career development: Chart your growth path and understand how your role can evolve over time.'
    ]
  },
  'dq-agile-tms': {
    title: 'Agile TMS (Tasks)',
    subtitle: 'How We Work',
    shortOverview: 'Getting Things Done. Big dreams need action. The Task Management System (TMS) is how we break huge projects into small, doable steps so we never get overwhelmed.',
    highlights: [
      'Radical Focus: Focusing on one thing at a time to do it well.',
      'Staying Fast: Measuring our speed to keep improving.',
      'Breaking it Down: Turning big problems into small tasks.'
    ],
    storybookIntro: 'Explore Execution: This guide explains our \'Engine of Execution.\' Download it to learn how we organize our to-do lists to keep moving fast without burnout.',
    whatYouWillLearn: [
      'Manage Your Day: How to organize your backlog efficiently.',
      'Use the Tools: Best practices for our task apps.',
      'Deliver Value: How to finish tasks consistently.'
    ],
    courseIntro: 'Start with the Agile TMS course to understand how we organize and execute work at Digital Qatalyst. It shows how to break down complex projects into manageable tasks and maintain focus on what matters most.\n\nUse Agile TMS whenever you plan your work, prioritize tasks, or need to deliver results quickly. It helps you stay organized, measure progress, and avoid getting overwhelmed by complexity.\n\nAs workload increases, apply Agile TMS to maintain velocity and quality. It becomes your system for managing tasks, tracking progress, and ensuring consistent delivery without burnout.',
    whatYouWillPractice: [
      'Task breakdown: Decompose large projects into small, actionable steps that can be completed quickly.',
      'Priority management: Focus on high-impact work and avoid distractions that don\'t add value.',
      'Velocity tracking: Measure your speed and identify ways to improve efficiency over time.',
      'Backlog organization: Keep your work queue clean, prioritized, and ready for execution.',
      'Consistent delivery: Build habits that ensure reliable output and sustainable pace.'
    ]
  },
  'dq-agile-sos': {
    title: 'Agile SOS (Governance)',
    subtitle: 'How We Stay in Sync',
    shortOverview: 'Working Together. As we grow, we need to stay connected. These are the meetings and checks we use to make sure all teams are moving in harmony without chaos.',
    highlights: [
      'No Bureaucracy: staying organized without slowing down.',
      'Fixing Problems: How to raise a hand when you are stuck.',
      'Team Sync: Ensuring one team helps the other succeed.'
    ],
    storybookIntro: 'Explore Our Rituals: This document explains the \'Scrum of Scrums.\' Read this to understand how we fix blockers and keep multiple teams aligned.',
    whatYouWillLearn: [
      'The Meetings: How to run or join our sync-up calls.',
      'Conflict Resolution: How to solve issues between squads.',
      'The Rhythm: Understanding our weekly and monthly cycles.'
    ],
    courseIntro: 'Start with the Agile SoS course to understand how teams stay coordinated at Digital Qatalyst. It shows how we use lightweight governance to maintain alignment without creating bureaucracy or slowing down progress.\n\nUse Agile SoS whenever you need to coordinate across teams, resolve blockers, or ensure everyone is moving in the same direction. It helps you stay connected without constant meetings or micromanagement.\n\nAs complexity grows, apply Agile SoS to scale collaboration effectively. It becomes your framework for maintaining team sync, resolving dependencies, and ensuring smooth coordination across the organization.',
    whatYouWillPractice: [
      'Team coordination: Keep multiple teams aligned and moving together without excessive overhead.',
      'Blocker resolution: Identify and remove obstacles quickly before they impact delivery.',
      'Lightweight governance: Maintain structure and alignment without creating bureaucracy.',
      'Cross-team communication: Share information effectively so everyone stays informed.',
      'Rhythm establishment: Create predictable cadences that keep work flowing smoothly.'
    ]
  },
  'dq-agile-flows': {
    title: 'Agile Flows (Value Streams)',
    subtitle: 'How Work Travels',
    shortOverview: 'From Idea to Done. This maps the journey of our work. It shows how an idea travels through the company, gets built, and is delivered to the customer.',
    highlights: [
      'The Full Picture: Seeing the whole process, not just your part.',
      'Cutting Waste: Removing steps that don\'t add value.',
      'Smooth Flow: Keeping work moving without stops.'
    ],
    storybookIntro: 'Explore the Journey: Follow the flow of value. This storybook illustrates how to spot bottlenecks and ensure our work reaches the finish line smoothly.',
    whatYouWillLearn: [
      'Map Your Work: How to visualize what you do every day.',
      'Spot Delays: How to find where things are getting stuck.',
      'Speed It Up: Simple ways to deliver value faster.'
    ],
    courseIntro: 'Start with the Agile Flows course to understand how work moves through Digital Qatalyst from idea to delivery. It shows the complete journey of value creation and how to optimize each step for faster, smoother outcomes.\n\nUse Agile Flows whenever you need to improve processes, eliminate waste, or speed up delivery. It helps you see the big picture, identify bottlenecks, and keep work moving efficiently.\n\nAs processes evolve, apply Agile Flows to continuously improve how value is delivered. It becomes your tool for mapping work, spotting inefficiencies, and ensuring smooth flow from start to finish.',
    whatYouWillPractice: [
      'Value stream mapping: Visualize the complete journey of work from concept to customer delivery.',
      'Bottleneck identification: Spot where work gets stuck and understand what causes delays.',
      'Waste elimination: Remove steps and activities that don\'t add value to the final outcome.',
      'Flow optimization: Keep work moving smoothly through each stage without unnecessary stops.',
      'Continuous improvement: Regularly refine processes to deliver value faster and more reliably.'
    ]
  },
  'dq-agile-6xd': {
    title: 'Agile 6xD (Products)',
    subtitle: 'What We Build',
    shortOverview: 'Our Solutions. This is what we offer to the world. It covers the different types of digital products and services we build to solve real problems for our clients.',
    highlights: [
      'Product Thinking: Building things that last, not just quick fixes.',
      'The Lifecycle: From the first idea to the final launch.',
      'Solving Problems: Matching our skills to client needs.'
    ],
    storybookIntro: 'Explore Our Products: Discover our product universe. This guide breaks down the six ways we package our skills to create solutions that matter.',
    whatYouWillLearn: [
      'Our Portfolio: A simple look at the 6 things we sell.',
      'Building Solutions: How to help create great products.',
      'Market Fit: Ensuring we build what people actually want.'
    ],
    courseIntro: 'Start with the Agile 6xD course to understand the products and solutions Digital Qatalyst delivers. It shows the six dimensions of our offerings and how we create lasting value for clients through thoughtful product development.\n\nUse Agile 6xD whenever you work on client solutions, design products, or need to understand our service portfolio. It helps you think like a product owner and build solutions that truly solve problems.\n\nAs client needs evolve, apply Agile 6xD to create better products and services. It becomes your framework for product thinking, lifecycle management, and ensuring what we build creates real impact.',
    whatYouWillPractice: [
      'Product thinking: Approach solutions with a long-term mindset focused on sustainable value creation.',
      'Lifecycle management: Understand how products evolve from concept through launch and beyond.',
      'Client-centric design: Build solutions that address real problems and create meaningful outcomes.',
      'Portfolio navigation: Know which type of solution fits different client needs and situations.',
      'Value delivery: Ensure what we build creates lasting impact, not just temporary fixes.'
    ]
  }
}
