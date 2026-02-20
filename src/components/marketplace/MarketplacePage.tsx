import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { FilterSidebar, FilterConfig } from './FilterSidebar.js';
import { MarketplaceGrid } from './MarketplaceGrid.js';
import { SearchBar } from '../SearchBar.js';
import { FilterIcon, XIcon, HomeIcon, ChevronRightIcon, ChevronDown, InfoIcon } from 'lucide-react';
import { ErrorDisplay, CourseCardSkeleton } from '../SkeletonLoader.js';
import { fetchMarketplaceItems, fetchMarketplaceFilters } from '../../services/marketplace.js';
import { getMarketplaceConfig, getTabSpecificFilters } from '../../utils/marketplaceConfig.js';
import { MarketplaceComparison } from './MarketplaceComparison.js';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { getFallbackItems } from '../../utils/fallbackData';
import KnowledgeHubGrid from './KnowledgeHubGrid';
import { LMS_COURSES } from '../../data/lmsCourseDetails';
import { parseFacets, applyFilters } from '../../lms/filters';
import {
  LOCATION_ALLOW,
  LEVELS,
  CATEGORY_OPTS,
  DELIVERY_OPTS,
  DURATION_OPTS
} from '../../lms/config';
import GuidesFilters, { GuidesFacets } from '../guides/GuidesFilters';
import GuidesGrid from '../guides/GuidesGrid';
import TestimonialsGrid from '../guides/TestimonialsGrid';
import GlossaryGrid from '../guides/GlossaryGrid';
import { SixXDPerspectiveCards } from '../guides/SixXDPerspectiveCards';
import { SixXDComingSoonCards } from '../guides/SixXDComingSoonCards';
import { STATIC_PRODUCTS } from '../../utils/staticProducts';
import { supabaseClient, supabase } from '../../lib/supabaseClient';
import { track } from '../../utils/analytics';
import FAQsPageContent from '@/pages/guides/FAQsPageContent.tsx';
import { glossaryTerms, GlossaryTerm, CATEGORIES } from '@/pages/guides/glossaryData.ts';
const LEARNING_TYPE_FILTER: FilterConfig = {
  id: 'learningType',
  title: 'Learning Type',
  options: [
    { id: 'courses', name: 'Courses' },
    { id: 'curricula', name: 'Curricula' },
    { id: 'testimonials', name: 'Testimonials' }
  ]
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const prependLearningTypeFilter = (marketplaceType: string, configs: FilterConfig[]): FilterConfig[] => {
  if (marketplaceType !== 'courses') {
    return configs;
  }
  const hasLearningType = configs.some(config => config.id === 'learningType');
  if (hasLearningType) {
    return configs.map(config => {
      if (config.id !== 'learningType') return config;
      const options = config.options.length ? config.options : LEARNING_TYPE_FILTER.options;
      return { ...config, options };
    });
  }
  return [LEARNING_TYPE_FILTER, ...configs];
};

const COURSE_FILTER_CONFIG: FilterConfig[] = [
  {
    id: 'category',
    title: 'Course Category',
    options: CATEGORY_OPTS.map(value => ({ id: value, name: value }))
  },
  {
    id: 'delivery',
    title: 'Delivery Mode',
    options: DELIVERY_OPTS.map(value => ({ id: value, name: value }))
  },
  {
    id: 'duration',
    title: 'Duration',
    options: DURATION_OPTS.map(value => ({ id: value, name: value }))
  },
  {
    id: 'department',
    title: 'Department',
    options: [
      { id: 'DCO', name: 'DCO' },
      { id: 'DBP', name: 'DBP' },
      { id: 'HR', name: 'HR' },
      { id: 'IT', name: 'IT' },
      { id: 'Finance', name: 'Finance' }
    ]
  },
  {
    id: 'level',
    title: 'Level',
    options: LEVELS.map(level => ({ id: level.code, name: level.label }))
  },
  {
    id: 'location',
    title: 'Location/Studio',
    options: LOCATION_ALLOW.map(value => ({ id: value, name: value }))
  },
  {
    id: 'audience',
    title: 'Audience',
    options: [
      { id: 'Associate', name: 'Associate' },
      { id: 'Lead', name: 'Lead' }
    ]
  },
  {
    id: 'status',
    title: 'Status',
    options: [
      { id: 'live', name: 'Live' },
      { id: 'coming-soon', name: 'Coming Soon' }
    ]
  }
];

interface ComparisonItem {
  id: string;
  title: string;
  [key: string]: any;
}

export interface MarketplacePageProps {
  marketplaceType: 'courses' | 'financial' | 'non-financial' | 'knowledge-hub' | 'onboarding' | 'guides' | 'events';
  title: string;
  description: string;
  promoCards?: any[];
}

const SUBDOMAIN_BY_DOMAIN: Record<string, string[]> = {
  strategy: ['journey', 'history', 'digital-framework', 'initiatives', 'clients'],
  guidelines: ['resources', 'policies', 'design-systems'],
  blueprints: ['devops', 'dbp', 'dxp', 'dws', 'products', 'projects'],
};

const DEFAULT_GUIDE_PAGE_SIZE = 200;
const GUIDE_LIST_SELECT = [
  'id',
  'slug',
  'title',
  'summary',
  'hero_image_url',
  'last_updated_at',
  'author_name',
  'author_org',
  'is_editors_pick',
  'download_count',
  'guide_type',
  'domain',
  'function_area',
  'unit',
  'sub_domain',
  'location',
  'status',
  'complexity_level',
].join(',');

const parseFilterValues = (params: URLSearchParams, key: string): string[] =>
  (params.get(key) || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

// Interface for Supabase event data from upcoming_events view or events_v2 table
interface UpcomingEventView {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  category: string;
  location: string;
  location_filter?: string | null; // For filtering (from events_v2 table)
  department?: string | null; // Department field for filtering (from events_v2 table)
  image_url: string | null;
  meeting_link: string | null;
  is_virtual: boolean;
  is_all_day: boolean;
  max_attendees: number | null;
  registration_required: boolean;
  registration_deadline: string | null;
  organizer_id: string;
  organizer_name: string | null;
  organizer_email: string | null;
  status: string;
  is_featured: boolean;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

// Interface for Supabase events table
interface EventsTableRow {
  id: string;
  title: string;
  description: string | null;
  event_date: string; // DATE format: YYYY-MM-DD
  event_time: string | null; // TIME format: HH:MM:SS
  community_id: string | null;
  created_by: string | null;
  created_at: string;
}

// Interface for events stored in posts table
interface PostEventRow {
  id: string;
  title: string;
  content: string | null;
  description?: string | null;
  event_date: string | null; // TIMESTAMPTZ format
  event_location: string | null;
  post_type: string;
  community_id: string | null;
  created_by: string | null;
  created_at: string;
  tags?: string[] | null;
}

// Union type for all event sources
type SupabaseEvent = UpcomingEventView | EventsTableRow | PostEventRow;

// Interface for marketplace event format
interface MarketplaceEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  eventType: string;
  businessStage: string;
  provider: {
    name: string;
    logoUrl: string;
    description?: string;
  };
  date: string;
  time?: string;
  location: string;
  price: string;
  capacity?: string;
  details?: string[];
  tags: string[];
  imageUrl?: string;
  department?: string; // Preserve department field for filtering
}

// Transform Supabase event to marketplace event format
const transformEventToMarketplace = (event: SupabaseEvent): MarketplaceEvent => {
  let startDate: Date;
  let endDate: Date;
  let category: string;
  let location: string;
  let description: string;
  let imageUrl: string | null = null;
  let tags: string[] = [];
  let department: string | undefined = undefined;

  // Check event type and extract data accordingly
  if ('start_time' in event && 'end_time' in event) {
    // Event from upcoming_events view or events_v2 table
    const evt = event as UpcomingEventView;
    startDate = new Date(evt.start_time);
    endDate = new Date(evt.end_time);
    category = evt.category || "General";
    location = evt.location || "TBA";
    description = evt.description || "";
    imageUrl = evt.image_url;
    tags = evt.tags || [];
    // Extract department field if available (from events_v2 table)
    if ('department' in evt && evt.department) {
      department = evt.department as string;
    }
  } else if ('post_type' in event && event.post_type === 'event') {
    // Event from posts table
    const evt = event as PostEventRow;
    if (evt.event_date) {
      startDate = new Date(evt.event_date);
    } else {
      startDate = new Date(evt.created_at);
    }
    endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour
    category = evt.community_id ? "Community" : "General";
    location = evt.event_location || "TBA";
    description = evt.content || evt.description || "";
    tags = evt.tags || [];
  } else {
    // Event from events table
    const evt = event as EventsTableRow;
    const eventDate = evt.event_date; // YYYY-MM-DD format
    const eventTime = evt.event_time || "00:00:00"; // HH:MM:SS format
    const dateTimeString = `${eventDate}T${eventTime}`;
    startDate = new Date(dateTimeString);
    endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour
    category = evt.community_id ? "Community" : "General";
    location = "TBA";
    description = evt.description || "";
  }

  // Format date and time
  const dateStr = startDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format time - use range if we have both start and end times, otherwise just start time
  const startTimeStr = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  let timeStr: string;
  // Check if we have a meaningful end time (not just 1 hour default)
  const hasRealEndTime = endDate.getTime() - startDate.getTime() > 60 * 60 * 1000 ||
    (endDate.getTime() - startDate.getTime() === 60 * 60 * 1000 &&
      ('start_time' in event && 'end_time' in event));

  if (hasRealEndTime) {
    const endTimeStr = endDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    timeStr = `${startTimeStr} - ${endTimeStr} (UTC +3)`;
  } else {
    timeStr = `${startTimeStr} (UTC +3)`;
  }

  // Determine event type from category or tags
  const eventType = category || "General";

  // Default business stage
  const businessStage = "All Stages";

  // Default provider
  const provider = {
    name: "DQ Events",
    logoUrl: "/DWS-Logo.png",
    description: "Digital Qatalyst Events"
  };

  // Default price
  const price = "Free";

  return {
    id: event.id,
    title: event.title,
    description,
    category,
    eventType,
    businessStage,
    provider,
    date: dateStr,
    time: timeStr,
    location,
    price,
    tags,
    imageUrl: imageUrl || undefined,
    department, // Preserve department field for filtering
  };
};

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  marketplaceType,
  title: _title,
  description: _description,
  promoCards = []
}) => {
  const isGuides = marketplaceType === 'guides';
  const isCourses = marketplaceType === 'courses';
  const isKnowledgeHub = marketplaceType === 'knowledge-hub';
  const isServicesCenter = marketplaceType === 'non-financial';
  const isEvents = marketplaceType === 'events';

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const config = getMarketplaceConfig(marketplaceType);

  // Service Center tabs - sync with URL params
  const getServiceTabFromParams = useCallback((params: URLSearchParams): string => {
    const tab = params.get('tab');
    const validTabs = ['technology', 'business', 'digital_worker', 'prompt_library', 'ai_tools'];
    return tab && validTabs.includes(tab) ? tab : 'technology';
  }, []);
  const [activeServiceTab, setActiveServiceTab] = useState<string>(() =>
    isServicesCenter
      ? getServiceTabFromParams(typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams())
      : 'technology'
  );

  // Sync activeServiceTab with URL params
  useEffect(() => {
    if (isServicesCenter) {
      const currentTab = searchParams.get('tab');
      const validTabs = ['technology', 'business', 'digital_worker', 'prompt_library', 'ai_tools'];
      if (currentTab && validTabs.includes(currentTab) && currentTab !== activeServiceTab) {
        setActiveServiceTab(currentTab);
      } else if (!currentTab || !validTabs.includes(currentTab)) {
        // Set default tab in URL if not present
        const newParams = new URLSearchParams(searchParams);
        newParams.set('tab', activeServiceTab);
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [isServicesCenter, searchParams, activeServiceTab, setSearchParams]);

  // Items & filters state
  const [_items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string | string[]>>({});
  const [filterConfig, setFilterConfig] = useState<FilterConfig[]>([]);

  // Guides facets + URL state
  const [facets, setFacets] = useState<GuidesFacets>({});
  const [queryParams, setQueryParams] = useState(() => new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''));
  const searchStartRef = useRef<number | null>(null);
type WorkGuideTab = 'guidelines' | 'strategy' | '6xd' | 'blueprints' | 'testimonials' | 'glossary' | 'faqs';
type DesignSystemTab = 'cids' | 'vds' | 'cds';
  const getTabFromParams = useCallback((params: URLSearchParams): WorkGuideTab => {
    const tab = params.get('tab');
    return tab === 'strategy' || tab === '6xd' || tab === 'blueprints' || tab === 'testimonials' || tab === 'glossary' || tab === 'faqs' ? tab : 'guidelines';
  }, []);
  const [activeTab, setActiveTab] = useState<WorkGuideTab>(() => getTabFromParams(typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()));

  const TAB_LABELS: Record<WorkGuideTab, string> = {
    strategy: 'GHC',
    guidelines: 'Guidelines',
    '6xd': '6xD',
    blueprints: 'Products',
    testimonials: 'Testimonials',
    glossary: 'Glossary',
    faqs: 'FAQs'
  };

  const TAB_DESCRIPTIONS: Record<WorkGuideTab, { description: string; author?: string }> = {
    strategy: {
      description: 'Explore the Golden Honeycomb of Competencies (GHC), the system behind how DQ works and delivers value.',
      author: 'Authored by DQ Leadership and Strategy Teams'
    },
    guidelines: {
      description: 'Find practical guidelines and best practices to optimize workflow and collaboration across all DQ units.',
      author: 'Authored by DQ Associates, Leads, and Subject Matter Experts'
    },
    '6xd': {
      description: 'Discover the six dimensions of digital transformation that guide how organizations evolve, adapt, and thrive in the digital economy.',
      author: 'Authored by DQ Strategy and Transformation Teams'
    },
    blueprints: {
      description: 'Explore DQ\'s solutions, created to help organizations succeed and grow through digital transformation.',
      author: 'Product Owner / Practice'
    },
    testimonials: {
      description: 'Discover how DQ has enabled impactful transformations through our clients\' success feedback and testimonials.',
      author: 'Authored by DQ Teams, Clients, and Partners'
    },
    glossary: {
      description: 'Find clear explanations of key DQ terms, acronyms, and concepts to help you better understand how we operate.',
      author: 'Maintained by DQ Knowledge Management Team'
    },
    faqs: {
      description: 'Find answers to frequently asked questions about how we work, the tools we use, and the best practices followed across DQ.',
      author: 'Maintained by DQ Knowledge Management Team'
    }
  };

  useEffect(() => {
    if (!isGuides) return;
    setActiveTab(getTabFromParams(queryParams));
  }, [isGuides, queryParams, getTabFromParams]);

  const handleGuidesTabChange = useCallback((tab: WorkGuideTab) => {
    setActiveTab(tab);
    const next = new URLSearchParams(queryParams.toString());
    next.delete('page');
    if (tab === 'guidelines') {
      next.delete('tab');
    } else {
      next.set('tab', tab);
    }
    if (tab !== 'guidelines') {
      // For Strategy and Blueprints, keep 'unit' filter; only delete incompatible filters
      if (tab === 'strategy') {
        // Keep 'unit' and 'location' for Strategy; delete incompatible filters
        const keysToDelete = ['guide_type', 'sub_domain', 'domain', 'testimonial_category'];
        keysToDelete.forEach(key => next.delete(key));
      } else if (tab === 'blueprints') {
        // Keep 'unit' and 'location' for Products; delete incompatible filters
        const keysToDelete = ['guide_type', 'sub_domain', 'domain', 'testimonial_category', 'strategy_type', 'strategy_framework', 'guidelines_category', 'categorization', 'attachments'];
        keysToDelete.forEach(key => next.delete(key));
      } else if (tab === 'glossary') {
        // For Glossary tab, delete all incompatible filters
        const keysToDelete = ['guide_type', 'sub_domain', 'unit', 'domain', 'strategy_type', 'strategy_framework', 'guidelines_category', 'categorization', 'attachments', 'blueprint_framework', 'blueprint_sector', 'testimonial_category', 'faq_category', 'location'];
        keysToDelete.forEach(key => next.delete(key));
      } else if (tab === 'faqs') {
        // For FAQs, keep units/location; clear incompatible filters
        const keysToDelete = ['guide_type', 'sub_domain', 'domain', 'strategy_type', 'strategy_framework', 'guidelines_category', 'categorization', 'attachments', 'blueprint_framework', 'blueprint_sector', 'testimonial_category'];
        keysToDelete.forEach(key => next.delete(key));
      } else if (tab === 'testimonials') {
        // Keep 'unit' and 'location' for Testimonials; delete incompatible filters
        const keysToDelete = ['guide_type', 'sub_domain', 'domain', 'strategy_type', 'strategy_framework', 'guidelines_category', 'categorization', 'attachments', 'blueprint_framework', 'blueprint_sector'];
        keysToDelete.forEach(key => next.delete(key));
      } else {
        // For other tabs, delete all incompatible filters
        const keysToDelete = ['guide_type', 'sub_domain', 'unit', 'domain', 'strategy_type', 'strategy_framework', 'guidelines_category', 'categorization', 'attachments', 'blueprint_framework', 'blueprint_sector', 'testimonial_category'];
        keysToDelete.forEach(key => next.delete(key));
      }
    } else {
      // Switching to Guidelines - clear Strategy and Blueprint-specific filters
      const keysToDelete = ['strategy_type', 'strategy_framework', 'blueprint_framework', 'blueprint_sector'];
      keysToDelete.forEach(key => next.delete(key));
    }
    // Clear tab-specific filters when switching away from their respective tabs
    if (tab !== 'guidelines') {
      next.delete('guidelines_category');
    }
    if (tab !== 'blueprints') {
      next.delete('blueprint_framework');
      next.delete('blueprint_sector');
      next.delete('product_type');
      next.delete('product_stage');
      next.delete('product_class');
      next.delete('product_sector');
    }
    const qs = next.toString();
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `${window.location.pathname}${qs ? '?' + qs : ''}`);
    }
    setQueryParams(new URLSearchParams(next.toString()));
    track('Guides.TabChanged', { tab });
  }, [queryParams, setQueryParams]);

  // Clean up incompatible filters when tab changes (not on every query change)
  const prevTabRef = useRef<WorkGuideTab>(activeTab);
  useEffect(() => {
    if (!isGuides) return;
    if (activeTab === 'guidelines') return;
    // Only run if tab actually changed
    if (prevTabRef.current === activeTab) return;
    prevTabRef.current = activeTab;

    const next = new URLSearchParams(queryParams.toString());
    let changed = false;
    // For Strategy and Blueprints, keep 'unit' filter; only delete incompatible filters
    let keysToDelete: string[] = [];
    if (activeTab === 'strategy') {
      // Keep 'unit' and 'location' for Strategy; delete incompatible filters
      keysToDelete = ['guide_type', 'sub_domain', 'domain', 'testimonial_category'];
    } else if (activeTab === 'blueprints') {
      // Keep 'unit' and 'location' for Blueprints; delete incompatible filters
      keysToDelete = ['guide_type', 'sub_domain', 'domain', 'testimonial_category', 'strategy_type', 'strategy_framework', 'guidelines_category'];
    } else if (activeTab === 'testimonials') {
      // For Testimonials, delete all incompatible filters
      keysToDelete = ['guide_type', 'sub_domain', 'unit', 'domain', 'strategy_type', 'strategy_framework', 'guidelines_category', 'blueprint_framework', 'blueprint_sector'];
    } else if (activeTab === 'glossary') {
      // For Glossary, delete all incompatible filters
      keysToDelete = ['guide_type', 'sub_domain', 'unit', 'domain', 'strategy_type', 'strategy_framework', 'guidelines_category', 'blueprint_framework', 'blueprint_sector', 'testimonial_category', 'faq_category', 'location'];
    } else if (activeTab === 'faqs') {
      // For FAQs, keep location only; clear incompatible filters including units
      keysToDelete = ['guide_type', 'sub_domain', 'unit', 'domain', 'strategy_type', 'strategy_framework', 'guidelines_category', 'blueprint_framework', 'blueprint_sector', 'testimonial_category'];
    } else {
      // For Guidelines, delete Strategy and Blueprint-specific filters
      keysToDelete = ['strategy_type', 'strategy_framework', 'blueprint_framework', 'blueprint_sector'];
    }
    // Clear tab-specific filters when switching away from their respective tabs
    // Note: activeTab cannot be 'guidelines' here due to early return above
    if (next.has('guidelines_category')) {
      next.delete('guidelines_category');
      changed = true;
    }
    if (activeTab !== 'faqs' && next.has('faq_category')) {
      next.delete('faq_category');
      changed = true;
    }
    if (activeTab !== 'blueprints') {
      const productFilterKeys = ['blueprint_framework', 'blueprint_sector', 'product_type', 'product_stage', 'product_class', 'product_sector'];
      productFilterKeys.forEach(key => {
        if (next.has(key)) {
          next.delete(key);
          changed = true;
        }
      });
    }
    keysToDelete.forEach(key => {
      if (next.has(key)) {
        next.delete(key);
        changed = true;
      }
    });
    if (!changed) return;
    const qs = next.toString();
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `${window.location.pathname}${qs ? '?' + qs : ''}`);
    }
    setQueryParams(new URLSearchParams(next.toString()));
  }, [isGuides, activeTab]);

  const pageSize = Math.min(200, Math.max(1, parseInt(queryParams.get('pageSize') || String(DEFAULT_GUIDE_PAGE_SIZE), 10)));
  const currentPage = Math.max(1, parseInt(queryParams.get('page') || '1', 10));
  const totalPages = Math.max(1, Math.ceil(Math.max(totalCount, 0) / pageSize));

  // UI state

  // For courses: URL-based filtering
  const courseFacets = isCourses ? parseFacets(searchParams) : undefined;
  const lmsFilteredItems = isCourses
    ? applyFilters(LMS_COURSES, courseFacets || {})
    : [];
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([]);
  const [compareItems, setCompareItems] = useState<ComparisonItem[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Knowledge-hub specific state
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  // Events filter accordion state - track which filter is expanded
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  // Courses: URL toggle function
  const toggleFilter = useCallback((key: string, value: string) => {
    const curr = new Set((searchParams.get(key)?.split(",").filter(Boolean)) || []);
    curr.has(value) ? curr.delete(value) : curr.add(value);
    const newParams = new URLSearchParams(searchParams);
    if (curr.size) {
      newParams.set(key, Array.from(curr).join(","));
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Apply search query to LMS items
  const searchFilteredItems = isCourses && searchQuery
    ? lmsFilteredItems.filter(item => {
      const searchableText = [
        item.title,
        item.summary,
        item.courseCategory,
        item.deliveryMode,
        item.duration,
        item.levelCode,
        item.levelLabel,
        ...(item.locations || []),
        ...(item.audience || []),
        ...(item.department || [])
      ].filter(Boolean).join(' ').toLowerCase();
      return searchableText.includes(searchQuery.toLowerCase());
    })
    : lmsFilteredItems;

  // Filter glossary terms based on two-level filter structure
  const filteredGlossaryTerms = useMemo(() => {
    if (!isGuides || activeTab !== 'glossary') {
      return [];
    }

    // PRIMARY FILTER: Knowledge System
    const knowledgeSystems = parseFilterValues(queryParams, 'glossary_knowledge_system');

    // SECONDARY FILTERS: GHC
    const ghcDimensions = parseFilterValues(queryParams, 'glossary_ghc_dimension');
    const ghcTermTypes = parseFilterValues(queryParams, 'glossary_ghc_term_type');

    // SECONDARY FILTERS: 6xD
    const sixXdDimensions = parseFilterValues(queryParams, 'glossary_6xd_dimension');
    const sixXdTermTypes = parseFilterValues(queryParams, 'glossary_6xd_term_type');

    // SHARED FILTERS
    const termOrigins = parseFilterValues(queryParams, 'glossary_term_origin');
    const usedIn = parseFilterValues(queryParams, 'glossary_used_in');
    const whoUsesIt = parseFilterValues(queryParams, 'glossary_who_uses_it');
    const letters = parseFilterValues(queryParams, 'glossary_letter');

    // Search query
    const searchQuery = queryParams.get('q') || '';

    return glossaryTerms.filter(term => {
      // PRIMARY: Knowledge System filter
      if (knowledgeSystems.length > 0) {
        if (!term.knowledgeSystem || !knowledgeSystems.includes(term.knowledgeSystem)) return false;
      }

      // SECONDARY: GHC filters (only if GHC is selected or no system filter)
      if (term.knowledgeSystem === 'ghc') {
        if (ghcDimensions.length > 0) {
          if (!term.ghcDimension || !ghcDimensions.includes(term.ghcDimension)) return false;
        }
        if (ghcTermTypes.length > 0) {
          if (!term.ghcTermType || !ghcTermTypes.includes(term.ghcTermType)) return false;
        }
      }

      // SECONDARY: 6xD filters (only if 6xD is selected or no system filter)
      if (term.knowledgeSystem === '6xd') {
        if (sixXdDimensions.length > 0) {
          if (!term.sixXdDimension || !sixXdDimensions.includes(term.sixXdDimension)) return false;
        }
        if (sixXdTermTypes.length > 0) {
          if (!term.sixXdTermType || !sixXdTermTypes.includes(term.sixXdTermType)) return false;
        }
      }

      // SHARED: Term Origin filter
      if (termOrigins.length > 0) {
        if (!term.termOrigin || !termOrigins.includes(term.termOrigin)) return false;
      }

      // SHARED: Used In filter
      if (usedIn.length > 0) {
        if (!term.usedIn || !term.usedIn.some(ui => usedIn.includes(ui))) return false;
      }

      // SHARED: Who Uses It filter
      if (whoUsesIt.length > 0) {
        if (!term.whoUsesIt || !term.whoUsesIt.some(wui => whoUsesIt.includes(wui))) return false;
      }

      // SHARED: Letter filter (A-Z)
      if (letters.length > 0) {
        const termLetter = term.letter.toUpperCase();
        const matchesLetter = letters.some(l => l.toUpperCase() === termLetter);
        if (!matchesLetter) return false;
      }

      // Search filter (works across all terms, no category needed)
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          term.term.toLowerCase().includes(searchLower) ||
          (term.shortIntro && term.shortIntro.toLowerCase().includes(searchLower)) ||
          term.explanation.toLowerCase().includes(searchLower) ||
          term.tags.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [isGuides, activeTab, queryParams]);

  // Compute filters from URL for courses
  const urlBasedFilters: Record<string, string[]> = isCourses
    ? {
      category: courseFacets?.category || [],
      delivery: courseFacets?.delivery || [],
      duration: courseFacets?.duration || [],
      level: (courseFacets?.level || []) as string[],
      department: courseFacets?.department || [],
      location: courseFacets?.location || [],
      audience: courseFacets?.audience || [],
      status: courseFacets?.status || []
    }
    : {};

  // Handle track parameter for newjoiner (courses)
  useEffect(() => {
    if (isCourses) {
      const track = searchParams.get('track');
      if (track === 'newjoiner') {
        const newParams = new URLSearchParams(searchParams);
        if (!newParams.get('level')) {
          newParams.set('level', 'L1,L2');
        }
        if (!newParams.get('category')) {
          newParams.set('category', 'Day in DQ');
        }
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [isCourses, searchParams, setSearchParams]);

  // Load filter configurations
  useEffect(() => {
    if (isCourses) {
      setFilterConfig(COURSE_FILTER_CONFIG);
      setLoading(false);
      return;
    }
    const loadFilterOptions = async () => {
      if (isGuides || isKnowledgeHub) {
        if (filterConfig.length || Object.keys(filters).length) {
          setFilterConfig([]);
          setFilters({});
        }
        return;
      }

      // Use tab-specific filters for Services Center
      if (isServicesCenter) {
        const tabFilters = getTabSpecificFilters(activeServiceTab);
        setFilterConfig(tabFilters);
        const initial: Record<string, string | string[]> = {};
        tabFilters.forEach(c => { initial[c.id] = ''; });
        setFilters(initial);
        return;
      }

      // Initialize filter config for events - fetch Department, Location, and Event Type from database
      if (isEvents) {
        const loadEventsFilters = async () => {
          try {
            // Fetch Department, Location, and Event Type options from database
            const [departmentResult, locationResult, eventTypeResult] = await Promise.all([
              supabase.rpc('get_filter_options', { p_filter_type: 'department', p_filter_category: 'events' }),
              supabase.rpc('get_filter_options', { p_filter_type: 'location', p_filter_category: 'events' }),
              supabase.rpc('get_filter_options', { p_filter_type: 'event-type', p_filter_category: 'events' })
            ]);

            // Build filter config with database values
            const updatedFilterConfig: FilterConfig[] = [];

            // Add Department filter (first) - from database
            // RPC returns: id = option_value (database value), name = option_label (display name)
            // Use opt.id (option_value) for name to ensure exact database value matching
            if (departmentResult.data && departmentResult.data.length > 0) {
              updatedFilterConfig.push({
                id: 'department',
                title: 'Department',
                options: departmentResult.data.map((opt: any) => ({
                  id: opt.id.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, ''),
                  name: opt.id // Use option_value (opt.id) for exact database value matching
                }))
              });
            } else {
              // Fallback: use config if database is empty
              const deptConfig = config.filterCategories?.find(c => c.id === 'department');
              if (deptConfig) updatedFilterConfig.push(deptConfig);
            }

            // Add Location filter (second) - from database
            if (locationResult.data && locationResult.data.length > 0) {
              updatedFilterConfig.push({
                id: 'location',
                title: 'Location',
                options: locationResult.data.map((opt: any) => ({
                  id: opt.id.toLowerCase().replace(/\s+/g, '-'),
                  name: opt.id // Use option_value (opt.id) for exact database value matching
                }))
              });
            } else {
              // Fallback: use config if database is empty
              const locConfig = config.filterCategories?.find(c => c.id === 'location');
              if (locConfig) updatedFilterConfig.push(locConfig);
            }

            // Add Event Type filter (third) - from database
            if (eventTypeResult.data && eventTypeResult.data.length > 0) {
              updatedFilterConfig.push({
                id: 'event-type',
                title: 'Event Type',
                options: eventTypeResult.data.map((opt: any) => ({
                  id: opt.id.toLowerCase().replace(/\s+/g, '-'),
                  name: opt.id // Use option_value (opt.id) for exact database value matching
                }))
              });
            } else {
              // Fallback: use config if database is empty
              const eventTypeConfig = config.filterCategories?.find(c => c.id === 'event-type');
              if (eventTypeConfig) updatedFilterConfig.push(eventTypeConfig);
            }

            // Add other filters from config (Time Range, Delivery Mode, Duration Band)
            const otherFilters = config.filterCategories?.filter(c =>
              c.id !== 'department' && c.id !== 'location' && c.id !== 'event-type'
            ) || [];
            updatedFilterConfig.push(...otherFilters);

            setFilterConfig(updatedFilterConfig);
            console.log('Events filter config loaded:', updatedFilterConfig.length, 'categories (Department, Location, and Event Type from database)');
          } catch (error) {
            console.error('Error loading filter options from database, using config fallback:', error);
            // Fallback to config if database fetch fails
            if (config.filterCategories && config.filterCategories.length > 0) {
              setFilterConfig(config.filterCategories);
            }
          }
        };

        loadEventsFilters();
        return;
      }

      try {
        let filterOptions = await fetchMarketplaceFilters(marketplaceType);
        filterOptions = prependLearningTypeFilter(marketplaceType, filterOptions);
        setFilterConfig(filterOptions);
        const initial: Record<string, string | string[]> = {};
        filterOptions.forEach(c => { initial[c.id] = ''; });
        setFilters(initial);
      } catch (err) {
        console.error('Error fetching filter options:', err);
        setFilterConfig(config.filterCategories);
        const initial: Record<string, string | string[]> = {};
        config.filterCategories.forEach(c => { initial[c.id] = ''; });
        setFilters(initial);
      }
    };
    loadFilterOptions();
  }, [marketplaceType, config, isCourses, isGuides, isKnowledgeHub, isServicesCenter, isEvents, activeServiceTab, filterConfig.length, Object.keys(filters).length]);

  // Fetch items based on marketplace type
  useEffect(() => {
    const run = async () => {
      // COURSES: items come from LMS arrays / URL filters; no fetch
      if (isCourses) {
        setLoading(false);
        setError(null);
        // optional: reflect count in state for pager/UI
        setTotalCount(searchFilteredItems.length);
        setItems([]);               // not used in render for courses
        setFilteredItems([]);       // render uses searchFilteredItems when isCourses
        return;
      }

      // KNOWLEDGE HUB: use fallback data (no API)
      if (isKnowledgeHub) {
        const fallbackItems = getFallbackItems(marketplaceType);
        setItems(fallbackItems);
        setFilteredItems(fallbackItems);
        setTotalCount(fallbackItems.length);
        setLoading(false);
        return;
      }

      // GUIDES: Supabase query + facets (skip for glossary, faqs, and products tabs)
      if (isGuides) {
        if (activeTab === 'glossary' || activeTab === 'faqs') {
          setLoading(false);
          setItems([]);
          setFilteredItems([]);
          setTotalCount(0);
          return;
        }
        
        // Products tab: Skip database query entirely, use static products
        if (activeTab === 'blueprints') {
          setLoading(true);
          try {
            const qStr = queryParams.get('q') || '';
            const productClasses = parseFilterValues(queryParams, 'product_class');

            // Convert static products to guide format
            let out = STATIC_PRODUCTS.map(product => ({
              id: product.id,
              slug: product.slug,
              title: product.title,
              summary: product.summary,
              heroImageUrl: product.heroImageUrl,
              lastUpdatedAt: product.lastUpdatedAt,
              authorName: product.authorName,
              authorOrg: product.authorOrg,
              isEditorsPick: product.isEditorsPick,
              downloadCount: product.downloadCount,
              guideType: product.guideType,
              domain: product.domain,
              functionArea: null,
              unit: null,
              subDomain: null,
              location: null,
              status: product.status,
              complexityLevel: null,
              productType: product.productType,
              productStage: product.productStage,
              productClass: product.productClass,
            }));

            // Apply product class filter
            if (productClasses.length > 0) {
              out = out.filter(it => {
                const itemProductClass = (it.productClass || '').toLowerCase();
                return productClasses.some(selectedClass => {
                  return itemProductClass === selectedClass.toLowerCase();
                });
              });
            }

            // If Class 01 is selected, show no cards
            if (productClasses.includes('class-01')) {
              out = [];
            }

            // Apply search query if provided
            if (qStr) {
              const query = qStr.toLowerCase();
              out = out.filter(it => {
                const searchableText = [
                  it.title,
                  it.summary,
                  it.productType,
                  it.guideType,
                ].filter(Boolean).join(' ').toLowerCase();
                return searchableText.includes(query);
              });
            }

            // Apply location filter (backend)
            // Use exact database column name: location_filter
            // filtersByCategory['location'] contains option_label values which match option_value in our database
            if (filtersByCategory['location'] && filtersByCategory['location'].length > 0) {
              const locationValues = filtersByCategory['location'];
              // Use these values directly as they match the database option_value
              eventsQuery = eventsQuery.in('location_filter', locationValues);
            }
          }

          // Apply ordering
          eventsQuery = eventsQuery.order("start_time", { ascending: true });

          // Explicitly set a high limit to ensure we get all events (Supabase default is 1000, but let's be explicit)
          // Note: If you have more than 1000 events, you'll need pagination
          eventsQuery = eventsQuery.limit(1000);

          const queryResult = await eventsQuery;

          console.log('[Events Marketplace] Query result:', {
            hasData: !!queryResult.data,
            dataLength: queryResult.data?.length || 0,
            hasError: !!queryResult.error,
            error: queryResult.error
          });

          if (!queryResult.error && queryResult.data) {
            data = queryResult.data;
            console.log(`[Events Marketplace] Successfully fetched ${data.length} events`);
          } else {
            error = queryResult.error || new Error("Events_v2 table query failed");
            console.error('[Events Marketplace] Query error:', error);
          }

          // Handle errors gracefully - for events, don't use fallback data
          if (error && (!data || data.length === 0)) {
            if (error?.code === '42501') {
              console.warn("[Events Marketplace] Permission denied: Events may require authentication or proper RLS policies.");
              setError("Permission denied: Events may require authentication or proper RLS policies.");
            } else {
              console.error("[Events Marketplace] Error fetching events:", error);
              setError(`Failed to load events: ${error?.message || 'Unknown error'}`);
            }
            // Show empty state instead of fallback data
            setItems([]);
            setFilteredItems([]);
            setTotalCount(0);
            setLoading(false);
            return;
          }

          if (!data || data.length === 0) {
            console.log("[Events Marketplace] No events found in Supabase - this may be normal if there are no published future events");
            // Show empty state - no fallback to mock data
            setItems([]);
            setFilteredItems([]);
            setTotalCount(0);
            setLoading(false);
            return;
          }

          // Transform Supabase data to marketplace format
          const marketplaceEvents = data.map(transformEventToMarketplace);

          setItems(marketplaceEvents);
          setFilteredItems(marketplaceEvents);
          setTotalCount(marketplaceEvents.length);
        } catch (err) {
          console.error("Error in fetchEvents:", err);
          // For events, show error instead of fallback data
          setError(`Failed to load events: ${err instanceof Error ? err.message : 'Unknown error'}`);
          setItems([]);
          setFilteredItems([]);
          setTotalCount(0);
        } finally {
          setLoading(false);
        }
        return;
      }

      // GUIDES: Supabase query + facets
      if (isGuides) {
        if (activeTab === 'glossary' || activeTab === 'faqs') {
          setLoading(false);
          setItems([]);
          setFilteredItems([]);
          setTotalCount(0);
          return;
        }
        setLoading(true);
        try {
          // Exclude removed guidelines from frontend
          const excludedSlugs = ['atp-guidelines', 'agile-working-guidelines', 'client-session-guidelines', 'dbp-support-guidelines'];

          let q = supabaseClient.from('guides').select(GUIDE_LIST_SELECT, { count: 'exact' });
          excludedSlugs.forEach(slug => {
            q = q.neq('slug', slug);
          });

          const qStr = queryParams.get('q') || '';
          const domains = parseFilterValues(queryParams, 'domain');
          const rawSubs = parseFilterValues(queryParams, 'sub_domain');
          const guideTypes = parseFilterValues(queryParams, 'guide_type');
          const units = parseFilterValues(queryParams, 'unit');
          const locations = parseFilterValues(queryParams, 'location');
          const statuses = parseFilterValues(queryParams, 'status');
          const testimonialCategories = parseFilterValues(queryParams, 'testimonial_category');
          const strategyTypes = parseFilterValues(queryParams, 'strategy_type');
          const strategyFrameworks = parseFilterValues(queryParams, 'strategy_framework');
          const guidelinesCategories = parseFilterValues(queryParams, 'guidelines_category');
          const categorization = parseFilterValues(queryParams, 'categorization');
          const attachmentsFilter = parseFilterValues(queryParams, 'attachments');
          const blueprintFrameworks = parseFilterValues(queryParams, 'blueprint_framework');
          const blueprintSectors = parseFilterValues(queryParams, 'blueprint_sector');

          // Get activeTab from state - ensure it's current
          const currentActiveTab = activeTab;
          const isStrategyTab = currentActiveTab === 'strategy';
          const isBlueprintTab = currentActiveTab === 'blueprints';
          const isTestimonialsTab = currentActiveTab === 'testimonials';
          const isGlossaryTab = currentActiveTab === 'glossary';
          const isFAQsTab = currentActiveTab === 'faqs';
          const isGuidelinesTab = currentActiveTab === 'guidelines';
          const isSpecialTab = isStrategyTab || isBlueprintTab || isTestimonialsTab || isGlossaryTab || isFAQsTab;

          const allowed = new Set<string>();
          if (!isSpecialTab) {
            domains.forEach(d => (SUBDOMAIN_BY_DOMAIN[d] || []).forEach(s => allowed.add(s)));
          }
          const subDomains = !isSpecialTab
            ? (allowed.size ? rawSubs.filter(v => allowed.has(v)) : rawSubs)
            : [];

          const effectiveGuideTypes = isSpecialTab ? [] : guideTypes;
          // Enable unit filtering for all tabs (Strategy, Blueprints, and Guidelines)
          const effectiveUnits = (isStrategyTab || isBlueprintTab || !isSpecialTab) ? units : [];

          if (!isSpecialTab && rawSubs.length && subDomains.length !== rawSubs.length) {
            const next = new URLSearchParams(queryParams.toString());
            if (subDomains.length) next.set('sub_domain', subDomains.join(','));
            else next.delete('sub_domain');
            if (typeof window !== 'undefined') {
              window.history.replaceState(null, '', `${window.location.pathname}${next.toString() ? '?' + next.toString() : ''}`);
            }
            setQueryParams(new URLSearchParams(next.toString()));
            setLoading(false);
            return;
          }

          if (statuses.length) q = q.in('status', statuses); else {
            // For Strategy tab: show Published/Approved AND Draft (but not Archived)
            // For other tabs: show only Approved
            if (isStrategyTab) {
              q = q.in('status', ['Approved', 'Published', 'Draft']);
            } else {
              q = q.eq('status', 'Approved');
            }
          }
          if (qStr) q = q.or(`title.ilike.%${qStr}%,summary.ilike.%${qStr}%`);
          if (isStrategyTab) {
            q = q.or('domain.ilike.%Strategy%,guide_type.ilike.%Strategy%');
          } else if (isBlueprintTab) {
            q = q.or('domain.ilike.%Blueprint%,guide_type.ilike.%Blueprint%');
          } else if (isTestimonialsTab) {
            q = q.or('domain.ilike.%Testimonial%,guide_type.ilike.%Testimonial%');
          } else if (isGuidelinesTab) {
            // For Guidelines tab: if domain filter is set, use it; otherwise fetch all and filter client-side
            // Client-side filtering will exclude Strategy/Blueprint/Testimonial guides
            if (domains.length) {
              q = q.in('domain', domains);
            }
            // If no domain filter, fetch all guides - client-side will filter out Strategy/Blueprint/Testimonial
          } else if (domains.length) {
            q = q.in('domain', domains);
          }
          // Note: For Guidelines tab, we also do client-side filtering to be extra safe
          if (!isSpecialTab && subDomains.length) q = q.in('sub_domain', subDomains);
          // For Guidelines, guide_type filtering is done client-side because filter IDs are slugified ('best-practice')
          // but database values are like 'Best Practice', so Supabase .in() won't match
          // For other tabs, use Supabase filter if guide types are provided
          if (effectiveGuideTypes.length && !isGuidelinesTab) q = q.in('guide_type', effectiveGuideTypes);
          // Note: Unit filtering is done client-side after fetching to handle normalization
          // (filter IDs are slugified like 'deals', but DB may have 'Deals' or 'DQ Delivery (Accounts)')
          if (locations.length) q = q.in('location', locations);

          const sort = queryParams.get('sort') || 'editorsPick';
          if (sort === 'updated') q = q.order('last_updated_at', { ascending: false, nullsFirst: false });
          else if (sort === 'downloads') q = q.order('download_count', { ascending: false, nullsFirst: false });
          else if (sort === 'editorsPick') {
            q = q.order('is_editors_pick', { ascending: false })
              .order('last_updated_at', { ascending: false, nullsFirst: false });
          } else {
            q = q.order('is_editors_pick', { ascending: false })
              .order('download_count', { ascending: false, nullsFirst: false })
              .order('last_updated_at', { ascending: false, nullsFirst: false });
          }

          // If unit filtering or framework filtering is needed client-side, fetch ALL results first, then filter and paginate
          // Otherwise, use server-side pagination
          const needsClientSideUnitFilter = effectiveUnits.length > 0;
          const needsClientSideFrameworkFilter = (isStrategyTab && strategyFrameworks.length > 0) || 
                                                 (isBlueprintTab && (blueprintFrameworks.length > 0 || blueprintSectors.length > 0 || productTypes.length > 0 || productStages.length > 0 || productSectors.length > 0)) ||
                                                 (isGuidelinesTab && guidelinesCategories.length > 0);
          const needsClientSideFiltering = needsClientSideUnitFilter || needsClientSideFrameworkFilter || categorization.length > 0 || attachmentsFilter.length > 0;
          
          const from = (currentPage - 1) * pageSize;
          const to = from + pageSize - 1;

          // Fetch all results if client-side filtering is needed, otherwise use pagination
          // When fetching all, we need to set a high limit (Supabase default is 1000)
          const listPromise = needsClientSideFiltering ? q.limit(10000) : q.range(from, to);

          // Exclude removed guidelines from facets
          let facetQ = supabaseClient
            .from('guides')
            .select('domain,sub_domain,guide_type,function_area,unit,location,status');
          
          // Apply same status filter as main query for facets
          if (statuses.length) {
            facetQ = facetQ.in('status', statuses);
          } else {
            // For Strategy tab: show Published/Approved AND Draft (but not Archived)
            // For other tabs: show only Approved
            if (isStrategyTab) {
              facetQ = facetQ.in('status', ['Approved', 'Published', 'Draft']);
            } else {
              facetQ = facetQ.eq('status', 'Approved');
            }
          }
          
          excludedSlugs.forEach(slug => {
            facetQ = facetQ.neq('slug', slug);
          });

          // Facets should show ALL available options for the current tab, not filtered by selected filters
          // This ensures filter options don't disappear when other filters are selected
          if (qStr) facetQ = facetQ.or(`title.ilike.%${qStr}%,summary.ilike.%${qStr}%`);
          if (isStrategyTab) facetQ = facetQ.or('domain.ilike.%Strategy%,guide_type.ilike.%Strategy%');
          else if (isBlueprintTab) facetQ = facetQ.or('domain.ilike.%Blueprint%,guide_type.ilike.%Blueprint%');
          else if (isTestimonialsTab) facetQ = facetQ.or('domain.ilike.%Testimonial%,guide_type.ilike.%Testimonial%');
          // For Guidelines tab: facets should only include Guidelines guides (exclude Strategy/Blueprint/Testimonial)
          // But don't filter by selected guide_type, units, locations - show all available options for Guidelines
          // Only filter by status if needed
          if (statuses.length) facetQ = facetQ.in('status', statuses);

          const [{ data: rows, count, error }, { data: facetRows, error: facetError }] = await Promise.all([
            listPromise,
            facetQ,
          ]);
          if (error) {
            console.error('Guides query error:', error);
            throw error;
          }
          if (facetError) console.warn('Facet query failed', facetError);

          // Debug logging
          if (isGuides) {
            console.log('[Guides Debug]', {
              activeTab,
              currentActiveTab,
              isStrategyTab,
              isBlueprintTab,
              isGuidelinesTab,
              rowsCount: rows?.length || 0,
              totalCount: count,
              qStr,
              hasError: !!error,
              sampleRows: rows?.slice(0, 3).map((r: any) => ({
                title: r.title,
                domain: r.domain,
                guide_type: r.guide_type,
                status: r.status
              }))
            });
          }

          const mapped = (rows || []).map((r: any) => {
            const unitValue = r.unit ?? r.function_area ?? null;
            const subDomainValue = r.sub_domain ?? r.subDomain ?? null;
            return {
              id: r.id,
              slug: r.slug,
              title: r.title,
              summary: r.summary,
              heroImageUrl: r.hero_image_url ?? r.heroImageUrl,
              // skillLevel: r.skill_level ?? r.skillLevel,
              estimatedTimeMin: r.estimated_time_min ?? r.estimatedTimeMin,
              lastUpdatedAt: r.last_updated_at ?? r.lastUpdatedAt,
              authorName: r.author_name ?? r.authorName,
              authorOrg: r.author_org ?? r.authorOrg,
              isEditorsPick: r.is_editors_pick ?? r.isEditorsPick,
              downloadCount: r.download_count ?? r.downloadCount,
              guideType: r.guide_type ?? r.guideType,
              domain: r.domain ?? null,
              functionArea: unitValue,
              unit: unitValue,
              subDomain: subDomainValue,
              location: r.location ?? null,
              status: r.status ?? null,
              complexityLevel: r.complexity_level ?? null,
            };
          });

          let out = mapped;

          // Apply tab filtering FIRST to get only guides for the current tab
          // This ensures unit filtering only applies to the correct tab's guides
          // CRITICAL: This must happen before any other filtering to prevent cross-tab contamination
          // Note: Server-side filtering is also applied, but client-side filtering ensures consistency
          if (isStrategyTab) {
            // Show all strategy guides; server-side query already biases toward Strategy
            // EXCLUDE: HoV competencies (HoV 1-12) - only show main HoV card (dq-hov)
            // EXCLUDE: Any other unwanted strategy guides
            const excludedStrategySlugs = [
              'dq-competencies-emotional-intelligence',
              'dq-competencies-growth-mindset',
              'dq-competencies-purpose',
              'dq-competencies-perceptive',
              'dq-competencies-proactive',
              'dq-competencies-perseverance',
              'dq-competencies-precision',
              'dq-competencies-customer',
              'dq-competencies-learning',
              'dq-competencies-collaboration',
              'dq-competencies-responsibility',
              'dq-competencies-trust',
              'dq-competencies', // Exclude the competencies overview page
              'dq-beliefs', // Exclude DQ Beliefs if it exists
              'dq-strategy-2021-2030', // Exclude DQ Strategy 2021-2030 if it exists
              'dq-journey', // Exclude DQ Journey
              'journey', // Exclude any guide with "journey" slug
            ];
            
            // Canonical GHC slugs - only these should be shown
            const canonicalGHCSlugs = [
              'dq-ghc',
              'dq-vision',
              'dq-hov',
              'dq-persona',
              'dq-agile-tms',
              'dq-agile-sos',
              'dq-agile-flows',
              'dq-agile-6xd'
            ];
            
            out = out.filter(it => {
              const slug = (it.slug || '').toLowerCase();
              const title = (it.title || '').toLowerCase();
              
              // Exclude if slug matches any excluded slug
              if (excludedStrategySlugs.includes(slug)) return false;
              
              // Exclude if title contains unwanted keywords
              if (title.includes('dq journey') || 
                  title.includes('dq beliefs') || 
                  title.includes('strategy 2021') ||
                  title.includes('strategy 2030')) {
                return false;
              }
              
              // For GHC guides, only allow canonical slugs to prevent duplicates
              // Check if this looks like a GHC guide (has GHC-related keywords)
              const looksLikeGHC = title.includes('ghc') || 
                                   title.includes('agile tms') || 
                                   title.includes('agile sos') || 
                                   title.includes('agile flows') || 
                                   title.includes('agile 6xd') ||
                                   title.includes('6xd') ||
                                   slug.includes('ghc') ||
                                   slug.includes('agile');
              
              // If it looks like a GHC guide but doesn't have a canonical slug, exclude it
              if (looksLikeGHC && !canonicalGHCSlugs.includes(slug)) {
                // Exception: allow if it's explicitly not a duplicate (doesn't match canonical titles)
                const canonicalTitles = [
                  'ghc overview',
                  'golden honeycomb',
                  'dq vision',
                  'house of values',
                  'dq persona',
                  'agile tms',
                  'agile sos',
                  'agile flows',
                  'agile 6xd'
                ];
                
                // If title closely matches a canonical title, it's likely a duplicate
                const matchesCanonical = canonicalTitles.some(canonical => {
                  // Remove common prefixes/suffixes for comparison
                  const cleanTitle = title.replace(/^(ghc|dq)\s+/i, '').replace(/\s+\(.*\)$/i, '').trim();
                  return cleanTitle.includes(canonical) || canonical.includes(cleanTitle);
                });
                
                if (matchesCanonical) {
                  return false; // Exclude duplicate
                }
              }
              
              return true;
            });
          } else if (isBlueprintTab) {
            // Products tab: Replace all database results with static products
            // Convert static products to guide format immediately
            out = STATIC_PRODUCTS.map(product => ({
              id: product.id,
              slug: product.slug,
              title: product.title,
              summary: product.summary,
              heroImageUrl: product.heroImageUrl,
              lastUpdatedAt: product.lastUpdatedAt,
              authorName: product.authorName,
              authorOrg: product.authorOrg,
              isEditorsPick: product.isEditorsPick,
              downloadCount: product.downloadCount,
              guideType: product.guideType,
              domain: product.domain,
              functionArea: null,
              unit: null,
              subDomain: null,
              location: null,
              status: product.status,
              complexityLevel: null,
              // Store product metadata for filtering
              productType: product.productType,
              productStage: product.productStage,
              productClass: product.productClass,
            }));
          } else if (isGuidelinesTab) {
            // Guidelines tab: explicitly exclude Strategy, Blueprint, and Testimonial guides
            // Must be strict - guides should NOT have Strategy/Blueprint/Testimonial in domain OR guide_type
            // This is CRITICAL to prevent Strategy guides from showing in Guidelines tab
            out = out.filter(it => {
              const domain = (it.domain || '').toLowerCase().trim();
              const guideType = (it.guideType || '').toLowerCase().trim();
              // Exclude if domain or guide_type contains strategy, blueprint, or testimonial
              const hasStrategy = domain.includes('strategy') || guideType.includes('strategy');
              const hasBlueprint = domain.includes('blueprint') || guideType.includes('blueprint');
              const hasTestimonial = domain.includes('testimonial') || guideType.includes('testimonial');
              // Only include if it doesn't have any of these - be very strict
              if (hasStrategy || hasBlueprint || hasTestimonial) {
                return false; // Explicitly exclude
              }
              return true; // Include only if it's definitely not Strategy/Blueprint/Testimonial
            });
          } else {
            // Fallback: if somehow we don't have a recognized tab, show nothing to be safe
            out = [];
          }
          // If no tab is active (shouldn't happen), show all guides

          // Now apply other filters to the tab-filtered results
          if (domains.length) out = out.filter(it => it.domain && domains.includes(it.domain));
          if (subDomains.length) out = out.filter(it => it.subDomain && subDomains.includes(it.subDomain));
          if (effectiveGuideTypes.length) {
            // Normalize guide type values for comparison
            // Filter IDs come from facets which are the actual database values (like "Best Practice", "SOP")
            // Use OR logic: show guides that match ANY selected guide type
            // IMPORTANT: Only show guides that have a guide type assigned (don't show guides without guide types when filters are active)
            out = out.filter(it => {
              const guideTypeValue = it.guideType;
              // If guide has no guide type, exclude it when guide type filters are active
              if (!guideTypeValue) return false;
              // Compare both normalized (slugified) values for case-insensitive matching
              const normalizedDbValue = slugify(guideTypeValue);
              // Check if any selected guide type matches (normalize both sides for comparison)
              return effectiveGuideTypes.some(selectedType => {
                const normalizedSelected = slugify(selectedType);
                // Match if slugified values are equal, or if the actual values match (case-insensitive)
                return normalizedDbValue === normalizedSelected ||
                  guideTypeValue.toLowerCase().trim() === selectedType.toLowerCase().trim();
              });
            });
          }
          if (effectiveUnits.length) {
            // Normalize unit values for comparison (filter IDs are slugified like 'deals', DB values may be 'Deals' or 'DQ Delivery (Accounts)')
            // Use OR logic: show guides that match ANY selected unit
            // IMPORTANT: Only show guides that have a unit assigned (don't show guides without units when filters are active)
            out = out.filter(it => {
              const unitValue = it.unit || it.functionArea;
              // If guide has no unit, exclude it when unit filters are active
              if (!unitValue) return false;
              // Slugify the database value to match the filter ID format
              const normalizedDbValue = slugify(unitValue);
              // Filter IDs are already slugified, so compare directly - show if it matches ANY selected unit
              const matches = effectiveUnits.some(selectedUnit => {
                // Normalize both sides for comparison (in case selectedUnit isn't already slugified)
                const normalizedSelected = slugify(selectedUnit);
                return normalizedDbValue === normalizedSelected;
              });
              return matches;
            });
          }
          if (isGuidelinesTab && categorization.length) {
            const catKeywords = {
              'policy-set-1a-opg': ['policy set 1a', 'opg'],
              'policy-set-1b-ppp': ['policy set 1b', 'ppp'],
              'policy-set-2a-vision': ['policy set 02', '2a', 'vision'],
              'policy-set-2b-culture': ['policy set 02', '2b', 'culture'],
              'policy-set-2c-persona': ['policy set 02', '2c', 'persona'],
              'policy-set-2d-task': ['policy set 02', '2d', 'task'],
              'policy-set-2e-govern': ['policy set 02', '2e', 'govern'],
              'policy-set-2f-flow': ['policy set 02', '2f', 'flow'],
              'policy-set-2g-product': ['policy set 02', '2g', 'product'],
            } as Record<string, string[]>;
            out = out.filter(it => {
              const haystack = `${it.title || ''} ${it.summary || ''} ${it.subDomain || ''} ${it.slug || ''}`.toLowerCase();
              return categorization.some(cat => {
                const kw = catKeywords[cat] || [cat.replace(/-/g, ' ')];
                return kw.some(k => haystack.includes(k.toLowerCase()));
              });
            });
          }
          // Attachments filter skipped (attachments not fetched in select)
          // Strategy-specific filters: Strategy Type and Framework/Program
          // These filters check sub_domain field (which stores these categories)
          if (isStrategyTab && strategyTypes.length) {
            out = out.filter(it => {
              const subDomain = (it.subDomain || '').toLowerCase();
              return strategyTypes.some(selectedType => {
                const normalizedSelected = slugify(selectedType);
                const normalizedSubDomain = slugify(subDomain);
                return normalizedSubDomain === normalizedSelected ||
                  subDomain.includes(selectedType.toLowerCase()) ||
                  selectedType.toLowerCase().includes(subDomain);
              });
            });
          }
          if (isStrategyTab && strategyFrameworks.length) {
            out = out.filter(it => {
              const subDomain = (it.subDomain || '').toLowerCase();
              const domain = (it.domain || '').toLowerCase();
              const guideType = (it.guideType || '').toLowerCase();
              const title = (it.title || '').toLowerCase();
              const slug = (it.slug || '').toLowerCase();
              const allText = `${subDomain} ${domain} ${guideType} ${title} ${slug}`.toLowerCase();

              const frameworkKeywords: Record<string, string[]> = {
                'ghc1': ['vision'],
                'ghc2': ['dq-hov', 'house of values'],
                'ghc3': ['persona'],
                'ghc4': ['agile tms', 'tms'],
                'ghc5': ['agile sos', 'sos'],
                'ghc6': ['agile flows', 'flows'],
                'ghc7': ['agile 6xd', '6xd'],
              };

              return strategyFrameworks.some(selected => {
                // Special case: GHC 2 should only show the main HoV card
                if (selected === 'ghc2') {
                  if (slug === 'dq-hov') return true;
                  const isHoVTitle = title.includes('house of values') && !title.includes('competencies');
                  return isHoVTitle;
                }
                const keywords = frameworkKeywords[selected] || [selected];
                return keywords.some(kw => allText.includes(kw));
              });
            });
          }
          // Guidelines-specific filter: Category (Resources, Policies, xDS)
          if (isGuidelinesTab && guidelinesCategories.length) {
            out = out.filter(it => {
              const subDomain = (it.subDomain || '').toLowerCase();
              const domain = (it.domain || '').toLowerCase();
              const guideType = (it.guideType || '').toLowerCase();
              const title = (it.title || '').toLowerCase();
              const allText = `${subDomain} ${domain} ${guideType} ${title}`.toLowerCase();
              return guidelinesCategories.some(selectedCategory => {
                const normalizedSelected = slugify(selectedCategory);
                // Check various fields for category matches
                return allText.includes(selectedCategory.toLowerCase()) ||
                  allText.includes(normalizedSelected) ||
                  (selectedCategory === 'resources' && (allText.includes('resource') || allText.includes('guideline'))) ||
                  (selectedCategory === 'policies' && (allText.includes('policy') || allText.includes('policies'))) ||
                  (selectedCategory === 'xds' && (allText.includes('xds') || allText.includes('design-system') || allText.includes('design systems')));
              });
            });
          }
          // Blueprints-specific filter: Framework (DevOps, DBP, DXP, DWS, Products, Projects)
          if (isBlueprintTab && blueprintFrameworks.length) {
            out = out.filter(it => {
              const subDomain = (it.subDomain || '').toLowerCase();
              const domain = (it.domain || '').toLowerCase();
              const guideType = (it.guideType || '').toLowerCase();
              const title = (it.title || '').toLowerCase();
              const allText = `${subDomain} ${domain} ${guideType} ${title}`.toLowerCase();
              return blueprintFrameworks.some(selectedFramework => {
                const normalizedSelected = slugify(selectedFramework);
                // Check various fields for framework matches
                return allText.includes(selectedFramework.toLowerCase()) ||
                  allText.includes(normalizedSelected) ||
                  (selectedFramework === 'devops' && allText.includes('devops')) ||
                  (selectedFramework === 'dbp' && allText.includes('dbp')) ||
                  (selectedFramework === 'dxp' && allText.includes('dxp')) ||
                  (selectedFramework === 'dws' && allText.includes('dws')) ||
                  (selectedFramework === 'products' && allText.includes('product')) ||
                  (selectedFramework === 'projects' && allText.includes('project'));
              });
            });
          }
          if (locations.length) out = out.filter(it => it.location && locations.includes(it.location));
          if (statuses.length) out = out.filter(it => it.status && statuses.includes(it.status));

          if (sort === 'updated') out.sort((a, b) => new Date(b.lastUpdatedAt || 0).getTime() - new Date(a.lastUpdatedAt || 0).getTime());
          else if (sort === 'downloads') out.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
          else if (sort === 'editorsPick')
            out.sort((a, b) => (Number(b.isEditorsPick) || 0) - (Number(a.isEditorsPick) || 0) ||
              new Date(b.lastUpdatedAt || 0).getTime() - new Date(a.lastUpdatedAt || 0).getTime());
          else
            out.sort((a, b) => (Number(b.isEditorsPick) || 0) - (Number(a.isEditorsPick) || 0) ||
              (b.downloadCount || 0) - (a.downloadCount || 0) ||
              new Date(b.lastUpdatedAt || 0).getTime() - new Date(a.lastUpdatedAt || 0).getTime());

          // Ensure default image if missing
          const defaultImage = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop&q=80';
          out = out.map(it => ({
            ...it,
            heroImageUrl: it.heroImageUrl || defaultImage,
          }));

          // If client-side filtering was used, paginate after filtering
          const totalFiltered = out.length;
          if (needsClientSideFiltering) {
            out = out.slice(from, from + pageSize);
          }

          const total = needsClientSideFiltering ? totalFiltered : (typeof count === 'number' ? count : out.length);
          const lastPage = Math.max(1, Math.ceil(total / pageSize));
          // If current page exceeds last page (e.g., after filtering), reset to page 1
          if (currentPage > lastPage) {
            const next = new URLSearchParams(queryParams.toString());
            if (lastPage <= 1) next.delete('page'); else next.set('page', '1'); // Always reset to page 1 if invalid
            if (typeof window !== 'undefined') {
              window.history.replaceState(null, '', `${window.location.pathname}${next.toString() ? '?' + next.toString() : ''}`);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            setQueryParams(new URLSearchParams(next.toString()));
            setLoading(false);
            return;
          }

          // facets query (unchanged)
          const countBy = (arr: any[] | null | undefined, key: string) => {
            const m = new Map<string, number>();
            for (const r of (arr || [])) { const v = (r as any)[key]; if (!v) continue; m.set(v, (m.get(v) || 0) + 1); }
            return Array.from(m.entries()).map(([id, cnt]) => ({ id, name: id, count: cnt }))
              .sort((a, b) => a.name.localeCompare(b.name));
          };

          // Filter facet rows for Guidelines tab to exclude Strategy/Blueprint/Testimonial
          let filteredFacetRows = facetRows;
          if (isGuidelinesTab) {
            filteredFacetRows = (facetRows || []).filter((r: any) => {
              const domain = ((r.domain || '').toLowerCase().trim());
              const guideType = ((r.guide_type || '').toLowerCase().trim());
              const hasStrategy = domain.includes('strategy') || guideType.includes('strategy');
              const hasBlueprint = domain.includes('blueprint') || guideType.includes('blueprint');
              const hasTestimonial = domain.includes('testimonial') || guideType.includes('testimonial');
              return !hasStrategy && !hasBlueprint && !hasTestimonial;
            });
          }

          const domainFacets = countBy(filteredFacetRows, 'domain');
          const guideTypeFacets = countBy(filteredFacetRows, 'guide_type');
          const subDomainFacetsRaw = countBy(filteredFacetRows, 'sub_domain');
          const unitFacets = countBy(filteredFacetRows, 'unit');
          const locationFacets = countBy(filteredFacetRows, 'location');
          const statusFacets = countBy(filteredFacetRows, 'status');

          const allowedForFacets = new Set<string>();
          if (!isSpecialTab) {
            domains.forEach(d => (SUBDOMAIN_BY_DOMAIN[d] || []).forEach(s => allowedForFacets.add(s)));
          }
          const subDomainFacets = allowedForFacets.size
            ? subDomainFacetsRaw.filter(opt => allowedForFacets.has(opt.id))
            : subDomainFacetsRaw;

          // Strategy (GHC) tab: enforce deterministic ordering of GHC overview and competencies
          if (isGuides && activeTab === 'strategy') {
            const ghcOrder = [
              'dq-ghc',
              'dq-vision',
              'dq-hov',
              'dq-persona',
              'dq-agile-tms',
              'dq-agile-sos',
              'dq-agile-flows',
              'dq-agile-6xd'
            ];
            // Note: HoV competencies are excluded from display, so no need to include them in ordering
            const titleOrder = [
              'dq golden honeycomb of competencies',
              'dq vision',
              'house of values',
              'dq persona',
              'agile tms',
              'agile sos',
              'agile flows',
              'agile 6xd'
            ];
            const orderIndex = (item: any) => {
              const slug = (item.slug || '').toLowerCase();
              const title = (item.title || '').toLowerCase();
              const slugIdx = ghcOrder.indexOf(slug);
              if (slugIdx >= 0) return slugIdx;
              const titleIdx = titleOrder.findIndex(t => title.includes(t));
              return titleIdx >= 0 ? titleIdx : Number.MAX_SAFE_INTEGER;
            };
            out = [...out].sort((a, b) => orderIndex(a) - orderIndex(b));
          }

          setItems(out);
          setFilteredItems(out);
          setTotalCount(total);
          setFacets({
            domain: domainFacets,
            sub_domain: subDomainFacets,
            guide_type: guideTypeFacets,
            unit: unitFacets,
            location: locationFacets,
            status: statusFacets,
          });

          const start = searchStartRef.current;
          if (start) { const latency = Date.now() - start; track('Guides.Search', { q: qStr, latency_ms: latency }); searchStartRef.current = null; }
          track('Guides.ViewList', { q: qStr, sort, page: String(currentPage) });
        } catch (e) {
          console.error('Error fetching guides:', e);
          setItems([]); setFilteredItems([]); setFacets({}); setTotalCount(0);
        } finally {
          setLoading(false);
        }
        return;
      }

      // OTHER MARKETPLACES (financial, non-financial, onboarding)
      setLoading(true);
      setError(null);
      try {
        const itemsData = await fetchMarketplaceItems(
          marketplaceType,
          Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : (v || '')])),
          searchQuery
        );
        const finalItems = itemsData?.length ? itemsData : getFallbackItems(marketplaceType);
        setItems(finalItems);

        // Apply filters for non-financial services
        let filtered = finalItems;
        if (isServicesCenter) {
          // Filter by active tab (category) to control which service cards show
          const tabCategoryMap: Record<string, string> = {
            'technology': 'Technology',
            'business': 'Employee Services',
            'digital_worker': 'Digital Worker',
            'prompt_library': 'Prompt Library',
            'ai_tools': 'AI Tools'
          };
          const activeTabCategory = tabCategoryMap[activeServiceTab];
          if (activeTabCategory) {
            filtered = filtered.filter(item => {
              const itemCategory = item.category || '';
              return itemCategory === activeTabCategory;
            });
          }

          // Filter by serviceType
          const serviceTypeFilter = filters.serviceType;
          if (serviceTypeFilter) {
            const serviceTypes = Array.isArray(serviceTypeFilter) ? serviceTypeFilter : [serviceTypeFilter];
            if (serviceTypes.length > 0) {
              filtered = filtered.filter(item => {
                const itemServiceType = (item.serviceType || '').toLowerCase().trim();
                return serviceTypes.some(filterType => {
                  const normalizedFilter = filterType.toLowerCase().trim();
                  // Normalize variations: 'self-service', 'self service', 'selfservice' all match
                  const normalizeType = (type: string) => {
                    return type.replace(/[\s-]/g, '').toLowerCase();
                  };
                  const normalizedItemType = normalizeType(itemServiceType);
                  const normalizedFilterType = normalizeType(normalizedFilter);
                  return normalizedItemType === normalizedFilterType;
                });
              });
            }
          }

          // Filter by userCategory (Technology-specific)
          const userCategoryFilter = filters.userCategory;
          if (userCategoryFilter) {
            const userCategories = Array.isArray(userCategoryFilter) ? userCategoryFilter : [userCategoryFilter];
            if (userCategories.length > 0) {
              filtered = filtered.filter(item => {
                const itemUserCategories = item.userCategory || [];
                const itemUserCategoriesArray = Array.isArray(itemUserCategories) ? itemUserCategories : [itemUserCategories];
                return userCategories.some(filterCategory =>
                  itemUserCategoriesArray.some(itemCat =>
                    itemCat.toLowerCase() === filterCategory.toLowerCase()
                  )
                );
              });
            }
          }

          // Filter by technicalCategory (Technology-specific)
          const technicalCategoryFilter = filters.technicalCategory;
          if (technicalCategoryFilter) {
            const technicalCategories = Array.isArray(technicalCategoryFilter) ? technicalCategoryFilter : [technicalCategoryFilter];
            if (technicalCategories.length > 0) {
              filtered = filtered.filter(item => {
                const itemTechnicalCategories = item.technicalCategory || [];
                const itemTechnicalCategoriesArray = Array.isArray(itemTechnicalCategories) ? itemTechnicalCategories : [itemTechnicalCategories];
                return technicalCategories.some(filterCategory =>
                  itemTechnicalCategoriesArray.some(itemCat =>
                    itemCat.toLowerCase() === filterCategory.toLowerCase()
                  )
                );
              });
            }
          }

          // Filter by deviceOwnership (Technology-specific)
          const deviceOwnershipFilter = filters.deviceOwnership;
          if (deviceOwnershipFilter) {
            const deviceOwnerships = Array.isArray(deviceOwnershipFilter) ? deviceOwnershipFilter : [deviceOwnershipFilter];
            if (deviceOwnerships.length > 0) {
              filtered = filtered.filter(item => {
                const itemDeviceOwnerships = item.deviceOwnership || [];
                const itemDeviceOwnershipsArray = Array.isArray(itemDeviceOwnerships) ? itemDeviceOwnerships : [itemDeviceOwnerships];
                return deviceOwnerships.some(filterOwnership =>
                  itemDeviceOwnershipsArray.some(itemOwn =>
                    itemOwn.toLowerCase().replace(/[\s-]/g, '') === filterOwnership.toLowerCase().replace(/[\s-]/g, '')
                  )
                );
              });
            }
          }

          // Filter by services (Business-specific)
          const servicesFilter = filters.services;
          if (servicesFilter) {
            const services = Array.isArray(servicesFilter) ? servicesFilter : [servicesFilter];
            if (services.length > 0) {
              filtered = filtered.filter(item => {
                const itemServices = item.services || [];
                const itemServicesArray = Array.isArray(itemServices) ? itemServices : [itemServices];
                return services.some(filterService =>
                  itemServicesArray.some(itemSvc =>
                    itemSvc.toLowerCase().replace(/[\s_]/g, '') === filterService.toLowerCase().replace(/[\s_]/g, '')
                  )
                );
              });
            }
          }

          // Filter by documentType (Business-specific)
          const documentTypeFilter = filters.documentType;
          if (documentTypeFilter) {
            const documentTypes = Array.isArray(documentTypeFilter) ? documentTypeFilter : [documentTypeFilter];
            if (documentTypes.length > 0) {
              filtered = filtered.filter(item => {
                const itemDocumentTypes = item.documentType || [];
                const itemDocumentTypesArray = Array.isArray(itemDocumentTypes) ? itemDocumentTypes : [itemDocumentTypes];
                return documentTypes.some(filterDocType =>
                  itemDocumentTypesArray.some(itemDocType =>
                    itemDocType.toLowerCase() === filterDocType.toLowerCase()
                  )
                );
              });
            }
          }

          // Filter by serviceDomains (Digital Worker-specific)
          const serviceDomainsFilter = filters.serviceDomains;
          if (serviceDomainsFilter) {
            const serviceDomains = Array.isArray(serviceDomainsFilter) ? serviceDomainsFilter : [serviceDomainsFilter];
            if (serviceDomains.length > 0) {
              filtered = filtered.filter(item => {
                const itemServiceDomains = item.serviceDomains || [];
                const itemServiceDomainsArray = Array.isArray(itemServiceDomains) ? itemServiceDomains : [itemServiceDomains];
                return serviceDomains.some(filterDomain =>
                  itemServiceDomainsArray.some(itemDomain =>
                    itemDomain.toLowerCase().replace(/[\s_&]/g, '') === filterDomain.toLowerCase().replace(/[\s_&]/g, '')
                  )
                );
              });
            }
          }

          // Filter by aiMaturityLevel (Digital Worker-specific)
          const aiMaturityLevelFilter = filters.aiMaturityLevel;
          if (aiMaturityLevelFilter) {
            const aiMaturityLevels = Array.isArray(aiMaturityLevelFilter) ? aiMaturityLevelFilter : [aiMaturityLevelFilter];
            if (aiMaturityLevels.length > 0) {
              filtered = filtered.filter(item => {
                const itemMaturityLevel = item.aiMaturityLevel || '';
                const itemMaturityLevelArray = Array.isArray(itemMaturityLevel) ? itemMaturityLevel : [itemMaturityLevel];
                return aiMaturityLevels.some(filterLevel =>
                  itemMaturityLevelArray.some(itemLevel =>
                    itemLevel.toLowerCase().replace(/[\s_()]/g, '') === filterLevel.toLowerCase().replace(/[\s_()]/g, '')
                  )
                );
              });
            }
          }

          // Filter by toolCategory (AI Tools-specific)
          const toolCategoryFilter = filters.toolCategory;
          if (toolCategoryFilter) {
            const toolCategories = Array.isArray(toolCategoryFilter) ? toolCategoryFilter : [toolCategoryFilter];
            if (toolCategories.length > 0) {
              filtered = filtered.filter(item => {
                const itemToolCategory = item.toolCategory || '';
                return toolCategories.some(filterCategory =>
                  itemToolCategory.toLowerCase().replace(/[\s_]/g, '') === filterCategory.toLowerCase().replace(/[\s_]/g, '')
                );
              });
            }
          }

          // Filter by deliveryMode
          const deliveryModeFilter = filters.deliveryMode;
          if (deliveryModeFilter) {
            const deliveryModes = Array.isArray(deliveryModeFilter) ? deliveryModeFilter : [deliveryModeFilter];
            if (deliveryModes.length > 0) {
              filtered = filtered.filter(item => {
                const itemMode = (item.deliveryMode || '').toLowerCase().trim();
                return deliveryModes.some(filterMode => {
                  const normalizedFilter = filterMode.toLowerCase().trim();
                  // Normalize variations: 'inperson', 'in person', 'in-person' all match
                  const normalizeMode = (mode: string) => {
                    // Remove spaces and hyphens for comparison
                    const cleaned = mode.replace(/[\s-]/g, '');
                    if (cleaned === 'inperson' || cleaned.includes('person')) {
                      return 'inperson';
                    }
                    return cleaned;
                  };
                  const normalizedItemMode = normalizeMode(itemMode);
                  const normalizedFilterMode = normalizeMode(normalizedFilter);
                  return normalizedItemMode === normalizedFilterMode;
                });
              });
            }
          }

          // Filter by provider
          const providerFilter = filters.provider;
          if (providerFilter) {
            const providers = Array.isArray(providerFilter) ? providerFilter : [providerFilter];
            if (providers.length > 0) {
              filtered = filtered.filter(item => {
                const itemProvider = (item.provider?.name || '').toLowerCase();
                return providers.some(filterProvider => {
                  const normalizedFilter = filterProvider.toLowerCase();
                  // Map filter IDs to provider names
                  const providerMap: Record<string, string[]> = {
                    'it_support': ['it support', 'itsupport'],
                    'hr': ['hr'],
                    'finance': ['finance'],
                    'admin': ['admin', 'administrative']
                  };
                  const possibleNames = providerMap[normalizedFilter] || [normalizedFilter];
                  return possibleNames.some(name => itemProvider === name || itemProvider.includes(name) || name.includes(itemProvider));
                });
              });
            }
          }

          // Filter by location
          const locationFilter = filters.location;
          if (locationFilter) {
            const locations = Array.isArray(locationFilter) ? locationFilter : [locationFilter];
            if (locations.length > 0) {
              const normalizeLocation = (loc: string) => {
                const map: Record<string, string> = {
                  'dubai': 'Dubai',
                  'nairobi': 'Nairobi',
                  'riyadh': 'Riyadh'
                };
                return map[loc.toLowerCase()] || loc;
              };
              filtered = filtered.filter(item => {
                const itemLocation = item.location || '';
                return locations.some(filterLocation => {
                  const normalizedFilter = normalizeLocation(filterLocation);
                  // Match exact or case-insensitive partial match
                  return itemLocation === normalizedFilter ||
                    itemLocation.toLowerCase().includes(normalizedFilter.toLowerCase()) ||
                    normalizedFilter.toLowerCase().includes(itemLocation.toLowerCase());
                });
              });
            }
          }

          // Apply search query
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item => {
              const searchableText = [
                item.title,
                item.description,
                item.category,
                item.serviceType,
                item.deliveryMode,
                item.provider?.name,
                ...(item.tags || [])
              ].filter(Boolean).join(' ').toLowerCase();
              return searchableText.includes(query);
            });
          }
        } else {
          // For other marketplaces, apply search query if provided
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item => {
              const searchableText = [
                item.title,
                item.description,
                item.category,
                item.provider?.name,
                ...(item.tags || [])
              ].filter(Boolean).join(' ').toLowerCase();
              return searchableText.includes(query);
            });
          }
        }

        setFilteredItems(filtered);
        setTotalCount(filtered.length);
      } catch (err) {
        console.error(`Error fetching ${marketplaceType} items:`, err);
        setError(`Failed to load ${marketplaceType}`);
        const fallbackItems = getFallbackItems(marketplaceType);
        setItems(fallbackItems);

        // Apply filters to fallback items for Services Center
        let filteredFallback = fallbackItems;
        if (isServicesCenter) {
          const tabCategoryMap: Record<string, string> = {
            'technology': 'Technology',
            'business': 'Employee Services',
            'digital_worker': 'Digital Worker',
            'prompt_library': 'Prompt Library',
            'ai_tools': 'AI Tools'
          };
          const activeTabCategory = tabCategoryMap[activeServiceTab];
          if (activeTabCategory) {
            filteredFallback = filteredFallback.filter(item => {
              const itemCategory = item.category || '';
              return itemCategory === activeTabCategory;
            });
          }
        }

        setFilteredItems(filteredFallback);
        setTotalCount(filteredFallback.length);
      } finally {
        setLoading(false);
      }
    };

    run();
    // Keep deps lean; no need to include functions like isGuides
  }, [marketplaceType, filters, searchQuery, queryParams, isCourses, isKnowledgeHub, isEvents, currentPage, pageSize, activeFilters, filterConfig, isServicesCenter, activeServiceTab, activeTab]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType: string, value: string) => {
    if (isCourses) {
      toggleFilter(filterType, value);
      return;
    }
    if (isGuides) {
      // Guides filters are handled via queryParams in GuidesFilters component
      return;
    }
    setFilters(prev => {
      const current = prev[filterType];
      if (Array.isArray(current)) {
        const exists = current.includes(value);
        const nextValues = exists ? current.filter(v => v !== value) : [...current, value];
        return { ...prev, [filterType]: Array.isArray(nextValues) ? nextValues.join(',') : nextValues };
      } else {
        return { ...prev, [filterType]: value === prev[filterType] ? '' : value };
      }
    });
  }, [isCourses, isGuides, marketplaceType, toggleFilter]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    if (isCourses) {
      const newParams = new URLSearchParams();
      setSearchParams(newParams, { replace: true });
      setSearchQuery('');
    } else if (isKnowledgeHub || isEvents) {
      setActiveFilters([]);
      setSearchQuery('');
    } else if (isGuides) {
      const newParams = new URLSearchParams();
      const qs = newParams.toString();
      window.history.replaceState(null, '', `${window.location.pathname}${qs ? '?' + qs : ''}`);
      setQueryParams(newParams);
      setSearchQuery('');
    } else {
      const empty: Record<string, string | string[]> = {};
      filterConfig.forEach(c => { empty[c.id] = ''; });
      setFilters(empty);
      setSearchQuery('');
    }
  }, [isCourses, isKnowledgeHub, isEvents, isGuides, marketplaceType, filterConfig, setSearchParams]);

  // Knowledge Hub filter handlers
  const handleKnowledgeHubFilterChange = useCallback((filter: string) => {
    setActiveFilters(prev => {
      if (prev.includes(filter)) {
        return prev.filter(f => f !== filter);
      } else {
        return [...prev, filter];
      }
    });
  }, []);

  const clearKnowledgeHubFilters = useCallback(() => {
    setActiveFilters([]);
  }, []);

  // Apply client-side filters to events (search is now handled server-side)
  useEffect(() => {
    if (!isEvents) return;

    let filtered = [...items];

    // Note: Search is now handled server-side in the Supabase query
    // Only apply client-side filters that can't be done server-side

    // Apply active filters that require client-side processing
    if (activeFilters.length > 0 && filterConfig.length > 0) {
      filtered = filtered.filter(item => {
        return activeFilters.every(filterName => {
          // Check if filter matches any item property
          const category = filterConfig.find(c =>
            c.options.some(opt => opt.name === filterName)
          );
          if (!category) return true;

          // Match based on category type
          // Note: Most filters are handled server-side, this is for filters that need client-side logic
          switch (category.id) {
            case 'delivery-mode':
              // Handle hybrid mode or multiple delivery modes (requires client-side logic)
              return item.location?.toLowerCase().includes(filterName.toLowerCase()) ||
                (filterName.toLowerCase() === 'online' && item.location?.toLowerCase().includes('online'));
            case 'duration-band':
              // Duration filtering is done client-side since it requires calculation
              return true; // This would need duration calculation logic
            case 'cost-type':
              // Price filter (if still needed)
              const price = item.price?.toLowerCase() || '';
              if (filterName === 'Free') return price.includes('free') || price === '0';
              if (filterName === 'Paid') return !price.includes('free') && price !== '0';
              return true;
            case 'business-stage':
              return item.businessStage === filterName;
            default:
              // Most filters (event-type, department, location) are handled server-side
              return true;
          }
        });
      });
    }

    setFilteredItems(filtered);
    setTotalCount(filtered.length);
  }, [isEvents, items, activeFilters, filterConfig]);

  // UI helpers
  const toggleFilters = useCallback(() => setShowFilters(prev => !prev), []);
  const toggleBookmark = useCallback((itemId: string) => {
    setBookmarkedItems(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
  }, []);
  const handleAddToComparison = useCallback((item: any) => {
    if (compareItems.length < 3 && !compareItems.some(c => c.id === item.id)) {
      setCompareItems(prev => [...prev, item]);
    }
  }, [compareItems]);
  const handleRemoveFromComparison = useCallback((itemId: string) => {
    setCompareItems(prev => prev.filter(item => item.id !== itemId));
  }, []);
  const retryFetch = useCallback(() => { setError(null); setLoading(true); }, []);
  const goToPage = useCallback((page: number) => {
    const clamped = Math.max(1, Math.min(page, totalPages));
    const next = new URLSearchParams(queryParams.toString());
    if (clamped <= 1) next.delete('page');
    else next.set('page', String(clamped));
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `${window.location.pathname}${next.toString() ? '?' + next.toString() : ''}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setQueryParams(new URLSearchParams(next.toString()));
  }, [queryParams, totalPages]);

  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 ${isGuides ? 'guidelines-theme' : ''}`}>
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <div className={`${isEvents ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : 'container mx-auto px-4'} py-8 flex-grow`}>
        {/* Breadcrumbs */}
        <nav className="flex mb-4 min-h-[24px]" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 inline-flex items-center text-sm md:text-base transition-colors"
                aria-label="Navigate to Home"
              >
                <HomeIcon size={16} className="mr-1" aria-hidden="true" />
                <span>Home</span>
              </Link>
            </li>
            {isEvents ? (() => {
              // Determine active tab based on pathname for Events marketplace
              const isPulseTab = location.pathname === '/marketplace/pulse' || location.pathname.startsWith('/marketplace/pulse/');
              const isEventsTab = location.pathname === '/marketplace/events' || location.pathname.startsWith('/marketplace/events/');
              const isDiscussionsTab = location.pathname === '/communities' || location.pathname.startsWith('/community/');

              // Determine current page label
              let currentPageLabel = 'Events';
              if (isPulseTab) {
                currentPageLabel = 'Pulse';
              } else if (isDiscussionsTab) {
                currentPageLabel = 'Discussions';
              }

              return (
                <>
                  <li>
                    <div className="flex items-center">
                      <ChevronRightIcon size={16} className="text-gray-400 mx-1 flex-shrink-0" aria-hidden="true" />
                      <Link
                        to="/communities"
                        className="text-gray-600 hover:text-gray-900 text-sm md:text-base font-medium transition-colors"
                        aria-label="Navigate to DQ Work Communities"
                      >
                        DQ Work Communities
                      </Link>
                    </div>
                  </li>
                  <li aria-current="page">
                    <div className="flex items-center min-w-[80px]">
                      <ChevronRightIcon size={16} className="text-gray-400 mx-1 flex-shrink-0" aria-hidden="true" />
                      <span className="text-gray-500 text-sm md:text-base font-medium whitespace-nowrap">{currentPageLabel}</span>
                    </div>
                  </li>
                </>
              );
            })() : (
              <>
                <li>
                  <div className="flex items-center">
                    <ChevronRightIcon size={16} className="text-gray-400 mx-1" aria-hidden="true" />
                    <span className="ml-1 text-gray-500 md:ml-2 text-sm md:text-base">Resources</span>
                  </div>
                </li>
                {isGuides && (
                  <li aria-current="page">
                    <div className="flex items-center">
                      <ChevronRightIcon size={16} className="text-gray-400 mx-1" aria-hidden="true" />
                      <span className="ml-1 text-gray-700 md:ml-2 text-sm md:text-base font-medium">Guidelines</span>
                    </div>
                  </li>
                )}
                {!isGuides && (
                  <li>
                    <div className="flex items-center">
                      <ChevronRightIcon size={16} className="text-gray-400" />
                      <Link to={config.route} className="ml-1 text-gray-500 hover:text-gray-700 md:ml-2">
                        {config.itemNamePlural}
                      </Link>
                    </div>
                  </li>
                )}
                {isServicesCenter && activeServiceTab && (
                  <li aria-current="page">
                    <div className="flex items-center">
                      <ChevronRightIcon size={16} className="text-gray-400" />
                      <span className="ml-1 text-gray-700 md:ml-2">
                        {activeServiceTab === 'technology' && 'Technology'}
                        {activeServiceTab === 'business' && 'Employee Services'}
                        {activeServiceTab === 'digital_worker' && 'Digital Worker'}
                        {activeServiceTab === 'prompt_library' && 'Prompt Library'}
                        {activeServiceTab === 'ai_tools' && 'AI Tools'}
                      </span>
                    </div>
                  </li>
                )}
              </>
            )}
          </ol >
        </nav >

        <h1 className="text-3xl font-bold text-gray-800 mb-2">{config.title}</h1>
        <p className="text-gray-600 mb-6">{config.description}</p>

        {/* Service Center Tab Description Section */}
        {isServicesCenter && (
          <div className="mb-6">
            <div className="mb-4 p-4 rounded-lg shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Current focus</p>
                  <p className="text-lg font-semibold text-gray-900 mb-1">
                    {activeServiceTab === 'technology' && 'Technology'}
                    {activeServiceTab === 'business' && 'Employee Services'}
                    {activeServiceTab === 'digital_worker' && 'Digital Worker'}
                    {activeServiceTab === 'prompt_library' && 'Prompt Library'}
                    {activeServiceTab === 'ai_tools' && 'AI Tools'}
                  </p>
                </div>
                <button className="px-3 py-1.5 rounded-full text-xs font-medium text-blue-700" style={{ backgroundColor: '#DBEAFE' }}>
                  Tab overview
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-1">
                {activeServiceTab === 'technology' && 'Access technology-related services including IT support, software requests, system access, and technical assistance.'}
                {activeServiceTab === 'business' && 'Explore employee services including HR support, finance services, administrative requests, and operational assistance.'}
                {activeServiceTab === 'digital_worker' && 'Discover digital worker services including automation solutions, AI agents requests, AI tools and usage guidelines'}
                {activeServiceTab === 'prompt_library' && "A curated collection of your team's best and previously used prompts to speed up workflows and boost productivity."}
                {activeServiceTab === 'ai_tools' && 'A centralized hub showcasing all AI tools and solutions used across the company.'}
              </p>
              <p className="text-xs text-gray-500">
                {activeServiceTab === 'technology' && 'Managed by DQ IT Support and Technical teams.'}
                {activeServiceTab === 'business' && 'Provided by DQ HR, Finance, and Administrative teams.'}
                {activeServiceTab === 'digital_worker' && 'Handled by DQ Automation Teams.'}
                {activeServiceTab === 'prompt_library' && 'Curated and maintained by DQ Digital Innovation Teams.'}
                {activeServiceTab === 'ai_tools' && 'Provided by DQ AI & Innovation Teams.'}
              </p>
            </div>
          </div>
        )}

        {/* Current Focus Section and Navigation Tabs - Only for Events */}
        {isEvents && (
          <>
            <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200 min-h-[140px]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-xs uppercase text-gray-500 font-medium mb-2">CURRENT FOCUS</div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Events</h2>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    Stay up to date with upcoming events, workshops, and team gatherings. Explore activities within DQ that encourage collaboration, growth, and innovation.
                  </p>
                </div>
                <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors whitespace-nowrap flex-shrink-0">
                  Tab overview
                </button>
              </div>
            </div>

            <div className="mb-6">
              <nav className="flex" aria-label="Tabs">
                <button
                  onClick={() => navigate('/communities')}
                  className={`py-4 px-4 text-sm transition-colors border-b ${location.pathname === '/communities' || location.pathname.startsWith('/community/')
                    ? 'border-blue-600 text-gray-900 font-medium'
                    : 'border-transparent text-gray-500 hover:text-gray-700 font-normal'
                    }`}
                >
                  Discussion
                </button>
                <button
                  onClick={() => navigate('/marketplace/pulse')}
                  className={`py-4 px-4 text-sm transition-colors border-b ${location.pathname === '/marketplace/pulse' || location.pathname.startsWith('/marketplace/pulse/')
                    ? 'border-blue-600 text-gray-900 font-medium'
                    : 'border-transparent text-gray-500 hover:text-gray-700 font-normal'
                    }`}
                >
                  Pulse
                </button>
                <button
                  onClick={() => navigate('/marketplace/events')}
                  className={`py-4 px-4 text-sm transition-colors border-b ${location.pathname === '/marketplace/events' || location.pathname.startsWith('/marketplace/events/')
                    ? 'border-blue-600 text-gray-900 font-medium'
                    : 'border-transparent text-gray-500 hover:text-gray-700 font-normal'
                    }`}
                >
                  Events
                </button>
              </nav>
            </div>
          </>
        )}

        {/* Service Center Tabs */}
        {isServicesCenter && (
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Service tabs">
              {[
                { id: 'technology', label: 'Technology' },
                { id: 'business', label: 'Employee Services' },
                { id: 'digital_worker', label: 'Digital Worker' },
                { id: 'prompt_library', label: 'Prompt Library' },
                { id: 'ai_tools', label: 'AI Tools' }
              ].map((tab) => {
                const isActive = activeServiceTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveServiceTab(tab.id);
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set('tab', tab.id);
                      setSearchParams(newParams, { replace: true });
                    }}
                    className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors focus:outline-none ${
                      isActive
                        ? 'border-blue-700'
                        : 'text-gray-700 border-transparent hover:text-gray-900 hover:border-gray-300'
                    }`}
                    style={isActive ? { color: '#030F35', borderColor: '#030F35' } : {}}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Guides Tabs Section */}
        {isGuides && (
          <>
            <div className="mb-6 border-b border-gray-200">
              <nav className="flex space-x-8" aria-label="Guides navigation">
                {/* Main tabs rendered as buttons */}
                {(['strategy', 'guidelines', '6xd', 'blueprints', 'testimonials', 'glossary', 'faqs'] as WorkGuideTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => handleGuidesTabChange(tab)}
                    className={`
                      py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none
                      ${
                        activeTab === tab
                          ? 'border-[var(--guidelines-primary)] text-[var(--guidelines-primary)]'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                    aria-current={activeTab === tab ? 'page' : undefined}
                  >
                    {TAB_LABELS[tab]}
                  </button>
                ))}
              </nav>
              {/* Tab Description - Integrated with tabs */}
              {activeTab && TAB_DESCRIPTIONS[activeTab] && (
                <div className="pt-2 pb-2 mt-3 border border-gray-200 rounded-lg bg-white p-3 shadow-sm">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {TAB_DESCRIPTIONS[activeTab].description}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Design System Tabs Section */}
        {isDesignSystem && (() => {
          const DESIGN_SYSTEM_TAB_LABELS: Record<DesignSystemTab, string> = {
            cids: 'CI.DS',
            vds: 'V.DS',
            cds: 'CDS'
          };

          const DESIGN_SYSTEM_TAB_DESCRIPTIONS: Record<DesignSystemTab, { description: string; author?: string }> = {
            cids: {
              description: 'Component Integration Design System - Reusable UI components, patterns, and integration guidelines for building consistent digital experiences.',
              author: 'Maintained by DQ Design & Engineering Teams'
            },
            vds: {
              description: 'Visual Design System - Design tokens, typography, color palettes, and visual guidelines for creating cohesive brand experiences.',
              author: 'Maintained by DQ Design Team'
            },
            cds: {
              description: 'Content Design System - Content patterns, writing guidelines, and messaging frameworks for clear and effective communication.',
              author: 'Maintained by DQ Content & Communications Teams'
            }
          };

          const handleDesignSystemTabChange = (tab: DesignSystemTab) => {
            setActiveDesignSystemTab(tab);
            const newParams = new URLSearchParams(searchParams);
            newParams.set('tab', tab);
            setSearchParams(newParams, { replace: false });
          };

          return (
            <>
              <div className="mb-6 border-b border-gray-200">
                <nav className="flex space-x-8" aria-label="Design System navigation">
                  {(['cids', 'vds', 'cds'] as DesignSystemTab[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => handleDesignSystemTabChange(tab)}
                      className={`
                        py-4 px-1 border-b-2 font-medium text-sm transition-colors
                        ${
                          activeDesignSystemTab === tab
                            ? 'border-[var(--guidelines-primary)] text-[var(--guidelines-primary)]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                      aria-current={activeDesignSystemTab === tab ? 'page' : undefined}
                    >
                      {DESIGN_SYSTEM_TAB_LABELS[tab]}
                    </button>
                  ))}
                </nav>
                {/* Tab Description - Integrated with tabs */}
                {activeDesignSystemTab && DESIGN_SYSTEM_TAB_DESCRIPTIONS[activeDesignSystemTab] && (
                  <div className="pt-4 pb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {DESIGN_SYSTEM_TAB_DESCRIPTIONS[activeDesignSystemTab].description}
                    </p>
                    {DESIGN_SYSTEM_TAB_DESCRIPTIONS[activeDesignSystemTab].author && (
                      <p className="text-xs text-gray-500 mt-2">
                        {DESIGN_SYSTEM_TAB_DESCRIPTIONS[activeDesignSystemTab].author}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          );
        })()}

        {/* Search + Sort - Show for all tabs including Glossary */}
        {!isDesignSystem && (
          <div className="mb-6 flex items-center gap-3">
            <div className="flex-1">
              <SearchBar
                searchQuery={isGuides ? (queryParams.get('q') || '') : searchQuery}
                setSearchQuery={(q: string) => {
                  if (isGuides) {
                    const next = new URLSearchParams(queryParams.toString());
                    next.delete('page');
                    if (q) next.set('q', q); else next.delete('q');
                    const qs = next.toString();
                    window.history.replaceState(null, '', `${window.location.pathname}${qs ? '?' + qs : ''}`);
                    setQueryParams(new URLSearchParams(next.toString()));
                  } else {
                    setSearchQuery(q);
                  }
                }}
                placeholder={
                  isEvents
                    ? "Search events by title, description, category, or location..."
                    : isGuides
                      ? "Search guides..."
                      : "Search..."
                }
              />
            </div>
          </div>
        )}

        <div className="flex flex-col xl:flex-row gap-6">
          {/* Mobile filter toggle */}
          <div className="xl:hidden sticky top-16 z-20 bg-gray-50 py-2 shadow-sm">
            <div className="flex justify-between items-center">
              <button
                onClick={toggleFilters}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-gray-700 w-full justify-center"
                aria-expanded={showFilters}
                aria-controls="filter-sidebar"
              >
                <FilterIcon size={18} />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              {(isCourses ? Object.values(urlBasedFilters).some(f => Array.isArray(f) && f.length > 0) :
                isKnowledgeHub || isEvents ? activeFilters.length > 0 :
                  isGuides ? false :
                    Object.values(filters).some(f => (Array.isArray(f) ? f.length > 0 : f !== ''))) && (
                  <button onClick={resetFilters} className="ml-2 text-blue-600 text-sm font-medium whitespace-nowrap px-3 py-2">
                    Reset
                  </button>
                )}
            </div>
          </div>

          {/* Filter sidebar - mobile/tablet */}
          <div
            className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-30 transition-opacity duration-300 xl:hidden ${showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={toggleFilters}
            aria-hidden={!showFilters}
          >
            <div
              id="filter-sidebar"
              className={`fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${showFilters ? 'translate-x-0' : '-translate-x-full'}`}
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
            >
              <div className="h-full overflow-y-auto">
                <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button onClick={toggleFilters} className="p-1 rounded-full hover:bg-gray-100" aria-label="Close filters">
                    <XIcon size={20} />
                  </button>
                </div>
                <div className="p-4">
                  {isGuides ? (
                    <GuidesFilters activeTab={activeTab} facets={facets} query={queryParams} onChange={(next) => { next.delete('page'); const qs = next.toString(); window.history.replaceState(null, '', `${window.location.pathname}${qs ? '?' + qs : ''}`); setQueryParams(new URLSearchParams(next.toString())); track('Guides.FilterChanged', { params: Object.fromEntries(next.entries()) }); }} />
                  ) : isKnowledgeHub || isEvents ? (
                    <div className="space-y-0">
                      {filterConfig.map(category => {
                        const isExpanded = expandedFilter === category.id;
                        return (
                          <div key={category.id} className="border-b border-gray-100">
                            <button
                              onClick={() => setExpandedFilter(isExpanded ? null : category.id)}
                              type="button"
                              aria-expanded={isExpanded}
                            >
                              <span>{category.title}</span>
                              <ChevronDown
                                size={16}
                                className={`text-gray-500 flex-shrink-0 transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-180' : ''
                                  }`}
                              />
                            </button>
                            <div
                              className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                }`}
                            >
                              <div className="pb-3 space-y-2">
                                {category.options.map(option => (
                                  <div key={option.id} className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id={`mobile-${category.id}-${option.id}`}
                                      checked={activeFilters.includes(option.name)}
                                      onChange={() => handleKnowledgeHubFilterChange(option.name)}
                                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label
                                      htmlFor={`mobile-${category.id}-${option.id}`}
                                      className="ml-2 text-sm text-gray-700 cursor-pointer"
                                    >
                                      {option.name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  ) : (
                    <FilterSidebar
                      filters={isCourses ? urlBasedFilters : (Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, Array.isArray(v) ? v : (v ? [v] : [])])) as Record<string, string[]>)}
                      filterConfig={filterConfig}
                      onFilterChange={handleFilterChange}
                      onResetFilters={resetFilters}
                      isResponsive={true}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Filter sidebar - desktop */}
          <div className="hidden xl:block xl:w-1/4">
            {isGuides ? (
              <GuidesFilters activeTab={activeTab} facets={facets} query={queryParams} onChange={(next) => { next.delete('page'); const qs = next.toString(); window.history.replaceState(null, '', `${window.location.pathname}${qs ? '?' + qs : ''}`); setQueryParams(new URLSearchParams(next.toString())); track('Guides.FilterChanged', { params: Object.fromEntries(next.entries()) }); }} />
            ) : (
              <div className="bg-white rounded-lg shadow p-4 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto filter-sidebar-scroll">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  {(isCourses ? Object.values(urlBasedFilters).some(f => Array.isArray(f) && f.length > 0) :
                    isKnowledgeHub || isEvents ? activeFilters.length > 0 :
                      Object.values(filters).some(f => (Array.isArray(f) ? f.length > 0 : f !== ''))) && (
                      <button onClick={resetFilters} className="text-blue-600 text-sm font-medium">Reset All</button>
                    )}
                </div>
                {isKnowledgeHub || isEvents ? (
                  <div className="space-y-0">
                    {filterConfig.map(category => {
                      const isExpanded = expandedFilter === category.id;
                      return (
                        <div key={category.id} className="border-b border-gray-100">
                          <button
                            className="flex w-full justify-between items-center text-left font-medium text-gray-900 py-3 hover:text-gray-700 transition-colors"
                            onClick={() => setExpandedFilter(isExpanded ? null : category.id)}
                            type="button"
                            aria-expanded={isExpanded}
                          >
                            <span>{category.title}</span>
                            <ChevronDown
                              size={16}
                              className={`text-gray-500 flex-shrink-0 transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-180' : ''
                                }`}
                            />
                          </button>
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                              }`}
                          >
                            <div className="pb-3 space-y-2">
                              {category.options.map(option => (
                                <div key={option.id} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`desktop-${category.id}-${option.id}`}
                                    checked={activeFilters.includes(option.name)}
                                    onChange={() => handleKnowledgeHubFilterChange(option.name)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <label
                                    htmlFor={`desktop-${category.id}-${option.id}`}
                                    className="ml-2 text-sm text-gray-700 cursor-pointer"
                                  >
                                    {option.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <FilterSidebar
                    filters={isCourses ? urlBasedFilters : (Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, Array.isArray(v) ? v : (v ? [v] : [])])) as Record<string, string[]>)}
                    filterConfig={filterConfig}
                    onFilterChange={handleFilterChange}
                    onResetFilters={resetFilters}
                    isResponsive={false}
                  />
                )}
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="xl:w-3/4">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {[...Array(6)].map((_, idx) => <CourseCardSkeleton key={idx} />)}
              </div>
            ) : error && !isGuides && !isKnowledgeHub && !isEvents ? (
              <ErrorDisplay message={error} onRetry={retryFetch} />
            ) : isKnowledgeHub ? (
              <KnowledgeHubGrid
                bookmarkedItems={bookmarkedItems}
                onToggleBookmark={toggleBookmark}
                onAddToComparison={handleAddToComparison}
                searchQuery={searchQuery}
                activeFilters={activeFilters}
                onFilterChange={handleKnowledgeHubFilterChange}
                onClearFilters={clearKnowledgeHubFilters}
              />
            ) : isGuides ? (
              <>
                {activeTab === 'faqs' ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="bg-gray-100 rounded-lg p-12 text-center max-w-md">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Coming Soon</h3>
                      <p className="text-gray-500">FAQs content is currently being prepared and will be available soon.</p>
                    </div>
                  </div>
                ) : activeTab === '6xd' ? (
                  <SixXDComingSoonCards />
                ) : activeTab === 'glossary' ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="bg-gray-100 rounded-lg p-12 text-center max-w-md">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Coming Soon</h3>
                      <p className="text-gray-500">Glossary content is currently being prepared and will be available soon.</p>
                    </div>
                  </div>
                ) : activeTab === 'testimonials' ? (
                  <TestimonialsGrid
                    items={filteredItems}
                    onClickGuide={(g) => {
                      const qs = queryParams.toString();
                      navigate(`/marketplace/guides/${encodeURIComponent(g.slug || g.id)}`, {
                        state: { fromQuery: qs, activeTab }
                      });
                    }}
                  />
                ) : (
                  <>
                    <GuidesGrid
                      items={filteredItems}
                      hideEmptyState={false}
                      onClickGuide={(g) => {
                        const qs = queryParams.toString();
                        navigate(`/marketplace/guides/${encodeURIComponent(g.slug || g.id)}`, {
                          state: { fromQuery: qs, activeTab }
                        });
                      }}
                    />
                    {totalPages > 1 && (
                      <div className="mt-6 flex items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-4 py-2 rounded border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-gray-600">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          type="button"
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage >= totalPages}
                          className="px-4 py-2 rounded border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <MarketplaceGrid
                items={isCourses ? searchFilteredItems.map(course => {
                  const allowedSet = new Set<string>(LOCATION_ALLOW as readonly string[]);
                  const safeLocations = (course.locations || []).filter(loc => allowedSet.has(loc));
                  return {
                    ...course,
                    locations: safeLocations.length ? safeLocations : ['Global'],
                    provider: { name: course.provider, logoUrl: '/DWS-Logo.png' },
                    description: course.summary
                  };
                }) : filteredItems}
                marketplaceType={marketplaceType}
                bookmarkedItems={bookmarkedItems}
                onToggleBookmark={toggleBookmark}
                onAddToComparison={handleAddToComparison}
                promoCards={promoCards}
                activeServiceTab={activeServiceTab}
              />
            )}
          </div>
        </div>

        {/* Comparison modal */}
        {
          showComparison && (
            <MarketplaceComparison
              items={compareItems}
              onClose={() => setShowComparison(false)}
              onRemoveItem={handleRemoveFromComparison}
              marketplaceType={marketplaceType}
            />
          )
        }
      </div>
      <Footer isLoggedIn={false} />
    </div >
  );
};

export default MarketplacePage;
