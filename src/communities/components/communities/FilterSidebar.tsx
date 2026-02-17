import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
export interface FilterOption {
  id: string;
  name: string;
}
export interface FilterConfig {
  id: string;
  title: string;
  options: FilterOption[];
}
interface AccordionSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}
export interface FilterSidebarProps {
  filters: Record<string, string>;
  filterConfig: FilterConfig[];
  onFilterChange: (filterType: string, value: string) => void;
  onResetFilters: () => void;
  isResponsive?: boolean;
}
const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  isOpen,
  onToggle,
  children
}) => {
  return <div className="border-b border-gray-100 py-3">
      <button className="flex w-full justify-between items-center text-left font-medium text-gray-900 py-2 hover:text-gray-700 transition-colors" onClick={onToggle} type="button">
        <span>{title}</span>
        <ChevronDown
          size={16}
          className={`text-gray-500 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="pt-1">
          {children}
        </div>
      </div>
    </div>;
};
export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  filterConfig,
  onFilterChange,
  onResetFilters,
  isResponsive = false
}) => {
  // Initialize openSections based on filterConfig, and update when filterConfig changes
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    // Initialize all sections as collapsed (false) by default
    const initialSections: Record<string, boolean> = {};
    filterConfig.forEach(config => {
      initialSections[config.id] = false;
    });
    setOpenSections(prev => {
      // Merge with existing state to preserve user's open/close preferences
      const merged = { ...initialSections };
      filterConfig.forEach(config => {
        if (prev[config.id] !== undefined) {
          merged[config.id] = prev[config.id];
        }
      });
      return merged;
    });
  }, [filterConfig]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const textSizeClass = 'text-sm';
  const spacingClass = isResponsive ? 'space-y-1' : 'space-y-2';
  
  // Don't render if no filter config
  if (!filterConfig || filterConfig.length === 0) {
    return <div className="text-sm text-gray-500">Loading filters...</div>;
  }
  
  return <div className="space-y-0">
      {filterConfig.map(config => {
        // Only render if there are options
        if (!config.options || config.options.length === 0) {
          return null;
        }
        
        return (
          <AccordionSection 
            key={config.id} 
            title={config.title} 
            isOpen={openSections[config.id] || false} 
            onToggle={() => toggleSection(config.id)}
          >
            <div className={spacingClass}>
              {config.options.map(option => (
                <div key={option.id} className="flex items-center">
                  <input 
                    type="checkbox" 
                    id={`${config.id}-${option.id}`} 
                    checked={filters[config.id] === option.name} 
                    onChange={() => onFilterChange(config.id, option.name)} 
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                  />
                  <label 
                    htmlFor={`${config.id}-${option.id}`} 
                    className={`ml-2 ${textSizeClass} text-gray-700 cursor-pointer`}
                  >
                    {option.name}
                  </label>
                </div>
              ))}
            </div>
          </AccordionSection>
        );
      })}
    </div>;
};