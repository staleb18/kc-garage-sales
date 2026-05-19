<script lang="ts">
    import { page } from "$app/stores";

    let mobileMenuOpen = $state(false);

    function closeMobileMenu() {
        mobileMenuOpen = false;
    }
</script>

<header class="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
            <!-- Logo -->
            <a href="/" class="flex items-center gap-2" onclick={closeMobileMenu}>
                <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <i class="fa-solid fa-tag text-white text-lg"></i>
                </div>
                <div>
                    <span class="font-bold text-xl text-gray-900 dark:text-white">KC</span>
                    <span class="font-bold text-xl text-blue-600">GarageSales</span>
                </div>
            </a>

            <!-- Desktop Navigation -->
            <nav class="hidden md:flex items-center gap-4">
                <a href="/" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors" class:text-blue-600={$page.url.pathname === "/"}>Home</a>
                <a href="/about" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors" class:text-blue-600={$page.url.pathname === "/about"}>About</a>
                <a href="/contact" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors" class:text-blue-600={$page.url.pathname === "/contact"}>Contact</a>
                <button
                    onclick={toggleDark}
                    class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Toggle dark mode"
                >
                    <i class="fa-solid {isDark ? 'fa-sun' : 'fa-moon'}"></i>
                </button>
                <a href="/post" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    <i class="fa-solid fa-plus mr-2"></i>Post a Sale
                </a>
            </nav>

            <!-- Mobile: dark mode + hamburger -->
            <div class="md:hidden flex items-center gap-2">
                <button
                    onclick={toggleDark}
                    class="p-2 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Toggle dark mode"
                >
                    <i class="fa-solid {isDark ? 'fa-sun' : 'fa-moon'}"></i>
                </button>
                <button
                    onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
                    class="p-2 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Toggle menu"
                >
                    <i class="fa-solid {mobileMenuOpen ? 'fa-times' : 'fa-bars'}"></i>
                </button>
            </div>
        </div>
    </div>

    <!-- Mobile Menu -->
    {#if mobileMenuOpen}
        <div class="md:hidden border-t dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 space-y-1">
            <a href="/" onclick={closeMobileMenu} class="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors">
                <i class="fa-solid fa-home mr-2 text-blue-600"></i>Home
            </a>
            <a href="/about" onclick={closeMobileMenu} class="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors">
                <i class="fa-solid fa-circle-info mr-2 text-blue-600"></i>About
            </a>
            <a href="/contact" onclick={closeMobileMenu} class="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors">
                <i class="fa-solid fa-envelope mr-2 text-blue-600"></i>Contact
            </a>
            <div class="pt-2">
                <a href="/post" onclick={closeMobileMenu} class="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
                    <i class="fa-solid fa-plus mr-2"></i>Post a Sale
                </a>
            </div>
        </div>
    {/if}
</header>
