import { db } from '../firebase';
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from 'react';

interface Skeet {
  id: string; // Document ID
  displayName: string; // displayName of the tweet
  handle: string; // The handle (@) of the displayName
  content: string; // Content of the tweet
  timestamp: string; // Timestamp of the tweet
  uid: string; // UID of the post
  blueskyLink?: string; // Optional: Bluesky link
}

interface FirebaseProps {
  onDataFetched: (data: Skeet[]) => void; // Callback to pass data to parent
}

function Firebase({ onDataFetched }: FirebaseProps) {
  const [_, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log("Component Mounted: Listening for Firestore changes...");

    // If no cache or cache is disabled, fetch from Firestore
    const skeetsRef = collection(db, "skeets");
    const skeetsQuery = query(
      skeetsRef,
      orderBy("timestamp"),
      limit(5)
    );

    const unsubscribe = onSnapshot(skeetsQuery, (snapshot) => {
      try {
        const skeetData: Skeet[] = snapshot.docs.map((doc) => {
          const timestamp = doc.data().timestamp;
          const isValidTimestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(timestamp);
          const uid = doc.data().uid || "unknown"; // Extract UID from Firestore
          const handle = doc.data().handle || "unknown"; // Extract handle from Firestore

          // Construct the Bluesky link
          const postId = uid.split('/').pop(); // Extract the post ID from the UID
          const blueskyLink = `https://bsky.app/profile/${handle}/post/${postId}`;

          return {
            id: doc.id, // Include the document ID
            displayName: doc.data().displayName || "unknown", // displayName from Firestore
            handle: handle, // The handle (@) of the displayName.
            content: doc.data().content, // Content from Firestore. Originally said "no content", but then I realized tweets with only images exist.
            timestamp: isValidTimestamp ? timestamp : "1970-01-01T00:00:00.000Z", // Validate timestamp format
            uid: uid, // UID from Firestore
            blueskyLink: blueskyLink, // Constructed Bluesky link
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
