<template>
    <a-upload
        v-model:file-list="fileList"
        name="file"
        action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
        :headers="headers"
        @customRequest="customRequest"
        @change="handleChange"
    >
        <a-button>
            <upload-outlined></upload-outlined>
            Click to Upload
        </a-button>
    </a-upload>
</template>
<script setup lang="ts">
import { ref } from "vue";
const fileList = ref([]);
const headers = {
    authorization: "authorization-text",
};
const handleChange = (info: any) => {
    console.log(info);
};
const customRequest = (options: any) => {
    const { onSuccess } = options;
};
</script>

<style scoped></style>
