"use client";
import { useState } from "react";
import SortDropdown from "../../components/SortDropdown";
import { TweetsSidebar } from "../../components/TweetsSidebar";
import MenuBar from "@/components/MenuBar";

export default function FirebirdDashboard() {

  const initialData = [
    { name: "Wildfire Disaster", category: "Wildfire", keyInfo: "Key Info", reliefCenter: "Nearest Relief Center", timestamp: "2025-03-05T10:00:00Z" },
    { name: "Hurricane Disaster", category: "Hurricane", keyInfo: "Key Info", reliefCenter: "Nearest Relief Center", timestamp: "2025-03-04T08:30:00Z" },
    { name: "Earthquake Disaster", category: "Earthquake", keyInfo: "Key Info", reliefCenter: "Nearest Relief Center", timestamp: "2025-03-03T15:00:00Z" }
  ];

  // Maintain original data and display data (for sorting/filtering).
  const [originalData] = useState(initialData);
  const [displayData, setDisplayData] = useState(initialData);

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

  // Filter the data by date.
  const handleDateSort = (order: "asc" | "desc") => {
    const sortedData = [...displayData].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return order === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
    setDisplayData(sortedData);
  };

  // Extract unique categories for the dropdown.
  const uniqueCategories = Array.from(new Set(originalData.map((item) => item.category)));

  return (
    <div className="bg-stone-300 min-h-screen p-4 relative">
      <MenuBar />
      <div className="flex flex-col sm:flex-row gap-6 items-start pt-24 max-w-full">
        <main className="w-full sm:max-w-[70%] sm:mr-8 mb-6 sm:mb-0">
          {/* Integrate the sorting menu */}
          <div className="flex justify-end mb-4">
            <SortDropdown
              onSortAlphabetically={handleAlphabeticalSort}
              onSortByCategory={handleCategorySort}
              onResetSort={handleResetSort}
              onSortByDate={handleDateSort}
              categories={uniqueCategories}
            />
          </div>
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
