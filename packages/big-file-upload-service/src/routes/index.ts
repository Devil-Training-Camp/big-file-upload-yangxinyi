// 导入 Express 框架，用于创建和管理 HTTP 服务器和路由。
import express from 'express';
// 创建一个 Express 路由器实例，它是一个中间件和路由的集合，可以用于路由特定的请求。
const router = express.Router();
router.get('/api/getData', function(req, res, next) {
    res.send({ message: "Hello World!" });
});

router.post('/', function (req, res) {
    res.send('POST request to the homepage')
})

export default router;
// 如果用下面这种方式导出，则需要用 require 引入
// module.exports  = router;
