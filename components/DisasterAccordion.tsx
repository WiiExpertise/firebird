"use client";
import React, { useState, useEffect, useCallback } from "react";
import Accordion from "../components/Accordion";
import SortDropdown from "../components/SortDropdown";
import { Location } from "../app/types/locations";

interface DisasterAccordionProps {
  locations: Location[];
}

function calculateSeverity(sentiments: number[], skeets: number[]): string {
  const avgSent = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
  const avgSkeets = skeets.reduce((a, b) => a + b, 0) / skeets.length;

  if (avgSkeets > 100 || avgSent < -0.5) return "Critical";
  if (avgSkeets > 50 || avgSent < 0) return "High";
  if (avgSkeets > 20) return "Medium";
  return "Low";
}

const DisasterAccordion: React.FC<DisasterAccordionProps> = ({ locations }) => {
  const [accordionData, setAccordionData] = useState<any[]>([]);

  const transformLocations = useCallback((locs: Location[]) => {
    return locs.map(loc => {
      const avgSentiments = loc.avgSentimentList?.map(e => e.averageSentiment) || [];
      const severity = calculateSeverity(avgSentiments, Array(avgSentiments.length).fill(0)); // no skeets data for now
  
      return {
        title: loc.locationName,
        summary: '', // Placeholder
        location: loc.locationName,
        severity,
        timestamp: loc.lastSkeetTimestamp,
        formattedAddress: loc.formattedAddress,
        lat: loc.lat,
        long: loc.long,
        avgSentimentList: avgSentiments,
        skeetsAmountList: [ 45, 90, 20], // Optional: empty for now
        timestamps: loc.avgSentimentList?.map(e => e.timeStamp),
        category: loc.category
      };
    });
  }, []);
  

  useEffect(() => {
    setAccordionData(transformLocations(locations));
  }, [locations, transformLocations]);

  const handleAlphabeticalSort = (order: "asc" | "desc") => {
    const sorted = [...accordionData].sort((a, b) =>
      order === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    );
    setAccordionData(sorted);
  };

  const handleCategorySort = (category: string) => {
    const filtered = transformLocations(locations.filter(loc => loc.category === category));
    setAccordionData(filtered);
  };

  const handleResetSort = () => {
    setAccordionData(transformLocations(locations));
  };

  const handleDateSort = (order: "asc" | "desc") => {
    const sorted = [...accordionData].sort((a, b) => {
      const d1 = new Date(a.timestamp).getTime();
      const d2 = new Date(b.timestamp).getTime();
      return order === "asc" ? d1 - d2 : d2 - d1;
    });
    setAccordionData(sorted);
  };

  const uniqueCategories = Array.from(new Set(locations.map(loc => loc.category)));

  return (
    <div className="p-3 bg-white rounded-lg shadow-md max-h-[230px] overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h5 className="text-sm font-semibold text-gray-600 text-center flex-1">
          {accordionData.length > 0 ? 'ALL DISASTERS' : 'No Disasters Found'}
        </h5>
        <SortDropdown
          onSortAlphabetically={handleAlphabeticalSort}
          onSortByCategory={handleCategorySort}
          onResetSort={handleResetSort}
          onSortByDate={handleDateSort}
          categories={uniqueCategories}
        />
      </div>
      <Accordion
        data={accordionData}
        itemClass="bg-white p-4 rounded-lg shadow border"
        dropdownIcon="/images/dropdown.png"
      />
    </div>
  );
};

export default DisasterAccordion;
