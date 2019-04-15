// pages/communicate/index.js
const app = getApp();
let firstShow = true;
Page({
    /**
     * 页面的初始数据
     */
    data: {
        count: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        // app.eventBus.on('add-count', this.addCount);
        app.pageModel.add(this);
    },

    goNextPage() {
        wx.navigateTo({
            url: '/pages/wxkey/index',
        });
    },

    addCount() {
        let { count } = this.data;
        count++;
        this.setData({
            count,
        });
    },

    offEvent() {
        app.eventBus.off('add-count', this.addCount);
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        if (firstShow) return;
        // let callBackData = wx.getStorageSync('wxkey');
        let callBackData = getApp().globalData.count;
        if (callBackData) {
            this.setData({
                count: callBackData,
            });
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {
        firstShow = false;
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {},

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {},

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {},

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {},
});
