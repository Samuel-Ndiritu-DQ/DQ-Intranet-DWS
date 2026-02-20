import React from 'react'
import { toTimeBucket } from '../../utils/guides'
import { getGuideImageUrl } from '../../utils/guideImageMap'
import { useNavigate } from 'react-router-dom'
import { supabaseClient } from '../../lib/supabaseClient'
import { getProductMetadata } from '../../utils/productMetadata'

export interface GuideCardProps {
  guide: any
  onClick: () => void
  imageOverrideUrl?: string
}

export const GuideCard: React.FC<GuideCardProps> = ({ guide, onClick, imageOverrideUrl }) => {
  const timeBucket = toTimeBucket(guide.estimatedTimeMin)
  const lastUpdated = guide.lastUpdatedAt ? new Date(guide.lastUpdatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
  const domain = guide.domain as string | undefined
  const navigate = useNavigate()
  // Check if this is a product (blueprint or static product)
  const isBlueprint = ((guide.domain || '').toLowerCase().includes('blueprint')) || 
                      ((guide.guideType || '').toLowerCase().includes('blueprint')) ||
                      (guide.domain === 'Product') ||
                      (guide.productType && guide.productStage)
  const handleViewGuideline = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const { data, error } = await supabaseClient
        .from('guides')
        .select('slug')
        .eq('status', 'Approved')
        .ilike('domain', 'guidelines')
        .eq('title', guide.title)
        .maybeSingle()
      if (!error && data?.slug) {
        navigate(`/marketplace/guides/${encodeURIComponent(data.slug)}`, { state: { fromBlueprint: true } })
        return
      }
    } catch (e) {
      // Log and fall back to client-side navigation
      console.error('GuideCard: failed to resolve guideline slug', e)
    }
    // Fallback to Guidelines tab search
    navigate(`/marketplace/guides?tab=guidelines&q=${encodeURIComponent(guide.title)}`)
  }
  const formatLabel = (value?: string | null) => {
    if (!value) return ''
    return value
      .replace(/[_-]+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }
  const normalizeTag = (value?: string | null) => {
    if (!value) return ''
    const cleaned = value.toLowerCase().replace(/[_-]+/g, ' ').trim()
    return cleaned.endsWith('s') ? cleaned.slice(0, -1) : cleaned
  }
  
  // Determine the badge label based on framework for Strategy guides
  const getBadgeLabel = (): string => {
    if (isBlueprint) return 'Product'
    if (domain?.toLowerCase() === 'strategy') {
      const slug = (guide.slug || '').toLowerCase()
      const subDomain = (guide.subDomain || (guide as any).sub_domain || '').toLowerCase()
      
      // Check for HoV framework first (more specific)
      // HoV includes: dq-hov and all dq-competencies-* guides
      if (slug === 'dq-hov' || slug.includes('competencies') || subDomain.includes('hov') || subDomain.includes('competencies')) {
        return 'GHC'
      }
      
      // Check for GHC framework (but not overview)
      // GHC includes: dq-vision, dq-persona, dq-agile-* (excluding overview)
      if (slug === 'dq-vision' || 
          slug === 'dq-persona' || 
          slug.includes('agile-') ||
          (subDomain.includes('ghc') && !subDomain.includes('competencies'))) {
        return 'GHC'
      }
      
      // Default to Strategy if no framework match
      return formatLabel(domain)
    }
    return formatLabel(domain)
  }
  
  const domainLabel = getBadgeLabel()
  const isDuplicateTag = normalizeTag(domain) !== '' && normalizeTag(domain) === normalizeTag(guide.guideType)
  
  // Get product metadata if this is a product
  // Use direct productType/productStage if available (from static products), otherwise look up by title
  const productMetadata = isBlueprint ? (
    (guide.productType && guide.productStage) ? {
      productType: guide.productType,
      productStage: guide.productStage,
      description: guide.summary || '',
      imageUrl: guide.heroImageUrl || ''
    } : getProductMetadata(guide.title)
  ) : null
  
  // Transform title to remove "Blueprint" and use proper product naming
  const getDisplayTitle = (): string => {
    if (!isBlueprint) {
      const rawTitle = guide.title || ''
      const slug = (guide.slug || '').toLowerCase()
      
      // Canonical GHC element titles with numbering
      const ghcTitleBySlug: Record<string, string> = {
        'dq-ghc': 'GHC Overview',
        'dq-vision': 'GHC 1 - Vision (Purpose)',
        'dq-hov': 'GHC 2 - House of Values (HoV)',
        'dq-persona': 'GHC 3 - Persona',
        'dq-agile-tms': 'GHC 4 - Agile TMS',
        'dq-agile-sos': 'GHC 5 - Agile SoS',
        'dq-agile-flows': 'GHC 6 - Agile Flows',
        'dq-agile-6xd': 'GHC 7 - Agile 6xD (Products)',
      }
      const hovOrder = [
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
        'dq-competencies-trust'
      ]
      const hovTitleFromSlug = (s: string): string | null => {
        const idx = hovOrder.indexOf(s)
        if (idx === -1) return null
        const label = s.replace('dq-competencies-', '').replace(/-/g, ' ')
        const nice = label.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        return `HoV ${idx + 1} - ${nice}`
      }
      if (slug && ghcTitleBySlug[slug]) return ghcTitleBySlug[slug]
      const hovTitle = slug ? hovTitleFromSlug(slug) : null
      if (hovTitle) return hovTitle
      
      // Title-based fallback for GHC overview
      const lowerTitle = rawTitle.toLowerCase()
      if (lowerTitle.includes('golden honeycomb')) return 'GHC Overview'
      
      // Regex rename for legacy "GHC Competency N: X (Y)"
      const ghcCompetencyMatch = rawTitle.match(/^GHC\s+Competency\s+(\d+):\s*(.+)/i)
      if (ghcCompetencyMatch) {
        const [, num, rest] = ghcCompetencyMatch
        return `GHC ${num} - ${rest.trim()}`
      }
      return rawTitle
    }
    
    const title = guide.title || ''
    
    // If this is a static product (has productType/productStage directly), use title as-is
    if (guide.productType && guide.productStage) {
      return title
    }
    
    // Otherwise, this is a legacy blueprint item - clean up the title
    const lowerTitle = title.toLowerCase()
    
    // Remove "Blueprint" from title
    let cleanedTitle = title.replace(/\s*Blueprint\s*/gi, '').trim()
    
    // Map common patterns to proper product names
    if (lowerTitle.includes('dws') && !lowerTitle.includes('digital workspace system')) {
      // If it's just "DWS Blueprint" or similar, use full product name
      if (productMetadata) {
        if (lowerTitle.includes('dws') || lowerTitle.includes('digital workspace')) {
          return 'Digital Workspace System (DWS)'
        }
      }
      // Fallback: clean up and add Product if needed
      if (cleanedTitle.toLowerCase() === 'dws') {
        return 'Digital Workspace System (DWS)'
      }
      if (cleanedTitle.toLowerCase().startsWith('dws')) {
        return cleanedTitle.replace(/^dws\s*/i, 'Digital Workspace System (DWS)')
      }
    }
    
    // If title still contains "blueprint" after cleaning, remove it
    cleanedTitle = cleanedTitle.replace(/\s*blueprint\s*/gi, '').trim()
    
    // Try to match to known product names using metadata
    if (productMetadata) {
      const knownProducts = [
        'Digital Workspace System (DWS)',
        'Digital Transformation Management Academy (DTMA)',
        'Digital Business Platforms (DBP Assists)',
        'Digital Transformation Management Platform (DTMP)',
        'DTO4T – Digital Transformation Operating Framework',
        'TMaaS – Transformation Management as a Service'
      ]
      
      for (const productName of knownProducts) {
        const productMeta = getProductMetadata(productName)
        if (productMeta && productMeta.productType === productMetadata.productType && productMeta.productStage === productMetadata.productStage) {
          return productName
        }
      }
    }
    
    // Final fallback: if title is empty or just "Blueprint", use a generic product name
    if (!cleanedTitle || cleanedTitle.toLowerCase() === 'blueprint') {
      return 'Product'
    }
    
    return cleanedTitle
  }
  
  const displayTitle = getDisplayTitle()
  
  // Ensure we're using the correct property name - check both camelCase and snake_case
  const heroImage = guide.heroImageUrl || (guide as any).hero_image_url || null
  const subDomain = guide.subDomain || (guide as any).sub_domain || null

  // For products/blueprints, prioritize the product image from metadata (e.g. TMaaS card image)
  const defaultImageUrl = isBlueprint && productMetadata?.imageUrl
    ? productMetadata.imageUrl
    : getGuideImageUrl({
        heroImageUrl: heroImage,
        domain: guide.domain,
        guideType: guide.guideType,
        subDomain: subDomain,
        id: guide.id,
        slug: guide.slug || guide.id,
        title: guide.title,
      })

  const imageUrl = imageOverrideUrl || defaultImageUrl
  const isTestimonial = ((guide.domain || '').toLowerCase().includes('testimonial')) || ((guide.guideType || '').toLowerCase().includes('testimonial'))
  const isGhcOverview = (guide.slug || '').toLowerCase() === 'dq-ghc'
  
  // Use product description if available, otherwise use summary
  const displayDescription = productMetadata?.description || guide.summary || ''
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // If image fails to load, try to use a fallback
    const target = e.currentTarget
    if (target.src && !target.src.includes('/image.png')) {
      // Try fallback image
      target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
  }
  
  // Check if guide is in Draft status
  const isDraft = guide.status === 'Draft'
  const isPublished = guide.status === 'Published' || guide.status === 'Approved'
  
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-3 hover:shadow-md transition-shadow cursor-pointer h-[400px] flex flex-col" onClick={isDraft ? undefined : onClick}>
      {imageUrl && (
        <div className="rounded-lg overflow-hidden mb-2.5 bg-slate-50 flex-shrink-0" style={{ height: '160px', minHeight: '160px', maxHeight: '160px' }}>
          <img 
            src={imageUrl} 
            alt={displayTitle} 
            className="w-full h-full object-cover"
            loading="lazy" 
            decoding="async" 
            width={640} 
            height={160}
            onError={handleImageError}
            crossOrigin="anonymous"
          />
        </div>
      )}
      <h3 className="font-semibold text-gray-900 mb-2 flex-shrink-0" style={{ 
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        minHeight: '44px',
        maxHeight: '44px',
        lineHeight: '1.375rem'
      }} title={displayTitle}>{displayTitle}</h3>
      <p className="text-sm text-gray-600 mb-2.5 flex-shrink-0" style={{
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        minHeight: '36px',
        maxHeight: '36px',
        lineHeight: '1.125rem'
      }}>{displayDescription}</p>
      <div className="flex flex-wrap gap-2 mb-2 flex-shrink-0">
        {!isBlueprint && (
          <>
            {domain && (
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border" style={{ backgroundColor: 'var(--dws-chip-bg)', color: 'var(--dws-chip-text)', borderColor: 'var(--dws-card-border)' }}>
                {domainLabel}
              </span>
            )}
            {guide.guideType && !isTestimonial && !isDuplicateTag && !((guide.slug || '').toLowerCase() === 'dq-ghc') && (
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border" style={{ backgroundColor: 'var(--dws-chip-bg)', color: 'var(--dws-chip-text)', borderColor: 'var(--dws-card-border)' }}>
                {formatLabel(guide.guideType)}
              </span>
            )}
            {isTestimonial && guide.unit && (
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border" style={{ backgroundColor: 'var(--dws-chip-bg)', color: 'var(--dws-chip-text)', borderColor: 'var(--dws-card-border)' }}>
                {formatLabel(guide.unit)}
              </span>
            )}
            {isTestimonial && guide.location && (
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border" style={{ backgroundColor: 'var(--dws-chip-bg)', color: 'var(--dws-chip-text)', borderColor: 'var(--dws-card-border)' }}>
                {formatLabel(guide.location)}
              </span>
            )}
          </>
        )}
      </div>
      <div className="flex items-center text-xs text-gray-500 gap-3 mb-2.5 flex-shrink-0">
        {timeBucket && <span>{timeBucket}</span>}
        {lastUpdated && <span>{lastUpdated}</span>}
      </div>
      {/* Show author info only when provided and not a product or GHC/Strategy guide or Guidelines */}
      {(!isBlueprint && !isGhcOverview && domain?.toLowerCase() !== 'strategy' && domain?.toLowerCase() !== 'guidelines' && (guide.authorName || guide.authorOrg)) && (
        <div className="text-xs text-gray-600 mb-2.5 flex-shrink-0">
          <span
            className="truncate"
            title={`${guide.authorName || ""}${guide.authorOrg ? " - " + guide.authorOrg : ""}`}
          >
            {/* Filter out "bb" and other placeholder text */}
            {(() => {
              const authorText = `${guide.authorName || ""}${guide.authorOrg ? ` - ${guide.authorOrg}` : ""}`.trim();
              // Don't show if it's just "bb" or other single/double letter placeholders
              if (authorText.toLowerCase() === 'bb' || authorText.length <= 2) {
                return null;
              }
              return authorText;
            })()}
          </span>
        </div>
      )}
      {/* Spacer to push button to bottom */}
      <div className="pt-2 mt-auto border-t border-gray-100 flex-shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            if (!isDraft && !isBlueprint) {
              onClick()
            }
          }}
          disabled={isDraft || isBlueprint}
          className={`w-full inline-flex items-center justify-center rounded-full text-sm font-semibold px-4 py-2 transition-all focus:outline-none focus:ring-2 ${
            isDraft || isBlueprint
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#030E31] text-white hover:bg-[#020A28] focus:ring-[#030E31]'
          }`}
          aria-label={isDraft || isBlueprint ? 'Coming soon' : 'Read more'}
        >
          {isDraft || isBlueprint ? 'Coming Soon' : 'Read More'}
        </button>
      </div>
    </div>
  )
}

export default GuideCard
