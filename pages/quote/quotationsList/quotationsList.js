let config = require('../../../lib/config.js')

Page({
    onLoad() {

    },
    
    /**
     * 获取报价列表
     */
    requestQuotationsList(pageIndex, pageSize) {
        if ((!pageIndex < 0) && pageSize > 0) {
        wx.request({
          url: config.ymcServerHTTPSUrl + 'sale/quotation',
          data: {
              pageIndex: 1,
              pageSize: 10
              },
          method: 'GET',
          // header: {}, // 设置请求的 header
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
        } else {
            //参数验证失败
        }
    },

    /**
     * 根据报价 id 获取报价详情
     */
    requestQuotationDetail(quotationId) {
        if (!quotationId && quotationId !== '') {
            wx.request({
            url: config.ymcServerHTTPUrl + 'sale/quotation/' + quotationId,
            data: {},
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            // header: {}, // 设置请求的 header
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
        } else {
            // 参数验证失败
        }
    },

    requestPublishQuotationSnapshot(draftId, customerMobile) {
        if (!draftId && draftId !== '' && !customerMobile && customerMobile !== '') {

        } else {

            
        } 
    }
});