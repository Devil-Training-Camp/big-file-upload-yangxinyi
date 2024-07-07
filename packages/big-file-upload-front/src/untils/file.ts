import  { FileChunk }  from '../interface/index'

// 文件分片上传
// 1. 获取文件大小，计算一共需要分成多少个分片
// 2. 循环分片，上传
export const handleFragmentation = (file:File,chunkSize:number) => {
    let chunkList:FileChunk[] = []
	let shardsNum = Math.ceil(file.size / chunkSize);
	// file.slice(a，b) a是起始位置，b是结束位置
	for(let i = 0; i < shardsNum + 1; i++){
        let tempFile:Blob
		if(i == shardsNum){
			tempFile = file.slice(i * chunkSize, file.size)
		} else {
			tempFile = file.slice(i * chunkSize, (i + 1) * chunkSize)
		}
        chunkList.push({
            chunk:tempFile,
            id:i
        })
	}
    return chunkList
}


