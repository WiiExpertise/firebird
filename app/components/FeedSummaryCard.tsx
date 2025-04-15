import React from 'react';
import { Category } from '../types/locations';

import {
  FireIcon,
  BoltIcon,
  WifiIcon,
  CheckCircleIcon,
  ChartBarIcon, // Average Sentiment
  HashtagIcon, // Total Count
} from '@heroicons/react/24/outline';

interface FeedSummaryCardProps {
  averageSentiment: number;
  categoryCounts: Record<Category, number>;
  totalSkeets: number;
}

const formatScore = (score: number): string => {
  if (isNaN(score)) return 'N/A';
  return score.toFixed(2);
};

const FeedSummaryCard: React.FC<FeedSummaryCardProps> = ({
  averageSentiment,
  categoryCounts,
  totalSkeets,
}) => {
  // display within this card
  const categoryDisplayInfo: Record<Category, { Icon: React.ElementType; color: string }> = {
    Wildfire: { Icon: FireIcon, color: 'text-orange-600' },
    Hurricane: { Icon: BoltIcon, color: 'text-blue-600' },
    Earthquake: { Icon: WifiIcon, color: 'text-yellow-700' },
    Other: { Icon: CheckCircleIcon, color: 'text-green-600' },
  };

  return (
    <div className="bg-gray-50 p-3 mb-4 rounded-lg border border-gray-200 shadow-sm flex-shrink-0">
      <h4 className="text-sm font-semibold text-center text-gray-700 mb-3">Feed Summary</h4>
      <div className="space-y-2 text-xs">
        {/* Total Skeets */}
        <div className="flex items-center justify-between text-gray-600">
          <span className="flex items-center">
            <HashtagIcon className="h-4 w-4 mr-1.5 text-gray-400" />
            Total Skeets:
          </span>
          <span className="font-medium">{totalSkeets}</span>
        </div>

        {/* Average Sentiment */}
        <div className="flex items-center justify-between text-gray-600">
          <span className="flex items-center">
            <ChartBarIcon className="h-4 w-4 mr-1.5 text-gray-400" />
            Avg. Sentiment:
          </span>
          <span className="font-medium">{formatScore(averageSentiment)}</span>
        </div>

        {/* Category Counts */}
        <div className="pt-2 mt-2 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-1">Counts by Category:</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {(Object.keys(categoryDisplayInfo) as Category[]).map((cat) => {
              const { Icon, color } = categoryDisplayInfo[cat];
              return (
                <div key={cat} className={`flex items-center justify-between ${color}`}>
                  <span className="flex items-center">
                    <Icon className={`h-3.5 w-3.5 mr-1 ${cat === 'Earthquake' ? 'transform rotate-45' : ''}`} />
                    {cat}:
                  </span>
                  <span className="font-semibold">{categoryCounts[cat] ?? 0}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedSummaryCard;
