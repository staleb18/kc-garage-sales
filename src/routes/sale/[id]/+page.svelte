<script lang="ts">
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    const sale = data.sale;

    function formatDate(dateStr: string): string {
        const date = new Date(dateStr + "T00:00:00");
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    function formatTime(timeStr: string): string {
        const [hours, minutes] = timeStr.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    }

    function getGoogleMapsUrl(): string {
        const address = encodeURIComponent(
            `${sale.address}, ${sale.city}, ${sale.state} ${sale.zip_code}`,
        );
        return `https://www.google.com/maps/search/?api=1&query=${address}`;
    }
</script>

<svelte:head>
    <title>{sale.title} - KC Garage Sales</title>
    <meta
        name="description"
        content={sale.description ||
            `Garage sale in ${sale.city}, ${sale.state}`}
    />
</svelte:head>

<div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b">
        <div class="max-w-4xl mx-auto px-4 py-4">
            <a
                href="/"
                class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
                <i class="fa-solid fa-arrow-left"></i>
                <span>Back to all sales</span>
            </a>
        </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 py-8">
        <div
            class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
            <!-- Photo -->
            <div class="aspect-video bg-gray-100 relative">
                {#if sale.photos && sale.photos.length > 0}
                    <img
                        src={sale.photos[0]}
                        alt={sale.title}
                        class="w-full h-full object-cover"
                    />
                {:else}
                    <div
                        class="w-full h-full flex items-center justify-center text-gray-400"
                    >
                        <i class="fa-solid fa-image text-6xl"></i>
                    </div>
                {/if}
                {#if sale.is_featured}
                    <div
                        class="absolute top-4 left-4 bg-amber-500 text-white font-semibold px-3 py-1.5 rounded-lg"
                    >
                        <i class="fa-solid fa-star mr-1"></i>Featured
                    </div>
                {/if}
            </div>

            <!-- Content -->
            <div class="p-6 md:p-8">
                <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    {sale.title}
                </h1>

                <!-- Address with map link -->
                <a
                    href={getGoogleMapsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-start gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors mb-6"
                >
                    <i
                        class="fa-solid fa-location-dot text-blue-600 text-xl mt-0.5"
                    ></i>
                    <div>
                        <p class="font-medium text-gray-900">{sale.address}</p>
                        <p class="text-gray-600">
                            {sale.city}, {sale.state}
                            {sale.zip_code}
                        </p>
                        <p class="text-blue-600 text-sm mt-1">
                            <i class="fa-solid fa-external-link mr-1"></i>Open
                            in Google Maps
                        </p>
                    </div>
                </a>

                <!-- Date and Time -->
                <div class="grid md:grid-cols-2 gap-4 mb-6">
                    <div class="flex items-start gap-3">
                        <i
                            class="fa-solid fa-calendar text-blue-600 text-xl mt-0.5"
                        ></i>
                        <div>
                            <p class="font-medium text-gray-900">Date</p>
                            {#if sale.start_date === sale.end_date}
                                <p class="text-gray-600">
                                    {formatDate(sale.start_date)}
                                </p>
                            {:else}
                                <p class="text-gray-600">
                                    {formatDate(sale.start_date)}
                                </p>
                                <p class="text-gray-600">
                                    to {formatDate(sale.end_date)}
                                </p>
                            {/if}
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <i
                            class="fa-solid fa-clock text-blue-600 text-xl mt-0.5"
                        ></i>
                        <div>
                            <p class="font-medium text-gray-900">Time</p>
                            <p class="text-gray-600">
                                {formatTime(sale.start_time)} - {formatTime(
                                    sale.end_time,
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Description -->
                {#if sale.description}
                    <div class="mb-6">
                        <h2 class="font-semibold text-gray-900 mb-2">
                            Description
                        </h2>
                        <p class="text-gray-600 whitespace-pre-wrap">
                            {sale.description}
                        </p>
                    </div>
                {/if}

                <!-- Categories -->
                {#if sale.categories && sale.categories.length > 0}
                    <div class="mb-6">
                        <h2 class="font-semibold text-gray-900 mb-2">
                            What's for sale
                        </h2>
                        <div class="flex flex-wrap gap-2">
                            {#each sale.categories as category}
                                <span
                                    class="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg"
                                    >{category}</span
                                >
                            {/each}
                        </div>
                    </div>
                {/if}

                <!-- Contact -->
                {#if sale.email}
                    <div class="border-t pt-6">
                        <h2 class="font-semibold text-gray-900 mb-3">
                            Contact
                        </h2>
                        <a
                            href="mailto:{sale.email}"
                            class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <i class="fa-solid fa-envelope"></i>
                            <span>Email seller</span>
                        </a>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>
