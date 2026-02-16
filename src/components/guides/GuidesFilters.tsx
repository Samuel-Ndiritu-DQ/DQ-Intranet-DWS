import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { parseCsv, toCsv } from '../../utils/guides'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { 
  KNOWLEDGE_SYSTEMS, 
  GHC_DIMENSIONS, 
  GHC_TERM_TYPES, 
  SIX_XD_DIMENSIONS, 
  SIX_XD_TERM_TYPES,
  TERM_ORIGINS,
  USED_IN, 
  WHO_USES_IT, 
  ALPHABET 
} from '../../pages/guides/glossaryFilters'

type Facet = { id: string; name: string; count?: number }
export interface GuidesFacets {
  domain?: Facet[]
  sub_domain?: Facet[]
  guide_type?: Facet[]
  unit?: Facet[]
  location?: Facet[]
  status?: Facet[]
}

const LABEL_OVERRIDES: Record<string, string> = {
  'digital-framework': 'Digital Framework (6xD)',
  'design-systems': 'Design Systems (xDS)',
  'dbp': 'DBP',
  'dxp': 'DXP',
  'dws': 'DWS',
  'devops': 'DevOps',
};

interface Props {
  facets: GuidesFacets
  query: URLSearchParams
  onChange: (next: URLSearchParams) => void
  activeTab: 'guidelines' | 'strategy' | 'blueprints' | 'testimonials' | 'glossary' | 'faqs'
}
type ActiveTab = Props['activeTab']

const TESTIMONIAL_CATEGORIES: Facet[] = [
  { id: 'journey-transformation-story', name: 'Journey / Transformation Story' },
  { id: 'case-study', name: 'Case Study' },
  { id: 'leadership-reflection', name: 'Leadership Reflection' },
  { id: 'client-partner-reference', name: 'Client / Partner Reference' },
  { id: 'team-employee-experience', name: 'Team / Employee Experience' },
  { id: 'milestone-achievement', name: 'Milestone / Achievement' }
]

const TESTIMONIAL_UNITS: Facet[] = [
  { id: 'deals', name: 'Deals' },
  { id: 'dq-delivery-accounts', name: 'DQ Delivery (Accounts)' },
  { id: 'dq-delivery-deploys', name: 'DQ Delivery (Deploys)' },
  { id: 'dq-delivery-designs', name: 'DQ Delivery (Designs)' },
  { id: 'finance', name: 'Finance' },
  { id: 'hra', name: 'HRA' },
  { id: 'intelligence', name: 'Intelligence' },
  { id: 'products', name: 'Products' },
  { id: 'secdevops', name: 'SecDevOps' },
  { id: 'solutions', name: 'Solutions' },
  { id: 'stories', name: 'Stories' }
]

const TESTIMONIAL_LOCATIONS: Facet[] = [
  { id: 'DXB', name: 'DXB' },
  { id: 'KSA', name: 'KSA' },
  { id: 'NBO', name: 'NBO' }
]

const GUIDELINES_GUIDE_TYPES: Facet[] = [
  { id: 'best-practice', name: 'Best Practice' },
  { id: 'policy', name: 'Policy' },
  { id: 'process', name: 'Process' },
  { id: 'sop', name: 'SOP' }
]

const GUIDELINES_UNITS: Facet[] = [
  { id: 'deals', name: 'Deals' },
  { id: 'dq-delivery-accounts', name: 'DQ Delivery (Accounts)' },
  { id: 'dq-delivery-deploys', name: 'DQ Delivery (Deploys)' },
  { id: 'dq-delivery-designs', name: 'DQ Delivery (Designs)' },
  { id: 'finance', name: 'Finance' },
  { id: 'hra', name: 'HRA' },
  { id: 'intelligence', name: 'Intelligence' },
  { id: 'products', name: 'Products' },
  { id: 'secdevops', name: 'SecDevOps' },
  { id: 'solutions', name: 'Solutions' },
  { id: 'stories', name: 'Stories' }
]

const GUIDELINES_LOCATIONS: Facet[] = [
  { id: 'DXB', name: 'DXB' },
  { id: 'KSA', name: 'KSA' },
  { id: 'NBO', name: 'NBO' }
]

const GUIDELINES_CATEGORIES: Facet[] = [
  { id: 'resources', name: 'Resources' },
  { id: 'policies', name: 'Policies' },
  { id: 'xds', name: 'xDS (Design Systems)' }
]

const BLUEPRINT_GUIDE_TYPES: Facet[] = [
  { id: 'best-practice', name: 'Best Practice' },
  { id: 'policy', name: 'Policy' },
  { id: 'process', name: 'Process' },
  { id: 'sop', name: 'SOP' }
]

const BLUEPRINT_UNITS: Facet[] = [
  { id: 'deals', name: 'Deals' },
  { id: 'dq-delivery-accounts', name: 'DQ Delivery (Accounts)' },
  { id: 'dq-delivery-deploys', name: 'DQ Delivery (Deploys)' },
  { id: 'dq-delivery-designs', name: 'DQ Delivery (Designs)' },
  { id: 'finance', name: 'Finance' },
  { id: 'hra', name: 'HRA' },
  { id: 'intelligence', name: 'Intelligence' },
  { id: 'products', name: 'Products' },
  { id: 'secdevops', name: 'SecDevOps' },
  { id: 'solutions', name: 'Solutions' },
  { id: 'stories', name: 'Stories' }
]

const BLUEPRINT_LOCATIONS: Facet[] = [
  { id: 'DXB', name: 'DXB' },
  { id: 'KSA', name: 'KSA' },
  { id: 'NBO', name: 'NBO' }
]

const BLUEPRINT_FRAMEWORKS: Facet[] = [
  { id: 'devops', name: 'DevOps' },
  { id: 'dbp', name: 'DBP' },
  { id: 'dxp', name: 'DXP' },
  { id: 'dws', name: 'DWS' },
  { id: 'products', name: 'Products' },
  { id: 'projects', name: 'Projects' }
]

const BLUEPRINT_SECTORS: Facet[] = [
  { id: 'farming-4.0', name: 'Farming 4.0' },
  { id: 'government-4.0', name: 'Government 4.0' },
  { id: 'hospitality-4.0', name: 'Hospitality 4.0' },
  { id: 'infrastructure-4.0', name: 'Infrastructure 4.0' },
  { id: 'logistics-4.0', name: 'Logistics 4.0' },
  { id: 'plant-4.0', name: 'Plant 4.0' },
  { id: 'retail-4.0', name: 'Retail 4.0' },
  { id: 'service-4.0', name: 'Service 4.0' },
  { id: 'wellness-4.0', name: 'Wellness 4.0' }
]

const STRATEGY_LOCATIONS: Facet[] = [
  { id: 'DXB', name: 'DXB' },
  { id: 'KSA', name: 'KSA' },
  { id: 'NBO', name: 'NBO' }
]

// Tab-specific cleanup rules to keep URL params compatible when switching sections
const TAB_KEYS_TO_DELETE: Record<ActiveTab, string[]> = {
  strategy: ['guide_type', 'sub_domain', 'domain'],
  blueprints: ['guide_type', 'sub_domain', 'unit', 'domain'],
  testimonials: ['guide_type', 'sub_domain', 'domain'],
  guidelines: [],
  glossary: [],
  faqs: [],
}

const TAB_ALLOWED_LOCATIONS: Partial<Record<ActiveTab, string[]>> = {
  strategy: STRATEGY_LOCATIONS.map((opt) => opt.id),
  blueprints: BLUEPRINT_LOCATIONS.map((opt) => opt.id),
  testimonials: TESTIMONIAL_LOCATIONS.map((opt) => opt.id),
}

const shouldCleanupTab = (tab: ActiveTab) =>
  tab === 'strategy' || tab === 'blueprints' || tab === 'testimonials'

const buildCleanedParams = (activeTab: ActiveTab, query: URLSearchParams) => {
  const next = new URLSearchParams(query.toString())
  let changed = false

  const keysToDelete = TAB_KEYS_TO_DELETE[activeTab] ?? []
  keysToDelete.forEach((key) => {
    if (next.has(key)) {
      next.delete(key)
      changed = true
    }
  })

  const allowedLocationIds = TAB_ALLOWED_LOCATIONS[activeTab]
  if (allowedLocationIds) {
    const current = parseCsv(next.get('location'))
    const filtered = current.filter((val) => allowedLocationIds.includes(val))
    if (filtered.length !== current.length) {
      changed = true
      if (filtered.length) next.set('location', filtered.join(','))
      else next.delete('location')
    }
  }

  return { next, changed }
}

const STRATEGY_UNITS: Facet[] = [
  { id: 'deals', name: 'Deals' },
  { id: 'dq-delivery-accounts', name: 'DQ Delivery (Accounts)' },
  { id: 'dq-delivery-deploys', name: 'DQ Delivery (Deploys)' },
  { id: 'dq-delivery-designs', name: 'DQ Delivery (Designs)' },
  { id: 'finance', name: 'Finance' },
  { id: 'hra', name: 'HRA' },
  { id: 'intelligence', name: 'Intelligence' },
  { id: 'products', name: 'Products' },
  { id: 'secdevops', name: 'SecDevOps' },
  { id: 'solutions', name: 'Solutions' },
  { id: 'stories', name: 'Stories' }
]

const STRATEGY_TYPES: Facet[] = [
  { id: 'journey', name: 'Journey' },
  { id: 'history', name: 'History' },
  { id: 'initiatives', name: 'Initiatives' },
  { id: 'cases', name: 'Cases' },
  { id: 'references', name: 'References' }
]

const STRATEGY_FRAMEWORKS: Facet[] = [
  { id: 'ghc', name: 'GHC' },
  { id: '6xd', name: '6xD (Digital Framework)' },
  { id: 'clients', name: 'Clients' },
  { id: 'ghc-leader', name: 'GHC Leader' },
  { id: 'testimonials-insights', name: 'Testimonials/Insights' }
]

const Section: React.FC<{ idPrefix: string; title: string; category: string; collapsed: boolean; onToggle: (category: string) => void }> = ({ idPrefix, title, category, collapsed, onToggle, children }) => {
  const contentId = `${idPrefix}-filters-${category}`
  return (
    <div className="border-b border-gray-100 pb-3 mb-3">
      <button
        type="button"
        className="w-full flex items-center justify-between text-left"
        onClick={() => onToggle(category)}
        aria-expanded={!collapsed}
        aria-controls={contentId}
      >
        <h3 className="font-medium text-gray-900">{title}</h3>
        {collapsed ? <ChevronRight size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
      </button>
      <div id={contentId} className={`${collapsed ? 'hidden' : 'mt-2'}`}>
        <div className="space-y-2">{children}</div>
      </div>
    </div>
  )
}

const CheckboxList: React.FC<{ idPrefix: string; name: string; options: Facet[]; query: URLSearchParams; onChange: (n: URLSearchParams)=>void }> = ({ idPrefix, name, options, query, onChange }) => {
  const selected = new Set(parseCsv(query.get(name)))
  const formatLabel = (value: string) => {
    const override = LABEL_OVERRIDES[value.toLowerCase()] ?? LABEL_OVERRIDES[value];
    if (override) return override;
    return value
      .replace(/[_-]+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }
  const toggle = (id: string) => {
    const next = new URLSearchParams(query.toString())
    const values = new Set(parseCsv(next.get(name)))
    if (values.has(id)) values.delete(id); else values.add(id)
    next.set(name, toCsv(Array.from(values)))
    if (next.get(name) === '') next.delete(name)
    onChange(next)
  }
  const handleCheckboxChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    toggle(id)
  }
  return (
    <div className="space-y-1">
      {options.map((opt, idx) => {
        const id = `${idPrefix}-${name}-${idx}`
        const checked = selected.has(opt.id)
        const labelText = formatLabel(opt.name)
        return (
          <div key={opt.id} className="flex items-center">
            <input type="checkbox" id={id} checked={checked} onChange={(e) => handleCheckboxChange(opt.id, e)} className="h-4 w-4 rounded border-gray-300 text-[var(--guidelines-primary)] focus:ring-[var(--guidelines-primary)] accent-[var(--guidelines-primary)] cursor-pointer" aria-label={`${name} ${labelText}`} />
            <label htmlFor={id} className="ml-2 text-sm text-gray-700">
              {labelText}
            </label>
          </div>
        )
      })}
    </div>
  )
}

export const GuidesFilters: React.FC<Props> = ({ facets, query, onChange, activeTab }) => {
  const instanceId = useId()
  const isStrategySelected = activeTab === 'strategy'
  const isBlueprintSelected = activeTab === 'blueprints'
  const isTestimonialsSelected = activeTab === 'testimonials'
  const isGuidelinesSelected = activeTab === 'guidelines'
  const isGlossarySelected = activeTab === 'glossary'
  const isResourcesSelected = activeTab === 'resources'
  const prevTabRef = useRef<typeof activeTab>(activeTab)
  const clearAll = () => {
    const next = new URLSearchParams()
    onChange(next)
  }
  // Persist collapsed categories in URL param 'collapsed' as CSV; also keep local state to avoid cross-instance glitches
  const initialCollapsed = useMemo(() => {
    const fromUrl = parseCsv(query.get('collapsed'))
    return new Set(fromUrl.length > 0 ? fromUrl : ['guide_type', 'sub_domain', 'unit', 'location', 'testimonial_category'])
  }, [query])
  const [collapsedSet, setCollapsedSet] = useState<Set<string>>(initialCollapsed)
  // Keep local collapsed state in sync if URL changes from outside
  useEffect(() => {
    const next = new Set(parseCsv(query.get('collapsed')))
    if (next.size > 0) setCollapsedSet(next)
  }, [query])
  // Clean up incompatible filters when switching tabs (only run on actual tab change, not on query changes)
  useEffect(() => {
    if (prevTabRef.current === activeTab) return
    prevTabRef.current = activeTab
    if (!shouldCleanupTab(activeTab)) return

    const { next, changed } = buildCleanedParams(activeTab, query)
    if (changed) onChange(next)
  }, [activeTab, query, onChange])
  const toggleCollapsed = (key: string) => {
    const nextSet = new Set(collapsedSet)
    if (nextSet.has(key)) nextSet.delete(key); else nextSet.add(key)
    setCollapsedSet(nextSet)
    // reflect in URL
    const next = new URLSearchParams(query.toString())
    const value = Array.from(nextSet).join(',')
    if (value) next.set('collapsed', value); else next.delete('collapsed')
    onChange(next)
  }
  return (
    <div className="bg-white rounded-lg shadow p-4 sticky top-24 max-h-[70vh] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} aria-label="Guides filters">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button onClick={clearAll} className="text-[var(--guidelines-primary)] text-sm font-medium">Clear all</button>
      </div>
      {isGlossarySelected ? (() => {
        const selectedKnowledgeSystems = parseCsv(query.get('glossary_knowledge_system'))
        const hasGHC = selectedKnowledgeSystems.includes('ghc')
        const has6xD = selectedKnowledgeSystems.includes('6xd')
        const hasAnySystem = hasGHC || has6xD

        return (
          <>
            {/* PRIMARY FILTER: Knowledge System */}
            <Section idPrefix={instanceId} title="Knowledge System" category="glossary_knowledge_system" collapsed={collapsedSet.has('glossary_knowledge_system')} onToggle={toggleCollapsed}>
              <CheckboxList idPrefix={instanceId} name="glossary_knowledge_system" options={KNOWLEDGE_SYSTEMS} query={query} onChange={onChange} />
            </Section>

            {/* SECONDARY FILTERS: GHC (shown only when GHC is selected) */}
            {hasGHC && (
              <>
                <Section idPrefix={instanceId} title="GHC Dimension" category="glossary_ghc_dimension" collapsed={collapsedSet.has('glossary_ghc_dimension')} onToggle={toggleCollapsed}>
                  <CheckboxList idPrefix={instanceId} name="glossary_ghc_dimension" options={GHC_DIMENSIONS} query={query} onChange={onChange} />
                </Section>
                <Section idPrefix={instanceId} title="GHC Term Type" category="glossary_ghc_term_type" collapsed={collapsedSet.has('glossary_ghc_term_type')} onToggle={toggleCollapsed}>
                  <CheckboxList idPrefix={instanceId} name="glossary_ghc_term_type" options={GHC_TERM_TYPES} query={query} onChange={onChange} />
                </Section>
              </>
            )}

            {/* SECONDARY FILTERS: 6xD (shown only when 6xD is selected) */}
            {has6xD && (
              <>
                <Section idPrefix={instanceId} title="6xD Dimension" category="glossary_6xd_dimension" collapsed={collapsedSet.has('glossary_6xd_dimension')} onToggle={toggleCollapsed}>
                  <CheckboxList idPrefix={instanceId} name="glossary_6xd_dimension" options={SIX_XD_DIMENSIONS} query={query} onChange={onChange} />
                </Section>
                <Section idPrefix={instanceId} title="6xD Term Type" category="glossary_6xd_term_type" collapsed={collapsedSet.has('glossary_6xd_term_type')} onToggle={toggleCollapsed}>
                  <CheckboxList idPrefix={instanceId} name="glossary_6xd_term_type" options={SIX_XD_TERM_TYPES} query={query} onChange={onChange} />
                </Section>
              </>
            )}

            {/* SHARED FILTERS (visible after GHC or 6xD selected) */}
            {hasAnySystem && (
              <>
                <Section idPrefix={instanceId} title="Term Origin" category="glossary_term_origin" collapsed={collapsedSet.has('glossary_term_origin')} onToggle={toggleCollapsed}>
                  <CheckboxList idPrefix={instanceId} name="glossary_term_origin" options={TERM_ORIGINS} query={query} onChange={onChange} />
                </Section>
                <Section idPrefix={instanceId} title="Used In" category="glossary_used_in" collapsed={collapsedSet.has('glossary_used_in')} onToggle={toggleCollapsed}>
                  <CheckboxList idPrefix={instanceId} name="glossary_used_in" options={USED_IN} query={query} onChange={onChange} />
                </Section>
                <Section idPrefix={instanceId} title="Who Uses It" category="glossary_who_uses_it" collapsed={collapsedSet.has('glossary_who_uses_it')} onToggle={toggleCollapsed}>
                  <CheckboxList idPrefix={instanceId} name="glossary_who_uses_it" options={WHO_USES_IT} query={query} onChange={onChange} />
                </Section>
                <Section idPrefix={instanceId} title="Alphabetical" category="glossary_letter" collapsed={collapsedSet.has('glossary_letter')} onToggle={toggleCollapsed}>
                  <div className="flex flex-wrap gap-2">
                    {ALPHABET.map(letter => {
                      const selected = parseCsv(query.get('glossary_letter')).includes(letter)
                      return (
                        <button
                          key={letter}
                          onClick={() => {
                            const next = new URLSearchParams(query.toString())
                            const values = new Set(parseCsv(next.get('glossary_letter')))
                            if (values.has(letter)) {
                              values.delete(letter)
                            } else {
                              values.add(letter)
                            }
                            if (values.size > 0) {
                              next.set('glossary_letter', toCsv(Array.from(values)))
                            } else {
                              next.delete('glossary_letter')
                            }
                            onChange(next)
                          }}
                          className={`
                            w-8 h-8 rounded text-xs font-medium transition-colors
                            ${selected 
                              ? 'bg-[var(--guidelines-primary)] text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
                          `}
                        >
                          {letter}
                        </button>
                      )
                    })}
                  </div>
                </Section>
              </>
            )}
          </>
        )
      })() : isBlueprintSelected ? (
        <>
          <Section idPrefix={instanceId} title="Sector" category="blueprint_sector" collapsed={collapsedSet.has('blueprint_sector')} onToggle={toggleCollapsed}>
            <CheckboxList idPrefix={instanceId} name="blueprint_sector" options={BLUEPRINT_SECTORS} query={query} onChange={onChange} />
          </Section>
          <Section idPrefix={instanceId} title="Framework" category="blueprint_framework" collapsed={collapsedSet.has('blueprint_framework')} onToggle={toggleCollapsed}>
            <CheckboxList idPrefix={instanceId} name="blueprint_framework" options={BLUEPRINT_FRAMEWORKS} query={query} onChange={onChange} />
          </Section>
        </>
      ) : isGuidelinesSelected ? (
        <>
          <Section idPrefix={instanceId} title="Category" category="guidelines_category" collapsed={collapsedSet.has('guidelines_category')} onToggle={toggleCollapsed}>
            <CheckboxList idPrefix={instanceId} name="guidelines_category" options={GUIDELINES_CATEGORIES} query={query} onChange={onChange} />
          </Section>
        </>
      ) : isResourcesSelected ? (
        <Section idPrefix={instanceId} title="Guide Type" category="guide_type" collapsed={collapsedSet.has('guide_type')} onToggle={toggleCollapsed}>
          <CheckboxList idPrefix={instanceId} name="guide_type" options={GUIDELINES_GUIDE_TYPES} query={query} onChange={onChange} />
        </Section>
      ) : !(isStrategySelected || isBlueprintSelected || isTestimonialsSelected) && facets.guide_type && facets.guide_type.length > 0 && (
        <Section idPrefix={instanceId} title="Guide Type" category="guide_type" collapsed={collapsedSet.has('guide_type')} onToggle={toggleCollapsed}>
          <CheckboxList idPrefix={instanceId} name="guide_type" options={facets.guide_type || []} query={query} onChange={onChange} />
        </Section>
      )}
      {!isGlossarySelected && (
        <>
          {isBlueprintSelected ? (
            <Section idPrefix={instanceId} title="Units" category="unit" collapsed={collapsedSet.has('unit')} onToggle={toggleCollapsed}>
              <CheckboxList idPrefix={instanceId} name="unit" options={BLUEPRINT_UNITS} query={query} onChange={onChange} />
            </Section>
          ) : isStrategySelected ? (
            <Section idPrefix={instanceId} title="Units" category="unit" collapsed={collapsedSet.has('unit')} onToggle={toggleCollapsed}>
              <CheckboxList idPrefix={instanceId} name="unit" options={STRATEGY_UNITS} query={query} onChange={onChange} />
            </Section>
          ) : isGuidelinesSelected ? (
            <Section idPrefix={instanceId} title="Units" category="unit" collapsed={collapsedSet.has('unit')} onToggle={toggleCollapsed}>
              <CheckboxList idPrefix={instanceId} name="unit" options={GUIDELINES_UNITS} query={query} onChange={onChange} />
            </Section>
          ) : isTestimonialsSelected ? (
            <Section idPrefix={instanceId} title="Units" category="unit" collapsed={collapsedSet.has('unit')} onToggle={toggleCollapsed}>
              <CheckboxList idPrefix={instanceId} name="unit" options={TESTIMONIAL_UNITS} query={query} onChange={onChange} />
            </Section>
          ) : (
            <Section idPrefix={instanceId} title="Units" category="unit" collapsed={collapsedSet.has('unit')} onToggle={toggleCollapsed}>
              <CheckboxList idPrefix={instanceId} name="unit" options={facets.unit || []} query={query} onChange={onChange} />
            </Section>
          )}
        </>
      )}
      {isTestimonialsSelected && (
        <Section idPrefix={instanceId} title="Story Type" category="testimonial_category" collapsed={collapsedSet.has('testimonial_category')} onToggle={toggleCollapsed}>
          <CheckboxList idPrefix={instanceId} name="testimonial_category" options={TESTIMONIAL_CATEGORIES} query={query} onChange={onChange} />
        </Section>
      )}
      {isStrategySelected && (
        <>
          <Section idPrefix={instanceId} title="Strategy Type" category="strategy_type" collapsed={collapsedSet.has('strategy_type')} onToggle={toggleCollapsed}>
            <CheckboxList idPrefix={instanceId} name="strategy_type" options={STRATEGY_TYPES} query={query} onChange={onChange} />
          </Section>
          <Section idPrefix={instanceId} title="Framework/Program" category="strategy_framework" collapsed={collapsedSet.has('strategy_framework')} onToggle={toggleCollapsed}>
            <CheckboxList idPrefix={instanceId} name="strategy_framework" options={STRATEGY_FRAMEWORKS} query={query} onChange={onChange} />
          </Section>
        </>
      )}
      {!isGlossarySelected && (
        <>
          {isBlueprintSelected ? (
            <Section idPrefix={instanceId} title="Location" category="location" collapsed={collapsedSet.has('location')} onToggle={toggleCollapsed}>
              <CheckboxList idPrefix={instanceId} name="location" options={BLUEPRINT_LOCATIONS} query={query} onChange={onChange} />
            </Section>
          ) : isStrategySelected ? (
            <Section idPrefix={instanceId} title="Location" category="location" collapsed={collapsedSet.has('location')} onToggle={toggleCollapsed}>
              <CheckboxList idPrefix={instanceId} name="location" options={STRATEGY_LOCATIONS} query={query} onChange={onChange} />
            </Section>
          ) : isGuidelinesSelected ? (
            <Section idPrefix={instanceId} title="Location" category="location" collapsed={collapsedSet.has('location')} onToggle={toggleCollapsed}>
              <CheckboxList idPrefix={instanceId} name="location" options={GUIDELINES_LOCATIONS} query={query} onChange={onChange} />
            </Section>
          ) : isTestimonialsSelected ? (
            <Section idPrefix={instanceId} title="Location" category="location" collapsed={collapsedSet.has('location')} onToggle={toggleCollapsed}>
              <CheckboxList idPrefix={instanceId} name="location" options={TESTIMONIAL_LOCATIONS} query={query} onChange={onChange} />
            </Section>
          ) : (
            <Section idPrefix={instanceId} title="Location" category="location" collapsed={collapsedSet.has('location')} onToggle={toggleCollapsed}>
              <CheckboxList idPrefix={instanceId} name="location" options={facets.location || []} query={query} onChange={onChange} />
            </Section>
          )}
        </>
      )}
    </div>
  )
}

export default GuidesFilters
