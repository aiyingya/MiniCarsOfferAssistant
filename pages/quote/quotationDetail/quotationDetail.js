let sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
let util = require('../../../utils/util.js');
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
      quotationItems: [
        {
          itemNumber: '',
          itemName: '',
          itemPic: '',
          specifications: '',
          guidePrice: '',
          sellingPrice: '',
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
    },
    // 编辑状态
    edit: false
  },
  onLoad(options) {
    let that = this;

    /// 初始化自定义组件
    this.$wuxDialog = App.wux(this).$wuxDialog

    // TODO: davidfu 需要从车源界面获取车的相关信息
    let quotation = JSON.parse(options.quotation);
    this.setData({
      quotation: quotation
    })

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
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  handlerEditQuotation(e) {
    let that = this
    // TODO: 解除编辑态, 底部按钮应该变为完成
    this.setData({
      edit: !that.data.edit
    })
  },
  handlerContactWithCustomer(e) {
    let that = this;
    wx.makePhoneCall({
      phoneNumber: this.data.quotation.customerMobile,
      success: (res) => {
        console.log('拨打电话' + that.data.quotation.customerMobile + '成功');
      }
    })
  },
  //
  handlerShareToCustomer(e) {
    let that = this;

    const hideDialog = this.$wuxDialog.open({
      title: '保存成功',
      content: '分享给客户',
      phoneNumberPlaceholder: '输入对方11位手机号码',
      confirmText: '分享',
      cancelText: '暂不分享',
      confirm: (res) => {
        let mobile = res.mobile
        that.requestPublishQuotation(that.data.draftId, mobile, {
          success: (res) => {
            // TODO: 发布报价单成功
          },
          fail: () => {
            //
          },
          complete: () => {

          }
        })
      },
      cancel: () => {

      }
    })
  },
  // 非编辑态下的订车按钮
  handlerBookCar(e) {
    let that = this;

    const hideDialog = this.$wuxDialog.open({
      title: '发起订车后， 将会有工作人员与您联系',
      content: '',
      phoneNumberPlaceholder: '输入您的手机号',
      confirmText: '发起订车',
      cancelText: '取消',
      confirm: (res) => {
        let mobile = res.mobile
        that.requestBookCar(that.data.quotationId, mobile, {
          success: (res) => {
            // TODO: 发起订车成功
          },
          fail: () => {

          },
          complete: () => {

          }
        })
      },
      cancel: () => {
        // TODO: 取消
      }
    })
  },
  // 编辑态下的完成按钮
  handlerSaveQuotationDraft(e) {
    let that = this;

    this.requestSaveQuotationDraft(this.data.quotationDraft, {
      success: function (res) {
        let quotationDraft = res
        // this.data.quotation = quotationDraft

        // 请求成功后弹出对话框
        const hideDialog = that.$wuxDialog.open({
          title: '保存成功',
          content: '分享给客户',
          phoneNumberPlaceholder: '输入对方11位手机号码',
          confirmText: '分享',
          cancelText: '暂不分享',
          confirm: (res) => {
            let mobile = res.mobile
            that.requestPublishQuotation(that.data.draftId, mobile, {
              success: (res) => {
                // TODO: 分享成功
                let quotation = res;
                // TODO: davidfu 这里是否需要考虑合并数据到 this.data
              },
              fail: () => {

              },
              complete: () => {

              }
            })
          },
          cancel: () => {
            // TODO: 暂不分享
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
   * 发起订车当前报价草稿到某个用户
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
    if (quotationDraft && typeof quotationDraft === 'object') {
      app.modules.request({
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
  },

  /**
   * 根据报价 id 获取报价详情
   *
   * @param quotationId 需要获取的报价 id
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
  requestQuotationDetail(quotationId, object) {
    if (quotationId && quotationId !== '') {
      app.modules.request({
        url: config.ymcServerHTTPSUrl + 'sale/quotation/' + quotationId,
        data: {},
        method: 'GET',
        success: function(res){

        },
        fail: function() {
          // fail
        },
        complete: function() {
          // complete
        }
      })
    } else {
      fail();
      complete();
    }
  },

  /**
   * 编辑报价草稿
   *
   * @param draftId   编辑的报价草稿 id
   * @param quotation 编辑的报价草稿数据
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
  // requestEditQuotationDraft(draftId, quotation, object) {
  //   if (draftId && draftId !== '' && quotation && typeof quotation === 'object') {
  //     wx.request({
  //       url: config.ymcServerHTTPSUrl + 'sale/quotation/draft/' + draftId,
  //       data: quotation,
  //       method: 'PUT', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
  //       // header: {}, // 设置请求的 header
  //       success: function(res){
  //         // success
  //       },
  //       fail: function() {
  //         // fail
  //       },
  //       complete: function() {
  //         // complete
  //       }
  //     })
  //   } else {
  //     // 参数验证失败
  //   }
  // },

  /**
   * 发起订车行为
   *
   * @param quotationId
   * @param customerMobile
   * @param object
   */
  requestBookCar(quotationId, customerMobile, object) {
    if (quotationId && quotationId !== '' && customerMobile && customerMobile !== '') {
      app.modules.request({
        url: config.ymcServerHTTPSUrl + 'sale/quotation/order',
        data: {
          quotationId: quotationId,
          mobile: customerMobile
        },
        method: 'GET',
        success: function(res){
          object.success()
        },
        fail: function() {
          object.fail()
        },
        complete: function() {
          object.complete()
        }
      })
    } else {
      object.fail()
      object.complete()
    }
  }
})