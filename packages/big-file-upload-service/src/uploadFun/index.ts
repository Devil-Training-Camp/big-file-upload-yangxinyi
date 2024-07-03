// const multer = require("multer");
// const path = require("path");
// // 设置存储引擎
// const storage = multer.diskStorage({
// 	destination: function (req, file, cb) {
// 		cb(null, "uploads/"); // 上传文件保存的目录
// 	},
// 	filename: function (req, file, cb) {
// 		cb(null, Date.now() + path.extname(file.originalname)); // 保存文件名为时间戳加扩展名
// 	},
// });

// // 初始化上传对象
// const upload = multer({ storage: storage });

// // 创建uploads目录
// const fs = require("fs");
// const uploadDir = "./uploads";
// if (!fs.existsSync(uploadDir)) {
// 	fs.mkdirSync(uploadDir);
// }
// // 处理单文件上传的接口
// router.post("/upload", upload.single("file"), (req, res) => {
// 	try {
// 		res.send({
// 			status: "success",
// 			message: "File uploaded successfully",
// 			file: req.file,
// 		});
// 	} catch (err) {
// 		res.sendStatus(500);
// 	}
// });