<template>
    <div
        class="rounded-2xl border border-amber-400/40 bg-amber-400/5 p-5 flex gap-4 items-start shadow-[0_0_30px_rgba(251,191,36,0.08)]"
    >
        <div
            class="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0"
        >
            <svg
                class="w-5 h-5 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                />
            </svg>
        </div>
        <div class="flex-1 min-w-0">
            <p class="text-amber-300 font-semibold text-sm mb-1">
                Similar leaf found in database
            </p>
            <p class="text-white/60 text-sm">
                This leaf resembles a
                <span class="text-white font-semibold">{{
                    match.plantName || 'unnamed plant'
                }}</span>
                specimen.
                <span class="text-amber-400/80 ml-1 font-medium"
                    >{{ match.similarity }}% match</span
                >
            </p>
            <p class="text-white/25 text-xs mt-1.5">
                Ref area: {{ match.areaCm2.toFixed(2) }} cm²· ID #{{ match.id }}
            </p>
        </div>
        <button
            class="text-white/30 hover:text-white/60 transition-colors text-xl leading-none"
            @click="$emit('dismiss')"
        >
            ×
        </button>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    match: {
        id: number
        plantName: string | null
        areaCm2: number
        similarity: number
    }
}>()
defineEmits<{ (e: 'dismiss'): void }>()
</script>
