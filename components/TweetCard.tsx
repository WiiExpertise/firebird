import { formatTimestamp } from "../utils/formatTimestamp";
import React from "react";

interface TweetCardProps {
  displayName: string;
  handle: string;
  timestamp: string;
  content: string;
  blueskyLink: string; // Add the Bluesky link as a prop
}

const TweetCard: React.FC<TweetCardProps> = ({
  displayName,
  handle,
  timestamp,
  content,
  blueskyLink, // Destructure the Bluesky link
}) => {
  const formattedTimestamp = formatTimestamp(timestamp);

  return (
    // Wrap the entire card in an anchor tag
    <a
      href={blueskyLink}
      target="_blank" // Open in a new tab
      rel="noopener noreferrer" // Security best practice for external links
      className="block bg-red-100 p-3 rounded-lg shadow-md mb-4 w-full text-sm hover:bg-red-200 transition-colors cursor-pointer"
    >
      {/* User Info */}
      <div className="flex flex-col">
        <div className="font-semibold text-red-600">{displayName}</div>
        <div className="text-xs text-red-500">
          @{handle} • {formattedTimestamp}
        </div>
      </div>
      {/* Tweet Content */}
      <div className="mt-2 text-red-600">{content}</div>
    </a>
  );
};

export default TweetCard;