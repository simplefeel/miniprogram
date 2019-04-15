const app = getApp();
Component({
    /**
     * 组件的属性列表
     */
    properties: {},

    lifetimes: {
        attached() {},
        detached() {},
    },

    /**
     * 组件的初始数据
     */
    data: {},

    /**
     * 组件的方法列表
     */
    methods: {
        addCount() {
            // app.eventBus.emit('add-count');
            app.pageModel.get('pages/communicate/index').addCount();
        },
    },
});
