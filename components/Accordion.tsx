import { useState } from "react";

interface AccordionProps {
  numItems: number;
  data: {
    title?: string;
    keyword?: string;
    summary?: string;
    location?: string;
    severity?: string;
  }[];
  itemClass?: string;
  dropdownIcon?: string;
}

const Accordion: React.FC<AccordionProps> = ({ numItems, data, itemClass, dropdownIcon }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: numItems }).map((_, index) => (
        <div key={index} className={`p-4 ${itemClass || "bg-red-400 rounded-lg shadow-md"}`}>
          <div
            className="cursor-pointer font-semibold bg-red-600/40 p-4 rounded-lg text-black flex justify-between items-center"
            onClick={() => handleToggle(index)}
          >
            {data[index]?.title || `Section ${index + 1}`}
            {dropdownIcon && (
              <img
                src={dropdownIcon}
                alt="Dropdown"
                className={`w-6 h-6 transition-transform ${openIndex === index ? "rotate-180" : "rotate-0"}`}
              />
            )}
          </div>
          {openIndex === index && (
            <div className="p-4 bg-red-200 rounded-lg mt-2">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">Keyword:</span>
                  <span>{data[index]?.keyword || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">Summary:</span>
                  <span>{data[index]?.summary || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">Location:</span>
                  <span>{data[index]?.location || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">Severity:</span>
                  <span>{data[index]?.severity || "N/A"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Accordion;
