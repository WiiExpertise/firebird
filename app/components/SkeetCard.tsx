import React from 'react';
import moment from 'moment';

import { Sentiment, Category as SkeetCategory } from '../types/skeets'; // Renamed Category to avoid conflict

import {
  FireIcon,
  BoltIcon,
  WifiIcon, // Using for Earthquake (rotated)
  CheckCircleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/solid';

interface SkeetCardProps {
  displayName: string;
  handle: string;
  timestamp: string; // ISO 8601 string
  content: string;
  sentiment: Sentiment;
  classification: number[];
  avatar?: string;
  blueskyLink?: string;
}

// Format timestamp using Moment.js for relative time
const formatTimestamp = (isoString: string): string => {
  try {
    const date = moment(isoString);
    // Check if the date is valid before formatting
    if (!date.isValid()) {
      console.warn("Invalid timestamp received:", isoString);
      return "Invalid date";
    }
    // Display relative time 
    return date.fromNow();
  } catch (e) {
    console.error("Error formatting date with moment:", isoString, e);
    return isoString; // Fallback
  }
};

const getDisasterCategory = (classification: number[]): SkeetCategory => {
  if (!classification || classification.length < 3) {
    return "NonDisaster"; // Default if array is too short or missing
  }

  let maxProb = -1;
  let maxIndex = -1;

  // Find the index with the highest probability
  for (let i = 0; i < classification.length; i++) {
    if (classification[i] > maxProb) {
      maxProb = classification[i];
      maxIndex = i;
    }
  }

  // Map index to category name
  switch (maxIndex) {
    case 0: return "Wildfire";
    case 1: return "Hurricane";
    case 2: return "Earthquake";
    default: return "NonDisaster"; // Default 
  }
};

const categoryIcons: Record<SkeetCategory, React.ElementType> = {
  Wildfire: FireIcon,
  Hurricane: BoltIcon,
  Earthquake: WifiIcon,
  NonDisaster: CheckCircleIcon,
};

const getSentimentBgClass = (score: number): string => {
  const validScore = (isNaN(score) || score > 1 || score < -1) ? 0 : score;

  if (validScore <= -0.6) return 'bg-miko-pink-900'; // Darkest Pink
  if (validScore <= -0.2) return 'bg-miko-pink-700'; // Dark Pink
  if (validScore < 0.2) return 'bg-miko-pink-500';  // Medium/Default Pink
  if (validScore < 0.6) return 'bg-miko-pink-300';  // Light Pink
  return 'bg-miko-pink-100';                        // Lightest Pink
};

const SkeetCard: React.FC<SkeetCardProps> = ({
  displayName,
  handle,
  timestamp,
  content,
  sentiment,
  classification,
  // avatar, 
  // blueskyLink, 
}) => {
  // Calculate derived values
  const formattedTime = formatTimestamp(timestamp);
  const category = getDisasterCategory(classification);
  const Icon = categoryIcons[category] || QuestionMarkCircleIcon; // Get icon, use fallback
  const rotation = category === 'Earthquake' ? 'transform rotate-45' : ''; // Rotation for earthquake

  const score = sentiment?.score; // Use optional chaining for safety
  const formattedScore = (typeof score === 'number' && !isNaN(score))
    ? score.toFixed(2)
    : 'N/A';
  const sentimentBgClass = (typeof score === 'number' && !isNaN(score))
    ? getSentimentBgClass(score)
    : 'bg-gray-300'; // Fallback background for N/A

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex flex-col transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-center mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {displayName || 'Unknown User'}
          </p>
          <p className="text-xs text-gray-500 truncate">
            @{handle || 'unknown_handle'} &middot; {formattedTime}
          </p>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-gray-700 whitespace-pre-wrap break-words mb-2">
        {content}
      </p>

      {/* Footer */}
      <div className="mt-auto pt-2 border-t border-gray-100 flex justify-end items-center space-x-2 text-xs">
        <span
          title={`Category: ${category}`}
          className="flex items-center justify-center w-5 h-5 rounded-md bg-miko-pink text-white"
        >
          <Icon className={`h-3 w-3 ${rotation}`} />
        </span>

        {/* Sentiment Score Badge */}
        <span
          title={`Sentiment Score: ${formattedScore}`}
          className={`px-2 py-0.5 rounded-md font-medium ${sentimentBgClass} ${formattedScore === 'N/A' ? 'text-gray-600' : 'text-white' // White text, except for N/A
            }`}
        >
          {formattedScore}
        </span>

      </div>
    </div>
  );

};

export default SkeetCard;
