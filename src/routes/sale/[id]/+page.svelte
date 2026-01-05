<script lang="ts">
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    const sale = data.sale;

    let showReportModal = $state(false);
    let reportReason = $state("");
    let reportSending = $state(false);
    let reportSent = $state(false);

    async function submitReport() {
        reportSending = true;
        try {
            await fetch("/api/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    saleId: sale.id,
                    saleTitle: sale.title,
                    reason: reportReason,
                }),
            });
            reportSent = true;
        } catch (err) {
            console.error("Failed to report:", err);
        } finally {
            reportSending = false;
        }
    }

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

                <!-- Report Button -->
                <div class="border-t pt-6 mt-6">
                    <button
                        onclick={() => (showReportModal = true)}
                        class="text-gray-400 hover:text-red-500 text-sm transition-colors"
                    >
                        <i class="fa-solid fa-flag mr-1"></i>
                        Report this listing
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Report Modal -->
{#if showReportModal}
    <div
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
        <div class="bg-white rounded-xl max-w-md w-full p-6">
            {#if reportSent}
                <div class="text-center">
                    <div
                        class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                        <i class="fa-solid fa-check text-green-600 text-xl"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">
                        Report Submitted
                    </h3>
                    <p class="text-gray-600 mb-4">
                        Thank you for helping keep our community safe.
                    </p>
                    <button
                        onclick={() => (showReportModal = false)}
                        class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                    >
                        Close
                    </button>
                </div>
            {:else}
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                    Report this listing
                </h3>
                <p class="text-gray-600 text-sm mb-4">
                    If this listing contains inappropriate content, please let
                    us know.
                </p>
                <textarea
                    bind:value={reportReason}
                    placeholder="What's wrong with this listing? (optional)"
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
                <div class="flex gap-3">
                    <button
                        onclick={() => (showReportModal = false)}
                        class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onclick={submitReport}
                        disabled={reportSending}
                        class="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2 rounded-lg"
                    >
                        {#if reportSending}
                            <i class="fa-solid fa-spinner fa-spin mr-1"></i>
                        {/if}
                        Submit Report
                    </button>
                </div>
            {/if}
        </div>
    </div>
{/if}
