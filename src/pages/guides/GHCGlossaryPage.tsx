import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { HomeIcon, ChevronRightIcon } from 'lucide-react';
import { SearchBar } from '../../components/SearchBar';
import { useAuth } from '../../components/Header/context/AuthContext';

interface GlossaryTerm {
  id: string;
  title: string;
  meaning: string;
  level: 'Awareness' | 'Practitioner' | 'Leadership';
  description: string;
  expectedBehaviors: string[];
  whereApplies: string[];
  imageUrl?: string;
  longDescription?: string;
  examples?: string[];
  relatedTerms?: string[];
}

// GHC glossary data - all 7 Golden Honeycomb Components
const SAMPLE_GHC_TERMS: GlossaryTerm[] = [
  {
    id: 'dq-vision-purpose',
    title: 'The DQ Vision (Purpose)',
    meaning: 'Defines why DQ exists and the outcomes digital transformation must deliver.',
    level: 'Leadership',
    description: 'Defines why DQ exists and the outcomes digital transformation must deliver.',
    expectedBehaviors: [
      'Strategic intent & purpose',
      'Outcome-driven transformation',
      'Alignment across initiatives'
    ],
    whereApplies: ['Vision', 'Purpose', 'Outcomes']
  },
  {
    id: 'hov-house-of-value-culture',
    title: 'HoV — House of Value (Culture)',
    meaning: 'Establishes how value is created, measured, and sustained through culture.',
    level: 'Leadership',
    description: 'Establishes how value is created, measured, and sustained through culture.',
    expectedBehaviors: [
      'Value dimensions',
      'Cultural alignment',
      'Decision prioritization'
    ],
    whereApplies: ['Culture', 'Value', 'Alignment']
  },
  {
    id: 'persona-identity',
    title: 'Persona (Identity)',
    meaning: 'Defines roles, responsibilities, and identity across the DQ ecosystem.',
    level: 'Practitioner',
    description: 'Defines roles, responsibilities, and identity across the DQ ecosystem.',
    expectedBehaviors: [
      'Associate personas',
      'Capability expectations',
      'Role clarity'
    ],
    whereApplies: ['Identity', 'Roles', 'Capability']
  },
  {
    id: 'agile-tms-ways-of-working',
    title: 'Agile TMS (Ways of Working)',
    meaning: 'Defines how work is structured, executed, and continuously improved at DQ.',
    level: 'Practitioner',
    description: 'Defines how work is structured, executed, and continuously improved at DQ.',
    expectedBehaviors: [
      'Task & sprint models',
      'Working Rooms (WRs)',
      'Collaboration rituals'
    ],
    whereApplies: ['Ways of Working', 'Execution', 'Delivery']
  },
  {
    id: 'agile-sos-governance',
    title: 'Agile SoS (Governance)',
    meaning: 'Ensures governance, discipline, and alignment without slowing execution.',
    level: 'Leadership',
    description: 'Ensures governance, discipline, and alignment without slowing execution.',
    expectedBehaviors: [
      'Systems of Governance',
      'Quality & discipline',
      'Risk & compliance'
    ],
    whereApplies: ['Governance', 'Discipline', 'Quality']
  },
  {
    id: 'agile-flows-value-streams',
    title: 'Agile Flows (Value Streams)',
    meaning: 'Designs how value flows from idea to delivery across DQ.',
    level: 'Practitioner',
    description: 'Designs how value flows from idea to delivery across DQ.',
    expectedBehaviors: [
      'Value stream mapping',
      'Flow efficiency',
      'Outcome alignment'
    ],
    whereApplies: ['Value Streams', 'Flow', 'Outcomes']
  },
  {
    id: 'agile-6xd-products',
    title: 'Agile 6×D (Products)',
    meaning: 'Defines how digital products are designed, built, and scaled at DQ.',
    level: 'Practitioner',
    description: 'Defines how digital products are designed, built, and scaled at DQ.',
    expectedBehaviors: [
      'Product lifecycle',
      'Platforms & architecture',
      'Continuous delivery'
    ],
    whereApplies: ['Products', 'Platforms', '6×D']
  }
];
const LEVELS = ['Awareness', 'Practitioner', 'Leadership'] as const;

// Level color mapping for visual distinction
const LEVEL_COLORS = {
  'Awareness': '#fbbf24', // amber
  'Practitioner': '#3b82f6', // blue
  'Leadership': '#8b5cf6' // purple
};

export function GlossaryGHCPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const filteredTerms = useMemo(() => {
    return SAMPLE_GHC_TERMS.filter(term => {
      const matchesSearch = searchQuery === '' || 
        term.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLevel = selectedLevel === 'all' || term.level === selectedLevel;

      return matchesSearch && matchesLevel;
    });
  }, [searchQuery, selectedLevel]);

  const handleViewTerm = (termId: string) => {
    navigate(`/marketplace/guides/glossary/ghc/${termId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white guidelines-theme">
      <Header toggleSidebar={() => undefined} sidebarOpen={false} />
      <main className="container mx-auto px-4 py-8 flex-grow max-w-7xl">
        {/* Breadcrumbs */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
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
                <Link to="/marketplace/guides?tab=resources" className="ml-1 text-gray-600 hover:text-gray-900 md:ml-2">
                  Resources
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon size={16} className="text-gray-400" />
                <Link to="/marketplace/guides/glossary" className="ml-1 text-gray-600 hover:text-gray-900 md:ml-2">
                  Glossary
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon size={16} className="text-gray-400" />
                <span className="ml-1 text-gray-500 md:ml-2">GHC</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Golden Honeycomb Competences (GHC)
          </h1>
          <p className="text-lg text-gray-600">
            DQ's core competences for growth, execution, and mastery
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search GHC competences..."
            ariaLabel="Search GHC competences"
          />
        </div>

        {/* Main Content Layout with Sidebar */}
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Filter Sidebar - Left Side */}
          <div className="xl:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                {selectedLevel !== 'all' && (
                  <button
                    onClick={() => {
                      setSelectedLevel('all');
                    }}
                    className="text-sm text-[var(--guidelines-primary)] hover:text-[var(--guidelines-primary-dark)] font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Level Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Level</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="level"
                      value="all"
                      checked={selectedLevel === 'all'}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="h-4 w-4 border-gray-300 text-[var(--guidelines-primary)] focus:ring-[var(--guidelines-primary)]"
                    />
                    <span className="ml-2 text-sm text-gray-700">All Levels</span>
                  </label>
                  {LEVELS.map(level => (
                    <label key={level} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="level"
                        value={level}
                        checked={selectedLevel === level}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="h-4 w-4 border-gray-300 text-[var(--guidelines-primary)] focus:ring-[var(--guidelines-primary)]"
                      />
                      <span className="ml-2 text-sm text-gray-700 flex items-center">
                        <span 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: LEVEL_COLORS[level] }}
                        />
                        {level}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area - Right Side */}
          <div className="flex-1 xl:w-3/4">
            {/* Glossary Terms - Card Grid */}
            {filteredTerms.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-lg">No terms found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTerms.map((term) => {
                  const levelColor = LEVEL_COLORS[term.level];
                  const imageUrl = term.imageUrl || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop';

                  return (
                    <div
                      key={term.id}
                      className="flex flex-col h-full w-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200"
                    >
                      {/* Image */}
                      <div className="relative h-44 bg-gray-200 overflow-hidden flex-shrink-0">
                        <img
                          src={imageUrl}
                          alt={term.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Card Content */}
                      <div className="flex flex-col flex-1 p-6">
                        {/* Level Badge */}
                        <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                          <span 
                            className="px-3 py-1 text-xs font-semibold text-white rounded-full"
                            style={{ backgroundColor: levelColor }}
                          >
                            {term.level}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug flex-shrink-0 line-clamp-2">
                          {term.title}
                        </h3>

                        {/* Description - Full visible, no truncation */}
                        <div className="mb-4 flex-grow">
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {term.meaning}
                          </p>
                        </div>

                        {/* Where it applies - visible on card, all tags */}
                        <div className="mb-4 flex-shrink-0">
                          {term.whereApplies && term.whereApplies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {term.whereApplies.map((place, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700"
                                >
                                  {place}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* View Button - aligned at bottom */}
                        <div className="mt-auto flex-shrink-0">
                          <button
                            onClick={() => handleViewTerm(term.id)}
                            className="w-full px-4 py-3 bg-dq-navy text-white rounded-lg font-medium hover:bg-dq-navy/90 transition-colors text-center text-sm"
                            style={{ minHeight: '48px' }}
                          >
                            View {term.title.split(' (')[0]}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer isLoggedIn={!!user} />
    </div>
  );
}

export default GlossaryGHCPage;
