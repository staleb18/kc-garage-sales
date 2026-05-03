<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
</script>

<svelte:head>
    <title>Terms of Service - KC Garage Sales</title>
    <meta name="description" content="Terms of Service for KC Garage Sales." />
</svelte:head>

<Header />

<main class="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
    <div class="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-sm p-8 md:p-12">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Terms of Service</h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-8">Last updated: May 2026</p>

        <div class="space-y-8 text-gray-700 dark:text-gray-300">

            <section>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
                <p>By using KC Garage Sales ("the Site"), you agree to these Terms of Service. If you do not agree, please do not use the Site.</p>
            </section>

            <section>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. What We Provide</h2>
                <p>KC Garage Sales is a free listing platform that allows individuals to post and discover garage sales in the Kansas City metro area. We do not facilitate transactions, handle payments, or act as a party to any sale.</p>
            </section>

            <section>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Posting a Sale</h2>
                <ul class="list-disc pl-6 space-y-2">
                    <li>You must provide accurate information about your sale including correct dates, times, and location.</li>
                    <li>You are responsible for all content you post, including photos and descriptions.</li>
                    <li>Listings must be for legitimate garage, yard, or estate sales only.</li>
                    <li>We reserve the right to remove any listing at our discretion without notice.</li>
                    <li>Your email address is used only to send you your management link and is never displayed publicly.</li>
                </ul>
            </section>

            <section>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Prohibited Content</h2>
                <p class="mb-2">You may not post listings that include:</p>
                <ul class="list-disc pl-6 space-y-2">
                    <li>False, misleading, or fraudulent information</li>
                    <li>Illegal items or services</li>
                    <li>Spam or commercial advertising unrelated to a garage sale</li>
                    <li>Offensive, hateful, or inappropriate content</li>
                </ul>
            </section>

            <section>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. No Warranties</h2>
                <p>The Site is provided "as is" without warranties of any kind. We do not guarantee the accuracy of any listing posted by users. Always verify sale details before visiting.</p>
            </section>

            <section>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Limitation of Liability</h2>
                <p>KC Garage Sales is not liable for any damages arising from your use of the Site, reliance on listings, or interactions with other users. Use the Site at your own risk.</p>
            </section>

            <section>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Privacy</h2>
                <p>Your use of the Site is also governed by our <a href="/privacy" class="text-blue-600 hover:underline">Privacy Policy</a>.</p>
            </section>

            <section>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Changes to Terms</h2>
                <p>We may update these terms at any time. Continued use of the Site after changes constitutes acceptance of the new terms.</p>
            </section>

            <section>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Contact</h2>
                <p>For questions about these terms, please use our <a href="/contact" class="text-blue-600 hover:underline">contact page</a>.</p>
            </section>
        </div>
    </div>
</main>

<Footer />
