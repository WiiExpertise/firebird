export interface Sentiment {
	magnitude: number;
	score: number;
}

export interface Skeet {
	id?: string;
	avatar: string;
	content: string;
	timestamp: string; // ISO 8601 string
	handle: string;
	displayName: string;
	uid: string; // Bluesky URI (e.g., "at://did:plc:...")
	classification: number[];
	sentiment: Sentiment;
	blueskyLink?: string;
}


// NOTE: for location subcollection
export interface SkeetSubDoc {
	id?: string;
	skeetData: Skeet;
}

export type Category = "Wildfire" | "Hurricane" | "Earthquake" | "Other";
