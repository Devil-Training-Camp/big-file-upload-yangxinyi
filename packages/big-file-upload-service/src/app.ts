import express from 'express';
import router from './routes/index';
const app = express();
const port = 3000;
// 导入内置的 http-errors 模块，用于创建各种 HTTP 错误。
var createError = require('http-errors');

// 将与用户相关的 URL (/users) 的请求路由到 usersRouter。
app.use('/',router);
// 如果前面的路由都没有处理请求，则创建一个 404 错误并传递给错误处理器。
app.use(function(req, res, next) {
    next(createError(404));
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
