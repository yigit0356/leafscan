<template>
    <div class="min-h-screen bg-[#080e08] text-white font-['Inter',sans-serif]">
        <div
            class="fixed inset-0 pointer-events-none overflow-hidden"
            aria-hidden="true"
        >
            <div
                class="absolute -top-40 -left-40 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"
            />
            <div
                class="absolute top-1/2 -right-40 w-80 h-80 bg-emerald-400/4 rounded-full blur-3xl"
            />
            <div
                class="absolute bottom-0 left-1/3 w-64 h-64 bg-green-600/4 rounded-full blur-3xl"
            />
        </div>
        <nav
            class="relative z-10 border-b border-white/8 backdrop-blur-xl bg-black/20"
        >
            <div
                class="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16"
            >
                <NuxtLink to="/" class="flex items-center gap-2.5">
                    <div
                        class="w-8 h-8 rounded-lg bg-green-400/15 border border-green-400/30 flex items-center justify-center text-base select-none"
                    >
                        🍃
                    </div>
                    <span class="font-bold text-lg tracking-tight">
                        <span class="text-green-400">Leaf</span
                        ><span class="text-white/80">Scan</span>
                    </span>
                </NuxtLink>
                <div class="flex items-center gap-1">
                    <NuxtLink
                        to="/"
                        class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        :class="
                            $route.path === '/'
                                ? 'bg-green-400/10 text-green-400'
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                        "
                    >
                        Analyze
                    </NuxtLink>
                    <NuxtLink
                        to="/database"
                        class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        :class="
                            $route.path === '/database'
                                ? 'bg-green-400/10 text-green-400'
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                        "
                    >
                        Database
                    </NuxtLink>
                </div>
            </div>
        </nav>
        <main class="relative z-10">
            <slot />
        </main>
    </div>
</template>
