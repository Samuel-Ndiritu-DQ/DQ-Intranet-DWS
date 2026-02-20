import React from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { ArrowLeft, Check, ArrowRight } from 'lucide-react'
import { useAuth } from '../../components/Header/context/AuthContext'
import { glossaryTerms, GlossaryTerm, CATEGORIES, categoryColors } from './glossaryData'
import { agile6xdTerms } from './agile6xdGlossaryData'

const GlossaryTermDetailPage: React.FC = () => {
  const { user } = useAuth()
  const { termId } = useParams<{ termId: string }>()
  const navigate = useNavigate()

  // Search in both glossary data sources and determine which one it came from
  const termFromGHC = glossaryTerms.find(t => t.id === termId)
  const termFrom6xD = agile6xdTerms.find(t => t.id === termId)
  const term = termFromGHC || termFrom6xD
  
  // Determine back navigation path based on term source
  const backPath = termFrom6xD ? '/marketplace/guides/glossary/6xd' : '/marketplace/guides/glossary/browse'

  if (!term) {
    return (
      <div className="min-h-screen flex flex-col bg-white guidelines-theme">
        <Header toggleSidebar={() => undefined} sidebarOpen={false} />
        <main className="container mx-auto px-4 py-8 flex-grow max-w-7xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Term not found</h1>
            <Link
              to="/marketplace/guides/glossary/browse"
              className="text-[var(--guidelines-primary)] hover:underline"
            >
              Back to Glossary
            </Link>
          </div>
        </main>
        <Footer isLoggedIn={!!user} />
      </div>
    )
  }

  const category = CATEGORIES.find(c => term.categories.includes(c.id)) || CATEGORIES[0]
  const colorClass = categoryColors[category.color] || categoryColors.gray
  const allTerms = [...glossaryTerms, ...agile6xdTerms]
  const relatedTerms = term.relatedTerms
    ? allTerms.filter(t => term.relatedTerms?.includes(t.id))
    : []
  
  // DWS-specific content
  const isDWS = term.id === 'dws'
  
  // For DWS, use DQ-specific content; otherwise use examples
  const whatIsDWSInDQ = isDWS ? "Within DigitalQatalyst, DWS is not just a platform—it is the operational backbone of how work gets done. DWS acts as the single, governed workspace where DQ associates execute tasks, access services, collaborate, learn, and stay aligned with organizational priorities. It connects people, work, and platforms under a unified experience, ensuring execution across DQ is structured, visible, and outcome-driven." : null
  
  const purpose = isDWS 
    ? "The purpose of DWS is to simplify the employee experience by reducing fragmentation across tools and processes. It acts as a single source of truth where associates can discover services, submit requests, access learning resources, stay informed, and collaborate—without switching between platforms."
    : (term.examples && term.examples.length > 0 ? term.examples[0] : null)
  
  const valuePoints = isDWS
    ? [
        "Improving productivity through centralized access to tools, requests, and information",
        "Reducing cognitive load by eliminating the need to remember where systems and services live",
        "Ensuring consistency in how associates interact with internal services",
        "Accelerating onboarding through a guided, role-aware workspace",
        "Enabling scale by allowing new services, AI tools, and marketplaces to be added seamlessly"
      ]
    : (term.examples && term.examples.length > 1 ? term.examples.slice(1) : [])

  return (
    <div className="min-h-screen flex flex-col bg-white guidelines-theme">
      <Header toggleSidebar={() => undefined} sidebarOpen={false} />
      <main className="container mx-auto px-4 py-8 flex-grow max-w-4xl">
        {/* Back Button - Light gray style */}
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center text-gray-500 hover:text-gray-700 mb-6 text-sm transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to all terms
        </button>

        {/* Category Tag */}
        <div className="mb-4">
          <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium border ${colorClass} bg-gray-50`}>
            {category.label}
          </span>
        </div>

        {/* Term Title - Large dark blue */}
        <h1 className="text-4xl font-bold text-[#162862] mb-4">{term.term}</h1>

        {/* Explanation */}
        <p className="text-base text-gray-700 leading-relaxed mb-6">{term.explanation}</p>

        {/* Tags */}
        {term.tags && term.tags.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {term.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* What is DWS in DQ? Section (DWS only) */}
        {whatIsDWSInDQ && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#162862] mb-3">What is DWS in DQ?</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <p className="text-sm text-gray-700 leading-relaxed">{whatIsDWSInDQ}</p>
            </div>
          </div>
        )}

        {/* Purpose Section */}
        {purpose && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#162862] mb-3">Purpose</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <p className="text-sm text-gray-700 leading-relaxed">{purpose}</p>
            </div>
          </div>
        )}

        {/* Value Section */}
        {valuePoints.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#162862] mb-4">Value</h2>
            <div className="space-y-3">
              {valuePoints.map((value, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <Check className="h-5 w-5 text-[#e95139] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 leading-relaxed flex-1">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Examples Section - Hidden for DWS (foundational platform) */}
        {term.examples && term.examples.length > 0 && !isDWS && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#162862] mb-4">Examples</h2>
            <div className="space-y-3">
              {term.examples.map((example, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full border border-gray-200 bg-white flex items-center justify-center text-xs font-semibold text-gray-500 flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed flex-1">{example}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Terms */}
        {relatedTerms.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-[#162862] mb-4">Related Terms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedTerms.map(relatedTerm => {
                const relatedCategory =
                  CATEGORIES.find(c => relatedTerm.categories.includes(c.id)) || CATEGORIES[0]
                // Split term into title and subtitle (first word vs rest)
                const termParts = relatedTerm.term.split(' ')
                const title = termParts[0]
                const subtitle = termParts.slice(1).join(' ')
                return (
                  <Link
                    key={relatedTerm.id}
                    to={`/marketplace/guides/glossary/${relatedTerm.id}`}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-5 hover:bg-gray-100 transition-all block group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 mb-0.5 group-hover:text-[#162862] transition-colors">
                          {title}
                        </h3>
                        {subtitle && (
                          <p className="text-sm text-gray-600 mb-2">
                            {subtitle}
                          </p>
                        )}
                        <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                          {relatedTerm.explanation}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#162862] transition-colors flex-shrink-0 mt-0.5" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </main>
      <Footer isLoggedIn={!!user} />
    </div>
  )
}

export default GlossaryTermDetailPage
