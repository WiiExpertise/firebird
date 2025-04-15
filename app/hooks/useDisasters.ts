import { useState, useCallback, useEffect } from 'react';
import { collection, getDocs, query, orderBy, DocumentData } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust path to your firebase config
import { DisasterData, DisasterBoundingBox, DisasterCounts } from '../types/disasters'; // Adjust path, import nested types

const DISASTERS_COLLECTION = "disasters";

export function useDisasters() {
const [disasters, setDisasters] = useState<DisasterData[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const fetchDisasters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log(`[useDisasters] Fetching all disasters from '${DISASTERS_COLLECTION}'...`);

    try {
        const disastersRef = collection(db, DISASTERS_COLLECTION);
        const disastersQuery = query(disastersRef, orderBy("reportedDate", "desc")); // Use camelCase field name for query

        const snapshot = await getDocs(disastersQuery);

        const fetchedDisasters = snapshot.docs.map((doc) => {
            const data = doc.data() as DocumentData; // Get raw data

            const boundingBoxData = data.boundingBox || {};
            const countsData = data.clusterCounts || {};

            const disaster: DisasterData = {
                ID: doc.id,
                Lat: data.lat,
                Long: data.long,
                LocationIDs: data.locationIDs || [],
                LocationCount: data.locationCount,
                BoundingBox: {
                    MinLat: boundingBoxData.minLat,
                    MaxLat: boundingBoxData.maxLat,
                    MinLon: boundingBoxData.minLon,
                    MaxLon: boundingBoxData.maxLon,
                } as DisasterBoundingBox,
                DisasterType: data.disasterType,
                Severity: data.severity,
                Status: data.status,
                ReportedDate: data.reportedDate,
                LastUpdate: data.lastUpdate,
                Summary: data.summary,
                TotalSkeetsAmount: data.totalSkeetsAmount,
                ClusterSentiment: data.clusterSentiment,
                ClusterCounts: {
                    FireCount: countsData.fireCount,
                    HurricaneCount: countsData.hurricaneCount,
                    EarthquakeCount: countsData.earthquakeCount,
                    OtherCount: countsData.OtherCount,
                } as DisasterCounts,
            };
            return disaster;
        });

        console.log(`[useDisasters] Fetched ${fetchedDisasters.length} disasters.`);
        setDisasters(fetchedDisasters);

    } catch (err) {
        console.error("[useDisasters] Error fetching disasters:", err);
        let errorMsg = "Failed to load disasters.";
        if (err instanceof Error) {
            if (err.message.includes("index") || err.message.includes("FAILED_PRECONDITION")) {
                errorMsg = "Database setup required (Index missing for 'disasters' collection on 'reportedDate'?). Check Firestore console.";
            } else if (err.message.includes("invalid data")) {
                errorMsg = "Data conversion error. Check Firestore data structure against TypeScript types.";
            }
        }
        setError(errorMsg);
    } finally {
        setIsLoading(false);
    }
}, []);

useEffect(() => {
    fetchDisasters();
}, [fetchDisasters]);

return {
    disasters,
    isLoading,
    error,
    reloadDisasters: fetchDisasters
};
}