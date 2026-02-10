import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { HomeIcon, ChevronRightIcon, BookOpen, Clock, User } from 'lucide-react'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { supabaseClient } from '../../lib/supabaseClient'
import MarkdownRenderer from '../../components/guides/MarkdownRenderer'

interface Guide {
  id: string
  title: string
  slug: string
  body: string
  summary?: string
  hero_image_url?: string
  domain?: string
  guide_type?: string
  estimated_time_min?: number
  last_updated_at?: string
}

interface Section {
  id: string
  title: string
  content: string
}

function GuideDetailsPage() {
  const { itemId } = useParams<{ itemId: string }>()
  const params = useParams()
  console.log('🔍 [GuideDetails] All URL params:', params)
  console.log('🔍 [GuideDetails] Extracted itemId:', itemId)
  
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [activeSection, setActiveSection] = useState<string>('')

  // Parse sections from guide body
  const parseSections = (body: string): Section[] => {
    const parsedSections: Section[] = []
    const lines = body.split('\n')
    let currentSection: Section | null = null
    let currentContent: string[] = []
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      // Check if line is a heading (starts with #)
      if (trimmed.startsWith('#')) {
        // Save previous section if exists
        if (currentSection) {
          currentSection.content = currentContent.join('\n')
          parsedSections.push(currentSection)
        }
        
        // Start new section - include the heading in the content
        const title = trimmed.replace(/^#+\s*/, '')
        currentSection = {
          id: title.toLowerCase().replace(/\s+/g, '-'),
          title: title,
          content: ''
        }
        // Add the heading line to content so it gets rendered
        currentContent = [line]
      } else {
        // Add content to current section
        if (currentSection) {
          currentContent.push(line)
        }
      }
    }
    
    // Add last section
    if (currentSection) {
      currentSection.content = currentContent.join('\n')
      parsedSections.push(currentSection)
    }
    
    return parsedSections
  }

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        setLoading(true)
        console.log('🔍 [GuideDetails] Fetching guide with itemId:', itemId)
        
        const { data, error: fetchError } = await supabaseClient
          .from('guides')
          .select('*')
          .eq('slug', itemId)
          .maybeSingle()
        
        console.log('🔍 [GuideDetails] Fetch result:', { data, error: fetchError })
        
        if (fetchError) throw fetchError
        
        if (data) {
          setGuide(data)
          const parsedSections = parseSections(data.body || '')
          setSections(parsedSections)
          console.log('🔍 [GuideDetails] Parsed sections:', parsedSections)
          if (parsedSections.length > 0) {
            setActiveSection(parsedSections[0].id)
          }
        } else {
          console.error('🔍 [GuideDetails] No guide found for itemId:', itemId)
          setError('Guide not found')
        }
      } catch (err: any) {
        console.error('🔍 [GuideDetails] Error fetching guide:', err)
        setError(err.message || 'Failed to load guide')
      } finally {
        setLoading(false)
      }
    }

    if (itemId) {
      fetchGuide()
    } else {
      console.error('🔍 [GuideDetails] No itemId provided')
      setError('No itemId provided')
      setLoading(false)
    }
  }, [itemId])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setActiveSection(sectionId)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error || 'Guide not found'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header toggleSidebar={() => {}} sidebarOpen={false} />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
              <li className="inline-flex items-center">
                <Link to="/" className="text-gray-600 hover:text-gray-900 inline-flex items-center">
                  <HomeIcon size={16} className="mr-1" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon size={16} className="text-gray-400" />
                  <span className="ml-1 px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-md">GHC</span>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <ChevronRightIcon size={16} className="text-gray-400" />
                  <span className="ml-1 text-gray-500 md:ml-2">{guide.title}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div 
        className="bg-cover bg-center bg-no-repeat text-white relative"
        style={{ 
          backgroundImage: `linear-gradient(rgba(3, 14, 49, 0.8), rgba(3, 14, 49, 0.8)), url('/images/guidelines-content.PNG')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="pl-20 pr-8 py-16">
          <div className="text-left">
            <h1 className="text-4xl font-bold mb-4">{guide.title}</h1>
            {guide.summary && (
              <p className="text-xl mb-8 max-w-3xl opacity-90">{guide.summary}</p>
            )}
            
            {/* Guide Meta Info */}
            <div className="flex flex-wrap gap-6 text-sm mb-8">
              {guide.estimated_time_min && (
                <div className="flex items-center">
                  <Clock size={18} className="mr-2" />
                  <span>{guide.estimated_time_min} min read</span>
                </div>
              )}
              {guide.domain && (
                <div className="flex items-center">
                  <BookOpen size={18} className="mr-2" />
                  <span>{guide.domain}</span>
                </div>
              )}
              {guide.guide_type && (
                <div className="flex items-center">
                  <User size={18} className="mr-2" />
                  <span>{guide.guide_type}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-8">
                {/* Guide Content Sections */}
                <div className="space-y-12">
                  {sections.map((section) => (
                    <section key={section.id} id={section.id} className="scroll-mt-8">
                      {/* Section Content */}
                      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                        <MarkdownRenderer body={section.content.trim()} />
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </div>

            {/* Table of Contents - Right Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default GuideDetailsPage
