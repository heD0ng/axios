import axios from 'axios'
import CancelReq from './cancelReq'

const cancelReqInstance = new CancelReq();
// 默认携带cookie
// axios.defaults.withCredentials = true
export function request(config) {

    // 此处可以用三元表达式，进行开发模式与生产模式的baseURL设置
    // 另外我之所以用实例的形式，考虑到的是可能有多个链接需要获取数据
    const net = axios.create({
        baseURL: 'http://localhost',
        timeout: 5000,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            // application/json
        }
    })

    net.interceptors.request.use(config => {
        // 如果重复，取消上一次的
        cancelReqInstance.cancel(config);
        // 新增新的
        cancelReqInstance.addKey(config, axios.CancelToken);

        // header中携带token信息
        let token = localStorage.getItem('token')
        token && (config.headers.Authorization = token)
        return config
    })

    net.interceptors.response.use(res => {
        // 接口返回后，清除数据
        cancelReqInstance.remove(res.config);
        return res.data
    }, err => {
        let { response } = err;
        // err.response = res (返回来的res)
        // 这里如果有疑惑的话，可以看源码的error组成

        if (response) {
            // 在每个case中可以做相应操作，增加用户体验
            switch (response.status) {
                case 401:
                    // 一般都是未登录
                    break;
                case 403:
                    // token过期或者session过期
                    break;
                case 404:
                    // 页面不存在
                    break;
                default:
                    break;
            }
        } else {
            // 服务器未收到结果
            if (!window.navigator.onLine) {
                // 自己断网，可以跳回上一个页面
                return
            }
            // 服务器宕机
            return Promise.reject(err)
        }
    })
    return net(config)
}