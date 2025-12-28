import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabase/server';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, url }) => {
	const { id } = params;
	const verified = url.searchParams.get('verified');

	const { data: sale, error: fetchError } = await supabaseAdmin
		.from('garage_sales')
		.select('*')
		.eq('id', id)
		.eq('is_verified', true)
		.single();

	if (fetchError || !sale) {
		throw error(404, 'Sale not found');
	}

	return {
		sale,
		justVerified: verified === 'success',
		alreadyVerified: verified === 'already'
	};
};
