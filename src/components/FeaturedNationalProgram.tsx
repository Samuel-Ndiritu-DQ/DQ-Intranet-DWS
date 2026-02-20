import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { FadeInUpOnScroll } from './AnimationUtils';
import { fetchAllNews } from '@/services/mediaCenterService';
import type { NewsItem } from '@/data/media/news';

interface FeaturedProgram {
  id: string;
  partnership: string;
  title: string;
  description: string;
  learnMoreHref: string;
  applyNowHref?: string;
  backgroundImage?: string;
}

function isPodcast(item: NewsItem): boolean {
  if (item.format === 'Podcast') {
    return true;
  }

  if (item.tags && item.tags.some((tag) => tag.toLowerCase().includes('podcast'))) {
    return true;
  }

  return false;
}

function isEvent(item: NewsItem): boolean {
  if (item.newsType === 'Upcoming Events') {
    return true;
  }

  if (item.tags && item.tags.some((tag) => tag.toLowerCase().includes('event'))) {
    return true;
  }

  return false;
}

function mapNewsToFeatured(item: NewsItem): FeaturedProgram {
  const isBlog = item.type === 'Thought Leadership' && !isPodcast(item);
  const isPodcastItem = isPodcast(item);
  const partnership = item.byline || item.author || 'DQ Communications';
  const localFallback = "url(/images/honeycomb.png)";
  const bgImage = item.image?.startsWith("/") ? `url(${item.image})` : localFallback;
  return {
    id: `news-${item.id}`,
    partnership,
    title: isPodcastItem ? `Podcast | ${item.title}` : isBlog ? `Blog | ${item.title}` : `Update | ${item.title}`,
    description: item.excerpt,
    learnMoreHref: `/marketplace/news/${item.id}`,
    backgroundImage: bgImage,
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
  },
];

export const FeaturedNationalProgram: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [programs, setPrograms] = useState<FeaturedProgram[]>([]);
  const activeProgram = programs[activeIndex] ?? null;

  // Auto-advance carousel
  useEffect(() => {
    if (!programs || programs.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % programs.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [programs]);

  // Load latest items from DQ Media Center (news, events, podcasts)
  useEffect(() => {
    let isMounted = true;

    async function loadFeatured() {
      try {
        const newsItems = await fetchAllNews();

        if (!isMounted) return;

        const allNews = newsItems ?? [];

        // 2 latest general news (excluding events and podcasts)
        const latestNews = allNews
          .filter((item) => !isPodcast(item) && !isEvent(item))
          .slice(0, 2)
          .map(mapNewsToFeatured);

        // 2 latest events
        const latestEvents = allNews
          .filter((item) => isEvent(item))
          .slice(0, 2)
          .map(mapNewsToFeatured);

        // 2 latest podcasts
        const latestPodcasts = allNews
          .filter((item) => isPodcast(item))
          .slice(0, 2)
          .map(mapNewsToFeatured);

        const combined = [...latestNews, ...latestEvents, ...latestPodcasts];

        setPrograms(combined.length > 0 ? combined : fallbackPrograms);
        setActiveIndex(0);
      } catch (error) {
        console.error('Failed to load featured updates from media center', error);
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
          What’s Happening at DQ 
        </h2>
        <div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Stay up to date with the latest updates, podcasts, and highlights everything you shouldn’t miss. 
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
                  backgroundImage: `linear-gradient(90deg, rgba(251, 83, 53, 0.5) 0%, rgba(26, 46, 110, 0.5) 50%, rgba(3, 15, 53, 0.5) 100%), ${activeProgram.backgroundImage}`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {
                  backgroundImage: 'linear-gradient(90deg, rgba(251, 83, 53, 0.6) 0%, rgba(26, 46, 110, 0.6) 50%, rgba(3, 15, 53, 0.6) 100%)',
                }
          }
        >

          <div className="flex-1 flex flex-col justify-center text-white relative z-10">
            <div className="inline-flex items-center rounded-full px-4 py-1.5 mb-4 w-fit bg-black/30 backdrop-blur-sm text-white">
              <p className="text-sm">
                {activeProgram.partnership}
              </p>
            </div>
            <h3 className="text-4xl font-bold mb-4 text-white max-w-3xl">
              {activeProgram.title}
            </h3>
            <p className="text-lg max-w-2xl leading-relaxed text-white/95">
              {activeProgram.description}
            </p>
          </div>

          <div className="flex gap-4 relative z-10">
            <a
              href={activeProgram.learnMoreHref}
              className="px-6 py-3 bg-[#030F35] text-white font-semibold rounded-lg hover:bg-[#051A4A] transition-colors flex items-center gap-2 shadow-lg"
            >
              View Details
              <ArrowRight size={18} className="text-white" />
            </a>
            {activeProgram.applyNowHref && (
            <a
              href={activeProgram.applyNowHref}
              className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              Apply
            </a>
            )}
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
