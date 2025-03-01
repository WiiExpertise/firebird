"use client";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [pointer, setPointer] = useState(0); // Start at position 0

  const fetchData = async () => {
    try {
      const response = await axios.get("/api/testing", { params: { pointer } });

      if (response.status === 204) {
        console.log("No new data available");
        return; // Don't update state if no new data
      } else {
        console.log("わぁ〜！New data!");
      }

      const data = response.data;
      setMessages(prev => [...prev, ...data.data]); // Append new data
      setPointer(data.newPointer); // Update pointer

    } catch (error) {
      console.warn("Error fetching data or no new data:", error);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch immediately on mount
    const interval = setInterval(fetchData, 1 * 60 * 1000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Webhook Data</h1>
      <pre>{JSON.stringify(messages, null, 2)}</pre>
    </div>
  );
}
