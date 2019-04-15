var config = require('../config/index'),
    login = require('login/dist/index'),
    base = require('base/dist/base'),
    core = base.core,
    index = require('../index');
var toast = require('toast/dist/toast');

var util = {
    // 5层判断
    goTo: function(url) {
        var count = getCurrentPages().length;
        if (count < 4) {
            wx.navigateTo({
                url: url,
            });
        } else {
            wx.redirectTo({
                url: url,
            });
        }
    },
    buttonClicked: function(self) {
        self.setData({
            buttonClicked: false,
        });
        setTimeout(function() {
            self.setData({
                buttonClicked: true,
            });
        }, 2000);
    },
    // decode querystring
    decodeQuerystring: function(query) {
        if (typeof query == 'object') {
            for (var name in query) {
                if (query.hasOwnProperty(name)) {
                    query[name] && (query[name] = decodeURIComponent(query[name]));
                }
            }
        }
        return query;
    },
    showLoading: function() {
        wx.showToast &&
            wx.showToast({
                title: config.i18n.loading,
                icon: 'loading',
                duration: 5000,
            });
    },
    hideLoading: function() {
        wx.hideToast();
    },
    request: function(opts, reqType) {
        var self = this;
        var requestData = {
            request: opts.data || '',
        };
        if (reqType && reqType == 'thor') {
            requestData = {
                param: opts.data || '',
            };
        }
        return login.request({
            url: opts.url,
            method: opts.method || 'POST',
            dataType: opts.dataType || 'json',
            data: requestData,
            withToken: opts.withToken || true, // 默认传递token
            forceLogin: opts.forceLogin,
            complete: opts.complete,
            success: function() {
                var data = arguments && arguments[0] && arguments[0].data;
                self.successHandler.call(this, data, opts);
            },
            fail: function(rs) {
                login.checkUserAuth({
                    success: function() {
                        var data = arguments && arguments[0] && arguments[0].data;
                        self.failHandler.call(this, data, opts);
                    },
                    fail: function() {
                        return opts.authFail && opts.authFail(rs);
                    },
                });
            },
        });
    },
    successHandler: function(data, opts) {
        var code = data && data.status && data.status.code;
        if (code == 0) {
            opts.success && opts.success.call(this, data);
        } else {
            var f = opts.fail && opts.fail.call(this, data) === false;
            if (f) {
                return;
            }
        }
    },
    failHandler: function(data, opts) {
        var f = opts.fail && opts.fail.call(this, data) === false;
    },

    showModal: function(opts) {
        wx.showModal({
            title: opts.message.title || '提示',
            content: opts.message,
            showCancel: opts.showCancel || false,
        });
    },
    /**
     * 获取vap接口
     * @param url
     * @param type
     */
    getVapApi: function(url, type) {
        if (type === 'collect') {
            return util.getVapUrl() + '/' + index.option('appid') + '/' + url;
        } else {
            return util.getVapUrl() + '/' + index.option('appid') + '/' + url;
        }
    },
    getVapUrl: function() {
        return config.api[index.option('environment')];
    },

    getThorUrl: function(url) {
        return config.thor[index.option('environment')] + '/' + url;
    },
    getStrictTarget: function(environment) {
        if (environment == 1) {
            return '?strictTarget=172.19.39.89:20880';
        }
        return '';
    },
    isInArray: function(array, value) {
        if (array && !array.length) {
            return;
        }
        for (var i = 0; i < array.length; i++) {
            if (value === array[i]) {
                return true;
            }
        }
        return false;
    },
    debounce: function(fn, wait) {
        var timer = null;
        return function() {
            var context = this;
            var args = arguments;
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            timer = setTimeout(function() {
                fn.apply(context, args);
            }, wait);
        };
    },
};
module.exports = util;
