"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Accordion from "../../components/Accordion";
import axios from "axios";

const AllDisasters: React.FC = () => {
  const [numItems, setNumItems] = useState(3);
  const [data, setData] = useState([
    { title: "There's a Fire!", summary: "A large fire has started in the city center.", location: "City Center, Downtown", severity: "High" },
    { title: "There's a Flood!", summary: "Flash flood in the coastal region.", location: "Coastal Region", severity: "Medium" },
    { title: "There's an Earthquake!", summary: "A Geodude used magnitude! Magnitude 10!", location: "Kanto Region", severity: "Severe" }
  ]);

  useEffect(() => {
    axios.get("/api/hello").then(response => console.log(response.data.message)).catch(error => console.error("Error fetching API:", error));
  }, []);

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
        <button className="absolute top-6 right-6">
        <img src="/images/sort.png" alt="Sort" className="w-6 h-6 cursor-pointer" />
        </button>
        
        {/* Accordion Section */}
        <section className="mt-8">
          <div className="bg-red-600 p-4 rounded-lg shadow-md text-black">
          <Accordion numItems={numItems} data={data} itemClass="bg-red-200 p-4 rounded-lg shadow-md" dropdownIcon="/images/dropdown.png" />
          </div>
        </section>
        
        {/* Controls */}
        <section className="mt-8">
          <button
            onClick={() => setNumItems(numItems + 1)} // Increase the number of accordion items
            className="bg-blue-500 text-white p-2 rounded"
          >
            Add Accordion Item
          </button>
          <button
            onClick={() => setNumItems(numItems - 1)} // Decrease the number of accordion items
            className="bg-red-500 text-white p-2 rounded ml-4"
            disabled={numItems <= 1}
          >
            Remove Accordion Item
          </button>
        </section>
      </div>
    </div>
  );
};

export default AllDisasters;
