export interface ProductMetadata {
  productType: string
  productStage: string
  description: string
  imageUrl: string
}

// Product metadata mapping - maps product titles to their metadata
export const PRODUCT_METADATA: Record<string, ProductMetadata> = {
  'Digital Workspace System': {
    productType: 'Platform',
    productStage: 'Live',
    description: 'A unified digital workspace platform that centralizes tools, knowledge, services, and collaboration to enable productivity, execution, and visibility across DQ.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  'DWS': {
    productType: 'Platform',
    productStage: 'Live',
    description: 'A unified digital workspace platform that centralizes tools, knowledge, services, and collaboration to enable productivity, execution, and visibility across DQ.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  'Digital Workspace System (DWS)': {
    productType: 'Platform',
    productStage: 'Live',
    description: 'A unified digital workspace platform that centralizes tools, knowledge, services, and collaboration to enable productivity, execution, and visibility across DQ.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  'Digital Transformation Management Academy': {
    productType: 'Academy',
    productStage: 'Live',
    description: 'A structured learning academy designed to reskill digital workers and leaders using DQ\'s 6xD frameworks and real-world transformation practices.',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  'DTMA': {
    productType: 'Academy',
    productStage: 'Live',
    description: 'A structured learning academy designed to reskill digital workers and leaders using DQ\'s 6xD frameworks and real-world transformation practices.',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  'Digital Transformation Management Academy (DTMA)': {
    productType: 'Academy',
    productStage: 'Live',
    description: 'A structured learning academy designed to reskill digital workers and leaders using DQ\'s 6xD frameworks and real-world transformation practices.',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  'Digital Business Platforms': {
    productType: 'Tooling',
    productStage: 'MVP',
    description: 'AI-enabled functional assists that support planning, execution, and decision-making across digital business platforms and transformation initiatives.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  'DBP Assists': {
    productType: 'Tooling',
    productStage: 'MVP',
    description: 'AI-enabled functional assists that support planning, execution, and decision-making across digital business platforms and transformation initiatives.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  'Digital Business Platforms (DBP Assists)': {
    productType: 'Tooling',
    productStage: 'MVP',
    description: 'AI-enabled functional assists that support planning, execution, and decision-making across digital business platforms and transformation initiatives.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  'Digital Transformation Management Platform': {
    productType: 'Platform',
    productStage: 'Scaling',
    description: 'An enterprise platform that governs, tracks, and controls digital transformation initiatives through lifecycle management, analytics, and best-practice frameworks.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  'DTMP': {
    productType: 'Platform',
    productStage: 'Scaling',
    description: 'An enterprise platform that governs, tracks, and controls digital transformation initiatives through lifecycle management, analytics, and best-practice frameworks.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  'Digital Transformation Management Platform (DTMP)': {
    productType: 'Platform',
    productStage: 'Scaling',
    description: 'An enterprise platform that governs, tracks, and controls digital transformation initiatives through lifecycle management, analytics, and best-practice frameworks.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  'DTO4T': {
    productType: 'Framework',
    productStage: 'Live',
    description: 'A comprehensive operating framework that defines how organizations design, drive, govern, and scale digital transformation with consistency and control.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  'Digital Transformation Operating Framework': {
    productType: 'Framework',
    productStage: 'Live',
    description: 'A comprehensive operating framework that defines how organizations design, drive, govern, and scale digital transformation with consistency and control.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  'DTO4T – Digital Transformation Operating Framework': {
    productType: 'Framework',
    productStage: 'Live',
    description: 'A comprehensive operating framework that defines how organizations design, drive, govern, and scale digital transformation with consistency and control.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  'TMaaS': {
    productType: 'Enablement Product',
    productStage: 'Live',
    description: 'A managed service offering that provides continuous transformation leadership, governance, and execution support using DQ platforms and expertise.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  'Transformation Management as a Service': {
    productType: 'Enablement Product',
    productStage: 'Live',
    description: 'A managed service offering that provides continuous transformation leadership, governance, and execution support using DQ platforms and expertise.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  'TMaaS – Transformation Management as a Service': {
    productType: 'Enablement Product',
    productStage: 'Live',
    description: 'A managed service offering that provides continuous transformation leadership, governance, and execution support using DQ platforms and expertise.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  }
}

/**
 * Get product metadata for a given title
 * Performs case-insensitive matching and handles variations
 */
export function getProductMetadata(title: string | null | undefined): ProductMetadata | null {
  if (!title) return null
  
  const normalizedTitle = title.trim()
  
  // Direct match
  if (PRODUCT_METADATA[normalizedTitle]) {
    return PRODUCT_METADATA[normalizedTitle]
  }
  
  // Case-insensitive match
  const lowerTitle = normalizedTitle.toLowerCase()
  for (const [key, value] of Object.entries(PRODUCT_METADATA)) {
    if (key.toLowerCase() === lowerTitle) {
      return value
    }
  }
  
  // Partial match for common variations
  if (lowerTitle.includes('digital workspace') || lowerTitle.includes('dws')) {
    return PRODUCT_METADATA['Digital Workspace System (DWS)']
  }
  if (lowerTitle.includes('dtma') || (lowerTitle.includes('transformation management academy'))) {
    return PRODUCT_METADATA['Digital Transformation Management Academy (DTMA)']
  }
  if (lowerTitle.includes('dbp') && (lowerTitle.includes('assist') || lowerTitle.includes('tool'))) {
    return PRODUCT_METADATA['Digital Business Platforms (DBP Assists)']
  }
  if (lowerTitle.includes('dtmp') || (lowerTitle.includes('transformation management platform') && !lowerTitle.includes('academy'))) {
    return PRODUCT_METADATA['Digital Transformation Management Platform (DTMP)']
  }
  if (lowerTitle.includes('dto4t') || (lowerTitle.includes('transformation operating framework'))) {
    return PRODUCT_METADATA['DTO4T – Digital Transformation Operating Framework']
  }
  if (lowerTitle.includes('tmaas') || (lowerTitle.includes('transformation management as a service'))) {
    return PRODUCT_METADATA['TMaaS – Transformation Management as a Service']
  }
  
  return null
}

