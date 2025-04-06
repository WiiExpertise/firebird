import { collection, query, where, orderBy, limit, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '../../firebase';
import { Skeet, Sentiment } from '../types/skeets';
import moment from 'moment';

// Cache State 
let skeetsCache = new Map<string, Skeet[]>();
let isLoading = new Map<string, boolean>();
let error: string | null = null;
let listeners: Set<() => void> = new Set();

// Cache persistence keys
const CACHE_KEY = 'skeetCache';
const LAST_FETCH_KEY = 'skeetCacheLastFetch';

// Helper: Load cache from localStorage
const loadCacheFromStorage = () => {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      skeetsCache = new Map(Object.entries(parsedData));
    }
  } catch (err) {
    console.error('[SkeetCache] Error loading from localStorage:', err);
    // Clear potentially corrupted data
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(LAST_FETCH_KEY);
  }
};

// Helper: Save cache to localStorage
const saveCacheToStorage = () => {
  try {
    const cacheObject = Object.fromEntries(skeetsCache);
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
    localStorage.setItem(LAST_FETCH_KEY, new Date().toISOString());
  } catch (err) {
    console.error('[SkeetCache] Error saving to localStorage:', err);
  }
};

// Notify Listeners 
const notifyListeners = () => {
  console.log('[SkeetCache] Notifying listeners:', listeners.size);
  listeners.forEach(listener => listener());
};

// Helper: Set Loading State 
const setLoading = (locationId: string, loading: boolean) => {
  if (isLoading.get(locationId) !== loading) {
    isLoading.set(locationId, loading);
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
const fetchSkeetsForLocation = async (locationId: string): Promise<void> => {
  if (!locationId) return;

  setLoading(locationId, true);
  setErrorState(null);
  console.log(`[SkeetCache] Fetching skeets for location: ${locationId}`);

  try {
    // Get the latest timestamp from cached skeets
    const cachedSkeets = skeetsCache.get(locationId) || [];
    const latestCachedTimestamp = cachedSkeets.length
      ? cachedSkeets.map(s => s.timestamp).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
      : "1970-01-01T00:00:00Z";

    const skeetsRef = collection(db, "locations", locationId, "skeetIds");
    const skeetsQuery = query(
      skeetsRef,
      where("skeetData.timestamp", ">", latestCachedTimestamp),
      orderBy("skeetData.timestamp"),
      limit(50)
    );

    const snapshot = await getDocs(skeetsQuery);
    const newSkeets: Skeet[] = snapshot.docs.map((doc) => {
      const data = doc.data().skeetData;
      return {
        id: doc.id,
        avatar: data.avatar || '',
        content: data.content || '',
        timestamp: data.timestamp || new Date().toISOString(),
        handle: data.handle || 'unknown',
        displayName: data.displayName || 'Unknown User',
        uid: data.uid || '',
        classification: data.classification || [],
        sentiment: data.sentiment || { magnitude: 0, score: 0 },
        blueskyLink: data.blueskyLink || '#',
      };
    });

    // Merge new skeets with cached skeets, ensuring no duplicates
    const mergedSkeets = [
      ...cachedSkeets,
      ...newSkeets.filter(
        (newSkeet) => !cachedSkeets.some((cachedSkeet) => cachedSkeet.id === newSkeet.id)
      ),
    ];

    // Sort by timestamp, newest first
    mergedSkeets.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    skeetsCache.set(locationId, mergedSkeets);
    saveCacheToStorage();
    console.log(`[SkeetCache] Updated skeets for location ${locationId}. Total: ${mergedSkeets.length}`);

  } catch (err) {
    console.error(`[SkeetCache] Error fetching skeets for location ${locationId}:`, err);
    setErrorState(`Failed to load skeets for location ${locationId}`);
  } finally {
    setLoading(locationId, false);
  }
};

// Public Cache API 
export const skeetCache = {
  // Initialize the cache
  initialize(): void {
    loadCacheFromStorage();
  },

  // Fetch skeets for a location if needed
  async fetchSkeets(locationId: string): Promise<void> {
    // Check if we need to refresh the cache
    const lastFetch = localStorage.getItem(LAST_FETCH_KEY);
    const shouldRefresh = !lastFetch || moment().diff(moment(lastFetch), 'hours') > 1;

    if (!skeetsCache.has(locationId) || shouldRefresh) {
      await fetchSkeetsForLocation(locationId);
    } else {
      console.log(`[SkeetCache] Using cached skeets for location ${locationId}`);
      notifyListeners();
    }
  },

  // Get skeets for a location
  getSkeets(locationId: string): Skeet[] {
    return skeetsCache.get(locationId) || [];
  },

  // Get loading state for a location
  getLoadingState(locationId: string): boolean {
    return isLoading.get(locationId) || false;
  },

  // Get error state
  getErrorState(): string | null {
    return error;
  },

  // Subscribe to cache updates
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    console.log('[SkeetCache] Listener subscribed, total:', listeners.size);
    return () => {
      listeners.delete(listener);
      console.log('[SkeetCache] Listener unsubscribed, remaining:', listeners.size);
    };
  },

  // Clear the cache
  clear(): void {
    skeetsCache.clear();
    isLoading.clear();
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(LAST_FETCH_KEY);
    notifyListeners();
  },

  // Clear skeets for a specific location
  clearLocation(locationId: string): void {
    skeetsCache.delete(locationId);
    isLoading.delete(locationId);
    saveCacheToStorage();
    notifyListeners();
  },
}; 