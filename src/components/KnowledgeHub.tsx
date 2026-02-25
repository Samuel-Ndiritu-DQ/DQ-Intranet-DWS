import React, { useEffect, useState } from "react";
import { Newspaper, Loader, AlertCircle, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FadeInUpOnScroll } from "./AnimationUtils";
import { NewsCard } from "./CardComponents";
import { fetchAllNews } from '@/services/mediaCenterService';
import type { NewsItem as MediaCenterNewsItem } from '@/data/media/news';

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  imageUrl: string;
  source?: string;
}

// Mock data for fallback - keep the existing data
const newsItems: NewsItem[] = [
  {
    id: "1",
    title: "Agile Working at DQ | Not Just for Projects",
    excerpt:
      "Discover how agile principles are helping teams across DQ collaborate faster and deliver with confidence.",
    date: "August 21, 2025",
    category: "Agile Working",
    source: "DQ Insights",
    imageUrl:
      "https://images.unsplash.com/photo-1521791055366-0d553872125f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  },
  {
    id: "2",
    title: "From Vision to Impact | The DQ Storybook Goes Live!",
    excerpt:
      "The DQ Storybook is now published—bringing together our competencies, values, and transformation journey.",
    date: "August 14, 2025",
    category: "Strategy",
    source: "DQ Governance Office",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  },
  {
    id: "3",
    title: "Leadership Principles | What’s Your Superpower?",
    excerpt:
      "Uncover what makes effective leaders thrive at DQ and explore practical tools to grow your leadership strengths.",
    date: "August 19, 2025",
    category: "Leadership",
    source: "DQ Learning Hub",
    imageUrl:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  },
  {
    id: "4",
    title: "Grounded in Growth and Emotional Intelligence",
    excerpt:
      "Learn how emotional intelligence drives collaboration, resilience, and growth across our teams.",
    date: "August 8, 2025",
    category: "Culture",
    source: "DQ Culture Team",
    imageUrl:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  },
  {
    id: "5",
    title: "Shifts Allocation Guidelines Released",
    excerpt:
      "New workspace guidelines launched to improve workload balance, transparency, and efficiency.",
    date: "July 25, 2025",
    category: "Policy Update",
    source: "DQ Operations",
    imageUrl:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  },
  {
    id: "6",
    title: "New DQ Innovation Hub Opens",
    excerpt:
      "A digital hub for experimentation and collaboration is now live, inviting teams to explore and innovate together.",
    date: "July 10, 2025",
    category: "Innovation",
    source: "DQ Labs",
    imageUrl:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  },
];

// Event and Resource mock data removed (unused) to satisfy noUnusedLocals.

// Define interface for tab items
type TabId = "ghc" | "guidelines" | "learning";

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

interface SegmentedTabsProps {
  tabs: TabItem[];
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}

const SegmentedTabs: React.FC<SegmentedTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="w-full flex justify-center mb-6" role="tablist" aria-label="Knowledge Hub tabs">
      <div className="inline-flex items-center rounded-full bg-white shadow-sm ring-1 ring-black/5 px-1 py-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`kh-panel-${tab.id}`}
              id={`kh-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`relative mx-0.5 px-4 sm:px-5 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8EFF]/40 inline-flex items-center ${
                isActive
                  ? "bg-[#DDE8FF] text-[#030F35] shadow-[inset_0_-2px_0_0_#5B8EFF]"
                  : "text-[#3b4a66] hover:bg-[#F5F8FF]"
              }`}
            >
              <span className="mr-2" aria-hidden="true">
                {tab.icon}
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Loading indicator component
const LoadingIndicator = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <Loader size={40} className="text-blue-600 animate-spin mb-4" />
    <p className="text-gray-600 font-medium">Loading data...</p>
  </div>
);

// Error message component
const ErrorMessage = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <AlertCircle size={40} className="text-red-500 mb-4" />
    <h3 className="text-lg font-bold text-gray-800 mb-2">Error Loading Data</h3>
    <p className="text-gray-600 max-w-md mx-auto">
      {message || "We couldn't load the data. Please try again later."}
    </p>
  </div>
);

// KnowledgeHub Content Component
const KnowledgeHubContent = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("ghc");
  const [isTabChanging, setIsTabChanging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string } | null>(null);
  const [mediaCenterNews, setMediaCenterNews] = useState<MediaCenterNewsItem[]>([]);
  const [loadFallback, setLoadFallback] = useState(false);

  const tabs: TabItem[] = [
    {
      id: "ghc",
      label: "GHC",
      icon: <Newspaper size={16} className="#030F35-600" />,
    },
    {
      id: "guidelines",
      label: "Guidelines",
      icon: <Radio size={16} className="#030F35-600" />,
    },
    {
      id: "learning",
      label: "Learning",
      icon: <Radio size={16} className="#030F35-600" />,
    },
  ];

  // Handle tab change with animation
  const handleTabChange = (id: TabId) => {
    if (activeTab === id) return;
    setIsTabChanging(true);
    setTimeout(() => {
      setActiveTab(id);
      setIsTabChanging(false);
    }, 300);
  };

  // Fetch latest media center items once, reuse for display
  useEffect(() => {
    let isMounted = true;

    async function loadMediaCenterData() {
      setIsLoading(true);
      setError(null);
      try {
        const [allNews] = await Promise.all([
          fetchAllNews()
        ]);
        if (!isMounted) return;
        setMediaCenterNews(allNews ?? []);
        setLoadFallback(!allNews || allNews.length === 0);
      } catch (err) {
        if (!isMounted) return;
        console.error("Error loading Media Center data:", err);
        setError({
          message: "Unable to load latest media items. Showing fallback content.",
        });
        setMediaCenterNews([]);
        setLoadFallback(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadMediaCenterData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Get GHC data
  const getGhcData = () => {
    const newsSource = mediaCenterNews.length > 0 ? mediaCenterNews : newsItems;
    return newsSource
      .filter((item) => {
        const category = (item.department || item.newsType || item.category || "").toLowerCase();
        return category.includes('ghc') || category.includes('governance') || category.includes('agile');
      })
      .map((item) => ({
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        date: item.date,
        category: item.department || item.newsType || item.category || "GHC",
        tags: [item.department || item.newsType || item.category || "GHC"],
        source: item.newsSource || item.byline || item.author || "DQ GHC",
        imageUrl: item.image || undefined,
      }))
      .slice(0, 6);
  };

  // Get Guidelines data
  const getGuidelinesData = () => {
    const newsSource = mediaCenterNews.length > 0 ? mediaCenterNews : newsItems;
    return newsSource
      .filter((item) => {
        const category = (item.department || item.newsType || item.category || "").toLowerCase();
        return category.includes('guideline') || category.includes('policy') || category.includes('update');
      })
      .map((item) => ({
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        date: item.date,
        category: item.department || item.newsType || item.category || "Guidelines",
        tags: [item.department || item.newsType || item.category || "Guidelines"],
        source: item.newsSource || item.byline || item.author || "DQ Guidelines",
        imageUrl: item.image || undefined,
      }))
      .slice(0, 6);
  };

  // Get Learning data
  const getLearningData = () => {
    const newsSource = mediaCenterNews.length > 0 ? mediaCenterNews : newsItems;
    return newsSource
      .filter((item) => {
        const category = (item.department || item.newsType || item.category || "").toLowerCase();
        return category.includes('learning') || category.includes('course') || category.includes('training') || category.includes('leadership');
      })
      .map((item) => ({
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        date: item.date,
        category: item.department || item.newsType || item.category || "Learning",
        tags: [item.department || item.newsType || item.category || "Learning"],
        source: item.newsSource || item.byline || item.author || "DQ Learning",
        imageUrl: item.image || undefined,
      }))
      .slice(0, 6);
  };


  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <FadeInUpOnScroll className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 clamp-1">
            Latest DQ Developments
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mx-auto clamp-2 leading-relaxed max-w-4xl">
            Explore the latest GHC courses and guidelines designed to boost your skills and accelerate your DQ journey.
          </p>
        </FadeInUpOnScroll>
        {/* Segmented Tabs */}
        <SegmentedTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        {/* Tab Content with Fade Transition */}
        <div
          className={`transition-opacity duration-300 ${
            isTabChanging ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Loading State */}
          {isLoading && <LoadingIndicator />}

          {/* Error banner (content still shown below if fallback available) */}
          {error && !isLoading && <ErrorMessage message={error.message} />}

          {/* GHC Tab */}
          {activeTab === "ghc" && !isLoading && (
            <section
              id="kh-panel-ghc"
              aria-label="GHC content"
              aria-live="polite"
            >
              {loadFallback && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Showing cached GHC highlights while live data is unavailable.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getGhcData().length === 0 ? (
                  <div className="col-span-full text-center text-gray-600">
                    No GHC items available right now.
                  </div>
                ) : (
                  getGhcData().map((item, index) => (
                    <div
                      key={item.id}
                      className="animate-fade-in-up"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                      }}
                    >
                      <NewsCard
                        content={{
                          title: item.title,
                          description: item.excerpt,
                          imageUrl: item.imageUrl,
                          tags: item.tags ?? [item.category],
                          date: item.date,
                          source: item.source,
                        }}
                        ctaLabel="Explore GHC"
                        onQuickView={() => {
                          navigate(`/marketplace/guides?tab=strategy&collapsed=guide_type%2Csub_domain%2Cunit%2Clocation%2Ctestimonial_category%2Cproduct_type%2Cproduct_stage%2Cguidelines_category%2Ccategorization%2Cattachments%2Cstrategy_framework%2Cglossary_knowledge_system%2Cglossary_ghc_dimension%2Cglossary_6xd_perspective%2Cglossary_letter%2Cfaq_category`);
                        }}
                        onReadMore={() => {
                          navigate(`/marketplace/guides?tab=strategy&collapsed=guide_type%2Csub_domain%2Cunit%2Clocation%2Ctestimonial_category%2Cproduct_type%2Cproduct_stage%2Cguidelines_category%2Ccategorization%2Cattachments%2Cstrategy_framework%2Cglossary_knowledge_system%2Cglossary_ghc_dimension%2Cglossary_6xd_perspective%2Cglossary_letter%2Cfaq_category`);
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* Guidelines Tab */}
          {activeTab === "guidelines" && !isLoading && (
            <section
              id="kh-panel-guidelines"
              aria-label="Guidelines content"
              aria-live="polite"
            >
              {loadFallback && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Showing cached guidelines while live data is unavailable.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getGuidelinesData().length === 0 ? (
                  <div className="col-span-full text-center text-gray-600">
                    No guidelines available right now.
                  </div>
                ) : (
                  getGuidelinesData().map((item, index) => (
                    <div
                      key={item.id}
                      className="animate-fade-in-up"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                      }}
                    >
                      <NewsCard
                        content={{
                          title: item.title,
                          description: item.excerpt,
                          imageUrl: item.imageUrl,
                          tags: item.tags ?? [item.category],
                          date: item.date,
                          source: item.source,
                        }}
                        ctaLabel="Open Guideline"
                        onQuickView={() => {
                          navigate(`/guides`);
                        }}
                        onReadMore={() => {
                          navigate(`/guides`);
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* Learning Tab */}
          {activeTab === "learning" && !isLoading && (
            <section
              id="kh-panel-learning"
              aria-label="Learning content"
              aria-live="polite"
            >
              {loadFallback && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Showing cached learning content while live data is unavailable.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getLearningData().length === 0 ? (
                  <div className="col-span-full text-center text-gray-600">
                    No learning content available right now.
                  </div>
                ) : (
                  getLearningData().map((item, index) => (
                    <div
                      key={item.id}
                      className="animate-fade-in-up"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                      }}
                    >
                      <NewsCard
                        content={{
                          title: item.title,
                          description: item.excerpt,
                          imageUrl: item.imageUrl,
                          tags: item.tags ?? [item.category],
                          date: item.date,
                          source: item.source,
                        }}
                        ctaLabel="Start Course"
                        onQuickView={() => {
                          navigate(`/lms`);
                        }}
                        onReadMore={() => {
                          navigate(`/lms`);
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

        </div>
      </div>
      {/* Add keyframes for animations */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes zoom-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 0.5;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.5s ease-out forwards;
        }
        .animate-zoom-in {
          animation: zoom-in 0.5s ease-out forwards;
        }
        .animate-ripple {
          animation: ripple 0.8s ease-out;
        }
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
};

// Main KnowledgeHub component
const KnowledgeHub: React.FC = () => {
  // Always render without Apollo since we don't have the dependency
  return <KnowledgeHubContent />;
};

export default KnowledgeHub;
