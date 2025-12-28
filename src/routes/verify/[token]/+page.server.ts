import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabase/server';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const { token } = params;

	// Find sale with this verification token
	const { data: sale, error: fetchError } = await supabaseAdmin
		.from('garage_sales')
		.select('id, title, is_verified')
		.eq('verification_token', token)
		.single();

	if (fetchError || !sale) {
		throw error(404, 'Invalid or expired verification link');
	}

	if (sale.is_verified) {
		// Already verified, redirect to sale page
		throw redirect(302, `/sale/${sale.id}?verified=already`);
	}

	// Verify the sale
	const { error: updateError } = await supabaseAdmin
		.from('garage_sales')
		.update({ is_verified: true })
		.eq('id', sale.id);

	if (updateError) {
		console.error('Verification error:', updateError);
		throw error(500, 'Failed to verify sale');
	}

	// Redirect to sale page with success message
	throw redirect(302, `/sale/${sale.id}?verified=success`);
};
