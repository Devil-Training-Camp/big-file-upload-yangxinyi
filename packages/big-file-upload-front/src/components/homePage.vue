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
import  { FileChunk }  from '../interface/index'
import { handleFragmentation } from "../untils/file";

const file = ref<File|null>(null);
// 分片大小：10MB
const chunkSize = 10 * 1024 * 1024; 


const handleFileChange = (e:any) => {
	file.value = e.target.files[0];
};
const handleUpload = async () => {
	if(!file.value) return;
	// 将文件分片
	let chunkList:FileChunk[] = handleFragmentation(file.value,chunkSize);
	chunkList.forEach(async item=>{
		let formData = new FormData();
		formData.append("file", item.chunk);
		formData.append("fileId", item.id.toString());
		try {
			const response = await axios.post(
				"api/upload",
				formData
			);
			console.log(response)
			// onSuccess(response.data);
		} catch (error) {
			// onError(error);
			console.log(item.id)
		}
	})

	// 原始文件直接上传 
	// let formData = new FormData();
	// formData.append("file", file.value);
	// try {
	// 	const response = await axios.post(
	// 		"api/upload",
	// 		formData
	// 	);
	// 	console.log(response)
	// 	// onSuccess(response.data);
	// } catch (error) {
	// 	// onError(error);
	// 	// console.log(item.id)
	// }
};

</script>

<style scoped></style>
