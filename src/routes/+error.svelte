<script lang="ts">
    import { page } from "$app/stores";
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
</script>

<svelte:head>
    <title>{$page.status} - KC Garage Sales</title>
</svelte:head>

<Header />

<main class="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
    <div class="text-center max-w-md">
        <div class="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fa-solid fa-{$page.status === 404 ? 'map-location-dot' : 'triangle-exclamation'} text-blue-600 text-3xl"></i>
        </div>
        <h1 class="text-6xl font-bold text-gray-900 dark:text-white mb-2">{$page.status}</h1>
        <p class="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
            {$page.status === 404 ? "Page not found" : "Something went wrong"}
        </p>
        <p class="text-gray-500 dark:text-gray-400 mb-8">
            {$page.status === 404
                ? "The page you're looking for doesn't exist or the sale may have been removed."
                : "We ran into an unexpected error. Please try again."}
        </p>
        <div class="flex gap-3 justify-center">
            <a
                href="/"
                class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
                <i class="fa-solid fa-house mr-2"></i>Back to Home
            </a>
            <a
                href="/contact"
                class="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
                Contact Us
            </a>
        </div>
    </div>
</main>

<Footer />
