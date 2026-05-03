<script lang="ts">
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import SaleCard from "$lib/components/SaleCard.svelte";
    import SaleCardSkeleton from "$lib/components/SaleCardSkeleton.svelte";
    import type { GarageSale } from "$lib/types";
    import { CATEGORIES, CATEGORY_EMOJI } from "$lib/types";

    // Category scroll fade state
    let categoryScrollEl = $state<HTMLDivElement | null>(null);
    let showLeftFade = $state(false);
    let showRightFade = $state(true);

    function onCategoryScroll() {
        if (!categoryScrollEl) return;
        showLeftFade = categoryScrollEl.scrollLeft > 8;
        showRightFade = categoryScrollEl.scrollLeft < categoryScrollEl.scrollWidth - categoryScrollEl.clientWidth - 8;
    }

    // Dynamically import Map only on client side
    let MapComponent: any = $state(null);
    let mapLoading = $state(true);
    if (browser) {
        import("$lib/components/Map.svelte").then((m) => {
            MapComponent = m.default;
            mapLoading = false;
        });
    } else {
        mapLoading = false;
    }

    interface Props {
        data: { sales: GarageSale[] };
    }

    let { data }: Props = $props();

    // Read initial state from URL params
    const params = $page.url.searchParams;
    let viewMode = $state<"map" | "list">((params.get("view") as "map" | "list") || "map");
    let selectedCategory = $state<string>(params.get("category") || "");
    let selectedCity = $state<string>(params.get("city") || "");
    let searchQuery = $state<string>(params.get("q") || "");
    let currentPage = $state<number>(parseInt(params.get("p") || "1"));
    const PAGE_SIZE = 12;

    // Sync filter state to URL (debounced for search)
    let syncTimeout: ReturnType<typeof setTimeout>;
    function syncToUrl() {
        if (!browser) return;
        clearTimeout(syncTimeout);
        syncTimeout = setTimeout(() => {
            const url = new URL(window.location.href);
            if (selectedCity) url.searchParams.set("city", selectedCity); else url.searchParams.delete("city");
            if (selectedCategory) url.searchParams.set("category", selectedCategory); else url.searchParams.delete("category");
            if (searchQuery) url.searchParams.set("q", searchQuery); else url.searchParams.delete("q");
            if (viewMode !== "map") url.searchParams.set("view", viewMode); else url.searchParams.delete("view");
            if (currentPage > 1) url.searchParams.set("p", String(currentPage)); else url.searchParams.delete("p");
            goto(url.toString(), { replaceState: true, noScroll: true, keepFocus: true });
        }, 150);
    }

    $effect(() => {
        // Track all filter changes and sync
        selectedCity; selectedCategory; searchQuery; viewMode; currentPage;
        syncToUrl();
    });

    // Reset to page 1 when filters change
    $effect(() => {
        selectedCity; selectedCategory; searchQuery;
        currentPage = 1;
    });

    // Get unique cities from sales with counts
    let cities = $derived.by(() => {
        const cityCount = new Map<string, number>();
        for (const sale of data.sales) {
            const city = sale.city;
            cityCount.set(city, (cityCount.get(city) || 0) + 1);
        }
        return Array.from(cityCount.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([city, count]) => ({ city, count }));
    });

    // Dynamic categories: only those with ≥1 sale in current city filter, sorted by count
    let activeCategories = $derived.by(() => {
        const salesInCity = selectedCity
            ? data.sales.filter((s) => s.city === selectedCity)
            : data.sales;

        const counts = new Map<string, number>();
        for (const sale of salesInCity) {
            for (const cat of (sale.categories || [])) {
                counts.set(cat, (counts.get(cat) || 0) + 1);
            }
        }

        return CATEGORIES
            .filter((cat) => (counts.get(cat) || 0) > 0)
            .sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0))
            .map((cat) => ({ name: cat, count: counts.get(cat) || 0 }));
    });

    // Reset selected category if it has no sales in current filter
    $effect(() => {
        if (selectedCategory && !activeCategories.find(c => c.name === selectedCategory)) {
            selectedCategory = "";
        }
    });

    let filteredSales = $derived.by(() => {
        let result = data.sales;

        if (selectedCity) {
            result = result.filter((s) => s.city === selectedCity);
        }

        if (selectedCategory) {
            result = result.filter((s) =>
                s.categories?.includes(selectedCategory),
            );
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (s) =>
                    s.title.toLowerCase().includes(query) ||
                    s.city.toLowerCase().includes(query) ||
                    s.description?.toLowerCase().includes(query),
            );
        }

        return result;
    });

    // Pagination
    let totalPages = $derived(Math.max(1, Math.ceil(filteredSales.length / PAGE_SIZE)));
    let paginatedSales = $derived.by(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredSales.slice(start, start + PAGE_SIZE);
    });

    function handleSaleClick(sale: GarageSale) {
        window.location.href = `/sale/${sale.id}`;
    }
</script>

<svelte:head>
    <title>KC Garage Sales - Find Garage Sales in Kansas City Metro</title>
    <meta name="description" content="Find garage sales, yard sales, and estate sales in the Kansas City metro area. Post your sale for free!" />
    <meta property="og:title" content="KC Garage Sales - Find Garage Sales in Kansas City Metro" />
    <meta property="og:description" content="Find garage sales, yard sales, and estate sales in the Kansas City metro area. Post your sale for free!" />
    <meta property="og:url" content="https://kcgaragesales.com" />
</svelte:head>

<Header />

<main class="min-h-screen">
    <!-- Hero Section (compact) -->
    <section class="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-8 px-4">
        <div class="max-w-7xl mx-auto text-center">
            <h1 class="text-3xl md:text-4xl font-bold mb-6">
                Find Garage Sales in <span class="text-amber-400">Kansas City</span>
            </h1>
            <div class="max-w-2xl mx-auto flex flex-wrap gap-2">
                <div class="flex-1 relative">
                    <i class="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                    <input
                        type="text"
                        bind:value={searchQuery}
                        placeholder="Search by city, item, or keyword..."
                        class="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                </div>
                <a
                    href="/post"
                    class="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap"
                >
                    <i class="fa-solid fa-plus mr-2"></i>Post Sale
                </a>
            </div>
        </div>
    </section>

    <!-- Filters & View Toggle -->
    <section class="bg-white dark:bg-gray-900 border-b dark:border-gray-700 sticky top-16 z-[1000]">
        <div class="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2">
            <!-- Row 1: City filter + View toggle -->
            <div class="flex items-center justify-between gap-3">
                <select
                    bind:value={selectedCity}
                    class="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">All Cities</option>
                    {#each cities as { city, count }}
                        <option value={city}>{city} ({count})</option>
                    {/each}
                </select>

                <div class="flex items-center gap-3">
                    <span class="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
                        {filteredSales.length} sale{filteredSales.length !== 1 ? "s" : ""}
                    </span>
                    <div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                            onclick={() => (viewMode = "map")}
                            class="px-3 py-1.5 rounded text-sm font-medium transition-colors {viewMode === 'map' ? 'bg-white dark:bg-gray-700 shadow text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}"
                        ><i class="fa-solid fa-map mr-1"></i>Map</button>
                        <button
                            onclick={() => (viewMode = "list")}
                            class="px-3 py-1.5 rounded text-sm font-medium transition-colors {viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}"
                        ><i class="fa-solid fa-list mr-1"></i>List</button>
                    </div>
                </div>
            </div>

            <!-- Row 2: Categories — wraps on desktop, scrolls on mobile -->
            {#if activeCategories.length > 0}
                <!-- Desktop: wrap layout, no scroll needed -->
                <div class="hidden sm:flex flex-wrap gap-2">
                    <button
                        onclick={() => (selectedCategory = "")}
                        class="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors {selectedCategory === '' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
                    >All <span class="opacity-70">({data.sales.length})</span></button>
                    {#each activeCategories as { name, count }}
                        <button
                            onclick={() => (selectedCategory = name)}
                            class="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors {selectedCategory === name ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
                        >{CATEGORY_EMOJI[name]} {name} <span class="opacity-70">({count})</span></button>
                    {/each}
                </div>

                <!-- Mobile: horizontal scroll with fade hints -->
                <div class="sm:hidden relative">
                    {#if showLeftFade}
                        <div class="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white dark:from-gray-900 z-10"></div>
                    {/if}
                    <div
                        class="category-scroll flex items-center gap-2 overflow-x-auto pb-1"
                        bind:this={categoryScrollEl}
                        onscroll={onCategoryScroll}
                    >
                        <button
                            onclick={() => (selectedCategory = "")}
                            class="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors {selectedCategory === '' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
                        >All ({data.sales.length})</button>
                        {#each activeCategories as { name, count }}
                            <button
                                onclick={() => (selectedCategory = name)}
                                class="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors {selectedCategory === name ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
                            >{CATEGORY_EMOJI[name]} {name} ({count})</button>
                        {/each}
                    </div>
                    {#if showRightFade}
                        <div class="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white dark:from-gray-900 z-10"></div>
                    {/if}
                </div>
            {/if}
        </div>
    </section>

    <!-- Results -->
    <section class="max-w-7xl mx-auto px-4 py-6">
        {#if viewMode === "map"}
            <div class="grid lg:grid-cols-2 gap-6">
                <!-- Map -->
                <div class="h-[500px] lg:h-[calc(100vh-16rem)] rounded-xl overflow-hidden shadow-sm border lg:sticky lg:top-32">
                    {#if MapComponent}
                        <MapComponent sales={filteredSales} onSaleClick={handleSaleClick} />
                    {:else}
                        <div class="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl"></div>
                    {/if}
                </div>

                <!-- Sale Cards -->
                <div class="space-y-4">
                    {#if filteredSales.length === 0}
                        <div class="text-center py-12 text-gray-500">
                            <i class="fa-solid fa-tag text-4xl mb-4"></i>
                            <p class="text-lg font-medium">No garage sales found</p>
                            <p class="text-sm mt-1">Try adjusting your filters or be the first to post!</p>
                            <a href="/post" class="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                                Post a Sale
                            </a>
                        </div>
                    {:else}
                        {#each paginatedSales as sale (sale.id)}
                            <SaleCard {sale} />
                        {/each}

                        {#if totalPages > 1}
                            <div class="flex items-center justify-center gap-2 pt-4">
                                <button
                                    onclick={() => (currentPage = Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    class="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                                ><i class="fa-solid fa-chevron-left mr-1"></i> Prev</button>
                                <span class="text-sm text-gray-600 dark:text-gray-400">{currentPage} / {totalPages}</span>
                                <button
                                    onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    class="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                                >Next <i class="fa-solid fa-chevron-right ml-1"></i></button>
                            </div>
                        {/if}
                    {/if}
                </div>
            </div>
        {:else}
            <!-- List View -->
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {#if mapLoading}
                    {#each Array(8) as _}
                        <SaleCardSkeleton />
                    {/each}
                {:else if filteredSales.length === 0}
                    <div class="col-span-full text-center py-12 text-gray-500">
                        <i class="fa-solid fa-tag text-4xl mb-4"></i>
                        <p class="text-lg font-medium">No garage sales found</p>
                        <p class="text-sm mt-1">Be the first to post one!</p>
                        <a href="/post" class="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                            Post a Sale
                        </a>
                    </div>
                {:else}
                    {#each paginatedSales as sale (sale.id)}
                        <SaleCard {sale} />
                    {/each}
                {/if}
            </div>

            {#if totalPages > 1}
                <div class="flex items-center justify-center gap-2 mt-8">
                    <button
                        onclick={() => (currentPage = Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        class="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    ><i class="fa-solid fa-chevron-left mr-1"></i> Prev</button>
                    {#each Array.from({ length: totalPages }, (_, i) => i + 1) as p}
                        {#if p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1}
                            <button
                                onclick={() => (currentPage = p)}
                                class="w-9 h-9 rounded-lg text-sm font-medium transition-colors {p === currentPage ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}"
                            >{p}</button>
                        {:else if Math.abs(p - currentPage) === 2}
                            <span class="text-gray-400">…</span>
                        {/if}
                    {/each}
                    <button
                        onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        class="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >Next <i class="fa-solid fa-chevron-right ml-1"></i></button>
                </div>
            {/if}
        {/if}
    </section>

    <!-- CTA Section -->
    <section class="bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 py-10 px-4 mt-4">
        <div class="max-w-4xl mx-auto text-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Have a Garage Sale Coming Up?
            </h2>
            <p class="text-gray-600 dark:text-gray-300 mb-6">
                Post your sale for free and reach thousands of bargain hunters in the KC metro area.
            </p>
            <a
                href="/post"
                class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
                <i class="fa-solid fa-plus mr-2"></i>Post Your Sale — It's Free!
            </a>
        </div>
    </section>
</main>

<Footer />

<style>
    .category-scroll {
        scrollbar-width: none;
    }
    .category-scroll::-webkit-scrollbar {
        display: none;
    }
</style>
