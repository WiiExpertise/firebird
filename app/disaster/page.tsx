"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import moment from "moment"
import Link from "next/link";

import { useDisasters } from '../hooks/useDisasters';
import { useHospitals } from '../hooks/useHospitals';
import { skeetCache } from '../cache/skeetCache';

import { Skeet } from '../types/skeets';
import { Hospital } from '../types/hospital';
import { DisasterData, DisasterCategory, DisasterCounts } from '../types/disasters';

// components 
// import FilterBar from "../components/Disaster/DisasterFilterBar";
import SideBarFeed from "../components/SideBarFeed";
// import DisasterAccordion from "../components/Disaster/DisasterAccordion";

import dynamic from 'next/dynamic';
const DisasterMap = dynamic(
  () => import('../components/Disaster/DisasterMap'),
  {
    ssr: false,
    loading: () => <div className="h-full flex items-center justify-center text-gray-500">Loading Map...</div>
  }
);

import DisasterListTable from '../components/Disaster/DisasterListTable';
import { haversineDistance, kmToMiles } from '../utils/disasterUtils';
import DisasterAccordion from "../components/Disaster/DisasterAccordion";


// Initial map settings
const INITIAL_MAP_CENTER: [number, number] = [39.8283, -98.5795];
const INITIAL_MAP_ZOOM = 4;
const HOSPITAL_PROXIMITY_MILES = 50;

// Helper to map DisasterCounts to the format expected by SidebarFeed
const mapDisasterCountsToCategoryRecord = (
  counts: DisasterCounts | undefined
): Record<DisasterCategory | string, number> => {
  if (!counts) return { wildfire: 0, hurricane: 0, earthquake: 0, "non-disaster": 0 };
  return {
    wildfire: counts.FireCount,
    hurricane: counts.HurricaneCount,
    earthquake: counts.EarthquakeCount,
    "non-disaster": counts.NonDisasterCount, // Map NonDisasterCount
  };
};


export default function Disaster() {
  // --- State ---
  const { disasters, isLoading: isLoadingDisasters, error: errorDisasters, reloadDisasters } = useDisasters();
  const { hospitals, isLoading: isLoadingHospitals, error: errorHospitals } = useHospitals();
  const [selectedDisasterId, setSelectedDisasterId] = useState<string | null>(null);
  const [selectedDisasterSkeets, setSelectedDisasterSkeets] = useState<Skeet[]>([]);
  const [isLoadingSkeets, setIsLoadingSkeets] = useState<boolean>(false);
  const [errorSkeets, setErrorSkeets] = useState<string | null>(null);
  const [showHospitals, setShowHospitals] = useState(false);

  // Initialize skeet cache
  useEffect(() => {
    skeetCache.initialize();
  }, []);

  // Subscribe to skeet cache updates
  useEffect(() => {
    const unsubscribe = skeetCache.subscribe(() => {
      if (selectedDisasterId) {
        setSelectedDisasterSkeets(skeetCache.getSkeets(selectedDisasterId));
      }
    });

    return () => unsubscribe();
  }, [selectedDisasterId]);

  // Find the full selected disaster object
  const selectedDisaster = React.useMemo(() => {
    return disasters.find(d => d.ID === selectedDisasterId) || null;
  }, [selectedDisasterId, disasters]);

  // --- Filter Nearby Hospitals ---
  const nearbyHospitals = useMemo(() => {
    if (!selectedDisaster || !selectedDisaster.Lat || !selectedDisaster.Long || hospitals.length === 0) {
      return []; // No disaster selected or no hospitals loaded
    }

    console.log(`Filtering hospitals near disaster ${selectedDisaster.ID} (Centroid: ${selectedDisaster.Lat}, ${selectedDisaster.Long})`);

    const nearby: Hospital[] = [];
    for (const hospital of hospitals) {
      // Ensure hospital has valid parsed coordinates
      if (typeof hospital.lat !== 'number' || typeof hospital.lon !== 'number') {
        continue;
      }
      const distanceKm = haversineDistance(selectedDisaster.Lat, selectedDisaster.Long, hospital.lat, hospital.lon);
      const distanceMiles = kmToMiles(distanceKm);

      if (distanceMiles <= HOSPITAL_PROXIMITY_MILES) {
        console.log(`  Found nearby hospital: ${hospital.name} (${distanceMiles.toFixed(1)} miles)`);
        nearby.push(hospital);
      }
    }
    console.log(`Found ${nearby.length} hospitals within ${HOSPITAL_PROXIMITY_MILES} miles.`);
    return nearby;
  }, [selectedDisaster, hospitals]); // Recalculate when selection or hospital list changes

  // --- Fetching Logic ---
  const fetchSkeetsForDisaster = useCallback(async (disaster: DisasterData | null) => {
    if (!disaster) {
      setSelectedDisasterSkeets([]);
      setIsLoadingSkeets(false);
      setErrorSkeets(null);
      return;
    }

    setIsLoadingSkeets(true);
    setErrorSkeets(null);

    try {
      // Fetch skeets for each location in the disaster
      const locationPromises = disaster.LocationIDs.map(locationId => 
        skeetCache.fetchSkeets(locationId)
      );
      await Promise.all(locationPromises);

      // Combine skeets from all locations
      const allSkeets = disaster.LocationIDs.flatMap(locationId => 
        skeetCache.getSkeets(locationId)
      );

      // Sort by timestamp, newest first
      allSkeets.sort((a, b) => moment(b.timestamp).valueOf() - moment(a.timestamp).valueOf());

      // Remove duplicates based on id
      const uniqueSkeets = allSkeets.filter((skeet, index, self) =>
        index === self.findIndex(s => s.id === skeet.id)
      );

      setSelectedDisasterSkeets(uniqueSkeets);
    } catch (err) {
      console.error('Error fetching skeets:', err);
      setErrorSkeets('Failed to load skeets for this disaster');
    } finally {
      setIsLoadingSkeets(false);
    }
  }, []);

  useEffect(() => {
    fetchSkeetsForDisaster(selectedDisaster);
  }, [selectedDisaster, fetchSkeetsForDisaster]);

  const handleDisasterSelect = (disasterId: string) => {
    console.log("Table/Map selection received for disaster:", disasterId);
    setSelectedDisasterId(prevId => (prevId === disasterId ? null : disasterId));
    // Don't automatically show hospitals when a disaster is selected
    // This will be handled by the hospitalsToShow logic
  };

  const handleHospitalToggle = () => {
    setShowHospitals(prev => !prev);
  };

  // Determine which hospitals to show based on toggle state and selection
  const hospitalsToShow = useMemo(() => {
    if (showHospitals) {
      // When toggle is on, show all hospitals regardless of selection
      return hospitals;
    } else if (selectedDisasterId) {
      // When a disaster is selected and toggle is off, show nearby hospitals
      return nearbyHospitals;
    }
    // Otherwise show no hospitals
    return [];
  }, [showHospitals, selectedDisasterId, hospitals, nearbyHospitals]);

  // --- Prepare Props for Sidebar ---
  const sidebarSummaryStats = React.useMemo(() => {
    return {
      averageSentiment: selectedDisaster?.ClusterSentiment ?? 0,
      categoryCounts: mapDisasterCountsToCategoryRecord(selectedDisaster?.ClusterCounts),
      totalSkeets: selectedDisasterSkeets.length,
    };
  }, [selectedDisaster, selectedDisasterSkeets.length]);

  const sidebarTitle = selectedDisaster
    ? `Disaster: ${selectedDisaster.DisasterType} (${selectedDisaster.Severity || 'N/A'})`
    : null;

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col md:flex-row">

      <main className="flex-1 p-4 flex flex-col overflow-hidden">
      <header className="flex justify-between items-center mb-4 flex-shrink-0">
          <h1 className="text-2xl font-bold text-miko-pink-dark">Disaster Overview</h1>

          <div className="flex flex-col items-end space-y-2">
            <Link href="/">
              <button className="bg-miko-pink-dark hover:bg-miko-pink-light text-white font-semibold px-4 py-2 rounded shadow transition duration-200">
                Back to Home
              </button>
            </Link>

            {/* <button
              onClick={reloadDisasters}
              disabled={isLoadingDisasters}
              className="bg-miko-pink-dark hover:bg-miko-pink-light text-white font-semibold px-4 py-2 rounded shadow transition duration-200 disabled:opacity-50"
            >
              {isLoadingDisasters ? "Reloading..." : "Reload Disasters"}
            </button> */}
          </div>
        </header>


        <section className="bg-white rounded-lg shadow-md overflow-hidden h-[60vh] flex-shrink-0">
          {/* Conditional Rendering for Map */}
          {!isLoadingDisasters && !errorDisasters && (
            <DisasterMap
              disasters={disasters}
              center={INITIAL_MAP_CENTER}
              zoom={INITIAL_MAP_ZOOM}
              onDisasterClick={handleDisasterSelect}
              selectedDisasterId={selectedDisasterId}
              hospitals={hospitalsToShow}
              reloadDisasters={reloadDisasters}
              isLoadingDisasters={isLoadingDisasters}
              showHospitals={showHospitals}
              onToggleHospitals={handleHospitalToggle}
            />
          )}
          {isLoadingDisasters && <div className="h-full flex items-center justify-center text-gray-600">Loading map data...</div>}
          {errorDisasters && <div className="h-full flex items-center justify-center text-red-600">Error loading disasters: {errorDisasters}</div>}
        </section>

        {/* Disaster List Table Container - Takes remaining space and handles internal scrolling */}
        <section className="mt-4 bg-white rounded-lg shadow-md flex flex-col flex-grow min-h-0">
          <div className="flex-1 overflow-y-auto">
            {!isLoadingDisasters && !errorDisasters && (
              <DisasterListTable
              disasters={disasters}
              selectedDisasterId={selectedDisasterId}
              onDisasterSelect={handleDisasterSelect}
            />
            )}
            {isLoadingDisasters && <p className="p-4 text-gray-500">Loading list...</p>}
            {errorDisasters && <p className="p-4 text-red-500">Error loading list.</p>}
          </div>
        </section>

      </main>


      {/* Sidebar Area */}
      <div className="hidden lg:flex flex-shrink-0">
        <SideBarFeed
          skeets={selectedDisasterSkeets}
          isLoading={isLoadingSkeets}
          error={errorSkeets}
          summaryStats={sidebarSummaryStats}
          selectedLocationName={sidebarTitle}
        />
      </div>


    </div>
  );

}
