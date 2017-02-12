let app = getApp()

Page({
  data: {
    pageIndex: 1,
    pageSize: 10,
    quotationsList: [],
    empty: false,
    windowHeight:'',
    snsId: ''
  },
  onLoad() {
    let that = this;

        // 设置 snsId
    let snsId = wx.getStorageSync('snsId')
    this.data.snsId = snsId

    try {
      var res = wx.getSystemInfoSync();
      this.pixelRatio = res.pixelRatio;
      this.apHeight = 16;
      this.offsetTop = 80;
      this.setData({windowHeight: res.windowHeight + 'px'})
    } catch (e) {

    }

    this.setData({
      quotationsList: []
    })

    this.setData({
      pageIndex: 1,
    })

    this.requestQuotationsList(this.data.pageIndex, this.data.pageSize, {
      success: function(res) {
        let empty = res.content.length === 0
        that.setData({
          empty: empty,
          quotationsList: that.data.quotationsList.concat(res.content)
        })
      },
      fail: function() {

      },
      complete: function() {

      }
    });
  },
  onReady() { },
  onShow() {
    let quotation = app.fuckingLarryNavigatorTo.quotation
    let source = app.fuckingLarryNavigatorTo.source

    if (quotation && typeof quotation === 'object') {
      if (source === 'quotationDetail') {
        /// 报价列表页面也换过来
        wx.navigateTo({
          url: '../quotationDetail/quotationDetail?quotation=' + JSON.stringify(quotation),
          success: function(res) { },
          fail: function() { },
          complete: function() {
            app.fuckingLarryNavigatorTo.quotation = null
            app.fuckingLarryNavigatorTo.source = null
          }
        })
      } else {
        /// 找车路径切换过来
        wx.navigateTo({
          url: '../quotationDetail/quotationDetail?quotation=' + JSON.stringify(quotation),
          success: function(res) { },
          fail: function() { },
          complete: function() {
            app.fuckingLarryNavigatorTo.quotation = null
            app.fuckingLarryNavigatorTo.source = null
          }// complete
        })
      }
    }
  },
  onHide() { },
  onUnload() { },
  onShareAppMessage() { },
  onReachBottom() {
    // 上拉加载更多
    let that = this

    let originPageIndex = this.data.pageIndex
    let newPageIndex = this.data.pageIndex + 1

    this.requestQuotationsList(newPageIndex, this.data.pageSize, {
      success: function(res) {
        if (res.content.length === 0) {
          that.data.pageIndex = newPageIndex
          that.setData({
            quotationsList: that.data.quotationsList.concat(res.content)
          })
        } else {
          that.data.pageIndex = originPageIndex
        }

      },
      fail: function() {
        that.data.pageIndex = originPageIndex
      },
      complete: function() {

      }
    });
  },
  onPullDownRefresh() {
    // 下拉刷新
    let that = this

    this.setData({
      pageIndex: 0,
    })

    wx.stopPullDownRefresh()

    this.requestQuotationsList(this.data.pageIndex, this.data.pageSize, {
      success: function(res) {
        that.setData({
          quotationsList: res.content
        })
      },
      fail: function() {

      },
      complete: function() {

      }
    });
  },
  handlerSelectQuotation(e) {
    let quotation = e.currentTarget.dataset.quotation;
    wx.navigateTo({
      url: '../quotationDetail/quotationDetail?quotation=' + JSON.stringify(quotation),
      success: function(res) {
        console.log('quotationDetail 页面跳转成功');
      },
      fail: function() {
        console.log('quotationDetail 页面跳转失败');
      },
      complete: function() {

      }
    });
  },
  /**
   * 获取报价列表
   *
   * @param pageIndex 页面索引号
   * @param pageSize  页面大小
   */
  requestQuotationsList(pageIndex, pageSize, object) {
    if (pageIndex > 0 && pageSize > 0) {
      app.modules.request({
        url: app.config.ymcServerHTTPSUrl + 'sale/quotation',
        data: {
          channel: 'weixin',
          snsId: this.data.snsId,
          pageIndex: pageIndex,
          pageSize: pageSize
        },
        method: 'GET',
        success: function(res){
          object.success(res);
        },
        fail: function() {
          object.fail();
        },
        complete: function() {
          object.complete();
        }
      })
    } else {
      object.fail();
      object.complete();
    }
  }
});
