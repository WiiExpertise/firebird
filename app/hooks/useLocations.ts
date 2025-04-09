import { useState, useCallback, useEffect } from 'react';
import { collection, query, where, limit, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '../../firebase';
import { Location } from '../types/locations';
import { determineLocationCategory } from "../utils/utils";
import moment from 'moment';

export function useLocations(dateRange?: { startDate?: Date; endDate?: Date; key?: string } | null) {
	const [allLocations, setAllLocations] = useState<Location[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchLocations = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		
		// Use provided date range or default to one month ago
		let startDateISO: string;
		let endDateISO: string;
		
		if (dateRange?.startDate && dateRange?.endDate) {
			// Both start and end dates are provided
			startDateISO = moment(dateRange.startDate).startOf('day').toISOString();
			endDateISO = moment(dateRange.endDate).endOf('day').toISOString();
			console.log(`Fetching locations from ${startDateISO} to ${endDateISO}...`);
		} else if (dateRange?.startDate) {
			// Only start date is provided
			startDateISO = moment(dateRange.startDate).startOf('day').toISOString();
			endDateISO = moment().endOf('day').toISOString();
			console.log(`Fetching locations from ${startDateISO} to now...`);
		} else {
			// No date range provided, default to one month ago
			const oneMonthAgo = new Date();
			oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
			startDateISO = oneMonthAgo.toISOString();
			endDateISO = new Date().toISOString();
			console.log("No date range provided, fetching locations active in the last month...");
		}

		const minLat = 24.0, maxLat = 50.0, minLong = -125.0, maxLong = -66.0;

		try {
			const locationsRef = collection(db, "locations");
			const locationsQuery = query(
				locationsRef,
				where("formattedAddress", "!=", ""),
				where("lastSkeetTimestamp", ">=", startDateISO),
				where("lat", ">=", minLat), where("lat", "<=", maxLat),
				where("long", ">=", minLong), where("long", "<=", maxLong),
				where("latestSkeetsAmount", ">", 5),
				limit(50)
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
					avgSentimentList: data.avgSentimentList,
					latestSentiment: data.latestSentiment,
					firstSkeetTimestamp: data.firstSkeetTimestamp,
				} as Location;
			}).filter(loc => {
				// Filter out locations with invalid coordinates
				if (loc.lat === 0 || loc.long === 0) return false;
				
				// Additional date filtering in memory to ensure we only show locations
				// that have activity within our selected date range
				if (loc.firstSkeetTimestamp && loc.lastSkeetTimestamp) {
					const firstMoment = moment(loc.firstSkeetTimestamp);
					const lastMoment = moment(loc.lastSkeetTimestamp);
					const startMoment = moment(startDateISO);
					const endMoment = moment(endDateISO);
					
					// Check if the location's activity period overlaps with our selected date range
					return firstMoment.isSameOrBefore(endMoment) && lastMoment.isSameOrAfter(startMoment);
				}
				
				return true;
			});

			console.log(`Fetched ${locationData.length} US locations.`);
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
	}, [dateRange]);

	// Initial fetch on mount and when dateRange changes
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

