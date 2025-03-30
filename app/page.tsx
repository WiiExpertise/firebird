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
    // Don't calculate if base location data is still loading
    if (locationsLoading) {
      if (!chartLoading) setChartLoading(true);
      setChartData([]);
      return;
    }

    // look man, I know these are redundant, but its how I got it to work so im not getting rid of it
    setChartLoading(true);
    setChartData([]);
    let calculatedChartData: { time: number, value: number }[] = [];

    // Single Selected Location 
    if (selectedLocationId) {
      console.log(`[Chart Effect] Calculating chart data for selected location: ${selectedLocationId}`);
      const selectedLocation = locations.find(loc => loc.id === selectedLocationId);

      if (selectedLocation && Array.isArray(selectedLocation.avgSentimentList)) {
        calculatedChartData = selectedLocation.avgSentimentList
          .map(sentimentEntry => {
            try {
              const ts = sentimentEntry?.timeStamp;
              const avgSent = sentimentEntry?.averageSentiment;

              if (typeof ts !== 'string' || ts === '' || typeof avgSent !== 'number' || isNaN(avgSent)) {
                console.warn(`Skipping invalid sentiment entry for selected location ${selectedLocationId}:`, sentimentEntry);
                return null;
              }
              const entryMoment = moment(ts);
              if (!entryMoment.isValid()) {
                console.warn(`[Chart Effect] Skipping invalid timestamp for selected location ${selectedLocationId}:`, ts);
                return null;
              }
              // For single location, use the entry's timestamp directly
              const time = entryMoment.valueOf();
              return { time: time, value: avgSent };
            } catch (e) {
              console.error(`Error processing sentiment entry for selected location ${selectedLocationId}:`, sentimentEntry, e);
              return null;
            }
          })
          .filter((point): point is { time: number; value: number } => point !== null)
          .sort((a, b) => a.time - b.time); // Sort by time
      } else {
        console.log(`[Chart Effect] No data or invalid avgSentimentList for selected location: ${selectedLocationId}`);
      }
    }
    // AGGREGATE (Filtered Locations) 
    else {
      console.log("[Chart Effect] Calculating aggregate chart data for filtered locations:", filteredLocations.length);
      const dailyData: Record<string, { totalScore: number; count: number }> = {};
      let processedEntries = 0;

      filteredLocations.forEach(location => {
        if (Array.isArray(location.avgSentimentList)) {
          location.avgSentimentList.forEach(sentimentEntry => {
            try {
              const ts = sentimentEntry?.timeStamp;
              const avgSent = sentimentEntry?.averageSentiment;
              if (typeof ts !== 'string' || ts === '' || typeof avgSent !== 'number' || isNaN(avgSent)) return;
              const entryMoment = moment(ts);
              if (!entryMoment.isValid()) return;
              const dateStr = entryMoment.format('YYYY-MM-DD');
              if (!dailyData[dateStr]) { dailyData[dateStr] = { totalScore: 0, count: 0 }; }
              dailyData[dateStr].totalScore += avgSent;
              dailyData[dateStr].count++;
              processedEntries++;
            } catch (e) { console.error(`Error processing sentiment entry:`, sentimentEntry, e); }
          });
        }
      });

      calculatedChartData = Object.entries(dailyData)
        .map(([dateStr, { totalScore, count }]) => {
          const time = moment(dateStr, 'YYYY-MM-DD').valueOf();
          if (isNaN(time)) return null;
          return { time: time, value: count > 0 ? totalScore / count : 0 };
        })
        .filter((point): point is { time: number; value: number } => point !== null)
        .sort((a, b) => a.time - b.time);

      console.log(`[Chart Effect] Processed ${processedEntries} valid aggregate entries.`);
    }

    console.log(`[Chart Effect] Calculated ${calculatedChartData.length} data points.`);
    setChartData(calculatedChartData);
    setChartLoading(false);

    // Depend on selectedLocationId AND filteredLocations/locationsLoading
  }, [selectedLocationId, filteredLocations, locationsLoading, locations]);


  // Event Handlers 
  const handleMarkerClick = useCallback((locationId: string) => {
    if (locationId === selectedLocationId) return; // if same just return 

    const clickedLocation = locations.find(loc => loc.id === locationId); // Find location data
    setSelectedLocationId(locationId);
    setSelectedLocationName(clickedLocation?.locationName || locationId); // Set name or fallback to ID
    console.log("Map marker clicked:", locationId);
  }, [locations, selectedLocationId]);

  const handleCategoryToggle = useCallback((category: Category) => {
    setVisibleCategories(prev => ({ ...prev, [category]: !prev[category] }));
    // When category filter changes, clear selected location to show aggregate chart
    setSelectedLocationId(null);
    setSelectedLocationName(null);
  }, []);

  const handleReloadLocations = useCallback(() => {
    setSelectedLocationId(null);
    setSelectedLocationName(null);
    reloadLocations(); // This fetches new locations, chart effect will recalculate aggregate
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
          onReload={handleReloadLocations}
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
                selectedLocationId={selectedLocationId} // highlight uwu
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
