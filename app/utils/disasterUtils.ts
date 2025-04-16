import { DocumentData } from "firebase/firestore";
import { Category } from "../types/locations";
export const getSkeetCategory = (classification: number[]): Category => {
	if (!classification || classification.length < 3) return "Other";
	let maxProb = -1, maxIndex = -1;
	for (let i = 0; i < classification.length; i++) {
		if (classification[i] > maxProb) {
			maxProb = classification[i];
			maxIndex = i;
		}
	}
	switch (maxIndex) {
		case 0: return "Wildfire";
		case 1: return "Hurricane";
		case 2: return "Earthquake";
		default: return "Other";
	}
};


export const getBlueskyLink = (handle: string, uid: string): string | undefined => {
	if (!uid || !uid.startsWith("at://")) return undefined;
	const parts = uid.split('/');
	const postId = parts[parts.length - 1]; // Get the last part of the URI
	if (!handle || !postId) return undefined;
	return `https://bsky.app/profile/${handle}/post/${postId}`;
};


export const determineLocationCategory = (data: DocumentData): Category => {
	let category: Category = "Other";
	const counts = data.latestDisasterCount;
	if (counts) {
		if (counts.fireCount > Math.max(counts.hurricaneCount || 0, counts.earthquakeCount || 0, counts.OtherCount || 0)) category = "Wildfire";
		else if (counts.hurricaneCount > Math.max(counts.fireCount || 0, counts.earthquakeCount || 0, counts.OtherCount || 0)) category = "Hurricane";
		else if (counts.earthquakeCount > Math.max(counts.fireCount || 0, counts.hurricaneCount || 0, counts.OtherCount || 0)) category = "Earthquake";
	}
	if (!["Wildfire", "Hurricane", "Earthquake", "Other"].includes(category)) {
		category = "Other";
	}
	return category;
};



const earthRadiusKM = 6371.0;

// idk man I asked an LLM for this one
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
	// convert degrees to radians
	const radLat1 = lat1 * Math.PI / 180;
	const radLon1 = lon1 * Math.PI / 180;
	const radLat2 = lat2 * Math.PI / 180;
	const radLon2 = lon2 * Math.PI / 180;

	// calculate differences
	const deltaLat = radLat2 - radLat1;
	const deltaLon = radLon2 - radLon1;

	// Haversine formula
	const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
		Math.cos(radLat1) * Math.cos(radLat2) *
		Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return earthRadiusKM * c;
}

// Function to convert kilometers to miles
export function kmToMiles(km: number): number {
	return km * 0.621371;
}

