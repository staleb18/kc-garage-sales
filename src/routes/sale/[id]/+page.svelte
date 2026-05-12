<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import { page } from "$app/state";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    const sale = $derived(data.sale);

    let showReportModal = $state(false);
    let reportReason = $state("");
    let reportSending = $state(false);
    let reportSent = $state(false);

    // Photo carousel
    let currentPhotoIndex = $state(0);
    const photos = $derived(sale.photos && sale.photos.length > 0 ? sale.photos : []);

    function prevPhoto() {
        currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
    }
    function nextPhoto() {
        currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
    }

    // Social sharing
    function copyLink() {
        navigator.clipboard.writeText(page.url.href);
        linkCopied = true;
        setTimeout(() => (linkCopied = false), 2000);
    }
    let linkCopied = $state(false);

    function getShareUrl(platform: string): string {
        const url = encodeURIComponent(page.url.href);
        const text = encodeURIComponent(`Check out this garage sale: ${sale.title}`);
        if (platform === "facebook") return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        if (platform === "twitter") return `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        if (platform === "email") return `mailto:?subject=${encodeURIComponent(sale.title)}&body=${text}%20${url}`;
        return "#";
    }

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
    {@const saleUrl = `https://kcgaragesales.com/sale/${sale.id}`}
    {@const saleDescription = sale.description || `Garage sale in ${sale.city}, ${sale.state} on ${sale.start_date}`}
    {@const saleImage = sale.photos && sale.photos.length > 0 ? sale.photos[0] : 'https://kcgaragesales.com/og-image.svg'}
    {@const jsonLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Event",
        "name": sale.title,
        "description": saleDescription,
        "startDate": `${sale.start_date}T${sale.start_time}`,
        "endDate": `${sale.end_date}T${sale.end_time}`,
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "location": {
            "@type": "Place",
            "name": sale.title,
            "address": {
                "@type": "PostalAddress",
                "streetAddress": sale.address,
                "addressLocality": sale.city,
                "addressRegion": sale.state,
                "postalCode": sale.zip_code,
                "addressCountry": "US"
            }
        },
        "organizer": {
            "@type": "Organization",
            "name": "KC Garage Sales",
            "url": "https://kcgaragesales.com"
        },
        "image": saleImage,
        "url": saleUrl
    })}
    <title>{sale.title} — {sale.city}, {sale.state} Garage Sale | KC Garage Sales</title>
    <meta name="description" content={saleDescription} />
    <link rel="canonical" href={saleUrl} />
    <meta property="og:title" content="{sale.title} — {sale.city} Garage Sale" />
    <meta property="og:description" content={saleDescription} />
    <meta property="og:url" content={saleUrl} />
    <meta property="og:type" content="article" />
    <meta property="og:image" content={saleImage} />
    <meta name="twitter:title" content="{sale.title} — {sale.city} Garage Sale" />
    <meta name="twitter:description" content={saleDescription} />
    <meta name="twitter:image" content={saleImage} />
    {@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<Header />

{#if new Date(sale.end_date + "T23:59:59") < new Date()}
    <div class="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
        <div class="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
            <i class="fa-solid fa-clock-rotate-left text-amber-600 dark:text-amber-400 shrink-0"></i>
            <p class="text-sm text-amber-800 dark:text-amber-300">
                <span class="font-semibold">This sale has ended.</span>
                It took place on {formatDate(sale.end_date)}. Check the home page for upcoming sales.
            </p>
            <a href="/" class="ml-auto shrink-0 text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline whitespace-nowrap">
                Find active sales →
            </a>
        </div>
    </div>
{/if}

<div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Back link -->
    <div class="bg-white dark:bg-gray-900 border-b dark:border-gray-700">
        <div class="max-w-4xl mx-auto px-4 py-4">
            <a href="/" class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
                <i class="fa-solid fa-arrow-left"></i>
                <span>Back to all sales</span>
            </a>
        </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 py-8">
        <div
            class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
            <!-- Photo Carousel -->
            <div class="aspect-video bg-gray-100 relative overflow-hidden">
                {#if photos.length > 0}
                    <img
                        src={photos[currentPhotoIndex]}
                        alt="{sale.title} photo {currentPhotoIndex + 1}"
                        class="w-full h-full object-cover"
                    />
                    {#if photos.length > 1}
                        <button
                            onclick={prevPhoto}
                            class="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                            aria-label="Previous photo"
                        >
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                        <button
                            onclick={nextPhoto}
                            class="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                            aria-label="Next photo"
                        >
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>
                        <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {#each photos as _, i}
                                <button
                                    onclick={() => (currentPhotoIndex = i)}
                                    class="w-2 h-2 rounded-full transition-colors {i === currentPhotoIndex ? 'bg-white' : 'bg-white/50'}"
                                    aria-label="Go to photo {i + 1}"
                                ></button>
                            {/each}
                        </div>
                        <div class="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                            {currentPhotoIndex + 1} / {photos.length}
                        </div>
                    {/if}
                {:else}
                    <div class="w-full h-full flex items-center justify-center text-gray-400">
                        <i class="fa-solid fa-image text-6xl"></i>
                    </div>
                {/if}
                {#if sale.is_featured}
                    <div class="absolute top-4 left-4 bg-amber-500 text-white font-semibold px-3 py-1.5 rounded-lg">
                        <i class="fa-solid fa-star mr-1"></i>Featured
                    </div>
                {/if}
            </div>

            <!-- Content -->
            <div class="p-6 md:p-8">
                <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
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
                <div class="border-t pt-6">
                    <h2 class="font-semibold text-gray-900 dark:text-white mb-3">
                        Questions?
                    </h2>
                    <p class="text-gray-600 dark:text-gray-400 text-sm">
                        Show up during the listed hours — garage sales are walk-in events. Check the address and time above.
                    </p>
                </div>

                <!-- Share & Report -->
                <div class="border-t pt-6 mt-6 flex items-center justify-between flex-wrap gap-4">
                    <!-- Share buttons -->
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-500 font-medium">Share:</span>
                        <a
                            href={getShareUrl("facebook")}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                            aria-label="Share on Facebook"
                        >
                            <i class="fa-brands fa-facebook-f text-sm"></i>
                        </a>
                        <a
                            href={getShareUrl("twitter")}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="w-8 h-8 flex items-center justify-center bg-gray-900 hover:bg-black text-white rounded-full transition-colors"
                            aria-label="Share on X"
                        >
                            <i class="fa-brands fa-x-twitter text-sm"></i>
                        </a>
                        <a
                            href={getShareUrl("email")}
                            class="w-8 h-8 flex items-center justify-center bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-colors"
                            aria-label="Share via email"
                        >
                            <i class="fa-solid fa-envelope text-sm"></i>
                        </a>
                        <button
                            onclick={copyLink}
                            class="w-8 h-8 flex items-center justify-center {linkCopied ? 'bg-green-500' : 'bg-gray-200 hover:bg-gray-300'} text-gray-700 rounded-full transition-colors"
                            aria-label="Copy link"
                        >
                            <i class="fa-solid {linkCopied ? 'fa-check text-white' : 'fa-link'} text-sm"></i>
                        </button>
                    </div>
                    <!-- Report button -->
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

<Footer />

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
