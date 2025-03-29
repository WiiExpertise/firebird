"use client";
import { Location, Category } from "./types/locations";
import { useEffect, useState, useCallback, useMemo } from "react";

import { db } from "../firebase";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";

import { getSkeetCategory, getBlueskyLink } from "./utils/utils";

// components 
import FilterBar from "./components/FilterBar";
import FeedSummaryCard from "./components/FeedSummaryCard";

// hooks 
import { useLocations } from './hooks/useLocations';

// Skeets
import { Skeet } from "./types/skeets";
import SkeetCard from "./components/SkeetCard"

// Map 
import dynamic from 'next/dynamic';
const MapComponent = dynamic(
  () => import('./components/Map'),
  {
    ssr: false, // Disable server-side rendering for this component
    loading: () => <div className="h-full flex items-center justify-center text-gray-500">Loading Map...</div> // Placeholder while component loads
  }
);


export default function Home() {

  // hooks
  const { locations, isLoading: locationsLoading, error: locationsError, reloadLocations } = useLocations();

  const [latestSkeets, setLatestSkeets] = useState<Skeet[]>([]);
  const [skeetsLoading, setSkeetsLoading] = useState(true);
  const [skeetsError, setSkeetsError] = useState<string | null>(null);

  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]); // Locations to display on map

  // Map Interaction/Filter State
  const [_, setSelectedLocationId] = useState<string | null>(null); // selectedLocationId
  const [visibleCategories, setVisibleCategories] = useState<Record<Category, boolean>>({
    Wildfire: true,
    Hurricane: true,
    Earthquake: true,
    NonDisaster: true,
  });

  const fetchLatestSkeets = useCallback(async () => {
    setSkeetsLoading(true);
    setSkeetsError(null);
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
          blueskyLink: getBlueskyLink(skeetData.handle, skeetData.uid),
        };
        fetchedSkeets.push(skeet);
      });
      console.log(`Fetched ${fetchedSkeets.length} skeets:`, fetchedSkeets);
      setLatestSkeets(fetchedSkeets);
    } catch (err) {
      console.error("Error fetching latest skeets:", err);
      let errorMsg = "Failed to load skeets.";
      if (err instanceof Error && err.message.includes("index")) {
        errorMsg = "Database setup required (Index missing).";
      }
      setSkeetsError(errorMsg);
    } finally {
      setSkeetsLoading(false);
    }
  }, []);

  const mapCenter: [number, number] = [39.8283, -98.5795]; // US Center

  // Calculate Summary Statistics 
  const summaryStats = useMemo(() => {
    let totalScore = 0;
    let validSentimentCount = 0;
    const counts: Record<Category, number> = {
      Wildfire: 0, Hurricane: 0, Earthquake: 0, NonDisaster: 0
    };

    latestSkeets.forEach(skeet => {
      // Sentiment calculation
      const score = skeet.sentiment?.score;
      if (typeof score === 'number' && !isNaN(score)) {
        totalScore += score;
        validSentimentCount++;
      }
      // Category calculation
      const category = getSkeetCategory(skeet.classification);
      if (counts[category] !== undefined) {
        counts[category]++;
      }
    });

    const averageSentiment = validSentimentCount > 0 ? totalScore / validSentimentCount : 0;

    return {
      averageSentiment,
      categoryCounts: counts,
      totalSkeets: latestSkeets.length,
    };
  }, [latestSkeets]); // Recalculate only when latestSkeets changes

  // Filtering Logic 
  useEffect(() => {
    console.log("Applying category filters based on fetched locations...");
    // Filter directly from the 'locations' provided by the useLocations hook
    const filtered = locations.filter((location) => {
      if (!visibleCategories[location.category]) {
        return false;
      }
      return true;
    });
    console.log(`Filtered locations count: ${filtered.length}`);
    setFilteredLocations(filtered);
  }, [locations, visibleCategories]);


  // Initial Data Fetch 
  useEffect(() => {
    fetchLatestSkeets();
  }, [fetchLatestSkeets]);


  // Event Handlers 
  const handleMarkerClick = useCallback((locationId: string) => {
    setSelectedLocationId(locationId);
    console.log("Map marker clicked in Home:", locationId);
  }, []);

  const handleCategoryToggle = useCallback((category: Category) => {
    setVisibleCategories(prev => ({ ...prev, [category]: !prev[category] }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex">

      {/* Main Content Area */}
      <main className="flex-1 p-6 flex flex-col">
        <header className="flex justify-between items-center mb-4 flex-shrink-0">
          <h1 className="text-2xl font-bold text-miko-pink-dark">Firebird</h1>
        </header>

        <FilterBar
          visibleCategories={visibleCategories}
          onCategoryToggle={handleCategoryToggle}
          onReload={reloadLocations}
          isLoading={locationsLoading}
        />

        {/* Map Area */}
        <section className="flex-grow mb-6">
          <div className="bg-white rounded-lg shadow-md h-[50vh]">
            {locationsLoading ? (
              <div className="h-full flex items-center justify-center text-gray-500">Loading Map Data...</div>
            ) : locationsError ? (
              <div className="h-full flex items-center justify-center text-red-600">{locationsError}</div>
            ) : (
              <MapComponent
                locations={filteredLocations}
                center={mapCenter}
                zoom={4}
                onMarkerClick={handleMarkerClick}
              />
            )}
          </div>
        </section>

      </main>

      {/* Right Sidebar */}
      <aside className="w-80 bg-white p-4 flex flex-col flex-shrink-0 shadow-lg h-screen">
        <div className="text-xl font-bold mb-4 text-center text-miko-pink-dark">Details & Feed</div>

        <FeedSummaryCard
          averageSentiment={summaryStats.averageSentiment}
          categoryCounts={summaryStats.categoryCounts}
          totalSkeets={summaryStats.totalSkeets}
        />

        {/* Latest Skeets Section */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar min-h-0">
          {/* Loading/Error states */}
          {skeetsLoading && <p className="text-gray-500 text-center pt-4">Loading skeets...</p>}
          {skeetsError && <p className="text-red-600 text-center pt-4">{skeetsError}</p>}
          {!skeetsLoading && !skeetsError && latestSkeets.length === 0 && (
            <p className="text-gray-500 text-center pt-4">No skeets found.</p>
          )}
          {/* Render SkeetCards */}
          {!skeetsLoading && !skeetsError && latestSkeets.map((skeet) => (
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


    </div>
  );

}
