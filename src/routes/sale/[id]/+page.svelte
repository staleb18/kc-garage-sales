<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Map from '$lib/components/Map.svelte';
	import type { GarageSale } from '$lib/types';

	interface Props {
		data: {
			sale: GarageSale;
			justVerified: boolean;
			alreadyVerified: boolean;
		};
	}

	let { data }: Props = $props();
	const { sale, justVerified, alreadyVerified } = data;

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr + 'T00:00:00');
		return date.toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function formatTime(timeStr: string): string {
		const [hours, minutes] = timeStr.split(':');
		const hour = parseInt(hours);
		const ampm = hour >= 12 ? 'PM' : 'AM';
		const hour12 = hour % 12 || 12;
		return `${hour12}:${minutes} ${ampm}`;
	}

	function getDateDisplay(): string {
		if (sale.start_date === sale.end_date) {
			return formatDate(sale.start_date);
		}
		return `${formatDate(sale.start_date)} - ${formatDate(sale.end_date)}`;
	}

	function getDirectionsUrl(): string {
		const addr = encodeURIComponent(`${sale.address}, ${sale.city}, ${sale.state} ${sale.zip_code}`);
		return `https://www.google.com/maps/dir/?api=1&destination=${addr}`;
	}
</script>

<svelte:head>
	<title>{sale.title} - KC Garage Sales</title>
	<meta name="description" content="Garage sale in {sale.city}, {sale.state}: {sale.title}" />
</svelte:head>

<Header />

<main class="min-h-screen bg-gray-50 py-8 px-4">
	<div class="max-w-4xl mx-auto">
		<!-- Back Link -->
		<a
			href="/"
			class="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 font-medium"
		>
			<i class="fa-solid fa-arrow-left mr-2"></i>
			Back to all sales
		</a>

		<!-- Success Messages -->
		{#if justVerified}
			<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
				<i class="fa-solid fa-circle-check mr-2"></i>
				Your sale is now live! Share it with friends and neighbors.
			</div>
		{/if}

		{#if alreadyVerified}
			<div class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
				<i class="fa-solid fa-info-circle mr-2"></i>
				This sale was already verified.
			</div>
		{/if}

		<div class="bg-white rounded-xl shadow-sm overflow-hidden">
			<!-- Photos -->
			{#if sale.photos && sale.photos.length > 0}
				<div class="aspect-video bg-gray-100">
					<img src={sale.photos[0]} alt={sale.title} class="w-full h-full object-cover" />
				</div>
			{/if}

			<div class="p-6 md:p-8">
				<!-- Header -->
				<div class="flex flex-wrap items-start justify-between gap-4 mb-6">
					<div>
						{#if sale.is_featured}
							<span
								class="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded mb-2"
							>
								<i class="fa-solid fa-star mr-1"></i>Featured
							</span>
						{/if}
						<h1 class="text-2xl md:text-3xl font-bold text-gray-900">{sale.title}</h1>
					</div>

					<!-- Share Button -->
					<button
						onclick={() => navigator.share?.({ title: sale.title, url: window.location.href })}
						class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
					>
						<i class="fa-solid fa-share-nodes mr-2"></i>
						Share
					</button>
				</div>

				<!-- Key Info -->
				<div class="grid md:grid-cols-2 gap-6 mb-8">
					<div class="space-y-4">
						<!-- Date -->
						<div class="flex items-start gap-3">
							<div
								class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"
							>
								<i class="fa-solid fa-calendar text-blue-600"></i>
							</div>
							<div>
								<p class="font-semibold text-gray-900">{getDateDisplay()}</p>
								<p class="text-gray-600">
									{formatTime(sale.start_time)} - {formatTime(sale.end_time)}
								</p>
							</div>
						</div>

						<!-- Location -->
						<div class="flex items-start gap-3">
							<div
								class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"
							>
								<i class="fa-solid fa-location-dot text-blue-600"></i>
							</div>
							<div>
								<p class="font-semibold text-gray-900">{sale.address}</p>
								<p class="text-gray-600">{sale.city}, {sale.state} {sale.zip_code}</p>
								<a
									href={getDirectionsUrl()}
									target="_blank"
									rel="noopener noreferrer"
									class="text-blue-600 hover:underline text-sm font-medium mt-1 inline-block"
								>
									<i class="fa-solid fa-diamond-turn-right mr-1"></i>
									Get Directions
								</a>
							</div>
						</div>
					</div>

					<!-- Map -->
					<div class="h-48 md:h-full min-h-[200px] rounded-lg overflow-hidden border">
						<Map sales={[sale]} />
					</div>
				</div>

				<!-- Description -->
				{#if sale.description}
					<div class="mb-8">
						<h2 class="text-lg font-semibold text-gray-900 mb-2">Description</h2>
						<p class="text-gray-700 whitespace-pre-wrap">{sale.description}</p>
					</div>
				{/if}

				<!-- Categories -->
				{#if sale.categories && sale.categories.length > 0}
					<div class="mb-8">
						<h2 class="text-lg font-semibold text-gray-900 mb-2">Categories</h2>
						<div class="flex flex-wrap gap-2">
							{#each sale.categories as category}
								<span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
									{category}
								</span>
							{/each}
						</div>
					</div>
				{/if}

				<!-- CTA -->
				<div class="border-t pt-6 flex flex-wrap gap-4">
					<a
						href={getDirectionsUrl()}
						target="_blank"
						rel="noopener noreferrer"
						class="flex-1 min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors text-center"
					>
						<i class="fa-solid fa-diamond-turn-right mr-2"></i>
						Get Directions
					</a>
					<a
						href="/"
						class="flex-1 min-w-[200px] bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors text-center"
					>
						<i class="fa-solid fa-magnifying-glass mr-2"></i>
						Find More Sales
					</a>
				</div>
			</div>
		</div>
	</div>
</main>

<Footer />
