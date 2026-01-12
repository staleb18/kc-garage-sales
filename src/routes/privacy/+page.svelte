<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
</script>

<svelte:head>
    <title>Privacy Policy - KC Garage Sales</title>
    <meta name="description" content="KC Garage Sales privacy policy - how we collect, use, and protect your information." />
</svelte:head>

<Header />

<main class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 py-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <div class="bg-white rounded-xl shadow-sm p-8 space-y-8">
            <p class="text-gray-600">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section>
                <h2 class="text-xl font-semibold text-gray-900 mb-3">Information We Collect</h2>
                <p class="text-gray-600 leading-relaxed">
                    When you post a garage sale listing, we collect the information you provide including:
                </p>
                <ul class="list-disc list-inside text-gray-600 mt-2 space-y-1">
                    <li>Your name and email address</li>
                    <li>Sale location (address and city)</li>
                    <li>Sale dates and times</li>
                    <li>Description and photos of items for sale</li>
                </ul>
            </section>

            <section>
                <h2 class="text-xl font-semibold text-gray-900 mb-3">How We Use Your Information</h2>
                <p class="text-gray-600 leading-relaxed">
                    We use the information you provide to:
                </p>
                <ul class="list-disc list-inside text-gray-600 mt-2 space-y-1">
                    <li>Display your garage sale listing on our website</li>
                    <li>Send you a verification email to confirm your listing</li>
                    <li>Contact you about your listing if necessary</li>
                    <li>Improve our services</li>
                </ul>
            </section>

            <section>
                <h2 class="text-xl font-semibold text-gray-900 mb-3">Information Sharing</h2>
                <p class="text-gray-600 leading-relaxed">
                    Your listing information (sale address, dates, description, photos) is publicly visible
                    on our website. Your email address is kept private and is not displayed publicly.
                </p>
                <p class="text-gray-600 leading-relaxed mt-2">
                    We do not sell, trade, or rent your personal information to third parties.
                </p>
            </section>

            <section>
                <h2 class="text-xl font-semibold text-gray-900 mb-3">Data Security</h2>
                <p class="text-gray-600 leading-relaxed">
                    We implement reasonable security measures to protect your personal information.
                    However, no method of transmission over the internet is 100% secure.
                </p>
            </section>

            <section>
                <h2 class="text-xl font-semibold text-gray-900 mb-3">Cookies</h2>
                <p class="text-gray-600 leading-relaxed">
                    We may use cookies to improve your experience on our website. Cookies are small files
                    stored on your device that help us remember your preferences.
                </p>
            </section>

            <section>
                <h2 class="text-xl font-semibold text-gray-900 mb-3">Your Rights</h2>
                <p class="text-gray-600 leading-relaxed">
                    You may request to have your listing and associated personal information removed
                    by contacting us at <a href="mailto:support@kcgaragesales.com" class="text-blue-600 hover:underline">support@kcgaragesales.com</a>.
                </p>
            </section>

            <section>
                <h2 class="text-xl font-semibold text-gray-900 mb-3">Changes to This Policy</h2>
                <p class="text-gray-600 leading-relaxed">
                    We may update this privacy policy from time to time. Any changes will be posted on
                    this page with an updated revision date.
                </p>
            </section>

            <section>
                <h2 class="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
                <p class="text-gray-600 leading-relaxed">
                    If you have any questions about this privacy policy, please contact us at
                    <a href="mailto:support@kcgaragesales.com" class="text-blue-600 hover:underline">support@kcgaragesales.com</a>.
                </p>
            </section>
        </div>
    </div>
</main>

<Footer />
