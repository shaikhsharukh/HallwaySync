import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { ProfessionalRole } from '../../types/database';

export interface DirectoryFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedRole: ProfessionalRole | null;
  onRoleSelect: (role: ProfessionalRole | null) => void;
  selectedSkill: string | null;
  onSkillSelect: (skill: string | null) => void;
  availableOnly: boolean;
  onAvailableToggle: () => void;
  skillCounts: Array<{ tag: string; count: number }>;
}

const ROLES: ProfessionalRole[] = [
  'Frontend',
  'Backend',
  'Fullstack',
  'AI/ML',
  'Mobile',
  'UI/UX',
  'Product',
  'Founder',
];

export const DirectoryFilters: React.FC<DirectoryFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedRole,
  onRoleSelect,
  selectedSkill,
  onSkillSelect,
  availableOnly,
  onAvailableToggle,
  skillCounts,
}) => {
  return (
    <div className="space-y-3">
      {/* Search Bar + Available Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search attendees, skills, or roles..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full min-h-[44px] pl-10 pr-9 bg-surface-card border border-surface-border rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="min-h-[44px] min-w-[44px] absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={onAvailableToggle}
          className={`min-h-[44px] px-3.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold select-none transition-all ${
            availableOnly
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm'
              : 'bg-surface-card border-surface-border text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-500'
          }`}
          title="Filter attendees available right now"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              availableOnly ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
            }`}
          />
          <span className="hidden sm:inline">Available</span>
        </button>
      </div>

      {/* Role Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => onRoleSelect(null)}
          className={`min-h-[38px] px-3 rounded-lg text-xs font-medium border shrink-0 transition-colors ${
            selectedRole === null
              ? 'bg-brand-500 text-slate-950 font-semibold border-brand-500'
              : 'bg-surface-card border-surface-border text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          All Roles
        </button>
        {ROLES.map((role) => {
          const isSelected = selectedRole === role;
          return (
            <button
              key={role}
              onClick={() => onRoleSelect(isSelected ? null : role)}
              className={`min-h-[38px] px-3 rounded-lg text-xs font-medium border shrink-0 transition-colors ${
                isSelected
                  ? 'bg-brand-500 text-slate-950 font-semibold border-brand-500 shadow-emerald'
                  : 'bg-surface-card border-surface-border text-slate-700 dark:text-slate-300 hover:border-slate-500'
              }`}
            >
              {role}
            </button>
          );
        })}
      </div>

      {/* Top Skills Cloud */}
      {skillCounts.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Tags:
          </span>
          {skillCounts.slice(0, 10).map(({ tag, count }) => {
            const isSelected = selectedSkill === tag;
            return (
              <button
                key={tag}
                onClick={() => onSkillSelect(isSelected ? null : tag)}
                className={`min-h-[32px] px-2.5 py-1 rounded-md text-[11px] font-medium border shrink-0 flex items-center gap-1 transition-all ${
                  isSelected
                    ? 'bg-brand-500/20 text-brand-700 dark:text-brand-300 border-brand-500/40 font-semibold'
                    : 'bg-surface-raised text-slate-600 dark:text-slate-400 border-surface-border hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-500'
                }`}
              >
                <span>{tag}</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold">{count}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
