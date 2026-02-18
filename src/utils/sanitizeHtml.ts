/**
 * HTML Sanitization Utility
 * Provides safe HTML rendering by sanitizing potentially dangerous content
 */

/**
 * HTML Sanitization Utility
 * Provides safe HTML rendering by sanitizing potentially dangerous content
 */

import { securityMonitor } from './securityMonitor';

// Simple HTML sanitizer for basic formatting
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  const originalLength = html.length;
  
  // Remove script tags and their content
  let sanitized = html.replaceAll(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove dangerous attributes
  sanitized = sanitized.replaceAll(/\s*on\w+\s*=\s*["'][^"']*["']/gi, ''); // onclick, onload, etc.
  sanitized = sanitized.replaceAll(/\s*javascript\s*:/gi, ''); // javascript: URLs
  sanitized = sanitized.replaceAll(/\s*data\s*:/gi, ''); // data: URLs
  sanitized = sanitized.replaceAll(/\s*vbscript\s*:/gi, ''); // vbscript: URLs
  
  // Remove dangerous tags
  const dangerousTags = ['script', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button', 'iframe', 'frame', 'frameset'];
  dangerousTags.forEach(tag => {
    const regex = new RegExp(String.raw`<\/?${tag}\b[^>]*>`, 'gi');
    sanitized = sanitized.replaceAll(regex, '');
  });
  
  // Log if content was modified
  if (sanitized.length !== originalLength) {
    securityMonitor.logEvent('sanitized_html', `HTML content sanitized, removed ${originalLength - sanitized.length} characters`);
  }
  
  return sanitized;
};

// Allowed HTML tags for content rendering
const ALLOWED_TAGS = new Set(['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote']);

export const sanitizeAndValidateHtml = (html: string): string => {
  if (!html) return '';
  
  let sanitized = sanitizeHtml(html);
  
  // Additional validation: only allow specific tags
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  sanitized = sanitized.replaceAll(tagRegex, (match, tagName) => {
    if (ALLOWED_TAGS.has(tagName.toLowerCase())) {
      return match;
    }
    return ''; // Remove disallowed tags
  });
  
  return sanitized;
};

// Safe text rendering - strips all HTML
export const stripHtml = (html: string): string => {
  if (!html) return '';
  return html.replaceAll(/<[^>]*>/g, '');
};