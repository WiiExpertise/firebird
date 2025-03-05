import React, { useState } from "react";

interface SortDropdownProps {
  onSortAlphabetically?: (order: "asc" | "desc") => void;
  onSortByCategory?: (category: string) => void;
  onResetSort?: () => void;
  categories?: string[];
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  onSortAlphabetically,
  onSortByCategory,
  onResetSort,
  categories = [],
}) => {
  const [open, setOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleDropdown = () => {
    setOpen(!open);
    setOpenSubmenu(null);
  };

  const handleSortAlphabetically = (order: "asc" | "desc") => {
    onSortAlphabetically && onSortAlphabetically(order);
    setOpen(false);
    setOpenSubmenu(null);
  };

  const handleSortByCategory = (category: string) => {
    onSortByCategory && onSortByCategory(category);
    setOpen(false);
    setOpenSubmenu(null);
  };

  const handleResetSort = () => {
    onResetSort && onResetSort();
    setOpen(false);
    setOpenSubmenu(null);
  };

  return (
    <div className="relative inline-block text-left">
      <button onClick={toggleDropdown} className="focus:outline-none">
        <img src="/images/sort.png" alt="Sort" className="w-6 h-6 cursor-pointer" />
      </button>
      {open && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 text-black z-50"
        >
          <div className="py-1">
            <button
              onClick={handleResetSort}
              className="w-full text-left px-4 py-2 hover:bg-gray-200 flex justify-between items-center"
            >
              Reset
            </button>
            <button
              onClick={() => setOpenSubmenu(openSubmenu === "alpha" ? null : "alpha")}
              className="w-full text-left px-4 py-2 hover:bg-gray-200 flex justify-between items-center"
            >
              Sort Alphabetically
              <img
                src="/images/dropdown.png"
                alt="Dropdown"
                className={`w-4 h-4 transition-transform ${openSubmenu === "alpha" ? "rotate-180" : "rotate-0"}`}
              />
            </button>
            {openSubmenu === "alpha" && (
              <div className="ml-4">
                <button
                  onClick={() => handleSortAlphabetically("asc")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-200"
                >
                  A-Z
                </button>
                <button
                  onClick={() => handleSortAlphabetically("desc")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-200"
                >
                  Z-A
                </button>
              </div>
            )}
            <button
              onClick={() => setOpenSubmenu(openSubmenu === "category" ? null : "category")}
              className="w-full text-left px-4 py-2 hover:bg-gray-200 flex justify-between items-center"
            >
              Sort by Category
              <img
                src="/images/dropdown.png"
                alt="Dropdown"
                className={`w-4 h-4 transition-transform ${openSubmenu === "category" ? "rotate-180" : "rotate-0"}`}
              />
            </button>
            {openSubmenu === "category" && (
              <div className="ml-4">
                {categories.length > 0 ? (
                  categories.map((cat, index) => (
                    <button
                      key={index}
                      onClick={() => handleSortByCategory(cat)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-200"
                    >
                      {cat}
                    </button>
                  ))
                ) : (
                  <span className="block px-4 py-2 text-gray-500">No categories</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
