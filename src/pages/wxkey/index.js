module.exports = Page({
    data: {
        inputList: [{ sort: 1, value: 1 }, { sort: 2, value: 2 }, { sort: 3, value: 3 }, { sort: 4, value: 4 }],
    },
    onLoad(options) {
        console.log(common);
    },
    onShow() {
        // wx.setStorageSync('wxkey', 1);
        getApp().globalData.count = 1;
    },
    unique() {
        return Math.random() * 10 + 1;
    },
    insertHead() {
        const { inputList } = this.data;
        inputList.unshift({ sort: this.unique(), value: 5 });
        this.setData({
            inputList,
        });
    },
    insertTail() {
        const { inputList } = this.data;
        inputList.push({ sort: this.unique(), value: 5 });
        this.setData({
            inputList,
        });
    },
    insertBetween() {
        const { inputList } = this.data;
        inputList.splice(1, 0, { sort: this.unique(), value: 5 });
        this.setData({
            inputList,
        });
    },
    reverse() {
        const { inputList } = this.data;
        inputList.reverse();
        this.setData({
            inputList,
        });
    },
});
