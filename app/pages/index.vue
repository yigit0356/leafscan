<template>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div class="text-center mb-10">
            <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
                <span class="text-white">Leaf </span>
                <span class="text-green-400">Area</span>
                <span class="text-white"> Calculator</span>
            </h1>
            <p class="text-white/40 text-base max-w-xl mx-auto leading-relaxed">
                Place your leaf ON an A4 sheet and upload the photo. Server-side
                computer vision detects the contours and computes the real
                surface area in cm².
            </p>
        </div>
        <div class="mb-6">
            <ImageUploader ref="uploaderRef" @file-selected="onFileSelected" />
        </div>
        <div
            v-if="analysisError"
            class="mb-6 p-4 rounded-xl border border-red-400/30 bg-red-400/5 text-red-300 text-sm flex gap-3 items-start"
        >
            <svg
                class="w-5 h-5 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
            </svg>
            <span>{{ analysisError }}</span>
        </div>
        <div class="flex justify-center mb-10">
            <button
                id="btn-analyze"
                :disabled="!selectedFile || isAnalyzing"
                class="px-8 py-3.5 rounded-2xl font-bold text-base transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                :class="
                    selectedFile && !isAnalyzing
                        ? 'bg-green-400 text-black hover:bg-green-300 shadow-[0_0_30px_rgba(74,222,128,0.35)] hover:shadow-[0_0_45px_rgba(74,222,128,0.55)]'
                        : 'bg-white/10 text-white/50'
                "
                @click="startAnalysis"
            >
                <span v-if="isAnalyzing" class="flex items-center gap-2.5">
                    <span
                        class="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"
                    />
                    Analyzing… (step {{ currentStep + 1 }} / 9)
                </span>
                <span v-else class="flex items-center gap-2">
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
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    Start Analysis
                </span>
            </button>
        </div>
        <div v-if="similarMatch && !similarDismissed" class="mb-6">
            <SimilarityAlert
                :match="similarMatch"
                @dismiss="similarDismissed = true"
            />
        </div>
        <div v-if="analysisResult && !isAnalyzing" class="mb-8">
            <ResultPanel
                :result="analysisResult"
                :is-saving="isSaving"
                :saved="leafSaved"
                @save="saveLeaf"
            />
        </div>
        <div v-show="showSteps">
            <h2
                class="text-white/50 text-xs font-semibold uppercase tracking-widest mb-4"
            >
                Processing Pipeline
            </h2>
            <AnalysisSteps ref="stepsRef" :steps="steps" />
        </div>
    </div>
</template>

<script setup lang="ts">
import type AnalysisStepsType from '~/components/AnalysisSteps.vue'

useHead({ title: 'LeafScan — Leaf Area Calculator' })

const {
    steps,
    result: analysisResult,
    error: analysisError,
    isAnalyzing,
    currentStep,
    analyzeLeaf,
    resetSteps,
} = useLeafAnalysis()
const {
    isSaving,
    isChecking,
    checkSimilarity,
    saveLeaf: dbSaveLeaf,
} = useLeafDatabase()

const selectedFile = ref<File | null>(null)
const uploaderRef = ref<any>(null)
const stepsRef = ref<InstanceType<typeof AnalysisStepsType> | null>(null)
const showSteps = ref(false)
const similarMatch = ref<any>(null)
const similarDismissed = ref(false)
const leafSaved = ref(false)
const originalImageBase64 = ref<string | null>(null)

function onFileSelected(file: File) {
    selectedFile.value = file
    resetSteps()
    similarMatch.value = null
    similarDismissed.value = false
    leafSaved.value = false
    showSteps.value = false

    const reader = new FileReader()
    reader.onload = (e) => {
        originalImageBase64.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
}

async function startAnalysis() {
    if (!selectedFile.value) return

    // Show the steps grid first so canvas elements are mounted
    showSteps.value = true
    similarMatch.value = null
    similarDismissed.value = false
    leafSaved.value = false

    // Wait two ticks: first for v-show to render, second for canvas function refs to populate
    await nextTick()
    await nextTick()

    const canvases = stepsRef.value?.canvasRefs ?? []
    await analyzeLeaf(
        selectedFile.value,
        canvases as (HTMLCanvasElement | null)[],
    )

    if (analysisResult.value) {
        try {
            const res = await checkSimilarity(analysisResult.value.huMoments)
            if (res.match) similarMatch.value = res.match
        } catch {
            /* similarity check is best-effort */
        }
    }
}

async function saveLeaf(plantName: string) {
    if (!analysisResult.value || !originalImageBase64.value) return
    await dbSaveLeaf({
        plantName,
        areaCm2: analysisResult.value.areaCm2,
        imageData: originalImageBase64.value,
        contourData: analysisResult.value.contourData,
        huMoments: analysisResult.value.huMoments,
    })
    leafSaved.value = true
}
</script>
