/**
 * Created by WebStorm.
 * User: nirongxu
 * Date: 2020/6/15
 * Description: 文件描述
 */
import {IApp, IRouters, ICallback, Context} from './interface.ts'
import {HTTPOptions, listenAndServe, Response} from "./deps.ts";

const methods = ["get", "post", "put", "patch", "delete"]

// 执行返回一个app对象,里面包含了get,post,put,delete,patch,use,listen等方法
export function Application() {
    const constr: IApp  = {
        routers: {} as IRouters,
        listen: listenFnc,
        use: use,
    } as IApp
    constr.listen = listenFnc.bind(constr)
    methods.forEach(method => { // 给 app 添加请求方式
        // 请求类型method
        constr[method] = methodFn.call(constr, method)
    })
    return constr
}

function use(this: IApp, path: string | ICallback, ...funs: ICallback[]) {
    // 做的是对path, funs进行存储
    // 由于中间件是各种请求类型都能执行到的, 只要path相同
    for (const type of methods) {
        methodFn.call(this, type, true)(path, ...funs)
    }

}

function listenFnc (this: IApp, options: HTTPOptions, listenCallback?: Function){
    listenCallback?.(); // 执行传递的回调
    listenAndServe(options, async ctx => {
        const type = ctx.method.toLowerCase(); // 获取请求类型,转换为小写
        const routes = this.routers[type]; // 对应请求类型的Route数组
        // 定义一个变量,用来表示是否调用了respond
        let callRespond = false;
        // 重写respond
        const oldRespond = ctx.respond
        ctx.respond = function (res: Response) {
            if (!callRespond) {
                callRespond = true
                oldRespond.call(ctx, res)
            } else {
                // 错误处理
            }

            return Promise.resolve()
        }
        // 添加一个send方法
             addSend(ctx as Context)
        // 后面就是循环判断里面有咩有对应的请求path url
        if (!routes) {
            ctx.respond({status: 404, body: "Not Found"});
            return false;
        }
        deep(0)
        // 找到,递归执行
        function deep(i: number) {
            if (routes.length <= i) {
                ctx.respond({status: 404, body: "Not Found"});
                return false; //  执行到后面
            }
            const route = routes[i]
            // router.path === "*" 就是什么样的请求路径都调用
            if (route.path === ctx.url || route.path === "*" ||
                // 这时候我们要判断url是否是以router.path开头的 indexOf 结果为0
                (route.isMiddleware && ctx.url.indexOf(route.path) === 0)) {
                route.callback(ctx as Context, () => deep(++i))
            } else {
                deep(++i)
            }

        }
    })
}

function methodFn(this: IApp, type: string, isMiddleware = false) {
    return  (path: string | ICallback, ...funs: ICallback[]) => {
        this.routers[type] || (this.routers[type] = []);
        if (typeof path === "string") { // 有没有传递请求的路径
            if (funs.length === 0) funs = [(ctx, next) => next()];

        } else {
            // 没有传递请求路径,给默认的 *
            funs.unshift(path)
            path = "*"
        }
        funs.forEach((fun) => {
            this.routers[type].push({
                path: path as string,
                callback: fun,
                isMiddleware
            })
        })
    }
}

function addSend(ctx: Context) {
    ctx.send = function (content: any) {
        // ContentType
        const headers = new Headers();
        headers.set("Content-Type", "application/json;charset=utf-8");
        if (typeof content === "string") {
            ctx.respond({body: content, headers})
        } else if (typeof content === "object") {
            ctx.respond({body: JSON.stringify(content), headers})
        } else if (typeof content === "number") {
            ctx.respond({body: content.toString(), headers})
        } else {
            // 不处理
            ctx.respond({body: content})
        }
    }
}


