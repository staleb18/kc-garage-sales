<script lang="ts">
    import type { GarageSale } from "$lib/types";

    interface Props {
        sale: GarageSale;
    }

    let { sale }: Props = $props();

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

    function isToday(): boolean {
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        return sale.start_date <= todayStr && todayStr <= sale.end_date;
    }

    function isThisWeekend(): boolean {
        if (isToday()) return false;
        const today = new Date();
        const day = today.getDay(); // 0=Sun, 6=Sat
        const daysUntilSat = day === 6 ? 0 : (6 - day);
        const sat = new Date(today);
        sat.setDate(today.getDate() + daysUntilSat);
        const sun = new Date(sat);
        sun.setDate(sat.getDate() + 1);
        const satStr = sat.toISOString().slice(0, 10);
        const sunStr = sun.toISOString().slice(0, 10);
        return sale.start_date <= sunStr && sale.end_date >= satStr;
    }
</script>

<a
    href="/sale/{sale.id}"
    class="block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 dark:border-gray-700"
>
    <!-- Photo -->
    <div class="aspect-video bg-gray-100 relative">
        {#if sale.photos && sale.photos.length > 0}
            <img
                src={sale.photos[0]}
                alt={sale.title}
                class="w-full h-full object-cover"
            />
        {:else}
            <div
                class="w-full h-full flex items-center justify-center text-gray-400"
            >
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
        {#if isToday()}
            <div class="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                <i class="fa-solid fa-fire mr-1"></i>Today
            </div>
        {:else if isThisWeekend()}
            <div class="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
                <i class="fa-solid fa-calendar-week mr-1"></i>This Weekend
            </div>
        {:else if isNew()}
            <div class="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                New
            </div>
        {/if}
    </div>

    <!-- Content -->
    <div class="p-4">
        <h3 class="font-semibold text-gray-900 dark:text-white text-lg mb-1 line-clamp-1">
            {sale.title}
        </h3>

        <div class="flex items-start gap-1 text-gray-600 dark:text-gray-400 text-sm mb-2">
            <i class="fa-solid fa-location-dot text-blue-600 mt-0.5"></i>
            <span>{sale.city}, {sale.state}</span>
        </div>

        {#if sale.description}
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                {sale.description}
            </p>
        {/if}

        <div class="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm mb-3">
            <i class="fa-solid fa-calendar text-blue-600"></i>
            <span>{getDateDisplay()}</span>
        </div>

        <div class="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm mb-3">
            <i class="fa-solid fa-clock text-blue-600"></i>
            <span
                >{formatTime(sale.start_time)} - {formatTime(
                    sale.end_time,
                )}</span
            >
        </div>

        <!-- Categories -->
        {#if sale.categories && sale.categories.length > 0}
            <div class="flex flex-wrap gap-1">
                {#each sale.categories.slice(0, 3) as category}
                    <span
                        class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded"
                        >{category}</span
                    >
                {/each}
                {#if sale.categories.length > 3}
                    <span class="text-gray-400 text-xs px-1"
                        >+{sale.categories.length - 3} more</span
                    >
                {/if}
            </div>
        {/if}
    </div>
</a>
