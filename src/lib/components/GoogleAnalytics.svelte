<script lang="ts">
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { PUBLIC_GA_MEASUREMENT_ID } from "$env/static/public";
    import { page } from "$app/stores";

    onMount(() => {
        if (!browser || !PUBLIC_GA_MEASUREMENT_ID) return;

        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${PUBLIC_GA_MEASUREMENT_ID}`;
        document.head.appendChild(script);

        (window as any).dataLayer = (window as any).dataLayer || [];
        function gtag(...args: any[]) {
            (window as any).dataLayer.push(args);
        }
        (window as any).gtag = gtag;
        gtag("js", new Date());
        gtag("config", PUBLIC_GA_MEASUREMENT_ID, { send_page_view: false });

        // Track page views on navigation
        const unsubscribe = page.subscribe(($page) => {
            if ((window as any).gtag) {
                (window as any).gtag("event", "page_view", {
                    page_path: $page.url.pathname,
                });
            }
        });

        return unsubscribe;
    });
</script>
