<script lang="ts">
    import type { GarageSale } from "$lib/types";
    import { CATEGORY_EMOJI } from "$lib/types";
    import { isToday as saleIsToday, isThisWeekend as saleIsThisWeekend } from "$lib/utils/dates";

    interface Props {
        sale: GarageSale;
        // "grid" = photo-forward card (default, used in the browse grid).
        // "row"  = compact horizontal row on mobile (used beside the map).
        variant?: "grid" | "row";
        // Route-planning mode: show a selection checkbox instead of navigating.
        selectable?: boolean;
        selected?: boolean;
        onToggleSelect?: (id: string) => void;
    }

    let {
        sale,
        variant = "grid",
        selectable = false,
        selected = false,
        onToggleSelect,
    }: Props = $props();

    function handleToggle(e: MouseEvent) {
        // The card is a link; keep the checkbox from navigating.
        e.preventDefault();
        e.stopPropagation();
        onToggleSelect?.(sale.id);
    }

    function formatDate(dateStr: string): string {
        const date = new Date(dateStr + "T00:00:00");
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
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

    function getDateDisplay(): string {
        if (sale.start_date === sale.end_date) {
            return formatDate(sale.start_date);
        }
        return `${formatDate(sale.start_date)} - ${formatDate(sale.end_date)}`;
    }

    function isNew(): boolean {
        if (!sale.created_at) return false;
        const created = new Date(sale.created_at);
        const now = new Date();
        return now.getTime() - created.getTime() < 24 * 60 * 60 * 1000;
    }

    const hasPhoto = $derived(!!(sale.photos && sale.photos.length > 0));
    // When there's no photo we show the first category's emoji instead of a
    // broken-image placeholder — it hints at what's for sale and never looks broken.
    const primaryEmoji = $derived(CATEGORY_EMOJI[sale.categories?.[0]] ?? "📦");

    // Local-timezone-correct date checks live in $lib/utils/dates so the badges
    // here and the "Today"/"This Weekend" filters on the home page always agree.
    const today = $derived(saleIsToday(sale));
    const thisWeekend = $derived(saleIsThisWeekend(sale));
</script>

{#snippet selectBox()}
    {#if selectable}
        <button
            type="button"
            onclick={handleToggle}
            aria-pressed={selected}
            aria-label={selected ? "Remove from route" : "Add to route"}
            class="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 flex items-center justify-center shadow-sm transition-colors {selected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/95 border-gray-300 text-transparent hover:border-blue-400'}"
        >
            <i class="fa-solid fa-check text-sm"></i>
        </button>
    {/if}
{/snippet}

{#snippet mediaFill()}
    {#if hasPhoto}
        <img src={sale.photos[0]} alt={sale.title} class="w-full h-full object-cover" />
    {:else}
        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600">
            <span class="text-4xl sm:text-5xl" aria-hidden="true">{primaryEmoji}</span>
        </div>
    {/if}
{/snippet}

{#snippet overlayBadges()}
    {#if sale.is_featured}
        <div class="absolute {selectable ? 'top-12' : 'top-2'} left-2 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded">
            <i class="fa-solid fa-star mr-1"></i>Featured
        </div>
    {/if}
    {#if today}
        <div class="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            <i class="fa-solid fa-fire mr-1"></i>Today
        </div>
    {:else if thisWeekend}
        <div class="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
            <i class="fa-solid fa-calendar-week mr-1"></i>This Weekend
        </div>
    {:else if isNew()}
        <div class="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">New</div>
    {/if}
{/snippet}

{#if variant === "row"}
    <!-- Compact row: small thumbnail left, facts right (mobile); vertical card on sm+. -->
    <a
        href="/sale/{sale.id}"
        class="group flex sm:block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border {selected ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-100 dark:border-gray-700'}"
    >
        <div class="relative shrink-0 w-28 self-stretch sm:w-full sm:self-auto sm:aspect-video bg-gray-100 dark:bg-gray-700">
            {@render selectBox()}
            {@render mediaFill()}
            <div class="hidden sm:block">{@render overlayBadges()}</div>
        </div>

        <div class="flex-1 min-w-0 p-3 sm:p-4">
            <!-- Mobile-only status pills (desktop uses the overlay badges above) -->
            <div class="sm:hidden flex items-center flex-wrap gap-1.5 mb-1">
                {#if today}
                    <span class="bg-red-500 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded"><i class="fa-solid fa-fire mr-0.5"></i>Today</span>
                {:else if thisWeekend}
                    <span class="bg-orange-500 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded"><i class="fa-solid fa-calendar-week mr-0.5"></i>This Weekend</span>
                {:else if isNew()}
                    <span class="bg-green-500 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded">New</span>
                {/if}
                {#if sale.is_featured}
                    <span class="bg-amber-500 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded"><i class="fa-solid fa-star mr-0.5"></i>Featured</span>
                {/if}
            </div>

            <h3 class="font-semibold text-gray-900 dark:text-white text-base sm:text-lg mb-0.5 sm:mb-1 line-clamp-1">{sale.title}</h3>

            <div class="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm mb-1 sm:mb-2">
                <i class="fa-solid fa-location-dot text-blue-600 shrink-0"></i>
                <span class="truncate">{sale.city}, {sale.state}</span>
            </div>

            {#if sale.description}
                <p class="hidden sm:block text-gray-500 dark:text-gray-400 text-sm mb-2 line-clamp-2">{sale.description}</p>
            {/if}

            <div class="sm:hidden flex items-start gap-1 text-gray-600 dark:text-gray-400 text-sm">
                <i class="fa-solid fa-calendar text-blue-600 mt-0.5 shrink-0"></i>
                <span>{getDateDisplay()} · {formatTime(sale.start_time)}–{formatTime(sale.end_time)}</span>
            </div>

            <div class="hidden sm:flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm mb-3">
                <i class="fa-solid fa-calendar text-blue-600"></i>
                <span>{getDateDisplay()}</span>
            </div>
            <div class="hidden sm:flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm mb-3">
                <i class="fa-solid fa-clock text-blue-600"></i>
                <span>{formatTime(sale.start_time)} - {formatTime(sale.end_time)}</span>
            </div>

            {#if sale.categories && sale.categories.length > 0}
                <div class="hidden sm:flex flex-wrap gap-1">
                    {#each sale.categories.slice(0, 3) as category}
                        <span class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded">{category}</span>
                    {/each}
                    {#if sale.categories.length > 3}
                        <span class="text-gray-400 text-xs px-1">+{sale.categories.length - 3} more</span>
                    {/if}
                </div>
            {/if}
        </div>
    </a>
{:else}
    <!-- Photo-forward card: prominent square image on mobile, 16:9 on desktop. -->
    <a
        href="/sale/{sale.id}"
        class="group block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border {selected ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-100 dark:border-gray-700'}"
    >
        <div class="relative w-full aspect-square sm:aspect-video bg-gray-100 dark:bg-gray-700">
            {@render selectBox()}
            {@render mediaFill()}
            {@render overlayBadges()}
        </div>

        <div class="p-3 sm:p-4">
            <h3 class="font-semibold text-gray-900 dark:text-white text-sm sm:text-lg leading-snug mb-1 line-clamp-2">{sale.title}</h3>

            <div class="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">
                <i class="fa-solid fa-location-dot text-blue-600 shrink-0"></i>
                <span class="truncate">{sale.city}, {sale.state}</span>
            </div>

            {#if sale.description}
                <p class="hidden sm:block text-gray-500 dark:text-gray-400 text-sm mb-2 line-clamp-2">{sale.description}</p>
            {/if}

            <!-- Mobile: date + time on one compact line -->
            <div class="sm:hidden flex items-start gap-1 text-gray-600 dark:text-gray-400 text-xs">
                <i class="fa-solid fa-calendar text-blue-600 mt-0.5 shrink-0"></i>
                <span>{getDateDisplay()} · {formatTime(sale.start_time)}–{formatTime(sale.end_time)}</span>
            </div>

            <!-- Desktop: date and time on separate lines, plus categories -->
            <div class="hidden sm:flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm mb-3">
                <i class="fa-solid fa-calendar text-blue-600"></i>
                <span>{getDateDisplay()}</span>
            </div>
            <div class="hidden sm:flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm mb-3">
                <i class="fa-solid fa-clock text-blue-600"></i>
                <span>{formatTime(sale.start_time)} - {formatTime(sale.end_time)}</span>
            </div>

            {#if sale.categories && sale.categories.length > 0}
                <div class="hidden sm:flex flex-wrap gap-1">
                    {#each sale.categories.slice(0, 3) as category}
                        <span class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded">{category}</span>
                    {/each}
                    {#if sale.categories.length > 3}
                        <span class="text-gray-400 text-xs px-1">+{sale.categories.length - 3} more</span>
                    {/if}
                </div>
            {/if}
        </div>
    </a>
{/if}
