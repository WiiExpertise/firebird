import { db } from '../firebase';
import { collection, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from 'react';

interface Skeet {
  id: string; // Document ID
  author: string; // Author of the tweet
  handle: string; // The handle (@) of the author
  content: string; // Content of the tweet
  timestamp: string; // Timestamp of the tweet
}

interface FirebaseProps {
  onDataFetched: (data: Skeet[]) => void; // Callback to pass data to parent
}

function Firebase({ onDataFetched }: FirebaseProps) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log("Component Mounted: Listening for Firestore changes...");

    const q = query(collection(db, "skeets")); // Adjust query as needed
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const skeetData: Skeet[] = snapshot.docs.map((doc) => {
          const timestamp = doc.data().timestamp;
          const isValidTimestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(timestamp);

          return {
            id: doc.id, // Include the document ID
            author: doc.data().author || "unknown", // Author from Firestore
            handle: doc.data().handle || "unknown", // The handle (@) of the author
            content: doc.data().content, // Content from Firestore. Originally said "no content", but then I realized tweets with only images exist.
            timestamp: isValidTimestamp ? timestamp : "1970-01-01T00:00:00.000Z", // Validate timestamp format
          };
        });

        onDataFetched(skeetData); // Pass data to parent
        setLoading(false);
        console.log("Updated Skeets: ", skeetData);
      } catch (error) {
        console.error("Error fetching skeets:", error);
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [onDataFetched]);

  return null; // No rendering in this component
}

export default Firebase;