<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import SaleCard from "$lib/components/SaleCard.svelte";
    import Map from "$lib/components/Map.svelte";
    import type { GarageSale } from "$lib/types";
    import { CATEGORIES } from "$lib/types";

    interface Props {
        data: { sales: GarageSale[] };
    }

    let { data }: Props = $props();

    let viewMode = $state<"map" | "list">("map");
    let selectedCategory = $state<string>("");
    let searchQuery = $state<string>("");

    let filteredSales = $derived(() => {
        let result = data.sales;

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

    function handleSaleClick(sale: GarageSale) {
        window.location.href = `/sale/${sale.id}`;
    }
</script>

<svelte:head>
    <title>KC Garage Sales - Find Garage Sales in Kansas City Metro</title>
    <meta
        name="description"
        content="Find garage sales, yard sales, and estate sales in the Kansas City metro area. Post your sale for free!"
    />
</svelte:head>

<Header />

<main class="min-h-screen">
    <!-- Hero Section -->
    <section
        class="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12 px-4"
    >
        <div class="max-w-7xl mx-auto text-center">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">
                Find Garage Sales in <span class="text-amber-400"
                    >Kansas City</span
                >
            </h1>
            <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Discover amazing deals at garage sales, yard sales, and estate
                sales across the KC metro area.
            </p>

            <!-- Search Bar -->
            <div class="max-w-2xl mx-auto flex gap-2">
                <div class="flex-1 relative">
                    <i
                        class="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    ></i>
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
                    <i class="fa-solid fa-plus mr-2"></i>
                    Post Sale
                </a>
            </div>
        </div>
    </section>

    <!-- Filters & View Toggle -->
    <section class="bg-white border-b sticky top-16 z-40">
        <div class="max-w-7xl mx-auto px-4 py-3">
            <div class="flex flex-wrap items-center justify-between gap-4">
                <!-- Category Filter -->
                <div
                    class="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0"
                >
                    <button
                        onclick={() => (selectedCategory = "")}
                        class="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors {selectedCategory ===
                        ''
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
                    >
                        All
                    </button>
                    {#each CATEGORIES.slice(0, 6) as category}
                        <button
                            onclick={() => (selectedCategory = category)}
                            class="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors {selectedCategory ===
                            category
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
                        >
                            {category}
                        </button>
                    {/each}
                </div>

                <!-- View Toggle -->
                <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                        onclick={() => (viewMode = "map")}
                        class="px-3 py-1.5 rounded text-sm font-medium transition-colors {viewMode ===
                        'map'
                            ? 'bg-white shadow text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'}"
                    >
                        <i class="fa-solid fa-map mr-1"></i>
                        Map
                    </button>
                    <button
                        onclick={() => (viewMode = "list")}
                        class="px-3 py-1.5 rounded text-sm font-medium transition-colors {viewMode ===
                        'list'
                            ? 'bg-white shadow text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'}"
                    >
                        <i class="fa-solid fa-list mr-1"></i>
                        List
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Results -->
    <section class="max-w-7xl mx-auto px-4 py-6">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">
                {filteredSales().length} upcoming sale{filteredSales()
                    .length !== 1
                    ? "s"
                    : ""}
            </h2>
        </div>

        {#if viewMode === "map"}
            <div class="grid lg:grid-cols-2 gap-6">
                <!-- Map -->
                <div
                    class="h-[500px] lg:h-[600px] rounded-xl overflow-hidden shadow-sm border"
                >
                    <Map
                        sales={filteredSales()}
                        onSaleClick={handleSaleClick}
                    />
                </div>

                <!-- Sale Cards -->
                <div class="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {#if filteredSales().length === 0}
                        <div class="text-center py-12 text-gray-500">
                            <i class="fa-solid fa-tag text-4xl mb-4"></i>
                            <p class="text-lg">No garage sales found</p>
                            <p class="text-sm">Be the first to post one!</p>
                            <a
                                href="/post"
                                class="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                            >
                                Post a Sale
                            </a>
                        </div>
                    {:else}
                        {#each filteredSales() as sale (sale.id)}
                            <SaleCard {sale} />
                        {/each}
                    {/if}
                </div>
            </div>
        {:else}
            <!-- List View -->
            <div
                class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
                {#if filteredSales().length === 0}
                    <div class="col-span-full text-center py-12 text-gray-500">
                        <i class="fa-solid fa-tag text-4xl mb-4"></i>
                        <p class="text-lg">No garage sales found</p>
                        <p class="text-sm">Be the first to post one!</p>
                        <a
                            href="/post"
                            class="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                        >
                            Post a Sale
                        </a>
                    </div>
                {:else}
                    {#each filteredSales() as sale (sale.id)}
                        <SaleCard {sale} />
                    {/each}
                {/if}
            </div>
        {/if}
    </section>

    <!-- CTA Section -->
    <section class="bg-gray-100 py-12 px-4">
        <div class="max-w-4xl mx-auto text-center">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">
                Have a Garage Sale Coming Up?
            </h2>
            <p class="text-gray-600 mb-6">
                Post your sale for free and reach thousands of bargain hunters
                in the KC metro area.
            </p>
            <a
                href="/post"
                class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
                <i class="fa-solid fa-plus mr-2"></i>
                Post Your Sale - It's Free!
            </a>
        </div>
    </section>
</main>

<Footer />
