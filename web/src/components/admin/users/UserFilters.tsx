import { Search } from 'lucide-react';

interface UserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
}

export function UserFilters({ 
  search, 
  onSearchChange, 
  roleFilter, 
  onRoleFilterChange 
}: UserFiltersProps) {
  return (
    <div className="flex gap-2 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search users..."
          className="input pl-10"
        />
      </div>
      <select
        value={roleFilter}
        onChange={(e) => onRoleFilterChange(e.target.value)}
        className="input px-3 py-2 w-36"
      >
        <option value="all">All Roles</option>
        <option value="player">Players</option>
        <option value="commissioner">League Creators</option>
        <option value="admin">Admins</option>
      </select>
    </div>
  );
}
