import { describe, it, expect, vi, beforeEach } from "vitest";

// Capture the mocked Resend send() so we can assert whether an email was sent.
const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

vi.mock("$env/static/private", () => ({
  RESEND_API_KEY: "test-key",
  ADMIN_EMAIL: "admin@example.com",
  RESEND_FROM_EMAIL: "noreply@example.com",
}));

import { actions } from "./+page.server";

type ActionArgs = Parameters<(typeof actions)["default"]>[0];

let ipCounter = 0;

function callContact(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);

  // Fresh IP each call so the per-IP rate limiter never interferes.
  const ip = `10.0.0.${ipCounter++}`;

  return actions.default({
    request: { formData: async () => fd },
    getClientAddress: () => ip,
  } as unknown as ActionArgs);
}

describe("contact form honeypot", () => {
  beforeEach(() => {
    sendMock.mockReset();
    sendMock.mockResolvedValue({});
  });

  it("does NOT send an email when the honeypot field is filled", async () => {
    const result = await callContact({
      name: "Spam Bot",
      email: "bot@spam.test",
      message: "buy my stuff http://evil.example",
      website: "http://evil.example", // honeypot — real users never fill this
    });

    expect(sendMock).not.toHaveBeenCalled();
    // It should look like success to the bot so it learns nothing.
    expect(result).toEqual({ success: true });
  });

  it("DOES send an email for a normal submission (honeypot empty)", async () => {
    const result = await callContact({
      name: "Real Person",
      email: "person@example.com",
      message: "Hi, how do I post a sale?",
      website: "", // empty honeypot
    });

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true });
  });
});
