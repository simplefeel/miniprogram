/**
 * 基础配置
 */
var config = {
    environment: '$$_environment_$$',
    spiderA: '$$_spider_a_$$',
    vap: {
        0: 'http://h5.dev.weidian.com:5009/mock',
        1: 'https://vap.gw.daily.weidian.com',
        2: 'https://vap.gw.pre.weidian.com',
        3: 'https://vap.gw.weidian.com',
    },
    thor: {
        0: 'http://h5.dev.weidian.com:5011/mock',
        1: 'https://thor.daily.weidian.com',
        2: 'https://thor.pre.weidian.com',
        3: 'https://thor.weidian.com',
    },
    channel: 'xiaochengxu',
};

/**
 * api接口
 */
config.api = {
    getshoptreasures: 'ares/index.getShopTreasures/1.0',
};

/**
 * 跳转路径url
 */
config.url = {
    webview: '/lib/webview/dist/pages/index/index', // h5页面
};

module.exports = config;
