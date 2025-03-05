"use client";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import SortDropdown from "../../components/SortDropdown";
import { TweetsSidebar } from "../components/TweetsSidebar";

export default function FirebirdDashboard() {
  // Initial disaster data without an image property.
  const initialData = [
    { name: "Wildfire Disaster", category: "Wildfire", keyInfo: "Key Info", reliefCenter: "Nearest Relief Center" },
    { name: "Hurricane Disaster", category: "Hurricane", keyInfo: "Key Info", reliefCenter: "Nearest Relief Center" },
    { name: "Earthquake Disaster", category: "Earthquake", keyInfo: "Key Info", reliefCenter: "Nearest Relief Center" },
    { name: "Another Wildfire", category: "Wildfire", keyInfo: "Key Info", reliefCenter: "Nearest Relief Center" }
  ];

  // Maintain original data and display data (for sorting/filtering).
  const [originalData] = useState(initialData);
  const [displayData, setDisplayData] = useState(initialData);

  useEffect(() => {
    axios
      .get("/api/hello")
      .then((response) => console.log(response.data.message))
      .catch((error) => console.error("Error fetching API:", error));
  }, []);

  // Helper function: returns image path based on disaster category.
  const getImageByCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case "wildfire":
        return "/images/wildfire.jpg";
      case "hurricane":
        return "/images/hurricane.jpg";
      case "earthquake":
        return "/images/earthquake.jpg";
      default:
        return "/images/default.jpg";
    }
  };

  // Sort displayData alphabetically by 'name'
  const handleAlphabeticalSort = (order: "asc" | "desc") => {
    const sortedData = [...displayData].sort((a, b) =>
      order === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
    setDisplayData(sortedData);
  };

  // Filter data by category.
  const handleCategorySort = (category: string) => {
    const filteredData = originalData.filter((item) => item.category === category);
    setDisplayData(filteredData);
  };

  // Reset to the original unsorted/unfiltered data.
  const handleResetSort = () => {
    setDisplayData(originalData);
  };

  // Extract unique categories for the dropdown.
  const uniqueCategories = Array.from(new Set(originalData.map((item) => item.category)));

  return (
    <div className="bg-stone-300 min-h-screen p-6 relative">
      <header className="bg-red-600/90 text-white p-4 w-full fixed top-2 left-0 z-50 rounded-2xl mt-2">
        <div className="flex justify-between items-center">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-white">🔥 Firebird</h1>
          </Link>
          <nav className="space-x-4">
            <Link href="/alldisasters">
              <button className="hover:underline text-white">All Disasters</button>
            </Link>
            <Link href="/map">
              <button className="hover:underline text-white">Map</button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex gap-6 items-start pt-24 max-w-full">
        <main className="flex-1 max-w-[70%] mr-8">
          {/* Integrate the sorting menu */}
          <div className="flex justify-end mb-4">
            <SortDropdown
              onSortAlphabetically={handleAlphabeticalSort}
              onSortByCategory={handleCategorySort}
              onResetSort={handleResetSort}
              categories={uniqueCategories}
            />
          </div>
          {/* Disaster cards displayed in a 2-column grid */}
          <section className="grid grid-cols-2 gap-6 mb-8 mr-8">
            {displayData.map((disaster, index) => (
              <div
                key={index}
                className="bg-red-100 p-6 rounded-lg shadow-md text-red-600 flex flex-col items-center justify-center text-center"
              >
                <img
                  src={getImageByCategory(disaster.category)}
                  alt={disaster.name}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <h3 className="text-2xl font-bold mb-2 text-red-700">{disaster.name}</h3>
                <div className="mt-2 space-y-2">
                  <p className="text-base text-red-500 font-medium">{disaster.keyInfo}</p>
                  <p className="text-base text-red-500 font-medium">{disaster.reliefCenter}</p>
                </div>
              </div>
            ))}
          </section>
        </main>
        <TweetsSidebar />
      </div>
    </div>
  );
}
