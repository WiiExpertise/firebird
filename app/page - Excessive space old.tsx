"use client";
import axios from "axios";
import { useEffect, useState } from "react";


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

export default function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get("/api/hello")
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.error("Error fetching API:", error);
      });
  }, []);


  const [numItems, setNumItems] = useState(3); // Initial number of items
  const [data, setData] = useState([
    {
      title: "Section 1",
      keyword: "Fire",
      summary: "A large fire has started in the city center.",
      location: "City Center, Downtown",
      severity: "High",
    },
    {
      title: "Section 2",
      keyword: "Flood",
      summary: "There has been a flash flood in the coastal region.",
      location: "Coastal Region",
      severity: "Medium",
    },
    {
      title: "Section 3",
      keyword: "Earthquake",
      summary: "An earthquake has struck the northern region.",
      location: "Northern Region",
      severity: "Severe",
    },
    // Add more items as needed, or dynamically populate this array
  ]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 min-h-screen p-4">
        <div className="text-2xl font-bold mb-8">Firebird</div>
        <nav className="space-y-4">
          <div>
            <h3 className="font-semibold uppercase text-gray-400 text-sm mb-2">Tweets of disaster</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-3">
                <span className="bg-gray-700 w-8 h-8 flex items-center justify-center rounded-lg">🏠</span>
                <a href="#" className="hover:text-gray-300">House is fire tweet</a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="space-x-4">
            <button className="bg-gray-800 p-2 rounded-full">🔔</button>
            <button className="bg-gray-800 p-2 rounded-full">🌙</button>
          </div>
        </header>

        {/* Overview Boxes */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">Predifined tab of disaster</div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">Predifined tab of disaster</div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">Predifined tab of disaster</div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">Predifined tab of disaster</div>
        </section>

        {/* Display API Response */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-2">API Response:</h2>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            {message || "Loading..."}
          </div>
        </section>

        {/* Accordion Section */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Accordion Section:</h2>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            {/* Render Accordion with dynamic number of items */}
            <Accordion numItems={numItems} data={data} />
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
      </main>
    </div>
  );
}
