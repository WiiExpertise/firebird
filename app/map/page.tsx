"use client";

import React, { useState, useEffect } from "react";
import MenuBar from "@/components/MenuBar";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { DateRangePicker, RangeKeyDict, Range } from "react-date-range";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import "leaflet/dist/leaflet.css";
import './DateRangePicker.css';
import { db } from "../../firebase"; // Import Firebase
import { collection, query, limit, getDocs, where } from "firebase/firestore";

// Define a type for each sentiment entry in the avgSentimentList
type AvgSentiment = {
  timeStamp: string;
  skeetsAmount: number;
  averageSentiment: number;
};

type Category = "Earthquake" | "Wildfire" | "Hurricane" | "Miscellaneous";
// Update Location to reflect the Firestore data format
type Location = {
  id: string; // The Firestore document ID
  locationName: string;
  formattedAddress: string;
  type: "LOCATION"; // You can add other string literals if needed
  avgSentimentList: AvgSentiment[];
  lat: number;
  long: number;
  newLocation: boolean;
  category: Category
};

type CircleMarkerProps = {
  key: string;
  center: [number, number];
  radius: number;
  color: string;
  fillColor: string;
  fillOpacity: number;
};

const getCircleMarkerProps = (
  location: Location,
  isFiltered: boolean
): CircleMarkerProps => {
  const markerColor = isFiltered ? "red" : "gray";
  return {
    key: `${location.id}-${isFiltered}`,
    center: [location.lat, location.long],
    radius: 5,
    color: markerColor,
    fillColor: markerColor,
    fillOpacity: isFiltered ? 0.8 : 0.3,
  };
};

// Function to save location data to cache
const saveLocationDataToCache = (data: Location[]) => {
  localStorage.setItem("mapLocationCache", JSON.stringify(data));
};

// Function to read location data from cache
const readLocationDataFromCache = (): Location[] | null => {
  const data = localStorage.getItem("mapLocationCache");
  return data ? JSON.parse(data) : null;
};

// Function to get a random category
const getRandomCategory = (): Category => {
  const categories: Category[] = ["Earthquake", "Wildfire", "Hurricane", "Miscellaneous"];
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex];
};


const MapPage: React.FC = () => {
  // Center of the US, don't change this
  const center: [number, number] = [39.8283, -98.5795];
  const [_, setLocations] = useState<Location[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [useCache, setUseCache] = useState(true); // State to control cache usage

  // State for tracking which disaster categories are visible
  const [visibleCategories, setVisibleCategories] = useState({
    Earthquake: true,
    Wildfire: true,
    Hurricane: true,
    Miscellaneous: true,
  });
  const [dateRange, setDateRange] = useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [isDateFilterEnabled, setIsDateFilterEnabled] = useState(false);

  // Fetch location data from Firebase with caching
  const fetchLocations = async () => {
    const cachedData = readLocationDataFromCache();
    console.log(cachedData)

    // WARNING: TESTING 
    //if (cachedData && useCache) {
    // setLocations(cachedData);
    //setAllLocations(cachedData);
    //console.log("Read from cache");
    //return;
    //}
    console.log("Query DB");

    // If no cache or cache is disabled, fetch from Firestore
    const locationsRef = collection(db, "locations");
    const locationsQuery = query(
      locationsRef,
      where("formattedAddress", "!=", ""), // this speciifes that we are only getting valid locations 
      limit(10)
    );

    const snapshot = await getDocs(locationsQuery);
    const locationData = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        locationName: data.locationName,
        formattedAddress: data.formattedAddress,
        type: data.type, // Assuming this is always "LOCATION"
        avgSentimentList: data.avgSentimentList,
        lat: data.lat,
        long: data.long,
        newLocation: data.newLocation,
        category: getRandomCategory()
      } as Location;
    });
    console.log(locationData)


    setLocations(locationData);
    setAllLocations(locationData);

    // Save to cache for future use
    saveLocationDataToCache(locationData);

  };

  useEffect(() => {
    fetchLocations();
  }, [useCache]);

  // Toggle visibility for a given category
  const handleCheckboxChange = (category: keyof typeof visibleCategories) => {
    setVisibleCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Filter locations based on selected categories and date range
  const filteredLocations = allLocations.filter((location) => {
    const locationDate = new Date(); // this was location.timestamp
    const { startDate, endDate } = dateRange[0];
    return (
      visibleCategories[location.category] &&
      (!isDateFilterEnabled || (locationDate >= (startDate || new Date()) && locationDate <= (endDate || new Date())))
    );
  });

  return (
    <div className="bg-stone-300 min-h-screen p-6 relative">
      <div className="fixed top-0 left-0 w-full z-50">
        <MenuBar />
      </div>
      <div className="w-full max-w-7xl bg-red-100 p-10 mt-24 pt-10 rounded-xl shadow-lg relative">
        <h1 className="text-3xl font-bold text-black mb-4">Map</h1>
        <div className="relative z-0" style={{ height: "600px", width: "100%" }}>
          <MapContainer
            center={center}
            zoom={5}
            scrollWheelZoom={false}
            dragging={true}
            zoomControl={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
              detectRetina={true}
            />

            {allLocations.map((location) => {
              const isFiltered = filteredLocations.includes(location);
              const markerProps = getCircleMarkerProps(location, isFiltered);
              const { key, ...restProps } = markerProps;
              return (
                <CircleMarker key={key} {...restProps} eventHandlers={{
                  click: () => console.log(location)
                }}>
                  <Popup>{location.formattedAddress}</Popup>
                </CircleMarker>
              );
            })}

          </MapContainer>
        </div>
        {/* Checkbox filter section */}
        <div className="mt-4 flex justify-end">
          <div className="p-4 border border-gray-300 rounded-lg shadow-md bg-white w-fit">
            <div className="flex space-x-4">
              <label className="text-black">
                <input
                  type="checkbox"
                  checked={visibleCategories.Earthquake}
                  onChange={() => handleCheckboxChange("Earthquake")}
                />{" "}
                Earthquake
              </label>
              <label className="text-black">
                <input
                  type="checkbox"
                  checked={visibleCategories.Wildfire}
                  onChange={() => handleCheckboxChange("Wildfire")}
                />{" "}
                Wildfire
              </label>
              <label className="text-black">
                <input
                  type="checkbox"
                  checked={visibleCategories.Hurricane}
                  onChange={() => handleCheckboxChange("Hurricane")}
                />{" "}
                Hurricane
              </label>
              {/* <label className="text-black">
                <input
                  type="checkbox"
                  checked={visibleCategories.Miscellaneous}
                  onChange={() => handleCheckboxChange("Miscellaneous")}
                />{" "}
                Non-Disaster
              </label> */}
              <label className="text-black">
                <input
                  type="checkbox"
                  checked={isDateFilterEnabled}
                  onChange={() => setIsDateFilterEnabled(!isDateFilterEnabled)}
                />{" "}
                Filter By Date
              </label>
            </div>
            {isDateFilterEnabled && (
              <div className="mt-4">
                <DateRangePicker
                  ranges={dateRange}
                  onChange={(item: RangeKeyDict) => {
                    const selection = item.selection;
                    setDateRange([{
                      startDate: selection.startDate || new Date(),
                      endDate: selection.endDate || new Date(),
                      key: selection.key
                    }]);
                  }}
                />
              </div>
            )}
          </div>
        </div>
        {/* Reload button */}
        <div className="mt-4 flex justify-end">
          <button
            className="p-2 bg-blue-500 text-white rounded-lg shadow-md"
            onClick={() => setUseCache(false)}
          >
            Reload Locations
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
