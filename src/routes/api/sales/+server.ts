import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/supabase/server';
import { PUBLIC_APP_URL } from '$env/static/public';
import type { GarageSaleInput } from '$lib/types';

// Geocode address using Mapbox
async function geocodeAddress(
	address: string,
	city: string,
	state: string,
	zipCode: string
): Promise<{ lat: number; lng: number } | null> {
	const { PUBLIC_MAPBOX_TOKEN } = await import('$env/static/public');
	const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
	const encoded = encodeURIComponent(fullAddress);

	try {
		const response = await fetch(
			`https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${PUBLIC_MAPBOX_TOKEN}&country=US&limit=1`
		);
		const data = await response.json();

		if (data.features && data.features.length > 0) {
			const [lng, lat] = data.features[0].center;
			return { lat, lng };
		}
	} catch (err) {
		console.error('Geocoding error:', err);
	}

	return null;
}

// Send verification email (placeholder - implement with your email service)
async function sendVerificationEmail(email: string, token: string, title: string): Promise<void> {
	const verifyUrl = `${PUBLIC_APP_URL}/verify/${token}`;

	// For now, just log - replace with actual email service (Mailgun, SendGrid, etc.)
	console.log(`
    ========================================
    VERIFICATION EMAIL
    To: ${email}
    Subject: Verify your garage sale listing

    Click here to verify: ${verifyUrl}
    Sale: ${title}
    ========================================
  `);

	// TODO: Implement actual email sending
	// Example with Mailgun:
	// await mailgun.messages.create(domain, {
	//   from: 'KC Garage Sales <noreply@kcgaragesales.com>',
	//   to: email,
	//   subject: 'Verify your garage sale listing',
	//   html: `<p>Click <a href="${verifyUrl}">here</a> to verify your listing.</p>`
	// });
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body: GarageSaleInput = await request.json();

		// Validate required fields
		if (!body.email || !body.title || !body.address || !body.city || !body.state || !body.zip_code) {
			throw error(400, 'Missing required fields');
		}

		if (!body.start_date || !body.start_time || !body.end_time) {
			throw error(400, 'Missing date or time');
		}

		// Validate state
		if (!['KS', 'MO'].includes(body.state)) {
			throw error(400, 'Invalid state. Must be KS or MO.');
		}

		// Geocode the address
		const coords = await geocodeAddress(body.address, body.city, body.state, body.zip_code);

		if (!coords) {
			throw error(400, 'Could not find that address. Please check and try again.');
		}

		// Create the sale
		const { data: sale, error: dbError } = await supabaseAdmin
			.from('garage_sales')
			.insert({
				email: body.email,
				title: body.title,
				description: body.description || '',
				address: body.address,
				city: body.city,
				state: body.state,
				zip_code: body.zip_code,
				latitude: coords.lat,
				longitude: coords.lng,
				start_date: body.start_date,
				end_date: body.end_date || body.start_date,
				start_time: body.start_time,
				end_time: body.end_time,
				categories: body.categories || [],
				photos: body.photos || [],
				is_verified: false,
				is_featured: false
			})
			.select('id, verification_token, title')
			.single();

		if (dbError) {
			console.error('Database error:', dbError);
			throw error(500, 'Failed to create sale');
		}

		// Send verification email
		await sendVerificationEmail(body.email, sale.verification_token, sale.title);

		return json({
			success: true,
			message: 'Sale created. Check your email to verify.',
			id: sale.id
		});
	} catch (err) {
		console.error('Error creating sale:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Something went wrong');
	}
};
