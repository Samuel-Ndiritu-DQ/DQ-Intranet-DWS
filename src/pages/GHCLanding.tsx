import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Hexagon,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Users,
  Briefcase,
  Zap,
  Target,
  Heart,
  User,
  Shield,
  GitBranch,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import SixPerspectivesCarousel from '@/components/perspectives/SixPerspectivesCarousel';

const IconGlyph = ({ glyph, className }: { glyph: string; className?: string }) => (
  <span className={`inline-flex items-center justify-center leading-none font-semibold ${className ?? ''}`}>
    {glyph}
  </span>
);

const IconOne = (props: { className?: string }) => <IconGlyph glyph="1" {...props} />;
const IconInfinity = (props: { className?: string }) => <IconGlyph glyph="∞" {...props} />;
const IconSeven = (props: { className?: string }) => <IconGlyph glyph="7" {...props} />;

/* -----------------------------------------
   Types & data
   ----------------------------------------- */

interface CompetencyCard {
  id: string;
  number: number;
  category: string;
  title: string;
  lensLine1?: string;
  lensLine2?: string;
  executionQuestion?: string;
  executionLens?: string;
  story: string;
  problem: string;
  response: string;
  situation?: string;
  changes?: string[];
  impact?: string;
  route: string;
  icon: LucideIcon;
  gradient: string; // Tailwind gradient classes
  accent: string; // Hex or hsl string for highlights
  image: string;
  ctaLabel?: string;
}

interface ActionCard {
  title: string;
  icon: LucideIcon;
  badge: string;
  description: string;
  tags: string[];
  cta: string;
  path: string;
  bg: string;
  accent: string;
  badgeColor: string;
  iconColor: string;
  variant?: 'primary' | 'secondary';
}

const COMPETENCY_CARDS_DEFAULT: CompetencyCard[] = [
  {
    id: 'purpose',
    number: 1,
    category: 'Vision',
    title: 'Vision',
    story: 'Problem: When pressure hit, priorities blurred and teams pulled in different directions. Response: Vision re-anchored daily decisions to purpose, keeping direction stable under stress.',
    problem: 'When pressure hit, priorities blurred and teams pulled in different directions.',
    response: 'Vision re-anchored daily decisions to purpose, keeping direction stable under stress.',
    situation: 'Critical launches piled up and priorities collided; teams lost the thread of purpose.',
    changes: [
      'Reframed goals into one north star statement',
      'Aligned weekly decisions to the stated purpose',
      'Stopped workstreams that did not serve the purpose',
    ],
    impact: 'Decisions converged and teams moved in one direction under pressure.',
    route: '/marketplace/guides/dq-vision',
    icon: Target,
    gradient: 'bg-gradient-to-br from-[#131e42] via-[#1d2f64] to-[#e1513b]',
    accent: '#f0f6ff',
    image: 'https://image2url.com/r2/default/images/1770035368667-bfe10133-4bed-44c7-aefa-c6fed9c807f5.webp',
  },
  {
    id: 'culture',
    number: 2,
    category: 'House of Values',
    title: 'House of Values',
    story: 'Problem: Incentives split teams and slowed decisions. Response: Shared values restored a common rulebook, allowing speed and trust to hold.',
    problem: 'Incentives split teams and slowed decisions.',
    response: 'Shared values restored a common rulebook, allowing speed and trust to hold.',
    situation: 'Sales pushed speed, delivery pushed quality, and teams argued over what “good” meant.',
    changes: [
      'Agreed three behavioural guardrails for all decisions',
      'Embedded values into approval checklists',
      'Held weekly value-based retros on tough calls',
    ],
    impact: 'Debates shortened and teams trusted decisions made against the shared rulebook.',
    route: '/marketplace/guides/dq-hov',
    icon: Heart,
    gradient: 'bg-gradient-to-br from-[#1b2553] via-[#243a75] to-[#e1513b]',
    accent: '#f0f6ff',
    image: 'https://image2url.com/r2/default/images/1770021175279-eacca42a-60ed-4c4d-9d14-e724a3e76cd6.png',
  },
  {
    id: 'identity',
    number: 3,
    category: 'Persona',
    title: 'Persona',
    story:
      'Problem: Roles shifted constantly and individual impact became unclear. Response: Persona clarified the value each person contributes, regardless of role or squad.',
    problem: 'Roles shifted constantly and individual impact became unclear.',
    response: 'Persona clarified the value each person contributes, regardless of role or squad.',
    situation: 'Escalations bounced between managers because no one owned customer onboarding.',
    changes: [
      'Named a single accountable owner for onboarding',
      'Mapped DRI for every decision point',
      'Published a simple “who decides / who delivers” chart',
    ],
    impact: 'Escalations stopped and onboarding cycle time dropped because owners were clear.',
    route: '/marketplace/guides/dq-persona',
    icon: User,
    gradient: 'bg-gradient-to-br from-[#131e42] via-[#30478a] to-[#f0f6ff]',
    accent: '#f0f6ff',
    image: 'https://image2url.com/r2/default/images/1770021424913-1f4da872-0e43-488d-b842-a0e724f6c2c4.png',
  },
  {
    id: 'execution',
    number: 4,
    category: 'Agile TMS',
    title: 'Agile TMS',
    story:
      'Problem: Strategy changed faster than plans could adapt. Response: Agile TMS translated direction into adaptive missions and execution rhythm.',
    problem: 'Strategy changed faster than plans could adapt.',
    response: 'Agile TMS translated direction into adaptive missions and execution rhythm.',
    situation: 'Strategy changed monthly but teams were stuck on quarterly plans with mismatched cadences.',
    changes: [
      'Shifted to six-week missions with weekly checkpoints',
      'Synced rituals and demos across teams',
      'Retired stale backlog items each mission',
    ],
    impact: 'Execution cadence matched strategy shifts and handoffs became predictable.',
    route: '/marketplace/guides/dq-agile-tms',
    icon: Zap,
    gradient: 'bg-gradient-to-br from-[#1f2c63] via-[#2d3f80] to-[#e1513b]',
    accent: '#f0f6ff',
    image: 'https://image2url.com/r2/default/images/1770034932697-4c5808eb-ce02-4b4f-bb98-d02e0c693303.png',
  },
  {
    id: 'governance',
    number: 5,
    category: 'Agile SoS',
    title: 'Agile SoS',
    story:
      'Problem: Traditional governance slowed teams when speed mattered most. Response: Agile SoS introduced light guardrails that enabled pace without losing control.',
    problem: 'Traditional governance slowed teams when speed mattered most.',
    response: 'Agile SoS introduced light guardrails that enabled pace without losing control.',
    situation: 'Teams duplicated data across tools and couldn’t see blockers until too late.',
    changes: [
      'Standardised one delivery board per team with shared fields',
      'Integrated alerts into daily channels instead of email',
      'Trimmed tools down to a single source for status and risk',
    ],
    impact: 'Risks surfaced earlier and delivery sped up because tools matched daily flow.',
    route: '/marketplace/guides/dq-agile-sos',
    icon: Shield,
    gradient: 'bg-gradient-to-br from-[#131e42] via-[#1b2553] to-[#e1513b]',
    accent: '#f0f6ff',
    image: 'https://image2url.com/r2/default/images/1770021849077-fe5f09ea-4467-4e4c-b1da-a46420d40712.png',
  },
  {
    id: 'flow',
    number: 6,
    category: 'Agile Flows',
    title: 'Agile Flows',
    story:
      'Problem: Value broke down in handoffs and feedback arrived too late. Response: Agile Flows connected intent to outcomes end-to-end so feedback moved faster than blockers.',
    problem: 'Value broke down in handoffs and feedback arrived too late.',
    response: 'Agile Flows connected intent to outcomes end-to-end so feedback moved faster than blockers.',
    situation: 'Value died in handoffs and issues surfaced only after release.',
    changes: [
      'Mapped intent-to-outcome steps with owners',
      'Shortened feedback loops with shared demos',
      'Removed extra handoffs that delayed fixes',
    ],
    impact: 'Feedback arrived sooner and work flowed without stalls.',
    route: '/marketplace/guides/dq-agile-flows',
    icon: GitBranch,
    gradient: 'bg-gradient-to-br from-[#1b2553] via-[#30478a] to-[#e1513b]',
    accent: '#f0f6ff',
    image: 'https://image2url.com/r2/default/images/1770025109470-b2166816-791e-4ee2-be27-3d57e1e1de96.png',
  },
  {
    id: 'transform',
    number: 7,
    category: 'Agile 6xD',
    title: 'Agile 6xD',
    story:
      'Problem: Transformation succeeded in pilots but stalled at scale. Response: Agile 6xD made change repeatable across diagnose, design, deliver, deploy, drive, and defend.',
    problem: 'Transformation succeeded in pilots but stalled at scale.',
    response: 'Agile 6xD made change repeatable across diagnose, design, deliver, deploy, drive, and defend.',
    situation: 'Every decision waited for exec sign-off, stalling rollouts.',
    changes: [
      'Defined decisions to delegate versus escalate',
      'Set clear guardrails and success measures',
      'Instituted weekly trust-but-verify reviews',
    ],
    impact: 'Teams shipped faster while leaders focused on strategic calls.',
    route: '/marketplace/guides/dq-agile-6xd',
    icon: Sparkles,
    gradient: 'bg-gradient-to-br from-[#131e42] via-[#1f2c63] to-[#e1513b]',
    accent: '#f0f6ff',
    image: 'https://image2url.com/r2/default/images/1770026507869-cfe44464-3090-4295-b90e-76feed9666df.png',
  },
];

const FEATURE_CARDS_DEFAULT = [
  {
    title: 'Operating DNA',
    icon: IconOne,
    description: 'How organisations think, decide, and act under pressure and change.',
  },
  {
    title: 'Built for Change',
    icon: IconInfinity,
    description: 'Designed to adapt continuously as strategy, context, and scale evolve.',
  },
  {
    title: 'Seven Elements',
    icon: IconSeven,
    description: 'Connected responses that realign work when traditional models break.',
  },
];

const RESPONSE_TAGS = [
  'Vision',
  'House of Values',
  'Persona',
  'Agile TMS',
  'Agile SoS',
  'Agile Flows',
  'Agile 6xD',
];

const ACTION_CARDS_DEFAULT: ActionCard[] = [
  {
    title: 'Storybooks',
    icon: BookOpen,
    badge: 'Storybooks',
    description:
      'See the thinking and stories behind the Golden Honeycomb and how DQ chose to work this way. Start here when you want the “why” that shaped the system.',
    tags: ['Narratives', 'Decisions', 'Origins'],
    cta: 'Read the story',
    path: 'https://preview.shorthand.com/Pg0KQCF1Rp904ao7',
    bg: 'bg-[#fde6de]',
    accent: 'text-[#e1513b]',
    badgeColor: 'text-[#e1513b]',
    iconColor: '#e1513b',
  },
  {
    title: 'Learning Center',
    icon: GraduationCap,
    badge: 'Learning',
    description:
      'Build the capabilities expected inside this operating system. Practical paths that help you apply GHC in real decisions and delivery.',
    tags: ['Guided paths', 'Practice', 'Skills'],
    cta: 'Start learning',
    path: '/lms',
    bg: 'bg-[#f0f6ff]',
    accent: 'text-[#131e42]',
    badgeColor: 'text-[#131e42]',
    iconColor: '#e1513b',
  },
  {
    title: 'Knowledge Center',
    icon: Users,
    badge: 'Guidance',
    description:
      'When work gets complex, this is where you find the plays, guardrails, and references that keep execution aligned and moving.',
    tags: ['Plays', 'Guardrails', 'References'],
    cta: 'Find what you need',
    path: '/marketplace/guides',
    bg: 'bg-[#e6ebff]',
    accent: 'text-[#131e42]',
    badgeColor: 'text-[#131e42]',
    iconColor: '#131e42',
  },
  {
    title: 'Viva Engage',
    icon: Briefcase,
    badge: 'Community',
    description:
      'Watch GHC in motion through conversations and collaboration. Ask, share, and see how teams live the operating system every day.',
    tags: ['Conversation', 'Collaboration', 'Community'],
    cta: 'Join the conversation',
    path: 'https://engage.cloud.microsoft/main/feed',
    bg: 'bg-white',
    accent: 'text-[#131e42]',
    badgeColor: 'text-[#131e42]',
    iconColor: '#e1513b',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: i * 0.05 },
  }),
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

/* -----------------------------------------
   Honeycomb SVG background
   ----------------------------------------- */

function HoneycombPattern() {
  const rows = 6;
  const cols = 10;
  const size = 48;
  const width = size * Math.sqrt(3);
  const height = size * 2;
  const offsetX = width / 2;
  const offsetY = height / 2;

  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.4]"
      viewBox={`0 0 ${cols * width + offsetX} ${rows * height + offsetY}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="ghc-hex-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(0,0%,70%)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="hsl(0,0%,70%)" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="ghc-hex-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(0,0%,60%)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="hsl(0,0%,60%)" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <g fill="url(#ghc-hex-fill)" stroke="url(#ghc-hex-stroke)" strokeWidth="1">
        {Array.from({ length: rows }).map((_, row) =>
          Array.from({ length: cols }).map((_, col) => {
            const x = col * width + (row % 2) * (width / 2) + offsetX;
            const y = row * (height * 0.75) + offsetY;
            const points = [
              [x, y - size],
              [x + (size * Math.sqrt(3)) / 2, y - size / 2],
              [x + (size * Math.sqrt(3)) / 2, y + size / 2],
              [x, y + size],
              [x - (size * Math.sqrt(3)) / 2, y + size / 2],
              [x - (size * Math.sqrt(3)) / 2, y - size / 2],
            ]
              .map(([px, py]) => `${px},${py}`)
              .join(' ');
            return <polygon key={`${row}-${col}`} points={points} />;
          })
        )}
      </g>
    </svg>
  );
}

/* -----------------------------------------
   Floating orbs (framer-motion)
   ----------------------------------------- */

function FloatingOrbs() {
  const orbs = [
    { size: 60, x: '12%', y: '18%', delay: 0, duration: 8 },
    { size: 45, x: '85%', y: '22%', delay: 1, duration: 10 },
    { size: 55, x: '72%', y: '58%', delay: 2, duration: 9 },
    { size: 40, x: '22%', y: '68%', delay: 0.5, duration: 11 },
    { size: 50, x: '48%', y: '38%', delay: 1.5, duration: 7 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#d4a574] opacity-[0.15]"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
          }}
          animate={{
            x: [0, 20, -15, 0],
            y: [0, -18, 12, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            delay: orb.delay,
          }}
        />
      ))}
    </div>
  );
}

/* -----------------------------------------
   Main component
   ----------------------------------------- */

type LandingOverrides = {
  badgeLabel?: string;
  heroHeadline?: string;
  heroHeadlineHighlightWord?: string;
  heroCTA?: string;
  heroSupporting?: string;
  heroFootnote?: string;
  heroCTALink?: string;
  foundationTitle?: string;
  foundationSubtitle?: string;
  foundationTitleFontSize?: string;
  foundationSubtitleFontSize?: string;
  foundationCards?: typeof FEATURE_CARDS_DEFAULT;
  foundationCTA?: string;
  responsesTitle?: string;
  responsesIntro?: string;
  responsesTitleFontSize?: string;
  responsesIntroFontSize?: string;
  responsesSequential?: boolean;
  responseCards?: CompetencyCard[];
  responseTags?: string[];
  bottomCTA?: string;
  actionCards?: ActionCard[];
  finalHeadline?: string;
  finalSubtitle?: string;
  finalCTALabel?: string;
  finalCTATo?: string;
  finalCTASecondaryLabel?: string;
  finalCTASecondaryTo?: string;
  finalHeadlineFontSize?: string;
  finalSubtitleFontSize?: string;
  takeActionTitle?: string;
  takeActionSubtitle?: string;
  takeActionTitleFontSize?: string;
  takeActionSubtitleFontSize?: string;
  takeActionLayout?: 'grid' | 'feature';
};

type GHCLandingProps = {
  badgeLabel?: string;
  overrides?: LandingOverrides;
};

export function GHCLanding({ badgeLabel, overrides }: GHCLandingProps) {
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const responseCards = overrides?.responseCards ?? COMPETENCY_CARDS_DEFAULT;
  const responseTags = overrides?.responseTags ?? [
    'Vision',
    'House of Values',
    'Persona',
    'Agile TMS',
    'Agile SoS',
    'Agile Flows',
    'Agile 6xD',
  ];
  const featureCards = overrides?.foundationCards ?? FEATURE_CARDS_DEFAULT;
  const actionCards = overrides?.actionCards ?? ACTION_CARDS_DEFAULT;
  const heroHeadline = overrides?.heroHeadline;
  const heroHeadlineHighlightWord = overrides?.heroHeadlineHighlightWord;
  const heroCTA = overrides?.heroCTA ?? 'Read the Storybook';
  const heroSupporting =
    overrides?.heroSupporting ??
    'DQ built an operating system of seven responses so you can see what broke in work — and how to realign it.';
  const heroFootnote = overrides?.heroFootnote;
  const heroCTALink = overrides?.heroCTALink ?? 'https://preview.shorthand.com/Pg0KQCF1Rp904ao7';
  const foundationSubtitle =
    overrides?.foundationSubtitle ??
    'Not a framework to memorise — an operating system for modern work that guides how you think, decide, adapt, and create impact.';
  const foundationTitle = overrides?.foundationTitle ?? 'What is the Golden Honeycomb?';
  const foundationTitleFontSize = overrides?.foundationTitleFontSize;
  const foundationSubtitleFontSize = overrides?.foundationSubtitleFontSize;
  const foundationCTA = overrides?.foundationCTA ?? 'Read the full GHC Storybook';
  const responsesTitle = overrides?.responsesTitle ?? 'Seven responses';
  const responsesIntro =
    overrides?.responsesIntro ??
    'Each exists because something in traditional work stopped working. Problem → response.';
  const responsesSequential = overrides?.responsesSequential ?? false;
  const bottomCTA = overrides?.bottomCTA ?? 'Explore all Seven Responses together';
  const finalHeadline = overrides?.finalHeadline ?? 'Where the Golden Honeycomb becomes real';
  const finalSubtitle =
    overrides?.finalSubtitle ??
    'The Golden Honeycomb comes to life through real decisions, tools, and daily work inside the DQ Digital Workspace.';

  const handleEnterHoneycomb = useCallback(() => {
    navigate('/marketplace/guides/dq-ghc');
  }, [navigate]);

  const handleReadStorybook = useCallback(() => {
    const isExternal = /^https?:\/\//i.test(heroCTALink);
    if (isExternal) {
      window.open(heroCTALink, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate(heroCTALink);
  }, [heroCTALink, navigate]);

  const scrollToCarousel = useCallback(() => {
    document.getElementById('ghc-carousel')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const scrollToNext = useCallback(() => {
    const nextIndex = Math.min(carouselIndex + 1, responseCards.length - 1);

    if (responsesSequential) {
      setCarouselIndex(nextIndex);
      return;
    }

    if (!carouselRef.current) return;
    const cardWidth = carouselRef.current.scrollWidth / responseCards.length;
    carouselRef.current.scrollTo({ left: nextIndex * cardWidth, behavior: 'smooth' });
    setCarouselIndex(nextIndex);
  }, [carouselIndex, responseCards.length, responsesSequential]);

  const scrollToPrev = useCallback(() => {
    const nextIndex = Math.max(carouselIndex - 1, 0);

    if (responsesSequential) {
      setCarouselIndex(nextIndex);
      return;
    }

    if (!carouselRef.current) return;
    const cardWidth = carouselRef.current.scrollWidth / responseCards.length;
    carouselRef.current.scrollTo({ left: nextIndex * cardWidth, behavior: 'smooth' });
    setCarouselIndex(nextIndex);
  }, [carouselIndex, responseCards.length, responsesSequential]);

  const handleCarouselScroll = useCallback(() => {
    if (responsesSequential) return;
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth } = carouselRef.current;
    const cardWidth = scrollWidth / responseCards.length;
    const index = Math.round(scrollLeft / cardWidth);
    setCarouselIndex(Math.min(index, responseCards.length - 1));
  }, [responseCards.length, responsesSequential]);

  const goToSlide = useCallback((index: number) => {
    if (responsesSequential) {
      setCarouselIndex(Math.min(Math.max(index, 0), responseCards.length - 1));
      return;
    }
    if (!carouselRef.current) return;
    const cardWidth = carouselRef.current.scrollWidth / responseCards.length;
    carouselRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
    setCarouselIndex(index);
  }, [responseCards.length, responsesSequential]);

  const renderHeroHeadline = () => {
    const baseStyle = {
      fontSize: 'clamp(40px, 5vw, 72px)',
      lineHeight: 1.05,
      whiteSpace: 'nowrap' as const,
    };
    const highlightClass = 'text-[#e1513b] underline decoration-[#e1513b] decoration-4 underline-offset-8';

    if (heroHeadline) {
      if (heroHeadlineHighlightWord) {
        const lowerHeadline = heroHeadline.toLowerCase();
        const lowerHighlight = heroHeadlineHighlightWord.toLowerCase();
        const startIndex = lowerHeadline.indexOf(lowerHighlight);

        if (startIndex !== -1) {
          const before = heroHeadline.slice(0, startIndex);
          const highlight = heroHeadline.slice(startIndex, startIndex + heroHeadlineHighlightWord.length);
          const after = heroHeadline.slice(startIndex + heroHeadlineHighlightWord.length);

          return (
            <span className="ghc-font-display font-bold text-white" style={baseStyle}>
              {before}
              <span className={highlightClass}>{highlight}</span>
              {after}
            </span>
          );
        }
      }

      return (
        <span className="ghc-font-display font-bold text-white" style={baseStyle}>
          <span className={highlightClass}>{heroHeadline}</span>
        </span>
      );
    }

    return (
      <span
        className="ghc-font-display font-bold text-white"
        style={{
          fontSize: 'clamp(40px, 5vw, 72px)',
          lineHeight: 1.05,
          whiteSpace: 'nowrap',
        }}
      >
        The world of work is{' '}
        <span className={highlightClass}>
          broken.
        </span>
      </span>
    );
  };

  return (
    <div className="ghc-page flex min-h-screen flex-col bg-[hsl(var(--ghc-background))]">
      <Header />

      {/* -----------------------------------------
          1. HERO SECTION — match reference hero UI
          ----------------------------------------- */}
      <section
        className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-24 pb-16"
        style={{
          background: 'linear-gradient(135deg, #131e42 0%, #1b2553 45%, #e1513b 100%)',
        }}
      >
        <div className="absolute inset-0 z-0">
          <HoneycombPattern />
        </div>
        <FloatingOrbs />

        <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8 text-center max-w-4xl">
          <motion.div
            className="inline-flex items-center gap-2 rounded-full bg-[#f0f6ff]/20 border border-[#e1513b]/50 shadow-sm px-4 py-1.5 text-sm text-[#e1513b] backdrop-blur mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="h-4 w-4 text-[#e1513b]" />
            <span>{badgeLabel ?? 'The Golden Honeycomb of Competencies (GHC)'}</span>
          </motion.div>
          <motion.div
            className="mx-auto flex flex-col items-center justify-center text-center gap-4"
            style={{ maxWidth: '100%' }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {renderHeroHeadline()}
            <span
              className="text-white/85"
              style={{
                fontSize: 'clamp(16px, 2.6vw, 20px)',
                lineHeight: 1.1,
                maxWidth: '100%',
                whiteSpace: 'normal',
              }}
            >
              {heroSupporting}
            </span>
          </motion.div>
          <motion.div
            className="flex flex-wrap gap-4 justify-center mt-6 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              type="button"
              onClick={handleReadStorybook}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold border border-[#f0f6ff]/50 text-[#f0f6ff] bg-white/10 hover:bg-white/15 transition-colors shadow-sm"
            >
              <BookOpen className="h-5 w-5 text-white" />
              {heroCTA}
              <ArrowRight className="h-5 w-5 text-white" />
            </button>
          </motion.div>
          {heroFootnote ? (
            <motion.div
              className="flex items-center justify-center gap-8 text-sm text-white/80 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              <span className="text-white/85 text-sm md:text-base">{heroFootnote}</span>
            </motion.div>
          ) : null}
        </div>

        <motion.button
          type="button"
          onClick={scrollToCarousel}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-[#b0b0b0] hover:text-[#2c2c2c] transition-colors"
          aria-label="Scroll to next section"
        >
          <span className="text-[10px] uppercase tracking-[0.35em] font-medium">DISCOVER</span>
          <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown className="h-5 w-5" />
          </motion.span>
        </motion.button>
      </section>

      {/* -----------------------------------------
          2. WHAT IS GHC SECTION
          ----------------------------------------- */}
      <SectionWhatIsGHC onReadStorybook={handleEnterHoneycomb} content={overrides} />

      {/* -----------------------------------------
          3. SEVEN RESPONSES CAROUSEL
          ----------------------------------------- */}
      <SectionCarousel
        carouselRef={carouselRef}
        carouselIndex={carouselIndex}
        onPrev={scrollToPrev}
        onNext={scrollToNext}
        onScroll={handleCarouselScroll}
        onDotClick={goToSlide}
        onExploreMarketplace={() => navigate('/marketplace/guides')}
        content={overrides}
      />

      {/* -----------------------------------------
          4. TAKE ACTION SECTION
          ----------------------------------------- */}
      <SectionTakeAction navigate={navigate} content={overrides} />

      {/* -----------------------------------------
          5. FINAL CTA SECTION
          ----------------------------------------- */}
      <SectionFinalCTA navigate={navigate} content={overrides} />

      <Footer isLoggedIn={false} />
    </div>
  );
}

/* -----------------------------------------
   Section: What is GHC
   ----------------------------------------- */

interface SectionWhatIsGHCProps {
  onReadStorybook: () => void;
  content?: LandingOverrides;
}

function SectionWhatIsGHC({ onReadStorybook, content }: SectionWhatIsGHCProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const foundationTitle = content?.foundationTitle ?? 'What is the Golden Honeycomb?';
  const foundationSubtitle = content?.foundationSubtitle ?? 'Not a framework to memorise — an operating system for modern work.';
  const foundationTitleFontSize = content?.foundationTitleFontSize;
  const foundationSubtitleFontSize = content?.foundationSubtitleFontSize;
  const foundationCards = content?.foundationCards ?? FEATURE_CARDS_DEFAULT;
  const foundationCTA = content?.foundationCTA ?? 'Read the full GHC storybook';
  const foundationCTATo =
    content?.foundationCTATo ?? 'https://preview.shorthand.com/Pg0KQCF1Rp904ao7';
  const isTwoCardLayout = foundationCards.length === 2;

  return (
    <section id="ghc-what" ref={ref} className="py-20 md:py-28 bg-[#f0f6ff]">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          className="text-center max-w-6xl mx-auto"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={containerVariants}
          custom={0}
        >
          <motion.p
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full bg-[#f0f6ff]/20 border border-[#e1513b]/50 shadow-sm px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-[#e1513b] backdrop-blur mb-4 mx-auto justify-center"
          >
            THE FOUNDATION
          </motion.p>
          <div className="mx-auto w-fit text-center space-y-3">
            <motion.h2
              variants={itemVariants}
              className="ghc-font-display text-4xl md:text-6xl font-bold text-[#131e42] text-center"
              style={{
                fontSize: foundationTitleFontSize ?? '36px',
                lineHeight: 1.05,
              }}
            >
              {foundationTitle}
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-[#4a5678] text-base md:text-lg leading-relaxed max-w-6xl mx-auto text-center"
              style={{
                fontSize: foundationSubtitleFontSize ?? '18px',
                whiteSpace: 'pre-line',
              }}
            >
              {foundationSubtitle}
            </motion.p>
          </div>

        </motion.div>

        <motion.div
          className={`grid grid-cols-1 ${isTwoCardLayout ? 'md:grid-cols-2 lg:grid-cols-2 max-w-5xl' : 'md:grid-cols-3 max-w-6xl'} gap-8 mt-14 mx-auto`}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={containerVariants}
          custom={1}
        >
          {foundationCards.map((card) => (
            <motion.div
              key={card.title}
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="rounded-3xl bg-white border border-[#e0e7ff] shadow-sm hover:shadow-md transition-shadow text-center px-10 py-10"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#ffe7e0] flex items-center justify-center mx-auto mb-6">
                <card.icon className="h-6 w-6 text-[#e1513b]" />
              </div>
              <h3 className="ghc-font-display text-2xl font-semibold text-[#131e42] mb-4">
                {card.title}
              </h3>
              <p className="text-[#4a5678] text-sm leading-relaxed max-w-[22rem] mx-auto">
                {card.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-10 flex justify-center max-w-6xl mx-auto px-2"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <button
            type="button"
            onClick={() => {
              if (foundationCTATo) {
                window.open(foundationCTATo, '_blank', 'noopener,noreferrer');
              } else {
                onReadStorybook();
              }
            }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold border border-[#d9e3ff] text-[#131e42] bg-white hover:bg-[#e8eefc] transition-colors shadow-sm"
          >
            <BookOpen className="h-5 w-5" />
            {foundationCTA}
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* -----------------------------------------
   Section: Seven Responses Carousel
   ----------------------------------------- */

interface SectionCarouselProps {
  carouselRef: React.RefObject<HTMLDivElement>;
  carouselIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onScroll: () => void;
  onDotClick: (index: number) => void;
  onExploreMarketplace: () => void;
  content?: LandingOverrides;
}

function SectionCarousel({
  carouselRef,
  carouselIndex,
  onPrev,
  onNext,
  onScroll,
  onDotClick,
  onExploreMarketplace,
  content,
}: SectionCarouselProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [activeTag, setActiveTag] = useState(0);

  const responsesTitle = content?.responsesTitle ?? 'Seven Responses in Action';
  const responsesIntro =
    content?.responsesIntro ??
    'Each exists because something in traditional work stopped working. Problem → response.';
  const responsesTitleFontSize = content?.responsesTitleFontSize ?? '36px';
  const responsesIntroFontSize = content?.responsesIntroFontSize ?? '18px';
  const responsesSequential = content?.responsesSequential ?? false;
  const responseTags =
    content?.responseTags ??
    ['Vision', 'House of Values', 'Persona', 'Agile TMS', 'Agile SoS', 'Agile Flows', 'Agile 6xD'];
  const responseCards = content?.responseCards ?? COMPETENCY_CARDS_DEFAULT;
  const bottomCTA = content?.bottomCTA ?? 'Explore all Seven Responses together →';

  useEffect(() => {
    setActiveTag(carouselIndex);
  }, [carouselIndex]);

  const handleTagClick = (index: number) => {
    setActiveTag(index);
    onDotClick(index);
  };

  if (responsesSequential) {
    return (
      <SixPerspectivesCarousel
        id="ghc-carousel"
        title={responsesTitle}
        subtitle={responsesIntro}
        titleFontSize={responsesTitleFontSize}
        subtitleFontSize={responsesIntroFontSize}
      />
    );
  }

  return (
    <SevenResponsesRailCarousel
      id="ghc-carousel"
      title={responsesTitle}
      subtitle={responsesIntro}
      titleFontSize={responsesTitleFontSize}
      subtitleFontSize={responsesIntroFontSize}
      tags={responseTags}
      cards={responseCards}
    />
  );
}

interface CompetencyCardProps {
  card: CompetencyCard;
  variant?: 'default' | 'stage';
}

function CompetencyCard({ card, variant = 'default' }: CompetencyCardProps) {
  const navigate = useNavigate();
  const hasLens = Boolean(card.lensLine1 || card.lensLine2);
  const isStage = variant === 'stage';

  return (
    <article
      className={`relative overflow-hidden rounded-3xl bg-white border border-[#e5e9f5] shadow-sm flex flex-col ${
        isStage ? 'md:max-h-[60vh]' : 'min-h-[560px] h-full'
      }`}
    >
      <div className={`${isStage ? 'h-40 md:h-44' : 'h-[240px] md:h-[280px]'} w-full overflow-hidden`}>
        <img
          src={card.image}
          alt={card.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className={`flex flex-col flex-1 ${isStage ? 'p-4 md:p-5 gap-2' : 'p-6 gap-4'}`}>
        <div className={`flex items-start justify-between ${isStage ? 'min-h-[52px]' : 'min-h-[64px]'}`}>
          <h3
            className="ghc-font-display text-xl md:text-2xl font-semibold text-[#131e42] max-w-[80%] leading-tight"
            style={{ fontSize: '20px' }}
          >
            {card.title}
          </h3>
          <span className="bg-[#f0f6ff] text-[#1f2d5c] text-xs px-3 py-1 rounded-full font-semibold tracking-wide">
            {card.category}
          </span>
        </div>

        <div className={`flex items-center gap-2 ${isStage ? 'text-xs' : 'text-sm'} text-[#6b7390]`}>
          <Hexagon className="h-4 w-4" />
          <span>DQ Workspace · Real scenario</span>
        </div>

        <div className={`flex flex-col gap-2 ${isStage ? '' : 'min-h-[160px]'}`}>
          <p
            className={`text-[#131e42] text-base md:text-lg leading-snug font-normal ${isStage ? 'min-h-[40px]' : 'min-h-[52px]'}`}
            style={{ fontSize: '16px' }}
          >
            <span className="font-semibold">Problem:</span>{' '}
            {card.executionQuestion
              ? card.executionQuestion
              : hasLens && card.lensLine1
                ? card.lensLine1
                : card.problem}
          </p>

          <p
            className={`text-[#4a5678] text-sm md:text-base leading-relaxed font-normal ${
              isStage ? 'line-clamp-2 min-h-[40px]' : 'min-h-[88px]'
            }`}
            style={{ fontSize: '16px' }}
          >
            <span className="font-semibold">Response:</span>{' '}
            {card.executionLens
              ? card.executionLens
              : hasLens && card.lensLine2
                ? card.lensLine2
                : card.response}
          </p>
        </div>

        <div className={isStage ? 'pt-0.5' : 'mt-auto pt-2'}>
          <button
            type="button"
            onClick={() => navigate(card.route)}
            className="text-[#e1513b] font-semibold inline-flex items-center gap-1 hover:underline"
          >
            {card.ctaLabel ?? 'Explore in Knowledge Center'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function ResponseRailCard({ card }: { card: CompetencyCard }) {
  const navigate = useNavigate();

  return (
    <article className="rounded-3xl bg-white border border-[#e5e9f5] shadow-[0_18px_48px_rgba(3,15,53,0.10),0_2px_8px_rgba(3,15,53,0.06)] overflow-hidden h-full flex flex-col">
      <img
        src={card.image}
        alt={card.title}
        className="w-full h-[200px] sm:h-[220px] md:h-[250px] lg:h-[280px] object-cover object-center"
        loading="lazy"
        decoding="async"
      />

      <div className="px-6 pb-6 pt-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="ghc-font-display text-xl md:text-2xl font-semibold text-[#131e42]" style={{ fontSize: '20px' }}>
            {card.title}
          </h3>
          <span className="bg-[#fef1eb] text-[#e1513b] text-xs px-3 py-1 rounded-full font-semibold">
            {card.category}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#6b7390]">
          <Hexagon className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
          <span>DQ Workspace · Real scenario</span>
        </div>

        <p className="mt-4 text-[#131e42] leading-[1.28] font-normal" style={{ fontSize: '16px' }}>
          <span className="font-semibold">Problem:</span> {card.problem}
        </p>

        <p className="mt-3 text-[#4a5678] leading-snug font-normal" style={{ fontSize: '16px' }}>
          <span className="font-semibold">Response:</span> {card.response}
        </p>

        <button
          type="button"
          onClick={() => navigate(card.route)}
          className="mt-auto pt-5 text-[hsl(var(--accent))] font-semibold inline-flex items-center gap-1 hover:underline self-start"
        >
          {card.ctaLabel ?? 'Explore in Knowledge Center →'}
        </button>
      </div>
    </article>
  );
}

function SevenResponsesRailCarousel({
  id,
  title,
  subtitle,
  titleFontSize,
  subtitleFontSize,
  tags,
  cards,
}: {
  id: string;
  title: string;
  subtitle: string;
  titleFontSize?: string;
  subtitleFontSize?: string;
  tags: string[];
  cards: CompetencyCard[];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    if (isPaused) return;
    const id = window.setInterval(() => {
      emblaApi.scrollNext();
    }, 6500);
    return () => window.clearInterval(id);
  }, [emblaApi, isPaused]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  return (
    <section id={id} className="relative py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.24em] bg-[hsl(var(--accent)/0.10)] border border-[hsl(var(--accent)/0.35)] text-[hsl(var(--accent))] shadow-sm backdrop-blur">
              THE FRAMEWORK
            </span>
            <h2
              className="ghc-font-display text-4xl md:text-5xl font-semibold text-[#131e42] mt-4 leading-[1.05]"
              style={titleFontSize ? { fontSize: titleFontSize } : undefined}
            >
              {title}
            </h2>
            <p
              className="text-[#4a5678] mt-3 text-lg md:text-xl leading-snug"
              style={subtitleFontSize ? { fontSize: subtitleFontSize } : undefined}
            >
              {subtitle}
            </p>
          </div>

          <div
            className="mt-10 grid grid-cols-1 lg:grid-cols-[34%_66%] gap-8 lg:gap-10 items-start"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <aside className="p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#6b7390]">
                  Response {selectedIndex + 1} of {cards.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={scrollPrev}
                    className="w-10 h-10 rounded-full bg-white/95 backdrop-blur border border-[#dce5ff] shadow-sm flex items-center justify-center text-[#131e42] hover:bg-[#f0f6ff] hover:text-[hsl(var(--accent))] transition-colors"
                    aria-label="Previous response"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={scrollNext}
                    className="w-10 h-10 rounded-full bg-white/95 backdrop-blur border border-[#dce5ff] shadow-sm flex items-center justify-center text-[#131e42] hover:bg-[#f0f6ff] hover:text-[hsl(var(--accent))] transition-colors"
                    aria-label="Next response"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <ol className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1" aria-label="Response list">
                {tags.map((tag, i) => {
                  const isActive = i === selectedIndex;
                  const number = String(i + 1).padStart(2, '0');
                  return (
                    <li key={tag}>
                      <button
                        type="button"
                        onClick={() => scrollTo(i)}
                        className={[
                          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                          isActive ? 'text-[#131e42]' : 'text-[#4a5678] hover:text-[#131e42]',
                        ].join(' ')}
                        aria-current={isActive ? 'step' : undefined}
                      >
                        <span className={`text-xs font-semibold ${isActive ? 'text-[#e1513b]' : 'text-[#9aa4c6]'}`}>
                          {number}
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            isActive ? 'text-[#131e42] underline underline-offset-4 decoration-[#e1513b] decoration-2' : 'text-[#4a5678]'
                          }`}
                        >
                          {tag}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </aside>

            <div className="min-w-0">
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {cards.map((card) => (
                    <div key={card.id} className="flex-[0_0_100%] min-w-0">
                      <ResponseRailCard card={card} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-2 mt-5 lg:hidden" aria-label="Response progress">
                {cards.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => scrollTo(i)}
                    className={[
                      'transition-all duration-300 rounded-full',
                      i === selectedIndex
                        ? 'w-6 h-2 bg-[hsl(var(--accent))]'
                        : 'w-2 h-2 bg-[#131e42]/40 hover:bg-[#131e42]/60',
                    ].join(' ')}
                    aria-label={`Go to response ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -----------------------------------------
   Section: Take Action
   ----------------------------------------- */

function SectionTakeAction({ navigate, content }: { navigate: (path: string) => void; content?: LandingOverrides }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  const actionCards = content?.actionCards ?? ACTION_CARDS_DEFAULT;
  const takeActionTitle = content?.takeActionTitle ?? 'Bring it to life';
  const takeActionSubtitle =
    content?.takeActionSubtitle ?? 'Understanding is the start. GHC becomes real through application, practice, and lived experience.';
  const takeActionTitleFontSize = content?.takeActionTitleFontSize;
  const takeActionSubtitleFontSize = content?.takeActionSubtitleFontSize;
  const takeActionLayout = content?.takeActionLayout ?? 'grid';
  const handleNavigate = (path: string) => {
    if (path.startsWith('http')) {
      window.open(path, '_blank', 'noopener,noreferrer');
    } else {
      navigate(path);
    }
  };

  if (takeActionLayout === 'grid') {
    return (
      <section
        ref={ref}
        className="py-20 md:py-24"
        style={{
          background: 'linear-gradient(180deg, #f0f6ff 0%, #ffffff 55%, #f0f6ff 100%)',
        }}
      >
        <div className="container mx-auto px-4 md:px-6 lg:px-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.24em] bg-[#f0f6ff]/20 border border-[#e1513b]/50 text-[#e1513b] shadow-sm backdrop-blur mx-auto mb-2">
              TAKE ACTION
            </p>
            <h2
              className="ghc-font-display text-3xl md:text-4xl font-semibold text-[#131e42] mb-3"
              style={{ fontSize: takeActionTitleFontSize ?? '36px' }}
            >
              {takeActionTitle}
            </h2>
            <p
              className="text-[#4a5678] max-w-2xl mx-auto text-lg"
              style={{ fontSize: takeActionSubtitleFontSize ?? '18px', whiteSpace: 'nowrap' }}
            >
              {takeActionSubtitle}
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            {actionCards.map((card) => (
              <motion.div
                key={card.title}
                variants={itemVariants}
                className={`rounded-3xl p-6 md:p-8 shadow-sm border border-white/60 ${card.bg} flex flex-col`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center">
                    <card.icon className="h-6 w-6" style={{ color: card.iconColor }} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${card.badgeColor}`}>
                      {card.badge}
                    </p>
                    <h3 className="mt-2 text-xl md:text-2xl font-semibold text-[#131e42]">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm md:text-base text-[#4a5678] leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-white/70 text-[#4a5678] text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleNavigate(card.path)}
                  className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold ${card.accent} hover:opacity-80`}
                >
                  {card.cta}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    );
  }

  const primaryCard = actionCards.find((card) => card.variant === 'primary') ?? actionCards[0];
  const secondaryCards = actionCards.filter((card) => card !== primaryCard);
  const hasPrimary = Boolean(primaryCard);

  return (
    <section
      ref={ref}
      className="py-20 md:py-24"
      style={{
        background: 'linear-gradient(180deg, #f0f6ff 0%, #ffffff 55%, #f0f6ff 100%)',
      }}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.24em] bg-[#f0f6ff]/20 border border-[#e1513b]/50 text-[#e1513b] shadow-sm backdrop-blur mx-auto mb-2">
            TAKE ACTION
          </p>
          <h2
            className="ghc-font-display text-3xl md:text-4xl font-semibold text-[#131e42] mb-3"
            style={{ fontSize: takeActionTitleFontSize ?? '36px' }}
          >
            {takeActionTitle}
          </h2>
          <p
            className="text-[#4a5678] max-w-2xl mx-auto text-lg"
            style={{ fontSize: takeActionSubtitleFontSize ?? '18px', whiteSpace: 'nowrap' }}
          >
            {takeActionSubtitle}
          </p>
        </motion.div>

        {hasPrimary ? (
          <div className="grid gap-6 max-w-6xl mx-auto">
            {primaryCard ? (
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                className={`group relative p-8 md:p-10 rounded-3xl border shadow-[0_18px_36px_rgba(0,0,0,0.12)] bg-gradient-to-br from-[#131e42] via-[#1f2c63] to-[#e1513b] text-white`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:gap-6">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
                    <primaryCard.icon className="h-7 w-7" style={{ color: '#f0f6ff' }} />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#fbd7cd]">
                        {primaryCard.badge}
                      </span>
                      <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/15 border border-white/10 text-white">
                        Start
                      </span>
                    </div>
                    <h3 className="ghc-font-display text-2xl md:text-3xl font-semibold">
                      {primaryCard.title}
                    </h3>
                    <p className="text-base md:text-lg text-white/90 leading-relaxed">
                      {primaryCard.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {primaryCard.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-white/15 text-white px-3 py-1 text-xs font-medium border border-white/20"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => handleNavigate(primaryCard.path)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#131e42] font-semibold shadow-[0_10px_24px_rgba(0,0,0,0.18)] hover:bg-[#f0f6ff] transition-colors"
                  >
                    {primaryCard.cta}
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ) : null}

            {secondaryCards.length ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                variants={containerVariants}
                custom={0}
              >
                {secondaryCards.map((item, i) => (
                  <motion.div
                    key={item.title}
                    variants={itemVariants}
                    whileHover={{ y: -6 }}
                    className={`group relative p-7 md:p-8 rounded-3xl ${item.bg} border border-[#e3e8f5] shadow-[0_10px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.09)] transition-all`}
                  >
                    <div className="flex items-start gap-4 md:gap-5">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-[0_6px_16px_rgba(0,0,0,0.08)] flex items-center justify-center">
                        <item.icon className="h-6 w-6" style={{ color: item.iconColor }} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className={`text-xs font-semibold tracking-[0.18em] uppercase ${item.badgeColor}`}>
                          {item.badge}
                        </p>
                        <h3 className="ghc-font-display text-xl md:text-2xl font-semibold text-[#131e42]">
                          {item.title}
                        </h3>
                        <p className="text-sm md:text-base text-[#4a5678] leading-relaxed">{item.description}</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 rounded-full bg-white/75 text-[#131e42] px-3 py-1 text-xs font-medium shadow-sm cursor-default"
                            >
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.iconColor }} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNavigate(item.path)}
                      className={`inline-flex items-center gap-1 text-sm font-semibold mt-6 ${item.accent} group-hover:underline`}
                    >
                      {item.cta}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            ) : null}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto"
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={containerVariants}
            custom={0}
          >
            {actionCards.map((item, i) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className={`group relative p-7 md:p-9 rounded-3xl ${item.bg} shadow-[0_10px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)] transition-all`}
              >
                <div className="flex items-start gap-4 md:gap-5">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-[0_6px_16px_rgba(0,0,0,0.08)] flex items-center justify-center">
                    <item.icon className="h-6 w-6" style={{ color: item.iconColor }} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={`text-xs font-semibold tracking-[0.18em] uppercase ${item.badgeColor}`}>
                      {item.badge}
                    </p>
                    <h3 className="ghc-font-display text-xl md:text-2xl font-semibold text-[#131e42]">
                      {item.title}
                    </h3>
                    <p className="text-sm md:text-base text-[#4a5678]">{item.description}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-white/75 text-[#131e42] px-3 py-1 text-xs font-medium shadow-sm cursor-default"
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.iconColor }} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleNavigate(item.path)}
                  className={`inline-flex items-center gap-1 text-sm font-semibold mt-6 ${item.accent} group-hover:underline`}
                >
                  {item.cta}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* -----------------------------------------
   Section: Final CTA
   ----------------------------------------- */

function SectionFinalCTA({ navigate, content }: { navigate: (path: string) => void; content?: LandingOverrides }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const finalHeadline = content?.finalHeadline ?? 'Work aligned inside the Golden Honeycomb';
  const finalSubtitle =
    content?.finalSubtitle ??
    'The Golden Honeycomb comes to life inside the DQ Digital Workspace, guiding tools, decisions, and daily work.';
  const finalCTALabel = content?.finalCTALabel ?? 'Go to the DQ Digital Workspace';
  const finalCTATo = content?.finalCTATo ?? '/';
  const finalCTASecondaryLabel = content?.finalCTASecondaryLabel;
  const finalCTASecondaryTo = content?.finalCTASecondaryTo;
  const finalHeadlineFontSize = content?.finalHeadlineFontSize;
  const finalSubtitleFontSize = content?.finalSubtitleFontSize;

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 20% 20%, rgba(240,246,255,0.35), transparent 45%), radial-gradient(circle at 80% 30%, rgba(225,81,59,0.25), transparent 45%), linear-gradient(115deg, #131e42 0%, #1f2d5c 60%, #e1513b 100%)',
      }}
    >
      <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="relative min-h-[420px] lg:min-h-[520px] flex items-center">
          {/* Animated background orbs */}
          <motion.div
            className="absolute w-[420px] h-[420px] rounded-full blur-3xl"
            style={{ left: '-10%', top: '10%', backgroundColor: 'rgba(240,246,255,0.28)' }}
            animate={{ x: [0, 30, -10, 0], y: [0, -20, 10, 0], scale: [1, 1.06, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-[360px] h-[360px] rounded-full blur-3xl"
            style={{ right: '5%', bottom: '-5%', backgroundColor: 'rgba(225,81,59,0.28)' }}
            animate={{ x: [0, -25, 15, 0], y: [0, 18, -12, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className="relative z-10 max-w-3xl py-16 md:py-20 px-2 sm:px-4 md:px-0 text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
          <motion.p
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.24em] bg-white/15 border border-[#e1513b]/50 text-[#e1513b] backdrop-blur mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            DQ DIGITAL WORKSPACE
          </motion.p>
            <motion.h2
              className="ghc-font-display font-bold text-4xl sm:text-5xl md:text-5xl lg:text-6xl leading-[1.1] text-white tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{ fontSize: finalHeadlineFontSize }}
            >
              {finalHeadline}
            </motion.h2>
            <motion.p
              className="mt-6 text-base sm:text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.25 }}
              style={{ fontSize: finalSubtitleFontSize }}
            >
              {finalSubtitle}
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  if (finalCTATo.startsWith('http')) {
                    window.open(finalCTATo, '_blank', 'noopener,noreferrer');
                  } else {
                    navigate(finalCTATo);
                  }
                }}
                className="inline-flex items-center gap-2.5 h-[52px] px-7 rounded-lg bg-white text-[#131e42] font-semibold text-base shadow-xl shadow-black/12 transition transform hover:-translate-y-0.5 hover:bg-white/95"
              >
                {finalCTALabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              {finalCTASecondaryLabel && finalCTASecondaryTo ? (
                <button
                  type="button"
                  onClick={() => {
                    if (finalCTASecondaryTo.startsWith('http')) {
                      window.open(finalCTASecondaryTo, '_blank', 'noopener,noreferrer');
                    } else {
                      navigate(finalCTASecondaryTo);
                    }
                  }}
                  className="inline-flex items-center gap-2.5 h-[52px] px-7 rounded-lg border border-white/60 text-white font-semibold text-base shadow-lg shadow-black/10 transition transform hover:-translate-y-0.5 hover:bg-white/10"
                >
                  {finalCTASecondaryLabel}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              ) : null}
            </div>
        </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default GHCLanding;
