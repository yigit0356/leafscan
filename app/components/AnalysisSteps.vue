<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
            v-for="step in steps"
            :key="step.id"
            class="relative rounded-2xl overflow-hidden border transition-all duration-500"
            :class="{
                'border-white/10 bg-white/3 opacity-40':
                    step.status === 'pending',
                'border-green-400/70 bg-green-400/5 shadow-[0_0_20px_rgba(74,222,128,0.2)]':
                    step.status === 'processing',
                'border-white/20 bg-white/5': step.status === 'done',
                'border-red-400/50 bg-red-400/5': step.status === 'error',
            }"
        >
            <div class="flex items-center gap-2 px-4 pt-3 pb-2">
                <div
                    class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                    :class="{
                        'bg-white/10 text-white/25': step.status === 'pending',
                        'bg-green-400 text-black animate-pulse':
                            step.status === 'processing',
                        'bg-green-400/20 text-green-400':
                            step.status === 'done',
                        'bg-red-400/20 text-red-400': step.status === 'error',
                    }"
                >
                    <span v-if="step.status === 'done'">✓</span>
                    <span v-else-if="step.status === 'error'">✕</span>
                    <span v-else>{{ step.id + 1 }}</span>
                </div>
                <span class="text-white/80 text-sm font-semibold truncate">{{
                    step.title
                }}</span>
            </div>
            <div class="px-3 pb-1">
                <div
                    class="relative bg-black/40 rounded-xl overflow-hidden aspect-video flex items-center justify-center transition-transform duration-300"
                    :class="{
                        'cursor-pointer hover:scale-[1.02] hover:ring-2 hover:ring-green-400/50':
                            step.status === 'done',
                    }"
                    @click="
                        step.status === 'done' &&
                        openLightbox(step.id, step.title)
                    "
                >
                    <canvas
                        :ref="
                            (el) => {
                                if (el)
                                    canvasRefs[step.id] =
                                        el as HTMLCanvasElement
                            }
                        "
                        class="max-w-full max-h-full object-contain transition-opacity duration-400"
                        :class="
                            step.status === 'pending'
                                ? 'opacity-0'
                                : 'opacity-100'
                        "
                    />
                    <div
                        v-if="step.status === 'processing'"
                        class="absolute inset-0 flex items-center justify-center bg-black/20"
                    >
                        <div
                            class="w-8 h-8 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin"
                        />
                    </div>
                    <div
                        v-if="step.status === 'pending'"
                        class="absolute inset-0 flex items-center justify-center"
                    >
                        <div
                            class="w-8 h-8 rounded-full bg-white/5 border border-white/10"
                        />
                    </div>
                </div>
            </div>
            <p class="px-4 pb-3 pt-1 text-white/35 text-xs">
                {{ step.description }}
            </p>
        </div>
    </div>
    <Teleport to="body">
        <div
            v-if="activeImage"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            @click="closeLightbox"
        >
            <div class="relative max-w-5xl w-full flex flex-col items-center">
                <button
                    class="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors"
                    @click="closeLightbox"
                >
                    <svg
                        class="w-8 h-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
                <div
                    class="bg-black/50 p-2 rounded-2xl border border-white/10 shadow-2xl"
                    @click.stop
                >
                    <div
                        class="flex items-center justify-between px-4 py-3 border-b border-white/10 mb-2"
                    >
                        <h3 class="text-green-400 font-bold text-lg">
                            {{ activeTitle }}
                        </h3>
                    </div>
                    <img
                        :src="activeImage"
                        :alt="activeTitle"
                        class="max-h-[80vh] w-auto object-contain rounded-xl"
                    />
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import type { AnalysisStep } from '~/composables/useLeafAnalysis'

defineProps<{ steps: AnalysisStep[] }>()

const canvasRefs = reactive<(HTMLCanvasElement | null)[]>(
    Array.from({ length: 9 }, () => null),
)

const activeImage = ref<string | null>(null)
const activeTitle = ref('')

function openLightbox(id: number, title: string) {
    const canvas = canvasRefs[id]
    if (!canvas) return
    activeImage.value = canvas.toDataURL('image/png')
    activeTitle.value = title
}

function closeLightbox() {
    activeImage.value = null
}

defineExpose({ canvasRefs })
</script>
