export interface GarageSale {
	id: string;
	email: string;
	title: string;
	description: string;
	address: string;
	city: string;
	state: string;
	zip_code: string;
	latitude: number;
	longitude: number;
	start_date: string;
	end_date: string;
	start_time: string;
	end_time: string;
	categories: string[];
	photos: string[];
	is_verified: boolean;
	is_featured: boolean;
	verification_token: string;
	edit_token: string;
	created_at: string;
	updated_at: string;
}

export interface GarageSaleInput {
	email: string;
	title: string;
	description: string;
	address: string;
	city: string;
	state: string;
	zip_code: string;
	latitude?: number;
	longitude?: number;
	start_date: string;
	end_date: string;
	start_time: string;
	end_time: string;
	categories: string[];
	photos?: string[];
}

export const CATEGORIES = [
	'Furniture',
	'Clothing',
	'Electronics',
	'Kids & Baby',
	'Tools',
	'Sports & Outdoors',
	'Kitchen & Home',
	'Books & Media',
	'Antiques & Collectibles',
	'Jewelry & Accessories',
	'Garden & Patio',
	'Automotive',
	'Holiday & Seasonal',
	'Arts & Crafts',
	'Other'
] as const;

export const KC_METRO_CITIES = [
	// Kansas
	'Overland Park',
	'Olathe',
	'Kansas City',
	'Shawnee',
	'Lenexa',
	'Leawood',
	'Prairie Village',
	'Gardner',
	'Merriam',
	'Mission',
	'Roeland Park',
	'Fairway',
	'Westwood',
	'Spring Hill',
	// Missouri
	'Kansas City',
	'Independence',
	"Lee's Summit",
	'Blue Springs',
	'Liberty',
	'Gladstone',
	'Raytown',
	'Grandview',
	'Belton',
	'Raymore',
	'Pleasant Hill',
	'Grain Valley',
	'North Kansas City',
	'Parkville',
	'Platte City'
] as const;

// KC Metro center coordinates
export const KC_CENTER = {
	lat: 39.0997,
	lng: -94.5786
};
