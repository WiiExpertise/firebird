import { formatTimestamp } from "../utils/formatTimestamp";
import React from "react";

interface TweetCardProps {
  author: string;
  handle: string;
  timestamp: string;
  content: string;
}

const TweetCard: React.FC<TweetCardProps> = ({
  author,
  handle,
  timestamp,
  content,
}) => {
  
  const formattedTimestamp = formatTimestamp(timestamp);

  return (
    <div className="bg-red-100 p-3 rounded-lg shadow-md mb-4 w-full text-sm">
      {/* User Info */}
      <div className="flex flex-col">
        <div className="font-semibold text-red-600">{author}</div>
        <div className="text-xs text-red-500">@{handle} • {formattedTimestamp}</div>
      </div>
      {/* Tweet Content */}
      <div className="mt-2 text-red-600">{content}</div>
    </div>
  );
};

export default TweetCard;
