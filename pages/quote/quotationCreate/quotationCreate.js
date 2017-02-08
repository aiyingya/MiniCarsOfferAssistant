var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
    data: {
        // 导航头部数据
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,
        // 底部内容数据
        body: {}
    },
    onLoad() {
        var self = this;
        wx.getSystemInfo({
            success: function(res) {
                self.setData({
                    sliderLeft: (res.windowWidth / 2 - sliderWidth) / 2,
                    sliderOffset: res.windowWidth / 2 * self.data.activeIndex
                });
            }
        });
    },
    // event handler
    handlerTabClick(e) {
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id
        });
    }
});