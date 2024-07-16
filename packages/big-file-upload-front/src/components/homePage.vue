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
import { message } from 'ant-design-vue';
import  { FileChunk }  from '../interface/index'
import { handleFragmentation,createHash,isFileExist } from "../untils/file";

const file = ref<File|null>(null);
// 分片大小：10MB
const chunkSize = 10 * 1024 * 1024; 
const chunkList = ref<FileChunk[]>([])
const fileHash = ref<string>("");

const handleFileChange = (e:any) => {
	file.value = e.target.files[0];
};
const handleUpload = async () => {
	if(!file.value) return;
	let isSuccess = true;
	// 将文件分片
	chunkList.value = handleFragmentation(file.value,chunkSize);
	let chunkListArr:Blob[] = chunkList.value.map(item => item.chunk);
	// 计算文件hash
	fileHash.value = await createHash(chunkListArr)
	// 请求后端查询该文件hash是否已经存在
	let res = await isFileExist({
		name:file.value.name,
		hash:fileHash.value,
	})
	if(res.data.isExist){
		message.success('文件已经从存在');
		return
	}
	for(let i = 0; i < chunkList.value.length; i++){
		let item = chunkList.value[i];
		let formData = new FormData();
		formData.append("file", item.chunk);
		formData.append("fileId", item.id.toString());
		formData.append("fileName", file.value!.name);
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
			isSuccess = false
			break
		}
	}
	if(isSuccess){
		// 所有分片上传完之后，合并文件
		mergeChunk()
	}
};
const mergeChunk = async () => {
	let obj = {
		fileName:file.value!.name 
	}
	const response = await axios.post("api/merge",obj);
	console.log(response)
};
</script>

<style scoped></style>
