import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FilterSidebar, FilterConfig } from './FilterSidebar.js';
import { MarketplaceGrid } from './MarketplaceGrid.js';
import type { MarketplaceItem, PromoCardData as PromoCardDataImport } from './MarketplaceGrid.js';
import { SearchBar } from '../SearchBar.js';
import { FilterIcon, XIcon, HomeIcon, ChevronRightIcon } from 'lucide-react';
import { ErrorDisplay, CourseCardSkeleton } from '../SkeletonLoader.js';
import { fetchMarketplaceItems, fetchMarketplaceFilters } from '../../services/marketplace.js';
import { getMarketplaceConfig, getTabSpecificFilters } from '../../utils/marketplaceConfig.js';
import { MarketplaceComparison } from './MarketplaceComparison.js';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { getFallbackItems } from '../../utils/fallbackData';
import KnowledgeHubGrid from './KnowledgeHubGrid';
import { LMS_COURSES } from '@/data/lmsCourseDetails';
import { parseFacets, applyFilters } from '@/lms/filters';
import {
  LOCATION_ALLOW,
  LEVELS,
  CATEGORY_OPTS,
  DELIVERY_OPTS,
  DURATION_OPTS
} from '@/lms/config';
import GuidesFilters, { GuidesFacets } from '../guides/GuidesFilters';
import GuidesGrid from '../guides/GuidesGrid';
import TestimonialsGrid from '../guides/TestimonialsGrid';
import GlossaryGrid from '../guides/GlossaryGrid';
import { supabaseClient } from '../../lib/supabaseClient';
import { track } from '../../utils/analytics';
import FAQsPageContent from '@/pages/guides/FAQsPageContent.tsx';
import { glossaryTerms, GlossaryTerm } from '@/pages/guides/glossaryData.ts';

const normalizeString = (value: string, pattern: RegExp) =>
  value.toLowerCase().replaceAll(pattern, ''); // pattern is expected to be global

const toStringArray = (
  input: string | string[] | null | undefined,
): string[] => {
  if (input == null) return [];
  if (Array.isArray(input)) return input;
  return [input];
};

const hasNormalizedOverlap = (
  items: string[],
  filters: string[],
  pattern: RegExp,
): boolean => {
  if (!filters.length) return true;
  const normalizedFilters = new Set(filters.map((f) => normalizeString(f, pattern)));
  return items.some((item) => normalizedFilters.has(normalizeString(item, pattern)));
};

const normalizeDeliveryMode = (mode: string) => {
  const cleaned = normalizeString(mode, /[\s-]/g);
  return cleaned.includes('person') ? 'inperson' : cleaned;
};

const filterByActiveTabCategory = (items: MarketplaceItem[], activeServiceTab: string) => {
  const tabCategoryMap: Record<string, string> = {
    technology: 'Technology',
    business: 'Employee Services',
    digital_worker: 'Digital Worker',
    prompt_library: 'Prompt Library',
    ai_tools: 'AI Tools',
  };
  const activeTabCategory = tabCategoryMap[activeServiceTab];
  if (!activeTabCategory) return items;
  return items.filter((item) => (item.category || '') === activeTabCategory);
};

const filterBySearch = (
  items: MarketplaceItem[],
  query: string,
  fields: Array<(item: MarketplaceItem) => string | string[] | undefined>,
) => {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter((item) => {
    const text = fields
      .map((fn) => fn(item))
      .flatMap((val) => toStringArray(val))
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return text.includes(q);
  });
};

const applyServiceCenterFilters = (
  items: MarketplaceItem[],
  filters: Record<string, string | string[]>,
  activeServiceTab: string,
  searchQuery: string,
) => {
  let filtered = filterByActiveTabCategory(items, activeServiceTab);

  const serviceTypes = toStringArray(filters.serviceType);
  if (serviceTypes.length) {
    const normalizedFilters = new Set(serviceTypes.map((t) => normalizeString(t, /[\s-]/g)));
    filtered = filtered.filter((item) =>
      normalizedFilters.has(normalizeString((item.serviceType || '').toLowerCase(), /[\s-]/g)),
    );
  }

  const userCategories = toStringArray(filters.userCategory);
  if (userCategories.length) {
    filtered = filtered.filter((item) =>
      toStringArray(item.userCategory).some((cat) => userCategories.includes((cat || '').toLowerCase())),
    );
  }

  const technicalCategories = toStringArray(filters.technicalCategory);
  if (technicalCategories.length) {
    filtered = filtered.filter((item) =>
      toStringArray(item.technicalCategory).some((cat) => technicalCategories.includes((cat || '').toLowerCase())),
    );
  }

  const deviceOwnerships = toStringArray(filters.deviceOwnership);
  if (deviceOwnerships.length) {
    filtered = filtered.filter((item) => hasNormalizedMatch(item.deviceOwnership, deviceOwnerships, /[\s-]/g));
  }

  const services = toStringArray(filters.services);
  if (services.length) {
    filtered = filtered.filter((item) => hasNormalizedMatch(item.services, services, /[\s_]/g));
  }

  const documentTypes = toStringArray(filters.documentType);
  if (documentTypes.length) {
    filtered = filtered.filter((item) =>
      toStringArray(item.documentType).some((doc) => documentTypes.includes((doc || '').toLowerCase())),
    );
  }

  const serviceDomains = toStringArray(filters.serviceDomains);
  if (serviceDomains.length) {
    filtered = filtered.filter((item) => hasNormalizedMatch(item.serviceDomains, serviceDomains, /[\s_&]/g));
  }

  const aiMaturityLevels = toStringArray(filters.aiMaturityLevel);
  if (aiMaturityLevels.length) {
    filtered = filtered.filter((item) => hasNormalizedMatch(item.aiMaturityLevel, aiMaturityLevels, /[\s_()]/g));
  }

  const toolCategories = toStringArray(filters.toolCategory);
  if (toolCategories.length) {
    filtered = filtered.filter((item) => hasNormalizedMatch(item.toolCategory, toolCategories, /[\s_]/g));
  }

  const deliveryModes = toStringArray(filters.deliveryMode);
  if (deliveryModes.length) {
    filtered = filtered.filter((item) => {
      const normalizedItemMode = normalizeDeliveryMode((item.deliveryMode || '').toLowerCase().trim());
      return deliveryModes.some(
        (filterMode) => normalizeDeliveryMode(filterMode.toLowerCase().trim()) === normalizedItemMode,
      );
    });
  }

  const providers = toStringArray(filters.provider);
  if (providers.length) {
    const providerMap: Record<string, string[]> = {
      it_support: ['it support', 'itsupport'],
      hr: ['hr'],
      finance: ['finance'],
      admin: ['admin', 'administrative'],
    };
    filtered = filtered.filter((item) => {
      const itemProvider = (item.provider?.name || '').toLowerCase();
      return providers.some((filterProvider) => {
        const normalizedFilter = filterProvider.toLowerCase();
        const possibleNames = providerMap[normalizedFilter] || [normalizedFilter];
        return possibleNames.some(
          (name) => itemProvider === name || itemProvider.includes(name) || name.includes(itemProvider),
        );
      });
    });
  }

  const locations = toStringArray(filters.location);
  if (locations.length) {
    const normalizeLocation = (loc: string) => {
      const map: Record<string, string> = { dubai: 'Dubai', nairobi: 'Nairobi', riyadh: 'Riyadh' };
      return map[loc.toLowerCase()] || loc;
    };
    filtered = filtered.filter((item) => {
      const itemLocation = item.location || '';
      return locations.some((filterLocation) => {
        const normalizedFilter = normalizeLocation(filterLocation);
        return (
          itemLocation === normalizedFilter ||
          itemLocation.toLowerCase().includes(normalizedFilter.toLowerCase()) ||
          normalizedFilter.toLowerCase().includes(itemLocation.toLowerCase())
        );
      });
    });
  }

  filtered = filterBySearch(filtered, searchQuery, [
    (it) => it.title,
    (it) => it.description,
    (it) => it.category,
    (it) => it.serviceType,
    (it) => it.deliveryMode,
    (it) => it.provider?.name,
    (it) => it.tags,
  ]);

  return filtered;
};
const hasNormalizedMatch = (
  values: string | string[] | null | undefined,
  filters: string[],
  pattern: RegExp,
) => {
  const valueArr = toStringArray(values);
  if (!filters.length || !valueArr.length) return false;
  const normalizedFilters = new Set(filters.map((f) => normalizeString(f, pattern)));
  return valueArr.some((v) => normalizedFilters.has(normalizeString(v, pattern)));
};
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
    .replaceAll(/[^a-z0-9]+/g, '-')
    // Group regex parts: (start with hyphens) OR (end with hyphens)
    .replaceAll(/(^-+)|(-+$)/g, '');

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

type ComparisonItem = Pick<MarketplaceItem, 'id' | 'title'>;

// Use the imported type from MarketplaceGrid
type PromoCardData = PromoCardDataImport;

interface GuideResult {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  hero_image_url?: string | null;
  heroImageUrl?: string | null;
  estimated_time_min?: number | null;
  estimatedTimeMin?: number | null;
  last_updated_at?: string | null;
  lastUpdatedAt?: string | null;
  author_name?: string | null;
  author_org?: string | null;
  is_editors_pick?: boolean | null;
  download_count?: number | null;
  guide_type?: string | null;
  guideType?: string | null;
  domain?: string | null;
  function_area?: string | null;
  unit?: string | null;
  sub_domain?: string | null;
  subDomain?: string | null;
  location?: string | null;
  status?: string | null;
  complexity_level?: string | null;
}

export interface MarketplacePageProps {
  marketplaceType: 'courses' | 'financial' | 'non-financial' | 'knowledge-hub' | 'onboarding' | 'guides';
  title: string;
  description: string;
  promoCards?: PromoCardData[];
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

type WorkGuideTab = 'guidelines' | 'strategy' | 'blueprints' | 'testimonials' | 'glossary' | 'faqs';

const TAB_LABELS: Record<WorkGuideTab, string> = {
  strategy: 'Strategy',
  guidelines: 'Guidelines',
  blueprints: 'Blueprints',
  testimonials: 'Testimonials',
  glossary: 'Glossary',
  faqs: 'FAQs'
};

const TAB_DESCRIPTIONS: Record<WorkGuideTab, { description: string; author?: string }> = {
  strategy: {
    description: 'Strategic frameworks, transformation journeys, and organizational initiatives that guide decision-making and long-term planning across Digital Qatalyst.',
    author: 'Authored by DQ Leadership and Strategy Teams'
  },
  guidelines: {
    description: 'Practical guidelines, best practices, and operational procedures that support everyday delivery, collaboration, and excellence across all teams and units.',
    author: 'Authored by DQ Associates, Leads, and Subject Matter Experts'
  },
  blueprints: {
    description: 'Standardized blueprints, templates, and proven methodologies that enable consistent execution, reduce rework, and accelerate delivery across projects and initiatives.',
    author: 'Authored by DQ Delivery Teams and Practice Leads'
  },
  testimonials: {
    description: 'Success stories, case studies, and reflections that capture lessons learned, celebrate achievements, and share insights from real-world experiences and transformations.',
    author: 'Authored by DQ Teams, Clients, and Partners'
  },
  glossary: {
    description: 'Comprehensive dictionary of DQ terminology, acronyms, and key concepts to help you understand our language and processes.',
    author: 'Maintained by DQ Knowledge Management Team'
  },
  faqs: {
    description: 'Frequently asked questions about DQ processes, tools, workflows, and best practices with detailed answers and guidance.',
    author: 'Maintained by DQ Knowledge Management Team'
  }
};

const INCOMPATIBLE_FILTERS_BY_TAB: Record<WorkGuideTab, string[]> = {
  strategy: ['guide_type', 'sub_domain', 'domain', 'testimonial_category'],
  blueprints: ['guide_type', 'sub_domain', 'domain', 'testimonial_category', 'strategy_type', 'strategy_framework', 'guidelines_category', 'blueprint_sector'],
  testimonials: ['guide_type', 'sub_domain', 'domain', 'strategy_type', 'strategy_framework', 'guidelines_category', 'blueprint_framework', 'blueprint_sector'],
  glossary: ['guide_type', 'sub_domain', 'unit', 'domain', 'strategy_type', 'strategy_framework', 'guidelines_category', 'blueprint_framework', 'blueprint_sector', 'testimonial_category'],
  faqs: ['guide_type', 'sub_domain', 'unit', 'domain', 'strategy_type', 'strategy_framework', 'guidelines_category', 'blueprint_framework', 'blueprint_sector', 'testimonial_category'],
  guidelines: ['strategy_type', 'strategy_framework', 'blueprint_framework', 'blueprint_sector'],
};

const syncUrlParams = (params: URLSearchParams) => {
  if (globalThis.window === undefined) return;
  const qs = params.toString();
  globalThis.window.history.replaceState(null, '', `${globalThis.window.location.pathname}${qs ? '?' + qs : ''}`);
};

const buildGuidesTabParams = (tab: WorkGuideTab, queryParams: URLSearchParams) => {
  const next = new URLSearchParams(queryParams.toString());
  next.delete('page');
  if (tab === 'guidelines') next.delete('tab');
  else next.set('tab', tab);

  (INCOMPATIBLE_FILTERS_BY_TAB[tab] || []).forEach((key) => next.delete(key));

  if (tab !== 'guidelines') next.delete('guidelines_category');
  if (tab !== 'blueprints') next.delete('blueprint_framework');

  return next;
};

const cleanFiltersForActiveTab = (tab: WorkGuideTab, queryParams: URLSearchParams) => {
  const next = new URLSearchParams(queryParams.toString());
  let changed = false;

  (INCOMPATIBLE_FILTERS_BY_TAB[tab] || []).forEach((key) => {
    if (next.has(key)) {
      next.delete(key);
      changed = true;
    }
  });

  if (tab !== 'guidelines' && next.has('guidelines_category')) {
    next.delete('guidelines_category');
    changed = true;
  }
  if (tab !== 'blueprints' && next.has('blueprint_framework')) {
    next.delete('blueprint_framework');
    changed = true;
  }

  return { next, changed };
};

const computeFilteredGlossaryTerms = (queryParams: URLSearchParams, terms: GlossaryTerm[]) => {
  const knowledgeSystems = parseFilterValues(queryParams, 'glossary_knowledge_system');
  const ghcDimensions = parseFilterValues(queryParams, 'glossary_ghc_dimension');
  const ghcTermTypes = parseFilterValues(queryParams, 'glossary_ghc_term_type');
  const sixXdDimensions = parseFilterValues(queryParams, 'glossary_6xd_dimension');
  const sixXdTermTypes = parseFilterValues(queryParams, 'glossary_6xd_term_type');
  const termOrigins = parseFilterValues(queryParams, 'glossary_term_origin');
  const usedIn = parseFilterValues(queryParams, 'glossary_used_in');
  const whoUsesIt = parseFilterValues(queryParams, 'glossary_who_uses_it');
  const letters = parseFilterValues(queryParams, 'glossary_letter').map((l) => l.toUpperCase());
  const searchLower = (queryParams.get('q') || '').toLowerCase();

  const matchesKnowledgeSystem = (term: GlossaryTerm) =>
    !knowledgeSystems.length || (term.knowledgeSystem && knowledgeSystems.includes(term.knowledgeSystem));

  const matchesGhc = (term: GlossaryTerm) =>
    term.knowledgeSystem !== 'ghc' ||
    (hasNormalizedOverlap([term.ghcDimension || ''], ghcDimensions, /\s/g) &&
      hasNormalizedOverlap([term.ghcTermType || ''], ghcTermTypes, /\s/g));

  const matchesSixXd = (term: GlossaryTerm) =>
    term.knowledgeSystem !== '6xd' ||
    (hasNormalizedOverlap([term.sixXdDimension || ''], sixXdDimensions, /\s/g) &&
      hasNormalizedOverlap([term.sixXdTermType || ''], sixXdTermTypes, /\s/g));

  const matchesOrigin = (term: GlossaryTerm) =>
    !termOrigins.length || (term.termOrigin && termOrigins.includes(term.termOrigin));

  const matchesUsage = (term: GlossaryTerm) =>
    hasNormalizedOverlap(term.usedIn || [], usedIn, /\s/g) &&
    hasNormalizedOverlap(term.whoUsesIt || [], whoUsesIt, /\s/g);

  const matchesLetter = (term: GlossaryTerm) =>
    !letters.length || letters.includes(term.letter.toUpperCase());

  const matchesSearch = (term: GlossaryTerm) => {
    if (!searchLower) return true;
    return (
      term.term.toLowerCase().includes(searchLower) ||
      (term.shortIntro?.toLowerCase().includes(searchLower)) ||
      term.explanation.toLowerCase().includes(searchLower) ||
      term.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  };

  return terms.filter(
    (term) =>
      matchesKnowledgeSystem(term) &&
      matchesGhc(term) &&
      matchesSixXd(term) &&
      matchesOrigin(term) &&
      matchesUsage(term) &&
      matchesLetter(term) &&
      matchesSearch(term),
  );
};

// NOSONAR: Cognitive complexity acceptable for main component
export const MarketplacePage: React.FC<MarketplacePageProps> = ({ // NOSONAR typescript:S3776
  marketplaceType,
  promoCards = []
}) => {
  const isGuides = marketplaceType === 'guides';
  const isCourses = marketplaceType === 'courses';
  const isKnowledgeHub = marketplaceType === 'knowledge-hub';
  const isServicesCenter = marketplaceType === 'non-financial';
  
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const config = getMarketplaceConfig(marketplaceType);
  
  // Service Center tabs - sync with URL params
  const getServiceTabFromParams = useCallback((params: URLSearchParams): string => {
    const tab = params.get('tab');
    const validTabs = ['technology', 'business', 'digital_worker', 'prompt_library', 'ai_tools'];
    return tab && validTabs.includes(tab) ? tab : 'technology';
  }, []);
  const [activeServiceTab, setActiveServiceTab] = useState<string>(() => {
    if (isServicesCenter) {
      const params = globalThis.window 
        ? new URLSearchParams(globalThis.window.location.search)
        : new URLSearchParams();
      return getServiceTabFromParams(params);
    }
    return 'technology';
  });
  
  // Sync activeServiceTab with URL params
  useEffect(() => {
    if (isServicesCenter) {
      const currentTab = searchParams.get('tab');
      const validTabs = new Set(['technology', 'business', 'digital_worker', 'prompt_library', 'ai_tools']);
      if (currentTab && validTabs.has(currentTab) && currentTab !== activeServiceTab) {
        setActiveServiceTab(currentTab);
      } else if (!currentTab || !validTabs.has(currentTab)) {
        // Set default tab in URL if not present
        const newParams = new URLSearchParams(searchParams);
        newParams.set('tab', activeServiceTab);
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [isServicesCenter, searchParams, activeServiceTab, setSearchParams]);

  // Items & filters state (stored in ref because value is not read in render)
  const itemsRef = useRef<MarketplaceItem[]>([]);
  const setItems = (value: MarketplaceItem[]) => { itemsRef.current = value; };
  const [filteredItems, setFilteredItems] = useState<MarketplaceItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string | string[]>>({});
  const [filterConfig, setFilterConfig] = useState<FilterConfig[]>([]);
  const filterSignature = useMemo(() => JSON.stringify(filters), [filters]);

  // Guides facets + URL state
  const [facets, setFacets] = useState<GuidesFacets>({});
  const [queryParams, setQueryParams] = useState(() => {
    if (globalThis.window !== undefined) {
      return new URLSearchParams(globalThis.window.location.search);
    }
    return new URLSearchParams('');
  });
  const searchStartRef = useRef<number | null>(null);
  const getTabFromParams = useCallback((params: URLSearchParams): WorkGuideTab => {
    const tab = params.get('tab');
    return tab === 'strategy' || tab === 'blueprints' || tab === 'testimonials' || tab === 'glossary' || tab === 'faqs' ? tab : 'guidelines';
  }, []);
  const [activeTab, setActiveTab] = useState<WorkGuideTab>(() => {
    if (globalThis.window !== undefined) {
      return getTabFromParams(new URLSearchParams(globalThis.window.location.search));
    }
    return getTabFromParams(new URLSearchParams());
  });

  useEffect(() => {
    if (!isGuides) return;
    setActiveTab(getTabFromParams(queryParams));
  }, [isGuides, queryParams, getTabFromParams]);

  const handleGuidesTabChange = useCallback((tab: WorkGuideTab) => {
    setActiveTab(tab);
    const next = buildGuidesTabParams(tab, queryParams);
    syncUrlParams(next);
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
    const { next, changed } = cleanFiltersForActiveTab(activeTab, queryParams);
    if (!changed) return;
    syncUrlParams(next);
    setQueryParams(new URLSearchParams(next.toString()));
  }, [isGuides, activeTab, queryParams]);

  const pageSize = Math.min(200, Math.max(1, Number.parseInt(queryParams.get('pageSize') || String(DEFAULT_GUIDE_PAGE_SIZE), 10)));
  const currentPage = Math.max(1, Number.parseInt(queryParams.get('page') || '1', 10));
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
    if (!isGuides || activeTab !== 'glossary') return [];
    return computeFilteredGlossaryTerms(queryParams, glossaryTerms);
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
  }, [marketplaceType, config, isCourses, isGuides, isKnowledgeHub, isServicesCenter, activeServiceTab, filterSignature, filters, filterConfig.length]);
  
  // Fetch items based on marketplace type
  useEffect(() => {
    const run = async () => { // NOSONAR: complex but intentional; refactor planned separately
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
        const fallbackItems = getFallbackItems<MarketplaceItem>(marketplaceType);
        setItems(fallbackItems);
        setFilteredItems(fallbackItems);
        setTotalCount(fallbackItems.length);
        setLoading(false);
        return;
      }

      // GUIDES: Supabase query + facets (skip for glossary and faqs tabs)
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
          const domains     = parseFilterValues(queryParams, 'domain');
          const rawSubs     = parseFilterValues(queryParams, 'sub_domain');
          const guideTypes  = parseFilterValues(queryParams, 'guide_type');
          const units       = parseFilterValues(queryParams, 'unit');
          const locations   = parseFilterValues(queryParams, 'location');
          const statuses    = parseFilterValues(queryParams, 'status');
          const testimonialCategories = parseFilterValues(queryParams, 'testimonial_category');
          const strategyTypes = parseFilterValues(queryParams, 'strategy_type');
          const strategyFrameworks = parseFilterValues(queryParams, 'strategy_framework');
          const guidelinesCategories = parseFilterValues(queryParams, 'guidelines_category');
          const blueprintFrameworks = parseFilterValues(queryParams, 'blueprint_framework');
          const blueprintSectors = parseFilterValues(queryParams, 'blueprint_sector');

          // Get activeTab from state - ensure it's current
          const currentActiveTab = activeTab;
          const isStrategyTab = currentActiveTab === 'strategy';
          const isBlueprintTab = currentActiveTab === 'blueprints';
          const isTestimonialsTab = currentActiveTab === 'testimonials';
          const isGlossaryTab = currentActiveTab === ('glossary' as WorkGuideTab);
          const isFAQsTab = currentActiveTab === ('faqs' as WorkGuideTab);
          const isGuidelinesTab = currentActiveTab === 'guidelines';
          const isSpecialTab = isStrategyTab || isBlueprintTab || isTestimonialsTab || isGlossaryTab || isFAQsTab;

          const allowed = new Set<string>();
          if (!isSpecialTab) {
            domains.forEach(d => (SUBDOMAIN_BY_DOMAIN[d] || []).forEach(s => allowed.add(s))); // NOSONAR: nested callbacks intentional
          }
          let subDomains: string[] = [];
          if (!isSpecialTab) {
            if (allowed.size) {
              subDomains = rawSubs.filter(v => allowed.has(v));
            } else {
              subDomains = rawSubs;
            }
          }

          const effectiveGuideTypes = isSpecialTab ? [] : guideTypes;
          // Enable unit filtering for all tabs (Strategy, Blueprints, and Guidelines)
          const effectiveUnits = (isStrategyTab || isBlueprintTab || !isSpecialTab) ? units : [];

          if (!isSpecialTab && rawSubs.length && subDomains.length !== rawSubs.length) {
            const next = new URLSearchParams(queryParams.toString());
            if (subDomains.length) next.set('sub_domain', subDomains.join(','));
            else next.delete('sub_domain');
            if (globalThis.window !== undefined) {
              globalThis.window.history.replaceState(null, '', `${globalThis.window.location.pathname}${next.toString() ? '?' + next.toString() : ''}`);
            }
            setQueryParams(new URLSearchParams(next.toString()));
            setLoading(false);
            return;
          }

          if (statuses.length) q = q.in('status', statuses); else q = q.eq('status', 'Approved');
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
          if (sort === 'updated')       q = q.order('last_updated_at', { ascending: false, nullsFirst: false });
          else if (sort === 'downloads')q = q.order('download_count',   { ascending: false, nullsFirst: false });
          else if (sort === 'editorsPick') {
            q = q.order('is_editors_pick', { ascending: false })
                .order('last_updated_at', { ascending: false, nullsFirst: false });
          } else {
            q = q.order('is_editors_pick', { ascending: false })
                .order('download_count',   { ascending: false, nullsFirst: false })
                .order('last_updated_at',  { ascending: false, nullsFirst: false });
          }

          // If unit filtering or framework filtering is needed client-side, fetch ALL results first, then filter and paginate
          // Otherwise, use server-side pagination
          const needsClientSideUnitFilter = effectiveUnits.length > 0;
          const needsClientSideFrameworkFilter = (isStrategyTab && strategyFrameworks.length > 0) || 
                                                 (isBlueprintTab && (blueprintFrameworks.length > 0 || blueprintSectors.length > 0)) ||
                                                 (isGuidelinesTab && guidelinesCategories.length > 0);
          const needsClientSideFiltering = needsClientSideUnitFilter || needsClientSideFrameworkFilter;
          
          const from = (currentPage - 1) * pageSize;
          const to   = from + pageSize - 1;

          // Fetch all results if client-side filtering is needed, otherwise use pagination
          // When fetching all, we need to set a high limit (Supabase default is 1000)
          const listPromise = needsClientSideFiltering ? q.limit(10000) : q.range(from, to);
          
          // Exclude removed guidelines from facets
          let facetQ = supabaseClient
            .from('guides')
            .select('domain,sub_domain,guide_type,function_area,unit,location,status')
            .eq('status', 'Approved');
          excludedSlugs.forEach(slug => {
            facetQ = facetQ.neq('slug', slug);
          });

          // Facets should show ALL available options for the current tab, not filtered by selected filters
          // This ensures filter options don't disappear when other filters are selected
          if (qStr)              facetQ = facetQ.or(`title.ilike.%${qStr}%,summary.ilike.%${qStr}%`);
          if (isStrategyTab)    facetQ = facetQ.or('domain.ilike.%Strategy%,guide_type.ilike.%Strategy%');
          else if (isBlueprintTab) facetQ = facetQ.or('domain.ilike.%Blueprint%,guide_type.ilike.%Blueprint%');
          else if (isTestimonialsTab) facetQ = facetQ.or('domain.ilike.%Testimonial%,guide_type.ilike.%Testimonial%');
          // For Guidelines tab: facets should only include Guidelines guides (exclude Strategy/Blueprint/Testimonial)
          // But don't filter by selected guide_type, units, locations - show all available options for Guidelines
          // Only filter by status if needed
          if (statuses.length)   facetQ = facetQ.in('status', statuses);

          const [guideResp, facetResp] = await Promise.all([
            listPromise,
            facetQ,
          ]);
          const rows = guideResp.data ?? [];
          const count = guideResp.count ?? null;
          const error = guideResp.error;
          const facetRows = facetResp.data ?? [];
          const facetError = facetResp.error;
          if (error) {
            console.error('Guides query error:', error);
            throw error;
          }
          if (facetError) console.warn('Facet query failed', facetError);
          
          // Debug logging
          if (isGuides) {
            const guideRows = (rows as unknown as GuideResult[] | null) || [];
            console.log('[Guides Debug]', {
              activeTab,
              currentActiveTab,
              isStrategyTab,
              isBlueprintTab,
              isGuidelinesTab,
              rowsCount: guideRows.length,
              totalCount: count,
              qStr,
              hasError: !!error,
              sampleRows: guideRows.slice(0, 3).map((r) => ({ 
                title: r.title, 
                domain: r.domain, 
                guide_type: r.guide_type ?? r.guideType,
                status: r.status
              }))
            });
          }

          const mapped = ((rows as unknown as GuideResult[]) || []).map((r) => {
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
              authorName: r.author_name ?? null,
              authorOrg: r.author_org ?? null,
              isEditorsPick: r.is_editors_pick ?? false,
              downloadCount: r.download_count ?? 0,
              guideType: r.guide_type ?? null,
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
            out = out.filter(it => {
              const domain = (it.domain || '').toLowerCase();
              const guideType = (it.guideType || '').toLowerCase();
              return domain.includes('strategy') || guideType.includes('strategy');
            });
          } else if (isBlueprintTab) {
            out = out.filter(it => {
              const domain = (it.domain || '').toLowerCase();
              const guideType = (it.guideType || '').toLowerCase();
              return domain.includes('blueprint') || guideType.includes('blueprint');
            });
          } else if (isTestimonialsTab) {
            out = out.filter(it => {
              const domain = (it.domain || '').toLowerCase();
              const guideType = (it.guideType || '').toLowerCase();
              return domain.includes('testimonial') || guideType.includes('testimonial');
            });
            const selectedTestimonials = testimonialCategories.map(slugify);
            if (selectedTestimonials.length) {
              out = out.filter(it => {
                // Testimonial categories are stored in guide_type field
                const guideType = (it.guideType || '').toLowerCase();
                if (!guideType) return false;
                // Check if guide_type matches any selected category (normalize both for comparison)
                const normalizedGuideType = slugify(guideType);
                return selectedTestimonials.some(sel => { // NOSONAR: nested callbacks intentional
                  // Compare slugified values
                  return normalizedGuideType === sel || 
                         guideType.includes(sel) ||
                         sel.includes(normalizedGuideType);
                });
              });
            }
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
          if (domains.length)    out = out.filter(it => it.domain && domains.includes(it.domain));
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
              return effectiveGuideTypes.some(selectedType => { // NOSONAR: nested callbacks intentional
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
              const matches = effectiveUnits.some(selectedUnit => { // NOSONAR: nested callbacks intentional
                // Normalize both sides for comparison (in case selectedUnit isn't already slugified)
                const normalizedSelected = slugify(selectedUnit);
                return normalizedDbValue === normalizedSelected;
              });
              return matches;
            });
          }
          // Strategy-specific filters: Strategy Type and Framework/Program
          // These filters check sub_domain field (which stores these categories)
          if (isStrategyTab && strategyTypes.length) {
            out = out.filter(it => {
              const subDomain = (it.subDomain || '').toLowerCase();
              return strategyTypes.some(selectedType => { // NOSONAR: nested callbacks intentional
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
              const allText = `${subDomain} ${domain} ${guideType}`.toLowerCase();
              return strategyFrameworks.some(selectedFramework => { // NOSONAR: nested callbacks intentional
                const normalizedSelected = slugify(selectedFramework);
                // Check various fields for framework matches
                return allText.includes(selectedFramework.toLowerCase()) ||
                       allText.includes(normalizedSelected) ||
                       (selectedFramework === '6xd' && (allText.includes('6xd') || allText.includes('digital-framework'))) ||
                       (selectedFramework === 'ghc' && allText.includes('ghc')) ||
                       (selectedFramework === 'clients' && allText.includes('client')) ||
                       (selectedFramework === 'ghc-leader' && allText.includes('ghc-leader')) ||
                       (selectedFramework === 'testimonials-insights' && (allText.includes('testimonial') || allText.includes('insight')));
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
              return guidelinesCategories.some(selectedCategory => { // NOSONAR: nested callbacks intentional
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
              return blueprintFrameworks.some(selectedFramework => { // NOSONAR: nested callbacks intentional
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
          if (locations.length)  out = out.filter(it => it.location && locations.includes(it.location));
          if (statuses.length)   out = out.filter(it => it.status && statuses.includes(it.status));

          if (sort === 'updated')       out.sort((a,b) => new Date(b.lastUpdatedAt||0).getTime() - new Date(a.lastUpdatedAt||0).getTime());
          else if (sort === 'downloads')out.sort((a,b) => (b.downloadCount||0)-(a.downloadCount||0));
          else if (sort === 'editorsPick')
            out.sort((a,b) => (Number(b.isEditorsPick)||0)-(Number(a.isEditorsPick)||0) ||
                              new Date(b.lastUpdatedAt||0).getTime() - new Date(a.lastUpdatedAt||0).getTime());
          else
            out.sort((a,b) => (Number(b.isEditorsPick)||0)-(Number(a.isEditorsPick)||0) ||
                              (b.downloadCount||0)-(a.downloadCount||0) ||
                              new Date(b.lastUpdatedAt||0).getTime() - new Date(a.lastUpdatedAt||0).getTime());

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

          let total: number;
          if (needsClientSideFiltering) {
            total = totalFiltered;
          } else if (typeof count === 'number') {
            total = count;
          } else {
            total = out.length;
          }
          const lastPage = Math.max(1, Math.ceil(total / pageSize));
          // If current page exceeds last page (e.g., after filtering), reset to page 1
          if (currentPage > lastPage) {
            const next = new URLSearchParams(queryParams.toString());
            if (lastPage <= 1) next.delete('page'); else next.set('page', '1'); // Always reset to page 1 if invalid
            if (globalThis.window !== undefined) {
              globalThis.window.history.replaceState(null, '', `${globalThis.window.location.pathname}${next.toString() ? '?' + next.toString() : ''}`);
              globalThis.window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            setQueryParams(new URLSearchParams(next.toString()));
            setLoading(false);
            return;
          }

          // facets query (unchanged)
          const countBy = (arr: ReadonlyArray<Record<string, unknown>> | null | undefined, key: string) => {
            const m = new Map<string, number>();
            const items = arr || [];
            for (const r of items) {
              const v = r?.[key];
              if (v) {
                m.set(String(v), (m.get(String(v)) || 0) + 1);
              }
            }
            return Array.from(m.entries())
              .map(([id, cnt]) => ({ id, name: id, count: cnt })) // NOSONAR: nested callbacks intentional
              .sort((a, b) => a.name.localeCompare(b.name)); // NOSONAR: nested callbacks intentional
          };

          type SimpleFacet = { domain?: string | null; guide_type?: string | null; [key: string]: unknown };
          const facetRowsTyped = (facetRows as unknown as SimpleFacet[] | null) || [];
          // Filter facet rows for Guidelines tab to exclude Strategy/Blueprint/Testimonial
          let filteredFacetRows: SimpleFacet[] = facetRowsTyped;
          if (isGuidelinesTab) {
            filteredFacetRows = facetRowsTyped.filter((r) => {
              const domain = (r.domain ?? '').toString().toLowerCase().trim();
              const guideType = (r.guide_type ?? '').toString().toLowerCase().trim();
              const hasStrategy = domain.includes('strategy') || guideType.includes('strategy');
              const hasBlueprint = domain.includes('blueprint') || guideType.includes('blueprint');
              const hasTestimonial = domain.includes('testimonial') || guideType.includes('testimonial');
              return !hasStrategy && !hasBlueprint && !hasTestimonial;
            });
          }
          
          const domainFacets      = countBy(filteredFacetRows, 'domain');
          const guideTypeFacets   = countBy(filteredFacetRows, 'guide_type');
          const subDomainFacetsRaw= countBy(filteredFacetRows, 'sub_domain');
          const unitFacets        = countBy(filteredFacetRows, 'unit');
          const locationFacets    = countBy(filteredFacetRows, 'location');
          const statusFacets      = countBy(filteredFacetRows, 'status');

          const allowedForFacets = new Set<string>();
          if (!isSpecialTab) {
            domains.forEach(d => (SUBDOMAIN_BY_DOMAIN[d] || []).forEach(s => allowedForFacets.add(s))); // NOSONAR: nested callbacks intentional
          }
          const subDomainFacets = allowedForFacets.size
            ? subDomainFacetsRaw.filter(opt => allowedForFacets.has(opt.id))
            : subDomainFacetsRaw;

          setItems(out as unknown as MarketplaceItem[]);
          setFilteredItems(out as unknown as MarketplaceItem[]);
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
        const itemsData = (await fetchMarketplaceItems(
          marketplaceType,
          Object.fromEntries(
            Object.entries(filters).map(([k, v]) => [
              k,
              Array.isArray(v) ? v.join(',') : v || '',
            ]),
          ),
          searchQuery,
        )) as MarketplaceItem[] | null | undefined;

        const fallbackItems = getFallbackItems<MarketplaceItem>(marketplaceType);
        const finalItems: MarketplaceItem[] =
          itemsData?.length ? itemsData : fallbackItems;

        setItems(finalItems);

        const filtered = isServicesCenter
          ? applyServiceCenterFilters(finalItems, filters, activeServiceTab, searchQuery)
          : filterBySearch(finalItems, searchQuery, [
              (it) => it.title,
              (it) => it.description,
              (it) => it.category,
              (it) => it.provider?.name,
              (it) => it.tags,
            ]);
        
        setFilteredItems(filtered);
        setTotalCount(filtered.length);
      } catch (err) {
        console.error(`Error fetching ${marketplaceType} items:`, err);
        setError(`Failed to load ${marketplaceType}`);
        const fallbackItems = getFallbackItems<MarketplaceItem>(marketplaceType);
        setItems(fallbackItems);

        const filteredFallback = isServicesCenter
          ? applyServiceCenterFilters(fallbackItems, filters, activeServiceTab, searchQuery)
          : filterBySearch(fallbackItems, searchQuery, [
              (it) => it.title,
              (it) => it.description,
              (it) => it.category,
              (it) => it.provider?.name,
              (it) => it.tags,
            ]);

        setFilteredItems(filteredFallback);
        setTotalCount(filteredFallback.length);
      } finally {
        setLoading(false);
      }
    };

    run();
    // Keep deps lean; no need to include functions like isGuides
  }, [marketplaceType, filters, filterSignature, filterConfig.length, searchQuery, queryParams, isCourses, isKnowledgeHub, isGuides, currentPage, pageSize, isServicesCenter, activeServiceTab, activeTab, searchFilteredItems.length]);

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
  }, [isCourses, isGuides, toggleFilter]);
  
  // Reset all filters
  const resetFilters = useCallback(() => {
    if (isCourses) {
      const newParams = new URLSearchParams();
      setSearchParams(newParams, { replace: true });
      setSearchQuery('');
    } else if (isKnowledgeHub) {
      setActiveFilters([]);
      setSearchQuery('');
    } else if (isGuides) {
      const newParams = new URLSearchParams();
      const qs = newParams.toString();
      globalThis.window.history.replaceState(null, '', `${globalThis.window.location.pathname}${qs ? '?' + qs : ''}`);
      setQueryParams(newParams);
      setSearchQuery('');
    } else {
      const empty: Record<string, string | string[]> = {};
      filterConfig.forEach(c => { empty[c.id] = ''; });
      setFilters(empty);
      setSearchQuery('');
    }
  }, [isCourses, isKnowledgeHub, isGuides, filterConfig, setSearchParams]);
  
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
  
  // UI helpers
  const toggleFilters = useCallback(() => setShowFilters(prev => !prev), []);
  const toggleBookmark = useCallback((itemId: string) => {
    setBookmarkedItems(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
  }, []);
  const handleAddToComparison = useCallback((item: MarketplaceItem) => {
    if (compareItems.length < 3 && !compareItems.some(c => c.id === item.id)) {
      setCompareItems(prev => [...prev, { id: item.id, title: item.title }]);
    }
  }, [compareItems]);
  const handleRemoveFromComparison = useCallback((itemId: string) => {
    setCompareItems(prev => prev.filter(item => item.id !== itemId));
  }, []);
  const retryFetch = useCallback(() => { setError(null); setLoading(true); }, []);
  const normalizeFilterValue = useCallback((v: string | string[]): string[] => {
    if (Array.isArray(v)) {
      return v;
    }
    return v ? [v] : [];
  }, []);

  const goToPage = useCallback((page: number) => {
    const clamped = Math.max(1, Math.min(page, totalPages));
    const next = new URLSearchParams(queryParams.toString());
    if (clamped <= 1) next.delete('page');
    else next.set('page', String(clamped));
    if (globalThis.window !== undefined) {
      globalThis.window.history.replaceState(null, '', `${globalThis.window.location.pathname}${next.toString() ? '?' + next.toString() : ''}`);
      globalThis.window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setQueryParams(new URLSearchParams(next.toString()));
  }, [queryParams, totalPages]);

  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 ${isGuides ? 'guidelines-theme' : ''}`}>
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <div className="container mx-auto px-4 py-8 flex-grow max-w-7xl">
        {/* Breadcrumbs */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link to="/" className="text-gray-600 hover:text-gray-900 inline-flex items-center">
                <HomeIcon size={16} className="mr-1" />
                <span>Home</span>
              </Link>
            </li>
            {isGuides ? (
              <li aria-current="page">
                <div className="flex items-center">
                  <ChevronRightIcon size={16} className="text-gray-400" />
                  <span className="ml-1 text-gray-700 md:ml-2">{config.title}</span>
                </div>
              </li>
            ) : (
              <>
                <li>
                  <div className="flex items-center">
                    <ChevronRightIcon size={16} className="text-gray-400" />
                    <Link to={config.route} className="ml-1 text-gray-500 hover:text-gray-700 md:ml-2">
                      {config.itemNamePlural}
                    </Link>
                  </div>
                </li>
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
          </ol>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{config.title}</h1>
            <p className="text-gray-600">{config.description}</p>
          </div>
          {isGuides && activeTab !== 'glossary' && activeTab !== 'faqs' && (
            <button
              onClick={() => {
                const next = new URLSearchParams(queryParams.toString());
                next.delete('page');
                next.set('pageSize', '10000');
                const qs = next.toString();
                if (globalThis.window !== undefined) {
                  globalThis.window.history.replaceState(null, '', `${globalThis.window.location.pathname}${qs ? '?' + qs : ''}`);
                  globalThis.window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                setQueryParams(new URLSearchParams(next.toString()));
                track('Guides.ViewAll', { tab: activeTab });
              }}
              className="sm:ml-4 px-4 py-2 bg-[var(--guidelines-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap self-start sm:self-auto"
            >
              View All
            </button>
          )}
        </div>

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
                      // Update URL with tab parameter
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set('tab', tab.id);
                      setSearchParams(newParams, { replace: false });
                    }}
                    className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                      isActive
                        ? 'border-blue-700'
                        : 'text-gray-700 border-transparent hover:text-gray-900 hover:border-gray-300'
                    }`}
                    style={isActive ? { color: '#030F35', borderColor: '#030F35' } : {}}
                    aria-current={isActive ? 'page' : undefined}
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
            {/* Tab Description - Above Navigation */}
            {activeTab && TAB_DESCRIPTIONS[activeTab] && (
              <div className="mb-4 bg-white rounded-lg p-6 border border-gray-200 relative">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <span className="text-xs uppercase text-gray-500 font-medium tracking-wide">CURRENT FOCUS</span>
                    <h2 className="text-2xl font-bold text-gray-800 mt-1">{TAB_LABELS[activeTab]}</h2>
                  </div>
                  <button className="px-4 py-2 bg-blue-50 text-gray-800 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors border-0">
                    Tab overview
                  </button>
                </div>
                <p className="text-gray-700 mb-2">{TAB_DESCRIPTIONS[activeTab].description}</p>
                {TAB_DESCRIPTIONS[activeTab].author && (
                  <p className="text-sm text-gray-500">{TAB_DESCRIPTIONS[activeTab].author}</p>
                )}
              </div>
            )}
            
            <div className="mb-6 border-b border-gray-200">
              <nav className="flex space-x-8" aria-label="Guides navigation">
                {/* Main tabs rendered as buttons */}
                {(['strategy', 'guidelines', 'blueprints', 'testimonials', 'glossary', 'faqs'] as WorkGuideTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => handleGuidesTabChange(tab)}
                    className={`
                      py-4 px-1 border-b-2 font-medium text-sm transition-colors
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
            </div>
          </>
        )}

        {/* Search + Sort - Hide for Glossary tab (has its own search) */}
        {!(isGuides && activeTab === 'glossary') && (
          <div className="mb-6 flex items-center gap-3">
            <div className="flex-1">
              <SearchBar
                searchQuery={isGuides ? (queryParams.get('q') || '') : searchQuery}
                placeholder={isGuides || isKnowledgeHub ? "Search in DQ Knowledge Center" : undefined}
                ariaLabel={isGuides || isKnowledgeHub ? "Search in DQ Knowledge Center" : undefined}
                setSearchQuery={(q: string) => {
                  if (isGuides) {
                    const next = new URLSearchParams(queryParams.toString());
                    next.delete('page');
                    if (q) next.set('q', q); else next.delete('q');
                    const qs = next.toString();
                    globalThis.window.history.replaceState(null, '', `${globalThis.window.location.pathname}${qs ? '?' + qs : ''}`);
                    setQueryParams(new URLSearchParams(next.toString()));
                  } else {
                    setSearchQuery(q);
                  }
                }}
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
              {(() => {
                let hasFilters = false;
                if (isCourses) {
                  hasFilters = Object.values(urlBasedFilters).some(f => Array.isArray(f) && f.length > 0);
                } else if (isKnowledgeHub) {
                  hasFilters = activeFilters.length > 0;
                } else if (!isGuides) {
                  hasFilters = Object.values(filters).some(f => (Array.isArray(f) ? f.length > 0 : f !== ''));
                }
                return hasFilters && (
                  <button onClick={resetFilters} className="ml-2 text-blue-600 text-sm font-medium whitespace-nowrap px-3 py-2">
                    Reset
                  </button>
                );
              })()}
            </div>
          </div>

          {/* Filter sidebar - mobile/tablet */}
          {showFilters && (
            <button
              type="button"
              className="fixed inset-0 bg-gray-800 bg-opacity-75 z-30 transition-opacity duration-300 xl:hidden"
              onClick={toggleFilters}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  toggleFilters();
                }
              }}
              aria-hidden={!showFilters}
              aria-label="Close filters overlay"
            />
          )}
          <dialog
            id="filter-sidebar"
            aria-modal="true"
            open={showFilters}
            className={`fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out xl:hidden ${showFilters ? 'translate-x-0' : '-translate-x-full'}`}
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
                    <GuidesFilters activeTab={activeTab} facets={facets} query={queryParams} onChange={(next) => { next.delete('page'); const qs = next.toString(); globalThis.window.history.replaceState(null, '', `${globalThis.window.location.pathname}${qs ? '?' + qs : ''}`); setQueryParams(new URLSearchParams(next.toString())); track('Guides.FilterChanged', { params: Object.fromEntries(next.entries()) }); }} />
                  ) : (
                    <FilterSidebar
                    filters={isCourses 
                      ? urlBasedFilters
                      : Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, normalizeFilterValue(v)])) as Record<string, string[]>}
                      filterConfig={filterConfig}
                      onFilterChange={handleFilterChange}
                      onResetFilters={resetFilters}
                      isResponsive={true}
                    />
                  )}
                </div>
              </div>
          </dialog>

          {/* Filter sidebar - desktop */}
          <div className="hidden xl:block xl:w-1/4">
            {isGuides ? (
              <GuidesFilters activeTab={activeTab} facets={facets} query={queryParams} onChange={(next) => { next.delete('page'); const qs = next.toString(); globalThis.window.history.replaceState(null, '', `${globalThis.window.location.pathname}${qs ? '?' + qs : ''}`); setQueryParams(new URLSearchParams(next.toString())); track('Guides.FilterChanged', { params: Object.fromEntries(next.entries()) }); }} />
            ) : (
              <div className="bg-white rounded-lg shadow p-4 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto filter-sidebar-scroll">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  {(() => {
                    let hasFilters = false;
                    if (isCourses) {
                      hasFilters = Object.values(urlBasedFilters).some(f => Array.isArray(f) && f.length > 0);
                    } else if (isKnowledgeHub) {
                      hasFilters = activeFilters.length > 0;
                    } else {
                      hasFilters = Object.values(filters).some(f => (Array.isArray(f) ? f.length > 0 : f !== ''));
                    }
                    return hasFilters && (
                      <button onClick={resetFilters} className="text-blue-600 text-sm font-medium">Reset All</button>
                    );
                  })()}
                </div>
                {isKnowledgeHub ? (
                  <div className="space-y-4">
                    {filterConfig.map(category => <div key={category.id} className="border-b border-gray-100 pb-3">
                        <h3 className="font-medium text-gray-900 mb-2">{category.title}</h3>
                        <div className="space-y-2">
                          {category.options.map(option => <div key={option.id} className="flex items-center">
                              <input type="checkbox" id={`desktop-${category.id}-${option.id}`} checked={activeFilters.includes(option.name)} onChange={() => handleKnowledgeHubFilterChange(option.name)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                              <label htmlFor={`desktop-${category.id}-${option.id}`} className="ml-2 text-sm text-gray-700">{option.name}</label>
                            </div>)}
                        </div>
                      </div>)}
                  </div>
                ) : (
                  <FilterSidebar
                    filters={isCourses 
                      ? urlBasedFilters
                      : Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, normalizeFilterValue(v)])) as Record<string, string[]>}
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
            {(() => {
              if (loading) {
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {Array.from({ length: 6 }, (_, idx) => <CourseCardSkeleton key={`skeleton-${idx}`} />)}
                  </div>
                );
              }
              if (error && !isGuides && !isKnowledgeHub) {
                return <ErrorDisplay message={error} onRetry={retryFetch} />;
              }
              if (isKnowledgeHub) {
                return (
                  <KnowledgeHubGrid
                    bookmarkedItems={bookmarkedItems}
                    onToggleBookmark={toggleBookmark}
                    onAddToComparison={handleAddToComparison}
                    searchQuery={searchQuery}
                    activeFilters={activeFilters}
                    onFilterChange={handleKnowledgeHubFilterChange}
                    onClearFilters={clearKnowledgeHubFilters}
                  />
                );
              }
              if (isGuides) {
                if (activeTab === 'faqs') {
                  return <FAQsPageContent />;
                }
                if (activeTab === 'glossary') {
                  return (
                    <>
                      {/* Global Search Bar for Glossary */}
                      <div className="mb-6">
                        <div className="relative">
                          <input
                            type="text"
                            value={queryParams.get('q') || ''}
                            onChange={(e) => {
                              const next = new URLSearchParams(queryParams.toString());
                              next.delete('page');
                              if (e.target.value) {
                                next.set('q', e.target.value);
                              } else {
                                next.delete('q');
                              }
                              const qs = next.toString();
                            if (globalThis.window !== undefined) {
                              globalThis.window.history.replaceState(null, '', `${globalThis.window.location.pathname}${qs ? '?' + qs : ''}`);
                            }
                              setQueryParams(new URLSearchParams(next.toString()));
                            }}
                            placeholder="Search DQ terms (e.g. DWS, CWS, Agile TMS)"
                            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--guidelines-primary)] focus:border-[var(--guidelines-primary)] outline-none"
                          />
                          <svg
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                      <GlossaryGrid
                        items={filteredGlossaryTerms}
                        onClickTerm={(term) => {
                          navigate(`/marketplace/guides/glossary/${term.id}`);
                        }}
                        hideEmptyState={false}
                      />
                    </>
                  );
                }
                if (activeTab === 'testimonials') {
                  return (
                    <TestimonialsGrid
                      items={filteredItems}
                      onClickGuide={(g) => {
                        const qs = queryParams.toString();
                        navigate(`/marketplace/guides/${encodeURIComponent(g.slug || g.id)}`, {
                          state: { fromQuery: qs, activeTab }
                        });
                      }}
                    />
                  );
                }
                return (
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
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                      {totalPages > 1 && (
                        <>
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
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const next = new URLSearchParams(queryParams.toString());
                          next.delete('page');
                          next.set('pageSize', '10000');
                          const qs = next.toString();
                          if (globalThis.window !== undefined) {
                            globalThis.window.history.replaceState(null, '', `${globalThis.window.location.pathname}${qs ? '?' + qs : ''}`);
                            globalThis.window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                          setQueryParams(new URLSearchParams(next.toString()));
                          track('Guides.ViewAll', { tab: activeTab, location: 'bottom' });
                        }}
                        className="px-4 py-2 bg-[var(--guidelines-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        View All
                      </button>
                    </div>
                  </>
                );
              }
              const gridItems: MarketplaceItem[] = isCourses 
                ? searchFilteredItems.map(course => {
                    const allowedSet = new Set<string>(LOCATION_ALLOW as readonly string[]);
                    const safeLocations = (course.locations || []).filter(loc => allowedSet.has(loc));
                    return {
                      ...course,
                      locations: safeLocations.length ? safeLocations : ['Global'],
                      provider: {
                        name: course.provider,
                        logoUrl: '/DWS-Logo.png',
                        description: course.summary || ''
                      },
                      description: course.summary
                    } as MarketplaceItem;
                  })
                : filteredItems;
              return (
                <MarketplaceGrid
                  items={gridItems}
                marketplaceType={marketplaceType}
                bookmarkedItems={bookmarkedItems}
                onToggleBookmark={toggleBookmark}
                onAddToComparison={handleAddToComparison}
                promoCards={promoCards}
                activeServiceTab={activeServiceTab}
              />
              );
            })()}
          </div>
        </div>

        {/* Comparison modal */}
        {showComparison && (
          <MarketplaceComparison
            items={compareItems}
            onClose={() => setShowComparison(false)}
            onRemoveItem={handleRemoveFromComparison}
            marketplaceType={marketplaceType}
          />
        )}
      </div>
      <Footer isLoggedIn={false} />
    </div>
  );
};

export default MarketplacePage;
