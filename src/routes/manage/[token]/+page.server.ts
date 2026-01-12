import type { PageServerLoad, Actions } from "./$types";
import { supabaseAdmin } from "$lib/supabase/server";
import { error, fail, redirect } from "@sveltejs/kit";
import { CATEGORIES } from "$lib/types";

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

    // Verify token
    const { data: sale, error: fetchError } = await supabaseAdmin
      .from("garage_sales")
      .select("id")
      .eq("edit_token", token)
      .single();

    if (fetchError || !sale) {
      return fail(404, { error: "Invalid edit link" });
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const start_date = formData.get("start_date") as string;
    const end_date = formData.get("end_date") as string;
    const start_time = formData.get("start_time") as string;
    const end_time = formData.get("end_time") as string;
    const categoriesJson = formData.get("categories") as string;

    const categories = categoriesJson ? JSON.parse(categoriesJson) : [];

    if (!title || !start_date || !start_time || !end_time) {
      return fail(400, { error: "Missing required fields" });
    }

    const { error: updateError } = await supabaseAdmin
      .from("garage_sales")
      .update({
        title,
        description: description || "",
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
