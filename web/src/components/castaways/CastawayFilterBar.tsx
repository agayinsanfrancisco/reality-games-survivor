import { Search } from 'lucide-react';

interface CastawayFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: 'all' | 'active' | 'eliminated';
  onFilterChange: (value: 'all' | 'active' | 'eliminated') => void;
  sortBy: 'name' | 'points' | 'status';
  onSortByChange: (value: 'name' | 'points' | 'status') => void;
}

export function CastawayFilterBar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sortBy,
  onSortByChange
}: CastawayFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search castaways by name, occupation, or hometown..."
          className="input pl-10 w-full"
        />
      </div>
      <div className="flex gap-2">
        <select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value as any)}
          className="input px-3 py-2"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="eliminated">Eliminated</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as any)}
          className="input px-3 py-2"
        >
          <option value="name">Sort by Name</option>
          <option value="points">Sort by Points</option>
          <option value="status">Sort by Status</option>
        </select>
      </div>
    </div>
  );
}
