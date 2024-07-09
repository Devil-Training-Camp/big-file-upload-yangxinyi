import {
	FileChunk
} from '../interface/index'
const fs = require("fs");
const multer = require("multer");
const path = require("path");
let fileList:any[] = [];
const storage = multer.diskStorage({
	destination: function (req:any, file:any, cb:any) {
		cb(null, path.resolve(__dirname, "../../public/upload"));
	},
	filename: function (req:any, file:any, cb:any) {
		// 时间戳-6位随机字符.文件后缀
		const timeStamp = Date.now();
		const ramdomStr = Math.random().toString(36).slice(-6);
		const ext = path.extname(file.originalname);
		const filename = `${timeStamp}-${ramdomStr}${ext}`;
		cb(null, filename);
	},
});

export const upload = multer({
	storage,
	limits: {
		fileSize: 1024 * 1024 * 1024, //1GB
	},
	fileFilter(req:any, file:any, cb:any) {
		//验证文件后缀名
		const extname = path.extname(file.originalname);
		const whitelist = [".jpg", ".gif", "png", ".txt", "blob", "", ".rar"];
		if (whitelist.includes(extname)) {
			cb(null, true);
		} else {
			cb(new Error(`your ext name of ${extname} is not support`));
		}
	},
});
export const mergeChunk = (fileName:string) => {
	const uploadUrl = path.resolve(__dirname, "../../public/upload")
	const filePath = path.join(uploadUrl,fileName);
	if (!fs.existsSync(filePath)) {
		fs.mkdirSync(filePath);
	}
	const writeStream = fs.createWriteStream(path.join(filePath,fileName),{ flags: 'a' })
	fileList.forEach(item=>{
		// 写文件流的对象
		const chunkPath = path.join(uploadUrl,item.filename)
		const data = fs.readFileSync(chunkPath);
		writeStream.write(data);
		fs.unlinkSync(chunkPath);
	})
	writeStream.end()
	writeStream.on('finish',()=>{
		console.log('写入完成');
	});
};

export const getChunkList = (fileItem:any)=>{
	fileList.push(fileItem)
}
