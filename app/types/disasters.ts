export type DisasterCategory = "wildfire" | "hurricane" | "earthquake" | "non-disaster";
 
export type DisasterSeverity = "low" | "medium" | "high" | "critical";

export type DisasterStatus = "not_active" | "active" | "recovery";

export interface DisasterBoundingBox {
MinLat: number;
MaxLat: number;
MinLon: number;
MaxLon: number;
}

export interface DisasterCounts {
FireCount: number;
HurricaneCount: number;
EarthquakeCount: number;
NonDisasterCount: number;
}

export interface DisasterData {
ID: string; // Firestore Document ID (will be added manually after fetch)
Lat: number; // Centroid Latitude
Long: number; // Centroid Longitude
LocationIDs: string[]; // Firestore Document IDs of included locations
LocationCount: number;
BoundingBox: DisasterBoundingBox;
DisasterType: DisasterCategory;
Severity?: DisasterSeverity; // Optional as it has omitempty
Status?: DisasterStatus;     // Optional as it has omitempty
ReportedDate: string;      // ISO 8601 string
LastUpdate: string;        // ISO 8601 string
Summary?: string;          // Optional as it has omitempty
TotalSkeetsAmount: number;
ClusterSentiment: number;
ClusterCounts: DisasterCounts;
}
 