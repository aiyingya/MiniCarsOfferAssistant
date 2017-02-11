let util = require('../../../utils/util.js')
const app = getApp()

Page({
  data: {
    // 导航头部数据
    activeIndex: 0,
    slderOffset: 0,
    sliderLeft: 0,

    /* 贷款报价单主体数据 */
    withLoan: {
      quotation: {
        quotationId: '0',
        draftId: '0',
        quotationName: '',
        quotationItems: [{
          skuId: '',
          sellingPrice: 0
        }],     // skuId
        hasLoan: true,          // 必传，true/false，boolean，是否贷款
        paymentRatio: 30,       // 首付比例（%），decimal，全款时不传，取值范围0~100
        stages: 3,              // 贷款期数，int，全款时不传
        expenseRate: 4,         // 贷款费率（%），decimal，全款时不传，取值范围0~100
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
        read: false,
      },
      downPrice: '',            // 1.9 万
      downPoint: '',            // 6 点
      /// 表单相关
      paymentRatiosArray: [10, 20, 30, 40, 50, 60, 70, 80, 90],
      paymentRatiosIndex: 2,
      stagesArray: [1, 2, 3],
      stagesIndex: 2
    },

    /* 全款报价单主体数据 */
    withoutLoan: {
      quotation: {
        quotationId: '0',
        draftId: '0',
        quotationName: '',
        quotationItems: [{
          skuId: '',
          sellingPrice: 0
        }],     // skuId
        hasLoan: false,          // 必传，true/false，boolean，是否贷款
        requiredExpenses: 0,    // 必需费用（元），deciaml，取值范围0~999999999,
        otherExpenses: 0,       // 其他费用（元），deciaml，取值范围0~999999999",
        advancePayment: 0,      // 必传，首次支付金额，如果全款则为全款金额",
        totalPayment: 0,        // 总落地价格
        remark: '',             // "无"
        loginChannel: 'weixin', // 登录渠道
        snsId: '',
        customerMobile: '',
        read: false,
      },
      downPrice: '',            // 1.9 万
      downPoint: '',            // 6 点
    },
    carSKUInfo: {
      skuId: '',              // "1D71D878-4CBB-4DE7-AEC0-A59A00BEDBE3"
      skuPic: '',             // "/upload/image/original/201512/021043092970.jpg"
      externalColorId: '',    // "013211E6-57FC-43DA-889D-782E69BEA5BF"
      externalColorName: '',  // "星光棕"
      internalColorId: '',    // "1B2AA0C6-F698-4CBC-89A5-B51F3498E28F"
      internalColorName: '',  // "黑色"
      price: 0,               // 232560
      priceStr: '',           // "23.26"
      discount: 0,            // 73440 元
      status: '',             // "in_stock"
      remark: '',             // "无"
    },
    carModelInfo: {
      carModelId: '',         // "C5997556-CAB7-47F8-A2E6-21026C2EF082",
      carModelName: '',       // "宝马1系 2015款 120i 运动设计套装 欧V（符合国V标准）",
      officialPrice: 0,       // 306000,
      officialPriceStr: '',   // "30.60",
      lowestPriceSku: {
        skuId: '',            // "023010CE-65CC-47B6-A7A2-A59A00BEDC79",
        skuPic: '',           // "/upload/image/original/201512/021043356647.jpg",
        externalColorId: '',  // "C869C59C-E619-47FB-8A7C-F5BB24932F6E",
        externalColorName: '',// "绯红色",
        internalColorId: '',  // "1B2AA0C6-F698-4CBC-89A5-B51F3498E28F",
        internalColorName: '',// "黑色",
        price: 0,             // 232560,
        priceStr: '',         // "23.26",
        discount: 0,          // 73440,
        status: '',           // "no_stock",
        remark: ''            // "无"
      },
      count: ''               // "7.34"
    }
  },
  onLoad(options) {
    let that = this

    var carSKUInfo = JSON.parse(options.carInfo)
    let carModelInfo = JSON.parse(options.carModelsInfo)

    /**
     * 这里需要注意：
     * 当页面从 `车源详情` 过来时，carSKUInfo 和 carModelInfo 是同事存在的
     *
     * 当页面从 `首页` 所有联想中的 SPU 立即报价过来，是没有 carSKUInfo 字段的，所以必须使用 carModelInfo 中
     * lowestPriceSku 字段来设置 carSKUInfo 字段
     */
    if (!(carSKUInfo && typeof carSKUInfo === 'object')) {
      carSKUInfo = carModelInfo.lowestPriceSku
    }

    /// 拼装图片链接
    carSKUInfo.skuPic = app.config.imgAliyuncsUrl + carSKUInfo.skuPic

    // 设置报价表单数据
    let quotationItems = [
      {
        skuId: carSKUInfo.skuId,
        sellingPrice: carSKUInfo.price
      }
    ]

    this.setData({
      'withLoan.quotation.quotationItems': quotationItems,
      'withoutLoan.quotation.quotationItems': quotationItems,
      carSKUInfo: carSKUInfo,
      carModelInfo: carModelInfo
    })

    /// 初始化自定义组件
    this.$wuxDialog = app.wux(this).$wuxDialog

    this.updateForSomeReason()

    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          sliderLeft: 0,
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
  updateForSomeReason() {

    if (this.isLoanTabActive()) {
      /// 车贷款和全款的价格价格
      let carPrice = this.data.withLoan.quotation.quotationItems[0].sellingPrice
      let paymentRatio = this.data.withLoan.quotation.paymentRatio
      let expennseRate = this.data.withLoan.quotation.expenseRate
      let requiredExpenses = this.data.withLoan.quotation.requiredExpenses
      let otherExpenses = this.data.withLoan.quotation.otherExpenses
      let stages = this.data.withLoan.quotation.stages

      console.log(carPrice + paymentRatio + expennseRate + requiredExpenses + requiredExpenses + stages)

      let totalPaymentByLoan = util.totalPaymentByLoan(carPrice, paymentRatio, expennseRate, stages * 12, requiredExpenses, otherExpenses)
      let advancePayment = util.advancePaymentByLoan(carPrice, paymentRatio, requiredExpenses, otherExpenses);
      let monthlyLoanPayment = util.monthlyLoanPaymentByLoan(carPrice, paymentRatio, expennseRate, stages * 12);

      let officialPrice = this.data.carModelInfo.officialPrice

      /// 实时计算优惠点数
      let downPrice = (util.downPrice(carPrice, officialPrice) / 10000).toFixed(2)
      let downPoint = util.downPoint(carPrice, officialPrice)

      this.setData({
        'withLoan.quotation.totalPayment': totalPaymentByLoan,
        'withLoan.quotation.advancePayment': advancePayment,
        'withLoan.quotation.monthlyPayment': monthlyLoanPayment,
        'withLoan.downPrice': downPrice,
        'withLoan.downPoint': downPoint
      });
    } else {
      let carPrice = this.data.withoutLoan.quotation.quotationItems[0].sellingPrice
      let requiredExpenses = this.data.withoutLoan.quotation.requiredExpenses
      let otherExpenses = this.data.withoutLoan.quotation.otherExpenses

      let totalPayment = carPrice + requiredExpenses + otherExpenses

      let officialPrice = this.data.carModelInfo.officialPrice

      /// 实时计算优惠点数
      let downPrice = (util.downPrice(carPrice, officialPrice) / 10000).toFixed(2)
      let downPoint = util.downPoint(carPrice, officialPrice)

      this.setData({
        'withoutLoan.quotation.totalPayment': totalPayment,
        'withoutLoan.downPrice': downPrice,
        'withoutLoan.downPoint': downPoint
      })
    }
  },
  isLoanTabActive(e) {
    return this.data.activeIndex == 0
  },
  // event handler
  handlerTabClick(e) {
    let hasLoan = (e.currentTarget.id === '0')
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id,
    });
    this.updateForSomeReason()
  },
  handlerPaymentRatioChange (e) {
    if (this.isLoanTabActive()) {
      this.setData({
        paymentRatiosIndex: e.detail.value,
        'withLoan.quotation.paymentRatios': this.data.withLoan.paymentRatiosArray[e.detail.value]
      })
    }
  },
  handlerStagesChange (e) {
    if (this.isLoanTabActive()) {
      this.setData({
        stagesIndex: e.detail.value,
        'withLoan.quotation.stages': this.data.withLoan.stagesArray[e.detail.value]
      })
    }
  },
  handlerAnnualRateChange (e) {
    if (this.isLoanTabActive()) {
      this.$wuxDialog.open({
        title: '贷款年利率',
        content: '1-100 之间的小数',
        phoneNumber: this.data.withLoan.quotation.annualRate,
        phoneNumberPlaceholder: '输入贷款年利率',
        confirmText: '确定',
        cancelText: '取消',
        confirm: (res) => {
          let annualRate = res.mobile
          this.setData({
            'withLoan.quotation.annualRate': annualRate
          })
          this.updateForSomeReason()
        },
        cancel: () => {
        }
      })
    }
  },
  handlerSellingPriceChange (e) {
    let sellingPrice = 0
    if (this.isLoanTabActive()) {
      sellingPrice = this.data.withLoan.quotation.quotationItems[0].sellingPrice
    } else {
      sellingPrice = this.data.withoutLoan.quotation.quotationItems[0].sellingPrice
    }

    this.$wuxDialog.open({
      title: '裸车价',
      phoneNumber: sellingPrice,
      phoneNumberPlaceholder: '输入裸车价',
      confirmText: '确定',
      cancelText: '取消',
      confirm: (res) => {
        let sellingPrice = res.mobile
        if (isLoanTabActive()) {
          this.setData({
            'withLoan.quotation.quotationItems[0].sellingPrice': sellingPrice
          })
        } else {
          this.setData({
            'withoutLoan.quotation.quotationItems[0].sellingPrice': sellingPrice
          })
        }
        this.updateForSomeReason()
      },
      cancel: () => {
      }
    })
  },
  handlerRequiredExpensesChange (e) {
    let requiredExpenses = 0
    if (this.isLoanTabActive()) {
      requiredExpenses = this.data.withLoan.quotation.requiredExpenses
    } else {
      requiredExpenses = this.data.withoutLoan.quotation.requiredExpenses
    }

    this.$wuxDialog.open({
      title: '必要花费',
      content: '购置税、上牌费、车船税、保险等',
      phoneNumber: requiredExpenses,
      phoneNumberPlaceholder: '输入必要花费',
      confirmText: '确定',
      cancelText: '取消',
      confirm: (res) => {
        let requiredExpenses = res.mobile

        if (isLoanTabActive()) {
          this.setData({
            'withLoan.quotation.requiredExpenses': requiredExpenses
          })
        } else {
          this.setData({
            'withoutLoan.quotation.requiredExpenses': requiredExpenses
          })
        }

        this.updateForSomeReason()
      },
      cancel: () => {
      }
    })
  },
  handlerOtherExpensesChange (e) {
    let otherExpenses = 0
    if (this.isLoanTabActive()) {
      otherExpenses = this.data.withLoan.quotation.otherExpenses
    } else {
      otherExpenses = this.data.withoutLoan.quotation.otherExpenses
    }

    this.$wuxDialog.open({
      title: '其他花费',
      content: '精品费、安装费等',
      phoneNumber: otherExpenses,
      phoneNumberPlaceholder: '输入其他花费',
      confirmText: '确定',
      cancelText: '取消',
      confirm: (res) => {
        let otherExpenses = res.mobile

        if (isLoanTabActive()) {
          this.setData({
            'withLoan.quotation.otherExpenses': otherExpenses
          })
        } else {
          this.setData({
            'withoutLoan.quotation.otherExpenses': otherExpenses
          })
        }

        this.updateForSomeReason()
      },
      cancel: () => {
      }
    })
  },
  handlerRemarkChange (e) {

  },
  handlerSaveQuotationDraft(e) {
    let that = this;

    let quotation = {}
    if (this.isLoanTabActive()) {
      quotation = this.data.withLoan.quotation
    } else {
      quotation = this.data.withoutLoan.quotation
    }

    this.requestSaveQuotationDraft(quotation, {
      success: function (res) {
        let quotationDraft = res

        // 请求成功后弹出对话框
        // TODO: 无论分享与否， 都要跳转到 `报价记录` tab 页面的详情页面
        const hideDialog = that.$wuxDialog.open({
          title: '保存成功',
          content: '分享给客户',
          phoneNumberPlaceholder: '输入对方11位手机号码',
          confirmText: '分享',
          cancelText: '暂不分享',
          confirm: (res) => {
            let mobile = res.mobile
            that.requestPublishQuotation(quotationDraft.draftId, mobile, {
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
    }
    ],
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