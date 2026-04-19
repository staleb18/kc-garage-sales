<script lang="ts">
    import { enhance } from "$app/forms";
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";

    let isSubmitting = $state(false);
    let result = $state<{ success?: boolean; error?: string } | null>(null);
</script>

<svelte:head>
    <title>Contact - KC Garage Sales</title>
    <meta name="description" content="Get in touch with KC Garage Sales. We're here to help with any questions about posting or finding garage sales." />
</svelte:head>

<Header />

<main class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <div class="max-w-4xl mx-auto px-4 py-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-8">Contact Us</h1>

        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-8">
            <div class="grid md:grid-cols-2 gap-10">

                <!-- Left: form -->
                <div>
                    <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Send a Message</h2>
                    <p class="text-gray-600 dark:text-gray-400 mb-6">
                        Have questions, feedback, or need help with your listing? We typically respond within 24–48 hours.
                    </p>

                    {#if result?.success}
                        <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-green-800 dark:text-green-300">
                            <i class="fa-solid fa-circle-check mr-2"></i>
                            Message sent! We'll get back to you within 24–48 hours.
                        </div>
                    {:else}
                        <form
                            method="POST"
                            use:enhance={() => {
                                isSubmitting = true;
                                result = null;
                                return async ({ result: r, update }) => {
                                    isSubmitting = false;
                                    if (r.type === "success") {
                                        result = { success: true };
                                    } else if (r.type === "failure") {
                                        result = { error: (r.data?.error as string) ?? "Something went wrong." };
                                    } else {
                                        result = { error: "Something went wrong." };
                                    }
                                    await update({ reset: r.type === "success" });
                                };
                            }}
                            class="space-y-4"
                        >
                            <div>
                                <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    placeholder="Your name"
                                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label for="message" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows="5"
                                    placeholder="How can we help?"
                                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                ></textarea>
                            </div>

                            {#if result?.error}
                                <p class="text-sm text-red-600 dark:text-red-400">
                                    <i class="fa-solid fa-circle-exclamation mr-1"></i>{result.error}
                                </p>
                            {/if}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                            >
                                {#if isSubmitting}
                                    <i class="fa-solid fa-spinner fa-spin mr-2"></i>Sending...
                                {:else}
                                    <i class="fa-solid fa-paper-plane mr-2"></i>Send Message
                                {/if}
                            </button>
                        </form>
                    {/if}
                </div>

                <!-- Right: FAQ -->
                <div>
                    <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Common Questions</h2>
                    <div class="space-y-4">
                        <div>
                            <h3 class="font-medium text-gray-900 dark:text-white">How do I post a garage sale?</h3>
                            <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                Click the "Post Sale" button and fill out the form. You'll receive an email to verify your listing.
                            </p>
                        </div>
                        <div>
                            <h3 class="font-medium text-gray-900 dark:text-white">Is it free to post?</h3>
                            <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                Yes! Posting your garage sale is completely free.
                            </p>
                        </div>
                        <div>
                            <h3 class="font-medium text-gray-900 dark:text-white">How do I edit or remove my listing?</h3>
                            <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                Use the management link sent to your email when you posted your sale. It lets you edit details, add photos, or delete your listing at any time.
                            </p>
                        </div>
                        <div>
                            <h3 class="font-medium text-gray-900 dark:text-white">I found an inappropriate listing</h3>
                            <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                Use the "Report" button on the listing page or send us a message using the form.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</main>

<Footer />
