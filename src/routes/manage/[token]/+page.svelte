<script lang="ts">
    import { enhance } from "$app/forms";
    import { untrack } from "svelte";
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import { CATEGORIES, CATEGORY_EMOJI } from "$lib/types";
    import type { PageData, ActionData } from "./$types";

    let { data, form }: { data: PageData; form: ActionData } = $props();

    // Tracked for character counters
    let title = $state(untrack(() => data.sale.title) || "");
    let description = $state(untrack(() => data.sale.description) || "");

    // Categories need reactive toggling
    let selectedCategories: string[] = $state(untrack(() => data.sale.categories) || []);

    let showDeleteConfirm = $state(false);
    let isSubmitting = $state(false);
    let isDeleting = $state(false);
    let isUploadingPhotos = $state(false);
    let removingPhotoUrl = $state<string | null>(null);
    const MAX_PHOTOS = 5;

    function toggleCategory(category: string) {
        if (selectedCategories.includes(category)) {
            selectedCategories = selectedCategories.filter((c: string) => c !== category);
        } else if (selectedCategories.length < 5) {
            selectedCategories = [...selectedCategories, category];
        }
    }
</script>

<svelte:head>
    <title>Manage Your Sale - KC Garage Sales</title>
</svelte:head>

<Header />

<main class="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
    <div class="max-w-2xl mx-auto px-4 space-y-4">

        <!-- Page Header -->
        <div class="flex items-start justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Manage Your Sale</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Changes save instantly — no re-verification needed.</p>
            </div>
            <a
                href="/sale/{data.sale.id}"
                target="_blank"
                rel="noopener noreferrer"
                class="shrink-0 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 px-4 py-2 rounded-lg transition-colors"
            >
                View Listing
                <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
            </a>
        </div>

        <!-- Success Banner -->
        {#if form?.success}
            <div class="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <div class="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center shrink-0">
                    <i class="fa-solid fa-check text-green-600 dark:text-green-400 text-sm"></i>
                </div>
                <div>
                    <p class="font-medium text-green-800 dark:text-green-300">Listing updated!</p>
                    <p class="text-sm text-green-700 dark:text-green-400">Your changes are live for shoppers to see.</p>
                </div>
            </div>
        {/if}

        <!-- Error Banner -->
        {#if form?.error}
            <div class="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <i class="fa-solid fa-circle-exclamation text-red-500 shrink-0"></i>
                <p class="text-red-800 dark:text-red-300">{form.error}</p>
            </div>
        {/if}

        <!-- Main Edit Form Card -->
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
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
            >
                <!-- Section: Listing Details -->
                <div class="p-6 md:p-8 space-y-5">
                    <h2 class="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Listing Details</h2>

                    <!-- Title -->
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Sale Title <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            bind:value={title}
                            required
                            maxlength="100"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p class="text-xs text-gray-400 dark:text-gray-500 text-right mt-1">{title.length}/100</p>
                    </div>

                    <!-- Description -->
                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            bind:value={description}
                            rows="4"
                            maxlength="500"
                            placeholder="What items are you selling? Any special highlights?"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        ></textarea>
                        <p class="text-xs text-gray-400 dark:text-gray-500 text-right mt-1">{description.length}/500</p>
                    </div>
                </div>

                <!-- Section: Location -->
                <div class="p-6 md:p-8 space-y-4">
                    <div>
                        <h2 class="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Location</h2>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Updating the address will automatically move your map pin.</p>
                    </div>

                    <!-- Street Address -->
                    <div>
                        <label for="address" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Street Address <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={data.sale.address}
                            required
                            placeholder="123 Main St"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <!-- City / State / ZIP -->
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div class="col-span-2 md:col-span-1">
                            <label for="city" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                City <span class="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={data.sale.city}
                                required
                                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label for="state" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                State <span class="text-red-500">*</span>
                            </label>
                            <select
                                id="state"
                                name="state"
                                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="KS" selected={data.sale.state === "KS"}>Kansas</option>
                                <option value="MO" selected={data.sale.state === "MO"}>Missouri</option>
                            </select>
                        </div>
                        <div>
                            <label for="zip_code" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                ZIP <span class="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="zip_code"
                                name="zip_code"
                                value={data.sale.zip_code}
                                required
                                maxlength="5"
                                inputmode="numeric"
                                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <!-- Section: Schedule -->
                <div class="p-6 md:p-8 space-y-4">
                    <h2 class="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Schedule</h2>

                    <!-- Dates -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="start_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Start Date <span class="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                id="start_date"
                                name="start_date"
                                value={data.sale.start_date}
                                required
                                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label for="end_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                End Date <span class="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <input
                                type="date"
                                id="end_date"
                                name="end_date"
                                value={data.sale.end_date}
                                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave blank for single-day sales</p>
                        </div>
                    </div>

                    <!-- Times -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="start_time" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Start Time <span class="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                id="start_time"
                                name="start_time"
                                value={data.sale.start_time}
                                required
                                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label for="end_time" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                End Time <span class="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                id="end_time"
                                name="end_time"
                                value={data.sale.end_time}
                                required
                                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <!-- Section: Categories -->
                <div class="p-6 md:p-8 space-y-3">
                    <div>
                        <h2 class="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">What's for Sale</h2>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Select up to 5 categories</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        {#each CATEGORIES as category}
                            <button
                                type="button"
                                onclick={() => toggleCategory(category)}
                                class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors {selectedCategories.includes(category)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
                            >
                                {CATEGORY_EMOJI[category]} {category}
                            </button>
                        {/each}
                    </div>
                    <input type="hidden" name="categories" value={JSON.stringify(selectedCategories)} />
                </div>

                <!-- Save Button -->
                <div class="p-6 md:p-8">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        {#if isSubmitting}
                            <i class="fa-solid fa-spinner fa-spin mr-2"></i>Saving...
                        {:else}
                            <i class="fa-solid fa-check mr-2"></i>Save Changes
                        {/if}
                    </button>
                </div>
            </form>
        </div>

        <!-- Photos Card -->
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
            <div class="mb-4">
                <h2 class="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                    Photos
                </h2>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {data.sale.photos?.length || 0} of {MAX_PHOTOS} photos added
                </p>
            </div>

            <div class="flex flex-wrap gap-3 mb-3">
                {#each (data.sale.photos || []) as photo, photoIdx}
                    <div class="relative">
                        <img src={photo} alt="Listing image {photoIdx + 1}" class="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600" />
                        <form
                            method="POST"
                            action="?/removePhoto"
                            use:enhance={() => {
                                removingPhotoUrl = photo;
                                return async ({ update }) => { await update(); removingPhotoUrl = null; };
                            }}
                        >
                            <input type="hidden" name="photoUrl" value={photo} />
                            <button
                                type="submit"
                                disabled={removingPhotoUrl === photo}
                                aria-label="Remove photo {photoIdx + 1}"
                                class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                            >
                                {#if removingPhotoUrl === photo}
                                    <i class="fa-solid fa-spinner fa-spin text-xs"></i>
                                {:else}
                                    <i class="fa-solid fa-times text-xs"></i>
                                {/if}
                            </button>
                        </form>
                    </div>
                {/each}

                {#if (data.sale.photos?.length || 0) < MAX_PHOTOS}
                    <form
                        method="POST"
                        action="?/addPhotos"
                        enctype="multipart/form-data"
                        use:enhance={() => {
                            isUploadingPhotos = true;
                            return async ({ update }) => { await update(); isUploadingPhotos = false; };
                        }}
                    >
                        <label class="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            {#if isUploadingPhotos}
                                <i class="fa-solid fa-spinner fa-spin text-gray-400 text-xl"></i>
                            {:else}
                                <i class="fa-solid fa-plus text-gray-400 text-xl"></i>
                                <span class="text-xs text-gray-400 mt-1">Add Photo</span>
                            {/if}
                            <input
                                type="file"
                                name="photos"
                                accept="image/*"
                                multiple
                                class="hidden"
                                onchange={(e) => (e.target as HTMLElement).closest('form')?.requestSubmit()}
                            />
                        </label>
                    </form>
                {/if}
            </div>
            <p class="text-xs text-gray-400 dark:text-gray-500">JPG, PNG, or WebP — max 5MB each</p>
        </div>

        <!-- Remove Listing Card -->
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
            <h2 class="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Remove Listing</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Permanently remove this listing. Shoppers will no longer be able to find it.
            </p>

            {#if !showDeleteConfirm}
                <button
                    type="button"
                    onclick={() => (showDeleteConfirm = true)}
                    class="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 font-medium rounded-lg transition-colors border border-red-200 dark:border-red-800"
                >
                    <i class="fa-solid fa-trash text-sm"></i>
                    Remove This Listing
                </button>
            {:else}
                <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p class="font-medium text-red-800 dark:text-red-300 mb-1">Are you sure?</p>
                    <p class="text-sm text-red-700 dark:text-red-400 mb-4">This cannot be undone. All photos will also be deleted.</p>
                    <div class="flex gap-3">
                        <form
                            method="POST"
                            action="?/delete"
                            use:enhance={() => {
                                isDeleting = true;
                                return async ({ update }) => { await update(); isDeleting = false; };
                            }}
                        >
                            <button
                                type="submit"
                                disabled={isDeleting}
                                class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors"
                            >
                                {#if isDeleting}
                                    <i class="fa-solid fa-spinner fa-spin mr-2"></i>Removing...
                                {:else}
                                    Yes, Remove It
                                {/if}
                            </button>
                        </form>
                        <button
                            type="button"
                            onclick={() => (showDeleteConfirm = false)}
                            class="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-600 transition-colors"
                        >
                            Keep It
                        </button>
                    </div>
                </div>
            {/if}
        </div>

    </div>
</main>

<Footer />
