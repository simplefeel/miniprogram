/**

# 与项目相关的配置

## `environment`变量说明

    0 : 开发
    1 : 测试
    2 : 预发
    3 : 线上

## `args`对象包含的数据

    name: 项目名称
    version: 版本号
    environment: 当前环境变量
    dev: 是否是开发环境
 */
var config = {
    //server端口
    port: 5017,

    //replace功能，可替换指定变量
    replace: [
        {
            name: 'environment',
            value: function(args) {
                //return args.environment;
                return args.mode == 2 ? args.environment : '$$_environment_$$';
            },
        },
        {
            name: 'wx_appid',
            value: function(args) {
                return args.mode == 2 ? '' : '$$_wx_appid_$$';
            },
        },
        {
            name: 'spider_a',
            value: function(args) {
                return args.mode == 2 ? '' : '$$_spider_a_$$';
            },
        },
        {
            name: 'app_name',
            value: function(args) {
                return args.mode == 2 ? '' : '$$_app_name_$$';
            },
        },
        {
            name: 'app_code',
            value: function(args) {
                return args.mode == 2 ? '' : '$$_app_code_$$';
            },
        },
    ],
};
module.exports = config;
