import React, { useEffect, useState } from "react";
import { Loader, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FadeInUpOnScroll } from "./AnimationUtils";
import { NewsCard } from "./CardComponents";
import { fetchAllNews, fetchAllJobs } from '@/services/mediaCenterService';
import type { NewsItem as MediaCenterNewsItem } from '@/data/media/news';
import type { JobItem } from '@/data/media/jobs';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string } | null>(null);
  const [mediaCenterNews, setMediaCenterNews] = useState<MediaCenterNewsItem[]>([]);
  const [mediaCenterJobs, setMediaCenterJobs] = useState<JobItem[]>([]);
  const [loadFallback, setLoadFallback] = useState(false);

  // Fetch latest media center items once, reuse for display
  useEffect(() => {
    let isMounted = true;

    async function loadMediaCenterData() {
      setIsLoading(true);
      setError(null);
      try {
        const [allNews, allJobs] = await Promise.all([
          fetchAllNews(),
          fetchAllJobs()
        ]);
        if (!isMounted) return;
        setMediaCenterNews(allNews ?? []);
        setMediaCenterJobs(allJobs ?? []);
        setLoadFallback((!allNews || allNews.length === 0) && (!allJobs || allJobs.length === 0));
      } catch (err) {
        if (!isMounted) return;
        console.error("Error loading Media Center data:", err);
        setError({
          message: "Unable to load latest media items. Showing fallback content.",
        });
        setMediaCenterNews([]);
        setMediaCenterJobs([]);
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

  // Data helpers (news + blogs + jobs) with graceful fallback
  const getNewsData = () => {
    // Get news and blogs from media center
    const newsSource = mediaCenterNews.length > 0 ? mediaCenterNews : newsItems;
    const newsAndBlogs = newsSource
      .filter(
        (item) =>
          item.type === "Announcement" ||
          item.type === "Thought Leadership" ||
          item.format === "Blog" ||
          item.format === "Article" ||
          item.newsType === "Company News" ||
          item.newsType === "Policy Update" ||
          item.newsType === "Upcoming Events"
      )
      .map((item) => ({
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        date: item.date,
        category: item.department || item.newsType || item.category || "News",
        tags: [item.department || item.newsType || item.category || "News"],
        source:
          item.newsSource || item.byline || item.author || "DQ Media Center",
        imageUrl: item.image || undefined,
      }));

    // Get jobs from media center
    const jobsData = mediaCenterJobs.map((job) => ({
      id: job.id,
      title: job.title,
      excerpt: job.summary,
      date: job.postedOn,
      category: "Job Posting",
      tags: [job.department, job.roleType],
      source: "DQ Careers",
      imageUrl: job.image || undefined,
    }));

    // Combine and sort by date (newest first), then take top 6
    return [...newsAndBlogs, ...jobsData]
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      })
      .slice(0, 6);
  };


  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <FadeInUpOnScroll className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 clamp-1">
            Stay Ahead with Workspace Insights
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mx-auto clamp-1 leading-tight whitespace-normal sm:whitespace-nowrap max-w-full sm:max-w-4xl text-balance">
            Stay current with DQ updates, insights, and events designed to help you work smarter and grow every day.
          </p>
        </FadeInUpOnScroll>
        {/* Loading State */}
        {isLoading && <LoadingIndicator />}

        {/* Error banner (content still shown below if fallback available) */}
        {error && !isLoading && <ErrorMessage message={error.message} />}

        {/* News Content */}
        {!isLoading && (
          <section
            id="kh-panel-news"
            aria-label="Latest news and updates"
            aria-live="polite"
          >
            {loadFallback && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Showing cached newsroom highlights while live data is unavailable.
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getNewsData().length === 0 ? (
                <div className="col-span-full text-center text-gray-600">
                  No news items available right now.
                </div>
              ) : (
                getNewsData().map((item, index) => (
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
                      onQuickView={() => {
                        const route = item.category === "Job Posting" 
                          ? `/marketplace/jobs/${item.id}`
                          : `/marketplace/news/${item.id}`;
                        navigate(route);
                      }}
                      onReadMore={() => {
                        const route = item.category === "Job Posting" 
                          ? `/marketplace/jobs/${item.id}`
                          : `/marketplace/news/${item.id}`;
                        navigate(route);
                      }}
                    />
                  </div>
                ))
              )}
            </div>
          </section>
        )}
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
