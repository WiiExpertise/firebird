"use client";
import { useEffect, useState, useCallback } from "react";

import { db } from "../firebase";
import { collection, query, getDocs, orderBy, limit, where } from "firebase/firestore";

import { Skeet } from "./types/skeets";
import SkeetCard from "./components/SkeetCard"
import MapComponent from "./components/Map";

import { Location, Category } from "./types/locations";

const getBlueskyLink = (handle: string, uid: string): string | undefined => {
  if (!uid || !uid.startsWith("at://")) return undefined;
  const parts = uid.split('/');
  const postId = parts[parts.length - 1]; // Get the last part of the URI
  if (!handle || !postId) return undefined;
  return `https://bsky.app/profile/${handle}/post/${postId}`;
};

export default function Home() {
  const [latestSkeets, setLatestSkeets] = useState<Skeet[]>([]);
  const [skeetsLoading, setSkeetsLoading] = useState(true);
  const [skeetsError, setSkeetsError] = useState<string | null>(null);

  const [allLocations, setAllLocations] = useState<Location[]>([]); // All fetched locations
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]); // Locations to display on map
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState<string | null>(null);

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
        limit(2)
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
  const fetchLocations = useCallback(async () => {
    setLocationsLoading(true);
    setLocationsError(null);
    console.log("Fetching locations active in the last month...");

    // Calculate date one month ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const oneMonthAgoISO = oneMonthAgo.toISOString(); // Convert to ISO string for Firestore query

    try {
      const locationsRef = collection(db, "locations");
      const locationsQuery = query(
        locationsRef,
        // where("formattedAddress", "!=", ""),
        where("lastSkeetTimestamp", ">=", oneMonthAgoISO),
        limit(50)
      );

      const snapshot = await getDocs(locationsQuery);
      const locationData = snapshot.docs.map((doc) => {
        const data = doc.data()
        let category: Category = "NonDisaster";
        const counts = data.latestDisasterCount;
        if (counts) {
          if (counts.fireCount > Math.max(counts.hurricaneCount || 0, counts.earthquakeCount || 0, counts.nonDisasterCount || 0)) category = "Wildfire";
          else if (counts.hurricaneCount > Math.max(counts.fireCount || 0, counts.earthquakeCount || 0, counts.nonDisasterCount || 0)) category = "Hurricane";
          else if (counts.earthquakeCount > Math.max(counts.fireCount || 0, counts.hurricaneCount || 0, counts.nonDisasterCount || 0)) category = "Earthquake";
        }
        if (!["Wildfire", "Hurricane", "Earthquake", "NonDisaster"].includes(category)) {
          category = "NonDisaster";
        }
        return {
          id: doc.id,
          locationName: data.locationName || "Unknown",
          formattedAddress: data.formattedAddress || "N/A",
          lat: data.lat || 0,
          long: data.long || 0,
          type: data.type || "LOCATION",
          category: category,
          avgSentimentList: data.avgSentimentList,
          latestSkeetsAmount: data.latestSkeetsAmount,
          latestDisasterCount: data.latestDisasterCount,
          latestSentiment: data.latestSentiment,
          firstSkeetTimestamp: data.firstSkeetTimestamp,
          lastSkeetTimestamp: data.lastSkeetTimestamp,
        } as Location;
      }).filter(loc => loc.lat !== 0 && loc.long !== 0);

      console.log(`Fetched ${locationData.length} locations active in the last month.`);
      setAllLocations(locationData);

    } catch (error) {
      console.error("Error fetching locations:", error);
      let errorMsg = "Failed to load locations.";
      if (error instanceof Error && error.message.includes("index")) {
        errorMsg = "Database setup required (Index missing for location query). Check server logs or contact admin."; // bro I do not want to do this if it happens
      }
      setLocationsError(errorMsg);
    } finally {
      setLocationsLoading(false);
    }
  }, []);

  // Filtering Logic
  useEffect(() => {
    console.log("Applying category filters...");
    const filtered = allLocations.filter((location) => {
      if (!visibleCategories[location.category]) {
        return false;
      }

      return true;
    });
    console.log(`Filtered locations count: ${filtered.length}`);
    setFilteredLocations(filtered);
  }, [allLocations, visibleCategories]);


  // Initial Data Fetch 
  useEffect(() => {
    fetchLatestSkeets();
    fetchLocations();
  }, [fetchLatestSkeets, fetchLocations]);


  // Event Handlers 
  const handleMarkerClick = useCallback((locationId: string) => {
    setSelectedLocationId(locationId);
    console.log("Map marker clicked in Home:", locationId);
  }, []);

  const handleReloadLocations = useCallback(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleCategoryToggle = useCallback((category: Category) => {
    setVisibleCategories(prev => ({ ...prev, [category]: !prev[category] }));
  }, []);


  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex">

      {/* Main Content Area */}
      <main className="flex-1 p-6 flex flex-col"> {/* Use flex-col */}
        <header className="flex justify-between items-center mb-4 flex-shrink-0">
          <h1 className="text-2xl font-bold text-miko-pink-dark">Firebird</h1>
          <div className="space-x-4">
            <button className="bg-white p-2 rounded-full shadow hover:bg-gray-200 transition-colors">🔔</button>
            <button className="bg-white p-2 rounded-full shadow hover:bg-gray-200 transition-colors">🌙</button>
          </div>
        </header>

        {/* Map Area - Make it expand */}
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
      <aside className="w-72 bg-white p-4 flex flex-col flex-shrink-0 shadow-lg">
        <div className="text-xl font-bold mb-4 text-center text-miko-pink-dark">Details & Feed</div>

        {/* Map Filters Section */}
        <div className="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50 flex-shrink-0">
          <h3 className="font-semibold mb-2 text-center text-gray-700">Map Filters</h3>
          {/* Category Toggles */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {(Object.keys(visibleCategories) as Category[]).map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryToggle(cat)}
                className={`p-1.5 rounded text-xs transition-colors ${visibleCategories[cat] ? 'bg-miko-pink text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {cat} {visibleCategories[cat] ? '✔' : ''}
              </button>
            ))}
          </div>

          {/* Reload Button */}
          <button
            className="w-full p-2 mt-3 bg-miko-pink hover:bg-miko-pink-dark text-white rounded-lg shadow-md text-sm transition-colors"
            onClick={handleReloadLocations}
            disabled={locationsLoading}
          >
            {locationsLoading ? 'Reloading...' : 'Reload Locations'}
          </button>
        </div>

        {/* Latest Skeets Section */}
        <h3 className="font-semibold uppercase text-gray-500 text-sm mb-2 text-center flex-shrink-0">
          Latest Skeets
        </h3>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
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
            />
          ))}
        </div>
      </aside>

      {/* Scroll bar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #e5e7eb; /* gray-200 */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #9ca3af; /* gray-400 */
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280; /* gray-500 */
        }
        /* Optional: Minimal styling for DateRangePicker if you add it back */
        .date-range-picker-container .rdrCalendarWrapper {
            font-size: 12px;
        }
        .date-range-picker-container .rdrDateDisplayWrapper {
            display: none;
        }
      `}</style>

    </div>
  );

}
