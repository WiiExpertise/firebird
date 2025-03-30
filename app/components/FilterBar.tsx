import React from 'react';
import { Category } from '../types/locations';
import {
  FireIcon,
  BoltIcon,
  WifiIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  FaceFrownIcon,
  MinusCircleIcon,
  EllipsisHorizontalCircleIcon,
  PlusCircleIcon,
  FaceSmileIcon,
} from '@heroicons/react/24/solid';

import Slider from 'rc-slider';
const iconSize = 'h-5 w-5 text-miko-pink-dark';
const marks = {
  '-1': {
    label: <FaceFrownIcon className={iconSize} />,
  },
  '-0.5': {
    label: <MinusCircleIcon className={iconSize} />,
  },
  '0': {
    label: <EllipsisHorizontalCircleIcon className={iconSize} />,
  },
  '0.5': {
    label: <PlusCircleIcon className={iconSize} />,
  },
  '1': {
    label: <FaceSmileIcon className={iconSize} />,
  },
};

import 'rc-slider/assets/index.css'
const sliderStyles = {
  track: {
    backgroundColor: '#E8C5CB',
  },
  rail: {
    backgroundColor: '#F8E4E8',
  },
  handle: {
    backgroundColor: '#E8C5CB',
    borderColor: '#D8AAB4',
    opacity: 1,
  },
};

interface FilterBarProps {
  visibleCategories: Record<Category, boolean>;
  onCategoryToggle: (category: Category) => void;
  onReload: () => void;
  isLoading: boolean;
  sentimentRange: [number, number] | null; // null means filter is off (full range)
  onSentimentRangeChange: (value: [number, number] | null) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  visibleCategories,
  onCategoryToggle,
  onReload,
  isLoading,
  sentimentRange,
  onSentimentRangeChange,
}) => {

  // Handler for slider change (fires continuously during drag)
  const handleSliderChange = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      // If range is full [-1, 1], treat as 'All' (null)
      if (value[0] === -1 && value[1] === 1) {
        // Only call parent if the state isn't already null
        if (sentimentRange !== null) {
          onSentimentRangeChange(null);
          console.log('Sentiment filter reset to All');
        }
      } else {
        onSentimentRangeChange([value[0], value[1]]);
      }
    }
  };

  return (
    <section className="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50 shadow-sm flex justify-end items-center flex-shrink-0">

      <div className="flex flex-col mx-4">

        <div className="flex items-center space-x-2 justify-end mb-2">
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

        <div className="w-full px-2 mb-4" >
          <Slider
            range
            min={-1}
            max={1}
            marks={marks}
            step={null}
            // defaultValue={[-1, 1]}
            value={sentimentRange ?? [-1, 1]}
            allowCross={false}
            pushable
            styles={sliderStyles}
            onChange={handleSliderChange}
          />
        </div>

      </div>

    </section>
  );
};

export default FilterBar;
