import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { RESEND_API_KEY, ADMIN_EMAIL, RESEND_FROM_EMAIL } from "$env/static/private";
import { PUBLIC_APP_URL } from "$env/static/public";
import { Resend } from "resend";
import { supabaseAdmin } from "$lib/supabase/server";

const resend = new Resend(RESEND_API_KEY);

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  try {
    const { saleId, saleTitle, reason } = await request.json();

    if (!saleId) {
      throw error(400, "Missing sale ID");
    }

    // Store report in database
    await supabaseAdmin.from("sale_reports").insert({
      sale_id: saleId,
      reason: reason || null,
      ip_address: getClientAddress(),
    });

    const saleUrl = `${PUBLIC_APP_URL}/sale/${saleId}`;

    // Send email notification (non-blocking)
    resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Report: ${saleTitle || "Garage Sale"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Sale Reported</h1>
          <p>A user has reported a garage sale listing.</p>

          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Sale:</strong> ${saleTitle || "Unknown"}</p>
            <p><strong>Reason:</strong> ${reason || "No reason provided"}</p>
            <p><strong>Link:</strong> <a href="${saleUrl}">${saleUrl}</a></p>
          </div>

          <p>To remove this listing, <a href="${PUBLIC_APP_URL}/admin">go to the Admin Dashboard</a>.</p>
        </div>
      `,
    }).catch((err) => console.error("Failed to send report email:", err));

    return json({ success: true });
  } catch (err) {
    console.error("Error sending report:", err);
    throw error(500, "Failed to send report");
  }
};
