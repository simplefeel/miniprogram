var base = require('base/dist/base'),
    util = require('./util/index'),
    config = require('./config/index'),
    login = require('login/dist/index'),
    helper = require('./helper/index'),
    spider = require('mina-spider/src/index');

var common = {
    util: base.core.extend(util, base.util),
    helper: base.core.extend(helper, base.helper),
    core: base.core,
    date: base.date,
    config: config,
    login: login,
    spider: spider,
};

module.exports = common;
