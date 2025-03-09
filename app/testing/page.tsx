"use client";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import TweetCard from "../../components/TweetCard";

interface LocationData {
  id: string;
  locationName: string;
  type?: string;        // Optional, if you need to store/use the type
}

interface SkeetData {
  id: string;
  author: string;
  handle: string;
  timestamp: any; // Fuck it man, im tired
  content: string;
}

export default function Home() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [skeets, setSkeets] = useState<SkeetData[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingSkeets, setLoadingSkeets] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch list of locations
  useEffect(() => {
    setLoadingLocations(true);

    const locationsRef = collection(db, "locations");
    const unsubscribe = onSnapshot(
      locationsRef,
      (snapshot) => {
        const locationData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            locationName: data.locationName,
            type: data.type, // If you need it
          } as LocationData;
        });
        setLocations(locationData);
        setLoadingLocations(false);
      },
      (err) => {
        console.error("Error fetching locations:", err);
        setError("Failed to load locations");
        setLoadingLocations(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Whenever the user selects a location, fetch skeet documents. Oh lord the skeets
  useEffect(() => {
    if (!selectedLocation) {
      setSkeets([]);
      return;
    }

    setLoadingSkeets(true);

    const skeetRef = collection(db, "locations", selectedLocation, "skeetIds");
    const unsubscribe = onSnapshot(
      skeetRef,
      (snapshot) => {
        const skeetData = snapshot.docs.map((doc) => {
          const data = doc.data();
          const { skeetData } = data || {};

          return {
            id: doc.id,
            // Spread all fields from the nested skeetData map. 
            ...skeetData,
          } as SkeetData;
        });

        setSkeets(skeetData);
        setLoadingSkeets(false);
      },
      (err) => {
        console.error("Error fetching skeets:", err);
        setError("Failed to load skeet documents");
        setLoadingSkeets(false);
      }
    );

    return () => unsubscribe();
  }, [selectedLocation]);

  const handleLocationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(event.target.value);
  };

  return (
    <div>
      <h1>Location-Based Skeet Viewer</h1>

      {/* Loading & Error states for locations */}
      {loadingLocations && <p>Loading locations...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Location Dropdown */}
      <label htmlFor="location-select">Select a Location:</label>
      <select id="location-select" value={selectedLocation} onChange={handleLocationChange}>
        <option value="">-- Select a Location --</option>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.locationName}
          </option>
        ))}
      </select>

      {/* Display the selected location's skeet documents */}
      {selectedLocation && (
        <div style={{ marginTop: "20px" }}>
          <h2>Skeet Documents for: {selectedLocation}</h2>

          {loadingSkeets ? (
            <p>Loading skeet documents...</p>
          ) : skeets.length === 0 ? (
            <p>No documents found for this location.</p>
          ) : (
            <div className="flex flex-col">
              {skeets.map((skeet) => {
                const { id, author, handle, timestamp, content } = skeet;
                return (
                  <TweetCard
                    key={id}
                    author={author || "Unknown"}
                    handle={handle || "unknown"}
                    timestamp={
                      typeof timestamp?.toDate === "function"
                        ? timestamp.toDate().toString()
                        : timestamp
                    }
                    content={content || "No content available"}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
