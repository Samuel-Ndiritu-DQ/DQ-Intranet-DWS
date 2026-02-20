import React, { useState, useEffect } from 'react';
import { ArrowRight, FileText, TrendingUp, BookOpen } from 'lucide-react';
import { FadeInUpOnScroll } from './AnimationUtils';
import { fetchAllNews, fetchAllJobs } from '@/services/mediaCenterService';
import type { NewsItem } from '@/data/media/news';
import type { JobItem } from '@/data/media/jobs';

interface FeaturedProgram {
  id: string;
  partnership: string;
  title: string;
  description: string;
  learnMoreHref: string;
  applyNowHref?: string;
  backgroundImage?: string;
  category: 'Articles' | 'Predictions' | 'Case Studies' | 'Jobs';
}

function isPodcast(item: NewsItem): boolean {
  if (item.format === 'Podcast') {
    return true;
  }

  if (item.tags?.some((tag) => tag.toLowerCase().includes('podcast'))) {
    return true;
  }

  return false;
}

function isEvent(item: NewsItem): boolean {
  if (item.newsType === 'Upcoming Events') {
    return true;
  }

  if (item.tags?.some((tag) => tag.toLowerCase().includes('event'))) {
    return true;
  }

  return false;
}

function mapNewsToFeatured(item: NewsItem): FeaturedProgram {
  const isBlog = item.type === 'Thought Leadership' && !isPodcast(item);
  const partnership = item.byline || item.author || 'DQ Communications';
  
  // Use the actual image from the news item
  const bgImage = item.image || '/images/honeycomb.png';
  
  let title: string;
  let category: 'Articles' | 'Predictions' | 'Case Studies';
  
  if (isBlog) {
    title = item.title;
    category = 'Articles';
  } else if (item.type === 'Announcement') {
    title = item.title;
    category = 'Articles';
  } else {
    title = item.title;
    category = 'Case Studies';
  }
  
  return {
    id: `news-${item.id}`,
    partnership,
    title,
    description: item.excerpt,
    learnMoreHref: `/marketplace/news/${item.id}`,
    backgroundImage: `url(${bgImage})`,
    category,
  };
}

function mapJobToFeatured(item: JobItem): FeaturedProgram {
  const partnership = item.department || 'DQ Careers';
  
  // Use the actual image from the job item
  const bgImage = item.image || '/images/honeycomb.png';
  
  return {
    id: `job-${item.id}`,
    partnership,
    title: item.title,
    description: item.description,
    learnMoreHref: `/marketplace/opportunities/${item.id}`,
    backgroundImage: `url(${bgImage})`,
    category: 'Jobs',
  };
}

const fallbackPrograms: FeaturedProgram[] = [
  {
    id: 'fallback-1',
    partnership: 'Digital Qatalyst',
    title: 'Welcome to the Digital Workspace',
    description:
      'Explore onboarding, services, media, and knowledge resources designed to help every associate start fast and deliver with confidence.',
    learnMoreHref: '/marketplace/guides?tab=guidelines',
    backgroundImage:
      'linear-gradient(90deg, rgba(251, 83, 53, 0.6) 0%, rgba(26, 46, 110, 0.6) 50%, rgba(3, 15, 53, 0.6) 100%), url(/images/honeycomb.png)',
    category: 'Articles',
  },
];

export const FeaturedNationalProgram: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [programs, setPrograms] = useState<FeaturedProgram[]>([]);
  const [allPrograms, setAllPrograms] = useState<FeaturedProgram[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const activeProgram = programs[activeIndex] ?? null;
  
  const categories = [
    { name: 'Articles', icon: FileText },
    { name: 'Predictions', icon: TrendingUp },
    { name: 'Case Studies', icon: BookOpen },
  ];

  // Filter programs when category changes
  useEffect(() => {
    if (selectedCategory === 'All') {
      setPrograms(allPrograms);
    } else {
      const filtered = allPrograms.filter(
        (program) => program.category === selectedCategory
      );
      setPrograms(filtered.length > 0 ? filtered : allPrograms);
    }
    setActiveIndex(0);
  }, [selectedCategory, allPrograms]);

  // Auto-advance carousel
  useEffect(() => {
    if (!programs || programs.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % programs.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [programs]);

  // Load latest items from DQ Media Center (news, blogs, jobs)
  useEffect(() => {
    let isMounted = true;

    async function loadFeatured() {
      try {
        const [newsItems, jobItems] = await Promise.all([
          fetchAllNews(),
          fetchAllJobs(),
        ]);

        if (!isMounted) return;

        const allNews = newsItems ?? [];
        const allJobs = jobItems ?? [];

        // Latest articles/blogs (excluding events and podcasts)
        const latestArticles = allNews
          .filter((item) => !isPodcast(item) && !isEvent(item))
          .slice(0, 4)
          .map(mapNewsToFeatured);

        // Latest jobs
        const latestJobs = allJobs
          .slice(0, 3)
          .map(mapJobToFeatured);

        const combined = [...latestArticles, ...latestJobs];

        setAllPrograms(combined.length > 0 ? combined : fallbackPrograms);
        setPrograms(combined.length > 0 ? combined : fallbackPrograms);
        setActiveIndex(0);
      } catch (error) {
        console.error('Failed to load featured updates from media center', error);
        setAllPrograms(fallbackPrograms);
        setPrograms(fallbackPrograms);
      }
    }

    loadFeatured();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full py-8 px-4">
      <FadeInUpOnScroll className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-3 clamp-1">
          What's Happening at DQ 
        </h2>
        <div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Catch up on fresh stories, new podcasts, and highlights curated for you.
          </p>
        </div>
      </FadeInUpOnScroll>

      <div className="relative rounded-3xl overflow-hidden shadow-xl w-full max-w-[1506px] mx-auto">
        {activeProgram && (
        <div
          key={activeProgram.id}
          className="h-[360px] p-10 flex flex-col justify-between relative animate-fade-in bg-cover bg-center"
          style={
            activeProgram.backgroundImage
              ? {
                  backgroundImage: `linear-gradient(to right, rgba(15, 29, 74, 0.45), rgba(15, 29, 74, 0.45)), ${activeProgram.backgroundImage}`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {
                  backgroundColor: 'rgba(15, 29, 74, 0.45)',
                }
          }
        >

          <div className="flex-1 flex flex-col justify-center text-white relative z-10">
            <div className="inline-flex items-center rounded-full px-4 py-1.5 mb-4 w-fit bg-white/10 backdrop-blur-sm text-white border border-white/20">
              <p className="text-xs font-medium uppercase tracking-wide">
                {activeProgram.partnership}
              </p>
            </div>
            <h3 className="font-bold mb-4 text-white max-w-3xl leading-tight" style={{ fontSize: '30px' }}>
              {activeProgram.title}
            </h3>
            <p className="max-w-2xl leading-relaxed text-white/90" style={{ fontSize: '18px' }}>
              {activeProgram.description}
            </p>
          </div>

          <div className="flex items-center justify-between relative z-10">
            <a
              href={activeProgram.learnMoreHref}
              className="px-6 py-3 bg-white text-[#0F1D4A] font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg"
            >
              EXPLORE {activeProgram.category.toUpperCase()}
              <ArrowRight size={18} />
            </a>
            
            {/* Category buttons on the right */}
            <div className="flex gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex items-center gap-2 px-4 py-2 backdrop-blur-sm border rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white text-[#0F1D4A] border-white'
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Navigation dots */}
      {programs.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {programs.map((program, index) => (
            <button
              key={program.id}
              onClick={() => setActiveIndex(index)}
              className={`rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? 'bg-orange-500 w-8 h-2' 
                  : 'bg-gray-300 w-2 h-2'
              }`}
              aria-label={`Go to program ${index + 1}`}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};
