/**
 * SearchBar Component
 *
 * A reusable search input component with clear functionality.
 * Matches the design of the Communities marketplace search bar.
 */

import { Search, X } from 'lucide-react';
/**
 * Props for the SearchBar component
 */
interface SearchBarProps {
  /** Current search query value */
  searchQuery: string;
  /** Function to update the search query */
  setSearchQuery: (query: string) => void;
  /** Optional placeholder text */
  placeholder?: string;
}

/**
 * SearchBar Component
 *
 * @param props - Component props
 * @returns A search input with clear button matching Communities design
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  placeholder = 'Search...'
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex h-10 w-full rounded-md border border-gray-300 bg-white pl-10 pr-10 py-2 text-sm text-gray-700 placeholder:text-gray-500 hover:border-brand-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:border-brand-teal transition-all"
        aria-label="Search"
      />
      {searchQuery && (
        <button
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          onClick={() => setSearchQuery('')}
          aria-label="Clear search"
        >
          <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  );
};
