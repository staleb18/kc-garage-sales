<script lang="ts">
    import { page } from "$app/stores";
</script>

<header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
            <!-- Logo -->
            <a href="/" class="flex items-center gap-2">
                <div
                    class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center"
                >
                    <i class="fa-solid fa-tag text-white text-lg"></i>
                </div>
                <div>
                    <span class="font-bold text-xl text-gray-900">KC</span>
                    <span class="font-bold text-xl text-blue-600"
                        >GarageSales</span
                    >
                </div>
            </a>

            <!-- Navigation -->
            <nav class="hidden md:flex items-center gap-6">
                <a
                    href="/"
                    class="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    class:text-blue-600={$page.url.pathname === "/"}
                >
                    Home
                </a>
                <a
                    href="/post"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <i class="fa-solid fa-plus mr-2"></i>
                    Post a Sale
                </a>
            </nav>

            <!-- Mobile menu button -->
            <div class="md:hidden">
                <a
                    href="/post"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                    <i class="fa-solid fa-plus mr-1"></i>
                    Post
                </a>
            </div>
        </div>
    </div>
</header>
