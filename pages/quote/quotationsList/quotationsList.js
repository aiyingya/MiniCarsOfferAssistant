let config = require('../../../lib/config.js')

Page({
  data: {
    pageIndex: 0,
    pageSize: 10,
    quotationsList: [
      {
        timeString: '3月1日',
        quotations:[
          {
            carName: '宝马1系 2016款 2.0T都市设计套装国V 手自一体(AT)',
            guidePrice: '38万',
            price: '11.68万',
            downPrice: '2万',
            customerMobile: '18516103001',
            hasRead: true
          },
          {
            carName: '宝马1系 2016款 2.0T都市设计套装国V 手自一体(AT)',
            guidePrice: '38万',
            price: '11.68万',
            downPrice: '2万',
            customerMobile: '18516103001',
            hasRead: true
          },
          {
            carName: '宝马1系 2016款 2.0T都市设计套装国V 手自一体(AT)',
            guidePrice: '38万',
            price: '11.68万',
            downPrice: '2万',
            customerMobile: '18516103001',
            hasRead: true
          }
        ]
      },
      {
        timeString: '2月28日',
        quotations:[
          {
            carName: '宝马1系 2016款 2.0T都市设计套装国V 手自一体(AT)',
            guidePrice: '38万',
            price: '11.68万',
            downPrice: '2万',
            customerMobile: '18516103001',
            hasRead: true
          },
          {
            carName: '宝马1系 2016款 2.0T都市设计套装国V 手自一体(AT)',
            guidePrice: '38万',
            price: '11.68万',
            downPrice: '2万',
            customerMobile: '18516103001',
            hasRead: true
          }
        ]
      },
    ]
  },

  onLoad() {
    let that = this;

    this.requestQuotationsList({
      pageIndex: this.data.pageIndex,
      pageSize: this.data.pageSize,
      success: function(res) {
        let data = res.data.data;
        that.setData({
          quotationsList: that.data.quotationsList. data.content
        })
      },
      fail: function() {

      },
      complete: function() {

      }
    });
  },
  handlerSelectQuotation(e) {
    wx.navigateTo({
      url: 'pages/quote/quotationDetail/quotationDetail?quotationId=' + '',
      success: function(res){
        // success
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })
  },

  /**
   * 获取报价列表
   *
   * @param pageIndex 页面索引号
   * @param pageSize  页面大小
   */
  requestQuotationsList(object) {
    if ((!object.pageIndex < 0) && object.pageSize > 0) {
      wx.request({
        url: config.ymcServerHTTPSUrl + 'sale/quotation',
        data: {
          pageIndex: 1,
          pageSize: 10
        },
        method: 'GET',
        header: {
          'content-type': 'application/json'
        },
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
