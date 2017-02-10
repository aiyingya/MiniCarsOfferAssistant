let sliderWidth = 96 // 需要设置slider的宽度，用于计算中间位置
let util = require('../../../utils/util.js')
const app = getApp()

Page({
  data: {
    // 导航头部数据
    activeIndex: 0,
    slderOffset: 0,
    sliderLeft: 0,

    /* 报价单主体数据 */
    quotation: {
      quotationId: '0',
      draftId: '0',
      quotationName: '',
      quotationItems: [],     // skuId
      hasLoan: true,          // 必传，true/false，boolean，是否贷款
      paymentRatio: 30,       // 首付比例（%），decimal，全款时不传，取值范围0~100
      stages: 3,              // 贷款期数，int，全款时不传
      annualRate: 4.5,        // 贷款年利率（%），decimal，全款时不传，取值范围0~100
      requiredExpenses: 0,    // 必需费用（元），deciaml，取值范围0~999999999,
      otherExpenses: 0,       // 其他费用（元），deciaml，取值范围0~999999999",
      advancePayment: 0,      // 必传，首次支付金额，如果全款则为全款金额",
      monthlyPayment: 0,      // 月供金额，每月还款金额，全款时不传",
      totalPayment: 0,        // 总落地价格
      remark: '',             // "无"
      loginChannel: 'weixin', // 登录渠道
      snsId: '',
      customerMobile: '',
      read: false
    },
    carinfo: {
      discount: 0,            // 73440 元
      externalColorId: '',    // "013211E6-57FC-43DA-889D-782E69BEA5BF"
      externalColorName: '',  // "星光棕"
      internalColorId: '',    // "1B2AA0C6-F698-4CBC-89A5-B51F3498E28F"
      internalColorName: '',  // "黑色"
      price: 0,               // 232560
      priceStr: '',           // "23.26"
      remark: '',             // "无"
      skuId: '',              // "1D71D878-4CBB-4DE7-AEC0-A59A00BEDBE3"
      skuPic: '',             // "/upload/image/original/201512/021043092970.jpg"
      status: '',             // "in_stock"
    }
  },
  onLoad(options) {
    let that = this

    let carinfo = JSON.parse(options.carInfo)

    let quotationItems = [carinfo.skuId]

    this.setData({
      'quotation.quotationItems': quotationItems,
      carinfo: carinfo
    })

    /// 初始化自定义组件
    this.$wuxDialog = App.wux(this).$wuxDialog

    /// 车价格
    let advancePayment = 150109;
    let monthlyPayment = 8243;
    let totalPaymentByLoan = util.totalPaymentByLoan(this.data.quotation.annualRate, this.data.quotation.stages);
    this.setData({
      'quotation.advancePayment': advancePayment,
      'quotation.monthlyPayment': monthlyPayment,
      'quotation.totalPaymentByLoan': totalPaymentByLoan
    });

    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          sliderLeft: (res.windowWidth / 2 - sliderWidth) / 2,
          sliderOffset: res.windowWidth / 2 * that.data.activeIndex
        });
      }
    });
  },
  onReady() {

  },
  onShow() {

  },
  onHide() {

  },
  onUnload() {

  },
  onShareAppMessage() {

  },
  onReachBottom() {

  },
  onPullDownRefresh() {

  },
  // event handler
  handlerTabClick(e) {
    let hasLoan = (e.currentTarget.id === '0')
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id,
      'quotation.hasLoan': hasLoan
    });
  },
  handlerSaveQuotationDraft(e) {
    let that = this;

    this.requestSaveQuotationDraft(this.data.quotation, {
      success: function (res) {
        let quotationDraft = res
        that.setData({
          quotation: quotationDraft
        })

        // 请求成功后弹出对话框
        const hideDialog = that.$wuxDialog.open({
          title: '保存成功',
          content: '分享给客户',
          phoneNumberPlaceholder: '输入对方11位手机号码',
          confirmText: '分享',
          cancelText: '暂不分享',
          confirm: (res) => {
            let mobile = res.mobile
            that.requestPublishQuotation(that.data.quotation.draftId, mobile, {
              success: (res) => {
                wx.switchTab({
                  url: '../quotationsList/quotationsList',
                  success: (res) => {

                  },
                  fail: () => {

                  },
                  complete: () => {

                  }
                })
              },
              fail: () => {
                //
              },
              complete: () => {

              }
            })
          },
          cancel: () => {
            wx.switchTab({
              url: '../quotationsList/quotationsList',
              success: (res) => {

              },
              fail: () => {

              },
              complete: () => {

              }
            })
          }
        })

      },
      fail: function () {

      },
      complete: function () {

      }
    });
  },

  /**
   * 发布当前报价草稿到某个用户
   *
   * @param draftId         草稿id
   * @param customerMobile  客户手机号
   * @param object          回调对象
   *
   {
    "quotationId":"报价单ID",
    "draftId":"报价单草稿ID",
    "quotationName":"报价单名称，没有可以不传",
    "quotationItems":[{
        "itemNumber":"商品编号",
        "itemName":"商品名称",
        "specifications":"商品规格",
        "guidePrice":"指导价",
        "sellingPrice":"售价"
    }, {
        "itemNumber":"商品编号",
        "itemName":"商品名称",
        "specifications":"商品规格",
        "guidePrice":"指导价",
        "sellingPrice":"售价"
    }],
    "hasLoan":"必传，true/false，boolean，是否贷款",
    "paymentRatio":"首付比例（%），decimal，全款时没有，取值范围0~100",
    "stages":"贷款期数，int，全款时没有",
    "annualRate":"贷款年利率（%），decimal，全款时没有，取值范围0~100",
    "requiredExpenses":"必需费用（元），deciaml，取值范围0~999999999",
    "otherExpenses":"其他费用（元），deciaml，取值范围0~999999999",
    "advancePayment":"首次支付金额，如果全款则为全款金额",
    "monthlyPayment":"月供金额，每月还款金额，全款时没有",
    "remark":"备注",
    "loginChannel":"必传，登录渠道，目前固定为weixin",
    "snsId":"必传，由上报微信用户信息的API返回",
    "customerMobile":"客户手机号"
   }
   */
  requestPublishQuotation(draftId, customerMobile, object) {
    if (draftId && draftId !== '' && customerMobile && customerMobile !== '') {
      app.modules.request({
        url: app.config.ymcServerHTTPSUrl + 'sale/quotation',
        data: {
          draftId: draftId,
          customerMobile: customerMobile
        },
        method: 'POST',
        // header: {}, // 设置请求的 header
        success: function(res) {
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
    }
  },

  /**
   * 生成报价草稿
   *
   * @param quotationDraft 编辑的报价草稿数据
   * @param object          回调对象
   *
   {
   "quotationName":"报价单名称，没有可以不传",
   "quotationItems":[
       "商品编号/skuId，数组至少要有一项",
       "商品编号/skuId"
   ],
   "hasLoan":"必传，true/false，boolean，是否贷款",
   "paymentRatio":"首付比例（%），decimal，全款时不传，取值范围0~100",
   "stages":"贷款期数，int，全款时不传",
   "annualRate":"贷款年利率（%），decimal，全款时不传，取值范围0~100",
   "requiredExpenses":"必需费用（元），deciaml，取值范围0~999999999",
   "otherExpenses":"其他费用（元），deciaml，取值范围0~999999999",
   "advancePayment":"必传，首次支付金额，如果全款则为全款金额",
   "monthlyPayment":"月供金额，每月还款金额，全款时不传",
   "remark":"备注"
   }
   */
  requestSaveQuotationDraft(quotationDraft, object) {
    console.log(quotationDraft);
    if (quotationDraft && typeof quotationDraft === 'object') {
      app.modules.request({
        url: app.config.ymcServerHTTPSUrl + 'sale/quotation/draft',
        data: quotationDraft,
        method: 'POST',
        success: function(res) {
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

    }
  }
});