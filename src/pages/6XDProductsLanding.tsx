import GHCLanding from "./SixXDLandingLayout";
import type { LucideIcon } from "lucide-react";
import { Target, Brain, Layers, GitBranch, Users, BookOpen, Briefcase, GraduationCap } from "lucide-react";

const SIXXD_CARDS = [
  {
    id: "dtmp",
    number: 1,
    category: "Digital Transformation Management Platform",
    title: "DTMP",
    executionQuestion: "Why: Every bespoke initiative risks fragmentation and after-the-fact tracking.",
    executionLens:
      "Delivery Products (DT 2.0): DTMP gives real-time steering of bespoke work so execution stays aligned from start to scale.",
    story: "",
    problem: "",
    response: "",
    route: "/marketplace/guides/dq-agile-6xd",
    icon: Target as LucideIcon,
    gradient: "bg-gradient-to-br from-[#131e42] via-[#1d2f64] to-[#e1513b]",
    accent: "#f0f6ff",
    image:
      "https://image2url.com/r2/default/images/1770711361142-16232790-309d-46f7-b393-824cc3263275.png",
    ctaLabel: "Read capability overview",
  },
  {
    id: "dtma",
    number: 2,
    category: "Digital Transformation Management Academy",
    title: "DTMA",
    executionQuestion: "Why: Teams are asked to transform without a shared practice.",
    executionLens:
      "Insight Products (DCO): DTMA builds shared practice through applied learning so teams execute the same way.",
    story: "",
    problem: "",
    response: "",
    route: "/marketplace/guides/dq-agile-6xd",
    icon: GraduationCap as LucideIcon,
    gradient: "bg-gradient-to-br from-[#1b2553] via-[#243a75] to-[#e1513b]",
    accent: "#f0f6ff",
    image: "https://image2url.com/r2/default/images/1770354661040-ec3eb531-5010-4f68-8897-a5501623bfc3.jpg",
    ctaLabel: "Read capability overview",
  },
  {
    id: "dtmaas",
    number: 3,
    category: "Digital Transformation as a Service",
    title: "DTMaaS",
    executionQuestion: "Why: Launching initiatives is slow and inconsistent across teams.",
    executionLens:
      "Delivery Products (DT 2.0): TMaaS supplies ready-to-run blueprints so transformation starts fast and consistent with 6xD.",
    story: "",
    problem: "",
    response: "",
    route: "/marketplace/guides/dq-agile-6xd",
    icon: Briefcase as LucideIcon,
    gradient: "bg-gradient-to-br from-[#131e42] via-[#30478a] to-[#f0f6ff]",
    accent: "#f0f6ff",
    image:
      "https://image2url.com/r2/default/images/1770711252171-5234c11d-afc2-44ba-a4f6-30269cd2bd3b.png",
    ctaLabel: "Read capability overview",
  },
  {
    id: "dtmi",
    number: 4,
    category: "Digital Transformation Management Insights",
    title: "DTMI",
    executionQuestion: "Why: Transformation knowledge is scattered and decisions drift.",
    executionLens:
      "Insight Products (DCO): DTMI provides live insights so decisions stay evidence-based and aligned.",
    story: "",
    problem: "",
    response: "",
    route: "/marketplace/guides/dq-agile-6xd",
    icon: Brain as LucideIcon,
    gradient: "bg-gradient-to-br from-[#1b2553] via-[#3f528e] to-[#e1513b]",
    accent: "#f0f6ff",
    image: "https://image2url.com/r2/default/images/1770354705237-110f4c43-ac71-49be-b8a9-1a676146ecb6.jpg",
    ctaLabel: "Read capability overview",
  },
  {
    id: "dto4t",
    number: 5,
    category: "Digital Twin of Organisation for Transformation",
    title: "DTO4T",
    executionQuestion: "Why: Maturity and next steps are guessed instead of diagnosed.",
    executionLens:
      "Delivery Products (DT 2.0): DTO4T diagnoses, prescribes, and de-risks before scaling.",
    story: "",
    problem: "",
    response: "",
    route: "/marketplace/guides/dq-agile-6xd",
    icon: GitBranch as LucideIcon,
    gradient: "bg-gradient-to-br from-[#131e42] via-[#1d2f64] to-[#e1513b]",
    accent: "#f0f6ff",
    image: "https://image2url.com/r2/default/images/1770354729820-f4815c42-e9e5-4926-9d71-eb92bcc2b057.jpg",
    ctaLabel: "Read capability overview",
  },
  {
    id: "dtmb",
    number: 6,
    category: "Digital Transformation Management Book",
    title: "DTMB",
    executionQuestion: "Why: Guidance drifts by team and over time.",
    executionLens:
      "Insight Products (DCO): DTMB codifies models and plays so guidance stays consistent through the lifecycle.",
    story: "",
    problem: "",
    response: "",
    route: "/marketplace/guides/dq-agile-6xd",
    icon: BookOpen as LucideIcon,
    gradient: "bg-gradient-to-br from-[#1b2553] via-[#243a75] to-[#e1513b]",
    accent: "#f0f6ff",
    image: "https://image2url.com/r2/default/images/1770354752481-f1a62033-22f9-483a-ba44-f24b95c2a535.jpg",
    ctaLabel: "Read capability overview",
  },
  {
    id: "plant-4-0",
    number: 7,
    category: "Digital Cognitive Plant Platform",
    title: "Plant 4.0",
    executionQuestion: "Why: Industrial execution fragments across assets, systems, and sites.",
    executionLens:
      "Transaction Platforms (TxM): Connects assets and operations so plant execution runs as one system.",
    story: "",
    problem: "",
    response: "",
    route: "/marketplace/guides/dq-agile-6xd",
    icon: Layers as LucideIcon,
    gradient: "bg-gradient-to-br from-[#131e42] via-[#30478a] to-[#f0f6ff]",
    accent: "#f0f6ff",
    image: "https://image2url.com/r2/default/images/1770711252171-5234c11d-afc2-44ba-a4f6-30269cd2bd3b.png",
    ctaLabel: "Read capability overview",
  },
  {
    id: "dws",
    number: 8,
    category: "Digital Work Solution",
    title: "DWS",
    executionQuestion: "Why: Daily execution slows when tools, services, and workflows are split.",
    executionLens:
      "Transaction Platforms (TxM): Unifies work, collaboration, and automation so daily execution flows without friction.",
    story: "",
    problem: "",
    response: "",
    route: "/marketplace/guides/dq-agile-6xd",
    icon: Users as LucideIcon,
    gradient: "bg-gradient-to-br from-[#131e42] via-[#1d2f64] to-[#e1513b]",
    accent: "#f0f6ff",
    image: "https://image2url.com/r2/default/images/1770354729820-f4815c42-e9e5-4926-9d71-eb92bcc2b057.jpg",
    ctaLabel: "Read capability overview",
  },
];

const SIXXD_FEATURES = [
  {
    title: "Designed for Reality",
    description: "Agile 6xD was built to handle shifting priorities, complexity, and continuous change.",
    icon: Target,
  },
  {
    title: "Built to Scale",
    description: "Transformation is structured as a system — not pilots that stall.",
    icon: Layers,
  },
  {
    title: "Six Connected Perspectives",
    description: "Each perspective answers a critical question organisations must face to stay relevant.",
    icon: GitBranch,
  },
];

const SIXXD_ACTIONS = [
  {
    title: "Learn by doing",
    icon: GraduationCap,
    badge: "Start here",
    description: "New joiners: build delivery habits fast through missions that mirror DQ execution.",
    tags: ["Practice", "Missions", "Feedback"],
    cta: "Start in Learning Center",
    path: "/lms?category=6xd",
    bg: "bg-[#e6ebff]",
    accent: "text-white",
    badgeColor: "text-white",
    iconColor: "#f0f6ff",
    variant: "primary",
  },
  {
    title: "Capability overview",
    icon: Layers,
    badge: "Understand",
    description: "Leaders and planners: understand the execution system before you act.",
    tags: ["Storybook", "Execution", "Context"],
    cta: "Read the Agile 6xD storybook",
    path: "/marketplace/guides/dq-6xd",
    bg: "bg-[#f0f6ff]",
    accent: "text-[#131e42]",
    badgeColor: "text-[#131e42]",
    iconColor: "#e1513b",
    variant: "secondary",
  },
  {
    title: "Product platforms",
    icon: BookOpen,
    badge: "Access",
    description: "Teams ready to deploy: move straight into the live platforms used in delivery.",
    tags: ["DTMP", "DWS", "Plant 4.0"],
    cta: "Go to product platform ↗",
    path: "/marketplace/directory/products",
    bg: "bg-[#fde6de]",
    accent: "text-[#e1513b]",
    badgeColor: "text-[#e1513b]",
    iconColor: "#e1513b",
    variant: "secondary",
  },
];

export default function SixXDProductsLanding() {
  return (
    <GHCLanding
      badgeLabel="DQ Products"
      overrides={{
        // HERO (WHY)
        heroHeadline: "Execution fails when organisations fragment the work.",
        heroHeadlineHighlightWord: "Execution",
        heroHeadlineFontSize: "70px",
        heroSupporting:
          "DQ products exist to make execution continuous and real, not guessed.",
        heroCTA: "Read the Agile 6xD Storybook",
        heroCTALink: "/marketplace/guides/dq-6xd",
        heroFootnote: "Internal-first. Proven under real delivery pressure.",

        // WHAT ARE DQ PRODUCTS
        foundationTitle: "What are DQ Products",
        foundationSubtitle:
          "Execution systems built from how DQ delivers. Used in live work before release. Only what survives real pressure ships. Designed to work together as one execution system.",
        foundationTitleFontSize: "30px",
        foundationSubtitleFontSize: "16px",
        foundationCards: [
          {
            title: "Internal-First Execution",
            description: "Built inside DQ delivery teams and hardened on real deadlines.",
            icon: Target,
          },
          {
            title: "Delivery-Proven Systems",
            description: "Refined through live projects; if it fails in delivery, it does not ship.",
            icon: Layers,
          },
          {
            title: "System, Not Tools",
            description: "Products operate together as one spine to prevent fragmentation.",
            icon: GitBranch,
          },
        ],
        foundationCTA: "Read the full Agile 6xD storybook",
        foundationCTATo: "/marketplace/guides/dq-6xd",
        foundationFootnote:
          "GHC shapes how we think; 6xD shapes how we execute; products are the outcome. Only delivery-proven systems become products.",

        // EXECUTION SYSTEMS (HOW)
        responsesTitle: "Execution systems used at DQ",
        responsesIntro:
          "Products are organised into four execution classes. Each class solves a specific failure and has a clear place in the lifecycle.",
        responsesTitleFontSize: "30px",
        responsesIntroFontSize: "16px",
        responsesSequential: true,
        responseTags: [
          "DTMP",
          "DTMA",
          "DTMaaS",
          "DTMI",
          "DTO4T",
          "DTMB",
          "Plant 4.0",
          "DWS",
        ],
        responseCards: SIXXD_CARDS,
        bottomCTA: "",
        actionCards: SIXXD_ACTIONS,
        finalHeadline: "Execution or it doesn’t ship.",
        finalSubtitle:
          "We execute inside DQ first, release only after delivery proof, and scale what works. Execution is continuous, products are disciplined outcomes, and transformation becomes repeatable through systems.",
        finalCTALabel: "Read the Agile 6xD Storybook",
        finalCTATo: "/marketplace/guides/dq-6xd",
        finalCTASecondaryLabel: "Go to product platform ↗",
        finalCTASecondaryTo: "/marketplace/directory/products",
        finalHeadlineFontSize: "36px",
        takeActionTitleFontSize: "30px",
        takeActionSubtitleFontSize: "16px",
        takeActionTitle: "Choose your path",
        takeActionSubtitle:
          "Learn by doing, understand the system, or deploy platforms — choose the step that fits your readiness.",
        takeActionLayout: "feature",
      }}
    />
  );
}
