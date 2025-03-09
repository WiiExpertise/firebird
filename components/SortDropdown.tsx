"use client";
import React, { useState, useRef, useEffect } from "react";

interface SortDropdownProps {
  onSortAlphabetically?: (order: "asc" | "desc") => void;
  onSortByCategory?: (category: string) => void;
  onResetSort?: () => void;
  onSortByDate?: (order: "asc" | "desc") => void;
  categories?: string[];
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  onSortAlphabetically,
  onSortByCategory,
  onResetSort,
  onSortByDate,
  categories = [],
}) => {
  const [open, setOpen] = useState(false);
  const [selectValue, setSelectValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "") {
      // Do nothing if placeholder is selected.
    } else if (value === "reset") {
      onResetSort && onResetSort();
    } else if (value === "asc" || value === "desc") {
      onSortAlphabetically && onSortAlphabetically(value as "asc" | "desc");
    } else if (value.startsWith("cat-")) {
      const cat = value.slice(4);
      onSortByCategory && onSortByCategory(cat);
    } else if (value === "date-asc" || value === "date-desc") {
      onSortByDate && onSortByDate(value === "date-asc" ? "asc" : "desc");
    }
    setSelectValue("");
    setOpen(false);
  };

  // Update optionsCount: placeholder (1) + reset (1) + 2 alphabetical + 2 date + category count
  const optionsCount = 1 + 1 + 2 + 2 + categories.length;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button onClick={() => setOpen(!open)} className="focus:outline-none">
        <img src="/images/sort.png" alt="Sort" className="w-6 h-6 cursor-pointer" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg z-50">
          <select onChange={handleChange} className="p-2 rounded border text-black appearance-none" aria-label="Sort options">
            <option value="">-- Select Sorting Method --</option>
            <option value="asc">Alphabetically: (A-Z)</option>
            <option value="desc">Alphabetically: (Z-A)</option>
            <option value="date-asc">Date: (Oldest First)</option>
            <option value="date-desc">Date: (Newest First)</option>
            {categories.map((cat, index) => (
              <option key={index} value={`cat-${cat}`}>
                Sort by Category: {cat}
              </option>
            ))}
            <option value="reset">Reset</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
