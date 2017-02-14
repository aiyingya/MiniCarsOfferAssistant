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
      expenseRate: 4,
      requiredExpenses: 0,    // 必需费用（元），deciaml，取值范围0~999999999,
      otherExpenses: 0,       // 其他费用（元），deciaml，取值范围0~999999999",
      advancePayment: 0,       // 必传，首次支付金额，如果全款则为全款金额",
      monthlyPayment: 0,        // 月供金额，每月还款金额，全款时不传",
      totalPayment: 0,        // 总落地价格
      remark: '',
      loginChannel: '',
      snsId: '',
      customerMobile: '',
      read: false,
      source: 'quotationDetail'
    },
    priceChange: {
      flag: '',             // true 为上， false 为下
      price: '',              // 1.9 万
      point: ''               // 6 点
    }
  },
  onLoad(options) {
    let that = this;

    /// 初始化自定义组件
    this.$wuxDialog = app.wux(this).$wuxDialog

    let quotation = JSON.parse(options.quotation);
    quotation.quotationItems[0].itemPic = app.config.imgAliyuncsUrl + quotation.quotationItems[0].itemPic

    console.log(quotation)
    let carPrice = quotation.quotationItems[0].sellingPrice
    let officialPrice = quotation.quotationItems[0].guidePrice

    /// 实时计算优惠点数
    let downPrice = util.downPrice(carPrice, officialPrice)
    let downPriceFlag = downPrice > 0 ? '下': '上' // true 为 下， false 为 上
    let downPriceString = util.priceStringWithUnit(downPrice)
    let downPoint = util.downPoint(carPrice, officialPrice).toFixed(0)

    this.setData({
      quotation: quotation,
      priceChange: {
        flag: downPriceFlag,
        price: downPriceString,
        point: downPoint
      }
    })
  },
  onReady() {

  },
  onShow() {

  },
  onHide() {

  },
  onUnload() {

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
    wx.navigateTo({
      url: '../quotationCreate/quotationCreate?quotation=' + JSON.stringify(this.data.quotation),
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
      title: '分享给客户',
      inputNumberPlaceholder: '输入对方11位手机号码',
      confirmText: '分享',
      cancelText: '暂不分享',
      validate: function (e) {
        let mobile = e.detail.value
        return mobile.length === 11
      },
      confirm: (res) => {
        let mobile = res.inputNumber
        that.requestPublishQuotation(that.data.quotation.draftId, mobile, {
          success: (res) => {
            let quotation = res

            app.fuckingLarryNavigatorTo.quotation = quotation
            app.fuckingLarryNavigatorTo.source = that.data.source
            
            wx.navigateBack({
              delta: 1, // 回退前 delta(默认为1) 页面
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
      inputNumberPlaceholder: '输入您的手机号',
      confirmText: '发起订车',
      cancelText: '取消',
      validate: function (e) {
        let mobile = e.detail.value
        return mobile.length === 11
      },
      confirm: (res) => {
        let mobile = res.inputNumber
        that.requestBookCar([that.data.quotation.quotationItems[0].itemNumber], mobile, that.data.quotation.quotationId, {
          success: (res) => {
            wx.showModal({
              content: '提交成功，请保持通话畅通',
              success: function(res) {
                if (res.confirm) {
                  that.headlerRemoveQuoteView()
                }
              }
            })
          },
          fail: (err) => {
            wx.showModal({
              title: '错误',
              content: err.alertMessage,
              success: function(res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                }
              }
            })
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
      object.fail();
      object.complete();
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
        url: app.config.ymcServerHTTPSUrl + 'sale/quotation/' + quotationId,
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
      object.fail();
      object.complete();
    }
  },

  /**
   * 发起订车行为
   *
   * @param skuIds					[String]
   * @param quotationId     可选
   * @param customerMobile  可选
   * @param object
   */
  requestBookCar(skuIds, customerMobile, quotationId, object) {
    if (skuIds && typeof skuIds === 'object' && customerMobile && customerMobile !== '') {
      app.modules.request({
        url: app.config.ymcServerHTTPSUrl + 'sale/quotation/order',
        data: {
          skuIds: skuIds,
          mobile: customerMobile,
          quotationId: quotationId
        },
        method: 'POST',
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