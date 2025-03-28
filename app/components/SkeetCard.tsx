import React from 'react';

interface SkeetCardProps {
  displayName: string;
  handle: string;
  timestamp: string; // ISO 8601 string
  content: string;
  avatar?: string;
  blueskyLink?: string;
}

const formatTimestamp = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  } catch (e) {
    return isoString;
  }
};

const SkeetCard: React.FC<SkeetCardProps> = ({
  displayName,
  handle,
  timestamp,
  content,
  // avatar, 
  // blueskyLink, 
}) => {
  const formattedTime = formatTimestamp(timestamp);

  return (
    // Light theme card: white background, border, subtle shadow on hover maybe
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex flex-col transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-center mb-2">
        {/* Removed Avatar Placeholder */}
        <div className="flex-1 min-w-0"> {/* Use full width */}
          {/* Darker text for display name */}
          <p className="text-sm font-semibold text-gray-800 truncate">
            {displayName || 'Unknown User'}
          </p>
          {/* Lighter gray text for handle and time */}
          <p className="text-xs text-gray-500 truncate">
            @{handle || 'unknown_handle'} &middot; {formattedTime}
          </p>
        </div>
        {/* Removed Bluesky Link Placeholder */}
      </div>

      {/* Content text: standard dark gray */}
      <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
        {content}
      </p>
    </div>
  );


};

export default SkeetCard;
