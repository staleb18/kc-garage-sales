<script lang="ts">
    import { page } from "$app/stores";
    import { browser } from "$app/environment";

    let isDark = $state(false);

    if (browser) {
        isDark = document.documentElement.classList.contains("dark");
    }

    function toggleDark() {
        isDark = !isDark;
        document.documentElement.classList.toggle("dark", isDark);
        localStorage.setItem("theme", isDark ? "dark" : "light");
    }
</script>

<header class="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
            <!-- Logo -->
            <a href="/" class="flex items-center gap-2">
                <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <i class="fa-solid fa-tag text-white text-lg"></i>
                </div>
                <div>
                    <span class="font-bold text-xl text-gray-900 dark:text-white">KC</span>
                    <span class="font-bold text-xl text-blue-600">GarageSales</span>
                </div>
            </a>

            <!-- Navigation -->
            <nav class="hidden md:flex items-center gap-4">
                <a
                    href="/"
                    class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                    class:text-blue-600={$page.url.pathname === "/"}
                >
                    Home
                </a>
                <button
                    onclick={toggleDark}
                    class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Toggle dark mode"
                >
                    <i class="fa-solid {isDark ? 'fa-sun' : 'fa-moon'}"></i>
                </button>
                <a
                    href="/post"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <i class="fa-solid fa-plus mr-2"></i>
                    Post a Sale
                </a>
            </nav>

            <!-- Mobile -->
            <div class="md:hidden flex items-center gap-2">
                <button
                    onclick={toggleDark}
                    class="p-2 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Toggle dark mode"
                >
                    <i class="fa-solid {isDark ? 'fa-sun' : 'fa-moon'}"></i>
                </button>
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
