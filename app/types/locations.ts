export type Category = "Wildfire" | "Hurricane" | "Earthquake" | "NonDisaster";

export type AvgSentiment = {
	timeStamp: string;
	skeetsAmount: number;
	averageSentiment: number;
	disasterCount?: {
		fireCount: number;
		hurricaneCount: number;
		earthquakeCount: number;
		nonDisasterCount: number;
	};
};

export interface DisasterCount {
	fireCount: number;
	hurricaneCount: number;
	earthquakeCount: number;
	nonDisasterCount: number;
}


export interface Location {
	id: string; // Firestore document ID
	locationName: string;
	formattedAddress: string;
	lat: number;
	long: number;
	type: string;
	category: Category;
	avgSentimentList?: AvgSentiment[];
	latestSkeetsAmount?: number;
	latestDisasterCount?: DisasterCount;
	latestSentiment?: number;
	firstSkeetTimestamp?: string;
	lastSkeetTimestamp?: string;
	newLocation?: boolean;
}

