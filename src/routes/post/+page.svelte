<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { CATEGORIES } from '$lib/types';

	let isSubmitting = $state(false);
	let error = $state('');
	let success = $state(false);

	// Form fields
	let email = $state('');
	let title = $state('');
	let description = $state('');
	let address = $state('');
	let city = $state('');
	let state = $state<'KS' | 'MO'>('KS');
	let zipCode = $state('');
	let startDate = $state('');
	let endDate = $state('');
	let startTime = $state('08:00');
	let endTime = $state('14:00');
	let selectedCategories = $state<string[]>([]);

	// Get tomorrow's date as minimum
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	const minDate = tomorrow.toISOString().split('T')[0];

	function toggleCategory(category: string) {
		if (selectedCategories.includes(category)) {
			selectedCategories = selectedCategories.filter((c) => c !== category);
		} else if (selectedCategories.length < 5) {
			selectedCategories = [...selectedCategories, category];
		}
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		isSubmitting = true;

		try {
			const response = await fetch('/api/sales', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email,
					title,
					description,
					address,
					city,
					state,
					zip_code: zipCode,
					start_date: startDate,
					end_date: endDate || startDate,
					start_time: startTime,
					end_time: endTime,
					categories: selectedCategories
				})
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to create sale');
			}

			success = true;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Post a Garage Sale - KC Garage Sales</title>
	<meta name="description" content="Post your garage sale for free on KC Garage Sales." />
</svelte:head>

<Header />

<main class="min-h-screen bg-gray-50 py-8 px-4">
	<div class="max-w-2xl mx-auto">
		{#if success}
			<!-- Success Message -->
			<div class="bg-white rounded-xl shadow-sm p-8 text-center">
				<div
					class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
				>
					<i class="fa-solid fa-check text-green-600 text-2xl"></i>
				</div>
				<h1 class="text-2xl font-bold text-gray-900 mb-2">Check Your Email!</h1>
				<p class="text-gray-600 mb-6">
					We've sent a verification link to <strong>{email}</strong>. Click the link to publish
					your garage sale.
				</p>
				<p class="text-sm text-gray-500">
					Didn't receive it? Check your spam folder or
					<button onclick={() => (success = false)} class="text-blue-600 hover:underline">
						try again
					</button>
				</p>
			</div>
		{:else}
			<!-- Form -->
			<div class="bg-white rounded-xl shadow-sm p-6 md:p-8">
				<div class="mb-6">
					<h1 class="text-2xl font-bold text-gray-900">Post Your Garage Sale</h1>
					<p class="text-gray-600">It's free! Just fill out the details below.</p>
				</div>

				{#if error}
					<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
						<i class="fa-solid fa-circle-exclamation mr-2"></i>
						{error}
					</div>
				{/if}

				<form onsubmit={handleSubmit} class="space-y-6">
					<!-- Email -->
					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
							Email Address <span class="text-red-500">*</span>
						</label>
						<input
							type="email"
							id="email"
							bind:value={email}
							required
							placeholder="your@email.com"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
						<p class="text-xs text-gray-500 mt-1">
							We'll send you a link to verify and manage your sale
						</p>
					</div>

					<!-- Title -->
					<div>
						<label for="title" class="block text-sm font-medium text-gray-700 mb-1">
							Sale Title <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="title"
							bind:value={title}
							required
							maxlength="100"
							placeholder="e.g., Multi-Family Garage Sale"
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
							bind:value={description}
							rows="3"
							maxlength="500"
							placeholder="What items are you selling? Any special highlights?"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						></textarea>
					</div>

					<!-- Address -->
					<div class="grid md:grid-cols-2 gap-4">
						<div class="md:col-span-2">
							<label for="address" class="block text-sm font-medium text-gray-700 mb-1">
								Street Address <span class="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="address"
								bind:value={address}
								required
								placeholder="123 Main St"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label for="city" class="block text-sm font-medium text-gray-700 mb-1">
								City <span class="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="city"
								bind:value={city}
								required
								placeholder="Overland Park"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="state" class="block text-sm font-medium text-gray-700 mb-1">
									State <span class="text-red-500">*</span>
								</label>
								<select
									id="state"
									bind:value={state}
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								>
									<option value="KS">Kansas</option>
									<option value="MO">Missouri</option>
								</select>
							</div>

							<div>
								<label for="zipCode" class="block text-sm font-medium text-gray-700 mb-1">
									ZIP <span class="text-red-500">*</span>
								</label>
								<input
									type="text"
									id="zipCode"
									bind:value={zipCode}
									required
									pattern="[0-9]{5}"
									placeholder="66210"
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
						</div>
					</div>

					<!-- Dates -->
					<div class="grid md:grid-cols-2 gap-4">
						<div>
							<label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">
								Start Date <span class="text-red-500">*</span>
							</label>
							<input
								type="date"
								id="startDate"
								bind:value={startDate}
								required
								min={minDate}
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">
								End Date <span class="text-gray-400">(optional)</span>
							</label>
							<input
								type="date"
								id="endDate"
								bind:value={endDate}
								min={startDate || minDate}
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
							<p class="text-xs text-gray-500 mt-1">Leave blank for single-day sales</p>
						</div>
					</div>

					<!-- Times -->
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="startTime" class="block text-sm font-medium text-gray-700 mb-1">
								Start Time <span class="text-red-500">*</span>
							</label>
							<input
								type="time"
								id="startTime"
								bind:value={startTime}
								required
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label for="endTime" class="block text-sm font-medium text-gray-700 mb-1">
								End Time <span class="text-red-500">*</span>
							</label>
							<input
								type="time"
								id="endTime"
								bind:value={endTime}
								required
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
					</div>

					<!-- Categories -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">
							Categories <span class="text-gray-400">(select up to 5)</span>
						</label>
						<div class="flex flex-wrap gap-2">
							{#each CATEGORIES as category}
								<button
									type="button"
									onclick={() => toggleCategory(category)}
									class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors {selectedCategories.includes(
										category
									)
										? 'bg-blue-600 text-white'
										: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
								>
									{category}
								</button>
							{/each}
						</div>
					</div>

					<!-- Submit -->
					<button
						type="submit"
						disabled={isSubmitting}
						class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-semibold transition-colors"
					>
						{#if isSubmitting}
							<i class="fa-solid fa-spinner fa-spin mr-2"></i>
							Posting...
						{:else}
							<i class="fa-solid fa-paper-plane mr-2"></i>
							Post My Sale
						{/if}
					</button>

					<p class="text-xs text-center text-gray-500">
						By posting, you agree to our terms. Your email will not be shared publicly.
					</p>
				</form>
			</div>
		{/if}
	</div>
</main>

<Footer />
