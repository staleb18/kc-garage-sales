import type { PageServerLoad, Actions } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { ADMIN_PASSWORD_HASH } from "$env/static/private";
import { supabaseAdmin } from "$lib/supabase/server";
import bcrypt from "bcryptjs";

// Use the bcrypt hash itself as the session token — long, unguessable,
// and automatically invalidated if the password changes.
function isAdmin(cookies: import("@sveltejs/kit").Cookies): boolean {
  return cookies.get("admin_session") === ADMIN_PASSWORD_HASH;
}

export const load: PageServerLoad = async ({ cookies }) => {
  if (!isAdmin(cookies)) {
    return { authenticated: false, sales: [] };
  }

  const { data: sales, error } = await supabaseAdmin
    .from("garage_sales")
    .select("*, sale_reports(reason, created_at)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching sales:", error);
    return { authenticated: true, sales: [] };
  }

  const salesWithReports = (sales || []).map((s: any) => ({
    ...s,
    report_count: s.sale_reports?.length ?? 0,
    report_reasons: (s.sale_reports ?? [])
      .map((r: any) => r.reason)
      .filter(Boolean) as string[],
    sale_reports: undefined,
  }));

  return { authenticated: true, sales: salesWithReports };
};

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const formData = await request.formData();
    const password = formData.get("password") as string;

    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!isValid) {
      return fail(401, { error: "Invalid password" });
    }

    cookies.set("admin_session", ADMIN_PASSWORD_HASH, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
    });

    return { success: true };
  },

  logout: async ({ cookies }) => {
    cookies.delete("admin_session", { path: "/" });
    throw redirect(303, "/admin");
  },

  delete: async ({ request, cookies }) => {
    if (!isAdmin(cookies)) return fail(401, { error: "Unauthorized" });

    const formData = await request.formData();
    const saleId = formData.get("saleId") as string;
    if (!saleId) return fail(400, { error: "Sale ID required" });

    // Fetch photos first so we can clean up storage
    const { data: sale } = await supabaseAdmin
      .from("garage_sales")
      .select("photos")
      .eq("id", saleId)
      .single();

    if (sale?.photos?.length) {
      for (const photoUrl of sale.photos) {
        const fileName = (photoUrl as string).split("/").pop();
        if (fileName) {
          await supabaseAdmin.storage.from("sale-photos").remove([fileName]);
        }
      }
    }

    const { error } = await supabaseAdmin
      .from("garage_sales")
      .delete()
      .eq("id", saleId);

    if (error) {
      console.error("Error deleting sale:", error);
      return fail(500, { error: "Failed to delete sale" });
    }

    return { deleted: true };
  },

  toggleVerify: async ({ request, cookies }) => {
    if (!isAdmin(cookies)) return fail(401, { error: "Unauthorized" });

    const formData = await request.formData();
    const saleId = formData.get("saleId") as string;
    const currentStatus = formData.get("currentStatus") === "true";
    if (!saleId) return fail(400, { error: "Sale ID required" });

    const { error } = await supabaseAdmin
      .from("garage_sales")
      .update({ is_verified: !currentStatus })
      .eq("id", saleId);

    if (error) return fail(500, { error: "Failed to update sale" });
    return { updated: true };
  },

  toggleFeatured: async ({ request, cookies }) => {
    if (!isAdmin(cookies)) return fail(401, { error: "Unauthorized" });

    const formData = await request.formData();
    const saleId = formData.get("saleId") as string;
    const currentStatus = formData.get("currentStatus") === "true";
    if (!saleId) return fail(400, { error: "Sale ID required" });

    const { error } = await supabaseAdmin
      .from("garage_sales")
      .update({ is_featured: !currentStatus })
      .eq("id", saleId);

    if (error) return fail(500, { error: "Failed to update sale" });
    return { updated: true };
  },
};
