<template>
    <div class="main" @dragover="dragover" @dragleave="dragleave" @drop="drop" ref="mainDropZone">
        <slot name="default" :files="files" :openFileDialog="openFileDialog" :removeAllFiles="removeAllFiles" :isDisabled="disabled"></slot>
        <div :class="'dropzone-container ' + (isDragging ? '' : 'dropzone-container-hide')" @dragover="dragover">
            <input
                type="file"
                name="file"
                id="fileInput"
                class="hidden-input"
                @change="onChange"
                ref="file"
                accept=".pdf,.jpg,.jpeg,.png"
            />

            <label for="fileInput" class="file-label">
                <span v-if="isDragging">Release to drop files here.</span>
                <span v-else>Drop files here or <u>click here</u> to upload.</span>
            </label>
            <div class="preview-container mt-4" v-if="files.length && false">
                <div v-for="file in files" :key="file.name" class="preview-card">
                    <div>
                        <img class="preview-img" alt="preview-image" :src="generateURL(file)" />
                        <p>
                            {{ file.name }}
                        </p>
                    </div>
                    <div>
                        <button
                            class="ml-2"
                            type="button"
                            @click="remove(files.indexOf(file))"
                            title="Remove file"
                        >
                            <b>×</b>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "FileDropZone",
    props: ['value', 'disabled'],
    data() {
        return {
            isDragging: false,
            files: [],
        };
    },
    methods: {
        openFileDialog() {
            if (this.disabled) return;
            this.$refs.file.click();
        },
        removeAllFiles() {
            this.files.splice(0);
        },

        generateURL(file) {
            let fileSrc = URL.createObjectURL(file);
            setTimeout(() => {
                URL.revokeObjectURL(fileSrc);
            }, 1000);
            return fileSrc;
        },
        onChange() {
            this.files = [...this.$refs.file.files];
        },
        dragover(e) {
            e.preventDefault();
            if (this.disabled) return;
            this.isDragging = true;
        },
        dragleave(e) {
            if (this.$refs.mainDropZone.contains(e['fromElement'])) return;
            this.isDragging = false;
        },
        drop(e) {
            if (this.disabled) return;
            e.preventDefault();
            this.$refs.file.files = e.dataTransfer.files;
            this.onChange();
            this.isDragging = false;
        },
        remove(i) {
            this.files.splice(i, 1);
        },
    },
    watch: {
        files(val) {
            this.$emit('input', val[0])
        }
    }
}
</script>

<style scoped>
.main {
    position: relative;
}
.dropzone-container-hide {
    opacity: 0 !important;
}
.dropzone-container {
    opacity: 0.8;
    pointer-events: none;
    padding: 4rem;
    background: #f7fafc;border: 3px dashed black;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-content: center;
    justify-content: center;
    flex-direction: column;
    flex-wrap: wrap;
    z-index: 2
}

.hidden-input {
    opacity: 0;
    overflow: hidden;
    position: absolute;
    width: 1px;
    height: 1px;
}

.file-label {
    font-size: 20px;
    cursor: pointer;
}

.preview-container {
    display: flex;
    margin-top: 2rem;
}

.preview-card {
    display: flex;
    border: 1px solid #a2a2a2;
    padding: 5px;
    margin-left: 5px;
}

.preview-img {
    width: 50px;
    height: 50px;
    border-radius: 5px;
    border: 1px solid #a2a2a2;
    background-color: #a2a2a2;
}
</style>