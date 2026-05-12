<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import SaleCard from "$lib/components/SaleCard.svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    const { cityName, citySlug, sales } = $derived(data);

    const canonicalUrl = `https://kcgaragesales.com/${citySlug}`;
    const pageTitle = `Garage Sales in ${cityName}, KS/MO | KC Garage Sales`;
    const pageDescription = `Find ${sales.length > 0 ? sales.length + " active " : ""}garage sales, yard sales, and estate sales in ${cityName}. Browse listings and discover deals near you.`;
</script>

<svelte:head>
    <title>{pageTitle}</title>
    <meta name="description" content={pageDescription} />
    <link rel="canonical" href={canonicalUrl} />
    <meta property="og:title" content="Garage Sales in {cityName} | KC Garage Sales" />
    <meta property="og:description" content={pageDescription} />
    <meta property="og:url" content={canonicalUrl} />
    <meta property="og:image" content="https://kcgaragesales.com/og-image.svg" />
</svelte:head>

<Header />

<main class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Hero -->
    <section class="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-10 px-4">
        <div class="max-w-5xl mx-auto">
            <nav class="text-blue-200 text-sm mb-4">
                <a href="/" class="hover:text-white">KC Garage Sales</a>
                <span class="mx-2">›</span>
                <span class="text-white">{cityName}</span>
            </nav>
            <h1 class="text-3xl md:text-4xl font-bold mb-3">
                Garage Sales in <span class="text-amber-400">{cityName}</span>
            </h1>
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

    <!-- Area info for SEO -->
    <section class="max-w-5xl mx-auto px-4 pb-10">
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                About Garage Sales in {cityName}
            </h2>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Looking for garage sales, yard sales, or estate sales in {cityName}? KC Garage Sales is the
                Kansas City metro's free platform for finding and posting local sales. Browse current listings
                above or <a href="/" class="text-blue-600 hover:underline">search all KC metro sales</a> to
                find deals across the region.
            </p>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                Sellers in {cityName} can <a href="/post" class="text-blue-600 hover:underline">post a sale for free</a> —
                reach thousands of local buyers with your listing, including photos, dates, times, and categories.
            </p>
        </div>
    </section>

    <!-- Other cities -->
    <section class="max-w-5xl mx-auto px-4 pb-12">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Other KC Metro Cities</h2>
        <div class="flex flex-wrap gap-2">
            {#each [
                { slug: "overland-park", name: "Overland Park" },
                { slug: "olathe", name: "Olathe" },
                { slug: "kansas-city", name: "Kansas City" },
                { slug: "lees-summit", name: "Lee's Summit" },
                { slug: "independence", name: "Independence" },
                { slug: "shawnee", name: "Shawnee" },
                { slug: "blue-springs", name: "Blue Springs" },
                { slug: "lenexa", name: "Lenexa" },
                { slug: "leawood", name: "Leawood" },
                { slug: "liberty", name: "Liberty" },
                { slug: "gladstone", name: "Gladstone" },
                { slug: "prairie-village", name: "Prairie Village" },
                { slug: "raytown", name: "Raytown" },
                { slug: "north-kansas-city", name: "North Kansas City" },
            ].filter(c => c.slug !== citySlug) as city}
                <a
                    href="/{city.slug}"
                    class="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-full text-sm transition-colors"
                >
                    {city.name}
                </a>
            {/each}
        </div>
    </section>
</main>

<Footer />
