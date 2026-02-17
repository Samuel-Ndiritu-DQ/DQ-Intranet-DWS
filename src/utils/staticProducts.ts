// Static product data for the Products tab
// These products are always displayed in the Products marketplace tab

export interface StaticProduct {
  id: string
  title: string
  summary: string
  domain: string
  guideType: string
  heroImageUrl: string | null
  lastUpdatedAt: string
  authorName: string | null
  authorOrg: string | null
  isEditorsPick: boolean
  downloadCount: number
  status: string
  slug: string
  // Product-specific metadata
  productType: string
  productStage: string
}

export const STATIC_PRODUCTS: StaticProduct[] = [
  {
    id: 'static-product-dws',
    title: 'Digital Workspace System (DWS)',
    summary: 'A unified digital workspace platform that centralizes tools, knowledge, services, and collaboration to enable productivity and execution across DQ.',
    domain: 'Product',
    guideType: 'Platform',
    heroImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3',
    lastUpdatedAt: new Date().toISOString(),
    authorName: null,
    authorOrg: null,
    isEditorsPick: true,
    downloadCount: 0,
    status: 'Approved',
    slug: 'digital-workspace-system-dws',
    productType: 'Platform',
    productStage: 'Live'
  },
  {
    id: 'static-product-dtma',
    title: 'Digital Transformation Management Academy (DTMA)',
    summary: 'A structured learning academy designed to reskill digital workers and leaders using DQ\'s transformation frameworks and real-world practices.',
    domain: 'Product',
    guideType: 'Academy',
    heroImageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3',
    lastUpdatedAt: new Date().toISOString(),
    authorName: null,
    authorOrg: null,
    isEditorsPick: true,
    downloadCount: 0,
    status: 'Approved',
    slug: 'digital-transformation-management-academy-dtma',
    productType: 'Academy',
    productStage: 'Live'
  },
  {
    id: 'static-product-dbp',
    title: 'Digital Business Platforms (DBP Assists)',
    summary: 'AI-enabled functional tools that support planning, execution, and decision-making across digital business platforms.',
    domain: 'Product',
    guideType: 'Tooling',
    heroImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3',
    lastUpdatedAt: new Date().toISOString(),
    authorName: null,
    authorOrg: null,
    isEditorsPick: true,
    downloadCount: 0,
    status: 'Approved',
    slug: 'digital-business-platforms-dbp-assists',
    productType: 'Tooling',
    productStage: 'MVP'
  },
  {
    id: 'static-product-dtmp',
    title: 'Digital Transformation Management Platform (DTMP)',
    summary: 'An enterprise platform that governs, tracks, and controls digital transformation initiatives through lifecycle management and analytics.',
    domain: 'Product',
    guideType: 'Platform',
    heroImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3',
    lastUpdatedAt: new Date().toISOString(),
    authorName: null,
    authorOrg: null,
    isEditorsPick: true,
    downloadCount: 0,
    status: 'Approved',
    slug: 'digital-transformation-management-platform-dtmp',
    productType: 'Platform',
    productStage: 'Scaling'
  },
  {
    id: 'static-product-dto4t',
    title: 'DTO4T – Digital Transformation Operating Framework',
    summary: 'A comprehensive operating framework that defines how organizations design, govern, and scale digital transformation.',
    domain: 'Product',
    guideType: 'Framework',
    heroImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3',
    lastUpdatedAt: new Date().toISOString(),
    authorName: null,
    authorOrg: null,
    isEditorsPick: true,
    downloadCount: 0,
    status: 'Approved',
    slug: 'dto4t-digital-transformation-operating-framework',
    productType: 'Framework',
    productStage: 'Live'
  },
  {
    id: 'static-product-tmaas',
    title: 'TMaaS – Transformation Management as a Service',
    summary: 'A managed service offering that provides continuous transformation leadership, governance, and execution support using DQ platforms and expertise.',
    domain: 'Product',
    guideType: 'Enablement Product',
    heroImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3',
    lastUpdatedAt: new Date().toISOString(),
    authorName: null,
    authorOrg: null,
    isEditorsPick: true,
    downloadCount: 0,
    status: 'Approved',
    slug: 'tmaas-transformation-management-as-a-service',
    productType: 'Enablement Product',
    productStage: 'Live'
  }
]

