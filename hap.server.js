var koa = require('koa'),
    send = require('koa-send'),
    path = require('path'),
    config = require("./hap.config"),
    app = koa();

var JSON_EXT = ".json";

app.use(function*(next) {
    var filePath,
        requestPath = this.request.path;

    //如果是mock数据
    if (requestPath.indexOf('mock') !== -1) {
        //去除.json后缀，保持与后端接口路径一致
        requestPath += requestPath.endsWith(JSON_EXT) ? "" : JSON_EXT;
    }

    filePath = path.join(process.cwd(), requestPath);

    yield send(this, filePath, {
        root: '/',
        index: 'index.html'
    });
});

app.listen(config.port);
console.log("服务启动。地址 http://h5.dev.weidian.com:" + config.port);
