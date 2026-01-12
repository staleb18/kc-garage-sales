import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { RESEND_API_KEY } from "$env/static/private";
import { PUBLIC_APP_URL } from "$env/static/public";
import { Resend } from "resend";

const resend = new Resend(RESEND_API_KEY);

// Email to receive reports - change this to your email
const ADMIN_EMAIL = "sofianetaleb18@gmail.com";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { saleId, saleTitle, reason } = await request.json();

    if (!saleId) {
      throw error(400, "Missing sale ID");
    }

    const saleUrl = `${PUBLIC_APP_URL}/sale/${saleId}`;

    await resend.emails.send({
      from: "KC Garage Sales <onboarding@resend.dev>",
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
    });

    return json({ success: true });
  } catch (err) {
    console.error("Error sending report:", err);
    throw error(500, "Failed to send report");
  }
};
