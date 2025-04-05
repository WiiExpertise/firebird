export interface Hospital {
	name: string;
	care_type?: string;
	address?: string;
	city?: string;
	state?: string;
	zipcode?: string;
	county?: string;
	location_area_code?: string;
	fips_code?: string;
	timezone?: string;
	latitude: string | number;
	longitude: string | number;
	phone_number?: string;
	website?: string | null;
	ownership?: string;
	bedcount?: number | null;
	lat?: number;
	lon?: number;
}