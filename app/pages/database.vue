<template>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div class="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <div>
                <h1 class="text-3xl font-extrabold text-white">
                    Leaf Database
                </h1>
                <p class="text-white/35 text-sm mt-1">
                    {{
                        pending
                            ? 'Loading…'
                            : `${leaves.length} record${leaves.length === 1 ? '' : 's'} stored`
                    }}
                </p>
            </div>
            <button
                class="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-sm transition-all"
                @click="refresh()"
            >
                ↻ Refresh
            </button>
        </div>
        <LeafGallery
            :leaves="leaves"
            :pending="pending"
            @delete="confirmDelete"
        />
        <Teleport to="body">
            <div
                v-if="deleteId !== null"
                class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
                <div
                    class="bg-[#0f1a0f] border border-white/15 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                >
                    <h3 class="text-white font-bold text-lg mb-2">
                        Delete Leaf
                    </h3>
                    <p class="text-white/45 text-sm mb-6">
                        This leaf record will be permanently deleted. This
                        action cannot be undone.
                    </p>
                    <div class="flex gap-3">
                        <button
                            class="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all text-sm"
                            @click="deleteId = null"
                        >
                            Cancel
                        </button>
                        <button
                            class="flex-1 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white font-semibold transition-all text-sm"
                            @click="doDelete"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
useHead({ title: 'Database — LeafScan' })

const { deleteLeaf } = useLeafDatabase()
const deleteId = ref<number | null>(null)

const { data, pending, refresh } = useFetch<any[]>('/api/leaves')
const leaves = computed(() => data.value ?? [])

function confirmDelete(id: number) {
    deleteId.value = id
}

async function doDelete() {
    if (deleteId.value === null) return

    await deleteLeaf(deleteId.value)

    deleteId.value = null

    await refresh()
}
</script>
