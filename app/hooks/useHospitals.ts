import { useState, useEffect, useCallback } from 'react';
import { Hospital } from '../types/hospital';

const HOSPITAL_DATA_URL = '/data/HospitalData.json';

export function useHospitals() {
	const [hospitals, setHospitals] = useState<Hospital[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchHospitals = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		console.log("[useHospitals] Fetching hospital data...");

		try {
			const response = await fetch(HOSPITAL_DATA_URL);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data: Hospital[] = await response.json();

			// --- Data Cleaning & Coordinate Parsing ---
			const processedData = data
				.map(hospital => {
					const lat = parseFloat(hospital.latitude as string);
					const lon = parseFloat(hospital.longitude as string);

					// Basic validation 
					if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
						console.warn(`[useHospitals] Invalid coordinates for hospital: ${hospital.name}. Skipping.`);
						return null; // Filter out invalid entries
					}

					// Return hospital object with parsed coords
					return {
						...hospital,
						lat: lat,
						lon: lon,
					};
				})
				.filter((h): h is Hospital & { lat: number; lon: number } => h !== null); // Type guard to filter out nulls and ensure lat/lon exist

			console.log(`[useHospitals] Fetched and processed ${processedData.length} hospitals.`);
			setHospitals(processedData);

		} catch (err) {
			console.error("[useHospitals] Error fetching or processing hospital data:", err);
			setError("Failed to load hospital data.");
			setHospitals([]); // Clear data on error
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchHospitals();
	}, [fetchHospitals]);

	return {
		hospitals,
		isLoading,
		error,
		reloadHospitals: fetchHospitals,
	};
}