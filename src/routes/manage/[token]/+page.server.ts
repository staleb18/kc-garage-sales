import type { PageServerLoad, Actions } from "./$types";
import { supabaseAdmin } from "$lib/supabase/server";
import { error, fail, redirect } from "@sveltejs/kit";
import { CATEGORIES } from "$lib/types";
import { PUBLIC_SUPABASE_URL } from "$env/static/public";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];

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
      { headers: { "User-Agent": "KCGarageSales/1.0" } },
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (err) {
    console.error("Geocoding error:", err);
  }
  return null;
}

async function uploadPhoto(file: File): Promise<string | null> {
  try {
    const fileExt = (file.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(file.type) || !ALLOWED_EXTENSIONS.includes(fileExt)) return null;
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const { error: uploadError } = await supabaseAdmin.storage
      .from("sale-photos")
      .upload(fileName, buffer, { contentType: file.type, upsert: false });
    if (uploadError) return null;
    return `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/sale-photos/${fileName}`;
  } catch {
    return null;
  }
}

export const load: PageServerLoad = async ({ params }) => {
  const { token } = params;

  const { data: sale, error: fetchError } = await supabaseAdmin
    .from("garage_sales")
    .select("*")
    .eq("edit_token", token)
    .single();

  if (fetchError || !sale) {
    throw error(404, "Invalid or expired edit link");
  }

  return {
    sale,
    categories: CATEGORIES,
  };
};

export const actions: Actions = {
  update: async ({ request, params }) => {
    const { token } = params;
    const formData = await request.formData();

    // Fetch current sale to compare address for geocoding
    const { data: sale, error: fetchError } = await supabaseAdmin
      .from("garage_sales")
      .select("id, address, city, state, zip_code")
      .eq("edit_token", token)
      .single();

    if (fetchError || !sale) {
      return fail(404, { error: "Invalid edit link" });
    }

    const title = (formData.get("title") as string)?.trim();
    const description = formData.get("description") as string;
    const address = (formData.get("address") as string)?.trim();
    const city = (formData.get("city") as string)?.trim();
    const state = formData.get("state") as string;
    const zip_code = (formData.get("zip_code") as string)?.trim();
    const start_date = formData.get("start_date") as string;
    const end_date = formData.get("end_date") as string;
    const start_time = formData.get("start_time") as string;
    const end_time = formData.get("end_time") as string;
    const categoriesJson = formData.get("categories") as string;

    let categories: string[] = [];
    try {
      categories = categoriesJson ? JSON.parse(categoriesJson) : [];
    } catch {
      return fail(400, { error: "Invalid categories format" });
    }

    if (!title || !address || !city || !state || !zip_code || !start_date || !start_time || !end_time) {
      return fail(400, { error: "Missing required fields" });
    }

    if (!["KS", "MO"].includes(state)) {
      return fail(400, { error: "Invalid state. Must be KS or MO." });
    }

    if (!/^\d{5}$/.test(zip_code)) {
      return fail(400, { error: "ZIP code must be 5 digits." });
    }

    if (end_date && end_date < start_date) {
      return fail(400, { error: "End date must be on or after start date." });
    }

    if (end_time <= start_time) {
      return fail(400, { error: "End time must be after start time." });
    }

    // Re-geocode only when address fields actually changed
    const addressChanged =
      address !== sale.address ||
      city !== sale.city ||
      state !== sale.state ||
      zip_code !== sale.zip_code;

    let coordsUpdate: { latitude?: number; longitude?: number } = {};
    if (addressChanged) {
      const coords = await geocodeAddress(address, city, state, zip_code);
      if (!coords) {
        return fail(400, { error: "Could not find that address. Please double-check and try again." });
      }
      coordsUpdate = { latitude: coords.lat, longitude: coords.lng };
    }

    const { error: updateError } = await supabaseAdmin
      .from("garage_sales")
      .update({
        title,
        description: description || "",
        address,
        city,
        state,
        zip_code,
        ...coordsUpdate,
        start_date,
        end_date: end_date || start_date,
        start_time,
        end_time,
        categories,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sale.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return fail(500, { error: "Failed to update sale" });
    }

    return { success: true };
  },

  addPhotos: async ({ request, params }) => {
    const { token } = params;
    const formData = await request.formData();

    const { data: sale, error: fetchError } = await supabaseAdmin
      .from("garage_sales")
      .select("id, photos")
      .eq("edit_token", token)
      .single();

    if (fetchError || !sale) return fail(404, { error: "Invalid edit link" });

    const MAX_PHOTOS = 5;
    const currentPhotos: string[] = sale.photos || [];
    const slots = MAX_PHOTOS - currentPhotos.length;

    if (slots <= 0) return fail(400, { error: "Maximum 5 photos already uploaded" });

    const files = formData.getAll("photos") as File[];
    const newUrls: string[] = [];

    for (const file of files.slice(0, slots)) {
      if (file && file.size > 0 && file.size <= 5 * 1024 * 1024 && file.type.startsWith("image/")) {
        const url = await uploadPhoto(file);
        if (url) newUrls.push(url);
      }
    }

    if (newUrls.length === 0) return fail(400, { error: "No valid photos to upload" });

    const { error: updateError } = await supabaseAdmin
      .from("garage_sales")
      .update({ photos: [...currentPhotos, ...newUrls] })
      .eq("id", sale.id);

    if (updateError) return fail(500, { error: "Failed to save photos" });

    return { success: true };
  },

  removePhoto: async ({ request, params }) => {
    const { token } = params;
    const formData = await request.formData();
    const photoUrl = formData.get("photoUrl") as string;

    const { data: sale, error: fetchError } = await supabaseAdmin
      .from("garage_sales")
      .select("id, photos")
      .eq("edit_token", token)
      .single();

    if (fetchError || !sale) return fail(404, { error: "Invalid edit link" });

    // Remove from storage
    const fileName = photoUrl.split("/").pop();
    if (fileName) {
      await supabaseAdmin.storage.from("sale-photos").remove([fileName]);
    }

    const updatedPhotos = (sale.photos || []).filter((p: string) => p !== photoUrl);
    const { error: updateError } = await supabaseAdmin
      .from("garage_sales")
      .update({ photos: updatedPhotos })
      .eq("id", sale.id);

    if (updateError) return fail(500, { error: "Failed to remove photo" });

    return { success: true };
  },

  delete: async ({ params }) => {
    const { token } = params;

    const { data: sale, error: fetchError } = await supabaseAdmin
      .from("garage_sales")
      .select("id, photos")
      .eq("edit_token", token)
      .single();

    if (fetchError || !sale) {
      return fail(404, { error: "Invalid edit link" });
    }

    // Delete photos from storage
    if (sale.photos && sale.photos.length > 0) {
      for (const photoUrl of sale.photos) {
        const fileName = photoUrl.split("/").pop();
        if (fileName) {
          await supabaseAdmin.storage.from("sale-photos").remove([fileName]);
        }
      }
    }

    // Delete the sale
    const { error: deleteError } = await supabaseAdmin
      .from("garage_sales")
      .delete()
      .eq("id", sale.id);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return fail(500, { error: "Failed to delete sale" });
    }

    throw redirect(303, "/?deleted=true");
  },
};
