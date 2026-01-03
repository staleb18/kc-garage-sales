<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { browser } from "$app/environment";
    import { KC_CENTER } from "$lib/types";
    import type { GarageSale } from "$lib/types";

    interface Props {
        sales?: GarageSale[];
        onSaleClick?: (sale: GarageSale) => void;
    }

    let { sales = [], onSaleClick }: Props = $props();

    let mapContainer: HTMLDivElement;
    let map: any;
    let markers: any[] = [];
    let L: any;

    onMount(async () => {
        if (!browser) return;

        // Dynamically import Leaflet
        L = await import("leaflet");

        // Import Leaflet CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        // Wait for CSS to load
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Initialize map centered on Kansas City
        map = L.map(mapContainer).setView([KC_CENTER.lat, KC_CENTER.lng], 10);

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(map);

        // Add markers for sales
        updateMarkers();
    });

    function updateMarkers() {
        if (!map || !browser || !L) return;

        // Clear existing markers
        markers.forEach((m) => m.remove());
        markers = [];

        // Create custom icon
        const saleIcon = L.divIcon({
            className: "sale-marker",
            html: `
				<div style="
					width: 32px;
					height: 32px;
					background-color: #2563eb;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					box-shadow: 0 4px 6px rgba(0,0,0,0.3);
					cursor: pointer;
					border: 2px solid white;
				">
					<i class="fa-solid fa-tag" style="color: white; font-size: 12px;"></i>
				</div>
			`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });

        // Add new markers
        sales.forEach((sale) => {
            const marker = L.marker([sale.latitude, sale.longitude], {
                icon: saleIcon,
            }).addTo(map);

            // Add popup with sale info
            marker.bindPopup(`
				<div style="min-width: 150px;">
					<strong>${sale.title}</strong><br>
					<span style="color: #666;">${sale.city}, ${sale.state}</span>
				</div>
			`);

            marker.on("click", () => {
                if (onSaleClick) onSaleClick(sale);
            });

            markers.push(marker);
        });

        // Fit bounds if we have markers
        if (markers.length > 0) {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    $effect(() => {
        if (sales && L) {
            updateMarkers();
        }
    });

    onDestroy(() => {
        if (map) map.remove();
    });
</script>

<div
    bind:this={mapContainer}
    class="w-full h-full min-h-[400px] rounded-xl overflow-hidden"
></div>

<style>
    :global(.sale-marker) {
        background: transparent !important;
        border: none !important;
    }

    :global(.leaflet-popup-content-wrapper) {
        border-radius: 8px;
    }

    :global(.leaflet-popup-content) {
        margin: 12px;
    }
</style>
