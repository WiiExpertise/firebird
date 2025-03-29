import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface AccordionProps {
  data: {
    title?: string;
    keyword?: string;
    summary?: string;
    location?: string;
    severity?: string;
    timestamp?: string;
    formattedAddress?: string;
    lat?: number;
    long?: number;
    avgSentimentList?: number[];
    skeetsAmountList?: number[];
    timestamps?: string[];
  }[];
  itemClass?: string;
  dropdownIcon?: string;
}

const Accordion: React.FC<AccordionProps> = ({data, itemClass, dropdownIcon }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const getSeverityColor = (severity: string | undefined) => {
    switch (severity) {
      case "Low":
        return "border border-green-700 bg-green-500 text-white px-2 py-1 rounded";
      case "Medium":
        return "border border-yellow-700 bg-yellow-500 text-white px-2 py-1 rounded";
      case "High":
        return "border border-orange-700 bg-orange-500 text-white px-2 py-1 rounded";
      case "Severe":
        case "Critical":
        return "border border-red-700 bg-red-500 text-white px-2 py-1 rounded";
      default:
        return "border border-gray-700 bg-gray-500 text-white px-2 py-1 rounded";
    }
  };

  return (
    <div className="space-y-4">
      {data.map((_, index) => {
        const trendData = data[index]?.timestamps?.map((time, i) => ({
          time: new Date(time).toLocaleDateString(),
          sentiment: data[index]?.avgSentimentList?.[i] ?? 0,
          skeets: data[index]?.skeetsAmountList?.[i] ?? 0,
        })) || [];

        return (
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
              <div className="relative p-4 bg-red-200 rounded-lg mt-2">
                {data[index]?.lat !== undefined && data[index]?.long !== undefined && (
                  <div className="absolute top-4 right-4 w-[300px] h-[180px] z-10 rounded-lg overflow-hidden shadow-md border border-red-300">
                  <MapContainer
                    center={[data[index].lat, data[index].long]}
                    zoom={12}
                    scrollWheelZoom={false}
                    dragging={false}
                    doubleClickZoom={false}
                    zoomControl={false}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                    <CircleMarker
                    center={[data[index].lat, data[index].long]}
                    radius={6}
                    color="red"
                    fillOpacity={1}
                    >
                      <Popup>
                      {data[index]?.location || "Unknown Location"}
                      </Popup>
                    </CircleMarker>
                  </MapContainer>
                </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">Summary:</span>
                    <span>{data[index]?.summary || "N/A"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">Location:</span>
                    <span>{data[index]?.location || "N/A"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">Address:</span>
                    <span>{data[index]?.formattedAddress || "N/A"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">Coordinates:</span>
                    <span>{data[index]?.lat !== undefined && data[index]?.long !== undefined
                      ? `${Math.abs(data[index].lat).toFixed(4)}° ${data[index].lat < 0 ? 'S' : 'N'}, ${Math.abs(data[index].long).toFixed(4)}° ${data[index].long < 0 ? 'W' : 'E'}`
                      : "N/A"
                      }</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">Severity:</span>
                    <span className={getSeverityColor(data[index]?.severity)}>
                      {data[index]?.severity || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">Reported Date:</span>
                    <span>
                      {data[index]?.timestamp
                        ? new Date(data[index].timestamp).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">Time Range:</span>
                    <span>
                      {data[index]?.timestamps?.[0]
                        ? `${new Date(data[index].timestamps[0]).toLocaleDateString()} → ${new Date(
                            data[index].timestamps[data[index].timestamps.length - 1]
                          ).toLocaleDateString()}`
                        : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Mini Graph */}
                {trendData.length > 0 && (
                  <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:gap-8">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold mb-2">Sentiment Trend</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                          <YAxis domain={[-1, 1]} tick={{ fontSize: 12 }} />
                          <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #fca5a5', fontSize: '0.875rem' }} />
                          <Legend verticalAlign="top" height={36} />
                          <Line
                            type="monotone"
                            dataKey="sentiment"
                            name="Sentiment"
                            stroke="#dc2626"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold mb-2">Skeets per Minute Trend</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #fca5a5', fontSize: '0.875rem' }} />
                          <Legend verticalAlign="top" height={36} />
                          <Line
                            type="monotone"
                            dataKey="skeets"
                            name="Skeets per Minute"
                            stroke="#2563eb"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
