<script lang="ts">
    import "../app.css";
    import { browser } from "$app/environment";
    import GoogleAnalytics from "$lib/components/GoogleAnalytics.svelte";

    let { children } = $props();

    // Apply saved theme on load
    if (browser) {
        const saved = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (saved === "dark" || (!saved && prefersDark)) {
            document.documentElement.classList.add("dark");
        }
    }
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossorigin="anonymous"
    />
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
    />
    <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
    />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <meta property="og:site_name" content="KC Garage Sales" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" />
</svelte:head>

<GoogleAnalytics />

<div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
    {@render children()}
</div>
