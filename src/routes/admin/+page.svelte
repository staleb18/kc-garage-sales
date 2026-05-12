<script lang="ts">
    import { enhance } from "$app/forms";
    import type { GarageSale } from "$lib/types";

    interface SaleWithReports extends GarageSale {
        report_count?: number;
        report_reasons?: string[];
    }

    interface Props {
        data: { authenticated: boolean; sales: SaleWithReports[] };
        form: { error?: string; success?: boolean; deleted?: boolean; updated?: boolean } | null;
    }

    let { data, form }: Props = $props();

    let password = $state("");
    let searchQuery = $state("");
    let activeFilter = $state<"all" | "pending" | "reported" | "expired">("all");

    // Per-row state
    let deletingConfirmId = $state<string | null>(null);
    let deletingId = $state<string | null>(null);
    let expandedReportId = $state<string | null>(null);

    const today = new Date().toISOString().split("T")[0];

    let pendingCount = $derived(data.sales.filter((s) => !s.is_verified).length);
    let reportedCount = $derived(data.sales.filter((s) => (s.report_count ?? 0) > 0).length);
    let expiredCount = $derived(data.sales.filter((s) => s.end_date < today).length);

    let filteredSales = $derived.by(() => {
        let result = data.sales;

        if (activeFilter === "pending") result = result.filter((s) => !s.is_verified);
        else if (activeFilter === "reported") result = result.filter((s) => (s.report_count ?? 0) > 0);
        else if (activeFilter === "expired") result = result.filter((s) => s.end_date < today);

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (s) =>
                    s.title.toLowerCase().includes(q) ||
                    s.email.toLowerCase().includes(q) ||
                    s.city.toLowerCase().includes(q) ||
                    s.address.toLowerCase().includes(q),
            );
        }

        return result;
    });

    function formatDate(dateStr: string): string {
        return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }
</script>

<svelte:head>
    <title>Admin - KC Garage Sales</title>
</svelte:head>

<div class="min-h-screen bg-gray-100">
    {#if !data.authenticated}
        <!-- Login -->
        <div class="flex items-center justify-center min-h-screen">
            <div class="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
                <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">
                    <i class="fa-solid fa-lock mr-2"></i>Admin Login
                </h1>

                {#if form?.error}
                    <div class="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4">
                        <i class="fa-solid fa-circle-exclamation mr-2"></i>{form.error}
                    </div>
                {/if}

                <form method="POST" action="?/login" use:enhance>
                    <div class="mb-4">
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            bind:value={password}
                            required
                            autofocus
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter admin password"
                        />
                    </div>
                    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                        Login
                    </button>
                </form>

                <p class="mt-4 text-center text-sm text-gray-500">
                    <a href="/" class="text-blue-600 hover:underline"><i class="fa-solid fa-arrow-left mr-1"></i>Back to site</a>
                </p>
            </div>
        </div>
    {:else}
        <!-- Dashboard -->
        <header class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <h1 class="text-xl font-bold text-gray-900">
                    <i class="fa-solid fa-shield-halved mr-2 text-blue-600"></i>Admin Dashboard
                </h1>
                <div class="flex items-center gap-4">
                    <a href="/" class="text-sm text-gray-600 hover:text-gray-900">
                        <i class="fa-solid fa-arrow-up-right-from-square mr-1"></i>View Site
                    </a>
                    <form method="POST" action="?/logout" use:enhance>
                        <button type="submit" class="text-sm text-red-600 hover:text-red-700">
                            <i class="fa-solid fa-sign-out-alt mr-1"></i>Logout
                        </button>
                    </form>
                </div>
            </div>
        </header>

        <main class="max-w-7xl mx-auto px-4 py-6">

            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                <div class="bg-white rounded-lg p-4 shadow-sm">
                    <div class="text-2xl font-bold text-gray-900">{data.sales.length}</div>
                    <div class="text-xs text-gray-500 mt-0.5">Total Listings</div>
                </div>
                <div class="bg-white rounded-lg p-4 shadow-sm">
                    <div class="text-2xl font-bold text-green-600">{data.sales.filter((s) => s.is_verified).length}</div>
                    <div class="text-xs text-gray-500 mt-0.5">Verified</div>
                </div>
                <div class="bg-white rounded-lg p-4 shadow-sm">
                    <div class="text-2xl font-bold text-amber-600">{pendingCount}</div>
                    <div class="text-xs text-gray-500 mt-0.5">Pending</div>
                </div>
                <div class="bg-white rounded-lg p-4 shadow-sm">
                    <div class="text-2xl font-bold text-blue-600">{data.sales.filter((s) => s.end_date >= today).length}</div>
                    <div class="text-xs text-gray-500 mt-0.5">Active</div>
                </div>
                <div class="bg-white rounded-lg p-4 shadow-sm">
                    <div class="text-2xl font-bold text-red-600">{reportedCount}</div>
                    <div class="text-xs text-gray-500 mt-0.5">Reported</div>
                </div>
            </div>

            <!-- Search + Filter Tabs -->
            <div class="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
                <div class="p-3 border-b border-gray-100">
                    <div class="relative">
                        <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                        <input
                            type="text"
                            bind:value={searchQuery}
                            placeholder="Search by title, email, city, or address..."
                            class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
                <div class="flex items-center gap-1 px-3 py-2 overflow-x-auto">
                    {#each [
                        { key: "all", label: "All", count: data.sales.length },
                        { key: "pending", label: "Pending", count: pendingCount },
                        { key: "reported", label: "Reported", count: reportedCount },
                        { key: "expired", label: "Expired", count: expiredCount },
                    ] as tab}
                        <button
                            onclick={() => (activeFilter = tab.key as typeof activeFilter)}
                            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors {activeFilter === tab.key
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'}"
                        >
                            {tab.label}
                            <span class="text-xs {activeFilter === tab.key ? 'opacity-80' : 'text-gray-400'}">({tab.count})</span>
                        </button>
                    {/each}
                    <span class="ml-auto text-xs text-gray-400 whitespace-nowrap">{filteredSales.length} showing</span>
                </div>
            </div>

            <!-- Table -->
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Sale</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Schedule</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Reports</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            {#each filteredSales as sale (sale.id)}
                                <!-- Main row -->
                                <tr class="hover:bg-gray-50 {deletingConfirmId === sale.id ? 'bg-red-50' : ''}">
                                    <td class="px-4 py-3 max-w-[200px]">
                                        <div class="font-medium text-gray-900 truncate">{sale.title}</div>
                                        <div class="text-xs text-gray-400 font-mono">{sale.id.slice(0, 8)}…</div>
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="text-gray-700 truncate max-w-[160px]">{sale.email}</div>
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="text-gray-900">{sale.address}</div>
                                        <div class="text-xs text-gray-500">{sale.city}, {sale.state} {sale.zip_code}</div>
                                    </td>
                                    <td class="px-4 py-3 whitespace-nowrap">
                                        <div class="text-gray-900">{formatDate(sale.start_date)}</div>
                                        {#if sale.start_date !== sale.end_date}
                                            <div class="text-xs text-gray-500">→ {formatDate(sale.end_date)}</div>
                                        {/if}
                                        <div class="text-xs text-gray-400">{sale.start_time} – {sale.end_time}</div>
                                    </td>
                                    <td class="px-4 py-3">
                                        {#if sale.report_count && sale.report_count > 0}
                                            <button
                                                onclick={() => (expandedReportId = expandedReportId === sale.id ? null : sale.id)}
                                                class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                                title="Click to see report reasons"
                                            >
                                                <i class="fa-solid fa-flag"></i>
                                                {sale.report_count}
                                                <i class="fa-solid fa-chevron-{expandedReportId === sale.id ? 'up' : 'down'} text-[10px]"></i>
                                            </button>
                                        {:else}
                                            <span class="text-xs text-gray-300">—</span>
                                        {/if}
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="flex flex-wrap gap-1">
                                            {#if sale.is_verified}
                                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    <i class="fa-solid fa-check mr-1"></i>Verified
                                                </span>
                                            {:else}
                                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                    <i class="fa-solid fa-clock mr-1"></i>Pending
                                                </span>
                                            {/if}
                                            {#if sale.end_date < today}
                                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                                    Expired
                                                </span>
                                            {/if}
                                            {#if sale.is_featured}
                                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                    <i class="fa-solid fa-star mr-1"></i>Featured
                                                </span>
                                            {/if}
                                        </div>
                                    </td>
                                    <td class="px-4 py-3">
                                        {#if deletingConfirmId === sale.id}
                                            <!-- Inline delete confirmation -->
                                            <div class="flex items-center gap-2">
                                                <span class="text-xs text-red-700 font-medium whitespace-nowrap">Delete?</span>
                                                <form
                                                    method="POST"
                                                    action="?/delete"
                                                    use:enhance={() => {
                                                        deletingId = sale.id;
                                                        deletingConfirmId = null;
                                                        return async ({ update }) => { await update(); deletingId = null; };
                                                    }}
                                                >
                                                    <input type="hidden" name="saleId" value={sale.id} />
                                                    <button
                                                        type="submit"
                                                        disabled={deletingId === sale.id}
                                                        class="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded font-medium"
                                                    >
                                                        {#if deletingId === sale.id}
                                                            <i class="fa-solid fa-spinner fa-spin"></i>
                                                        {:else}
                                                            Yes
                                                        {/if}
                                                    </button>
                                                </form>
                                                <button
                                                    onclick={() => (deletingConfirmId = null)}
                                                    class="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-medium"
                                                >
                                                    No
                                                </button>
                                            </div>
                                        {:else}
                                            <div class="flex items-center gap-1">
                                                <!-- View -->
                                                <a
                                                    href="/sale/{sale.id}"
                                                    target="_blank"
                                                    class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="View listing"
                                                >
                                                    <i class="fa-solid fa-eye text-sm"></i>
                                                </a>

                                                <!-- Manage -->
                                                <a
                                                    href="/manage/{sale.edit_token}"
                                                    target="_blank"
                                                    class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit listing"
                                                >
                                                    <i class="fa-solid fa-pen text-sm"></i>
                                                </a>

                                                <!-- Toggle Verify -->
                                                <form method="POST" action="?/toggleVerify" use:enhance>
                                                    <input type="hidden" name="saleId" value={sale.id} />
                                                    <input type="hidden" name="currentStatus" value={sale.is_verified} />
                                                    <button
                                                        type="submit"
                                                        class="p-1.5 rounded transition-colors {sale.is_verified
                                                            ? 'text-amber-400 hover:text-amber-600 hover:bg-amber-50'
                                                            : 'text-green-400 hover:text-green-600 hover:bg-green-50'}"
                                                        title={sale.is_verified ? "Unverify" : "Verify"}
                                                    >
                                                        <i class="fa-solid {sale.is_verified ? 'fa-xmark' : 'fa-check'} text-sm"></i>
                                                    </button>
                                                </form>

                                                <!-- Toggle Featured -->
                                                <form method="POST" action="?/toggleFeatured" use:enhance>
                                                    <input type="hidden" name="saleId" value={sale.id} />
                                                    <input type="hidden" name="currentStatus" value={sale.is_featured} />
                                                    <button
                                                        type="submit"
                                                        class="p-1.5 rounded transition-colors {sale.is_featured
                                                            ? 'text-amber-400 hover:text-amber-600 hover:bg-amber-50'
                                                            : 'text-gray-300 hover:text-amber-500 hover:bg-amber-50'}"
                                                        title={sale.is_featured ? "Remove featured" : "Mark as featured"}
                                                    >
                                                        <i class="fa-solid fa-star text-sm"></i>
                                                    </button>
                                                </form>

                                                <!-- Delete -->
                                                <button
                                                    onclick={() => (deletingConfirmId = sale.id)}
                                                    class="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete listing"
                                                >
                                                    <i class="fa-solid fa-trash text-sm"></i>
                                                </button>
                                            </div>
                                        {/if}
                                    </td>
                                </tr>

                                <!-- Expandable reports row -->
                                {#if expandedReportId === sale.id && sale.report_reasons && sale.report_reasons.length > 0}
                                    <tr class="bg-red-50 border-t-0">
                                        <td colspan="7" class="px-4 py-3">
                                            <p class="text-xs font-semibold text-red-700 mb-2">
                                                <i class="fa-solid fa-flag mr-1"></i>Report reasons ({sale.report_count})
                                            </p>
                                            <ul class="space-y-1">
                                                {#each sale.report_reasons as reason}
                                                    <li class="text-xs text-red-800 bg-white border border-red-100 rounded px-3 py-1.5">
                                                        "{reason}"
                                                    </li>
                                                {/each}
                                            </ul>
                                        </td>
                                    </tr>
                                {:else if expandedReportId === sale.id}
                                    <tr class="bg-red-50">
                                        <td colspan="7" class="px-4 py-3 text-xs text-red-600 italic">
                                            No reason was provided for {sale.report_count === 1 ? "this report" : "these reports"}.
                                        </td>
                                    </tr>
                                {/if}
                            {:else}
                                <tr>
                                    <td colspan="7" class="px-4 py-12 text-center text-gray-400">
                                        {#if searchQuery || activeFilter !== "all"}
                                            <i class="fa-solid fa-filter text-2xl mb-2 block"></i>
                                            No listings match your current filters.
                                        {:else}
                                            <i class="fa-solid fa-tag text-2xl mb-2 block"></i>
                                            No listings yet.
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    {/if}
</div>
