<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
</script>

<svelte:head>
    <title>About - KC Garage Sales</title>
    <meta name="description" content="Learn about KC Garage Sales - your local resource for finding and posting garage sales in the Kansas City metro area." />
</svelte:head>

<Header />

<main class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 py-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-8">About KC Garage Sales</h1>

        <div class="bg-white rounded-xl shadow-sm p-8 space-y-6">
            <section>
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
                <p class="text-gray-600 leading-relaxed">
                    KC Garage Sales is the Kansas City metro's go-to platform for finding and posting garage sales,
                    yard sales, and estate sales. We make it easy for sellers to reach thousands of local bargain
                    hunters and for buyers to discover amazing deals in their neighborhood.
                </p>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">How It Works</h2>
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="flex gap-4">
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i class="fa-solid fa-map-marker-alt text-blue-600 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900 mb-1">Find Sales Near You</h3>
                            <p class="text-gray-600 text-sm">Use our interactive map to discover garage sales in your area.</p>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i class="fa-solid fa-plus text-green-600 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900 mb-1">Post Your Sale</h3>
                            <p class="text-gray-600 text-sm">List your garage sale for free and reach local buyers.</p>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i class="fa-solid fa-filter text-amber-600 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900 mb-1">Filter by Category</h3>
                            <p class="text-gray-600 text-sm">Looking for furniture? Electronics? Filter to find exactly what you want.</p>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i class="fa-solid fa-check-circle text-purple-600 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900 mb-1">Verified Listings</h3>
                            <p class="text-gray-600 text-sm">Email verification helps ensure quality listings.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">Serving the KC Metro</h2>
                <p class="text-gray-600 leading-relaxed">
                    We cover the entire Kansas City metropolitan area including Kansas City MO, Kansas City KS,
                    Overland Park, Olathe, Lee's Summit, Independence, Shawnee, Blue Springs, Lenexa, Leawood,
                    and all surrounding communities.
                </p>
            </section>
        </div>
    </div>
</main>

<Footer />
