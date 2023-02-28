import qs from qs;
// const qs = require('qs')

export default class CancelReq {
    constructor() {
        this.keyMap = new Map();
    }
    genKey(config) {
        const {url, method, data = {}, params = {}} = config;
        return [url, method, data, params].map(item => qs.stringify(item)).join('-');
    }
    addKey(config, CancelToken) {
        const key = this.genKey(config);
        config.cancelToken = config.cancelToken || new CancelToken((c) => {
            if(!this.keyMap.has(key)) {
                this.keyMap.set(key, c);
            }
        })
    }
    // 判断存在并取消
    cancel(config) {
        const key = this.genKey(config);
        if (this.keyMap.has(key)) {
            const c = this.keyMap.get(key);
            c();
            this.remove(config);
        }
    }
    remove(config) {
        const key = this.genKey(config);
        this.keyMap.has(key) && this.keyMap.delete(key);
    }
}