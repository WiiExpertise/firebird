"use client";
import React, { useState, useEffect } from "react";
import Accordion from "../../components/Accordion";
import axios from "axios";
import SortDropdown from "../../components/SortDropdown";
import MenuBar from "@/components/MenuBar";

function calculateSeverity(sentiments: number[], skeets: number[]): string {
  const avgSent = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
  const avgSkeets = skeets.reduce((a, b) => a + b, 0) / skeets.length;

  if (avgSkeets > 100 || avgSent < -0.5) return "Critical";
  if (avgSkeets > 50 || avgSent < 0) return "High";
  if (avgSkeets > 20) return "Medium";
  return "Low";
}

const AllDisasters: React.FC = () => {
  // Define initial disaster data on one line per entry
  const initialData = [
      { title: "There's a Wildfire!", category: "Wildfire", summary: "A large wildfire is spreading rapidly in the forest.", location: "Yosemite National Park", formattedAddress: "123 Forest Lane, CA", lat: 37.8651, long: -119.5383, avgSentimentList: [-0.2, 0.1, 0.4], skeetsAmountList: [45, 60, 80], timestamps: ["2025-03-03T10:00:00Z", "2025-03-04T10:00:00Z", "2025-03-05T10:00:00Z",], timestamp: "2025-03-05T10:00:00Z" },
      { title: "There's a Hurricane!", category: "Hurricane", summary: "A hurricane is making landfall along the coast.", location: "Miami Beach", formattedAddress: "456 Ocean Drive, FL", lat: 25.7617, long: -80.1918, avgSentimentList: [-0.4, -0.3, -0.1], skeetsAmountList: [60, 90, 120], timestamps: [ "2025-03-02T08:30:00Z", "2025-03-03T08:30:00Z", "2025-03-04T08:30:00Z", ], timestamp: "2025-03-04T08:30:00Z", },
      { title: "There's an Earthquake!", category: "Earthquake", summary: "A major earthquake has struck downtown.", location: "San Francisco", formattedAddress: "789 Market Street, CA", lat: 37.7749, long: -122.4194, avgSentimentList: [-0.8, -0.6, -0.4], skeetsAmountList: [100, 150, 130], timestamps: [ "2025-03-01T15:00:00Z", "2025-03-02T15:00:00Z", "2025-03-03T15:00:00Z", ], timestamp: "2025-03-03T15:00:00Z",},
    ].map(item => ({
      ...item,
      severity: calculateSeverity(item.avgSentimentList, item.skeetsAmountList)
    }));

  // Store original data and display (sorted/filtered) data separately
  const [originalData, setOriginalData] = useState(initialData);
  const [displayData, setDisplayData] = useState(initialData);
  // const [numItems, setNumItems] = useState(displayData.length); NO LONGER NEEDED

  useEffect(() => {
    axios.get("/api/hello")
      .then(response => console.log(response.data.message))
      .catch(error => console.error("Error fetching API:", error));
  }, []);

  // // Whenever displayData changes, update the number of accordion items.
  // useEffect(() => {
  //   setNumItems(displayData.length);
  // }, [displayData]);

  // Sort the displayed data alphabetically by title.
  const handleAlphabeticalSort = (order: "asc" | "desc") => {
    const sortedData = [...displayData].sort((a, b) => {
      return order === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    });
    setDisplayData(sortedData);
  };

  // Filter the data by category.
  const handleCategorySort = (category: string) => {
    const filteredData = originalData.filter(item => item.category === category);
    setDisplayData(filteredData);
  };

  // Reset sorting/filtering to show all original data.
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

  // Compute unique categories from the original data.
  const uniqueCategories = Array.from(new Set(originalData.map(item => item.category)));

  return (
    <div className="bg-stone-300 min-h-screen p-6 relative flex flex-col items-center">
      <MenuBar />
      {/* Page Content */}
      <div className="w-full max-w-7xl bg-red-100 p-10 mt-24 pt-10 rounded-xl shadow-lg relative">
        <h1 className="text-3xl font-bold text-black mt-[-10px]">All Disasters</h1>
        <div className="absolute top-6 right-6">
          <SortDropdown
            onSortAlphabetically={handleAlphabeticalSort}
            onSortByCategory={handleCategorySort}
            onResetSort={handleResetSort}
            onSortByDate={handleDateSort}
            categories={uniqueCategories}
          />
        </div>

        {/* Accordion Section */}
        <section className="mt-8">
          <div className="bg-red-600 p-4 rounded-lg shadow-md text-black">
            <Accordion
              // numItems={numItems}
              data={displayData}
              itemClass="bg-red-200 p-4 rounded-lg shadow-md"
              dropdownIcon="/images/dropdown.png"
            />
          </div>
        </section>

        {/* Controls 
        <section className="mt-8">
          <button
            onClick={addAccordionItem}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Add Accordion Item
          </button>
          <button
            onClick={removeAccordionItem}
            className="bg-red-500 text-white p-2 rounded ml-4"
            disabled={originalData.length <= 1}
          >
            Remove Accordion Item
          </button>
        </section> */}
      </div>
    </div>
  );
};

export default AllDisasters;
