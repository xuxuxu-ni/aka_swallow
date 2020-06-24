/**
 * Created by WebStorm.
 * User: nirongxu
 * Date: 2020/6/16
 * Description: 文件描述
 */
import {Application} from "./application.ts"
import bodyParser from "./body-parser.ts";
const app = Application()

app.use(bodyParser())
app.use("/abc", (ctx, next) => {
    console.log("/abc use middleware 1");
    next();
    console.log("/abc use middleware 2");
}, (ctx, next) => {
    console.log("/abc use middleware 3");
    next();
    console.log("/abc use middleware 4");
})

app.get("/", ctx => {
    ctx.respond({
        body: "hello deno",
    })
})
app.get("/abc", (ctx, next) => {
    console.log("/abc middleware 1");
    ctx.respond({
        body: "hello abc",
    })
    next();
    console.log("/abc middleware 2");

})
app.get("/abc", ctx => {
    console.log("/abc middleware 3");
    ctx.respond({
        body: "abc deno",
    })
})

app.post("/abc", ctx => {
    console.log("/abc middleware 4");
    ctx.respond({
        body: "post abc"
    })
})

app.post("/send", ctx => {
    console.log(ctx.data);
    ctx.send({
        a: "send"
    })
})

app.get("/bodyparser", ctx => {
    console.log(ctx.data);
    ctx.send({
        a: "bodyparser"
    })
})

app.listen({
    port: 8000
},() => {
    console.log("服务地址:http://localhost:8000")
})

