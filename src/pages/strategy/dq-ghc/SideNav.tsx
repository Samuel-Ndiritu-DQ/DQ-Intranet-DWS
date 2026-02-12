import React, { useEffect, useState } from 'react'

interface Section {
  id: string
  label: string
}

interface SideNavProps {
  sections?: Section[]
  activeSection?: string
  onSectionClick?: (sectionId: string) => void
}

// Fallback sections if none provided
const defaultSections: Section[] = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'why-ghc-exists', label: 'Why the GHC Exists' },
  { id: 'seven-competencies', label: 'The 7 Competencies of the GHC' },
  { id: 'how-ghc-shapes-you', label: 'How the GHC Shapes You' },
  { id: 'how-work-flows', label: 'How Work Flows at DQ' },
  { id: 'your-role-as-qatalyst', label: 'Your Role as a Qatalyst' },
]

export function SideNav({ sections = defaultSections, activeSection, onSectionClick }: SideNavProps) {
  const [currentSection, setCurrentSection] = useState(activeSection || sections[0]?.id || 'overview')

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('id')
          if (sectionId) {
            setCurrentSection(sectionId)
          }
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    sections.forEach((section) => {
      const element = document.getElementById(section.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [sections])

  useEffect(() => {
    if (activeSection) {
      setCurrentSection(activeSection)
    }
  }, [activeSection])

  const handleClick = (sectionId: string) => {
    setCurrentSection(sectionId)
    onSectionClick?.(sectionId)
    
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (sections.length === 0) {
    return null
  }

  return (
    <nav className="sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto filter-sidebar-scroll">
      <div className="pr-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Contents
        </h3>
        <ul className="space-y-2">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => handleClick(section.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  currentSection === section.id
                    ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

