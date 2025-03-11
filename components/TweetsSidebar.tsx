import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import TweetCard from "../components/TweetCard";
import Firebase from "../components/Firebase";


export function TweetsSidebar() {
  interface Tweet {
    displayName: string;
    handle: string;
    timestamp: string;
    content: string;
    blueskyLink: string;
  }

  const [firebaseTweets, setFirebaseTweets] = useState<Tweet[]>([]); // Holds Firebase tweets

  // Handle Firebase data - wrapped in useCallback to prevent recreation on each render
  const handleFirebaseData = useCallback((data: any[]) => {
    console.log("Firebase data received:", data.length);
    const formattedTweets = data  
      .map((tweet) => ({
        displayName: tweet.displayName,
        handle: tweet.handle,
        timestamp: tweet.timestamp,
        content: tweet.content,
        blueskyLink: tweet.blueskyLink,
      }))
      .sort((a: Tweet, b: Tweet) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) // Sort by timestamp descending
      .slice(0, 5); // Keep only the first 5 tweets

    setFirebaseTweets(formattedTweets);
  }, []); // Empty dependency array means this function won't change on rerenders
  
  // Debug useEffect to monitor Firebase tweets
  useEffect(() => {
    console.log("firebaseTweets updated:", firebaseTweets.length);
  }, [firebaseTweets]);


  return (
    <aside className="w-96 bg-[#DB3737] text-black p-4 rounded-lg shadow-md fixed right-6 top-24 bottom-4 overflow-y-auto z-40">
      <h3 className="text-xl font-semibold mb-4 text-white">Latest Tweets</h3>
      <div className="space-y-4 flex flex-col">
      {firebaseTweets.map((tweet, index) => (
            <TweetCard
              key={`firebase-${index}`}
              displayName={tweet.displayName}
              handle={tweet.handle}
              timestamp={tweet.timestamp}
              content={tweet.content}
              blueskyLink={tweet.blueskyLink}
            />
          ))}
      </div>
      <Firebase onDataFetched={handleFirebaseData} />
    </aside>
  );
}


