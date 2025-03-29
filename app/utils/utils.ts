import { DocumentData } from "firebase/firestore";
import { Category } from "../types/locations";
export const getSkeetCategory = (classification: number[]): Category => {
	if (!classification || classification.length < 3) return "NonDisaster";
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
		default: return "NonDisaster";
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
	let category: Category = "NonDisaster";
	const counts = data.latestDisasterCount;
	if (counts) {
		if (counts.fireCount > Math.max(counts.hurricaneCount || 0, counts.earthquakeCount || 0, counts.nonDisasterCount || 0)) category = "Wildfire";
		else if (counts.hurricaneCount > Math.max(counts.fireCount || 0, counts.earthquakeCount || 0, counts.nonDisasterCount || 0)) category = "Hurricane";
		else if (counts.earthquakeCount > Math.max(counts.fireCount || 0, counts.hurricaneCount || 0, counts.nonDisasterCount || 0)) category = "Earthquake";
	}
	if (!["Wildfire", "Hurricane", "Earthquake", "NonDisaster"].includes(category)) {
		category = "NonDisaster";
	}
	return category;
};


