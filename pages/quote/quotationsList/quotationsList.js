let config = require('../../../lib/config.js')

Page({
  data: {
    pageIndex: 0,
    pageSize: 10,
    quotationsList: [
      {
        quotationId: '0',
        draftId: '0',
        quotationName: '报价单名称，没有可以不传',
        quotationItems: [
          {
            itemNumber: '2131321',
            itemName: '宝马1系 2016款 2.0T都市设计套装国V 手自一体(AT)',
            specifications: '商品规格',
            guidePrice: '14万',
            sellingPrice: '12万'
          }
        ],
        hasLoan: true,          // 必传，true/false，boolean，是否贷款
        paymentRatio: 30,       // 首付比例（%），decimal，全款时不传，取值范围0~100
        stages: 3,              // 贷款期数，int，全款时不传
        annualRate: 4.5,        // 贷款年利率（%），decimal，全款时不传，取值范围0~100
        requiredExpenses: 0,    // 必需费用（元），deciaml，取值范围0~999999999,
        otherExpenses: 0,       // 其他费用（元），deciaml，取值范围0~999999999",
        advancePayment: 0,       // 必传，首次支付金额，如果全款则为全款金额",
        monthlyPayment: 0,        // 月供金额，每月还款金额，全款时不传",
        remark: '',
        loginChannel: 'weixin',
        snsId: '',
        customerMobile: '18516103001',
        read: true
      },
      {
        quotationId: '0',
        draftId: '0',
        quotationName: '报价单名称，没有可以不传',
        quotationItems: [
          {
            itemNumber: '2131321',
            itemName: '宝马1系 2016款 2.0T都市设计套装国V 手自一体(AT)',
            specifications: '商品规格',
            guidePrice: '14万',
            sellingPrice: '12万'
          }
        ],
        hasLoan: true,          // 必传，true/false，boolean，是否贷款
        paymentRatio: 30,       // 首付比例（%），decimal，全款时不传，取值范围0~100
        stages: 3,              // 贷款期数，int，全款时不传
        annualRate: 4.5,        // 贷款年利率（%），decimal，全款时不传，取值范围0~100
        requiredExpenses: 0,    // 必需费用（元），deciaml，取值范围0~999999999,
        otherExpenses: 0,       // 其他费用（元），deciaml，取值范围0~999999999",
        advancePayment: 0,       // 必传，首次支付金额，如果全款则为全款金额",
        monthlyPayment: 0,        // 月供金额，每月还款金额，全款时不传",
        remark: '',
        loginChannel: 'weixin',
        snsId: '',
        customerMobile: '18516103001',
        read: false
      },
      {
        quotationId: '0',
        draftId: '0',
        quotationName: '报价单名称，没有可以不传',
        quotationItems: [
          {
            itemNumber: '2131321',
            itemName: '宝马1系 2016款 2.0T都市设计套装国V 手自一体(AT)',
            specifications: '商品规格',
            guidePrice: '14万',
            sellingPrice: '12万'
          }
        ],
        hasLoan: true,          // 必传，true/false，boolean，是否贷款
        paymentRatio: 30,       // 首付比例（%），decimal，全款时不传，取值范围0~100
        stages: 3,              // 贷款期数，int，全款时不传
        annualRate: 4.5,        // 贷款年利率（%），decimal，全款时不传，取值范围0~100
        requiredExpenses: 0,    // 必需费用（元），deciaml，取值范围0~999999999,
        otherExpenses: 0,       // 其他费用（元），deciaml，取值范围0~999999999",
        advancePayment: 0,       // 必传，首次支付金额，如果全款则为全款金额",
        monthlyPayment: 0,        // 月供金额，每月还款金额，全款时不传",
        remark: '',
        loginChannel: 'weixin',
        snsId: '',
        customerMobile: '18516103001',
        read: false
      },
      {
        quotationId: '0',
        draftId: '0',
        quotationName: '报价单名称，没有可以不传',
        quotationItems: [
          {
            itemNumber: '2131321',
            itemName: '宝马1系 2016款 2.0T都市设计套装国V 手自一体(AT)',
            specifications: '商品规格',
            guidePrice: '14万',
            sellingPrice: '12万'
          }
        ],
        hasLoan: true,          // 必传，true/false，boolean，是否贷款
        paymentRatio: 30,       // 首付比例（%），decimal，全款时不传，取值范围0~100
        stages: 3,              // 贷款期数，int，全款时不传
        annualRate: 4.5,        // 贷款年利率（%），decimal，全款时不传，取值范围0~100
        requiredExpenses: 0,    // 必需费用（元），deciaml，取值范围0~999999999,
        otherExpenses: 0,       // 其他费用（元），deciaml，取值范围0~999999999",
        advancePayment: 0,      // 必传，首次支付金额，如果全款则为全款金额",
        monthlyPayment: 0,      // 月供金额，每月还款金额，全款时不传",
        remark: '',
        loginChannel: 'weixin',
        snsId: '',
        customerMobile: '18516103001',
        read: true
      }
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
