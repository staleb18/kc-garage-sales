import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { supabaseAdmin } from "$lib/supabase/server";
import { PUBLIC_APP_URL, PUBLIC_SUPABASE_URL } from "$env/static/public";
import { RESEND_API_KEY } from "$env/static/private";
import { Resend } from "resend";

const resend = new Resend(RESEND_API_KEY);

// Upload photo to Supabase Storage
async function uploadPhoto(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data, error: uploadError } = await supabaseAdmin.storage
      .from("sale-photos")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    // Return public URL
    return `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/sale-photos/${fileName}`;
  } catch (err) {
    console.error("Photo upload failed:", err);
    return null;
  }
}

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
    const formData = await request.formData();

    const email = formData.get("email") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zip_code = formData.get("zip_code") as string;
    const start_date = formData.get("start_date") as string;
    const end_date = formData.get("end_date") as string;
    const start_time = formData.get("start_time") as string;
    const end_time = formData.get("end_time") as string;
    const categoriesJson = formData.get("categories") as string;
    const photo = formData.get("photo") as File | null;

    const categories = categoriesJson ? JSON.parse(categoriesJson) : [];

    // Validate required fields
    if (!email || !title || !address || !city || !state || !zip_code) {
      throw error(400, "Missing required fields");
    }

    if (!start_date || !start_time || !end_time) {
      throw error(400, "Missing date or time");
    }

    // Validate state
    if (!["KS", "MO"].includes(state)) {
      throw error(400, "Invalid state. Must be KS or MO.");
    }

    // Upload photo if provided
    let photos: string[] = [];
    if (photo && photo.size > 0) {
      const photoUrl = await uploadPhoto(photo);
      if (photoUrl) {
        photos = [photoUrl];
      }
    }

    // Geocode the address
    const coords = await geocodeAddress(address, city, state, zip_code);

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
        email,
        title,
        description: description || "",
        address,
        city,
        state,
        zip_code,
        latitude: coords.lat,
        longitude: coords.lng,
        start_date,
        end_date: end_date || start_date,
        start_time,
        end_time,
        categories,
        photos,
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
    await sendVerificationEmail(email, sale.verification_token, sale.title);

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
