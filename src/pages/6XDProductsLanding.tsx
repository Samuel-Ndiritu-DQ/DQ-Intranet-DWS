import GHCLanding from "./SixXDLandingLayout";
import type { LucideIcon } from "lucide-react";
import { Target, Brain, Layers, GitBranch, Users, BookOpen, Briefcase, GraduationCap } from "lucide-react";

const SIXXD_CARDS = [
  {
    id: "dbp",
    number: 1,
    category: "Delivery Services (DBP)",
    title: "DBP Designs / Deploys",
    executionQuestion: "Why: design and deployment drift apart.",
    executionLens:
      "Role: keeps intent, build, and steady-state aligned so advisory moves straight into execution without drift.",
    route: "/marketplace/guides/dq-agile-6xd",
    icon: Target as LucideIcon,
    gradient: "bg-gradient-to-br from-[#131e42] via-[#1d2f64] to-[#e1513b]",
    accent: "#f0f6ff",
    image: "https://image2url.com/r2/default/images/1770354560794-72c7a866-573c-455f-ac74-44c6753068f5.jpg",
    ctaLabel: "Read capability overview",
  },
  {
    id: "dt2",
    number: 2,
    category: "Delivery Products (DT 2.0)",
    title: "DTMP · TMaaS · DTO4T",
    executionQuestion: "Why: every initiative reinvents execution.",
    executionLens:
      "Role: standardises how execution starts, runs, and scales across bespoke steering (DTMP), ready blueprints (TMaaS), and AI-delivered builds (DTO4T).",
    route: "/marketplace/guides/dq-agile-6xd",
    icon: Briefcase as LucideIcon,
    gradient: "bg-gradient-to-br from-[#1b2553] via-[#243a75] to-[#e1513b]",
    accent: "#f0f6ff",
    image: "https://image2url.com/r2/default/images/1770354661040-ec3eb531-5010-4f68-8897-a5501623bfc3.jpg",
    ctaLabel: "Read capability overview",
  },
  {
    id: "dco",
    number: 3,
    category: "Insight Products (DCO)",
    title: "DTMI · DTMA · DTMB",
    executionQuestion: "Why: teams think, learn, and decide in silos.",
    executionLens:
      "Role: shared insight, learning, and execution language so decisions, skills, and models stay aligned (insights, courses, books).",
    route: "/marketplace/guides/dq-agile-6xd",
    icon: Brain as LucideIcon,
    gradient: "bg-gradient-to-br from-[#131e42] via-[#30478a] to-[#f0f6ff]",
    accent: "#f0f6ff",
    image:
      "https://image2url.com/r2/default/images/1770711252171-5234c11d-afc2-44ba-a4f6-30269cd2bd3b.png",
    ctaLabel: "Read capability overview",
  },
  {
    id: "txm",
    number: 4,
    category: "Transaction Platforms (TxM)",
    title: "TxM · B2B2C / B2B2B",
    executionQuestion: "Why: execution breaks at scale from friction and handoffs.",
    executionLens:
      "Role: makes execution transactional, repeatable, and scalable by removing friction in external and internal journeys.",
    route: "/marketplace/guides/dq-agile-6xd",
    icon: Layers as LucideIcon,
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
    description: "Teams ready for live execution: move straight into the platforms used in delivery.",
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
        heroHeadline: "Execution fails when organisations fragment the work.",
        heroHeadlineHighlightWord: "execution",
        heroHeadlineFontSize: "70px",
        heroSupporting:
          "DQ products exist to keep execution continuous and real—not guessed or split apart.",
        heroCTA: "Read the Agile 6xD Storybook",
        heroCTALink: "/marketplace/guides/dq-6xd",
        heroFootnote: "Internal-first. Proven through real work.",
        foundationTitle: "What are DQ Products",
        foundationSubtitle:
          "Execution systems built from how DQ delivers. Used in live work before release. Only what survives real pressure ships. Designed to operate together as one system.",
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
            description: "Refined through real projects; if it fails in delivery, it never ships.",
            icon: Layers,
          },
          {
            title: "System, Not Tools",
            description: "Products operate together as one spine to prevent fragmentation.",
            icon: Layers,
          },
        ],
        foundationCTA: "Read the full Agile 6xD storybook",
        foundationCTATo: "/marketplace/guides/dq-6xd",
        foundationFootnote:
          "GHC shapes how we think; 6xD shapes how we execute; only delivery-proven systems become products.",
        responsesTitle: "Execution systems used at DQ",
        responsesIntro:
          "Products are organised into four execution classes. Each class solves a specific failure and has a clear place in the lifecycle.",
        responsesTitleFontSize: "30px",
        responsesIntroFontSize: "16px",
        responsesSequential: true,
        responseTags: [
          "DBP",
          "DT 2.0",
          "DCO",
          "TxM",
        ],
        responseCards: SIXXD_CARDS,
        bottomCTA: "",
        actionCards: SIXXD_ACTIONS,
        finalHeadline: "Internal first. Delivery proven.",
        finalSubtitle:
          "We execute inside DQ first, release only after proof in delivery, and scale what works. Execution stays continuous, trusted, and repeatable.",
        finalCTALabel: "Read the Agile 6xD Storybook",
        finalCTATo: "/marketplace/guides/dq-6xd",
        finalCTASecondaryLabel: "Go to product platform ↗",
        finalCTASecondaryTo: "/marketplace/directory/products",
        finalHeadlineFontSize: "36px",
        takeActionTitleFontSize: "30px",
        takeActionSubtitleFontSize: "16px",
        takeActionTitle: "Choose your path",
        takeActionSubtitle:
          "Learn by doing, understand the system, or deploy platforms — pick the entry that matches your readiness and role.",
        takeActionLayout: "feature",
      }}
    />
  );
}
