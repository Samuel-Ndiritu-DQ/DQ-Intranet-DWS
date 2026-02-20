import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, MessageSquare, Share2, Linkedin, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Custom YouTube icon component
const YoutubeIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);
interface FooterProps {
  'data-id'?: string;
  isLoggedIn?: boolean;
}
interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
}
function AccordionSection({
  title,
  children
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  return <div className="border-b border-dq-navy/20 last:border-b-0">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full py-4 flex items-center justify-between text-left" aria-expanded={isOpen}>
        <h3 className="font-semibold text-base text-white">{title}</h3>
        {isOpen ? <ChevronUp size={20} className="text-white/70" /> : <ChevronDown size={20} className="text-white/70" />}
      </button>
      {isOpen && <div className="pb-4">{children}</div>}
    </div>;
}
export function Footer({
  'data-id': dataId,
  isLoggedIn = false
}: FooterProps) {
  const navigate = useNavigate();
  const handleFooterLinkClick = (title: string) => {
    navigate(`/workspace-link-coming-soon?title=${encodeURIComponent(title)}`);
  };
  const externalLinks = [
    {
      label: 'Viva Engage',
      href: 'https://engage.cloud.microsoft/main/feed',
      icon: MessageSquare
    },
    {
      label: 'SharePoint',
      href: 'https://arqitek.sharepoint.com/_layouts/15/sharepoint.aspx',
      icon: Share2
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/company/digitalqatalyst/posts/?feedView=all',
      icon: Linkedin
    },
    {
      label: 'YouTube',
      href: 'https://www.youtube.com/@digitalqatalyst',
      icon: YoutubeIcon
    },
    {
      label: 'DQ Corporate Website',
      href: 'https://digitalqatalyst.com/',
      icon: Globe
    }
  ];
  const forYouLinks = [
    'DQ LMS Courses',
    'Services & Requests',
    'Communities & Surveys',
    'News & Announcements'
  ];
  // Minimal App Footer (Post-login)
  if (isLoggedIn) {
    return <footer data-id={dataId} className="bg-gray-50 border-t border-gray-100 w-full h-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span>© 2026 DQ Digital Workspace. All rights reserved.</span>
            <span className="hidden sm:inline">Version v1.0</span>
          </div>
          <a href="#" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
            Support
          </a>
        </div>
      </footer>;
  }
  // Full Website Footer (Pre-login)
  return (
    <footer
      data-id={dataId}
      className="bg-dq-navy text-white w-full"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Mobile Layout */}
        <div className="block lg:hidden">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              DQ Digital
              <br />
              <span className="text-white/95">Workspace</span>
            </h2>
          </div>

          <div className="mb-8">
            <h3 className="text-white font-semibold text-lg mb-2">Perfecting Life Transactions</h3>
            <p className="text-white/90 text-sm leading-relaxed">
              Stay updated with the latest digital transformation insights, solutions, and innovations from DigitalQatalyst.
            </p>
          </div>

          <div className="mb-8">
            <AccordionSection title="For You">
              <ul className="space-y-2 pt-1">
                <li>
                  <a
                    href="/lms"
                    className="text-white/90 hover:text-white transition-colors text-sm block py-2 border-b border-white/5 last:border-0"
                  >
                    Learning Center
                  </a>
                </li>
                {forYouLinks
                  .filter((label) => label !== 'DQ LMS Courses')
                  .map((label) => (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => handleFooterLinkClick(label)}
                        className="text-white/90 hover:text-white transition-colors text-sm block text-left w-full py-2 border-b border-white/5 last:border-0"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
              </ul>
            </AccordionSection>
            <AccordionSection title="Find Us">
              <ul className="space-y-2 pt-1">
                {externalLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/90 hover:text-white transition-colors text-sm flex items-center gap-2 py-2 border-b border-white/5 last:border-0"
                      >
                        <Icon size={16} className="opacity-70" />
                        {item.label}
                        <ExternalLink size={14} className="opacity-70 ml-auto" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </AccordionSection>
          </div>

          <div className="pt-6 border-t border-white/10 text-center space-y-1">
            <p className="text-white/60 text-xs">
              © 2026 DQ Digital Workspace. All rights reserved.
            </p>
            <p className="text-white/50 text-xs">Version v1.0</p>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-3 gap-16 mb-10">
            {/* Logo + Newsletter */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                DQ Digital
                <br />
                <span className="text-white/95">Workspace</span>
              </h2>
              <div>
                <h3 className="text-white font-semibold text-base mb-2">Perfecting Life Transactions</h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  Stay updated with the latest digital transformation insights, solutions, and innovations from DigitalQatalyst.
                </p>
              </div>
            </div>

            {/* For You */}
            <div>
              <h3 className="font-semibold text-base text-white mb-5 pb-2 border-b border-dq-coral/40 w-fit">
                For You
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/lms"
                    className="text-white/85 hover:text-white text-sm transition-colors inline-block hover:underline underline-offset-2"
                  >
                    Learning Center
                  </a>
                </li>
                {forYouLinks
                  .filter((label) => label !== 'DQ LMS Courses')
                  .map((label) => (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => handleFooterLinkClick(label)}
                        className="text-white/85 hover:text-white text-sm text-left transition-colors hover:underline underline-offset-2"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Find Us */}
            <div>
              <h3 className="font-semibold text-base text-white mb-5 pb-2 border-b border-dq-coral/40 w-fit">
                Find Us
              </h3>
              <ul className="space-y-3">
                {externalLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/85 hover:text-white text-sm inline-flex items-center gap-2 transition-colors hover:underline underline-offset-2 group"
                      >
                        <Icon size={16} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                        {item.label}
                        <ExternalLink size={14} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex items-center justify-between">
            <p className="text-white/60 text-sm">
              © 2026 DQ Digital Workspace. All rights reserved.
            </p>
            <p className="text-white/50 text-sm">Version v1.0</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
