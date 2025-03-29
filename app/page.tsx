"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Location, Category } from "./types/locations";

import { getSkeetCategory } from "./utils/utils";

// components 
import FilterBar from "./components/FilterBar";
import SideBarFeed from "./components/SideBarFeed";

// hooks 
import { useLocations } from './hooks/useLocations';
import { useSkeets } from "./hooks/useSkeets";

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
  const { skeets: displayedSkeets, isLoading: skeetsLoading, error: skeetsError } = useSkeets();
  const { locations, isLoading: locationsLoading, error: locationsError, reloadLocations } = useLocations();

  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]); // Locations to display on map

  // Map Interaction/Filter State
  const [_, setSelectedLocationId] = useState<string | null>(null); // selectedLocationId
  const [visibleCategories, setVisibleCategories] = useState<Record<Category, boolean>>({
    Wildfire: true,
    Hurricane: true,
    Earthquake: true,
    NonDisaster: true,
  });

  const mapCenter: [number, number] = [39.8283, -98.5795]; // US Center

  // Calculate Summary Statistics 
  const summaryStats = useMemo(() => {
    let totalScore = 0;
    let validSentimentCount = 0;
    const counts: Record<Category, number> = {
      Wildfire: 0, Hurricane: 0, Earthquake: 0, NonDisaster: 0
    };

    displayedSkeets.forEach(skeet => {
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
      totalSkeets: displayedSkeets.length,
    };
  }, [displayedSkeets]);

  // Filtering Logic 
  useEffect(() => {
    console.log("Applying category filters based on fetched locations...");
    const filtered = locations.filter((location) => {
      if (!visibleCategories[location.category]) {
        return false;
      }
      return true;
    });
    console.log(`Filtered locations count: ${filtered.length}`);
    setFilteredLocations(filtered);
  }, [locations, visibleCategories]);

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

      <SideBarFeed
        skeets={displayedSkeets}
        isLoading={skeetsLoading}
        error={skeetsError}
        summaryStats={summaryStats}
      />

    </div>
  );

}
