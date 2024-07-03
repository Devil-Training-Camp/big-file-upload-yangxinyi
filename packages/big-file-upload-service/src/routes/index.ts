// 导入 Express 框架，用于创建和管理 HTTP 服务器和路由。
import express from "express";
// 创建一个 Express 路由器实例，它是一个中间件和路由的集合，可以用于路由特定的请求。
const router = express.Router();
router.get("/api/getData", function (req, res, next) {
	// res.header("Access-Control-Allow-Origin", "*");
	// res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
	// res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
	res.send({ message: "Hello World!" });
});

router.post("/", function (req, res) {
	res.send("POST request to the homepage");
});

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
		fileSize: 150 * 1024,
	},
	fileFilter(req:any, file:any, cb:any) {
		//验证文件后缀名
		const extname = path.extname(file.originalname);
		const whitelist = [".jpg", ".gif", "png",".txt"];
		if (whitelist.includes(extname)) {
			cb(null, true);
		} else {
			cb(new Error(`your ext name of ${extname} is not support`));
		}
	},
});
// 前端上传接口给的参数formdata给的属性名是file，属性值是上传的文件对象，所以这里上传文件的属性是file
router.post("/api/upload", upload.single("userImage"), (req:any, res:any) => {
	const url = `/upload/${req.file.filename}`;
	res.send({
		code: 0,
		msg: "",
		data: url,
	});
});

export default router;
// 如果用下面这种方式导出，则需要用 require 引入
// module.exports  = router;
