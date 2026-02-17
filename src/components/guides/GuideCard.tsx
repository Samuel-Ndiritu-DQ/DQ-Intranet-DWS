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
  const domainLabel = isBlueprint ? 'Product' : formatLabel(domain)
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
    if (!isBlueprint) return guide.title || ''
    
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
  const defaultImageUrl = getGuideImageUrl({
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
  
  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col" onClick={onClick}>
      {imageUrl && (
        <div className="rounded-lg overflow-hidden mb-3">
          <img 
            src={imageUrl} 
            alt={displayTitle} 
            className="w-full h-48 object-cover" 
            loading="lazy" 
            decoding="async" 
            width={640} 
            height={180}
            onError={handleImageError}
            crossOrigin="anonymous"
          />
        </div>
      )}
      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[40px]" title={displayTitle}>{displayTitle}</h3>
      <p className="text-sm text-gray-600 line-clamp-3 min-h-[60px] mb-3">{displayDescription}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {/* For products, show Product Type and Stage instead of domain/guideType */}
        {isBlueprint && productMetadata ? (
          <>
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border" style={{ backgroundColor: 'var(--dws-chip-bg)', color: 'var(--dws-chip-text)', borderColor: 'var(--dws-card-border)' }}>
              {productMetadata.productType}
            </span>
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border" style={{ backgroundColor: 'var(--dws-chip-bg)', color: 'var(--dws-chip-text)', borderColor: 'var(--dws-card-border)' }}>
              {productMetadata.productStage}
            </span>
          </>
        ) : (
          <>
            {domain && (
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border" style={{ backgroundColor: 'var(--dws-chip-bg)', color: 'var(--dws-chip-text)', borderColor: 'var(--dws-card-border)' }}>
                {domainLabel}
              </span>
            )}
            {guide.guideType && !isTestimonial && !isDuplicateTag && (
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border" style={{ backgroundColor: 'var(--dws-chip-bg)', color: 'var(--dws-chip-text)', borderColor: 'var(--dws-card-border)' }}>
                {formatLabel(guide.guideType)}
              </span>
            )}
          </>
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
      </div>
      <div className="flex items-center text-xs text-gray-500 gap-3 mb-3">
        {timeBucket && <span>{timeBucket}</span>}
        {lastUpdated && <span>{lastUpdated}</span>}
      </div>
      {/* Always show author info for products, show for others only if author exists */}
      {(isBlueprint || guide.authorName || guide.authorOrg) && (
        <div className="text-xs text-gray-600 mb-3">
          <span
            className="truncate"
            title={isBlueprint ? 'Product Owner / Practice' : `${guide.authorName || ''}${guide.authorOrg ? ' • ' + guide.authorOrg : ''}`}
          >
            {isBlueprint ? 'Product Owner / Practice' : `${guide.authorName || ''}${guide.authorOrg ? ` • ${guide.authorOrg}` : ''}`}
          </span>
        </div>
      )}
      <div className="mt-auto pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
            className="w-full inline-flex items-center justify-center rounded-full bg-[var(--guidelines-primary-solid)] text-white text-sm font-semibold px-4 py-2 transition-all hover:bg-[var(--guidelines-primary-solid-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--guidelines-ring-color)]"
            aria-label="View details"
          >
            View Details
        </button>
      </div>
    </div>
  )
}

export default GuideCard
