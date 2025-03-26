import { formatTimestamp } from "../utils/formatTimestamp";
import React, { useState } from "react";

interface TweetCardProps {
  displayName: string;
  handle: string;
  timestamp: string;
  content: string;
  blueskyLink: string;
  images?: string[]; // Array of image URLs
}

const TweetCard: React.FC<TweetCardProps> = ({
  displayName,
  handle,
  timestamp,
  content,
  blueskyLink,
  images = [], // Default to empty array
}) => {
  const formattedTimestamp = formatTimestamp(timestamp);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Function to determine image grid class based on count
  const getImageGridClass = (count: number, index: number) => {
    if (count === 1) return "row-span-2 col-span-2";
    if (count === 2) return "col-span-1";
    if (count === 3) {
      return index === 0 ? "row-span-2 col-span-1" : "col-span-1";
    }
    if (count === 4) return "col-span-1";
    return "";
  };

  return (
    <div className="bg-red-100 p-3 rounded-lg shadow-md mb-4 w-full text-sm hover:bg-red-200 transition-colors">
      {/* User Info */}
      <a
        href={blueskyLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="flex flex-col">
          <div className="font-semibold text-red-600">{displayName}</div>
          <div className="text-xs text-red-500">
            @{handle} • {formattedTimestamp}
          </div>
        </div>
      </a>
      
      {/* Tweet Content */}
      <a
        href={blueskyLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-2 text-red-600"
      >
        {content}
      </a>
      
      {/* Image Grid */}
      {images.length > 0 && (
        <div className={`mt-3 grid gap-1 rounded-xl overflow-hidden ${
          images.length === 1 ? "grid-cols-1 grid-rows-1" :
          images.length === 2 ? "grid-cols-2 grid-rows-1" :
          images.length === 3 ? "grid-cols-2 grid-rows-2" :
          "grid-cols-2 grid-rows-2"
        }`}>
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative ${getImageGridClass(images.length, index)}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedImage(image);
              }}
            >
              <img
                src={image}
                alt={`Tweet media ${index + 1}`}
                className="w-full h-full object-cover cursor-pointer"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Enlarged tweet media"
              className="max-w-full max-h-screen"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 text-white text-2xl"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TweetCard;