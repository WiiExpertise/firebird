import { useState, useCallback, useEffect } from 'react';
import { collection, query, where, limit, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '../../firebase';
import { Location } from '../types/locations';
import { determineLocationCategory } from "../utils/utils";

export function useLocations() {
	const [allLocations, setAllLocations] = useState<Location[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchLocations = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		console.log("Fetching locations active in the last month...");

		const oneMonthAgo = new Date();
		oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
		const oneMonthAgoISO = oneMonthAgo.toISOString();

		const minLat = 24.0, maxLat = 50.0, minLong = -125.0, maxLong = -66.0;

		try {
			const locationsRef = collection(db, "locations");
			const locationsQuery = query(
				locationsRef,
				where("formattedAddress", "!=", ""),
				where("lastSkeetTimestamp", ">=", oneMonthAgoISO),
				where("lat", ">=", minLat), where("lat", "<=", maxLat),
				where("long", ">=", minLong), where("long", "<=", maxLong),
				limit(5)
			);

			const snapshot = await getDocs(locationsQuery);
			const locationData = snapshot.docs.map((doc) => {
				const data = doc.data() as DocumentData;
				const category = determineLocationCategory(data);

				return {
					id: doc.id,
					locationName: data.locationName || "Unknown",
					formattedAddress: data.formattedAddress || "N/A",
					lat: data.lat || 0,
					long: data.long || 0,
					type: data.type || "LOCATION",
					category: category,
					latestSkeetsAmount: data.latestSkeetsAmount,
					lastSkeetTimestamp: data.lastSkeetTimestamp,
					avgSentimentList: data.avgSentimentList
				} as Location;
			}).filter(loc => loc.lat !== 0 && loc.long !== 0);

			console.log(`Fetched ${locationData.length} US locations active in the last month.`);
			setAllLocations(locationData);

		} catch (error) {
			console.error("Error fetching locations:", error);
			let errorMsg = "Failed to load locations.";
			if (error instanceof Error && (error.message.includes("index") || error.message.includes("FAILED_PRECONDITION"))) {
				errorMsg = "Database setup required (Index missing).";
			}
			setError(errorMsg);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Initial fetch on mount
	useEffect(() => {
		fetchLocations();
	}, [fetchLocations]);

	return {
		locations: allLocations,
		isLoading: isLoading,
		error: error,
		reloadLocations: fetchLocations
	};
}

