<template>
    <input type="file" @change="handleFileChange" name="userImage" />
    <a-button @click="handleUpload">
        <upload-outlined></upload-outlined>
        Click to Upload
    </a-button>
</template>
<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import { message, Modal } from "ant-design-vue";
import { FileChunk,FileChunkData } from "../interface/index";
import {
    handleFragmentation,
    createHash,
    isFileExist,
    changeFileName,
    promisePool,
} from "../untils/file";
import indexedDBFun from "../untils/indexedDB"

const file = ref<File | null>(null);
// 分片大小：10MB
const chunkSize = 10 * 1024 * 1024;
const chunkList = ref<FileChunk[]>([]);
const fileHash = ref<string>("");

const handleFileChange = (e: any) => {
    file.value = e.target.files[0];
};
const handleUpload = async () => {
    if (!file.value) return;
    // 将文件分片
    chunkList.value = handleFragmentation(file.value, chunkSize);
    let chunkListArr: Blob[] = chunkList.value.map((item) => item.chunk);
    console.log(chunkListArr)
    // 计算文件hash
    fileHash.value = await createHash(chunkListArr);
    // 请求后端查询该文件hash是否已经存在
    let res = await isFileExist({
        hash: fileHash.value,
    });
    if (res.data.isExist) {
        if (res.data.fileName == file.value.name) {
            message.success("文件已经存在");
        } else {
            Modal.confirm({
                title: 	`是否替换`,
                content: `该文件已经存在，文件名为${res.data.fileName}，确定更新为上传文件名?`,
                onOk() {
                    let obj = {
                        newName: file.value!.name,
                        oldName: res.data.fileName
                    }
                    changeFileName(obj).then((res: any)=>{
                        if(res.data.isChange){
                            message.success(res.data.msg)
                        }else{
                            message.error(res.data.msg)
                        }
                    })
                },
                onCancel(){},
            });
        }
        return
    }
    // 先将分片全部保存在indexedDB中
    saveIndexedDB()
    promisePool(5, chunkList.value, uploadChunk).then(() => {
        mergeChunk(chunkList.value.length);
    });
};
const saveIndexedDB = async () => {
    let db:IDBDatabase = await indexedDBFun.openDB('bigFileUpload',fileHash.value)
    chunkList.value.forEach(item => {
        indexedDBFun.addData(db,fileHash.value,item.chunk)
    })
}
const uploadChunk = (item: FileChunk) => {
    let formData = new FormData();
    formData.append("file", item.chunk);
    let param = new URLSearchParams({
        fileId:item.id.toString(),
        fileName:file.value!.name
    }).toString();
    return new Promise((resolve) => {
        axios.post("api/upload?"+param, formData).then((res) => {
            resolve(res);
        });
    });
};
const mergeChunk = async (total: number) => {
    let obj = {
        fileName: file.value!.name,
        total
    };
    let res:any = await axios.post("api/merge", obj);
    if(res.data.isMerge){
        message.success("上传成功");
        await indexedDBFun.openDB('bigFileUpload',fileHash.value,true)
    }
};
</script>

<style scoped></style>
