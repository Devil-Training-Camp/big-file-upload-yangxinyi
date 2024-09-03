import axios from "axios";
import { FileChunk,FileInfo,FileNameObj } from "../interface/index";
import webWorker from './worker.ts?worker'
// 文件分片上传
// 1. 获取文件大小，计算一共需要分成多少个分片
// 2. 循环分片，上传
export const handleFragmentation = (file: File, chunkSize: number) => {
	let chunkList: FileChunk[] = [];
	let shardsNum = Math.ceil(file.size / chunkSize);
	// file.slice(a，b) a是起始位置，b是结束位置
	for (let i = 0; i < shardsNum ; i++) {
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
		hashWorker.postMessage(chunkList); 
		hashWorker.onmessage = (e) => {
			// 返回子线程计算的最终hash，并关闭子线程
			resolve(e.data as string);
			hashWorker.terminate()
		};
	});
};

export const isFileExist = (fileInfo:FileInfo) => {
	return axios.get("api/isExist?hash="+fileInfo.hash);
};
export const changeFileName = (fileNameObj:FileNameObj) => {
	// 这里本应该直接使用fileNameObj的，但是不知道为什么会有标红报错，就先用Object.entries将key和value变成数组作为参数 
	const arr = Object.entries(fileNameObj)
	const params = new URLSearchParams(arr).toString();
	return axios.get(`api/changeName?${params}`);
};
// 参数说明：
// poolLimit（数字类型）：表示限制的并发数；
// array（数组类型）：表示任务数组；
// iteratorFn（函数类型）：表示迭代函数，用于实现对每个任务项进行处理，该函数会返回一个 Promise 对象或异步函数；
// onUpload: 进度条
export const promisePool = async(poolLimit:number, array:any[], iteratorFn:Function) => {
	// 所有异步任务的数组
	let allPromiseArray:Promise<any>[] = [];
	// 正在执行中的异步任务数组
	let poolArray:Promise<any>[] = [];
	for(let item of array){
		// 创建一个异步任务执行iteratorFn函数
		let promise = Promise.resolve().then(() => iteratorFn(item));
		// 将新创建的promise添加到allPromiseArray数组中
		allPromiseArray.push(promise);
		if(array.length >= poolLimit){
			// 当需要执行的异步任务数量大于并发限制时
			// 在promise执行后，将其从poolArray中移除
			// 将移除的这个环节添加在promise后，并加入到poolArray中
			let promiseKeepOn:Promise<any> = promise.then(() => {
				poolArray.splice(poolArray.indexOf(promiseKeepOn), 1)
			}
				
		);
			poolArray.push(promiseKeepOn)
			// 当正在执行的异步任务数组数量到达并发限制时开始执行
			// 使用race方法，执行poolArray中执行的最快的一个
			if(poolArray.length >= poolLimit){
				await Promise.race(poolArray);
			}
		}
	}
	return Promise.all(allPromiseArray);  // 集合多个返回结果
}
