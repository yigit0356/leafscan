<template>
    <div>
        <div
            v-if="pending"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
            <div
                v-for="i in 6"
                :key="i"
                class="rounded-2xl bg-white/5 border border-white/10 animate-pulse aspect-[4/3]"
            />
        </div>
        <div
            v-else-if="leaves.length === 0"
            class="text-center py-20 text-white/30"
        >
            <div class="text-5xl mb-4">🍃</div>
            <p class="text-lg font-medium">No leaves saved yet</p>
            <p class="text-sm mt-1.5">
                Analyze a leaf on the home page and save it to the database.
            </p>
        </div>
        <div
            v-else
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
            <div
                v-for="leaf in leaves"
                :key="leaf.id"
                class="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-green-400/40 hover:bg-white/8 transition-all duration-300 hover:shadow-[0_4px_24px_rgba(74,222,128,0.08)]"
            >
                <div class="aspect-video bg-black/30 overflow-hidden">
                    <img
                        :src="leaf.imageData"
                        :alt="leaf.plantName ?? 'Leaf'"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>
                <div class="p-4 flex items-start justify-between gap-2">
                    <div class="min-w-0">
                        <p class="text-white font-semibold text-sm truncate">
                            {{ leaf.plantName || 'Unidentified leaf' }}
                        </p>
                        <p
                            class="text-green-400 font-bold text-xl mt-0.5 tabular-nums"
                        >
                            {{ leaf.areaCm2.toFixed(2) }}
                            <span class="text-sm font-normal text-green-400/60"
                                >cm²</span
                            >
                        </p>
                        <p class="text-white/25 text-xs mt-1">
                            {{ formatDate(leaf.createdAt) }}
                        </p>
                    </div>
                    <button
                        class="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 shrink-0"
                        title="Delete"
                        @click="$emit('delete', leaf.id)"
                    >
                        <svg
                            class="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{ leaves: any[]; pending: boolean }>()
defineEmits<{ (e: 'delete', id: number): void }>()

function formatDate(d: string | null) {
    if (!d) return ''
    return new Date(d).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}
</script>
