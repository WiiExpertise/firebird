import React from 'react';
import { Skeet } from '../types/skeets';
import { Category } from '../types/locations';
import SkeetCard from './SkeetCard';
import FeedSummaryCard from './FeedSummaryCard';

interface SidebarFeedProps {
  skeets: Skeet[];
  isLoading: boolean;
  error: string | null;
  summaryStats: {
    averageSentiment: number;
    categoryCounts: Record<Category, number>;
    totalSkeets: number;
  };
  selectedLocationName?: string | null;
}

const SidebarFeed: React.FC<SidebarFeedProps> = ({
  skeets,
  isLoading,
  error,
  summaryStats,
  selectedLocationName
}) => {
  return (
    <aside className="w-80 bg-white p-4 flex flex-col flex-shrink-0 shadow-lg h-screen">

      {/* Display selected location name if available */}
      <div className="text-center mb-3 flex-shrink-0 h-5">
        {selectedLocationName && (
          <p className="text-xs text-gray-500 truncate">
            Showing data for: <span className="font-medium">{selectedLocationName}</span>
          </p>
        )}
        {!selectedLocationName && (
          <p className="text-xs text-gray-400 italic">
            Overall Feed Summary
          </p>
        )}
      </div>

      <FeedSummaryCard
        averageSentiment={summaryStats.averageSentiment}
        categoryCounts={summaryStats.categoryCounts}
        totalSkeets={summaryStats.totalSkeets}
      />

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar min-h-0">
        {isLoading && <p className="text-gray-500 text-center pt-4">Loading skeets...</p>}
        {error && <p className="text-red-600 text-center pt-4">{error}</p>}
        {!isLoading && !error && skeets.length === 0 && (
          <p className="text-gray-500 text-center pt-4">
            No recent global skeets found.
          </p>
        )}
        {!isLoading && !error && skeets.map((skeet) => (
          <SkeetCard
            key={skeet.id || skeet.uid}
            displayName={skeet.displayName}
            handle={skeet.handle}
            timestamp={skeet.timestamp}
            content={skeet.content}
            avatar={skeet.avatar}
            blueskyLink={skeet.blueskyLink}
            sentiment={skeet.sentiment}
            classification={skeet.classification}
          />
        ))}
      </div>
    </aside>
  );
};

export default SidebarFeed;
