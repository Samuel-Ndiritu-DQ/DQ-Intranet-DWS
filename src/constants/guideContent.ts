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
      'Clear direction in everyday work: GHC helps you understand what matters most and why, so decisions and effort stay aligned instead of pulling in different directions.',
      'Confidence when priorities change: When work shifts or new challenges appear, GHC provides structure that helps you adapt without losing focus or momentum.',
      'Better collaboration across teams: Using a shared way of working makes it easier to communicate, coordinate, and move work forward with others without constant clarification.',
      'Stronger connection between effort and impact: GHC links daily tasks to broader goals, helping you see how your work contributes to real outcomes, not just activity.',
      'Consistent growth and learning: The GHC mindset and tools support continuous improvement; helping you develop skills, take on new responsibilities, and grow as work evolves.'
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
    ]
  }
}
