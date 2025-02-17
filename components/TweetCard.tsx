// components/TweetCard.tsx
import React from "react";

interface TweetCardProps {
  username: string;
  handle: string;
  timestamp: string;
  content: string;
}

const TweetCard: React.FC<TweetCardProps> = ({
  username,
  handle,
  timestamp,
  content,
}) => {
  return (
    <div className="bg-gray-800 p-3 rounded-lg shadow-md mb-4 w-full text-sm">
      {/* User Info */}
      <div className="flex flex-col">
        <div className="font-semibold text-gray-100">{username}</div>
        <div className="text-xs text-gray-400">@{handle} • {timestamp}</div>
      </div>
      {/* Tweet Content */}
      <div className="mt-2 text-gray-100">{content}</div>
    </div>
  );
};

export default TweetCard;
