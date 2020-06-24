/**
 * Created by WebStorm.
 * User: nirongxu
 * Date: 2020/6/24
 * Description: 文件描述
 */
import {Context} from "./interface.ts";

export default function bodyParser () {
    // 返回一个中间件
    return async (ctx: Context, next: Function) => {
        const buf = new Uint8Array(2018);
        // 每次传入buf. 返回如果不是null,标识body这个流中还有数据
        while ((await ctx.body.read(buf)) !== null) {

        }
        const bodyStr = Uint8ArrayToString(buf);
        // 把bodyStr 转换成对象
        const data = StringToData(bodyStr);
        // 默认body是响应的数据的方法
        ctx.data = data;
        next()
    }
}

// 返回 {username: 'admin', password: 'admin'}
function StringToData(bodyStr: string): Record<string, string> {
    const data: Record<string, string> = {};
    try {
        // username=admin&password=admin
        const bodyStrArr = bodyStr.split('&');
        // [username=admin, password=admin]
        for (let item of bodyStr) {
            // 对拿到的字符串进行拼接组装
            const itemArr = item.split('=')
            data[itemArr[0]] = itemArr[1]
        }
    } catch (e) {
        console.log(e);
    }
    return data
}

function Uint8ArrayToString(buf: Uint8Array) {
    let dataString: string = ''
    try {
        for (let i = 0; i < buf.length; i++) {
            if (buf[i]) { // 为0的话就是没有的
                dataString += String.fromCharCode(buf[i])
            }
        }
    } catch (e) {
        console.log(e);
    }

    return decodeURIComponent(dataString) // 中文转换成字符串
}
