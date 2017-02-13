let util = require('../../../utils/util.js');
let app = getApp()

Page({
  data: {
    pageIndex: 1,
    pageSize: 10,
    quotationsList: [],
    // {
    //    viewModel: {
    //      sellingPrice: '',
    //      guidePrice: '',
    //      totalPrice: '',
    //      priceChange: {
    //        flag: true,
    //        price: '',
    //      }
    //    },
    // }
    empty: false,
    windowHeight:'',
    snsId: ''
  },
  onLoad() {
    let that = this;

    // 设置 snsId
    app.getUserInfo(function (userInfo) {
      that.data.snsId = userInfo.snsId
    })

    try {
      var res = wx.getSystemInfoSync();
      this.pixelRatio = res.pixelRatio;
      this.apHeight = 16;
      this.offsetTop = 80;
      this.setData({windowHeight: res.windowHeight + 'px'})
    } catch (e) {

    }
  },
  onReady() { },
  onShow() {
    let that = this
    let quotation = app.fuckingLarryNavigatorTo.quotation
    let source = app.fuckingLarryNavigatorTo.source

    if (quotation && typeof quotation === 'object') {
      if (source === 'quotationDetail') {
        this.getData({
          complete: function () {
            that.delayNavigationTo({
              complete: function () {
                /// 报价列表页面也换过来
                wx.navigateTo({
                  url: '../quotationDetail/quotationDetail?quotation=' + JSON.stringify(quotation),
                  success: function (res) {
                  },
                  fail: function () {
                  },
                  complete: function () {
                    app.fuckingLarryNavigatorTo.quotation = null
                    app.fuckingLarryNavigatorTo.source = null
                  }
                })
              }
            })
          }
        })
      } else {
        this.getData({
          complete: function () {
            that.delayNavigationTo({
              complete: function () {
                /// 找车路径切换过来
                wx.navigateTo({
                  url: '../quotationDetail/quotationDetail?quotation=' + JSON.stringify(quotation),
                  success: function (res) {
                  },
                  fail: function () {
                  },
                  complete: function () {
                    app.fuckingLarryNavigatorTo.quotation = null
                    app.fuckingLarryNavigatorTo.source = null
                  }
                })
              }
            })
          }
        })
      }
    } else {
      this.getData({})
    }
  },
  onHide() { },
  onUnload() { },
  onReachBottom() {
    // 上拉加载更多
    let that = this

    let originPageIndex = this.data.pageIndex
    let newPageIndex = this.data.pageIndex + 1

    this.requestQuotationsList(newPageIndex, this.data.pageSize, {
      loadingType: 'none',
      success: function(res) {
        if (res.content.length !== 0) {
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
    this.getData({
      complete: function() {
        wx.stopPullDownRefresh()
      }
    })
  },
  delayNavigationTo(object) {
    wx.showToast({
      title: "正在处理",
      icon: 'loading'
    })
    setTimeout(function () {
      typeof object.complete === 'function' && object.complete()
      wx.hideToast()
    }, 1000)
  },
  getData(object) {
    let that = this
    this.data.pageIndex = 1,
      this.requestQuotationsList(this.data.pageIndex, this.data.pageSize, {
        loadingType: 'none',
        success: function(res) {
          let empty = res.content.length === 0
          that.setData({
            empty: empty,
            quotationsList: res.content
          })
        },
        fail: function() {

        },
        complete: function() {
          typeof object.complete === 'function' && object.complete()
        }
      })
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
        loadingType: object.loadingType,
        data: {
          channel: 'weixin',
          snsId: this.data.snsId,
          pageIndex: pageIndex,
          pageSize: pageSize
        },
        method: 'GET',
        success: function(res){
          let content = res.content
          for (var item of content) {
            let totalPayment = util.priceStringWithUnit(item.totalPayment);
            let sellingPrice = util.priceStringWithUnit(item.quotationItems[0].sellingPrice);
            let guidePrice = util.priceStringWithUnit(item.quotationItems[0].guidePrice);
            let downPrice = util.downPrice(item.quotationItems[0].sellingPrice, item.quotationItems[0].guidePrice)
            let downPriceFlag = downPrice > 0
            let downPriceString = util.priceStringWithUnit(downPrice)
            item.viewModel = {
              totalPayment: totalPayment,
              sellingPrice: sellingPrice,
              guidePrice: guidePrice,
              priceChange: {
                flag: downPriceFlag,
                price: downPriceString
              }
            }
            item.priceChange
          }
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
