import Koa from "koa";
const app = new Koa();
app.use(async (ctx) => {
    ctx.body = "Hello World";
});
// http://localhost:3000/ 
app.listen(3000);
