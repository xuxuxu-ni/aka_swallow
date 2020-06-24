/**
 * Created by WebStorm.
 * User: nirongxu
 * Date: 2020/6/15
 * Description: 文件描述
 */
import {
    ServerRequest,
    HTTPOptions
} from "./deps.ts"

// 更好的使用, 使用接口继承这个类,并且添加一些我们需要的方法和参数
export interface Context extends ServerRequest {
    send: (body: any) => void // 响应数据源的方法
    params: Record<string, string> // 动态路由返回的params对象
    data: Record<string, string> // 前台发送过来的值
}

// 每个请求的回调函数,或者中间件的回调函数的类型
export interface ICallback {
    (ctx: Context, next: Function): void // request, response, next
}

// 请求方法的类型,中间件的类型
interface IMethodFn {
    // 路径可以为空,默认 *
    // 第二个参数到 n 个参数都是回调函数
    (path: string | ICallback, ...funs: ICallback[]): void
}

// listen
export interface IListen {
    (options: HTTPOptions, listenCallback?: Function): void
}
interface Route {
    path: string,
    callback: ICallback,
    isMiddleware: boolean
}
export interface IRouters {
    [key: string]: Route[]
}
export interface IApp {
    // 存储每次调用请求或者中间的一个对象
    routers: IRouters,
    get: IMethodFn,
    post: IMethodFn,
    put: IMethodFn,
    delete: IMethodFn,
    patch: IMethodFn,
    use: IMethodFn,
    listen: IListen,
    [key: string]: IMethodFn | IRouters | IListen
}
