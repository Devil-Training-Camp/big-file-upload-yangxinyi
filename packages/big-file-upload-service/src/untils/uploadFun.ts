import { checkFileHash } from "../untils/hash";
import fs from 'fs'
import multer from 'multer'
import path from 'path'
const storage = multer.diskStorage({
	destination: function (req:any, file:any, cb:any) {
		cb(null, path.resolve(__dirname, "../../public/upload"));
	},
	filename: function (req:any, file:any, cb:any) {
		// 因为在 Multer 中，filename 函数是在文件存储之前被调用的，这个时候请求体话没有解析出来，只能先将参数放到请求头
		// Multer 在处理文件之前会先读取整个请求体，所以任何依赖于请求体解析的中间件（如 body-parser）都需要在 Multer 之后执行。
		cb(null, req.query.fileName + '_' + req.query.fileId) // 生成文件名
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
		const whitelist = [".jpg", ".gif", ".png", ".txt", "blob", "", ".rar"];
		if (whitelist.includes(extname)) {
			cb(null, true);
		} else {
			cb(new Error(`your ext name of ${extname} is not support`));
		}
	},
});
export const mergeChunk = (req:any,res:any) => {
	const { fileName ,total} = req.body
	const uploadUrl = path.resolve(__dirname, "../../public/upload")
	const filePath = path.join(uploadUrl,fileName)
	const writeStream = fs.createWriteStream(filePath,{ flags: 'a' })
	for(let i = 0; i < total; i++){
		// 写文件流的对象
		const chunkPath = path.join(uploadUrl,fileName+'_'+i)
		const data = fs.readFileSync(chunkPath);
		writeStream.write(data);
		fs.unlinkSync(chunkPath);
	}
	writeStream.end()
	writeStream.on('finish',()=>{
		console.log('写入完成');
		res.send({
			msg: "文件合并成功",
			isMerge: true
		});
	});
};

export const saveChunk = (req:any,res:any)=>{
	res.send({
		msg: "文件上传成功",
		isUpload: true
	})
}

export const isExist = async (req:any, res:any)=>{
	const isFileExist = await checkFileHash(req.query.hash)
	if(isFileExist.isExist){
		res.send({
			msg: isFileExist.fileName,
			isExist: true,
		});
	}else{
		res.send({
			msg: "文件不存在",
			isExist: false,
		});
	}
}

export const changeFileName = async (req:any, res:any)=>{
	const oldName = req.query.oldName
	const newName = req.query.newName
	const oldPath = path.resolve(__dirname, "../../public/upload", oldName);
    const newPath = path.resolve(__dirname, "../../public/upload", newName);
    // 使用 fs.rename 进行重命名
    fs.rename(oldPath, newPath, (err) => {
        if (err) {
            // 如果有错误发生，比如旧文件不存在，或者目标位置已有同名文件等，处理错误
			res.send({
				msg: `替换名称时发生错误,${err},保持原文件不变`,
				isChange: false,
			});
            return;
        }
        // 如果没有错误，那么文件已经被成功重命名
		res.send({
			msg: `文件名已成功由${oldName}替换成${newName}`,
			isChange: true,
		});
    });
}
