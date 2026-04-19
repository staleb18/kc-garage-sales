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
    let clusterGroup: any;
    let L: any;

    async function loadScript(src: string): Promise<void> {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve();
            document.head.appendChild(script);
        });
    }

    onMount(async () => {
        if (!browser) return;

        // Import Leaflet CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        // Import MarkerCluster CSS
        const clusterCss1 = document.createElement("link");
        clusterCss1.rel = "stylesheet";
        clusterCss1.href = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css";
        document.head.appendChild(clusterCss1);
        const clusterCss2 = document.createElement("link");
        clusterCss2.rel = "stylesheet";
        clusterCss2.href = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css";
        document.head.appendChild(clusterCss2);

        // Load Leaflet as a global script so window.L is set before MarkerCluster loads
        await loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");

        // Load MarkerCluster plugin (extends window.L)
        await loadScript("https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js");

        // Use the global L which has both Leaflet and MarkerCluster extensions
        L = (window as any).L;

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

        // Remove existing cluster group
        if (clusterGroup) map.removeLayer(clusterGroup);

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

        // Create cluster group with custom cluster icon
        clusterGroup = (L as any).markerClusterGroup({
            maxClusterRadius: 50,
            iconCreateFunction: (cluster: any) => {
                const count = cluster.getChildCount();
                return L.divIcon({
                    html: `<div style="width:36px;height:36px;background:#2563eb;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:13px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${count}</div>`,
                    className: "",
                    iconSize: [36, 36],
                    iconAnchor: [18, 18],
                });
            },
        });

        // Add markers to cluster group
        sales.forEach((sale) => {
            const marker = L.marker([sale.latitude, sale.longitude], { icon: saleIcon });

            marker.bindPopup(`
				<div style="min-width: 150px;">
					<strong>${sale.title}</strong><br>
					<span style="color: #666;">${sale.city}, ${sale.state}</span>
				</div>
			`);

            marker.on("click", () => {
                if (onSaleClick) onSaleClick(sale);
            });

            clusterGroup.addLayer(marker);
        });

        map.addLayer(clusterGroup);

        // Fit bounds if we have markers
        if (sales.length > 0) {
            map.fitBounds(clusterGroup.getBounds().pad(0.1));
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
