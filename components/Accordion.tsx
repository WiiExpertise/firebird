// components/Accordion.tsx
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
}

const Accordion: React.FC<AccordionProps> = ({ numItems, data }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null); // Track which item is open

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index); // Toggle or close the item
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: numItems }).map((_, index) => (
        <div key={index} className="border">
          <div
            className="cursor-pointer p-4 bg-gray-800 font-semibold"
            onClick={() => handleToggle(index)}
          >
            {data[index]?.title || `Section ${index + 1}`}
          </div>
          {openIndex === index && (
            <div className="p-4 border-t bg-gray-800">
              <div className="space-y-4">
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