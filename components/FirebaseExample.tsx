import { db } from '../firebase';
import { collection, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from 'react';

interface Skeet {
  author: string;
  content: string;
}

function FirebaseExample() {
  const [skeets, setSkeets] = useState<Skeet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log("Component Mounted: Listening for Firestore changes...");

    const q = query(collection(db, "skeets")); // Adjust query as needed
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const skeetData: Skeet[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data() as Skeet, // Ensure proper type assertion
        }));
        setSkeets(skeetData);
        setLoading(false);
        console.log("Updated Skeets: ", skeetData);
      } catch (error) {
        console.error("Error fetching skeets:", error);
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  return (
    <div>
      <h2>Latest Skeets</h2>
      {loading ? (
        <p>Loading skeets...</p>
      ) : (
        skeets.length > 0 ? (
          skeets.map((skeet) => (
            // NOTE: do NOT do it this way, use the skeet id instead
            <div key={skeet.author}>
              <h3>{skeet.author}</h3>
              <p>{skeet.content}</p>
              <hr />
            </div>
          ))
        ) : (
          <p>No skeets available.</p>
        )
      )}
    </div>
  );
}

export default FirebaseExample;
