"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Accordion from "../../components/Accordion";
import axios from "axios";
import SortDropdown from "../../components/SortDropdown";

const AllDisasters: React.FC = () => {
  // Define initial disaster data on one line per entry
  const initialData = [
    { title: "There's a Wildfire!", category: "Wildfire", summary: "A large wildfire is spreading rapidly in the forest.", location: "California", severity: "High" },
    { title: "There's a Hurricane!", category: "Hurricane", summary: "A hurricane is making landfall along the coast.", location: "Florida", severity: "Severe" },
    { title: "There's an Earthquake!", category: "Earthquake", summary: "A major earthquake has struck downtown.", location: "San Francisco", severity: "Critical" }
  ];

  // Store original data and display (sorted/filtered) data separately
  const [originalData, setOriginalData] = useState(initialData);
  const [displayData, setDisplayData] = useState(initialData);
  const [numItems, setNumItems] = useState(displayData.length);

  useEffect(() => {
    axios.get("/api/hello")
      .then(response => console.log(response.data.message))
      .catch(error => console.error("Error fetching API:", error));
  }, []);

  // Whenever displayData changes, update the number of accordion items.
  useEffect(() => {
    setNumItems(displayData.length);
  }, [displayData]);

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

  // Compute unique categories from the original data.
  const uniqueCategories = Array.from(new Set(originalData.map(item => item.category)));

  // Optionally, functions to add or remove items.
  const addAccordionItem = () => {
    const newItem = { title: "New Disaster", category: "Wildfire", summary: "New summary", location: "New location", severity: "Low" };
    const newOriginalData = [...originalData, newItem];
    setOriginalData(newOriginalData);
    setDisplayData(newOriginalData);
  };

  const removeAccordionItem = () => {
    if (originalData.length > 0) {
      const newOriginalData = originalData.slice(0, originalData.length - 1);
      setOriginalData(newOriginalData);
      setDisplayData(newOriginalData);
    }
  };

  return (
    <div className="bg-stone-300 min-h-screen p-6 relative flex flex-col items-center">
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

      {/* Page Content */}
      <div className="w-full max-w-7xl bg-red-100 p-10 mt-24 pt-10 rounded-xl shadow-lg relative">
        <h1 className="text-3xl font-bold text-black mt-[-10px]">All Disasters</h1>
        <div className="absolute top-6 right-6">
          <SortDropdown 
            onSortAlphabetically={handleAlphabeticalSort} 
            onSortByCategory={handleCategorySort} 
            onResetSort={handleResetSort}
            categories={uniqueCategories}
          />
        </div>
        
        {/* Accordion Section */}
        <section className="mt-8">
          <div className="bg-red-600 p-4 rounded-lg shadow-md text-black">
            <Accordion 
              numItems={numItems} 
              data={displayData} 
              itemClass="bg-red-200 p-4 rounded-lg shadow-md" 
              dropdownIcon="/images/dropdown.png" 
            />
          </div>
        </section>
        
        {/* Controls */}
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
        </section>
      </div>
    </div>
  );
};

export default AllDisasters;
