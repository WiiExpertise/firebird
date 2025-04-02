import React, { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import { Category } from '../app/types/locations';
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
  CalendarDaysIcon,
} from '@heroicons/react/24/solid';

// Refer to tailwind config 
const MIKO_PINK = '#E8C5CB';
const MIKO_PINK_DARK = '#D8AAB4';

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
  track: { backgroundColor: MIKO_PINK },
  rail: { backgroundColor: '#F8E4E8' },
  handle: { backgroundColor: MIKO_PINK, borderColor: MIKO_PINK_DARK, opacity: 1 },
};

import { DateRange, RangeKeyDict, Range } from 'react-date-range'; // Import Range type
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

const formatDate = (date: Date | null | undefined): string => {
  if (!date) return '';
  return moment(date).format('MMM D, YYYY');
};

interface FilterBarProps {
  visibleCategories: Record<Category, boolean>;
  onCategoryToggle: (category: Category) => void;
  onReload: () => void;
  isLoading: boolean;
  sentimentRange: [number, number] | null; // null means filter is off (full range)
  onSentimentRangeChange: (value: [number, number] | null) => void;
  selectedDateRange: { startDate?: Date; endDate?: Date; key?: string } | null;
  onDateRangeChange: (range: { startDate?: Date; endDate?: Date; key?: string } | null) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  visibleCategories,
  onCategoryToggle,
  onReload,
  isLoading,
  sentimentRange,
  onSentimentRangeChange,
  selectedDateRange,
  onDateRangeChange
}) => {

  const [isDateRangeVisible, setIsDateRangeVisible] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const toggleDateRange = () => {
    setIsDateRangeVisible(!isDateRangeVisible);
  };

  const handleDateChange = (item: RangeKeyDict) => {
    if (item.selection) {
      const newRange = {
        startDate: item.selection.startDate,
        endDate: item.selection.endDate,
        key: item.selection.key || 'selection',
      };
      onDateRangeChange(newRange);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDateRangeVisible(false);
      }
    };
    if (isDateRangeVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDateRangeVisible]);

  // formatted dates for the button 
  const currentSelection = selectedDateRange;
  const formattedStartDate = formatDate(currentSelection?.startDate);
  const formattedEndDate = formatDate(currentSelection?.endDate);
  const dateButtonText = (formattedStartDate && formattedEndDate && formattedStartDate !== formattedEndDate)
    ? `${formattedStartDate} - ${formattedEndDate}`
    : formattedStartDate || 'Select Date Range';

  const dateRangeForPicker: Range[] = selectedDateRange
    ? [{
      startDate: selectedDateRange.startDate,
      endDate: selectedDateRange.endDate,
      key: selectedDateRange.key || 'selection',
    }]
    : [{
      startDate: undefined,
      endDate: undefined,
      key: 'selection',
    }];

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
    <section className="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50 shadow-sm flex justify-between items-center flex-shrink-0">


      {/* --- Date Filter Section (Relative Positioning Container) --- */}
      <div className="relative w-full md:w-auto">
        {/* Trigger Button */}
        <button
          onClick={toggleDateRange}
          className="flex items-center justify-between w-full md:w-64 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-miko-pink-light"
        >
          <span className="truncate">{dateButtonText}</span>
          <CalendarDaysIcon className="h-5 w-5 text-gray-400 ml-2" aria-hidden="true" />
        </button>

        {/* --- Conditionally Rendered Date Picker Pop-up --- */}
        {isDateRangeVisible && (
          <div
            ref={datePickerRef}
            className="absolute top-full left-0 mt-1 z-20 border rounded-md shadow-lg bg-white"
          >
            <DateRange
              editableDateInputs={true}
              onChange={handleDateChange}
              moveRangeOnFirstSelection={false}
              ranges={dateRangeForPicker}
              months={1}
              direction="vertical"
              rangeColors={[MIKO_PINK_DARK]}
              className="responsive-date-range"
            // TODO: Add maxDate to prevent future selection 
            // maxDate={new Date()}
            />
          </div>
        )}
      </div>


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
