import type { PageServerLoad, Actions } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { ADMIN_PASSWORD_HASH } from "$env/static/private";
import { supabaseAdmin } from "$lib/supabase/server";
import bcrypt from "bcryptjs";

export const load: PageServerLoad = async ({ cookies }) => {
  const isAdmin = cookies.get("admin_session") === "authenticated";

  if (!isAdmin) {
    return { authenticated: false, sales: [] };
  }

  // Fetch all sales (including unverified) for admin
  const { data: sales, error } = await supabaseAdmin
    .from("garage_sales")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching sales:", error);
    return { authenticated: true, sales: [] };
  }

  return {
    authenticated: true,
    sales: sales || [],
  };
};

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const formData = await request.formData();
    const password = formData.get("password") as string;

    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!isValid) {
      return fail(401, { error: "Invalid password" });
    }

    // Set admin session cookie (expires in 24 hours)
    cookies.set("admin_session", "authenticated", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return { success: true };
  },

  logout: async ({ cookies }) => {
    cookies.delete("admin_session", { path: "/" });
    throw redirect(303, "/admin");
  },

  delete: async ({ request, cookies }) => {
    const isAdmin = cookies.get("admin_session") === "authenticated";
    if (!isAdmin) {
      return fail(401, { error: "Unauthorized" });
    }

    const formData = await request.formData();
    const saleId = formData.get("saleId") as string;

    if (!saleId) {
      return fail(400, { error: "Sale ID required" });
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
    const isAdmin = cookies.get("admin_session") === "authenticated";
    if (!isAdmin) {
      return fail(401, { error: "Unauthorized" });
    }

    const formData = await request.formData();
    const saleId = formData.get("saleId") as string;
    const currentStatus = formData.get("currentStatus") === "true";

    if (!saleId) {
      return fail(400, { error: "Sale ID required" });
    }

    const { error } = await supabaseAdmin
      .from("garage_sales")
      .update({ is_verified: !currentStatus })
      .eq("id", saleId);

    if (error) {
      console.error("Error updating sale:", error);
      return fail(500, { error: "Failed to update sale" });
    }

    return { updated: true };
  },
};
