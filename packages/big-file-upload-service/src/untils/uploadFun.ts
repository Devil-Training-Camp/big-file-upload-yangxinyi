const multer = require("multer");
const path = require("path");
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

const upload = multer({
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
export default upload;