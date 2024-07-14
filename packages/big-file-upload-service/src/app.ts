import express from "express";
import router from "./routes/index";
const app = express();
const port = 3000;
// const cors = require('cors');
// 导入内置的 http-errors 模块，用于创建各种 HTTP 错误。
const createError = require("http-errors");


// 引入cors模块，处理跨域问题，这里要在引入路由之前引入cors模块，这样所有的请求都可以通过cors模块解决跨域问题。
// const cors = require("cors");
// app.use(cors);
// 将与用户相关的 URL (/users) 的请求路由到 usersRouter。
app.use("/", router);
// 如果前面的路由都没有处理请求，则创建一个 404 错误并传递给错误处理器。
app.use(function (req, res, next) {
	next(createError(404));
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
