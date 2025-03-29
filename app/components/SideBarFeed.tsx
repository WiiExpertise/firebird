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
}

const SidebarFeed: React.FC<SidebarFeedProps> = ({
  skeets,
  isLoading,
  error,
  summaryStats,
}) => {
  return (
    <aside className="w-80 bg-white p-4 flex flex-col flex-shrink-0 shadow-lg h-screen">
      <div className="text-xl font-bold mb-4 text-center text-miko-pink-dark flex-shrink-0">
        Details & Feed
      </div>

      <FeedSummaryCard
        averageSentiment={summaryStats.averageSentiment}
        categoryCounts={summaryStats.categoryCounts}
        totalSkeets={summaryStats.totalSkeets}
      />

      <h3 className="font-semibold uppercase text-gray-500 text-sm mb-2 text-center flex-shrink-0">
        Latest Global Skeets
      </h3>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar min-h-0">
        {isLoading && <p className="text-gray-500 text-center pt-4">Loading skeets...</p>}
        {error && <p className="text-red-600 text-center pt-4">{error}</p>}
        {!isLoading && !error && skeets.length === 0 && (
          <p className="text-gray-500 text-center pt-4">
            {/* Update empty message later */}
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
