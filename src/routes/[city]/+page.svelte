<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import SaleCard from "$lib/components/SaleCard.svelte";
    import { CITIES } from "$lib/data/cities";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    const { cityName, citySlug, city, sales } = $derived(data);

    const canonicalUrl = $derived(`https://kcgaragesales.com/${citySlug}`);
    const pageTitle = $derived(`Garage Sales in ${cityName}, ${city.state} | KC Garage Sales`);
    const pageDescription = $derived(
        `Find ${sales.length > 0 ? sales.length + " active " : ""}garage sales, yard sales, and estate sales in ${cityName}, ${city.state} (${city.county}). Browse listings or post your sale free.`,
    );

    // FAQ content is lightly tailored per city so each page carries unique text.
    const faqs = $derived([
        {
            q: `Where can I find garage sales in ${cityName} this weekend?`,
            a: `All current garage sales, yard sales, and estate sales in ${cityName}, ${city.state} are listed on this page. New sales are added by local sellers throughout the week, so check back on Thursday and Friday for the latest weekend listings.`,
        },
        {
            q: `How do I post a garage sale in ${cityName}?`,
            a: `Posting is free. Use the "Post a Sale" button on this page, add your address, dates, times, and photos, and confirm by email. Your ${cityName} sale then appears here and on the KC Garage Sales map for local buyers to find.`,
        },
        {
            q: `When is garage sale season in ${cityName}?`,
            a: `Garage sales in ${cityName} and the rest of ${city.county} are busiest from April through June and again in September and October, when the weather is mild. Many neighborhoods hold community-wide sales during these months.`,
        },
    ]);

    const itemListJsonLd = $derived(
        sales.length > 0
            ? JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "ItemList",
                  "name": `Garage Sales in ${cityName}`,
                  "numberOfItems": sales.length,
                  "itemListElement": sales.map((sale, i) => ({
                      "@type": "ListItem",
                      "position": i + 1,
                      "name": sale.title,
                      "url": `https://kcgaragesales.com/sale/${sale.id}`,
                  })),
              })
            : null,
    );

    const faqJsonLd = $derived(
        JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map((f) => ({
                "@type": "Question",
                "name": f.q,
                "acceptedAnswer": { "@type": "Answer", "text": f.a },
            })),
        }),
    );
</script>

<svelte:head>
    <title>{pageTitle}</title>
    <meta name="description" content={pageDescription} />
    <link rel="canonical" href={canonicalUrl} />
    <meta property="og:title" content="Garage Sales in {cityName} | KC Garage Sales" />
    <meta property="og:description" content={pageDescription} />
    <meta property="og:url" content={canonicalUrl} />
    <meta property="og:image" content="https://kcgaragesales.com/og-image.png" />
    {#if itemListJsonLd}
        {@html `<script type="application/ld+json">${itemListJsonLd}</script>`}
    {/if}
    {@html `<script type="application/ld+json">${faqJsonLd}</script>`}
</svelte:head>

<Header />

<main class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Hero -->
    <section class="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-10 px-4">
        <div class="max-w-5xl mx-auto">
            <nav class="text-blue-200 text-sm mb-4" aria-label="Breadcrumb">
                <a href="/" class="hover:text-white">KC Garage Sales</a>
                <span class="mx-2">›</span>
                <span class="text-white">{cityName}</span>
            </nav>
            <h1 class="text-3xl md:text-4xl font-bold mb-3">
                Garage Sales in <span class="text-amber-400">{cityName}</span>
            </h1>
            <p class="text-blue-100 text-sm mb-2">{city.county}, {city.state === "KS" ? "Kansas" : "Missouri"}</p>
            <p class="text-blue-100 text-lg mb-6">
                {#if sales.length > 0}
                    {sales.length} active {sales.length === 1 ? "sale" : "sales"} listed right now
                {:else}
                    No active sales right now — check back soon or be the first to post!
                {/if}
            </p>
            <a
                href="/post"
                class="inline-block bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
                <i class="fa-solid fa-plus mr-2"></i>Post a Sale in {cityName}
            </a>
        </div>
    </section>

    <!-- Sales grid -->
    <section class="max-w-5xl mx-auto px-4 py-8">
        {#if sales.length > 0}
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each sales as sale (sale.id)}
                    <SaleCard {sale} />
                {/each}
            </div>
        {:else}
            <div class="text-center py-16 text-gray-500 dark:text-gray-400">
                <i class="fa-solid fa-tag text-5xl mb-4 block"></i>
                <p class="text-xl font-medium mb-2">No active sales in {cityName} right now</p>
                <p class="text-sm mb-6">Be the first to post a garage sale in {cityName}!</p>
                <a href="/post" class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    Post a Sale — It's Free
                </a>
            </div>
        {/if}
    </section>

    <!-- Area info for SEO (unique per city) -->
    <section class="max-w-5xl mx-auto px-4 pb-10">
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                About Garage Sales in {cityName}
            </h2>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                {city.intro}
            </p>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                KC Garage Sales is the Kansas City metro's free platform for finding and posting local
                sales. Browse current {cityName} listings above, or
                <a href="/" class="text-blue-600 hover:underline">search all KC metro sales</a>. Sellers in
                {cityName} can <a href="/post" class="text-blue-600 hover:underline">post a sale for free</a>
                with photos, dates, times, and categories to reach thousands of local buyers.
            </p>
        </div>
    </section>

    <!-- FAQ (unique per city, with FAQPage schema) -->
    <section class="max-w-5xl mx-auto px-4 pb-10">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Garage Sale FAQ — {cityName}
        </h2>
        <div class="space-y-3">
            {#each faqs as faq}
                <details class="group bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                    <summary class="cursor-pointer font-medium text-gray-900 dark:text-white list-none flex items-center justify-between">
                        {faq.q}
                        <i class="fa-solid fa-chevron-down text-gray-400 text-sm transition-transform group-open:rotate-180"></i>
                    </summary>
                    <p class="text-gray-600 dark:text-gray-400 leading-relaxed mt-3">{faq.a}</p>
                </details>
            {/each}
        </div>
    </section>

    <!-- Nearby cities (unique per city) -->
    <section class="max-w-5xl mx-auto px-4 pb-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Garage Sales in Nearby Cities</h2>
        <div class="flex flex-wrap gap-2">
            {#each city.nearby as slug}
                {#if CITIES[slug]}
                    <a
                        href="/{slug}"
                        class="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium transition-colors"
                    >
                        {CITIES[slug].name}
                    </a>
                {/if}
            {/each}
        </div>
    </section>

    <!-- Browse all cities -->
    <section class="max-w-5xl mx-auto px-4 pb-12">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">All KC Metro Cities</h2>
        <div class="flex flex-wrap gap-2">
            {#each Object.values(CITIES).filter((c) => c.slug !== citySlug) as c}
                <a
                    href="/{c.slug}"
                    class="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-full text-sm transition-colors"
                >
                    {c.name}
                </a>
            {/each}
        </div>
    </section>
</main>

<Footer />
