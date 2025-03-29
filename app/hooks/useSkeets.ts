import { useState, useCallback, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '../../firebase';
import { Skeet } from '../types/skeets';
import { getBlueskyLink } from "../utils/utils";

export function useSkeets(initialLimit = 15) {
	const [skeets, setSkeets] = useState<Skeet[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchGlobalSkeets = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		console.log(`Fetching latest ${initialLimit} global skeets...`);
		try {
			const skeetsQuery = query(
				collection(db, 'skeets'),
				orderBy('timestamp', 'desc'),
				limit(initialLimit)
			);
			const querySnapshot = await getDocs(skeetsQuery);
			const fetchedSkeets: Skeet[] = [];
			querySnapshot.forEach((doc) => {
				const skeetData = doc.data() as DocumentData;
				const skeet: Skeet = {
					id: doc.id,
					avatar: skeetData.avatar || '',
					content: skeetData.content || '',
					timestamp: skeetData.timestamp || new Date().toISOString(),
					handle: skeetData.handle || 'unknown',
					displayName: skeetData.displayName || 'Unknown User',
					uid: skeetData.uid || '',
					classification: skeetData.classification || [],
					sentiment: skeetData.sentiment || {},
					blueskyLink: getBlueskyLink(skeetData.handle, skeetData.uid),
				};
				fetchedSkeets.push(skeet);
			});
			console.log(`Fetched ${fetchedSkeets.length} global skeets.`);
			setSkeets(fetchedSkeets);
		} catch (err) {
			console.error("Error fetching latest skeets:", err);
			let errorMsg = "Failed to load skeets.";
			if (err instanceof Error && err.message.includes("index")) {
				errorMsg = "Database setup required (Index missing).";
			}
			setError(errorMsg);
		} finally {
			setIsLoading(false);
		}
	}, [initialLimit]);

	// Initial fetch
	useEffect(() => {
		fetchGlobalSkeets();
	}, [fetchGlobalSkeets]);

	return {
		skeets,
		isLoading,
		error,
	};
}

