export interface AnalysisStep {
    id: number
    title: string
    description: string
    status: 'pending' | 'processing' | 'done' | 'error'
}

export interface AnalysisResult {
    areaCm2: number
    huMoments: number[]
    contourData: number[][]
    leafPixelArea: number
    referencePixelArea: number
}

const STEP_DEFS: Omit < AnalysisStep, 'status' > [] = [{
        id: 0,
        title: 'Original Image',
        description: 'Raw uploaded photograph'
    },
    {
        id: 1,
        title: 'Grayscale',
        description: 'Convert RGB → single channel'
    },
    {
        id: 2,
        title: 'Canny Edge Detection',
        description: 'Highlight sharp boundaries'
    },
    {
        id: 3,
        title: 'Morphological Ops',
        description: 'Close gaps in edge map'
    },
    {
        id: 4,
        title: 'Paper Contour',
        description: 'Largest 4-point polygon'
    },
    {
        id: 5,
        title: 'Perspective Warp',
        description: 'Top-Down document flattening'
    },
    {
        id: 6,
        title: 'Warped Thresholding',
        description: 'Otsu binarization on flat paper'
    },
    {
        id: 7,
        title: 'Leaf Contour',
        description: 'Isolate leaf on white background'
    },
    {
        id: 8,
        title: 'Area Calculation',
        description: '100% accurate pixel² → cm²'
    }
]

export const useLeafAnalysis = () => {
    const steps = ref < AnalysisStep[] > (STEP_DEFS.map(s => ({
        ...s,
        status: 'pending'
    })))
    const result = ref < AnalysisResult | null > (null)
    const error = ref < string | null > (null)
    const isAnalyzing = ref(false)
    const currentStep = ref(-1)

    const resetSteps = () => {
        steps.value = STEP_DEFS.map(s => ({
            ...s,
            status: 'pending'
        }))
        result.value = null
        error.value = null
        currentStep.value = -1
    }

    const setStep = (id: number, status: AnalysisStep['status']) => {
        steps.value[id] = {
            ...steps.value[id],
            status
        }
        currentStep.value = id
    }

    async function analyzeLeaf(imageFile: File, canvases: (HTMLCanvasElement | null)[]) {
        isAnalyzing.value = true
        error.value = null
        resetSteps()

        try {
            const formData = new FormData()
            formData.append('image', imageFile)

            // Start the loading state on the first step to indicate network activity
            setStep(0, 'processing')

            const response = await $fetch < {
                success: boolean;result ? : AnalysisResult;stepImages: string[];error ? : string
            } > ('/api/analyze', {
                method: 'POST',
                body: formData,
            })

            const delay = (ms: number) => new Promise(r => setTimeout(r, ms))
            const imagesToDraw = response.stepImages || []

            // Now we have the results (or partial results), animate through the available steps
            for (let i = 0; i < imagesToDraw.length; i++) {
                setStep(i, 'processing')
                await delay(200) // Small delay for animation effect

                if (canvases[i]) {
                    const img = new Image()
                    img.src = imagesToDraw[i]
                    await new Promise((resolve) => {
                        img.onload = () => {
                            const ctx = canvases[i] !.getContext('2d')
                            canvases[i] !.width = img.width
                            canvases[i] !.height = img.height
                            ctx?.drawImage(img, 0, 0)
                            resolve(null)
                        }
                    })
                }

                setStep(i, 'done')
            }

            if (!response.success) {
                throw new Error(response.error || 'Analysis failed')
            }

            result.value = response.result || null
        } catch (e: any) {
            const msg = e.message || 'An unexpected error occurred during analysis.'
            error.value = msg

            // Find the first step that is not 'done' and mark it as error
            const errorStepIdx = steps.value.findIndex(s => s.status !== 'done')
            if (errorStepIdx > -1) {
                setStep(errorStepIdx, 'error')
            } else {
                setStep(0, 'error')
            }
        } finally {
            isAnalyzing.value = false
        }
    }

    return {
        steps,
        result,
        error,
        isAnalyzing,
        currentStep,
        analyzeLeaf,
        resetSteps
    }
}