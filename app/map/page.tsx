"use client";

import React, { useState, useEffect } from "react";
import MenuBar from "@/components/MenuBar";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Define a type for location data
type Location = {
  id: string;
  name: string;
  coordinates: [number, number];
  category: "Earthquake" | "Wildfire" | "Hurricane" | "Miscellaneous";
};

const MapPage: React.FC = () => {
  // Center of the US, don't change this
  const center: [number, number] = [39.8283, -98.5795];
  const [locations, setLocations] = useState<Location[]>([]);
  
  // State for tracking which disaster categories are visible
  const [visibleCategories, setVisibleCategories] = useState({
    Earthquake: true,
    Wildfire: true,
    Hurricane: true,
    Miscellaneous: true,
  });

  // This function simulates fetching location data.
  // Replace its contents with Firebase integration.
  const fetchLocations = async () => {
    const sampleLocations: Location[] = [
      { id: "1", name: "New York", coordinates: [40.7128, -74.0060], category: "Hurricane" },
      { id: "2", name: "Los Angeles", coordinates: [34.0522, -118.2437], category: "Wildfire" },
      { id: "3", name: "Chicago", coordinates: [41.8781, -87.6298], category: "Miscellaneous" },
      { id: "4", name: "Houston", coordinates: [29.7604, -95.3698], category: "Earthquake" },
      { id: "5", name: "Phoenix", coordinates: [33.4484, -112.0740], category: "Wildfire" },
    ];
    setLocations(sampleLocations);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Toggle visibility for a given category
  const handleCheckboxChange = (category: keyof typeof visibleCategories) => {
    setVisibleCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="bg-stone-300 min-h-screen p-6 relative">
      <MenuBar />
      <div className="w-full max-w-7xl bg-red-100 p-10 mt-24 pt-10 rounded-xl shadow-lg relative">
        <h1 className="text-3xl font-bold text-black mb-4">Map</h1>
        <div style={{ height: "600px", width: "100%" }}>
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
            {locations
              .filter((location) => visibleCategories[location.category])
              .map((location) => (
                <CircleMarker
                  key={location.id}
                  center={location.coordinates}
                  radius={5}
                  color="blue"
                  fillColor="blue"
                  fillOpacity={0.8}
                >
                  <Popup>{location.name}</Popup>
                </CircleMarker>
              ))}
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
              <label className="text-black">
                <input
                  type="checkbox"
                  checked={visibleCategories.Miscellaneous}
                  onChange={() => handleCheckboxChange("Miscellaneous")}
                />{" "}
                Miscellaneous
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
