// 导入 Express 框架，用于创建和管理 HTTP 服务器和路由。
import express from "express";
import { 
	upload,
	mergeChunk,
	saveChunk,
	isExist,
	changeFileName
} from "../untils/uploadFun";

// 创建一个 Express 路由器实例，它是一个中间件和路由的集合，可以用于路由特定的请求。
const router = express.Router();

// 前端上传接口给的参数formdata给的属性名是file，属性值是上传的文件对象，所以这里上传文件的属性是file
router.post("/api/upload", express.json(),upload.single("file"), saveChunk);
router.post("/api/merge", express.json(),mergeChunk);
router.get("/api/isExist", express.json(), isExist)
router.get("/api/changeFileName", express.json(), changeFileName)
export default router;
// 如果用下面这种方式导出，则需要用 require 引入
// module.exports  = router;
