// 导入 Express 框架，用于创建和管理 HTTP 服务器和路由。
import express from "express";
import {upload,mergeChunk,getChunkList} from "../untils/uploadFun";
// 创建一个 Express 路由器实例，它是一个中间件和路由的集合，可以用于路由特定的请求。
const router = express.Router();

router.post("/api/getData", function (req, res, next) {
	res.send({ message: "Hello World!" });
});

// router.post("/", function (req, res) {
// 	res.send("POST request to the homepage");
// });


// 前端上传接口给的参数formdata给的属性名是file，属性值是上传的文件对象，所以这里上传文件的属性是file
router.post("/api/upload", upload.single("file"), (req:any, res:any) => {
	getChunkList(req.file)
	res.send({
		code: 0,
		msg: "",
		data: '',
	});
});
router.post("/api/merge", express.json(),(req:any, res:any) => {
	mergeChunk(req.body.fileName)
	const url = `/upload/${req.body.fileName}`;
	res.send({
		code: 0,
		msg: "",
		data: url,
	});
});
export default router;
// 如果用下面这种方式导出，则需要用 require 引入
// module.exports  = router;
