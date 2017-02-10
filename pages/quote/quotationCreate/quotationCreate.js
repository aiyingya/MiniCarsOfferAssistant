let sliderWidth = 96 // 需要设置slider的宽度，用于计算中间位置
let config = require('../../../lib/config.js')
let util = require('../../../utils/util.js')
const App = getApp()

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
      quotationItems: [
        {
          itemNumber: '',
          itemName: '',
          specifications: '',
          guidePrice: '',
          sellingPrice: ''
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
      customerMobile: '',
      read: false
    }
  },
  onLoad(options) {
    let that = this

    /// 初始化自定义组件
    this.$wuxDialog = App.wux(this).$wuxDialog

    // TODO: davidfu 需要从车源界面获取车的相关信息
    // let carsinfo = JSON.parse(options.carinfo);

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
  // event handler
  handlerTabClick(e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  handlerSaveQuotationDraft(e) {
    let that = this;

    this.requestSaveQuotationDraft(this.data.quotationDraft, {
      success: function (res) {
        let quotationDraft = res.data.data
        // this.data.quotation = quotationDraft

        // 请求成功后弹出对话框
        const hideDialog = that.$wuxDialog.open({
          title: '保存成功',
          content: '分享给客户',
          phoneNumberPlaceholder: '输入对方11位手机号码',
          confirmText: '分享',
          cancelText: '暂不分享',
          confirm: () => {
            wx.switch({
              url: '../quotationsList/quotationsList',
              success: (res) => {

              },
              fail: () => {

              },
              complete: () => {

              }
            })
          },
          cancel: () => {
            // 跳转
          }
        })

      },
      fail: function () {

      },
      complete: function () {

      }
    });
  },
  handlerPublishQuotation(e) {
    // TODO: davidfu 此处的电话号码应该为从自定义弹窗中获取的值
    let customerMobile = '18516103001';

    this.requestPublishQuotation(this.data.quotationDraft.draftId, customerMobile, {
      success: function (res) {
        let quotation = res.data.data;
        // TODO: davidfu 这里是否需要考虑合并数据到 this.data
      },
      fail: function () {

      },
      complete: function () {

      }
    })
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
      wx.request({
        url: config.ymcServerHTTPSUrl + 'sale/quotation',
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
      wx.request({
        url: config.ymcServerHTTPSUrl + 'sale/quotation/draft',
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