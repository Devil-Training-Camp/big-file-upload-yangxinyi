// 导入 Express 框架，用于创建和管理 HTTP 服务器和路由。
import express from "express";
import { upload,mergeChunk,getChunkList } from "../untils/uploadFun";
import { calculateHash } from "../untils/hash";
// 创建一个 Express 路由器实例，它是一个中间件和路由的集合，可以用于路由特定的请求。
const router = express.Router();

router.post("/api/getData", function (req, res, next) {
	res.send({ message: "Hello World!" });
});

// 前端上传接口给的参数formdata给的属性名是file，属性值是上传的文件对象，所以这里上传文件的属性是file
router.post("/api/upload", upload.single("file"), (req:any, res:any) => {
	// 所谓的 upload 看起来只是把文件存储带内存对象，有几个问题：
	// 1. 程序退出之后，这些文件都消失了
	// 2. 内存容易爆
	// 3. 如果前端没有及时 merge，这部分内存就永远占用着，其实就是内存泄露
	// 4. 同一时间只能处理一个文件，没法并行
	getChunkList(req.file)
	res.send({
		code: 0,
		msg: "",
		data: '',
	});
});
router.post("/api/merge", express.json(),(req:any, res:any) => {
	mergeChunk(req.body.fileName)
	// 为什么要拼接两次 fileName？
	const url = `/upload/${req.body.fileName}/${req.body.fileName}`;
	res.send({
		code: 0,
		msg: "上传成功",
		data: url,
	});
});
router.get("/api/isExist", express.json(),async (req:any, res:any) => {
	// 假设，前端传过来的文件改了个名字，这里就不能命中了
	let hash = await calculateHash(req.query.name)
	if(hash == req.query.hash){
		res.send({
			code: 0,
			// 啥玩意，编码中尽量不要出现中文
			// 其次，你这里应该用模板字符串：
			// `${req.query.name}已经存在`
			msg: req.query.name + "已经存在",
			isExist: true,
		});
	} else {
		res.send({
			code: 0,
			msg: req.query.name + "不存在",
			isExist: false,
		});
	}
})
export default router;
// 如果用下面这种方式导出，则需要用 require 引入
// module.exports  = router;
