<script lang="ts">
	import type { GarageSale } from '$lib/types';

	interface Props {
		sale: GarageSale;
	}

	let { sale }: Props = $props();

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr + 'T00:00:00');
		return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
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
</script>

<a
	href="/sale/{sale.id}"
	class="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
>
	<!-- Photo -->
	<div class="aspect-video bg-gray-100 relative">
		{#if sale.photos && sale.photos.length > 0}
			<img src={sale.photos[0]} alt={sale.title} class="w-full h-full object-cover" />
		{:else}
			<div class="w-full h-full flex items-center justify-center text-gray-400">
				<i class="fa-solid fa-image text-4xl"></i>
			</div>
		{/if}
		{#if sale.is_featured}
			<div
				class="absolute top-2 left-2 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded"
			>
				<i class="fa-solid fa-star mr-1"></i>Featured
			</div>
		{/if}
	</div>

	<!-- Content -->
	<div class="p-4">
		<h3 class="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">{sale.title}</h3>

		<div class="flex items-center gap-1 text-gray-600 text-sm mb-2">
			<i class="fa-solid fa-location-dot text-blue-600"></i>
			<span class="line-clamp-1">{sale.city}, {sale.state}</span>
		</div>

		<div class="flex items-center gap-1 text-gray-600 text-sm mb-3">
			<i class="fa-solid fa-calendar text-blue-600"></i>
			<span>{getDateDisplay()}</span>
		</div>

		<div class="flex items-center gap-1 text-gray-600 text-sm mb-3">
			<i class="fa-solid fa-clock text-blue-600"></i>
			<span>{formatTime(sale.start_time)} - {formatTime(sale.end_time)}</span>
		</div>

		<!-- Categories -->
		{#if sale.categories && sale.categories.length > 0}
			<div class="flex flex-wrap gap-1">
				{#each sale.categories.slice(0, 3) as category}
					<span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{category}</span>
				{/each}
				{#if sale.categories.length > 3}
					<span class="text-gray-400 text-xs px-1">+{sale.categories.length - 3} more</span>
				{/if}
			</div>
		{/if}
	</div>
</a>
