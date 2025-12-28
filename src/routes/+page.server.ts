import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// For now, return empty sales array
	// Once Supabase is connected, we'll fetch real data
	return {
		sales: []
	};
};
