import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

type Card = {
  id?: string;
  number?: number;
  category?: string;
  title: string;
  executionQuestion?: string;
  executionLens?: string;
  ctaLabel?: string;
  route?: string;
  icon?: LucideIcon;
  gradient?: string;
  accent?: string;
  image?: string;
};

type ActionCard = {
  title: string;
  icon?: LucideIcon;
  badge?: string;
  description: string;
  tags?: string[];
  cta: string;
  path: string;
  bg?: string;
  accent?: string;
  badgeColor?: string;
  iconColor?: string;
  variant?: string;
};

type SimpleCard = {
  title: string;
  description: string;
  icon?: LucideIcon;
};

type Overrides = {
  heroHeadline?: string;
  heroHeadlineHighlightWord?: string;
  heroHeadlineFontSize?: string;
  heroSupporting?: string;
  heroCTA?: string;
  heroCTALink?: string;
  heroFootnote?: string;
  foundationTitle?: string;
  foundationSubtitle?: string;
  foundationTitleFontSize?: string;
  foundationSubtitleFontSize?: string;
  foundationCards?: SimpleCard[];
  foundationCTA?: string;
  foundationCTATo?: string;
  foundationFootnote?: string;
  responsesTitle?: string;
  responsesIntro?: string;
  responsesTitleFontSize?: string;
  responsesIntroFontSize?: string;
  responsesSequential?: boolean;
  responseTags?: string[];
  responseCards?: Card[];
  actionCards?: ActionCard[];
  takeActionTitle?: string;
  takeActionSubtitle?: string;
  takeActionTitleFontSize?: string;
  takeActionSubtitleFontSize?: string;
  bottomCTA?: string;
  finalHeadline?: string;
  finalSubtitle?: string;
  finalCTALabel?: string;
  finalCTATo?: string;
  finalCTASecondaryLabel?: string;
  finalCTASecondaryTo?: string;
  finalHeadlineFontSize?: string;
};

type GHCLandingProps = {
  badgeLabel?: string;
  overrides?: Overrides;
};

export default function GHCLanding({ badgeLabel, overrides = {} }: GHCLandingProps) {
  const {
    heroHeadline = "",
    heroHeadlineHighlightWord,
    heroHeadlineFontSize = "64px",
    heroSupporting = "",
    heroCTA,
    heroCTALink = "#",
    heroFootnote,
    foundationTitle,
    foundationSubtitle,
    foundationCards = [],
    foundationCTA,
    foundationCTATo,
    foundationFootnote,
    responsesTitle,
    responsesIntro,
    responseCards = [],
    actionCards = [],
    takeActionTitle,
    takeActionSubtitle,
    finalHeadline,
    finalSubtitle,
    finalCTALabel,
    finalCTATo,
    finalCTASecondaryLabel,
    finalCTASecondaryTo,
  } = overrides;

  const highlightHeadline = () => {
    if (!heroHeadlineHighlightWord || !heroHeadline) return heroHeadline;
    const parts = heroHeadline.split(heroHeadlineHighlightWord);
    return (
      <>
        {parts[0]}
        <span className="text-[#e1513b] underline decoration-4 underline-offset-4">
          {heroHeadlineHighlightWord}
        </span>
        {parts[1]}
      </>
    );
  };

  return (
    <div className="bg-white text-[#0F172A]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#0f1d4a] via-[#162757] to-[#e1513b] px-4 py-20 text-center text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.15),transparent_25%),radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),transparent_35%)]" />
        <div className="relative max-w-5xl mx-auto space-y-6">
          {badgeLabel && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-sm font-semibold">
              {badgeLabel}
            </span>
          )}
          <h1
            className="font-bold leading-tight"
            style={{ fontSize: heroHeadlineFontSize }}
          >
            {highlightHeadline()}
          </h1>
          {heroSupporting && (
            <p className="text-lg text-white/90 max-w-3xl mx-auto">{heroSupporting}</p>
          )}
          {heroCTA && (
            <div className="flex justify-center">
              <Link
                to={heroCTALink}
                className="rounded-xl bg-white/10 px-6 py-3 text-base font-semibold text-white shadow-lg border border-white/30 hover:bg-white/20 transition"
              >
                {heroCTA}
              </Link>
            </div>
          )}
          {heroFootnote && <p className="text-sm text-white/70">{heroFootnote}</p>}
        </div>
      </section>

      {/* What */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto space-y-6 text-center">
          {foundationTitle && (
            <h2 className="text-3xl font-bold">{foundationTitle}</h2>
          )}
          {foundationSubtitle && (
            <p className="text-lg text-gray-700 leading-relaxed">
              {foundationSubtitle}
            </p>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {foundationCards.map((card, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm"
              >
                <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
          {foundationCTA && foundationCTATo && (
            <div className="pt-2">
              <Link
                to={foundationCTATo}
                className="text-[#e1513b] font-semibold hover:underline"
              >
                {foundationCTA}
              </Link>
            </div>
          )}
          {foundationFootnote && (
            <p className="text-sm text-gray-600">{foundationFootnote}</p>
          )}
        </div>
      </section>

      {/* Execution systems */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-8">
          {responsesTitle && (
            <h2 className="text-3xl font-bold text-center">{responsesTitle}</h2>
          )}
          {responsesIntro && (
            <p className="text-lg text-gray-700 text-center max-w-4xl mx-auto">
              {responsesIntro}
            </p>
          )}
          <div className="grid gap-6 md:grid-cols-2">
            {responseCards.map((card) => (
              <div
                key={card.id || card.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase text-[#e1513b]">
                    {card.category}
                  </div>
                  {card.number !== undefined && (
                    <div className="text-sm font-semibold text-gray-500">0{card.number}</div>
                  )}
                </div>
                <h3 className="text-2xl font-bold">{card.title}</h3>
                {card.executionQuestion && (
                  <p className="text-sm font-semibold text-gray-800">{card.executionQuestion}</p>
                )}
                {card.executionLens && (
                  <p className="text-sm text-gray-700 leading-relaxed">{card.executionLens}</p>
                )}
                {card.ctaLabel && card.route && (
                  <Link
                    to={card.route}
                    className="text-sm font-semibold text-[#e1513b] hover:underline"
                  >
                    {card.ctaLabel}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Choose your path */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">{overrides.takeActionTitle}</h2>
          <p className="text-lg text-gray-700">{overrides.takeActionSubtitle}</p>
          <div className="grid gap-6 md:grid-cols-3">
            {actionCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between text-sm font-semibold text-gray-600">
                  <span>{card.badge}</span>
                </div>
                <h3 className="text-xl font-bold">{card.title}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{card.description}</p>
                <Link
                  to={card.path}
                  className="text-sm font-semibold text-[#e1513b] hover:underline"
                >
                  {card.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof / Close */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          {finalHeadline && (
            <h2 className="text-3xl font-bold">{finalHeadline}</h2>
          )}
          {finalSubtitle && (
            <p className="text-lg text-gray-700 leading-relaxed">{finalSubtitle}</p>
          )}
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            {finalCTALabel && finalCTATo && (
              <Link
                to={finalCTATo}
                className="rounded-lg bg-[#e1513b] px-5 py-3 text-white font-semibold hover:brightness-105 transition"
              >
                {finalCTALabel}
              </Link>
            )}
            {finalCTASecondaryLabel && finalCTASecondaryTo && (
              <Link
                to={finalCTASecondaryTo}
                className="rounded-lg border border-[#e1513b] px-5 py-3 text-[#e1513b] font-semibold hover:bg-[#e1513b]/10 transition"
              >
                {finalCTASecondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
