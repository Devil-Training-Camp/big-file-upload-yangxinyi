<template>
	<input type="file" @change="handleFileChange" name="userImage"/>
	<a-button @click="handleUpload">
		<upload-outlined></upload-outlined>
		Click to Upload
	</a-button>
</template>
<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
const file = ref<File|null>(null);

const handleFileChange = (e:any) => {
	file.value = e.target.files[0];
};
const handleUpload = async () => {
	if(!file.value) return;
	const formData = new FormData();
	formData.append("userImage", file.value);
	console.log(formData.get('userImage'))
	try {
		const response = await axios.post(
			"api/upload",
			formData
		);
        console.log(response)
		// onSuccess(response.data);
	} catch (error) {
		// onError(error);
	}
};
</script>

<style scoped></style>
