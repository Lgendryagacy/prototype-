import React from 'react';
import { Search } from 'lucide-react';
import PhysicalFogJobGlassCard from './PhysicalFogJobGlassCard';

interface PhysicalFogJobSearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: {
    country: string;
    category: string;
    experience: string;
    sort: string;
  };
  setFilters: (filters: any) => void;
  availableCountries?: string[];
  availableCategories?: string[];
}

const PhysicalFogJobSearchFilters: React.FC<PhysicalFogJobSearchFiltersProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  filters, 
  setFilters,
  availableCountries = [],
  availableCategories = []
}) => (
  <PhysicalFogJobGlassCard className="p-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Search Input */}
      <div className="lg:col-span-2 relative">
        <Search 
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" 
          style={{ color: 'var(--color-text-secondary)' }} 
        />
        <input
          type="text"
          placeholder="Search jobs, companies, skills..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm focus:outline-none focus:ring-2 transition-all font-medium"
          style={{ 
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)'
          }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Country Filter */}
      <select
        className="px-4 py-3 rounded-xl border-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm focus:outline-none focus:ring-2 transition-all font-medium"
        style={{ 
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }}
        value={filters.country}
        onChange={(e) => setFilters({ ...filters, country: e.target.value })}
      >
        <option value="">All Countries</option>
        {availableCountries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>

      {/* Category Filter */}
      <select
        className="px-4 py-3 rounded-xl border-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm focus:outline-none focus:ring-2 transition-all font-medium"
        style={{ 
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }}
        value={filters.category}
        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
      >
        <option value="">All Categories</option>
        {availableCategories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      {/* Sort Filter */}
      <select
        className="px-4 py-3 rounded-xl border-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm focus:outline-none focus:ring-2 transition-all font-medium"
        style={{ 
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }}
        value={filters.sort}
        onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
      >
        <option value="newest">Newest First</option>
        <option value="salary-high">Highest Paying</option>
      </select>
    </div>
  </PhysicalFogJobGlassCard>
);

export default PhysicalFogJobSearchFilters;