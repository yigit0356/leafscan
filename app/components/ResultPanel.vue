<template>
    <div
        class="rounded-2xl border border-green-400/30 bg-green-400/5 p-6 shadow-[0_0_40px_rgba(74,222,128,0.08)]"
    >
        <div class="text-center mb-6">
            <p class="text-white/40 text-xs uppercase tracking-widest mb-2">
                Calculated Leaf Area
            </p>
            <div
                class="text-5xl font-extrabold text-green-400 tabular-nums leading-none"
            >
                {{ result.areaCm2.toFixed(2) }}
                <span class="text-2xl font-normal text-green-400/60 ml-1"
                    >cm²</span
                >
            </div>
            <p class="text-white/25 text-xs mt-3">
                A4 ref: {{ result.referencePixelArea.toFixed(0) }} px²
                &nbsp;·&nbsp; Leaf: {{ result.leafPixelArea.toFixed(0) }} px²
                &nbsp;·&nbsp; Scale:
                {{
                    ((result.areaCm2 / result.leafPixelArea) * 1e6).toFixed(4)
                }}
                cm²/px²
            </p>
        </div>
        <hr class="border-white/8 mb-6" />
        <div v-if="!saved">
            <p class="text-white/60 text-sm mb-3">
                Do you know the plant species?
                <span class="text-white/25 ml-1">(optional)</span>
            </p>
            <div class="flex gap-3">
                <input
                    v-model="plantName"
                    type="text"
                    placeholder="e.g. Oak, Maple, Ginkgo…"
                    class="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-white/20 text-sm outline-none focus:border-green-400/60 focus:ring-1 focus:ring-green-400/20 transition-all"
                />
                <button
                    :disabled="isSaving"
                    class="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all bg-green-400 text-black hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    @click="$emit('save', plantName)"
                >
                    <span v-if="isSaving" class="flex items-center gap-2">
                        <span
                            class="w-3 h-3 border border-black/30 border-t-black rounded-full animate-spin"
                        />
                        Saving…
                    </span>
                    <span v-else>Save to Database</span>
                </button>
            </div>
        </div>
        <div v-else class="flex items-center gap-3 text-green-400">
            <svg
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                />
            </svg>
            <span class="font-semibold">Saved to database.</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { AnalysisResult } from '~/composables/useLeafAnalysis'

defineProps<{ result: AnalysisResult; isSaving: boolean; saved: boolean }>()
defineEmits<{ (e: 'save', plantName: string): void }>()

const plantName = ref('')
</script>
