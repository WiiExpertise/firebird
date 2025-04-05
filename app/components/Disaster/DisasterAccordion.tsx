"use client";
import React, { useState, useEffect, useCallback } from "react";
import Accordion from "../../../components/Accordion";
import SortDropdown from "../../../components/SortDropdown";
import { DisasterData } from "../../types/disasters";

interface DisasterAccordionProps {
  disasters: DisasterData[];
}

function classifySeverity(sentiment: number, totalSkeets: number): string {
  if (totalSkeets > 100 || sentiment < -0.5) return "Critical";
  if (totalSkeets > 50 || sentiment < 0) return "High";
  if (totalSkeets > 20) return "Medium";
  return "Low";
}

const DisasterAccordion: React.FC<DisasterAccordionProps> = ({ disasters }) => {
  const [accordionData, setAccordionData] = useState<any[]>([]);

  const transformDisasters = useCallback((disasters: DisasterData[]) => {
    return disasters.map(disaster => {
      const severity = classifySeverity(disaster.ClusterSentiment, disaster.TotalSkeetsAmount);

      return {
        title: `${disaster.DisasterType} (${disaster.Severity || "N/A"})`,
        summary: disaster.Summary || "No summary available.",
        location: `Lat: ${disaster.Lat.toFixed(2)}, Long: ${disaster.Long.toFixed(2)}`,
        severity,
        timestamp: disaster.LastUpdate || disaster.ReportedDate,
        sentiment: disaster.ClusterSentiment.toFixed(2),
        totalSkeets: disaster.TotalSkeetsAmount,
        category: disaster.DisasterType
      };
    });
  }, []);

  useEffect(() => {
    setAccordionData(transformDisasters(disasters));
  }, [disasters, transformDisasters]);

  const handleAlphabeticalSort = (order: "asc" | "desc") => {
    const sorted = [...accordionData].sort((a, b) =>
      order === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    );
    setAccordionData(sorted);
  };

  const handleCategorySort = (category: string) => {
    const filtered = transformDisasters(disasters.filter(d => d.DisasterType === category));
    setAccordionData(filtered);
  };

  const handleResetSort = () => {
    setAccordionData(transformDisasters(disasters));
  };

  const handleDateSort = (order: "asc" | "desc") => {
    const sorted = [...accordionData].sort((a, b) => {
      const d1 = new Date(a.timestamp).getTime();
      const d2 = new Date(b.timestamp).getTime();
      return order === "asc" ? d1 - d2 : d2 - d1;
    });
    setAccordionData(sorted);
  };

  const uniqueCategories = Array.from(new Set(disasters.map(d => d.DisasterType)));

  return (
    <div className="p-3 bg-white rounded-lg shadow-md max-h-[230px] overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h5 className="text-sm font-semibold text-gray-600 text-center flex-1">
          {accordionData.length > 0 ? 'ALL DISASTERS' : 'No Disasters Found'}
        </h5>
        {accordionData.length > 0 && (
          <SortDropdown
            onSortAlphabetically={handleAlphabeticalSort}
            onSortByCategory={handleCategorySort}
            onResetSort={handleResetSort}
            onSortByDate={handleDateSort}
            categories={uniqueCategories}
          />
        )}
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
