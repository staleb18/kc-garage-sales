<script lang="ts">
    import { enhance } from "$app/forms";
    import type { GarageSale } from "$lib/types";

    interface Props {
        data: {
            authenticated: boolean;
            sales: GarageSale[];
        };
        form: { error?: string; success?: boolean; deleted?: boolean; updated?: boolean } | null;
    }

    let { data, form }: Props = $props();

    let password = $state("");
    let deletingId = $state<string | null>(null);
    let searchQuery = $state("");

    let filteredSales = $derived(() => {
        if (!searchQuery) return data.sales;
        const query = searchQuery.toLowerCase();
        return data.sales.filter(
            (s) =>
                s.title.toLowerCase().includes(query) ||
                s.email.toLowerCase().includes(query) ||
                s.city.toLowerCase().includes(query) ||
                s.address.toLowerCase().includes(query)
        );
    });

    function formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    function confirmDelete(id: string): boolean {
        return confirm("Are you sure you want to delete this sale? This action cannot be undone.");
    }
</script>

<svelte:head>
    <title>Admin - KC Garage Sales</title>
</svelte:head>

<div class="min-h-screen bg-gray-100">
    {#if !data.authenticated}
        <!-- Login Form -->
        <div class="flex items-center justify-center min-h-screen">
            <div class="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
                <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">
                    <i class="fa-solid fa-lock mr-2"></i>
                    Admin Login
                </h1>

                {#if form?.error}
                    <div class="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4">
                        <i class="fa-solid fa-circle-exclamation mr-2"></i>
                        {form.error}
                    </div>
                {/if}

                <form method="POST" action="?/login" use:enhance>
                    <div class="mb-4">
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            bind:value={password}
                            required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter admin password"
                        />
                    </div>
                    <button
                        type="submit"
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                        Login
                    </button>
                </form>

                <p class="mt-4 text-center text-sm text-gray-500">
                    <a href="/" class="text-blue-600 hover:underline">
                        <i class="fa-solid fa-arrow-left mr-1"></i>
                        Back to site
                    </a>
                </p>
            </div>
        </div>
    {:else}
        <!-- Admin Dashboard -->
        <header class="bg-white shadow">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <h1 class="text-xl font-bold text-gray-900">
                    <i class="fa-solid fa-shield-halved mr-2 text-blue-600"></i>
                    Admin Dashboard
                </h1>
                <div class="flex items-center gap-4">
                    <a href="/" class="text-gray-600 hover:text-gray-900">
                        <i class="fa-solid fa-home mr-1"></i>
                        View Site
                    </a>
                    <form method="POST" action="?/logout" use:enhance>
                        <button type="submit" class="text-red-600 hover:text-red-700">
                            <i class="fa-solid fa-sign-out-alt mr-1"></i>
                            Logout
                        </button>
                    </form>
                </div>
            </div>
        </header>

        <main class="max-w-7xl mx-auto px-4 py-6">
            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-white rounded-lg p-4 shadow">
                    <div class="text-2xl font-bold text-gray-900">{data.sales.length}</div>
                    <div class="text-sm text-gray-500">Total Sales</div>
                </div>
                <div class="bg-white rounded-lg p-4 shadow">
                    <div class="text-2xl font-bold text-green-600">
                        {data.sales.filter((s) => s.is_verified).length}
                    </div>
                    <div class="text-sm text-gray-500">Verified</div>
                </div>
                <div class="bg-white rounded-lg p-4 shadow">
                    <div class="text-2xl font-bold text-amber-600">
                        {data.sales.filter((s) => !s.is_verified).length}
                    </div>
                    <div class="text-sm text-gray-500">Pending Verification</div>
                </div>
                <div class="bg-white rounded-lg p-4 shadow">
                    <div class="text-2xl font-bold text-blue-600">
                        {data.sales.filter((s) => new Date(s.end_date) >= new Date()).length}
                    </div>
                    <div class="text-sm text-gray-500">Active</div>
                </div>
            </div>

            <!-- Search -->
            <div class="mb-4">
                <input
                    type="text"
                    bind:value={searchQuery}
                    placeholder="Search by title, email, city, or address..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <!-- Sales Table -->
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Sale
                                </th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Contact
                                </th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Location
                                </th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Dates
                                </th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            {#each filteredSales() as sale (sale.id)}
                                <tr class="hover:bg-gray-50">
                                    <td class="px-4 py-3">
                                        <div class="font-medium text-gray-900">{sale.title}</div>
                                        <div class="text-xs text-gray-500 font-mono">{sale.id.slice(0, 8)}...</div>
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="text-sm text-gray-900">{sale.email}</div>
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="text-sm text-gray-900">{sale.address}</div>
                                        <div class="text-xs text-gray-500">{sale.city}, {sale.state} {sale.zip_code}</div>
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="text-sm text-gray-900">
                                            {formatDate(sale.start_date)}
                                            {#if sale.start_date !== sale.end_date}
                                                - {formatDate(sale.end_date)}
                                            {/if}
                                        </div>
                                        <div class="text-xs text-gray-500">
                                            {sale.start_time} - {sale.end_time}
                                        </div>
                                    </td>
                                    <td class="px-4 py-3">
                                        {#if sale.is_verified}
                                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                <i class="fa-solid fa-check mr-1"></i>
                                                Verified
                                            </span>
                                        {:else}
                                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                <i class="fa-solid fa-clock mr-1"></i>
                                                Pending
                                            </span>
                                        {/if}
                                        {#if new Date(sale.end_date) < new Date()}
                                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 ml-1">
                                                Expired
                                            </span>
                                        {/if}
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-2">
                                            <!-- View -->
                                            <a
                                                href="/sale/{sale.id}"
                                                target="_blank"
                                                class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                title="View sale"
                                            >
                                                <i class="fa-solid fa-eye"></i>
                                            </a>

                                            <!-- Toggle Verify -->
                                            <form method="POST" action="?/toggleVerify" use:enhance>
                                                <input type="hidden" name="saleId" value={sale.id} />
                                                <input type="hidden" name="currentStatus" value={sale.is_verified} />
                                                <button
                                                    type="submit"
                                                    class="p-1.5 rounded {sale.is_verified
                                                        ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
                                                        : 'text-green-500 hover:text-green-600 hover:bg-green-50'}"
                                                    title={sale.is_verified ? "Unverify" : "Verify"}
                                                >
                                                    <i class="fa-solid {sale.is_verified ? 'fa-xmark' : 'fa-check'}"></i>
                                                </button>
                                            </form>

                                            <!-- Delete -->
                                            <form
                                                method="POST"
                                                action="?/delete"
                                                use:enhance={() => {
                                                    if (!confirmDelete(sale.id)) {
                                                        return () => {};
                                                    }
                                                    deletingId = sale.id;
                                                    return async ({ update }) => {
                                                        await update();
                                                        deletingId = null;
                                                    };
                                                }}
                                            >
                                                <input type="hidden" name="saleId" value={sale.id} />
                                                <button
                                                    type="submit"
                                                    disabled={deletingId === sale.id}
                                                    class="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                                                    title="Delete sale"
                                                >
                                                    {#if deletingId === sale.id}
                                                        <i class="fa-solid fa-spinner fa-spin"></i>
                                                    {:else}
                                                        <i class="fa-solid fa-trash"></i>
                                                    {/if}
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            {:else}
                                <tr>
                                    <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                                        {#if searchQuery}
                                            No sales found matching "{searchQuery}"
                                        {:else}
                                            No sales yet
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
