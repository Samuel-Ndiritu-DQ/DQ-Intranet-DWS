export interface Product {
  id: string;
  name: string;
  what: string;
  why: string;
  cta: string;
  classId: string;
}

export interface ProductClass {
  id: string;
  label: string;
  name: string;
  shortName: string;
  color: string;
}

export const PRODUCT_CLASSES: ProductClass[] = [
  { id: 'class-01', label: 'Class 01', name: 'Delivery Services', shortName: 'DBP', color: 'indigo' },
  { id: 'class-02', label: 'Class 02', name: 'Delivery Products', shortName: 'DT2.0', color: 'blue' },
  { id: 'class-03', label: 'Class 03', name: 'Insight Products', shortName: 'DCO', color: 'teal' },
  { id: 'class-04', label: 'Class 04', name: 'Transaction Platforms', shortName: 'TxM', color: 'violet' },
];

export const PRODUCTS: Product[] = [
  { id: 'plant-4.0', name: 'Plant 4.0', what: 'Industrial operations platform for connected, data-driven plants.', why: 'Unifies performance, energy, automation, and OT security into one execution workspace.', cta: 'Open Plant 4.0', classId: 'class-01' },
  { id: 'dtmp', name: 'DTMP', what: 'Data-driven platform to manage and steer transformation programmes.', why: 'Centralises portfolio, analytics, governance, and delivery in one execution view.', cta: 'Open DTMP', classId: 'class-02' },
  { id: 'tmaas', name: 'TMaaS', what: 'Self-service marketplace of reusable transformation initiatives and accelerators.', why: 'Launches delivery faster with standardised blueprints and consistent execution patterns.', cta: 'Open TMaaS', classId: 'class-02' },
  { id: 'dto4t', name: 'DTO4T', what: 'AI-driven transformation clinic that diagnoses maturity and prescribes next steps.', why: 'Reduces cost and failure by making transformation repeatable and data-led.', cta: 'Open DTO4T', classId: 'class-02' },
  { id: 'dtmi', name: 'DTMI | DQ Web', what: 'Insight publishing platform for transformation knowledge and perspectives.', why: 'Turns scattered content into structured intelligence for better decisions.', cta: 'Open DTMI', classId: 'class-03' },
  { id: 'dtma', name: 'DTMA', what: 'Academy delivering practice-based learning for transformation roles.', why: 'Builds capability without slowing execution—learning stays close to real work.', cta: 'Open DTMA', classId: 'class-03' },
  { id: 'dtmb', name: 'DTMB (6xD)', what: 'Book playbooks that codify Agile 6xD execution.', why: 'Keeps teams aligned on the same delivery discipline, language, and patterns.', cta: 'Open DTMB (6xD)', classId: 'class-03' },
  { id: 'dtmc', name: 'DTMC (GHC)', what: 'Book playbooks that codify the GHC competency system.', why: 'Protects alignment across culture, governance, and execution as complexity grows.', cta: 'Open DTMC (GHC)', classId: 'class-03' },
  { id: 'txm-b2b2c', name: 'TxM (B2B2C)', what: 'Transaction platform for consumer and experience ecosystems.', why: 'Makes execution scalable across high-volume journeys and service interactions.', cta: 'Open TxM (B2B2C)', classId: 'class-04' },
  { id: 'txm-b2b2b', name: 'TxM (B2B2B)', what: 'Transaction platform for transformation and enterprise ecosystems.', why: 'Standardises handoffs and execution across partners, teams, and enterprise workflows.', cta: 'Open TxM (B2B2B)', classId: 'class-04' },
];

// Product detail data for Product Details pages
// Each product includes comprehensive information for the detail view

export interface ProductDetail {
  slug: string
  name: string
  tagline: string
  description: string
  productType: string
  productStage: string
  whatItIs: string
  whyItMatters: string
  includes: string[]
  usedIn: string[]
  imageUrl?: string
  // Enhanced content sections
  overview?: string
  purposeAndValue?: string
  scopeAndCapabilities?: string[]
  howItsUsed?: {
    internal?: string[]
    delivery?: string[]
    client?: string[]
  }
  governanceAndOwnership?: string
  relatedAssets?: Array<{
    type: 'guideline' | 'knowledge' | 'platform' | 'learning'
    title: string
    url: string
  }>
}

export const PRODUCT_DETAILS: Record<string, ProductDetail> = {
  'digital-workspace-system-dws': {
    slug: 'digital-workspace-system-dws',
    name: 'Digital Workspace System (DWS)',
    tagline: 'A unified digital workspace platform that centralizes tools, knowledge, services, and collaboration',
    description: 'A unified digital workspace platform that centralizes tools, knowledge, services, and collaboration to enable productivity and execution across DQ.',
    productType: 'Platform',
    productStage: 'Live',
    whatItIs: 'A unified digital workspace platform that brings together tools, knowledge, services, and collaboration into a single execution environment.',
    whyItMatters: 'DWS reduces tool sprawl, improves visibility, and enables consistent execution across teams and engagements.',
    includes: [
      'Knowledge Center',
      'Services Marketplace',
      'Work Directory',
      'News & Communications',
      'AI-assisted search (future)'
    ],
    usedIn: [
      'Internal DQ delivery',
      'Employee productivity',
      'Client digital workspace builds'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  'digital-transformation-management-academy-dtma': {
    slug: 'digital-transformation-management-academy-dtma',
    name: 'Digital Transformation Management Academy (DTMA)',
    tagline: 'A structured learning academy designed to reskill digital workers and leaders',
    description: 'A structured learning academy designed to reskill digital workers and leaders using DQ\'s transformation frameworks and real-world practices.',
    productType: 'Academy',
    productStage: 'Live',
    whatItIs: 'A structured learning academy designed to reskill digital workers and leaders using DQ\'s 6xD frameworks and real-world transformation practices.',
    whyItMatters: 'DTMA builds transformation capability across DQ, ensuring consistent execution and enabling teams to deliver measurable outcomes.',
    includes: [
      'Transformation frameworks training',
      'Real-world case studies',
      'Hands-on practice exercises',
      'Certification pathways',
      'Continuous learning resources'
    ],
    usedIn: [
      'Digital worker upskilling',
      'Transformation leadership development',
      'Client transformation enablement',
      'Internal capability building'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  'digital-business-platforms-dbp-assists': {
    slug: 'digital-business-platforms-dbp-assists',
    name: 'Digital Business Platforms (DBP Assists)',
    tagline: 'AI-enabled functional tools that support planning, execution, and decision-making',
    description: 'AI-enabled functional tools that support planning, execution, and decision-making across digital business platforms.',
    productType: 'Tooling',
    productStage: 'MVP',
    whatItIs: 'AI-enabled functional tools that support planning, execution, and decision-making across digital business platforms.',
    whyItMatters: 'DBP Assists accelerate delivery, improve decision quality, and reduce manual effort across digital business platform initiatives.',
    includes: [
      'Planning assistants',
      'Execution tools',
      'Decision support systems',
      'AI-powered insights',
      'Integration capabilities'
    ],
    usedIn: [
      'Digital business platform delivery',
      'Planning and execution workflows',
      'Client platform implementations'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  'digital-transformation-management-platform-dtmp': {
    slug: 'digital-transformation-management-platform-dtmp',
    name: 'Digital Transformation Management Platform (DTMP)',
    tagline: 'An enterprise platform that governs, tracks, and controls digital transformation initiatives',
    description: 'An enterprise platform that governs, tracks, and controls digital transformation initiatives through lifecycle management and analytics.',
    productType: 'Platform',
    productStage: 'Scaling',
    whatItIs: 'An enterprise platform that governs, tracks, and controls digital transformation initiatives through lifecycle management and analytics.',
    whyItMatters: 'DTMP provides visibility, governance, and control across transformation initiatives, enabling data-driven decisions and consistent execution.',
    includes: [
      'Initiative lifecycle management',
      'Progress tracking and analytics',
      'Governance frameworks',
      'Reporting dashboards',
      'Integration with DQ platforms'
    ],
    usedIn: [
      'Enterprise transformation programs',
      'Portfolio management',
      'Client transformation governance',
      'Internal initiative tracking'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  'dto4t-digital-transformation-operating-framework': {
    slug: 'dto4t-digital-transformation-operating-framework',
    name: 'DTO4T – Digital Transformation Operating Framework',
    tagline: 'A comprehensive operating framework that defines how organizations design, govern, and scale digital transformation',
    description: 'A comprehensive operating framework that defines how organizations design, govern, and scale digital transformation.',
    productType: 'Framework',
    productStage: 'Live',
    whatItIs: 'A comprehensive operating framework that defines how organizations design, govern, and scale digital transformation.',
    whyItMatters: 'DTO4T provides a consistent approach to transformation, ensuring alignment, reducing risk, and enabling scalable execution across DQ.',
    includes: [
      'Transformation design principles',
      'Governance models',
      'Scaling methodologies',
      'Best practices library',
      'Implementation guides'
    ],
    usedIn: [
      'Transformation program design',
      'Governance establishment',
      'Scaling initiatives',
      'Client transformation frameworks'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  'tmaas-transformation-management-as-a-service': {
    slug: 'tmaas-transformation-management-as-a-service',
    name: 'TMaaS – Transformation Management as a Service',
    tagline: 'A managed service offering that provides continuous transformation leadership, governance, and execution support',
    description: 'A managed service offering that provides continuous transformation leadership, governance, and execution support using DQ platforms and expertise.',
    productType: 'Enablement Product',
    productStage: 'Live',
    whatItIs: 'A managed service offering that provides continuous transformation leadership, governance, and execution support using DQ platforms and expertise.',
    whyItMatters: 'TMaaS enables organizations to access DQ transformation expertise and platforms as a service, reducing time-to-value and ensuring consistent execution.',
    includes: [
      'Transformation leadership',
      'Governance and oversight',
      'Execution support',
      'Platform access',
      'Continuous improvement'
    ],
    usedIn: [
      'Client transformation services',
      'Managed transformation programs',
      'Ongoing transformation support',
      'Platform-as-a-service offerings'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3'
  }
}

// Helper function to get product by slug
export function getProductBySlug(slug: string): ProductDetail | null {
  return PRODUCT_DETAILS[slug] || null
}

// Get all product slugs
export function getAllProductSlugs(): string[] {
  return Object.keys(PRODUCT_DETAILS)
}
