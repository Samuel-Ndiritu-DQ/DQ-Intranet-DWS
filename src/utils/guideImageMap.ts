import { getProductMetadata } from './productMetadata'

type GuideLike = {
  heroImageUrl?: string | null
  domain?: string | null
  guideType?: string | null
  id?: string | null
  slug?: string | null
  title?: string | null
  subDomain?: string | null
}

const domainFallbacks: Record<string, string> = {
  'Digital Workspace': '/image.png',
  'Digital Core Business': '/image.png',
  'Digital Backoffice': '/image.png',
  'Digital Enablement': '/image.png',
}

const typeFallbacks: Record<string, string> = {
  'Policy': '/image.png',
  'SOP': '/image.png',
  'Process': '/image.png',
  'Checklist': '/image.png',
  'Template': '/image.png',
  'Best Practice': '/image.png',
}

// GHC image - golden honeycomb with bees
const GHC_IMAGE = '/images/honeycomb.png'

// HoV (House of Values) main image
const HOV_IMAGE = '/images/house-of-values.png'

// Guidelines image
const GUIDELINES_IMAGE = '/images/guidelines.PNG'

// Specific guide images - Creative mappings for key guides
const specificGuideImages: Record<string, string> = {
  // DQ Vision and Mission - Inspiring vision, global perspective, purpose
  'dq-vision-and-mission': 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3', // Earth from space, global vision
  'dq-vision-mission': 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3',
  'vision-and-mission': 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3',
}

// HoV Guiding Values - Creative image mappings that match each value's essence
const hovValueImages: Record<string, string> = {
  // Mantra 01: Self-Development
  'dq-competencies-emotional-intelligence': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3', // Mindfulness, calm, self-awareness - meditation/zen
  'dq-competencies-growth-mindset': 'https://images.unsplash.com/photo-1503676260721-1d00d5eef0e3?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3', // Growth, sprouting, upward movement - plant growth
  
  // Mantra 02: Lean Working
  'dq-competencies-purpose': 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3', // Direction, compass, navigation - mountain path with purpose
  'dq-competencies-perceptive': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3', // Vision, insight, awareness - telescope/observatory
  'dq-competencies-proactive': 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3', // Action, forward movement, initiative - running/athletic movement
  'dq-competencies-perseverance': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3', // Resilience, strength, determination - climbing/overcoming obstacles
  'dq-competencies-precision': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3', // Focus, detail, accuracy - precision tools/engineering
  
  // Mantra 03: Value Co-Creation
  'dq-competencies-customer': 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3', // Connection, service, empathy - helping hands/connection
  'dq-competencies-learning': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3', // Knowledge, books, education - open book/learning
  'dq-competencies-collaboration': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3', // Teamwork, unity, togetherness - team collaboration
  'dq-competencies-responsibility': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3', // Accountability, ownership, reliability - structure/foundation
  'dq-competencies-trust': 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3', // Handshake, partnership, integrity - handshake/partnership
}

// Strategy images - dark backgrounds with abstract green/blue light effects
const strategyFallbacks: string[] = [
  'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3', // Dark with blue/green lights
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3', // Dark abstract with lights
  'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3', // Dark tech background
  'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3', // Dark abstract
  'https://images.unsplash.com/photo-1557682257-2f9c37d3b5ab?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3', // Dark with neon lights
  'https://images.unsplash.com/photo-1557682260-9c0c0a4c3c8b?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3', // Dark digital pattern
]

const neutralFallback = '/image.png'

const stringHash = (value: string): number => {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.codePointAt(i)!) >>> 0
  }
  return hash
}

// Check if guide is HoV (House of Values) related
function isHOVGuide(g: GuideLike): boolean {
  const slug = (g.slug ?? '').toLowerCase()
  const title = (g.title ?? '').toLowerCase()
  const subDomain = (g.subDomain ?? '').toLowerCase()
  
  // Main HoV guides
  const hovSlugs = [
    'dq-hov',
    'dq-competencies',
    'house-of-values',
    'hov'
  ]
  
  if (hovSlugs.some(hovSlug => slug === hovSlug || slug.includes(hovSlug))) {
    return true
  }
  
  // Check for 12 guiding values
  const guidingValueSlugs = [
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
  
  if (guidingValueSlugs.some(valueSlug => slug.includes(valueSlug))) {
    return true
  }
  
  // Check title for HoV indicators
  if (title.includes('house of values') || title.includes('hov') || 
      title.includes('competencies') && !title.includes('ghc')) {
    return true
  }
  
  // Check sub-domain
  if (subDomain === 'hov' || subDomain === 'competencies') {
    return true
  }
  
  return false
}

// Check if guide is GHC-related (but not HoV)
function isGHCGuide(g: GuideLike): boolean {
  // Exclude HoV guides from GHC
  if (isHOVGuide(g)) {
    return false
  }
  
  const slug = (g.slug ?? '').toLowerCase()
  const title = (g.title ?? '').toLowerCase()
  const subDomain = (g.subDomain ?? '').toLowerCase()
  
  // Check for GHC-specific slugs
  const ghcSlugs = [
    'dq-ghc',
    'dq-vision',
    'dq-persona',
    'dq-agile-tms',
    'dq-agile-sos',
    'dq-agile-flows',
    'dq-agile-6xd',
    'ghc',
    'golden-honeycomb'
  ]
  
  if (ghcSlugs.some(ghcSlug => slug.includes(ghcSlug))) {
    return true
  }
  
  // Check title for GHC indicators
  if (title.includes('ghc') || title.includes('golden honeycomb')) {
    return true
  }
  
  // Check sub-domain
  if (subDomain === 'ghc') {
    return true
  }
  
  return false
}

// Helper: Check if guide is blueprint/product
function isBlueprintGuide(g: GuideLike): boolean {
  return (g.domain ?? '').toLowerCase().includes('blueprint') || 
         (g.guideType ?? '').toLowerCase().includes('blueprint')
}

// Helper: Check if guide is strategy
function isStrategyGuide(g: GuideLike): boolean {
  return (g.domain ?? '').toLowerCase().includes('strategy') || 
         (g.guideType ?? '').toLowerCase().includes('strategy')
}

// Helper: Check if guide is testimonial
function isTestimonialGuide(g: GuideLike): boolean {
  return (g.domain ?? '').toLowerCase().includes('testimonial') ||
         (g.guideType ?? '').toLowerCase().includes('testimonial')
}

// Helper: Check if guide is guidelines domain
function isGuidelinesDomain(g: GuideLike): boolean {
  const domain = (g.domain ?? '').toLowerCase().trim()
  return domain === 'guidelines' || domain === 'guideline'
}

// Helper: Get hero image if valid
function getValidHeroImage(g: GuideLike): string | null {
  const src = g.heroImageUrl?.trim() ?? ''
  return src?.startsWith('http') ? src : null
}

// Helper: Find specific guide image
function findSpecificGuideImage(slug: string, title: string): string | null {
  for (const [guideSlug, imageUrl] of Object.entries(specificGuideImages)) {
    if (slug === guideSlug || slug.includes(guideSlug) || title.includes(guideSlug)) {
      return imageUrl
    }
  }
  return null
}

// Helper: Get HoV guide image
function getHoVGuideImage(g: GuideLike, slug: string): string {
  // Check for specific guiding value images
  for (const [valueSlug, imageUrl] of Object.entries(hovValueImages)) {
    if (slug.includes(valueSlug)) {
      return imageUrl
    }
  }
  
  // Main HoV guides use the house-of-values image
  if (slug === 'dq-hov' || slug === 'dq-competencies' || slug.includes('house-of-values')) {
    return HOV_IMAGE
  }
  
  return HOV_IMAGE
}

// Helper: Get blueprint guide image
function getBlueprintGuideImage(g: GuideLike): string {
  const productMeta = getProductMetadata(g.title)
  if (productMeta?.imageUrl) {
    return productMeta.imageUrl
  }
  return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
}

// Helper: Get strategy guide image
function getStrategyGuideImage(g: GuideLike): string {
  if (!strategyFallbacks.length) return neutralFallback
  
  const key = (g.slug ?? g.id ?? g.title ?? '').trim()
  const idx = key ? stringHash(key) % strategyFallbacks.length : 0
  return strategyFallbacks[idx]
}

// Helper: Get fallback image by domain or type
function getFallbackImage(g: GuideLike): string {
  const byDomain = g.domain ? domainFallbacks[g.domain] : undefined
  if (byDomain) return byDomain
  
  const byType = g.guideType ? typeFallbacks[g.guideType] : undefined
  if (byType) return byType
  
  return neutralFallback
}

export function getGuideImageUrl(g: GuideLike): string {
  const slug = (g.slug ?? '').toLowerCase()
  const title = (g.title ?? '').toLowerCase()
  
  // Check for guidelines domain first
  if (isGuidelinesDomain(g) && !isHOVGuide(g) && !isGHCGuide(g) && 
      !isBlueprintGuide(g) && !isStrategyGuide(g) && !isTestimonialGuide(g)) {
    return GUIDELINES_IMAGE
  }
  
  // Check for valid hero image
  const heroImage = getValidHeroImage(g)
  if (heroImage) return heroImage
  
  // Check for specific guide images
  const specificImage = findSpecificGuideImage(slug, title)
  if (specificImage) return specificImage
  
  // Check guide type categories
  if (isHOVGuide(g)) return getHoVGuideImage(g, slug)
  if (isGHCGuide(g)) return GHC_IMAGE
  if (isBlueprintGuide(g)) return getBlueprintGuideImage(g)
  if (isStrategyGuide(g)) return getStrategyGuideImage(g)
  
  // Final fallback
  return getFallbackImage(g)
}

