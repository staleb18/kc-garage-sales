<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
</script>

<svelte:head>
    <title>Contact - KC Garage Sales</title>
    <meta name="description" content="Get in touch with KC Garage Sales. We're here to help with any questions about posting or finding garage sales." />
</svelte:head>

<Header />

<main class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 py-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>

        <div class="bg-white rounded-xl shadow-sm p-8">
            <div class="grid md:grid-cols-2 gap-8">
                <div>
                    <h2 class="text-2xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
                    <p class="text-gray-600 mb-6">
                        Have questions, feedback, or need help with your listing? We'd love to hear from you.
                    </p>

                    <div class="space-y-4">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <i class="fa-solid fa-envelope text-blue-600"></i>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Email</p>
                                <a href="mailto:support@kcgaragesales.com" class="text-blue-600 hover:underline">
                                    support@kcgaragesales.com
                                </a>
                            </div>
                        </div>
                    </div>

                    <div class="mt-8 p-4 bg-gray-50 rounded-lg">
                        <h3 class="font-semibold text-gray-900 mb-2">Response Time</h3>
                        <p class="text-gray-600 text-sm">
                            We typically respond within 24-48 hours during business days.
                        </p>
                    </div>
                </div>

                <div>
                    <h2 class="text-2xl font-semibold text-gray-900 mb-4">Common Questions</h2>
                    <div class="space-y-4">
                        <div>
                            <h3 class="font-medium text-gray-900">How do I post a garage sale?</h3>
                            <p class="text-gray-600 text-sm mt-1">
                                Click the "Post Sale" button and fill out the form with your sale details.
                                You'll receive an email to verify your listing.
                            </p>
                        </div>
                        <div>
                            <h3 class="font-medium text-gray-900">Is it free to post?</h3>
                            <p class="text-gray-600 text-sm mt-1">
                                Yes! Posting your garage sale is completely free.
                            </p>
                        </div>
                        <div>
                            <h3 class="font-medium text-gray-900">How do I edit or remove my listing?</h3>
                            <p class="text-gray-600 text-sm mt-1">
                                Contact us with your listing details and we'll help you make changes or remove it.
                            </p>
                        </div>
                        <div>
                            <h3 class="font-medium text-gray-900">I found an inappropriate listing</h3>
                            <p class="text-gray-600 text-sm mt-1">
                                Use the "Report" button on the listing page or contact us directly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

<Footer />
