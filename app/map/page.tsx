"use client";

import React, { useState, useEffect, useCallback } from "react";
import MenuBar from "@/components/MenuBar";
import L from "leaflet";
import { MapContainer, TileLayer, CircleMarker, Popup, Marker, Circle, useMapEvent } from "react-leaflet";
import { DateRangePicker, RangeKeyDict, Range } from "react-date-range";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import "leaflet/dist/leaflet.css";
import './DateRangePicker.css';
import { db } from "../../firebase"; // Import Firebase
import { collection, query, limit, getDocs, where, orderBy, startAfter } from "firebase/firestore";
import { isDate } from "date-fns";
import hospitalData from "@/utils/HospitalData.json";
import MapSkeetsSidebar from "@/components/MapSidebar";

// Define a type for each sentiment entry in the avgSentimentList
type AvgSentiment = {
  timeStamp: string;
  skeetsAmount: number;
  averageSentiment: number;
};

type DisasterCount = {
  earthquakeCount: number;
  fireCount: number;
  hurricaneCount: number;
  nonDisasterCount: number;
};

type Category = "Earthquake" | "Wildfire" | "Hurricane" | "Miscellaneous";
// Update Location to reflect the Firestore data format
type Location = {
  id: string; // The Firestore document ID
  locationName: string;
  formattedAddress: string;
  type: "LOCATION"; // You can add other string literals if needed
  avgSentimentList: AvgSentiment[];
  latestDisasterCount: DisasterCount;
  latestSkeetsAmount: number;
  lat: number;
  long: number;
  newLocation: boolean;
  category: Category;
  skeetsAmount: number;
};

type Skeet = {
  id: string;
  displayName: string;
  handle: string;
  timestamp: string;
  content: string;
  blueskyLink: string;
};

type CircleMarkerProps = {
  key: string;
  center: [number, number];
  radius: number;
  color: string;
  fillColor: string;
  fillOpacity: number;
};

type Hospital = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  county: string;
  phone_number: string;
  lat: number;
  long: number;
  bedcount: number;
};

// Processing function
const processHospitalData = (): Hospital[] => {
  return hospitalData.map((hospital, index) => {
    // Parse the coordinates once when loading the data
    const lat = parseFloat(hospital.latitude);
    const long = parseFloat(hospital.longitude);

    // Validate coordinates (optional but recommended)
    if (isNaN(lat) || isNaN(long)) {
      console.warn(`Invalid coordinates for hospital ${hospital.name}`);
      return null;
    }

    return {
      id: `hosp-${index}`,
      name: hospital.name,
      address: hospital.address,
      city: hospital.city,
      state: hospital.state,
      zipcode: hospital.zipcode,
      county: hospital.county,
      lat: lat,       // Already parsed to number
      long: long,     // Already parsed to number
      bedcount: hospital.bedcount,
      phone_number: hospital.phone_number,
    };

  }).filter(Boolean) as Hospital[]; // Filter out any null entries from invalid coordinates
};
// Lines 63-79 are for Ethan to modify to integrate the hospital data; also currently at line 313 is the hopital marker

//const hospital = { id: "hosp1", name: "General Hospital", lat: 32.7767, long: -96.7970 };

const hospitalIcon = L.icon({
  iconUrl: '/images/blue-hospital-icon.png',
  iconSize: [28, 28],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const getHospitalMarkerProps = (hospital: Hospital) => {
  return {
    key: `hospital-${hospital.id}`,
    position: [hospital.lat, hospital.long] as [number, number],
    icon: hospitalIcon,
  };
};

const getCircleMarkerProps = (
  location: Location,
  isFiltered: boolean
): CircleMarkerProps => {
  const markerColor = isFiltered ? "red" : "gray";
  return {
    key: `${location.id}-${isFiltered}`,
    center: [location.lat, location.long],
    radius: 5,
    color: markerColor,
    fillColor: markerColor,
    fillOpacity: isFiltered ? 0.8 : 0.3,
  };
};

// Function to save location data to cache
const saveLocationDataToCache = (data: Location[]) => {
  localStorage.setItem("mapLocationCache", JSON.stringify(data));
};

// Function to read location data from cache
const readLocationDataFromCache = (): Location[] | null => {
  const data = localStorage.getItem("mapLocationCache");
  return data ? JSON.parse(data) : null;
};

// Function to save skeets to cache
const saveSkeetsToCache = (skeets: Record<string, Skeet[]>) => {
  localStorage.setItem("skeetsCache", JSON.stringify(skeets));
};

// : Function to read skeets from cache
const readSkeetsFromCache = (): Record<string, Skeet[]> => {
  const data = localStorage.getItem("skeetsCache");
  return data ? JSON.parse(data) : {};
};

// Function to get a random category
const getRandomCategory = (): Category => {
  const categories: Category[] = ["Earthquake", "Wildfire", "Hurricane", "Miscellaneous"];
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex];
};

const getAverageSentiment = (avgSentimentList: AvgSentiment[]): number => {
  if (avgSentimentList.length === 0) return 0;
  const totalSentiment = avgSentimentList.reduce((acc, sentiment) => acc + sentiment.averageSentiment, 0);
  return totalSentiment / avgSentimentList.length;
}

const getDominantDisasterType = (latestDisasterCount: DisasterCount): Category => {
  const disasterTypes: Category[] = ["Earthquake", "Wildfire", "Hurricane", "Miscellaneous"];
  const disasterCounts = [
    latestDisasterCount.earthquakeCount || 0,
    latestDisasterCount.fireCount || 0,
    latestDisasterCount.hurricaneCount || 0,
    latestDisasterCount.nonDisasterCount || 0,
  ];
  const maxCount = Math.max(...disasterCounts);

  if (maxCount === 0) return "Miscellaneous"; // Default to "Miscellaneous" if all counts are zero

  const maxIndex = disasterCounts.indexOf(maxCount);
  return disasterTypes[maxIndex] || "Miscellaneous"; // Default to "Miscellaneous" if no match found
}

const defaultDisasterCount: DisasterCount = {
  earthquakeCount: 0,
  fireCount: 0,
  hurricaneCount: 0,
  nonDisasterCount: 0,
};


const MapPage: React.FC = () => {
  // Center of the US, don't change this
  const center: [number, number] = [39.8283, -98.5795];

  const [_, setLocations] = useState<Location[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [skeetsCache, setSkeetsCache] = useState<Record<string, Skeet[]>>(readSkeetsFromCache());
  const [selectedLocationSkeets, setSelectedLocationSkeets] = useState<Skeet[]>([]);
  const [useCache, setUseCache] = useState(true); // State to control cache usage
  const [hospitals, setHospitals] = useState<Hospital[]>([]); //Needed for hospitals
  const [showHospitals, setShowHospitals] = useState(false); //Used for toggling on/off hospitals

  // State for tracking which disaster categories are visible
  const [visibleCategories, setVisibleCategories] = useState({
    Earthquake: true,
    Wildfire: true,
    Hurricane: true,
    Miscellaneous: true,
  });
  const [dateRange, setDateRange] = useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [isDateFilterEnabled, setIsDateFilterEnabled] = useState(false);
  const [isSentimentFilterEnabled, setIsSentimentFilterEnabled] = useState(false); // Checkbox state
  const [sentimentThreshold, setSentimentThreshold] = useState(0); // Slider value
  const [isThresholdFloor, setIsThresholdFloor] = useState(true); // Floor or ceiling

  const [isSkeetCountFilterEnabled, setIsSkeetCountFilterEnabled] = useState(false);
  const [skeetCountMin, setSkeetCountMin] = useState<number | null>(null);
  const [skeetCountMax, setSkeetCountMax] = useState<number | null>(null);

  // Fetch location data from Firebase with caching
  const fetchLocations = async () => {
    const cachedData = readLocationDataFromCache();
    console.log(cachedData)

    // WARNING: TESTING 
    //if (cachedData && useCache) {
    // setLocations(cachedData);
    //setAllLocations(cachedData);
    //console.log("Read from cache");
    //return;
    //}
    console.log("Query DB");

    // If no cache or cache is disabled, fetch from Firestore
    const locationsRef = collection(db, "locations");
    const locationsQuery = query(
      locationsRef,
      where("formattedAddress", "!=", ""), // this speciifes that we are only getting valid locations 
      limit(10)
    );

    const snapshot = await getDocs(locationsQuery);
    const locationData = snapshot.docs.map((doc) => {
      const data = doc.data();
      console.log(data);
      return {
        id: doc.id,
        locationName: data.locationName,
        formattedAddress: data.formattedAddress,
        type: data.type, // Assuming this is always "LOCATION"
        avgSentimentList: data.avgSentimentList,
        latestDisasterCount: data.latestDisasterCount || defaultDisasterCount,
        latestSkeetsAmount: data.latestSkeetsAmount,
        lat: data.lat,
        long: data.long,
        newLocation: data.newLocation,
        category: getDominantDisasterType(data.latestDisasterCount || defaultDisasterCount), // Get the dominant disaster type
      } as Location;
    });
    console.log(locationData)


    setLocations(locationData);
    setAllLocations(locationData);

    // Save to cache for future use
    saveLocationDataToCache(locationData);

  };
  // Fetch skeets for a location
  const fetchSkeetsForLocation = useCallback(async (locationId: string) => {
    const cachedSkeets = skeetsCache[locationId] || [];
    setSelectedLocationSkeets(cachedSkeets);
    console.log(locationId)

    const location = allLocations.find(loc => loc.id === locationId); // Find the corresponding location
    if (!location) {
      console.warn(`Location not found for id: ${locationId}`);
      return;
    }

    const latestCachedTimestamp = cachedSkeets.length
      ? cachedSkeets.map(s => s.timestamp).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
      : "1970-01-01T00:00:00Z";

    const skeetsRef = collection(db, "locations", locationId, "skeetIds");

    const skeetsQuery = query(
      skeetsRef,
      where("skeetData.timestamp", ">", latestCachedTimestamp),
      orderBy("skeetData.timestamp"),
      limit(10)
    );

    const snapshot = await getDocs(skeetsQuery);
    if (snapshot.empty) {
      const count = cachedSkeets.length;
      console.log(`No new skeets for ${locationId}, using cache with ${count} skeets.`);
      return;
    }

    const newSkeets: Skeet[] = snapshot.docs.map((doc) => {
      const data = doc.data().skeetData;
      return {
        id: doc.id,
        displayName: data.displayName || "Unknown", // Ensure required fields are present
        handle: data.handle || "Unknown",
        timestamp: data.timestamp || new Date().toISOString(),
        content: data.content || "No content available",
        blueskyLink: data.blueskyLink || "#"
      };
    })
    .filter((skeet) => {
      return skeet.content !== "No content available";
    });

    const mergedSkeets = [...cachedSkeets, ...newSkeets];
    const updatedCache = { ...skeetsCache, [locationId]: newSkeets };

    setSkeetsCache(updatedCache);
    saveSkeetsToCache(updatedCache);
    setSelectedLocationSkeets(mergedSkeets);
    console.log(`Fetched ${newSkeets.length} skeets for ${locationId}`);
  }, [skeetsCache, allLocations]);

  useEffect(() => {
    fetchLocations();
    const processedHospitals = processHospitalData();
    setHospitals(processedHospitals);
  }, [useCache]);

  // Toggle visibility for a given category
  const handleCheckboxChange = (category: keyof typeof visibleCategories) => {
    setVisibleCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Filter locations based on selected categories and date range
  const filteredLocations = allLocations.filter((location) => {
    return (
      visibleCategories[location.category]
    );
  });

  const dateFilteredLocations = allLocations.filter((location) => {
    const locationFirstDate = new Date(location.avgSentimentList[0]?.timeStamp); // this was location.timestamp
    const locationLatestDate = new Date(location.avgSentimentList[location.avgSentimentList.length - 1]?.timeStamp);
    const { startDate, endDate } = dateRange[0];

    const firstFilter = locationFirstDate >= (startDate || new Date()) && locationFirstDate <= (endDate || new Date());
    const latestFilter = locationLatestDate >= (startDate || new Date()) && locationLatestDate <= (endDate || new Date());

    const firstRangeFilter = (startDate || new Date()) >= locationFirstDate && (startDate || new Date()) <= locationLatestDate;
    const latestRangeFilter = (endDate || new Date()) >= locationFirstDate && (endDate || new Date()) <= locationLatestDate;

    return (
      (!isDateFilterEnabled || firstFilter || latestFilter || firstRangeFilter || latestRangeFilter)
    );
  });

  // Filter locations based on sentiment threshold
  const sentimentFilteredLocations = allLocations.filter((location) => {
    const avgSentiment = getAverageSentiment(location.avgSentimentList);
    return (
      (!isSentimentFilterEnabled || (isThresholdFloor ? avgSentiment >= sentimentThreshold : avgSentiment <= sentimentThreshold))
    );
  }
  );

  // Filter locations based on skeet count
  const skeetCountFilteredLocations = allLocations.filter((location) => {
    const skeetCount = location.latestSkeetsAmount;
    return (
      !isSkeetCountFilterEnabled ||
      ((skeetCountMin === null || skeetCount >= skeetCountMin) &&
        (skeetCountMax === null || skeetCount <= skeetCountMax))
    );
  });

  const MapClickHandler: React.FC<{ onMapClick: () => void }> = ({ onMapClick }) => {
    useMapEvent("click", () => {
      onMapClick();
    });
    return null;
  };

  return (
    <div className="bg-stone-300 min-h-screen p-6 relative overflow-auto">
      <div className="relative">
        <MenuBar />
        <div className="w-full max-w-7xl bg-red-100 p-10 mt-24 pt-10 rounded-xl shadow-lg relative overflow-hidden">
          <h1 className="text-3xl font-bold text-black mb-4">Map</h1>
          <div className="relative z-0" style={{ height: "500px", width: "100%" }}>
            <MapContainer
              center={center}
              zoom={5}
              minZoom={4}
              scrollWheelZoom={false}
              dragging={true}
              zoomControl={true}
              maxBounds={[[24.7433195, -124.7844079], [49.3457868, -66.9513812]]} // Limits panning to the US
              maxBoundsViscosity={1.0} // Prevents dragging outside these bounds
              style={{ height: "100%", width: "100%" }}
            >
              <MapClickHandler onMapClick={() => setSelectedLocationSkeets([])} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
                detectRetina={true}
              />

            {allLocations.map((location) => {
              const isFiltered = filteredLocations.includes(location);
              const isDateFiltered = dateFilteredLocations.includes(location);
              const isSentimentFiltered = sentimentFilteredLocations.includes(location);
              const isSkeetCountFiltered = skeetCountFilteredLocations.includes(location);
              const markerProps = getCircleMarkerProps(location, isFiltered);
              const { key, ...restProps } = markerProps;
              return (
                // Only show the marker if it is date filtered
                isDateFiltered && isSentimentFiltered && isSkeetCountFiltered &&
                <React.Fragment key={key}>
                <CircleMarker {...restProps} eventHandlers={{
                  click: () => { 
                    console.log(location);
                    fetchSkeetsForLocation(location.id); 
                  },
                }}>
                  <Popup>{location.formattedAddress}</Popup>
                </CircleMarker>

                    {/* Disaster Circle */}
                    {/* <Circle
                      center={[32.7767, -96.7970]}
                      radius={250000} // Value in meters (50 km)
                      pathOptions={{
                        color: "red",
                        fillColor: "red",
                        fillOpacity: 0.02, //If manual coordinates are inserted then the opacity needs to be in the hundredths place; if it is dynamically taken, the tenths place works
                        opacity: 0.4,
                      }}
                    /> */}
                  </React.Fragment>
                );
              })}

              {/* All Hospital Markers */}
              {showHospitals && hospitals.map((hospital) => {
                const hospitalProps = getHospitalMarkerProps(hospital);
                return (
                  <Marker
                    key={hospitalProps.key}
                    position={hospitalProps.position}
                    icon={hospitalProps.icon}
                  >
                    <Popup>
                      <div className="text-black">
                        <h3 className="font-bold">{hospital.name}</h3>
                        <p>{hospital.address}</p>
                        <p>{hospital.city}, {hospital.state} {hospital.zipcode}</p>
                        <p>Phone: {hospital.phone_number}</p>
                        <p>Beds: {hospital.bedcount}</p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}




            </MapContainer>
          </div>

          {/* Map Legend */}
          <div className="mt-4 flex justify-start">
            <div className="absolute bg-white p-4 rounded-lg shadow-md z-10 border border-gray-300 text-sm">
              <h2 className="text-lg font-bold mb-2 text-black text-left">Legend</h2>
              <div className="flex items-center mb-2 justify-between">
                <span className="text-black text-left mr-2">Hospital</span>
                <img
                  src="/images/blue-hospital-icon.png"
                  alt="Hospital Icon"
                  className="w-6 h-6"
                />
              </div>
              <div className="flex items-center mb-2 justify-between">
                <span className="text-black text-left mr-2">Skeets</span>
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: "red" }}
                ></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-black text-left mr-2">Potentially Impacted Area</span>
                <div
                  className="w-6 h-6 rounded-full"
                  style={{
                    border: "6px solid red",
                    backgroundColor: "red",
                    opacity: 0.4,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Checkbox filter section */}
          <div className="mt-4 flex justify-end">
            <div className="p-4 border border-gray-300 rounded-lg shadow-md bg-white w-fit">
              <div className="flex space-x-4">
                <label className="text-black">
                  <input
                    type="checkbox"
                    checked={visibleCategories.Earthquake}
                    onChange={() => handleCheckboxChange("Earthquake")}
                  />{" "}
                  Earthquake
                </label>
                <label className="text-black">
                  <input
                    type="checkbox"
                    checked={visibleCategories.Wildfire}
                    onChange={() => handleCheckboxChange("Wildfire")}
                  />{" "}
                  Wildfire
                </label>
                <label className="text-black">
                  <input
                    type="checkbox"
                    checked={visibleCategories.Hurricane}
                    onChange={() => handleCheckboxChange("Hurricane")}
                  />{" "}
                  Hurricane
                </label>
                <label className="text-black">
                  <input
                    type="checkbox"
                    checked={showHospitals}
                    onChange={() => setShowHospitals(!showHospitals)}
                  />{" "}
                  Hospitals
                </label>
                {/* <label className="text-black">
                <input
                  type="checkbox"
                  checked={visibleCategories.Miscellaneous}
                  onChange={() => handleCheckboxChange("Miscellaneous")}
                />{" "}
                Non-Disaster
              </label> */}
              <label className="text-black">
                <input
                  type="checkbox"
                  checked={isDateFilterEnabled}
                  onChange={() => setIsDateFilterEnabled(!isDateFilterEnabled)}
                />{" "}
                Filter By Date
              </label>
              <label className="text-black">
                <input
                  type="checkbox"
                  checked={isSentimentFilterEnabled}
                  onChange={() => setIsSentimentFilterEnabled(!isSentimentFilterEnabled)}
                />{" "}
                Filter By Sentiment
              </label>
              <label className="text-black">
                <input
                  type="checkbox"
                  checked={isSkeetCountFilterEnabled}
                  onChange={() => setIsSkeetCountFilterEnabled(!isSkeetCountFilterEnabled)}
                />{" "}
                Filter By Skeet Count
              </label>
            </div>
            {/* Skeet Count Filter UI */}
            {isSkeetCountFilterEnabled && (
              <div className="mt-4">
                <h2 className="text-black font-bold mb-2">Filter by Skeet Count</h2>
                <div className="flex items-center space-x-4">
                  <label className="text-black">
                    Min:
                    <input
                      type="number"
                      value={skeetCountMin ?? ""}
                      onChange={(e) => setSkeetCountMin(e.target.value ? parseInt(e.target.value) : null)}
                      className="ml-2 p-1 border border-gray-300 rounded"
                    />
                  </label>
                  <label className="text-black">
                    Max:
                    <input
                      type="number"
                      value={skeetCountMax ?? ""}
                      onChange={(e) => setSkeetCountMax(e.target.value ? parseInt(e.target.value) : null)}
                      className="ml-2 p-1 border border-gray-300 rounded"
                    />
                  </label>
                </div>
              </div>
            )}
            {isSentimentFilterEnabled && (
              <div className="mt-4">
                <h2 className="text-black font-bold mb-2">Filter by Sentiment</h2>
                <div className="flex items-center space-x-4">
                  <label className="text-black">
                    <input
                      type="radio"
                      checked={isThresholdFloor}
                      onChange={() => setIsThresholdFloor(true)}
                    />{" "}
                    Floor
                  </label>
                  <label className="text-black">
                    <input
                      type="radio"
                      checked={!isThresholdFloor}
                      onChange={() => setIsThresholdFloor(false)}
                    />{" "}
                    Ceiling
                  </label>
                </div>
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.01}
                  value={sentimentThreshold}
                  onChange={(e) => setSentimentThreshold(parseFloat(e.target.value))}
                  className="w-full mt-4"
                  title="Adjust sentiment threshold"
                />
                <div className="text-black text-center mt-2">
                  Threshold: {sentimentThreshold.toFixed(2)}
                </div>
              </div>
            )}
            {isDateFilterEnabled && (
              <div className="mt-4">
                <DateRangePicker
                  ranges={dateRange}
                  onChange={(item: RangeKeyDict) => {
                    const selection = item.selection;
                    setDateRange([{
                      startDate: selection.startDate || new Date(),
                      endDate: selection.endDate || new Date(),
                      key: selection.key
                    }]);
                  }}
                />
              </div>
            )}
            </div>
          </div>
          {/* Reload button */}
          <div className="mt-4 flex justify-end">
            <button
              className="p-2 bg-blue-500 text-white rounded-lg shadow-md"
              onClick={() => setUseCache(false)}
            >
              Reload Locations
            </button>
          </div>
        </div>
        <MapSkeetsSidebar selectedLocationSkeets={selectedLocationSkeets} />
      </div>
    </div>
  );
};

export default MapPage;
