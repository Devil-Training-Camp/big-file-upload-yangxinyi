<template>
    <a-spin :spinning="spinning" tip="正在检查文件是否存在……">
        <div>
            <input type="file" @change="handleFileChange" name="userImage" />
            <div v-if="progressPercent>0&&progressPercent<100">
                <a-button v-if="pauseShow" shape="circle" :icon="h(PauseCircleOutlined)" @click="pauseUpload"/>
                <a-button v-else shape="circle" :icon="h(PlayCircleOutlined)" @click="continueUpload"/>
                <a-button shape="circle" :icon="h(BorderOutlined)" @click="stopUpload"/>
            </div>
        </div>
        <a-progress v-show="progressPercent !== 0" :percent="progressPercent" />
        <a-button @click="handleUpload">
            <upload-outlined></upload-outlined>
            Click to Upload
        </a-button>
    </a-spin>
</template>
<script setup lang="ts">
import { ref,h } from "vue";
import axios from "axios";
import { message, Modal } from "ant-design-vue";
import { PauseCircleOutlined,PlayCircleOutlined,BorderOutlined } from "@ant-design/icons-vue";
import { FileChunk , chunkIndexdDB } from "../interface/index";
import {
    handleFragmentation,
    createHash,
    isFileExist,
    changeFileName,
    promisePool,
} from "../untils/file";
import indexedDBFun from "../untils/indexedDB"

let controller = new AbortController();
const file = ref<File | null>(null);
// 分片大小：10MB
const chunkSize = 10 * 1024 * 1024;
const chunkList = ref<FileChunk[]>([]);
const fileHash = ref<string>("");
const db = ref<IDBDatabase | null>(null);
const dbVersion = ref<number>(0)
const progressPercent = ref<number>(0);
const spinning = ref<boolean>(false)
const pauseShow = ref<boolean>(true)
const handleFileChange = (e: any) => {
    file.value = e.target.files[0];
    spinning.value = false
    progressPercent.value = 0
};
const handleUpload = async () => {
    if (!file.value) return;
    spinning.value = true
    if(file.value.size > chunkSize){
        // 将文件分片
        chunkList.value = handleFragmentation(file.value, chunkSize);
    }else{
        chunkList.value = [{
            chunk:file.value,
            id:0
        }]
    }
    
    let chunkListArr: Blob[] = chunkList.value.map((item) => item.chunk);
    console.log(chunkListArr)
    // 计算文件hash
    fileHash.value = await createHash(chunkListArr);
    // 请求后端查询该文件hash是否已经存在
    let res = await isFileExist({
        hash: fileHash.value,
    });
    spinning.value = false
    if (res.data.isExist) {
        if (res.data.msg == file.value.name) {
            message.success("文件已经存在");
        } else {
            Modal.confirm({
                title: 	`是否替换`,
                content: `该文件已经存在，文件名为${res.data.msg}，确定更新为上传文件名?`,
                onOk() {
                    let obj = {
                        newName: file.value!.name,
                        oldName: res.data.msg
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
    if(chunkList.value.length > 1) await saveIndexedDB()
    pauseShow.value = true
    promisePool(5, chunkList.value, uploadChunk).then(() => {
        mergeChunk(chunkList.value.length);
    });
};
const saveIndexedDB = async () => {
    return new Promise(async resolve => {
        db.value = await indexedDBFun.openDB('bigFileUpload',fileHash.value)
        debugger
        dbVersion.value = db.value.version
        let arr:chunkIndexdDB[] = chunkList.value.map(item => {
            let obj:any = {...item}
            obj.isUplaod = false
            return obj as chunkIndexdDB
        })
        for(let i = 0; i < arr.length; i++){
            await indexedDBFun.addData(db.value as IDBDatabase, fileHash.value, arr[i])
        }
        resolve(1)
    })
    
}
const getProgress = async (db:IDBDatabase,storeName:string,chunk:any) => {
    if(chunkList.value.length >1){
        await indexedDBFun.updateStore(db,storeName,chunk)
        let res:any = await indexedDBFun.getAllData(db,storeName)
        let arr:chunkIndexdDB[] = res.filter((item:chunkIndexdDB) => item.isUplaod == true)
        progressPercent.value = +(( arr.length/res.length * 100 ).toFixed(2))
        console.log(res)
    }else{
        progressPercent.value = 100
    }
}
const uploadChunk = (item: FileChunk) => {
    let formData = new FormData();
    formData.append("file", item.chunk);
    let param = new URLSearchParams({
        fileId:item.id.toString(),
        fileName:file.value!.name
    }).toString();
    return new Promise(async (resolve) => {
        let res = await axios.post("api/upload?" + param, formData)
        resolve(res);
        let obj:chunkIndexdDB = {
            chunk:item.chunk,
            id:item.id,
            isUplaod:true,
            ID:item.id+1
        }
        getProgress(db.value as IDBDatabase,fileHash.value,obj)
        console.log(res)
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
        pauseShow.value = false
        if(db.value){
            db.value.close()
            await indexedDBFun.openDB('bigFileUpload',fileHash.value,dbVersion.value+1)
        }
    }
};
const pauseUpload = () => {
    pauseShow.value = false
}
const continueUpload = () => {

}
const stopUpload = () => {

}
</script>

<style scoped></style>
