<script lang="ts">
    import { enhance } from "$app/forms";
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import type { PageData, ActionData } from "./$types";

    let { data, form }: { data: PageData; form: ActionData } = $props();

    let selectedCategories = $state<string[]>(data.sale.categories || []);
    let showDeleteConfirm = $state(false);
    let isSubmitting = $state(false);
    let isDeleting = $state(false);

    function toggleCategory(category: string) {
        if (selectedCategories.includes(category)) {
            selectedCategories = selectedCategories.filter((c) => c !== category);
        } else if (selectedCategories.length < 5) {
            selectedCategories = [...selectedCategories, category];
        }
    }
</script>

<svelte:head>
    <title>Manage Your Sale - KC Garage Sales</title>
</svelte:head>

<Header />

<main class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-4">
        <div class="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <h1 class="text-2xl font-bold text-gray-900 mb-2">Manage Your Sale</h1>
            <p class="text-gray-600 mb-6">Update your listing details or delete it.</p>

            {#if form?.success}
                <div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p class="text-green-800 font-medium">
                        <i class="fa-solid fa-check-circle mr-2"></i>
                        Your sale has been updated!
                    </p>
                </div>
            {/if}

            {#if form?.error}
                <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p class="text-red-800">{form.error}</p>
                </div>
            {/if}

            <form
                method="POST"
                action="?/update"
                use:enhance={() => {
                    isSubmitting = true;
                    return async ({ update }) => {
                        await update();
                        isSubmitting = false;
                    };
                }}
                class="space-y-6"
            >
                <!-- Title -->
                <div>
                    <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
                        Sale Title <span class="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={data.sale.title}
                        required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <!-- Description -->
                <div>
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows="4"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >{data.sale.description}</textarea>
                </div>

                <!-- Dates -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="start_date" class="block text-sm font-medium text-gray-700 mb-1">
                            Start Date <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="start_date"
                            name="start_date"
                            value={data.sale.start_date}
                            required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label for="end_date" class="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            id="end_date"
                            name="end_date"
                            value={data.sale.end_date}
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <!-- Times -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="start_time" class="block text-sm font-medium text-gray-700 mb-1">
                            Start Time <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="time"
                            id="start_time"
                            name="start_time"
                            value={data.sale.start_time}
                            required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label for="end_time" class="block text-sm font-medium text-gray-700 mb-1">
                            End Time <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="time"
                            id="end_time"
                            name="end_time"
                            value={data.sale.end_time}
                            required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <!-- Categories -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Categories (select up to 5)
                    </label>
                    <div class="flex flex-wrap gap-2">
                        {#each data.categories as category}
                            <button
                                type="button"
                                onclick={() => toggleCategory(category)}
                                class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors {selectedCategories.includes(category)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
                            >
                                {category}
                            </button>
                        {/each}
                    </div>
                    <input type="hidden" name="categories" value={JSON.stringify(selectedCategories)} />
                </div>

                <!-- Address (read-only) -->
                <div class="p-4 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-500 mb-1">Address (cannot be changed)</p>
                    <p class="text-gray-900">
                        {data.sale.address}, {data.sale.city}, {data.sale.state} {data.sale.zip_code}
                    </p>
                </div>

                <!-- Submit Button -->
                <button
                    type="submit"
                    disabled={isSubmitting}
                    class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                    {#if isSubmitting}
                        <i class="fa-solid fa-spinner fa-spin mr-2"></i>
                        Saving...
                    {:else}
                        <i class="fa-solid fa-save mr-2"></i>
                        Save Changes
                    {/if}
                </button>
            </form>

            <!-- Delete Section -->
            <div class="mt-8 pt-8 border-t border-gray-200">
                <h2 class="text-lg font-semibold text-gray-900 mb-2">Delete Sale</h2>
                <p class="text-gray-600 mb-4">
                    This will permanently remove your listing. This action cannot be undone.
                </p>

                {#if !showDeleteConfirm}
                    <button
                        type="button"
                        onclick={() => (showDeleteConfirm = true)}
                        class="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition-colors"
                    >
                        <i class="fa-solid fa-trash mr-2"></i>
                        Delete My Sale
                    </button>
                {:else}
                    <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p class="text-red-800 font-medium mb-4">
                            Are you sure you want to delete this sale?
                        </p>
                        <div class="flex gap-3">
                            <form
                                method="POST"
                                action="?/delete"
                                use:enhance={() => {
                                    isDeleting = true;
                                    return async ({ update }) => {
                                        await update();
                                        isDeleting = false;
                                    };
                                }}
                            >
                                <button
                                    type="submit"
                                    disabled={isDeleting}
                                    class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors"
                                >
                                    {#if isDeleting}
                                        <i class="fa-solid fa-spinner fa-spin mr-2"></i>
                                        Deleting...
                                    {:else}
                                        Yes, Delete
                                    {/if}
                                </button>
                            </form>
                            <button
                                type="button"
                                onclick={() => (showDeleteConfirm = false)}
                                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- View Sale Link -->
            <div class="mt-6 text-center">
                <a href="/sale/{data.sale.id}" class="text-blue-600 hover:underline">
                    <i class="fa-solid fa-arrow-left mr-1"></i>
                    View your sale listing
                </a>
            </div>
        </div>
    </div>
</main>

<Footer />
