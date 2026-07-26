// IndexNow — instantly notify search engines (Bing, Yandex, Seznam, and others that
// share the IndexNow protocol) when a URL is created or updated. Google does not use
// IndexNow; it relies on Search Console + sitemap crawling instead.
//
// The key below must match the file served at /<key>.txt in the static folder.

const INDEXNOW_KEY = "1503bc0e01287eef16d4bc3d95a4aa94";
const HOST = "kcgaragesales.com";

/**
 * Submit a single URL to IndexNow. Fire-and-forget: failures are logged but never
 * block the caller, since indexing is a best-effort optimization.
 */
export async function submitToIndexNow(url: string): Promise<void> {
  try {
    const endpoint = `https://api.indexnow.org/indexnow?url=${encodeURIComponent(
      url,
    )}&key=${INDEXNOW_KEY}&keyLocation=${encodeURIComponent(
      `https://${HOST}/${INDEXNOW_KEY}.txt`,
    )}`;

    const res = await fetch(endpoint, { method: "GET" });
    if (!res.ok) {
      console.error(`IndexNow submit failed (${res.status}) for ${url}`);
    }
  } catch (err) {
    console.error("IndexNow submit error:", err);
  }
}
