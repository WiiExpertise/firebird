import React from "react";
import TweetCard from "../components/TweetCard";

type Skeet = {
    id: string;
    displayName: string;
    handle: string;
    timestamp: string;
    content: string;
    blueskyLink: string;
    images?: string[];
};

interface MapSidebarProps {
    selectedLocationSkeets: Skeet[];
}

const MapSkeetsSidebar: React.FC<MapSidebarProps> = ({ selectedLocationSkeets }) => {
    return (
        <aside className="w-full max-w-screen-sm sm:w-96 bg-[#DB3737] text-white p-4 rounded-lg shadow-md sm:fixed sm:right-6 sm:top-24 sm:bottom-4 sm:overflow-y-auto z-40">
            <div className="flex flex-col space-y-4 h-full">
                <h3 className="text-xl font-semibold mb-4">SKEETS AT A LOCATION</h3>
                {selectedLocationSkeets.length > 0 ? (
                   [...selectedLocationSkeets]
                   .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                   .map((skeet, index) => (
                        <TweetCard
                            key={`skeet-${index}`}
                            displayName={skeet.displayName}
                            handle={skeet.handle}
                            timestamp={skeet.timestamp}
                            content={skeet.content}
                            images={skeet.images}
                        />
                    ))
                ) : (
                    <div className="flex flex-1 items-center justify-center text-gray-500 text-center p-4 h-full">
                        <span className="text-xl font-semibold mt-4 text-white">Click on a location to see its skeets.</span>
                    </div>
                )}
            </div>
        </aside>
    );
}
export default MapSkeetsSidebar;