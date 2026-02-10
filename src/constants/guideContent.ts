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
    subtitle: 'The North Star That Guides Our Journey',
    shortOverview: 'Our Vision is more than a slogan; it is the strategic destination that aligns every single team at Digital Qatalyst. It defines why we exist and ensures that every project we touch contributes to a larger, meaningful purpose.\n\nIt acts as our collective compass, keeping us moving in the same direction even when daily tasks become complex. By anchoring yourself in the Vision, you ensure your hard work always translates into real value for the organisation.\n\nThis system connects the high-level ambition of leadership directly to the hands-on execution of the squads. It empowers you to say "no" to distractions and "yes" to work that truly moves the needle.',
    highlights: [
      'Strategic Alignment: Ensure every task contributes directly to the organisation\'s long-term success.',
      'Clear Purpose: Find deeper meaning in your daily work by understanding the "why" behind the "what."',
      'Focused Decisions: Use the vision as a filter to prioritize high-value activities and decline distractions.',
      'Unified Direction: Move in sync with other teams, knowing we are all aiming for the same destination.',
      'Inspired Action: Stay motivated by seeing how your individual contribution fits into the global picture.'
    ],
    storybookIntro: 'Understand the core components that make up our strategic identity, from our massive transformative purpose to our specific goals. This isn\'t just theory; it is the logic we use to set targets and measure our success.\n\nYou will explore how the Vision breaks down into actionable steps that squads can actually execute. This clarity prevents ambiguity and ensures that no one is ever working in a vacuum.\n\nBy grasping these elements, you gain the context needed to lead with confidence. You will see exactly how your team\'s specific objectives link back to the ultimate winning aspiration of DQ.',
    whatYouWillLearn: [
      'The Big Picture: The difference between our Purpose, Ambition, and Strategic Goals.',
      'The Strategy Link: How high-level goals are cascaded down into squad-level objectives.',
      'Success Measures: The key results we track to know if we are winning.',
      'The "Why" Logic: The reasoning behind our strategic choices and market positioning.',
      'Your Role: Exactly where you fit into the strategic map of the organisation.'
    ],
    courseIntro: 'Start with the Vision Overview to ground yourself in the fundamental goals of our organisation. You will learn to articulate our purpose clearly and use it to inspire those around you.\n\nFrom there, dive into practical exercises that help you map your daily tasks to strategic objectives. You will learn to identify when work is off-track and how to realign it with our North Star.\n\nFinally, practice using the Vision as a decision-making tool in real-world scenarios. This builds your ability to lead conversations and make choices that support the organisation\'s future.',
    whatYouWillPractice: [
      'Articulating Purpose: Practice explaining the DQ Vision clearly to your team and stakeholders.',
      'Strategic Mapping: Learn to link your daily backlog items directly to high-level strategic goals.',
      'Prioritization: Practice using the Vision to decide what to work on and what to deprioritize.',
      'Alignment Checks: Learn how to run quick checks to ensure your squad is still on the right path.',
      'Inspiring Others: Practice using the Vision to motivate teammates during challenging sprints.'
    ]
  },
  'dq-hov': {
    title: 'The HoV (Culture)',
    subtitle: 'The Culture That Powers Our Execution',
    shortOverview: 'The House of Values (HoV) defines the mindset and behaviors that make high performance possible at Digital Qatalyst. It is the cultural foundation that builds trust, enabling us to move fast without breaking things.\n\nIt replaces rigid rules with shared principles, giving us the freedom to act autonomously while staying united. When we all live these values, we create a safe environment where innovation can thrive.\n\nThis framework governs how we treat each other, how we handle conflict, and how we approach our work. It ensures that how we deliver results is just as important as the results themselves.',
    highlights: [
      'Psychological Safety: Build a fearless environment where people feel safe to speak up and take risks.',
      'Faster Decisions: Rely on shared principles to make quick choices without needing constant approval.',
      'Stronger Trust: Collaborate seamlessly with anyone in the organisation because you share a common code.',
      'Reduced Friction: Resolve conflicts easily by referring to agreed-upon behaviors and standards.',
      'Sustainable Pace: Work in a way that respects well-being while driving high performance.'
    ],
    storybookIntro: 'Understand the specific pillars that hold up our culture, such as Trust, Speed, and Quality. We break down what these values actually look like in practice, moving beyond buzzwords to real actions.\n\nYou will explore the "above the line" and "below the line" behaviors that define our interactions. This helps you recognize when a team is healthy and when it needs a cultural reset.\n\nBy understanding the HoV, you gain the tools to build a high-performing team dynamic. It clarifies the expectations we have for every associate, regardless of their role or seniority.',
    whatYouWillLearn: [
      'Core Pillars: The specific values that define the Digital Qatalyst culture.',
      'Behavioral Indicators: The specific actions that demonstrate or violate our values.',
      'The Trust Equation: How reliability and intimacy build the trust needed for speed.',
      'Cultural Alignment: How our culture supports our ability to be Agile and innovative.',
      'Accountability: How we hold each other responsible for maintaining these standards.'
    ],
    courseIntro: 'Start with the HoV Overview to see how culture drives performance in an Agile environment. You will learn why "soft skills" are actually the hard drivers of our success and speed.\n\nFrom there, explore modules on giving feedback, handling conflict, and building trust within a squad. You will learn practical techniques to embody these values in your daily meetings and interactions.\n\nFinally, practice these behaviors through role-playing and scenario-based exercises. This helps you build the muscle memory to react with integrity and empathy, even under pressure.',
    whatYouWillPractice: [
      'Active Listening: Practice listening to understand, not just to respond, to build deeper trust.',
      'Constructive Feedback: Learn to give and receive feedback that helps others grow without hurting relationships.',
      'Conflict Resolution: Practice resolving disagreements by focusing on problems, not personalities.',
      'Living the Values: Learn how to model "above the line" behaviors in stressful situations.',
      'Team Agreements: Practice creating working agreements that bake these values into your squad\'s routine.'
    ]
  },
  'dq-persona': {
    title: 'The Personas (Identity)',
    subtitle: 'Clarity in Every Role We Play',
    shortOverview: 'In our agile model, we focus on "Personas" rather than rigid job titles to describe the work we do. This approach clarifies exactly who is responsible for what, reducing confusion and overlapping efforts.\n\nIt recognizes that you may wear multiple "hats" depending on the situation, from a Squad Member to a Chapter Lead. This flexibility allows us to deploy talent where it is needed most without bureaucratic hurdles.\n\nBy defining clear accountabilities for each persona, we empower you to take ownership of your domain. You know exactly what is expected of you and where your authority begins and ends.',
    highlights: [
      'Role Clarity: Eliminate confusion by clearly defining who is responsible for which tasks and decisions.',
      'Empowerment: Take full ownership of your domain knowing exactly where you have authority to act.',
      'Reduced Conflict: Avoid stepping on toes by understanding the boundaries between different roles.',
      'Career Growth: Explore different "hats" you can wear to expand your skills and influence.',
      'Agile Flexibility: Move fluidly between different responsibilities as the needs of the team change.'
    ],
    storybookIntro: 'Understand the distinct archetypes that drive our teams, such as the Product Owner, Scrum Master, and Squad Member. We explain the specific duties, rights, and interactions for each of these key roles.\n\nYou will explore how these personas interact to create a balanced and effective team. We show how the "Check and Balance" system works between those who define value and those who deliver it.\n\nBy understanding the persona framework, you can navigate the organisation more effectively. You will know exactly who to talk to for a decision, a resource, or a technical solution.',
    whatYouWillLearn: [
      'Key Archetypes: The core roles of Product Owner, Scrum Master, and Chapter Lead.',
      'The "Hat" Concept: How one person can hold different accountabilities in different contexts.',
      'Decision Rights: Which persona owns which type of decision (e.g., "what" vs. "how").',
      'Interaction Models: How different personas collaborate without creating bottlenecks.',
      'Leadership Styles: How leadership is distributed across roles rather than concentrated in one manager.'
    ],
    courseIntro: 'Start with the Persona Overview to see the full cast of characters that make up a Digital Qatalyst tribe. You will learn the unique superpower of each role and how they complement one another.\n\nFrom there, dive into the specifics of your own primary persona and those you interact with most. You will learn the "do\'s and don\'ts" of your role to maximize your effectiveness and team harmony.\n\nFinally, practice "switching hats" through scenarios that require you to step into different responsibilities. This builds your empathy for other roles and makes you a more versatile team player.',
    whatYouWillPractice: [
      'Role Definition: Practice defining your own accountabilities clearly to your team.',
      'Collaborative Handoffs: Learn how to hand off work between personas without dropping the ball.',
      'Decision Making: Practice making decisions that sit squarely within your persona\'s authority.',
      'Empathy Building: Learn to see challenges from the perspective of a Product Owner or Scrum Master.',
      'Situational Leadership: Practice stepping up to lead when your specific expertise is required.'
    ]
  },
  'dq-agile-tms': {
    title: 'Agile TMS (Tasks)',
    subtitle: 'The Backbone of Our Team Organisation',
    shortOverview: 'The Agile Team Management System (TMS) is the structural backbone that organizes our people into Squads, Chapters, and Tribes. It replaces traditional hierarchy with a network of autonomous teams focused on value delivery.\n\nThis system ensures that every team has the right mix of skills and resources to succeed independently. It minimizes dependencies and allows squads to move fast without waiting for external approvals.\n\nIt also provides the governance needed to keep these autonomous teams aligned. It balances freedom with coordination, ensuring we don\'t descend into chaos as we scale.',
    highlights: [
      'Autonomy: Work in self-sufficient squads that have everything they need to deliver value.',
      'Skill Balance: Ensure every team has the right mix of cross-functional talent to succeed.',
      'Clear Structure: Navigate the organisation easily with a simple model of Squads, Chapters, and Tribes.',
      'Reduced Handoffs: Keep work within one team to minimize delays caused by external dependencies.',
      'Scalability: Grow the organisation without adding bureaucracy by simply replicating the squad model.'
    ],
    storybookIntro: 'Understand the logic behind our "Spotify-like" model of Squads, Tribes, Chapters, and Guilds. We explain why we organize around products and value streams rather than functional silos.\n\nYou will explore how line management works in this matrix, separating "work management" from "people management." This ensures you get professional development support without slowing down delivery.\n\nBy understanding the TMS, you see how resources are allocated and how teams are formed. It demystifies the organisational chart and shows you how to navigate the structure to get things done.',
    whatYouWillLearn: [
      'Squads & Tribes: The primary delivery units and how they group together.',
      'Chapters & Guilds: The structures used for knowledge sharing and skill development.',
      'Matrix Management: How you report to a Chapter Lead for growth while working for a PO on tasks.',
      'Resource Allocation: How people are moved and assigned to where value is needed most.',
      'Governance Model: The light-touch rules that keep the system running smoothly.'
    ],
    courseIntro: 'Start with the TMS Overview to visualize the structure of our organisation. You will learn how to identify which Squad, Tribe, and Chapter you belong to and what that means for your daily work.\n\nFrom there, learn how to leverage Chapters and Guilds to grow your career and solve technical problems. You will discover how to access knowledge from across the organisation, not just within your team.\n\nFinally, practice operating within this structure through scenarios on resource sharing and cross-squad collaboration. This helps you work effectively in a matrix without getting confused by dual reporting lines.',
    whatYouWillPractice: [
      'Structure Navigation: Practice identifying the right teams and people to connect with for specific needs.',
      'Chapter Participation: Learn how to contribute to and benefit from your professional Chapter.',
      'Cross-Functional Work: Practice working effectively with teammates from completely different backgrounds.',
      'Managing Reporting Lines: Learn to balance the needs of your Squad (Product) and Chapter (People).',
      'Scaling Knowledge: Practice sharing your learnings through Guilds to help other teams improve.'
    ]
  },
  'dq-agile-sos': {
    title: 'Agile SoS (Governance)',
    subtitle: 'Connecting Our Systems for Scale',
    shortOverview: 'Agile SoS acts as a "System of Systems," connecting our independent squads into a unified, high-performing network. It provides the governance layer that ensures every separate team functions in perfect harmony with the whole.\n\nThis meta-structure prevents silos by synchronizing the rhythm of information flow and critical decision-making. It ensures that the output of one system seamlessly integrates with the needs of another.\n\nIt serves as the ultimate alignment mechanism, allowing us to scale agility from a single team to the entire organisation. When complex challenges arise, this system provides the stability and pathways to resolve them instantly.',
    highlights: [
      'Scale Complexity: Manage complex interactions between multiple teams without losing speed or agility.',
      'Systemic Alignment: Ensure all independent systems (squads) are moving toward the same strategic goals.',
      'Rapid Resolution: Use established pathways to escalate and solve systemic blockers immediately.',
      'Holistic Visibility: See the health of the entire organisation, not just individual team performance.',
      'Coordinated Delivery: Synchronize release cycles across the entire "System of Systems" for maximum impact.'
    ],
    storybookIntro: 'Understand how the System of Systems architecture functions to govern our scaling efforts without adding bureaucracy. We break down the mechanics of how independent nodes (squads) link together to form a cohesive whole.\n\nYou will explore the interfaces and protocols that allow information to flow up, down, and across the network. This clarity prevents the chaos that usually happens when you try to scale without a meta-system.\n\nBy grasping this concept, you see that SoS is not just a meeting, but the operating system of the organisation. It clarifies how your local team decisions impact the global system performance.',
    whatYouWillLearn: [
      'The Meta-Layer: How SoS functions as the governing layer above individual squads.',
      'Inter-System Links: How dependencies are managed as connections between different systems.',
      'Information Flow: The protocols for moving data from the edge (squads) to the center (leadership).',
      'Global Optimization: The concept of optimizing the whole system rather than just local parts.',
      'Resilience: How the System of Systems design makes the organisation more robust against failure.'
    ],
    courseIntro: 'Start with the SoS Overview to visualize the System of Systems model in action across the organisation. You will learn the specific behaviors required to operate effectively within this highly interconnected environment.\n\nFrom there, dive into the protocols for synchronization and escalation that keep the wider system healthy. You will learn to identify "systemic noise" and how to filter it out to focus on the signal.\n\nFinally, practice your role as a connector within this network through real-world simulation exercises. This builds your ability to navigate the complex web of relationships and deliver value at scale.',
    whatYouWillPractice: [
      'System Navigation: Practice identifying where your team fits within the larger System of Systems.',
      'Interface Management: Learn to manage the "API" of your team: how you send and receive work.',
      'Escalation Protocols: Practice using the correct channels to flag systemic risks or failures.',
      'Cross-System Sync: Learn to align your local rhythm with the global heartbeat of the organisation.',
      'Impact Analysis: Practice assessing how changes in your area ripple through the rest of the system.'
    ]
  },
  'dq-agile-flows': {
    title: 'Agile Flows (Value Streams)',
    subtitle: 'From Idea to Impact Without Waste',
    shortOverview: 'Agile Flows define the lifecycle of our work, from the first spark of an idea to the final delivery to the customer. It is the roadmap that ensures we build the right thing, the right way, at the right time.\n\nThis system optimizes our "value stream," removing bottlenecks and wait times that slow us down. It focuses on flow efficiency, ensuring that work is always moving forward and never stuck in a queue.\n\nIt standardizes our major ceremonies and artifacts so everyone knows what to expect. This consistency allows us to move fast because we don\'t have to reinvent the process for every new project.',
    highlights: [
      'Efficiency: Eliminate waste and waiting time to get value to the customer faster.',
      'Predictability: Use a standard process to make delivery timelines more reliable and transparent.',
      'Quality Control: Build in checks at every stage to catch errors before they reach production.',
      'Transparency: See exactly where every piece of work is in the pipeline at any moment.',
      'Continuous Flow: Maintain a steady rhythm of delivery rather than working in chaotic bursts.'
    ],
    storybookIntro: 'Understand the specific stages of our flow, including Upstream (Discovery) and Downstream (Delivery). We explain the "Definition of Ready" and "Definition of Done" that act as gates between these stages.\n\nYou will explore the key ceremonies like Sprint Planning, Review, and Retrospective in depth. We show the intent behind each meeting so they don\'t just become empty rituals.\n\nBy understanding Agile Flows, you gain the ability to spot bottlenecks in your own team. You will see clearly where work is getting stuck and have the vocabulary to fix it.',
    whatYouWillLearn: [
      'The Value Stream: Understand the end-to-end journey of a feature from concept to cash.',
      'Gate Criteria: Understand the "Definition of Ready" and "Definition of Done" standards.',
      'Ceremony Intent: Grasp the specific purpose and desired outcome of every Agile event.',
      'Kanban Principles: Understand how we limit work-in-progress (WIP) to improve speed.',
      'Metrics: See how we use Cycle Time and Lead Time to measure the health of our flow.'
    ],
    courseIntro: 'Start with the Flows Overview to visualize the standard path for delivery at DQ. You will learn why we strictly separate "Discovery" work from "Delivery" work to keep the engine running smoothly.\n\nFrom there, learn how to facilitate key events like the Retrospective to drive real improvement. You will discover techniques to visualize your team\'s work and identify hidden waste.\n\nFinally, practice optimizing a workflow through simulation exercises. This helps you build the mindset of a "process engineer," constantly tweaking the system to make it faster and better.',
    whatYouWillPractice: [
      'Backlog Management: Practice refining and prioritizing work to keep the flow steady.',
      'Meeting Facilitation: Learn to run high-energy planning and review sessions.',
      'Visualizing Work: Practice using Kanban boards to make bottlenecks immediately visible.',
      'Process Improvement: Learn to use Retrospectives to change how you work, not just what you do.',
      'Reducing Waste: Practice identifying and eliminating non-value-added activities from your day.'
    ]
  },
  'dq-agile-6xd': {
    title: 'Agile 6xD (Products)',
    subtitle: 'Six Lenses for Digital Transformation',
    shortOverview: 'The 6xD model is our comprehensive guide for transforming into a Digital Cognitive Organisation (DCO). It provides six distinct lenses to view the digital economy, ensuring we don\'t miss any critical angle of change.\n\nIt answers every fundamental question of transformation, from why we must change to who will deliver it. This holistic view prevents blind spots and ensures our strategies are robust and future-proof.\n\nBy mastering these perspectives, you align your work with the deeper shifts in the market. You move beyond simple digitization to creating true cognitive capabilities that adapt and learn.',
    highlights: [
      'Strategic Context: Understand the specific market shifts (Digital Economy) that explain why organisations must change.',
      'Clear Destination: Visualize exactly where we are headed: the intelligent, adaptive Digital Cognitive Organisation.',
      'Scalable Foundation: Focus on building the right modular architectures (DBP) to make transformation scalable.',
      'Repeatable Success: Treat transformation as a designed discipline (DT2.0) with reliable methods rather than chaotic guesswork.',
      'Empowered Delivery: Ensure the digital workforce (DW:WS) has the right skills and environment to sustain the change.'
    ],
    storybookIntro: 'Understand the six critical perspectives that define a successful digital transformation. We explore the shift in market logic and customer behavior that dictates why organisations must evolve.\n\nYou will examine the "What" and "How" by diving into Digital Business Platforms and Transformation 2.0. This framework turns abstract concepts into a structured design discipline that is easy to follow.\n\nFinally, we connect these systems to the people and tools that bring them to life. You will see how the Digital Worker and Accelerators determine the speed and sustainability of our impact.',
    whatYouWillLearn: [
      'The Context (DE): The shifts in market logic and value creation that drive the need for transformation.',
      'The Goal (DCO): The concept of an intelligent enterprise capable of learning and orchestrating at scale.',
      'The Engine (DBP): The modular, integrated, and data-driven architectures required to enable change.',
      'The Method (DT2.0): How to design and deploy transformation using repeatable flows and governance.',
      'The Enablers: Who delivers the change (Digital Worker) and how we compress time-to-value (Accelerators).'
    ],
    courseIntro: 'Start with the 6xD Overview to see how the six perspectives fit together to build a Digital Cognitive Organisation. You will learn to diagnose where an organisation stands and which specific lever needs to be pulled next.\n\nFrom there, dive into the mechanics of Digital Business Platforms and the specific tools of the trade. You will learn to design transformation flows that are scalable, resilient, and data-driven.\n\nFinally, practice applying these lenses to real-world business challenges. This helps you move from "doing digital" to truly "being digital" in your daily decision-making and design work.',
    whatYouWillPractice: [
      'Market Analysis: Practice identifying the shifts in the Digital Economy that impact your specific project.',
      'Platform Thinking: Learn to design modular solutions (DBP) rather than monolithic dead-ends.',
      'Transformation Design: Practice using DT2.0 methods to orchestrate change systematically.',
      'Workforce Enablement: Learn how to set up the environment for the Digital Worker to succeed.',
      'Accelerating Value: Practice using specific tools to shorten the time it takes to see real impact.'
    ]
  }
}
