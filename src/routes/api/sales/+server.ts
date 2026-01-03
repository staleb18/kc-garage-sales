import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { supabaseAdmin } from "$lib/supabase/server";
import { PUBLIC_APP_URL } from "$env/static/public";
import { RESEND_API_KEY } from "$env/static/private";
import { Resend } from "resend";
import type { GarageSaleInput } from "$lib/types";

const resend = new Resend(RESEND_API_KEY);

// Geocode address using Nominatim (OpenStreetMap) - Free, no API key needed
async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  zipCode: string,
): Promise<{ lat: number; lng: number } | null> {
  const fullAddress = `${address}, ${city}, ${state} ${zipCode}, USA`;
  const encoded = encodeURIComponent(fullAddress);

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1&countrycodes=us`,
      {
        headers: {
          "User-Agent": "KCGarageSales/1.0",
        },
      },
    );
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch (err) {
    console.error("Geocoding error:", err);
  }

  return null;
}

// Send verification email using Resend
async function sendVerificationEmail(
  email: string,
  token: string,
  title: string,
): Promise<void> {
  const verifyUrl = `${PUBLIC_APP_URL}/verify/${token}`;

  try {
    await resend.emails.send({
      from: "KC Garage Sales <onboarding@resend.dev>",
      to: email,
      subject: "Verify your garage sale listing",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Verify Your Garage Sale</h1>
          <p>Thanks for posting your garage sale: <strong>${title}</strong></p>
          <p>Click the button below to verify your listing and make it visible to shoppers:</p>
          <a href="${verifyUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
            Verify My Sale
          </a>
          <p style="color: #666; font-size: 14px;">Or copy this link: ${verifyUrl}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
          <p style="color: #999; font-size: 12px;">KC Garage Sales - Find great deals in the Kansas City metro area</p>
        </div>
      `,
    });
    console.log(`Verification email sent to ${email}`);
  } catch (err) {
    console.error("Failed to send verification email:", err);
    // Don't throw - sale is already created, user can request new email later
  }
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body: GarageSaleInput = await request.json();

    // Validate required fields
    if (
      !body.email ||
      !body.title ||
      !body.address ||
      !body.city ||
      !body.state ||
      !body.zip_code
    ) {
      throw error(400, "Missing required fields");
    }

    if (!body.start_date || !body.start_time || !body.end_time) {
      throw error(400, "Missing date or time");
    }

    // Validate state
    if (!["KS", "MO"].includes(body.state)) {
      throw error(400, "Invalid state. Must be KS or MO.");
    }

    // Geocode the address
    const coords = await geocodeAddress(
      body.address,
      body.city,
      body.state,
      body.zip_code,
    );

    if (!coords) {
      throw error(
        400,
        "Could not find that address. Please check and try again.",
      );
    }

    // Create the sale
    const { data: sale, error: dbError } = await supabaseAdmin
      .from("garage_sales")
      .insert({
        email: body.email,
        title: body.title,
        description: body.description || "",
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
        is_featured: false,
      })
      .select("id, verification_token, title")
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw error(500, "Failed to create sale");
    }

    // Send verification email
    await sendVerificationEmail(
      body.email,
      sale.verification_token,
      sale.title,
    );

    return json({
      success: true,
      message: "Sale created. Check your email to verify.",
      id: sale.id,
    });
  } catch (err) {
    console.error("Error creating sale:", err);
    if (err instanceof Error && "status" in err) {
      throw err;
    }
    throw error(500, "Something went wrong");
  }
};
