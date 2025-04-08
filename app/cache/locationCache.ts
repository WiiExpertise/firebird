import { collection, doc, getDoc, getDocs, query, where, limit, DocumentData } from 'firebase/firestore';
import { db } from '../../firebase';
import { Location } from '../types/locations';
import { determineLocationCategory } from "../utils/utils";
import moment from 'moment';

// Cache State 
let locationsCache = new Map<string, Location>();
let isInitialized = false;
let isLoading = false;
let error: string | null = null;
let listeners: Set<() => void> = new Set();

// Cache persistence keys
const CACHE_KEY = 'locationCache';
const INITIALIZED_KEY = 'locationCacheInitialized';
const LAST_FETCH_KEY = 'locationCacheLastFetch';

// Helper: Load cache from localStorage
const loadCacheFromStorage = () => {
	try {
		const cachedData = localStorage.getItem(CACHE_KEY);
		if (cachedData) {
			const parsedData = JSON.parse(cachedData);
			locationsCache = new Map(Object.entries(parsedData));
		}
		isInitialized = localStorage.getItem(INITIALIZED_KEY) === 'true';
	} catch (err) {
		console.error('[Cache] Error loading from localStorage:', err);
		// Clear potentially corrupted data
		localStorage.removeItem(CACHE_KEY);
		localStorage.removeItem(INITIALIZED_KEY);
		localStorage.removeItem(LAST_FETCH_KEY);
	}
};

// Helper: Save cache to localStorage
const saveCacheToStorage = () => {
	try {
		const cacheObject = Object.fromEntries(locationsCache);
		localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
		localStorage.setItem(INITIALIZED_KEY, isInitialized.toString());
		localStorage.setItem(LAST_FETCH_KEY, new Date().toISOString());
	} catch (err) {
		console.error('[Cache] Error saving to localStorage:', err);
	}
};

// Notify Listeners 
const notifyListeners = () => {
	console.log('[Cache] Notifying listeners:', listeners.size);
	listeners.forEach(listener => listener());
};

// Helper: Set Loading State 
const setLoading = (loading: boolean) => {
	if (isLoading !== loading) {
		isLoading = loading;
		notifyListeners();
	}
};

// Helper: Set Error State 
const setErrorState = (errorMessage: string | null) => {
	if (error !== errorMessage) {
		error = errorMessage;
		notifyListeners();
	}
};

// Fetch Logic 
const performInitialFetch = async () => {
	setLoading(true);
	setErrorState(null);
	console.log("[Cache] Performing initial location fetch...");

	const oneMonthAgo = moment().subtract(1, 'month').toISOString();
	const minLat = 24.0, maxLat = 50.0, minLong = -125.0, maxLong = -66.0;

	try {
		const locationsRef = collection(db, "locations");
		const locationsQuery = query(
			locationsRef,
			where("formattedAddress", "!=", ""),
			where("lastSkeetTimestamp", ">=", oneMonthAgo),
			where("lat", ">=", minLat), where("lat", "<=", maxLat),
			where("long", ">=", minLong), where("long", "<=", maxLong),
			where("latestSkeetsAmount", ">", 5),
			limit(50)
		);

		const snapshot = await getDocs(locationsQuery);
		const newCache = new Map<string, Location>();
		snapshot.docs.forEach((doc) => {
			const data = doc.data() as DocumentData;
			const category = determineLocationCategory(data);

			// Basic validation
			if (data.lat == null || data.long == null || !data.locationName) {
				console.warn(`[Cache] Skipping location doc ${doc.id} due to missing essential data.`);
				return;
			}

			const location: Location = {
				id: doc.id,
				locationName: data.locationName,
				formattedAddress: data.formattedAddress || "N/A",
				lat: data.lat,
				long: data.long,
				type: "LOCATION" as const,
				category: category,
				firstSkeetTimestamp: data.firstSkeetTimestamp,
				lastSkeetTimestamp: data.lastSkeetTimestamp,
				latestSkeetsAmount: data.latestSkeetsAmount,
				latestDisasterCount: data.latestDisasterCount,
				latestSentiment: data.latestSentiment,
				avgSentimentList: data.avgSentimentList || [],
			};
			newCache.set(doc.id, location);
		});

		locationsCache = newCache;
		isInitialized = true;
		saveCacheToStorage();
		console.log(`[Cache] Initial fetch complete. Cached ${locationsCache.size} locations.`);

	} catch (err) {
		console.error("[Cache] Error during initial fetch:", err);
		let errorMsg = "Failed to load locations.";
		if (err instanceof Error && (err.message.includes("index") || err.message.includes("FAILED_PRECONDITION"))) {
			errorMsg = "Database setup required (Index missing). Check Firestore console.";
		}
		setErrorState(errorMsg);
		isInitialized = false;
	} finally {
		setLoading(false);
	}
};

// Public Cache API 
export const locationCache = {
	// Fetches the initial list of locations if not already fetched.
	// Safe to call multiple times
	async initialize(): Promise<void> {
		// Load existing cache from storage
		loadCacheFromStorage();

		// Check if we need to refresh the cache
		const lastFetch = localStorage.getItem(LAST_FETCH_KEY);
		const shouldRefresh = !lastFetch || moment().diff(moment(lastFetch), 'hours') > 1;

		if (!isInitialized && !isLoading) {
			await performInitialFetch();
		} else if (!isInitialized && isLoading) {
			console.log("[Cache] Initialization already in progress.");
		} else if (shouldRefresh) {
			console.log("[Cache] Refreshing stale cache.");
			await performInitialFetch();
		} else {
			console.log("[Cache] Using existing cache.");
			notifyListeners();
		}
	},

	// Fetches or re-fetches a single location by ID and updates the cache.
	async fetchAndUpdateLocation(locationId: string): Promise<void> {
		if (!locationId) return;

		console.log(`[Cache] Fetching individual location: ${locationId}`);
		try {
			const locRef = doc(db, "locations", locationId);
			const docSnap = await getDoc(locRef);

			if (docSnap.exists()) {
				const data = docSnap.data() as DocumentData;
				const category = determineLocationCategory(data);

				if (data.lat == null || data.long == null || !data.locationName) {
					console.warn(`[Cache] Fetched individual location ${locationId} has missing essential data.`);
					return;
				}

				const location: Location = {
					id: docSnap.id,
					locationName: data.locationName || "Unknown",
					formattedAddress: data.formattedAddress || "N/A",
					lat: data.lat || 0,
					long: data.long || 0,
					type: "LOCATION" as const,
					category: category,
					firstSkeetTimestamp: data.firstSkeetTimestamp,
					lastSkeetTimestamp: data.lastSkeetTimestamp,
					latestSkeetsAmount: data.latestSkeetsAmount,
					latestDisasterCount: data.latestDisasterCount,
					latestSentiment: data.latestSentiment,
					avgSentimentList: data.avgSentimentList || [],
				};
				locationsCache.set(locationId, location);
				saveCacheToStorage();
				console.log(`[Cache] Updated location ${locationId}`);
				notifyListeners();
			} else {
				console.warn(`[Cache] Location ${locationId} not found in Firestore during individual fetch.`);
				if (locationsCache.has(locationId)) {
					locationsCache.delete(locationId);
					saveCacheToStorage();
					notifyListeners();
				}
			}
		} catch (err) {
			console.error(`[Cache] Error fetching individual location ${locationId}:`, err);
		}
	},

	// Gets all locations currently in the cache.
	getLocations(): Location[] {
		return Array.from(locationsCache.values());
	},

	// Gets the current loading state of the cache (primarily for initial load).
	getLoadingState(): boolean {
		return isLoading;
	},

	// Gets the current error state of the cache (primarily for initial load).
	getErrorState(): string | null {
		return error;
	},

	// Subscribes a listener function to cache updates.
	subscribe(listener: () => void): () => void {
		listeners.add(listener);
		console.log('[Cache] Listener subscribed, total:', listeners.size);
		return () => {
			listeners.delete(listener);
			console.log('[Cache] Listener unsubscribed, remaining:', listeners.size);
		};
	},

	// Clear the cache
	clear(): void {
		locationsCache.clear();
		isInitialized = false;
		localStorage.removeItem(CACHE_KEY);
		localStorage.removeItem(INITIALIZED_KEY);
		localStorage.removeItem(LAST_FETCH_KEY);
		notifyListeners();
	},
};
