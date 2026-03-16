import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, ChevronRight, CheckCircle } from 'lucide-react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { getDesignSystemItemById } from '../../utils/designSystemData';

export const DesignSystemDetailPage: React.FC = () => {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'details' | 'outcomes' | 'curriculum' | 'reviews'>('details');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const item = cardId ? getDesignSystemItemById(cardId) : null;

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Design System Not Found</h1>
            <p className="text-gray-600 mb-6">The design system you're looking for doesn't exist.</p>
            <Link
              to="/marketplace/design-system"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a1628] text-white rounded-lg hover:bg-[#162238] transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Design Systems
            </Link>
          </div>
        </main>
        <Footer isLoggedIn={false} />
      </div>
    );
  }

  const getFrameworkName = (type: string) => {
    switch (type) {
      case 'cids': return 'Content Intelligence Design System';
      case 'vds': return 'Video Design System';
      case 'cds': return 'Campaign Design System';
      default: return 'Design System';
    }
  };

  const getFrameworkShortName = (type: string) => {
    switch (type) {
      case 'cids': return 'CI.DS';
      case 'vds': return 'V.DS';
      case 'cds': return 'C.DS';
      default: return 'DS';
    }
  };

  const handleViewDetails = () => {
    // Navigate to the appropriate service detail page with table of contents based on the design system type
    switch (item.type) {
      case 'vds':
        navigate('/marketplace/vds-service-detail');
        break;
      case 'cds':
        navigate('/marketplace/cds-service-detail');
        break;
      case 'cids':
        navigate('/marketplace/cids-service-detail');
        break;
      default:
        // Fallback to the framework page if type is not recognized
        navigate(`/marketplace/design-system/${cardId}/framework`);
        break;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      
      <main className="flex-1">
        {/* Hero Section - Dark Navy Blue */}
        <div className="bg-gradient-to-r from-blue-950 to-blue-900 text-white relative overflow-hidden">
          {/* White gradient fade at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent z-20"></div>
          
          <div className="relative z-10">
            {/* Breadcrumb */}
            <div className="px-4 sm:px-6 lg:px-8 pt-6">
              <nav className="flex items-center space-x-2 text-white/80 text-sm">
                <Home size={16} />
                <ChevronRight size={16} />
                <Link to="/marketplace/design-system" className="hover:text-white transition-colors">
                  Design Systems
                </Link>
                <ChevronRight size={16} />
                <span className="text-white">{item.title}</span>
              </nav>
            </div>

            {/* Hero Content - Card Container */}
            <div className="px-4 sm:px-6 lg:px-8 py-8">
              <div className="w-full bg-blue-900/40 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl mx-auto" style={{ maxWidth: 'calc(100vw - 4rem)' }}>
                {/* Course Badge */}
                <div className="inline-flex items-center px-3 py-1 bg-white/20 rounded text-sm font-medium mb-6">
                  FRAMEWORK
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {getFrameworkName(item.type)} ({getFrameworkShortName(item.type)})
                </h1>

                {/* Description */}
                <p className="text-lg text-white/90 mb-8 max-w-2xl">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Content */}
            <div className="flex-1">
              {/* Navigation Tabs */}
              <div className="border-b border-gray-200 mb-8">
                <nav className="flex space-x-8">
                  {[
                    { id: 'details', label: 'Course Details' },
                    { id: 'outcomes', label: 'Learning Outcomes' },
                    { id: 'curriculum', label: 'Curriculum' },
                    { id: 'reviews', label: 'Reviews' }
                  ].map((tabItem) => (
                    <button
                      key={tabItem.id}
                      onClick={() => setActiveTab(tabItem.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tabItem.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tabItem.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === 'details' && (
                <div className="space-y-8">
                  {/* Framework Overview */}
                  <div>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Get to know how we work. This course explores the {getFrameworkName(item.type)}: 
                      our organizational DNA. It is the shared language that guides how we think, collaborate, 
                      and make decisions across DQ. Designed for every associate, this self-paced guide helps 
                      you understand our unique culture and put these principles into practice for better 
                      teamwork and execution every day.
                    </p>
                  </div>

                  {/* Course Highlights */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 border-l-4 border-pink-500 pl-4">
                      Course Highlights
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
                        <div>
                          <p className="text-gray-700">
                            <strong>Explore the Framework:</strong> A complete guide to the {getFrameworkShortName(item.type)} ({getFrameworkName(item.type)}).
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
                        <div>
                          <p className="text-gray-700">
                            <strong>Flexible Learning:</strong> Enjoy short, focused video lessons at your own pace.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
                        <div>
                          <p className="text-gray-700">
                            <strong>Real Application:</strong> Practical checks to help you lock in your learning.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'outcomes' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Learning Outcomes</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
                      <p className="text-gray-700">Understand the core principles of {getFrameworkShortName(item.type)} framework</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
                      <p className="text-gray-700">Apply design system guidelines in real-world projects</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
                      <p className="text-gray-700">Collaborate effectively using shared design language</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
                      <p className="text-gray-700">Maintain consistency across all design deliverables</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'curriculum' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Curriculum</h2>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Module 1: Introduction to {getFrameworkShortName(item.type)}</h3>
                      <p className="text-gray-600 text-sm mb-2">Understanding the fundamentals and core principles</p>
                      <span className="text-xs text-gray-500">15 minutes</span>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Module 2: Design Components</h3>
                      <p className="text-gray-600 text-sm mb-2">Exploring the component library and usage guidelines</p>
                      <span className="text-xs text-gray-500">20 minutes</span>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Module 3: Implementation Guidelines</h3>
                      <p className="text-gray-600 text-sm mb-2">Best practices for implementing the design system</p>
                      <span className="text-xs text-gray-500">15 minutes</span>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Module 4: Collaboration & Workflow</h3>
                      <p className="text-gray-600 text-sm mb-2">Working effectively with teams using the framework</p>
                      <span className="text-xs text-gray-500">10 minutes</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
                  <div className="text-center py-12">
                    <p className="text-gray-500">No reviews yet. Be the first to review this course!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:w-80">
              <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                <h3 className="font-semibold text-gray-900 mb-4">Course Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">1hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lessons</span>
                    <span className="font-medium">9 lessons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level</span>
                    <span className="font-medium">L0. Starting (Learning)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Modules</span>
                    <span className="font-medium">1 module</span>
                  </div>
                </div>

                <button 
                  onClick={handleViewDetails}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors mb-4"
                >
                  Start Course →
                </button>
              </div>
            </div>
          </div>

          {/* Related Courses - Full width below the main content */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Related Courses</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Browse all courses →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Related Course Cards */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">COURSE</div>
                <h3 className="font-semibold text-gray-900 mb-2">Data Governance Essentials</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Learn the foundations of data governance policies and frameworks across the enterprise.
                </p>
                <button className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                  Read more →
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">COURSE</div>
                <h3 className="font-semibold text-gray-900 mb-2">Effective Communication at DQ</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Build stronger communication skills aligned with DQ's collaboration competencies.
                </p>
                <button className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                  Read more →
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">COURSE</div>
                <h3 className="font-semibold text-gray-900 mb-2">Innovation Mindset Workshop</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Develop creative problem-solving techniques rooted in DQ's innovation framework.
                </p>
                <button className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                  Read more →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer isLoggedIn={false} />
    </div>
  );
};

export default DesignSystemDetailPage;