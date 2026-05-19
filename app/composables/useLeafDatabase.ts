export const useLeafDatabase = () => {
    const isSaving = ref(false)
    const isChecking = ref(false)

    async function checkSimilarity(huMoments: number[]) {
        isChecking.value = true
        try {
            return await $fetch < {
                match: {
                    id: number;plantName: string | null;areaCm2: number;imageData: string;similarity: number
                } | null
            } > (
                '/api/leaves/similar', {
                    method: 'POST',
                    body: {
                        huMoments
                    }
                }
            )
        } finally {
            isChecking.value = false
        }
    }

    async function saveLeaf(payload: {
        plantName: string
        areaCm2: number
        imageData: string
        contourData: number[][]
        huMoments: number[]
    }) {
        isSaving.value = true
        try {
            return await $fetch('/api/leaves', {
                method: 'POST',
                body: payload
            })
        } finally {
            isSaving.value = false
        }
    }

    async function deleteLeaf(id: number) {
        return await $fetch(`/api/leaves/${id}`, {
            method: 'DELETE'
        })
    }

    async function fetchLeaves() {
        return await $fetch < any[] > ('/api/leaves')
    }

    return {
        isSaving,
        isChecking,
        checkSimilarity,
        saveLeaf,
        deleteLeaf,
        fetchLeaves
    }
}