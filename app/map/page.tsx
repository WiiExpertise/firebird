"use client";
import React from "react";
import MenuBar from "@/components/MenuBar";

const MapPage: React.FC = () => {
  return (
    <div className="bg-stone-300 min-h-screen p-6 relative">
      <MenuBar />
      <div className="w-full max-w-7xl bg-red-100 p-10 mt-24 pt-10 rounded-xl shadow-lg relative">
        <h1 className="text-3xl font-bold text-black">Map</h1>
        <p className="mt-4 text-base text-black">
          Your map integration will go here. Stay tuned for updates!
        </p>
      </div>
    </div>
  );
};

export default MapPage;
