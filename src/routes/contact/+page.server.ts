import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { RESEND_API_KEY, ADMIN_EMAIL, RESEND_FROM_EMAIL } from "$env/static/private";
import { Resend } from "resend";
import { checkRateLimit } from "$lib/rateLimit";

const resend = new Resend(RESEND_API_KEY);

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export const actions: Actions = {
  default: async ({ request, getClientAddress }) => {
    const ip = getClientAddress();
    if (!checkRateLimit(`contact:${ip}`, 3, 60 * 60 * 1000)) {
      return fail(429, { error: "Too many messages. Please try again later." });
    }

    const formData = await request.formData();
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const message = (formData.get("message") as string)?.trim();

    if (!name || !email || !message) {
      return fail(400, { error: "All fields are required." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail(400, { error: "Please enter a valid email address." });
    }

    if (message.length > 2000) {
      return fail(400, { error: "Message must be under 2000 characters." });
    }

    try {
      await resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to: ADMIN_EMAIL,
        replyTo: email,
        subject: `Contact form: ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Contact Form Message</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
            <p><strong>Message:</strong></p>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(message)}</div>
          </div>
        `,
      });

      return { success: true };
    } catch (err) {
      console.error("Failed to send contact email:", err);
      return fail(500, { error: "Failed to send message. Please try again." });
    }
  },
};
