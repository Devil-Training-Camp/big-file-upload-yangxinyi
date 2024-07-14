import axios from "axios";
import { FileChunk,FileInfo } from "../interface/index";
import webWorker from './worker.ts?worker'
// 文件分片上传
// 1. 获取文件大小，计算一共需要分成多少个分片
// 2. 循环分片，上传
export const handleFragmentation = (file: File, chunkSize: number) => {
	let chunkList: FileChunk[] = [];
	let shardsNum = Math.ceil(file.size / chunkSize);
	// file.slice(a，b) a是起始位置，b是结束位置
	for (let i = 0; i < shardsNum + 1; i++) {
		let tempFile: Blob;
		if (i == shardsNum) {
			tempFile = file.slice(i * chunkSize, file.size);
		} else {
			tempFile = file.slice(i * chunkSize, (i + 1) * chunkSize);
		}
		chunkList.push({
			chunk: tempFile,
			id: i,
		});
	}
	return chunkList;
};

export const createHash = (chunkList: Blob[]) : Promise<string> => {
	//采用异步读取，主要将file传给worker读取
	return new Promise((resolve) => {
		// puzzle 这里只能用绝对路径，相对路径会报错，不知道是为什么???先换种写法
		// let hashWorker = new Worker('../../src/untils/worker.ts'); 
		let hashWorker = new webWorker(); 
		chunkList.forEach((item,index) => {
			// 将分片发送给worker子线程
			// 如果是发送最后一个分片，需要给终止提示
			if( index == chunkList.length - 1){
				hashWorker.postMessage({
					hasDone:true,
					blob:item,
				}); 
			} else {
				hashWorker.postMessage({blob:item}); 
			}
			
			hashWorker.onmessage = (e) => {
				// 返回子线程计算的最终hash，并关闭子线程
				resolve(e.data as string);
				hashWorker.terminate()
			};
		});
		
	});
};

export const isFileExist = (fileInfo:FileInfo) => {
	return axios.get("api/isExist?name="+fileInfo.name+"&hash="+fileInfo.hash);
};
