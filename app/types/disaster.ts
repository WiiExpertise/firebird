export interface Disaster {
    title: string;                // e.g., "There's a Wildfire!"
    category: string;             // e.g., "Wildfire"
    summary: string;              // Short description of the disaster
    location: string;             // General name of the area
    formattedAddress: string;     // Clean full address
    lat: number;                  // Latitude (supports N/S)
    long: number;                 // Longitude (supports E/W)
    avgSentimentList: number[];  // Sentiment values over time (-1 to +1)
    skeetsAmountList: number[];  // Number of skeets/tweets over time
    timestamps: string[];        // Matching time intervals for trends
    timestamp: string;           // Latest time the event was reported
  }
  