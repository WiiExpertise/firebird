import React from 'react';
import { Category } from '../types/locations';
import {
  FireIcon,
  BoltIcon,
  WifiIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';

interface FilterBarProps {
  visibleCategories: Record<Category, boolean>;
  onCategoryToggle: (category: Category) => void;
  onReload: () => void;
  isLoading: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  visibleCategories,
  onCategoryToggle,
  onReload,
  isLoading,
}) => {
  return (
    <section className="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50 shadow-sm flex justify-end items-center flex-shrink-0">
      <div className="flex items-center space-x-2">
        {/* Category Icon Buttons */}
        {(Object.keys(visibleCategories) as Category[]).map(cat => {
          const isActive = visibleCategories[cat];
          const Icon = {
            Wildfire: FireIcon, Hurricane: BoltIcon, Earthquake: WifiIcon, NonDisaster: CheckCircleIcon
          }[cat];
          return (
            <button
              key={cat}
              onClick={() => onCategoryToggle(cat)}
              title={cat}
              className={`p-1.5 rounded-md transition-colors ${isActive
                ? 'bg-miko-pink text-white hover:bg-miko-pink-dark'
                : 'bg-white text-gray-500 hover:bg-gray-200 border border-gray-300'
                }`}
            >
              <Icon className={`h-5 w-5 ${cat === 'Earthquake' ? 'transform rotate-45' : ''}`} />
            </button>
          );
        })}
        {/* Reload Button */}
        <button
          onClick={onReload}
          title="Reload Locations"
          className="p-1.5 rounded-md bg-white text-gray-500 hover:bg-gray-200 border border-gray-300 transition-colors"
          disabled={isLoading}
        >
          <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </section>
  );
};

export default FilterBar;
