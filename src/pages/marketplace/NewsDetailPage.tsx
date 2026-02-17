import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { HomeIcon, ChevronRightIcon, Share2, BookmarkIcon, Heart, FileText } from 'lucide-react';
import type { NewsItem } from '@/data/media/news';
import { fetchAllNews, fetchNewsById } from '@/services/mediaCenterService';
import { formatDate, formatDateShort, generateTitle, getNewsTypeDisplay, getNewsImageSrc, toTitleCase } from '@/utils/newsUtils';
import { markMediaItemSeen } from '@/utils/mediaTracking';
import { parseBold } from '@/utils/contentParsing';
import { Breadcrumb } from '@/components/media-center/shared/Breadcrumb';
import { AudioPlayer } from '@/components/media-center/shared/AudioPlayer';
import { MediaMetaBlock } from '@/components/media-center/shared/MediaMetaBlock';

const fallbackHero =
  'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1600&q=80';

const fallbackImages = [
  'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80'
];


// Generate a short, relevant heading for announcements
const generateAnnouncementHeading = (article: NewsItem): string => {
  // If the article has a title, use it (but make it shorter if needed)
  if (article.title && article.title.trim()) {
    // For very long titles, try to create a shorter version
    let title = article.title.trim();
    if (title.length > 80) {
      // Try to extract the main part before any separators
      const parts = title.split('|').map(p => p.trim());
      if (parts.length > 1) {
        title = parts[0]; // Use the first part before |
      } else {
        // Try to get first sentence or meaningful phrase
        const sentences = title.split(/[.:]/);
        if (sentences[0] && sentences[0].length > 20 && sentences[0].length < 80) {
          title = sentences[0].trim();
        }
      }
    }
    return toTitleCase(title);
  }
  
  // If no title, try to extract from content
  if (article.content) {
    const lines = article.content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      // Look for the first heading
      const headingMatch = trimmed.match(/^#+\s+(.+)$/);
      if (headingMatch) {
        const headingText = headingMatch[1].trim().replace(/\*\*/g, '').replace(/\*/g, '');
        if (headingText.length > 10 && headingText.length < 100) {
          return toTitleCase(headingText);
        }
      }
    }
    // If no heading found, try first meaningful line
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.match(/^#+\s+/) && trimmed.length > 20 && trimmed.length < 100) {
        const cleanLine = trimmed.replace(/\*\*/g, '').replace(/\*/g, '').substring(0, 80);
        return toTitleCase(cleanLine);
      }
    }
  }
  
  // Fallback to excerpt if available
  if (article.excerpt && article.excerpt.length > 20 && article.excerpt.length < 100) {
    return article.excerpt;
  }
  
  // Final fallback
  return 'Announcement Details';
};

// Generate a brief 4-paragraph overview for the details page
const buildOverview = (article: NewsItem & { content?: string }) => {
  const overview: string[] = [];
  
  // Check if this is the WFH Guidelines article
  const isWFHGuidelines = article.id === 'dq-wfh-guidelines' || 
                           article.title.toLowerCase().includes('wfh guidelines') ||
                           article.title.toLowerCase().includes('work from home');
  
  // Check if this is the Scrum Master structure article
  const isScrumMasterArticle = article.id === 'dq-scrum-master-structure-update' || 
                                article.title.toLowerCase().includes('scrum master structure');
  
  if (isWFHGuidelines) {
    // Paragraph 1: Introduction
    overview.push('The Work From Home (WFH) Guidelines provide a clear framework for how remote work is requested, approved, executed, and monitored across DQ, ensuring productivity, accountability, and culture remain intact while associates work remotely.');
    
    // Paragraph 2: Process summary - convert numbered list to brief paragraph
    if (article.content) {
      const processSteps: string[] = [];
      const lines = article.content.split('\n');
      let inProcessSection = false;
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Detect the WFH Processes section
        if (trimmed.match(/^##+\s+.*[Ww]FH\s+[Pp]rocess/i) || trimmed.match(/^##+\s+.*[Pp]rocess/i)) {
          inProcessSection = true;
          continue;
        }
        
        // Stop at next major section
        if (inProcessSection && trimmed.match(/^##+\s+[^4]/)) {
          break;
        }
        
        // Extract numbered process steps
        if (inProcessSection && trimmed.match(/^\d+\.\s+/)) {
          const stepText = trimmed.replace(/^\d+\.\s+/, '').replace(/\*\*/g, '').trim();
          if (stepText.length > 20) {
            processSteps.push(stepText);
          }
        }
      }
      
      if (processSteps.length > 0) {
        // Convert steps to a brief summary paragraph capturing all key details
        const processSummary = `The WFH process begins with associates submitting requests at least 24 hours in advance via the HR Channel, including reason, dates, and expected working hours. Line Managers review and provide pre-approval based on operational needs, followed by HR final approval that verifies compliance and notifies all parties. On the WFH day, associates must create a thread in the HR Channel before work starts with daily actions and engagement links, clock in on DQ Shifts, and remain active on DQ Live24 throughout working hours. Associates must follow their day plan, provide regular updates, respond promptly, attend all calls, and at end of day post completed tasks, outstanding items, and blockers in the HR thread. HRA and Line Managers monitor adherence, and failure to post updates or remain active may result in the day being treated as unpaid and can lead to revocation of WFH privileges or performance review.`;
        overview.push(processSummary);
      } else {
        overview.push('The process requires associates to submit requests 24 hours in advance via the HR Channel with reason and dates, obtain Line Manager pre-approval and HR final approval, post daily action plans and engagement links before work starts, clock in on DQ Shifts and remain active on DQ Live24, execute work with regular updates and communication, and record deliverables at end of day. Failure to comply may result in unpaid workday treatment and revocation of WFH privileges.');
      }
    } else {
      overview.push('The process requires associates to submit requests 24 hours in advance, obtain necessary approvals, maintain visibility through DQ Live24, post daily updates, and comply with all monitoring requirements to ensure accountability and productivity.');
    }
    
    // Paragraph 3: Roles and responsibilities summary
    overview.push('Key roles include Associates who submit requests and maintain daily visibility, Line Managers who provide pre-approval and monitor deliverables, HR who provides final approval and ensures policy compliance, and HRA who oversees overall compliance and adherence to guidelines.');
    
    // Paragraph 4: Principles and tools
    overview.push('The guidelines are built on principles of transparency, accountability, equity, compliance, collaboration, and data security. Essential tools include DQ Live24 for visibility and communication, DQ Shifts for attendance tracking, and the HR Channel for requests and updates.');
  } else if (isScrumMasterArticle) {
    // First paragraph: Introduction about organizational optimization
    overview.push('As part of our organizational optimization, we are updating the leadership structure across functions to streamline responsibilities and enhance ownership.');
    
    // Second paragraph: Previous structure
    overview.push('Previously, our leadership structure included Sector Leads, Factory Leads, Tower Leads, and Scrum Masters. These have now been streamlined into 4 unified Scrum Master framework.');
    
    // Third paragraph: New structure introduction
    overview.push('DQ will now operate under four defined Scrum Master categories:');
    
    // Fourth paragraph: Extract and list the four categories from content
    const categories: string[] = [];
    if (article.content) {
      const lines = article.content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        // Look for headings that might be category names (H2 or H3 level)
        const headingMatch = trimmed.match(/^##+\s+(.+)$/);
        if (headingMatch) {
          const headingText = headingMatch[1].trim();
          // Check if it's a category heading (contains "Scrum Master" or specific patterns)
          if (headingText.includes('Scrum Master') || 
              headingText.includes('COE') || 
              headingText.includes('Delivery') || 
              headingText.includes('Working Room') || 
              headingText.includes('Unit')) {
            // Extract just the category name, removing any parenthetical notes
            const categoryName = headingText.split('(')[0].trim();
            if (categoryName && !categories.includes(categoryName)) {
              categories.push(categoryName);
            }
          }
        }
      }
    }
    
    // If we found categories, list them; otherwise use default
    if (categories.length > 0) {
      const categoryList = categories.slice(0, 4).join(', ');
      overview.push(categoryList + '.');
    } else {
      // Default categories if not found in content
      overview.push('COE Scrum Masters, Delivery Scrum Masters, Working Room Scrum Masters, and Unit Scrum Masters.');
    }
  } else {
    // For other articles, build a structured 4-paragraph overview
    
    // Paragraph 1: Brief introduction using excerpt or first meaningful content
    let introPara = '';
    if (article.excerpt && article.excerpt.length > 30) {
      introPara = article.excerpt;
      // Ensure it ends with proper punctuation
      if (!introPara.match(/[.!?]$/)) {
        introPara += '.';
      }
    } else if (article.content) {
      // Extract first meaningful paragraph from content
      const lines = article.content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        // Skip headings, empty lines, and list markers
        if (trimmed && !trimmed.match(/^#+\s+/) && !trimmed.match(/^[-*\d.]\s+/) && !trimmed.match(/^➜\s+/)) {
          // Remove markdown bold markers for cleaner text
          const cleanLine = trimmed.replace(/\*\*/g, '').replace(/\*/g, '');
          if (cleanLine.length > 50) {
            introPara = cleanLine;
            if (!introPara.match(/[.!?]$/)) {
              introPara += '.';
            }
            break;
          }
        }
      }
    }
    
    if (introPara) {
      overview.push(introPara);
    } else {
      // Default intro if nothing found
      overview.push('This announcement provides important information and updates that will impact our organization.');
    }
    
    // Paragraphs 2-4: Extract meaningful content sections
    if (article.content) {
      const lines = article.content.split('\n');
      const extractedSections: string[] = [];
      let currentSection = '';
      let inSection = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Skip empty lines
        if (!trimmed) {
          if (currentSection && currentSection.trim().length > 80) {
            extractedSections.push(currentSection.trim());
            currentSection = '';
            inSection = false;
          }
          continue;
        }
        
        // Check if this is a heading (H2 or H3) - start a new section
        const headingMatch = trimmed.match(/^##+\s+(.+)$/);
        if (headingMatch) {
          // Save previous section if it exists
          if (currentSection && currentSection.trim().length > 80) {
            extractedSections.push(currentSection.trim());
          }
          // Start new section with heading text
          const headingText = headingMatch[1].trim().replace(/\*\*/g, '').replace(/\*/g, '');
          currentSection = headingText + ': ';
          inSection = true;
          continue;
        }
        
        // Skip list markers but extract their content
        if (trimmed.match(/^[-*\d.]\s+/) || trimmed.match(/^➜\s+/)) {
          const listContent = trimmed.replace(/^[-*\d.]\s+/, '').replace(/^➜\s+/, '').trim();
          const cleanContent = listContent.replace(/\*\*/g, '').replace(/\*/g, '');
          if (cleanContent.length > 30) {
            if (currentSection) {
              currentSection += cleanContent + '. ';
            } else {
              currentSection = cleanContent + '. ';
            }
            inSection = true;
          }
          continue;
        }
        
        // Regular paragraph text
        if (trimmed && !trimmed.match(/^#+\s+/)) {
          const cleanText = trimmed.replace(/\*\*/g, '').replace(/\*/g, '').trim();
          if (cleanText.length > 30) {
            if (currentSection) {
              currentSection += cleanText + ' ';
            } else {
              currentSection = cleanText + ' ';
            }
            inSection = true;
          }
        }
      }
      
      // Add final section if exists
      if (currentSection && currentSection.trim().length > 80) {
        extractedSections.push(currentSection.trim());
      }
      
      // Add extracted sections to overview (ensure proper sentence endings)
      for (const section of extractedSections) {
        if (overview.length >= 4) break;
        
        let cleanSection = section.trim();
        // Ensure it ends with proper punctuation
        if (!cleanSection.match(/[.!?]$/)) {
          cleanSection += '.';
        }
        
        // Skip if too similar to intro or already added
        if (cleanSection.length > 50 && !overview.some(p => p.includes(cleanSection.substring(0, 30)))) {
          overview.push(cleanSection);
        }
      }
    }
    
    // Fill remaining slots with contextual default paragraphs
    const defaultParagraphs = [
      'These guidelines and procedures are designed to ensure consistency, fairness, and operational excellence across all teams and departments.',
      'Implementation of these updates will begin immediately, and we encourage all associates to familiarize themselves with the new requirements.',
      'For questions or clarifications regarding this announcement, please reach out to the relevant contact person listed above or your department lead.'
    ];
    
    while (overview.length < 4) {
      const defaultIndex = overview.length - 1;
      if (defaultIndex < defaultParagraphs.length) {
        overview.push(defaultParagraphs[defaultIndex]);
      } else {
        // Final fallback
        overview.push('We encourage all associates to review the details carefully and reach out with any questions or concerns.');
        break;
      }
    }
  }
  
  // Return exactly 4 paragraphs
  return overview.slice(0, 4);
};


// Render full content for blog articles, news, and announcements, preserving all formatting exactly as provided
const renderFullContent = (content: string, isBlog: boolean = false, treatFirstLineAsHeading: boolean = false, isPodcast: boolean = false) => {
  if (!content) return null;
  
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let currentParagraph: string[] = [];
  let listItems: string[] = [];
  let inList = false;
  let keyCounter = 0;
  let firstLineProcessed = false;
  let firstHeadingSkipped = false; // For podcasts, skip the first heading (main title)

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const paraText = currentParagraph.join(' ').trim();
      if (paraText) {
        elements.push(
          <p key={keyCounter++} className="text-gray-700 text-sm leading-normal mb-2">
            {parseBold(paraText)}
          </p>
        );
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={keyCounter++} className="list-disc list-inside space-y-1 mb-2 ml-4">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-gray-700 text-sm leading-normal">
              {parseBold(item.trim())}
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Empty line - ignore it, don't flush paragraphs (text should stay together under headings)
    if (!trimmed) {
      // Only flush lists on empty lines, but keep paragraphs together
      if (inList) {
        flushList();
      }
      continue;
    }

    // For blogs, news, and announcements: treat first non-empty line as a heading
    // For podcasts, skip the first heading (main title) - only show "Focus of the Episode" and "Intended Impact"
    if ((isBlog || treatFirstLineAsHeading) && !firstLineProcessed) {
      flushList();
      flushParagraph();
      // Remove markdown heading markers if present, but keep the text
      let cleanText = trimmed.replace(/^#+\s+/, '').trim();
      // Remove pipe character (|) from the beginning if present
      cleanText = cleanText.replace(/^\|\s*/, '');
      if (cleanText) {
        // For podcasts, skip the first heading (main title)
        if (isPodcast) {
          firstHeadingSkipped = true;
          firstLineProcessed = true;
          continue; // Skip rendering the main title
        }
        const titleCaseText = toTitleCase(cleanText);
        // Check if heading starts with a number
        const isNumberedHeading = /^(\*\*)?\d+\.\s/.test(cleanText.trim());
        elements.push(
          <h2 key={keyCounter++} className={`text-xl font-bold text-gray-900 mt-6 mb-4 ${isNumberedHeading ? 'pl-0' : 'pl-4 relative border-0 border-l-0'}`}>
            {!isNumberedHeading && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#1A2E6E] via-[#1A2E6E]/80 to-transparent"></span>
            )}
            {parseBold(titleCaseText)}
          </h2>
        );
        firstLineProcessed = true;
        continue;
      }
    }

    // Check for headings (## or ###)
    const headingMatch = trimmed.match(/^(##+)\s+(.+)$/);
    if (headingMatch) {
      flushList();
      flushParagraph();
      const level = headingMatch[1].length;
      let headingText = headingMatch[2].trim();
      // Remove pipe character (|) from the beginning of heading text if present
      headingText = headingText.replace(/^\|\s*/, '');
      
      // For podcasts, only show "Focus of the Episode"/"Goal of This Episode" and "Intended Impact" headings
      if (isPodcast) {
        const normalizedHeading = headingText.toLowerCase();
        const isFocusOfEpisode = normalizedHeading.includes('focus of the episode') || 
                                 normalizedHeading.includes('focus of episode') ||
                                 normalizedHeading.includes('goal of this episode') ||
                                 normalizedHeading.includes('goal of episode');
        const isIntendedImpact = normalizedHeading.includes('intended impact');
        
        // Skip if it's not one of the allowed headings
        if (!isFocusOfEpisode && !isIntendedImpact) {
          firstLineProcessed = true;
          continue;
        }
      }
      
      const titleCaseHeading = toTitleCase(headingText);
      // Check if heading starts with a number (e.g., "1.", "2.", "**1.**", etc.)
      const isNumberedHeading = /^(\*\*)?\d+\.\s/.test(headingText.trim());
      
      if (level === 2) {
        elements.push(
          <h2 key={keyCounter++} className={`text-xl font-bold text-gray-900 mt-6 mb-4 ${isNumberedHeading ? 'pl-0' : 'pl-4 relative border-0 border-l-0'}`}>
            {!isNumberedHeading && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#1A2E6E] via-[#1A2E6E]/80 to-transparent"></span>
            )}
            {parseBold(titleCaseHeading)}
          </h2>
        );
      } else {
        elements.push(
          <h3 key={keyCounter++} className={`text-lg font-bold text-gray-900 mt-6 mb-4 ${isNumberedHeading ? 'pl-0' : 'pl-4 relative border-0 border-l-0'}`}>
            {!isNumberedHeading && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#1A2E6E] via-[#1A2E6E]/80 to-transparent"></span>
            )}
            {parseBold(titleCaseHeading)}
          </h3>
        );
      }
      firstLineProcessed = true;
      continue;
    }

    // Check for list items (-, *, or numbered)
    const listMatch = trimmed.match(/^[-*]\s+(.+)$/) || trimmed.match(/^\d+\.\s+(.+)$/);
    if (listMatch) {
      flushParagraph();
      inList = true;
      listItems.push(listMatch[1]);
      firstLineProcessed = true;
      continue;
    }

    // Regular paragraph text - preserve all content
    // Combine all text lines until we hit a heading or list
    if (inList) {
      flushList();
    }
    currentParagraph.push(trimmed);
    firstLineProcessed = true;
  }

  // Flush any remaining content
  flushList();
  flushParagraph();

  return elements.length > 0 ? <div className="space-y-2">{elements}</div> : null;
};


const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [related, setRelated] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [views, setViews] = useState(0);

  const getImageSrc = (item: NewsItem): string => {
    // Use shared utility function to ensure consistency with cards
    return getNewsImageSrc(item, fallbackImages, fallbackHero);
  };

  const overview = article ? buildOverview(article) : [];
  const isBlogArticle = article?.type === 'Thought Leadership';
  const isScrumMasterArticle = article?.id === 'dq-scrum-master-structure-update' || 
                               article?.title?.toLowerCase().includes('scrum master structure');
  const isChristmasScheduleArticle = article?.id === 'dq-dxb-ksa-christmas-new-year-schedule' || 
                                     article?.id === 'dq-nbo-christmas-new-year-schedule' ||
                                     (article?.title?.toLowerCase().includes('christmas') && article?.title?.toLowerCase().includes('new year'));
  const isDXBEOYArticle = article?.id === 'dxb-eoy-event-postponement';

  // Load likes and views, and interaction state from localStorage
  useEffect(() => {
    if (!id) return;
    
    try {
      const storedLikes = localStorage.getItem(`news-likes-${id}`);
      const storedViews = localStorage.getItem(`news-views-${id}`);
      const storedHasLiked = localStorage.getItem(`news-hasLiked-${id}`);
      
      if (storedLikes) {
        setLikes(parseInt(storedLikes, 10) || 0);
      }
      if (storedViews) {
        setViews(parseInt(storedViews, 10) || 0);
      }
      if (storedHasLiked === 'true') {
        setHasLiked(true);
      }
    } catch (error) {
      // Error loading from localStorage - use defaults
      console.error('Error loading engagement data:', error);
    }
  }, [id]);

  // Track page view - increment views when article loads
  useEffect(() => {
    if (!id || !article) return;
    
    try {
      const viewKey = `news-viewed-${id}`;
      const hasViewed = sessionStorage.getItem(viewKey);
      
      // Only increment if this is a new view in this session
      if (!hasViewed) {
        setViews(prev => {
          const newViews = prev + 1;
          localStorage.setItem(`news-views-${id}`, newViews.toString());
          sessionStorage.setItem(viewKey, 'true');
          return newViews;
        });
      } else {
        // Load existing views if already viewed in this session
        const storedViews = localStorage.getItem(`news-views-${id}`);
        if (storedViews) {
          setViews(parseInt(storedViews, 10) || 0);
        }
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }, [id, article]);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function loadArticle() {
      setIsLoading(true);
      try {
        const [item, allNews] = await Promise.all([fetchNewsById(id || ''), fetchAllNews()]);
        if (!isMounted) return;
        setArticle(item);
        setRelated(allNews.filter((newsItem) => newsItem.id !== id).slice(0, 3));
        if (item) {
          markMediaItemSeen('news', item.id);
        }
        setLoadError(null);
      } catch (error) {
        if (!isMounted) return;
        setLoadError('Unable to load this article right now.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadArticle();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Save likes and comments to localStorage whenever they change
  useEffect(() => {
    if (!id) return;
    try {
      localStorage.setItem(`news-likes-${id}`, likes.toString());
    } catch (error) {
      console.error('Error saving likes:', error);
    }
  }, [id, likes]);

  // Handle like action
  const handleLike = () => {
    if (!id) return;
    if (!hasLiked) {
      setLikes(prev => prev + 1);
      setHasLiked(true);
      try {
        localStorage.setItem(`news-hasLiked-${id}`, 'true');
      } catch (error) {
        console.error('Error saving like state:', error);
      }
    }
  };


  if (!article) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header toggleSidebar={() => {}} sidebarOpen={false} />
        <main className="flex flex-1 flex-col items-center justify-center text-center px-4">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {isLoading ? 'Loading article' : 'Article not found'}
          </h1>
          <p className="text-gray-600 mb-6 max-w-md">
            {isLoading
              ? 'Fetching the latest details. Please wait.'
              : "The article you're trying to view is unavailable or has been archived. Please browse the latest announcements."}
          </p>
          {loadError && !isLoading && (
            <p className="text-sm text-red-600 mb-4">{loadError}</p>
          )}
          <button
            type="button"
            onClick={() => {
              // Preserve the tab parameter from the current location
              const params = new URLSearchParams(location.search);
              const tab = params.get('tab');
              // Navigate to opportunities with the tab preserved
              const backUrl = tab ? `/marketplace/opportunities?tab=${tab}` : '/marketplace/opportunities';
              navigate(backUrl);
            }}
            className="rounded-lg bg-[#030f35] px-6 py-3 text-sm font-semibold text-white"
          >
            Back to Media Center
          </button>
        </main>
        <Footer isLoggedIn={false} />
      </div>
    );
  }

  const displayAuthor =
    article.type === 'Thought Leadership'
      ? (article.byline || article.author || 'DQ Media Team')
      : article.author;

  // Generate initials for author icon (G|CC style)
  const getAuthorInitials = () => {
    if (article.newsSource) {
      const parts = article.newsSource.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}|${parts[1].substring(0, 2).toUpperCase()}`;
      }
      return article.newsSource.substring(0, 3).toUpperCase();
    }
    if (article.department) {
      const parts = article.department.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}|${parts[1].substring(0, 2).toUpperCase()}`;
      }
      return article.department.substring(0, 3).toUpperCase();
    }
    if (displayAuthor) {
      const names = displayAuthor.split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
      }
      return displayAuthor.substring(0, 2).toUpperCase();
    }
    return 'DQ';
  };

  const announcementDate = article.date ? formatDate(article.date) : '';

  // Check if this is a podcast with audio
  const isPodcast = article.format === 'Podcast' || article.tags?.some(tag => tag.toLowerCase().includes('podcast'));
  const hasAudio = isPodcast && article.audioUrl;

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F6FB]">
      <Header toggleSidebar={() => {}} sidebarOpen={false} />
      <main className="flex-1">
        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <Breadcrumb
              items={[
                {
                  href: (() => {
                    const params = new URLSearchParams(location.search);
                    const tab = params.get('tab');
                    return tab ? `/marketplace/opportunities?tab=${tab}` : '/marketplace/opportunities';
                  })(),
                  label: 'DQ Media Center'
                },
                {
                  label: article.title || 'Article'
                }
              ]}
            />
            <div className="flex gap-2 text-sm text-gray-500">
              <button 
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 hover:text-[#1A2E6E]"
              >
                <Share2 size={16} />
                Share
              </button>
              <button 
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 hover:text-[#1A2E6E]"
              >
                <BookmarkIcon size={16} />
                Save
              </button>
            </div>
          </div>
        </section>

        {/* Hero Section with Blurred Background */}
        <section className="relative min-h-[320px] md:min-h-[400px] flex items-center" aria-labelledby="article-title">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url("${getImageSrc(article)}")`,
              filter: 'blur(2px)',
            }}
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-800/85 to-slate-900/90" />
          
          {/* Content */}
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 md:py-24 w-full">
            <div className="max-w-4xl">
              {/* Category Tag */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-white mb-4">
                {getNewsTypeDisplay(article).label}
              </span>
              
              {/* Date */}
              <div className="text-white/90 text-sm mb-4">
                {announcementDate}
              </div>

              {/* Title */}
              <h1 id="article-title" className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                {generateTitle(article)}
              </h1>

              {/* Author Info */}
              <div className="text-white/90 text-sm">
                HRA
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-8">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-6">

                {/* Audio Player for Podcasts */}
                {hasAudio && article.audioUrl && (
                  <AudioPlayer audioUrl={article.audioUrl} />
                )}

                {/* Article Content - Full content for blogs, Scrum Master article, Christmas schedule articles, DXB EoY Event, and podcasts, overview for other announcements */}
                <article className="bg-white rounded-lg shadow p-6 space-y-4">
                  {(isBlogArticle || isScrumMasterArticle || isChristmasScheduleArticle || isDXBEOYArticle || hasAudio) && article.content ? (
                    <div className="prose prose-sm max-w-none [&_h2]:border-l-0 [&_h2]:border-0 [&_h3]:border-l-0 [&_h3]:border-0 [&_h4]:border-l-0 [&_h4]:border-0 [&_h2_*]:border-0 [&_h3_*]:border-0 [&_h4_*]:border-0">
                      {renderFullContent(article.content, isBlogArticle, true, hasAudio)}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Short heading for announcements */}
                      {article && !isBlogArticle && (() => {
                        const headingText = generateAnnouncementHeading(article);
                        const isNumberedHeading = /^(\*\*)?\d+\.\s/.test(headingText.trim());
                        return (
                          <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${isNumberedHeading ? 'pl-0' : 'pl-4 relative'}`}>
                            {!isNumberedHeading && (
                              <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#1A2E6E] via-[#1A2E6E]/80 to-transparent"></span>
                            )}
                            {headingText}
                          </h2>
                        );
                      })()}
                      {overview.map((paragraph, index) => {
                        const trimmed = paragraph.trim();
                        if (!trimmed) return null;
                        
                        // Parse bold text in the paragraph
                        const boldText = parseBold(trimmed);
                        
                        return (
                          <p key={index} className="text-gray-700 text-sm leading-normal mb-2">
                            {boldText}
                          </p>
                        );
                      })}
                    </div>
                  )}
                </article>

                {/* COMPANY NEWS DETAILS Section */}
                <MediaMetaBlock item={article} displayAuthor={displayAuthor} />

                {/* NEXT STEPS Section - Only show for Guidelines */}
                {article.type === 'Guidelines' && (
                  <section className="bg-white rounded-lg shadow p-6" aria-label="Next Steps">
                    <h2 className="text-sm font-bold mb-4 uppercase tracking-wide">NEXT STEPS</h2>
                    <div className="flex flex-wrap gap-3">
                      <button 
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-[#030f35] text-white rounded-lg hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-[#030f35]"
                      >
                        <FileText size={14} /> Read Full Policy
                      </button>
                    </div>
                  </section>
                )}

                {/* Engagement Metrics and Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <span>{views} views</span>
                      </div>
                      <button 
                        type="button"
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 text-sm transition-colors ${
                          hasLiked 
                            ? 'text-red-600 hover:text-red-700' 
                            : 'text-gray-600 hover:text-red-600'
                        }`}
                        aria-label={hasLiked ? 'Liked' : 'Like this article'}
                      >
                        <Heart size={16} fill={hasLiked ? 'currentColor' : 'none'} />
                        <span>{likes}</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${isBookmarked ? 'text-blue-600' : 'text-gray-600'}`}
                        aria-label="Bookmark"
                      >
                        <BookmarkIcon size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: article.title,
                              text: article.excerpt,
                              url: window.location.href,
                            }).catch(() => {
                              // User cancelled or error occurred
                            });
                          } else {
                            navigator.clipboard.writeText(window.location.href).catch(() => {
                              // Clipboard error
                            });
                          }
                        }}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-600"
                        aria-label="Share"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Questions section */}
                <div className="text-xs text-gray-600 pt-4">
                  <strong className="font-semibold">Questions about this announcement?</strong> Contact HRA.
                </div>
              </div>

              {/* Right Sidebar - Related News and Announcements */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {related && related.length > 0 && (
                    <section className="bg-white rounded-lg shadow p-6" aria-label="Related News and Announcements">
                      <h2 className="text-base font-semibold mb-4">Related News and Announcements</h2>
                      <div className="space-y-3">
                        {related.slice(0, 3).map((item) => {
                          const relatedDate = formatDateShort(item.date);
                          const newsTypeDisplay = getNewsTypeDisplay(item);
                          return (
                            <Link
                              key={item.id}
                              to={`/marketplace/news/${item.id}${location.search || ''}`}
                              className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-1.5 bg-white border border-gray-200 text-gray-700">
                                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: newsTypeDisplay.color }} />
                                    {newsTypeDisplay.label}
                                  </span>
                                  <div className="text-xs text-gray-500 mb-1.5">{relatedDate}</div>
                                  <div className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug" title={generateTitle(item)}>{generateTitle(item)}</div>
                                </div>
                                <ChevronRightIcon size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer isLoggedIn={false} />
    </div>
  );
};

export default NewsDetailPage;
