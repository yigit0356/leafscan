<template>
    <div
        class="relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 select-none"
        :class="
            isDragging
                ? 'border-green-400 bg-green-400/10 scale-[1.01]'
                : 'border-white/20 bg-white/5 hover:border-green-400/60 hover:bg-white/8'
        "
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop.prevent="onDrop"
        @click="fileInput?.click()"
    >
        <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onFileChange"
        />
        <div v-if="!previewUrl" class="flex flex-col items-center gap-4">
            <div
                class="w-16 h-16 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center"
            >
                <svg
                    class="w-8 h-8 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                </svg>
            </div>
            <div>
                <p class="text-white font-semibold text-lg">Upload a photo</p>
                <p class="text-white/40 text-sm mt-1">
                    Drag & drop or click to select
                </p>
                <p class="text-white/25 text-xs mt-3">
                    Place your leaf directly ON an A4 sheet of paper
                </p>
            </div>
        </div>
        <div v-else class="flex flex-col items-center gap-4">
            <img
                :src="previewUrl"
                alt="Preview"
                class="max-h-56 rounded-xl object-contain shadow-lg"
            />
            <p class="text-green-400/80 text-sm truncate max-w-xs">
                {{ fileName }}
            </p>
            <button
                class="text-xs text-white/40 hover:text-red-400 transition-colors px-3 py-1 rounded-lg hover:bg-red-400/10"
                @click.stop="clearImage"
            >
                × Remove
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ (e: 'file-selected', file: File): void }>()
const isDragging = ref(false)
const previewUrl = ref<string | null>(null)
const fileName = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    fileName.value = file.name
    previewUrl.value = URL.createObjectURL(file)
    emit('file-selected', file)
}

function onDrop(e: DragEvent) {
    isDragging.value = false
    const f = e.dataTransfer?.files[0]
    if (f) handleFile(f)
}

function onFileChange(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0]
    if (f) handleFile(f)
}

function clearImage() {
    previewUrl.value = null
    fileName.value = ''
    if (fileInput.value) fileInput.value.value = ''
}

defineExpose({ clearImage, previewUrl })
</script>
