<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { PUBLIC_MAPBOX_TOKEN } from '$env/static/public';
	import { KC_CENTER } from '$lib/types';
	import type { GarageSale } from '$lib/types';

	interface Props {
		sales?: GarageSale[];
		onSaleClick?: (sale: GarageSale) => void;
	}

	let { sales = [], onSaleClick }: Props = $props();

	let mapContainer: HTMLDivElement;
	let map: any;
	let markers: any[] = [];

	onMount(async () => {
		if (!browser) return;

		const mapboxgl = await import('mapbox-gl');
		await import('mapbox-gl/dist/mapbox-gl.css');

		mapboxgl.default.accessToken = PUBLIC_MAPBOX_TOKEN;

		map = new mapboxgl.default.Map({
			container: mapContainer,
			style: 'mapbox://styles/mapbox/streets-v12',
			center: [KC_CENTER.lng, KC_CENTER.lat],
			zoom: 10
		});

		map.addControl(new mapboxgl.default.NavigationControl(), 'top-right');

		// Add markers for sales
		updateMarkers();
	});

	function updateMarkers() {
		if (!map || !browser) return;

		// Clear existing markers
		markers.forEach((m) => m.remove());
		markers = [];

		// Add new markers
		sales.forEach((sale) => {
			import('mapbox-gl').then((mapboxgl) => {
				const el = document.createElement('div');
				el.className = 'sale-marker';
				el.innerHTML = `
					<div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-blue-700 transition-colors border-2 border-white">
						<i class="fa-solid fa-tag text-white text-sm"></i>
					</div>
				`;

				const marker = new mapboxgl.default.Marker(el)
					.setLngLat([sale.longitude, sale.latitude])
					.addTo(map);

				el.addEventListener('click', () => {
					if (onSaleClick) onSaleClick(sale);
				});

				markers.push(marker);
			});
		});
	}

	$effect(() => {
		if (sales) {
			updateMarkers();
		}
	});

	onDestroy(() => {
		if (map) map.remove();
	});
</script>

<div bind:this={mapContainer} class="w-full h-full min-h-[400px] rounded-xl overflow-hidden"></div>

<style>
	:global(.mapboxgl-ctrl-logo) {
		display: none !important;
	}
</style>
