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
        const skeetData: Skeet[] = snapshot.docs.map((doc) => ({
          id: doc.id, // Include the document ID
          author: doc.data().author || "unknown", // Author from Firestore
          handle: doc.data().handle || "unknown", //The handle (@) of the author
          content: doc.data().content || "no content", // Content from Firestore
          timestamp: doc.data().timestamp || "unknown", // Timestamp from Firestore
        }));
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