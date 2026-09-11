'use client';

import { CATEGORY_LABELS, type CategoryType } from '@/types/database';

export type TypeFilter = 'all' | 'question' | 'issue' | 'feature_request';
export type StatusFilter = 'all' | 'open' | 'answered' | 'in_review' | 'fixed' | 'closed';

export interface BrowseFilters {
  search: string;
  type: TypeFilter;
  status: StatusFilter;
  category: CategoryType | 'all';
}

export default function SearchFilters({
  filters,
  onChange,
}: {
  filters: BrowseFilters;
  onChange: (filters: BrowseFilters) => void;
}) {
  return (
    <div className="card flex flex-col gap-3 p-4">
      <input
        placeholder="Search questions, issues, and feature requests…"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        className="w-full"
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <select value={filters.type} onChange={(e) => onChange({ ...filters, type: e.target.value as TypeFilter })}>
          <option value="all">All Types</option>
          <option value="question">Questions</option>
          <option value="issue">Issues</option>
          <option value="feature_request">Feature Requests</option>
        </select>

        <select value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value as StatusFilter })}>
          <option value="all">Any Status</option>
          <option value="open">Open</option>
          <option value="answered">Answered</option>
          <option value="in_review">In Review</option>
          <option value="fixed">Fixed</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value as CategoryType | 'all' })}
          className="col-span-2 sm:col-span-2"
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
