import { useState, useEffect, useCallback, useRef } from 'react';
import { Search } from 'lucide-react';

type FilterStatus = 'all' | 'active' | 'eliminated';
type SortOption = 'name' | 'points' | 'status';

interface CastawayFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: FilterStatus;
  onFilterChange: (value: FilterStatus) => void;
  sortBy: SortOption;
  onSortByChange: (value: SortOption) => void;
}

/**
 * Custom hook for debouncing a value
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function CastawayFilterBar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sortBy,
  onSortByChange,
}: CastawayFilterBarProps) {
  // Local state for immediate input feedback
  const [localSearch, setLocalSearch] = useState(search);
  const isInitialMount = useRef(true);

  // Debounce the search value (300ms delay)
  const debouncedSearch = useDebounce(localSearch, 300);

  // Update parent when debounced value changes (but not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  // Keep local state in sync with external changes
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as FilterStatus;
      if (['all', 'active', 'eliminated'].includes(value)) {
        onFilterChange(value);
      }
    },
    [onFilterChange]
  );

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as SortOption;
      if (['name', 'points', 'status'].includes(value)) {
        onSortByChange(value);
      }
    },
    [onSortByChange]
  );

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search castaways by name, occupation, or hometown..."
          className="input pl-10 w-full"
          aria-label="Search castaways"
        />
      </div>
      <div className="flex gap-2">
        <select
          value={filter}
          onChange={handleFilterChange}
          className="input px-3 py-2"
          aria-label="Filter by status"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="eliminated">Eliminated</option>
        </select>
        <select
          value={sortBy}
          onChange={handleSortChange}
          className="input px-3 py-2"
          aria-label="Sort by"
        >
          <option value="name">Sort by Name</option>
          <option value="points">Sort by Points</option>
          <option value="status">Sort by Status</option>
        </select>
      </div>
    </div>
  );
}
