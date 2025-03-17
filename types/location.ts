interface LocationData {
    id: string;
    longitude: number;
    latitude: number;
    formatted_address: string;
    locationName: string;
    type?: string;
}

export type { LocationData };