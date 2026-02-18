import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { getMarketplaceConfig } from '../../utils/marketplaceConfig';
import { getServiceTabContent, getCustomTabs } from '../../utils/serviceDetailsContent';
import type { ContentBlock } from '../../utils/serviceDetailsContent';
import { fetchMarketplaceItemDetails, fetchRelatedMarketplaceItems } from '../../services/marketplace';
import { ErrorDisplay } from '../../components/SkeletonLoader';
import { getFallbackItemDetails, getFallbackItems } from '../../utils/fallbackData';
import { supabaseClient } from '../../lib/supabaseClient';
import { toast } from 'sonner';
import { error as secureError } from '../../utils/secureLogger';
import { safeOpenUrl } from '../../utils/secureUrl';
import { sanitizeAndValidateHtml } from '../../utils/sanitizeHtml';

// Code block component with copy functionality - extracted to avoid re-creation
const CodeBlock: React.FC<{ code: string; language?: string; title?: string }> = ({ code, language, title }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-6 relative">
      {title && (
        <div className="bg-gray-100 px-4 py-2 rounded-t-lg border-b border-gray-300">
          <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
        </div>
      )}
      <div className="relative">
        <pre className="bg-gray-900 text-gray-100 p-6 rounded-b-lg overflow-x-auto text-sm leading-relaxed">
          <code className={language ? `language-${language}` : ''}>{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors duration-200 flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Accordion component for FAQs - extracted to avoid re-creation
const AccordionBlock: React.FC<{ 
  items: Array<{ question: string; answer: string }>;
  getUniqueKey: (prefix: string, id: any, index: number) => string;
}> = ({ items, getUniqueKey }) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4 mb-6">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={getUniqueKey('accordion', item.question, index)}
            className="rounded-lg overflow-hidden transition-all duration-300 ease-in border-2"
            style={{
              borderColor: isOpen ? '#030F35' : '#E5E7EB',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
          >
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full flex items-center justify-between p-5 text-left transition-all duration-300 ease-in"
              style={isOpen ? {
                backgroundColor: '#030F35',
                color: 'white'
              } : {
                backgroundColor: 'white',
                color: '#374151'
              }}
              onMouseEnter={(e) => {
                if (!isOpen) {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                }
              }}
              onMouseLeave={(e) => {
                if (!isOpen) {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              <span className="font-semibold text-base pr-4">{item.question}</span>
              <span className="flex-shrink-0 text-2xl font-light transition-transform duration-300" style={{
                transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
              }}>
                +
              </span>
            </button>
            {isOpen && (
              <div className="p-5 bg-white border-t" style={{ borderTopColor: '#E5E7EB' }}>
                <p className="text-gray-700 leading-relaxed">{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Custom hook to handle overflow checking for tabs
const useTabOverflow = (containerRef: React.RefObject<HTMLDivElement>, tabsRef: React.RefObject<HTMLDivElement>, dependencies: any[]) => {
  const [showNavigation, setShowNavigation] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (tabsRef.current && containerRef.current) {
        const scrollWidth = tabsRef.current.scrollWidth;
        const clientWidth = containerRef.current.clientWidth - 96;
        setShowNavigation(scrollWidth > clientWidth);
      }
    };

    checkOverflow();
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, dependencies);

  const scrollLeft = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return { showNavigation, scrollLeft, scrollRight };
};

// Custom hook to handle sticky bottom CTA visibility
const useStickyBottomCTA = (summaryCardRef: React.RefObject<HTMLDivElement>) => {
  const [showStickyBottomCTA, setShowStickyBottomCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (summaryCardRef.current && window.innerWidth < 1024) {
        const summaryCardBottom = summaryCardRef.current.offsetTop + summaryCardRef.current.offsetHeight;
        const scrollPosition = window.scrollY + window.innerHeight;
        setShowStickyBottomCTA(scrollPosition > summaryCardBottom + 100);
      } else {
        setShowStickyBottomCTA(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [summaryCardRef]);

  return showStickyBottomCTA;
};

// Custom hook to manage active tab
const useActiveTab = (customTabs: any, defaultTabs: any[]) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTabs[0]?.id || 'about');

  useEffect(() => {
    if (customTabs && customTabs.length > 0) {
      setActiveTab(customTabs[0].id);
    }
  }, [customTabs]);

  return [activeTab, setActiveTab] as const;
};

// Custom hook to handle redirect timer cleanup
const useRedirectTimer = () => {
  const [redirectTimer, setRedirectTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [redirectTimer]);

  return [redirectTimer, setRedirectTimer] as const;
};

interface MarketplaceDetailsPageProps {
  marketplaceType: 'courses' | 'financial' | 'non-financial' | 'knowledge-hub' | 'onboarding' | 'events';
  onToggleBookmark?: (itemId: string) => void;
}

const MarketplaceDetailsPage: React.FC<MarketplaceDetailsPageProps> = ({
  marketplaceType,
  onToggleBookmark: _onToggleBookmark = () => { }
}) => {
  // Helper to generate unique keys
  const getUniqueKey = (prefix: string, id: any, index: number) => {
    return id ? `${prefix}-${id}` : `${prefix}-${index}`;
  };

  const { itemId } = useParams<{ itemId: string; }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shouldTakeAction = searchParams.get('action') === 'true';
  const serviceTab = searchParams.get('tab');
  const config = getMarketplaceConfig(marketplaceType);

  // Helper to get tab label
  const getTabLabel = (tab: string | null): string => {
    if (!tab) return '';
    const tabMap: Record<string, string> = {
      'technology': 'Technology',
      'business': 'Employee Services',
      'digital_worker': 'Digital Worker',
      'prompt_library': 'Prompt Library',
      'ai_tools': 'AI Tools'
    };
    return tabMap[tab] || '';
  };

  // Helper to get back URL with tab preserved
  const getBackUrl = (): string => {
    if (marketplaceType === 'non-financial' && serviceTab) {
      return `${config.route}?tab=${serviceTab}`;
    }
    return config.route;
  };

  // State variables
  const [item, setItem] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [isTechSupportFormOpen, setIsTechSupportFormOpen] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const summaryCardRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const contentColumnRef = useRef<HTMLDivElement>(null);
  
  // Use custom hooks to reduce complexity
  const [redirectTimer, setRedirectTimer] = useRedirectTimer();
  const { showNavigation, scrollLeft, scrollRight } = useTabOverflow(containerRef, tabsRef, []);
  const showStickyBottomCTA = useStickyBottomCTA(summaryCardRef);
  
  // Check for custom tabs for this service
  const customTabs = item ? getCustomTabs(marketplaceType, item.id) : undefined;
  const tabsToUse = customTabs || config.tabs;
  const [activeTab, setActiveTab] = useActiveTab(customTabs, config.tabs);

  // Extract display properties based on marketplace type
  const itemDescription = item?.description || '';
  const provider = item?.provider || { name: 'Provider', logoUrl: '/default-logo.png', description: '' };
  const highlights = item?.keyHighlights || item?.highlights || [];
  const detailItems = [
    { label: 'Duration', value: item?.duration || 'N/A' },
    { label: 'Category', value: item?.category || 'N/A' },
    { label: 'Provider', value: provider.name }
  ];
  
  const isPromptLibrary = item?.id === '17' || item?.category === 'Prompt Library';
  const isAITool = item?.category === 'AI Tools';
  const isDigitalWorker = item?.category === 'Digital Worker';
  const isLeaveApplication = item?.id === '13';
  const isITSupportService = marketplaceType === 'non-financial' && ['1', '2', '3'].includes(item?.id);

  // Determine primary action based on marketplace type and item
  const primaryAction = (() => {
    if (marketplaceType === 'events') return 'Join';
    if (isLeaveApplication) return 'Apply For Leave';
    if (isPromptLibrary) return 'View Prompt';
    if (isDigitalWorker) return 'View Details';
    if (isAITool) return 'Request Tool';
    return config.primaryCTA;
  })();

  // Helper functions extracted to reduce complexity
  const fetchRelatedEventsData = useCallback(async (itemData: any, itemId: string) => {
    if (marketplaceType !== 'events' || !itemData.category) return [];
    
    try {
      const { data, error } = await supabaseClient
        .from('events_v2')
        .select('id, title, description, start_time, end_time, category, location, image_url, tags')
        .eq('status', 'published')
        .eq('category', itemData.category)
        .neq('id', itemId)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(5);

      if (!error && data) {
        return data.map((event: any) => ({
          id: event.id,
          event_title: event.title,
          title: event.title,
          event_description: event.description,
          description: event.description,
          tags: event.tags || []
        }));
      }
      return [];
    } catch (error) {
      secureError('Error fetching related events:', error);
      return [];
    }
  }, [marketplaceType]);

  const fetchRelatedItemsData = useCallback(async (itemData: any) => {
    try {
      const data = await fetchRelatedMarketplaceItems(
        marketplaceType,
        itemData.id,
        itemData.category || '',
        itemData.provider?.name || ''
      );
      return data && data.length > 0 ? data : [];
    } catch (error) {
      secureError('Error fetching related items:', error);
      return [];
    }
  }, [marketplaceType]);

  const handleEventsMarketplace = useCallback(async (itemData: any, itemId: string) => {
    if (!itemData) {
      setError('Event not found. Please check the event ID and try again.');
      setLoading(false);
      return;
    }
    
    setItem(itemData);
    const related = await fetchRelatedEventsData(itemData, itemId);
    setRelatedItems(related);
  }, [fetchRelatedEventsData]);

  const handleNonEventsMarketplace = useCallback(async (itemData: any) => {
    const finalItemData = itemData || getFallbackItemDetails(marketplaceType, itemId || 'fallback-1');
    
    if (finalItemData) {
      setItem(finalItemData);
      const related = await fetchRelatedItemsData(finalItemData);
      setRelatedItems(related.length > 0 ? related : getFallbackItems(marketplaceType));
    } else {
      const genericFallback = getFallbackItemDetails(marketplaceType, 'generic-fallback');
      setItem(genericFallback);
      setError(null);
      const timer = setTimeout(() => navigate(config.route), 5000);
      setRedirectTimer(timer);
    }
  }, [marketplaceType, itemId, fetchRelatedItemsData, navigate, config.route]);

  const fetchItemDetails = useCallback(async () => {
    if (!itemId) return;
    setLoading(true);
    setError(null);
    
    // Clear any existing redirect timer
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      setRedirectTimer(null);
    }
    
    try {
      // Try to fetch item details
      let itemData: any = null;
      try {
        itemData = await fetchMarketplaceItemDetails(marketplaceType, itemId);
      } catch (fetchError) {
        secureError(`Error fetching ${marketplaceType} item details:`, fetchError);
        // We'll handle this below by using fallback data
      }
      
      // Handle events vs non-events marketplace
      if (marketplaceType === 'events') {
        await handleEventsMarketplace(itemData, itemId);
      } else {
        await handleNonEventsMarketplace(itemData);
      }

      // If the action parameter is true, scroll to the action section
      if (shouldTakeAction) {
        setTimeout(() => {
          const actionSection = document.getElementById('action-section');
          if (actionSection) {
            actionSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } catch (err) {
      secureError(`Error in marketplace details page:`, err);
      if (marketplaceType === 'events') {
        setError(`Failed to load event details: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } else {
        const fallbackItem = getFallbackItemDetails(marketplaceType, 'generic-fallback');
        setItem(fallbackItem);
        setRelatedItems(getFallbackItems(marketplaceType));
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, [itemId, marketplaceType, shouldTakeAction, redirectTimer, handleEventsMarketplace, handleNonEventsMarketplace]);

  useEffect(() => {
    fetchItemDetails();
  }, [fetchItemDetails]);

  // Handle event registration for events marketplace - redirect to meeting link
  const handleEventRegistration = () => {
    if (marketplaceType !== 'events' || !item) {
      return;
    }
    // Redirect to meeting link if available
    if (item.meetingLink) {
      safeOpenUrl(item.meetingLink, 'Unable to open meeting link');
    } else {
      toast.error('Meeting link not available for this event');
    }
  };

  // Handle primary action button click
  const handlePrimaryActionClick = () => {
    // Check if this is Leave Application service (id '13')
    if (isLeaveApplication) {
      setIsRequestFormOpen(true);
    } else if (isITSupportService) {
      setIsTechSupportFormOpen(true);
    } else if (isPromptLibrary && item?.sourceUrl) {
      safeOpenUrl(item.sourceUrl, 'Unable to open source URL');
    } else if (isAITool) {
      setIsTechSupportFormOpen(true);
    }
  };

  const retryFetch = () => {
    setError(null);
    // Re-fetch by triggering the useEffect
    if (itemId) {
      setLoading(true);
    }
  };

  // Render tab content with consistent styling
  const renderBlocks = (blocks: ContentBlock[]) => {
    return (blocks || []).map((block, idx) => {
      if (block.type === 'p') {
        return <p key={getUniqueKey('block-p', block.text, idx)} className="text-gray-700 text-base leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: sanitizeAndValidateHtml(block.text) }}></p>;
      }
      if (block.type === 'ol') {
        return <ol key={getUniqueKey('block-ol', block.items?.[0], idx)} className="list-decimal pl-6 space-y-3 text-gray-700 mb-4 text-base">
          {block.items.map((it, i) => <li key={getUniqueKey('ol-item', it, i)} className="pl-2 leading-relaxed">{it}</li>)}
        </ol>;
      }
      if (block.type === 'ul') {
        return <ul key={getUniqueKey('block-ul', block.items?.[0], idx)} className="list-disc pl-6 space-y-3 text-gray-700 mb-4 text-base">
          {block.items.map((it, i) => <li key={getUniqueKey('ul-item', it, i)} className="pl-2 leading-relaxed">{it}</li>)}
        </ul>;
      }
      if (block.type === 'iframe') {
        return <div key={getUniqueKey('block-iframe', block.src, idx)} className="mb-6">
          <iframe
            src={block.src}
            width={block.width || '640'}
            height={block.height || '360'}
            style={{ border: 0 }}
            allowFullScreen
            title={block.title || 'Embedded video'}
            className="rounded-lg shadow-md"
          />
        </div>;
      }
      if (block.type === 'accordion') {
        return <AccordionBlock key={getUniqueKey('block-accordion', block.items?.[0]?.question, idx)} items={block.items || []} getUniqueKey={getUniqueKey} />;
      }
      if (block.type === 'code') {
        return <CodeBlock key={getUniqueKey('block-code', block.code, idx)} code={block.code} language={block.language} title={block.title} />;
      }
      return null;
    });
  };

  // Simple renderTabContent function to fix cognitive complexity
  const renderTabContent = (tabId: string) => {
    const tab = tabsToUse.find(t => t.id === tabId);
    if (!tab) return null;

    // Handle custom tab content
    const content = getServiceTabContent(marketplaceType, item?.id, tabId);
    if (content) {
      return (
        <div className="space-y-8">
          <div className="prose max-w-none">
            {content.heading && <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">{content.heading}</h2>}
            {renderBlocks(content.blocks || [])}
          </div>
        </div>
      );
    }

    // Default tab content
    return (
      <div className="space-y-6">
        <p className="text-gray-600 text-lg mb-6">
          Learn more about this {config.itemName.toLowerCase()}.
        </p>
        <div className="prose max-w-none">
          <p className="text-gray-700 mb-5 leading-relaxed">{itemDescription}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[300px] flex-grow">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
        <Footer isLoggedIn={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[#030F35]/5">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <nav className="flex mb-4 min-h-[24px]" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
              <li className="inline-flex items-center">
                <Link to="/" className="text-[#030F35]/70 hover:text-[#030F35] inline-flex items-center text-sm md:text-base transition-colors" aria-label="Navigate to Home">
                  <HomeIcon size={16} className="mr-1" aria-hidden="true" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon size={16} className="text-gray-400" />
                  <Link to={getBackUrl()} className="ml-1 text-gray-600 hover:text-gray-900 md:ml-2">
                    {config.itemNamePlural}
                  </Link>
                </div>
              </li>
              {marketplaceType === 'non-financial' && serviceTab && getTabLabel(serviceTab) && (
                <li>
                  <div className="flex items-center">
                    <ChevronRightIcon size={16} className="text-gray-400" />
                    <Link to={getBackUrl()} className="ml-1 text-gray-600 hover:text-gray-900 md:ml-2">
                      {getTabLabel(serviceTab)}
                    </Link>
                  </div>
                </li>
              )}
              <li aria-current="page">
                <div className="flex items-center">
                  <ChevronRightIcon size={16} className="text-[#030F35]/40 mx-1 flex-shrink-0" aria-hidden="true" />
                  <span className="text-[#030F35]/60 text-sm md:text-base font-medium whitespace-nowrap">Details</span>
                </div>
              </li>
            </ol>
          </nav>
          <ErrorDisplay message={error} onRetry={retryFetch} additionalMessage={redirectTimer ? `Redirecting to ${config.itemNamePlural} page in a few seconds...` : undefined} />
        </div>
        <Footer isLoggedIn={false} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col bg-[#030F35]/5">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[300px] flex-grow">
          <div className="text-center">
            <h2 className="text-xl font-medium text-[#030F35] mb-2">
              {config.itemName} Not Found
            </h2>
            <p className="text-[#030F35]/70 mb-4">
              The {config.itemName.toLowerCase()} you're looking for doesn't exist or has been removed.
            </p>
            <Link to={config.route} className="px-4 py-2 bg-gradient-to-r from-[#030F35] via-[#1A2E6E] to-[#030F35] text-white rounded-md hover:from-[#13285A] hover:via-[#1A2E6E] hover:to-[#13285A] transition-colors inline-block shadow-md">
              Back to {config.itemNamePlural}
            </Link>
          </div>
        </div>
        <Footer isLoggedIn={false} />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 10px 15px -3px rgba(34, 197, 94, 0.4), 0 4px 6px -2px rgba(34, 197, 94, 0.2);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      
      <main className="flex-grow">
        {/* Hero Section - full-width background */}
        <div ref={heroRef} className="w-full bg-gray-50">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#030F35] mb-4">
              {item?.title || item?.event_title || 'Item Details'}
            </h1>
            <p className="text-gray-700 text-lg">
              {itemDescription}
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-[#030F35]/20 w-full bg-white">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div ref={containerRef} className="flex items-center w-full relative">
              {showNavigation && (
                <button 
                  className="absolute left-0 p-2 text-[#030F35]/60 hover:text-[#030F35] focus:outline-none focus:ring-2 focus:ring-[#030F35] focus:ring-offset-2 rounded-md transition-colors bg-white z-10" 
                  onClick={scrollLeft} 
                  aria-label="Scroll tabs left"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              <div 
                ref={tabsRef} 
                className="flex overflow-x-auto scrollbar-hide w-full" 
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {tabsToUse.map(tab => (
                  <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id)} 
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                      activeTab === tab.id 
                        ? 'text-[#030F35] border-[#030F35]' 
                        : 'text-[#030F35]/60 border-transparent hover:text-[#030F35] hover:border-[#030F35]/30'
                    }`} 
                    aria-selected={activeTab === tab.id} 
                    aria-controls={`tabpanel-${tab.id}`} 
                    role="tab"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {showNavigation && (
                <button 
                  className="absolute right-8 p-2 text-[#030F35]/60 hover:text-[#030F35] focus:outline-none focus:ring-2 focus:ring-[#030F35] focus:ring-offset-2 rounded-md transition-colors bg-white z-10" 
                  onClick={scrollRight} 
                  aria-label="Scroll tabs right"
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main content area with 12-column grid layout */}
        <div ref={mainContentRef} className="container mx-auto px-4 md:px-6 max-w-7xl py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Content column (~8 columns) */}
            <div ref={contentColumnRef} className="col-span-12 lg:col-span-8">
              {/* Tab Content */}
              <div className="mb-8 space-y-6">
                {tabsToUse.map(tab => (
                  <div 
                    key={tab.id} 
                    className={activeTab === tab.id ? 'block' : 'hidden'} 
                    id={`tabpanel-${tab.id}`} 
                    role="tabpanel" 
                    aria-labelledby={`tab-${tab.id}`}
                  >
                    {renderTabContent(tab.id)}
                  </div>
                ))}
              </div>
              
              {/* Mobile/Tablet Summary Card - only visible on mobile/tablet */}
              <div className="lg:hidden mt-8">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                  <div className="space-y-3">
                    {detailItems.map((detail, index) => (
                      <div key={getUniqueKey('mobile-detail', detail.label, index)} className="flex justify-between">
                        <span className="text-gray-600">{detail.label}:</span>
                        <span className="font-medium text-gray-900">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handlePrimaryActionClick}
                    className="w-full mt-6 px-4 py-3 bg-[#030F35] text-white font-bold rounded-md hover:bg-[#13285A] transition-colors"
                  >
                    {primaryAction}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Summary card column (~4 columns) - visible only on desktop */}
            <div className="hidden lg:block lg:col-span-4">
              <div className="sticky top-[96px]">
                <div ref={summaryCardRef} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                  <div className="space-y-3">
                    {detailItems.map((detail, index) => (
                      <div key={getUniqueKey('desktop-detail', detail.label, index)} className="flex justify-between">
                        <span className="text-gray-600">{detail.label}:</span>
                        <span className="font-medium text-gray-900">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                  {highlights.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Key Highlights</h4>
                      <ul className="space-y-2">
                        {highlights.map((highlight, index) => (
                          <li key={getUniqueKey('highlight', highlight, index)} className="text-sm text-gray-700">
                            • {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button
                    onClick={handlePrimaryActionClick}
                    className="w-full mt-6 px-4 py-3 bg-[#030F35] text-white font-bold rounded-md hover:bg-[#13285A] transition-colors"
                  >
                    {primaryAction}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Items */}
        <section className="bg-[#030F35]/5 py-10 border-t border-[#030F35]/20">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#030F35]">
                Related {config.itemNamePlural}
              </h2>
              <a href={config.route} className="text-[#030F35] font-medium hover:text-[#13285A] flex items-center transition-colors">
                See All {config.itemNamePlural}
                <ChevronRightIcon size={16} className="ml-1" />
              </a>
            </div>
            
            {/* Related items display */}
            {relatedItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedItems.map(relatedItem => (
                  <button 
                    key={relatedItem.id}
                    type="button"
                    className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow border border-[#030F35]/10 text-left w-full"
                    onClick={() => navigate(`/marketplace/${marketplaceType}/${relatedItem.id}`)}
                  >
                    <div className="flex items-center mb-3">
                      <img src={relatedItem.provider?.logoUrl || '/default-logo.png'} alt={relatedItem.provider?.name || 'Provider'} className="h-8 w-8 object-contain mr-2 rounded" />
                      <span className="text-sm text-[#030F35]/70">
                        {relatedItem.provider?.name || 'Provider'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-[#030F35] mb-2">
                      {relatedItem.title}
                    </h3>
                    <p className="text-sm text-[#030F35]/70 line-clamp-2 mb-3">
                      {relatedItem.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(relatedItem.tags || []).slice(0, 2).map((tag, idx) => (
                        <span key={getUniqueKey('related-item-tag', tag, idx)} className="px-2 py-0.5 bg-[#030F35]/10 text-[#030F35] text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-[#030F35]/20">
                <p className="text-[#030F35]/60">
                  No related {config.itemNamePlural.toLowerCase()} found
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Sticky mobile CTA */}
        {showStickyBottomCTA && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#030F35]/20 p-3 lg:hidden z-30 transform transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between max-w-sm mx-auto">
              <div className="mr-3">
                <div className="text-[#030F35] font-bold">
                  {(() => {
                    if (marketplaceType === 'courses') return item?.price || 'Free';
                    if (marketplaceType === 'financial') return item?.amount || 'Apply Now';
                    if (marketplaceType === 'events') return '';
                    return 'Request Now';
                  })()}
                </div>
                <div className="text-sm text-[#030F35]/70">
                  {item?.duration || item?.serviceType || ''}
                </div>
              </div>
              <button
                onClick={() => {
                  if (marketplaceType === 'events') {
                    handleEventRegistration();
                    return;
                  }
                  if (isLeaveApplication) {
                    setIsRequestFormOpen(true);
                  } else if (isITSupportService) {
                    setIsTechSupportFormOpen(true);
                  } else if (isPromptLibrary && item?.sourceUrl) {
                    safeOpenUrl(item.sourceUrl, 'Unable to open source URL');
                  } else if (isAITool) {
                    setIsTechSupportFormOpen(true);
                  }
                }}
                className="flex-1 px-4 py-3 text-white font-bold rounded-md bg-gradient-to-r from-[#030F35] via-[#1A2E6E] to-[#030F35] hover:from-[#13285A] hover:via-[#1A2E6E] hover:to-[#13285A] transition-colors shadow-md flex items-center justify-center gap-2"
              >
                {isPromptLibrary ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visit Page
                  </>
                ) : (
                  primaryAction
                )}
              </button>
            </div>
          </div>
        )}
      </main>
      
      <Footer isLoggedIn={false} />

      {/* Request Form Modal - Placeholder */}
      {isRequestFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Request Form</h3>
            <p className="text-gray-600 mb-4">Form functionality would be implemented here.</p>
            <button
              onClick={() => setIsRequestFormOpen(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Technology Support Form Modal - Placeholder */}
      {isTechSupportFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Tech Support Form</h3>
            <p className="text-gray-600 mb-4">Tech support form functionality would be implemented here.</p>
            <button
              onClick={() => setIsTechSupportFormOpen(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceDetailsPage;