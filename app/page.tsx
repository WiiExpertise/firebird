"use client";
import { useEffect, useState, useCallback } from "react";

import { db } from "../firebase";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";

import { Skeet } from "./types/skeets";
import SkeetCard from "./components/SkeetCard"

// Helper function to construct Bluesky link
const getBlueskyLink = (handle: string, uid: string): string | undefined => {
  if (!uid || !uid.startsWith("at://")) return undefined;
  const parts = uid.split('/');
  const postId = parts[parts.length - 1]; // Get the last part of the URI
  if (!handle || !postId) return undefined;
  return `https://bsky.app/profile/${handle}/post/${postId}`;
};

export default function Home() {

  const [latestSkeets, setLatestSkeets] = useState<Skeet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestSkeets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log("Fetching latest 10 skeets from 'skeets' collection...");

    try {
      const skeetsQuery = query(
        collection(db, 'skeets'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(skeetsQuery);

      const fetchedSkeets: Skeet[] = [];
      querySnapshot.forEach((doc) => {
        const skeetData = doc.data()

        const skeet: Skeet = {
          id: doc.id,
          avatar: skeetData.avatar || '',
          content: skeetData.content || '',
          timestamp: skeetData.timestamp || new Date().toISOString(),
          handle: skeetData.handle || 'unknown',
          displayName: skeetData.displayName || 'Unknown User',
          uid: skeetData.uid || '',
          classification: skeetData.classification || [],
          sentiment: skeetData.sentiment || { Magnitude: 0, Score: 0 },
          blueskyLink: getBlueskyLink(skeetData.handle, skeetData.uid), // Construct link
        };
        fetchedSkeets.push(skeet);
      });

      console.log(`Fetched ${fetchedSkeets.length} skeets:`, fetchedSkeets);
      setLatestSkeets(fetchedSkeets);

    } catch (err) {
      console.error("Error fetching latest skeets:", err);
      let errorMsg = "Failed to load skeets. Please try again later.";
      if (err instanceof Error && err.message.includes("index")) { // Simplified check
        errorMsg = "Database setup required (Index missing on 'skeets' collection for timestamp). Check server logs or contact admin.";
      }
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch skeets when the component mounts
  useEffect(() => {
    fetchLatestSkeets();
  }, [fetchLatestSkeets]); // fetchLatestSkeets is memoized by useCallback


  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex">

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 flex-row-reverse">
          <div className="space-x-4">
            <button className="bg-white p-2 rounded-full shadow hover:bg-gray-200 transition-colors">🔔</button>
            <button className="bg-white p-2 rounded-full shadow hover:bg-gray-200 transition-colors">🌙</button>
          </div>
          <h1 className="text-2xl font-bold text-miko-pink-dark">Firebird</h1> {/* UPDATED */}
        </header>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md">Predifined tab of disaster</div>
          <div className="bg-white p-4 rounded-lg shadow-md">Predifined tab of disaster</div>
          <div className="bg-white p-4 rounded-lg shadow-md">Predifined tab of disaster</div>
          <div className="bg-white p-4 rounded-lg shadow-md">Predifined tab of disaster</div>
        </section>

        {/* Placeholder for Map or other main content */}
        <section className="mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md h-[60vh] flex items-center justify-center text-gray-500">
            <p>(Map Area or Main Dashboard Content)</p>
          </div>
        </section>

      </main>

      <aside className="w-72 bg-white p-4 flex flex-col flex-shrink-0 shadow-lg">
        <div className="text-xl font-bold mb-4 text-center text-miko-pink-dark">Details & Feed</div> {/* UPDATED */}

        <div className="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2 text-center text-gray-700">Map Filters</h3>
          <label className="flex items-center space-x-2 cursor-pointer mb-3 text-gray-700">
            <input type="checkbox" className="form-checkbox h-4 w-4 rounded text-miko-pink focus:ring-miko-pink-dark" />
            <span>Filter By Date</span>
          </label>
          <button className="w-full p-2 bg-miko-pink hover:bg-miko-pink-dark text-white rounded-lg shadow-md text-sm transition-colors">
            Reload Locations
          </button>
        </div>

        {/* Latest Skeets Section Title */}
        <h3 className="font-semibold uppercase text-gray-500 text-sm mb-2 text-center">
          Latest Skeets
        </h3>
        {/* Skeet list container */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          {/* Loading/Error states with light theme text */}
          {isLoading && <p className="text-gray-500 text-center pt-4">Loading skeets...</p>}
          {error && <p className="text-red-600 text-center pt-4">{error}</p>}
          {!isLoading && !error && latestSkeets.length === 0 && (
            <p className="text-gray-500 text-center pt-4">No skeets found.</p>
          )}

          {/* Render SkeetCards */}
          {!isLoading && !error && latestSkeets.map((skeet) => (
            <SkeetCard
              key={skeet.id || skeet.uid}
              displayName={skeet.displayName}
              handle={skeet.handle}
              timestamp={skeet.timestamp}
              content={skeet.content}
              avatar={skeet.avatar} // not used in simplified card
              blueskyLink={skeet.blueskyLink}
            />
          ))}
        </div>
      </aside>

    </div>
  );

}
