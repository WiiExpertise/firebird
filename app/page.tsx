"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Location, Category } from "./types/locations";
import { getSkeetCategory } from "./utils/utils";
import moment from "moment"

// components 
import FilterBar from "./components/FilterBar";
import SideBarFeed from "./components/SideBarFeed";
import SentimentChart from "./components/SentimentChart";

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

  // Calculate Summary Statistics for the sidebar 
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

  // Map Interaction/Filter State
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]); // Locations to display on map
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedLocationName, setSelectedLocationName] = useState<string | null>(null);
  const [visibleCategories, setVisibleCategories] = useState<Record<Category, boolean>>({
    Wildfire: true,
    Hurricane: true,
    Earthquake: true,
    NonDisaster: true,
  });
  const mapCenter: [number, number] = [39.8283, -98.5795]; // US Center

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

  // Chart Data 
  const [chartData, setChartData] = useState<{ time: number, value: number }[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  // Calculate Chart Data 
  useEffect(() => {
    if (locationsLoading) {
      if (!chartLoading) setChartLoading(true);
      return;
    }
    console.log("[Chart Effect] Calculating aggregate chart data for filtered locations:", filteredLocations.length);
    console.log(filteredLocations)

    setChartLoading(true);
    setChartData([]);


    const dailyData: Record<string, { totalScore: number; count: number }> = {};

    filteredLocations.forEach(location => {
      if (Array.isArray(location.avgSentimentList)) {
        location.avgSentimentList.forEach(sentimentEntry => {
          try {
            // Validate timestamp and sentiment score
            if (!sentimentEntry.timeStamp || typeof sentimentEntry.averageSentiment !== 'number' || isNaN(sentimentEntry.averageSentiment)) {
              console.warn(`Skipping invalid sentiment entry for location ${location.id}:`, sentimentEntry);
              return;
            }

            const entryMoment = moment(sentimentEntry.timeStamp); // Parse ISO string
            if (!entryMoment.isValid()) {
              console.warn(`[Chart Effect] Skipping invalid timestamp for location ${location.id}:`, sentimentEntry.timeStamp);
              return;
            }

            const dateStr = entryMoment.format('YYYY-MM-DD');

            if (!dailyData[dateStr]) {
              dailyData[dateStr] = { totalScore: 0, count: 0 };
            }
            dailyData[dateStr].totalScore += sentimentEntry.averageSentiment;
            dailyData[dateStr].count++;

          } catch (e) {
            console.error(`Error processing sentiment entry for location ${location.id}:`, sentimentEntry, e);
          }
        });
      } else {
        console.warn("[Chart Effect]: not an array")
      }
    });

    // Convert aggregated data to chart format
    const calculatedChartData = Object.entries(dailyData)
      .map(([dateStr, { totalScore, count }]) => {
        const time = moment(dateStr, 'YYYY-MM-DD').valueOf();
        if (isNaN(time)) {
          console.warn(`[Chart Effect] Could not get valid time for date string: ${dateStr}`);
          return null;
        }
        return {
          time: time,
          value: count > 0 ? totalScore / count : 0,
        };
      })
      .filter((point): point is { time: number; value: number } => point !== null)
      .sort((a, b) => a.time - b.time);

    console.log(`[Chart Effect]: Calculated ${calculatedChartData.length} data points for aggregate chart.`);

    // Make it show up
    setChartData(calculatedChartData);
    setChartLoading(false);

    // Depend on filteredLocations (which depends on locations and visibleCategories)
    // Also depend on locationsLoading to wait until locations are ready
  }, [filteredLocations, locationsLoading]);


  // Event Handlers 
  const handleMarkerClick = useCallback((locationId: string) => {
    // UPDATE: Set both ID and Name 
    const clickedLocation = locations.find(loc => loc.id === locationId); // Find location data
    setSelectedLocationId(locationId);
    setSelectedLocationName(clickedLocation?.locationName || locationId); // Set name or fallback to ID
    console.log("Map marker clicked:", locationId);
    // TODO: Implement fetching/displaying location-specific skeets & updating chart
  }, [locations]); // Added locations dependency

  const handleCategoryToggle = useCallback((category: Category) => {
    setVisibleCategories(prev => ({ ...prev, [category]: !prev[category] }));
  }, []);

  // Reloading fetches locations, which triggers the initial selection effect
  const handleReloadLocations = useCallback(() => {
    setSelectedLocationId(null); // Clear selection
    setSelectedLocationName(null);
    // setDisplayedSkeets([]); // Clear skeets if you implement location-specific fetching
    // setLocationSkeetsLoading(true);
    reloadLocations(); // Trigger location refetch via hook
  }, [reloadLocations]);


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
        <section className="flex-grow flex flex-col">

          {/* Map Container */}
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
                selectedLocationId={selectedLocationId} // this makes it highlight 
              />
            )}
          </div>

          {/* Chart Container */}
          <div className="mt-3 p-3 bg-white rounded-lg shadow-md flex-shrink-0 h-[200px]">
            <h5 className="text-sm font-semibold text-gray-600 mb-1 text-center">
              {selectedLocationId ? `Sentiment Trend: ${selectedLocationName}` : 'Overall Sentiment'}
            </h5>
            <SentimentChart data={chartData} isLoading={chartLoading} error={null} />
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
