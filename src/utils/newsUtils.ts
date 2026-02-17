import type { NewsItem } from '@/data/media/news';

/**
 * Format date to a readable string
 */
export const formatDate = (input: string): string => {
  if (!input) return '';
  try {
    return new Date(input).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch {
    return '';
  }
};

/**
 * Format date to short format (e.g., "Dec 19, 2025")
 */
export const formatDateShort = (input: string): string => {
  if (!input) return '';
  try {
    return new Date(input).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch {
    return '';
  }
};

/**
 * Format date to very short format (e.g., "Dec 19")
 */
export const formatDateVeryShort = (input: string): string => {
  if (!input) return '';
  try {
    return new Date(input).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return '';
  }
};

/**
 * Convert text to title case (not all caps)
 */
export const toTitleCase = (text: string): string => {
  if (!text) return '';
  // If already in title case or mixed case, return as is (but ensure not all caps)
  if (text === text.toUpperCase() && text.length > 3) {
    // Convert all caps to title case
    return text
      .toLowerCase()
      .split(' ')
      .map(word => {
        // Handle special cases like "WFH", "DXB", "KSA", "NBO", "EoY"
        const acronyms = ['wfh', 'dxb', 'ksa', 'nbo', 'eoy', 'dq', 'hr', 'hra'];
        if (acronyms.includes(word.toLowerCase())) {
          return word.toUpperCase();
        }
        // Capitalize first letter
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }
  return text;
};

/**
 * Helper: Get location prefix for title
 */
const getLocationPrefix = (location?: string): string | null => {
  if (!location) return null;
  const locationMap: Record<string, string> = {
    'Dubai': 'DXB',
    'Nairobi': 'NBO',
    'Riyadh': 'KSA',
    'Remote': 'Remote'
  };
  return locationMap[location] || location;
};

/**
 * Helper: Get type prefix for title
 */
const getTypePrefix = (item: NewsItem): string | null => {
  if (item.newsType) return item.newsType;
  if (item.type === 'Thought Leadership') return 'Blog';
  if (item.type) return item.type;
  return null;
};

/**
 * Helper: Extract title from excerpt
 */
const getTitleFromExcerpt = (excerpt?: string): string | null => {
  if (!excerpt?.trim()) return null;
  const excerptWords = excerpt.trim().split(' ');
  if (excerptWords.length === 0) return null;
  const titleFromExcerpt = excerptWords.slice(0, 8).join(' ');
  return titleFromExcerpt.length > 20 ? titleFromExcerpt : null;
};

/**
 * Helper: Extract title from content
 */
const getTitleFromContent = (content?: string): string | null => {
  if (!content) return null;
  const firstLine = content.split('\n').find(line => line.trim() && !line.trim().startsWith('#'));
  if (!firstLine) return null;
  const cleanLine = firstLine.trim().replaceAll(/^#+\s+/g, '').replaceAll('**', '').substring(0, 60);
  return cleanLine.length > 15 ? cleanLine : null;
};

/**
 * Helper: Extract title from ID
 */
const getTitleFromId = (id?: string): string | null => {
  if (!id) return null;
  const idParts = id.split('-');
  const meaningfulParts = idParts
    .filter(part => part.length > 2 && !['dq', 'the', 'and', 'for'].includes(part.toLowerCase()))
    .map(part => part.charAt(0).toUpperCase() + part.slice(1));
  return meaningfulParts.length > 0 ? meaningfulParts.join(' ') : null;
};

/**
 * Helper: Combine parts into title
 */
const combineTitleParts = (parts: string[], mainTitle: string): string => {
  return parts.length > 0 ? `${parts.join(' | ')} | ${mainTitle}` : mainTitle;
};

/**
 * Generate an appropriate title for news items that don't have one
 */
export const generateTitle = (item: NewsItem): string => {
  // If title exists and is not empty, return it
  if (item.title?.trim()) {
    return item.title;
  }

  // Build prefix parts
  const parts: string[] = [];
  const locationPrefix = getLocationPrefix(item.location);
  if (locationPrefix) parts.push(locationPrefix);
  
  const typePrefix = getTypePrefix(item);
  if (typePrefix) parts.push(typePrefix);

  // Try different sources for main title
  const excerptTitle = getTitleFromExcerpt(item.excerpt);
  if (excerptTitle) return combineTitleParts(parts, excerptTitle);

  const contentTitle = getTitleFromContent(item.content);
  if (contentTitle) return combineTitleParts(parts, contentTitle);

  const idTitle = getTitleFromId(item.id);
  if (idTitle) return combineTitleParts(parts, idTitle);

  // Final fallback
  const typeLabel = item.type === 'Thought Leadership' ? 'Blog' : (item.newsType || item.type || 'Announcement');
  return combineTitleParts(parts, typeLabel);
};

/**
 * Get news type display information (label and color)
 */
export const getNewsTypeDisplay = (item: NewsItem): { label: string; color: string } => {
  // Check if this is a podcast first - podcasts should match blog styling
  const isPodcast = item.format === 'Podcast' || item.tags?.some(tag => tag.toLowerCase().includes('podcast'));
  if (isPodcast) {
    return {
      label: 'Podcast',
      color: '#14B8A6' // Use same teal color as blogs for consistency
    };
  }
  // For blog articles (Thought Leadership), always show "Blog" with unique color
  if (item.type === 'Thought Leadership') {
    return {
      label: 'Blog',
      color: '#14B8A6' // Teal color for blogs
    };
  }
  
  const newsTypeColor: Record<NonNullable<NewsItem['newsType']>, string> = {
    'Policy Update': '#8B5CF6',        // Purple for policy/guidelines
    'Upcoming Events': '#F97316',      // Orange for events
    'Company News': '#0EA5E9',         // Blue for company news
    'Holidays': '#16A34A'              // Green for holidays/notices
  };

  const newsTypeLabel: Record<NonNullable<NewsItem['newsType']>, string> = {
    'Policy Update': 'Policy Update',
    'Upcoming Events': 'Upcoming Events',
    'Company News': 'Company News',
    'Holidays': 'Holidays'
  };

  if (item.newsType) {
    return {
      label: newsTypeLabel[item.newsType],
      color: newsTypeColor[item.newsType]
    };
  }
  
  // Fallback to type if newsType is missing
  const typeFallback: Record<NewsItem['type'], { label: string; color: string }> = {
    Announcement: { label: 'Company News', color: '#0EA5E9' },      // Blue
    Guidelines: { label: 'Policy Update', color: '#8B5CF6' },        // Purple
    Notice: { label: 'Holidays', color: '#16A34A' },                  // Green
    'Thought Leadership': { label: 'Blog', color: '#14B8A6' }         // Teal for blogs
  };
  return typeFallback[item.type];
};

/**
 * Get fallback image based on item ID
 */
export const getFallbackImage = (itemId: string, fallbackImages: string[]): string => {
  if (!itemId || !fallbackImages.length) {
    return fallbackImages[0] || '';
  }
  const hash = Math.abs(itemId.split('').reduce((sum, char) => sum + char.codePointAt(0)!, 0));
  return fallbackImages[hash % fallbackImages.length] || fallbackImages[0];
};

/**
 * Format time in seconds to mm:ss format
 */
export const formatTime = (seconds: number): string => {
  if (Number.isNaN(seconds) || !Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format duration string to readable format
 */
export const formatDuration = (readingTime?: string): string => {
  if (!readingTime) return '12 min';
  const durationMap: Record<string, string> = {
    '<5': '5 min',
    '5–10': '8 min',
    '10–20': '15 min',
    '20+': '20 min'
  };
  return durationMap[readingTime] || '12 min';
};

/**
 * Format listens/views count
 */
export const formatListens = (views: number): string => {
  if (views >= 1000) {
    const kValue = (views / 1000).toFixed(1);
    // Remove trailing .0 if present
    return `${kValue.replace(/\.0$/, '')}k listens`;
  }
  return `${views} listens`;
};

