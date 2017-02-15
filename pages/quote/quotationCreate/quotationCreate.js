let util = require('../../../utils/util.js')
const app = getApp()

Page({
  data: {
    // 导航头部数据
    activeIndex: 0,
    slderOffset: 0,
    sliderLeft: 0,
    tabHeight: 40,
    windowHeight: '',
    /* 贷款报价单主体数据 */
    quotation: {
      quotationId: '0',
      draftId: '0',
      quotationName: '',
      quotationItems: [{
        itemNumber: '',
        sellingPrice: 0
      }],     // skuId
      hasLoan: true,          // 必传，true/false，boolean，是否贷款
      paymentRatio: 30,       // 首付比例（%），decimal，全款时不传，取值范围0~100
      stages: 3,              // 贷款期数，int，全款时不传
      expenseRate: 4,         // 贷款费率（%），decimal，全款时不传，取值范围0~100
      requiredExpenses: 0,    // 必需费用（元），deciaml，取值范围0~999999999,
      otherExpenses: 0,       // 其他费用（元），deciaml，取值范围0~999999999",
      advancePayment: 0,      // 必传，首次支付金额，如果全款则为全款金额",
      monthlyPayment: 0,      // 月供金额，每月还款金额，全款时不传",
      totalPayment: 0,        // 总落地价格
      remark: '',             // "无"
      loginChannel: '', // 登录渠道
      snsId: '',
      read: false,
    },
    priceChange: {
      flag: 0,             // 1 为上， 0 为未增加, -1 为下
      price: '',              // 1.9 万
      point: ''
    },
    /// 表单相关
    paymentRatiosArray: [10, 20, 30, 40, 50, 60, 70, 80, 90],
    paymentRatiosIndex: 2,
    stagesArray: [1, 2, 3],
    stagesIndex: 2,
    /// SKU 数据
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
    // SPU 数据
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
    },
    source: ''                // carModels/carSources/quotationDetail/
  },
  onLoad(options) {
    let that = this
    try {
      let res = wx.getSystemInfoSync();
      let tabHeight = res.windowHeight - 44;
      this.apHeight = 16;
      this.offsetTop = 80;
      this.setData({
        tabHeight: tabHeight + 'px',
        windowHeight: res.windowHeight + 'px'
      })
    } catch (e) {

    }

    let quotationJSONString = options.quotation
    let carSKUInfoJSONString = options.carInfo
    let carModelInfoJSONString = options.carModelsInfo

    if (quotationJSONString && quotationJSONString.length) {
      /***
       * 来源页面来自于详情页面， 参数中有 quotation
       */
      this.data.source = 'quotationDetail'
      var quotation = JSON.parse(quotationJSONString)

      if (quotation.hasLoan) {
        let stagesIndex = this.data.stagesArray.indexOf(quotation.stages)
        let paymentRatiosIndex = this.data.paymentRatiosArray.indexOf(quotation.paymentRatio)
        // 需要初始化设置已经设置的还款周期和首付比率
        this.setData({
          activeIndex: quotation.hasLoan? 0: 1,
          quotation: quotation,
          stagesIndex: stagesIndex,
          paymentRatiosIndex: paymentRatiosIndex
        })
      } else {
        // 对于是全款的情况， 需要手动设置贷款的相应参数数据
        quotation.paymentRatio = 30
        quotation.stages =  3
        quotation.expenseRate = 4
        this.setData({
          activeIndex: quotation.hasLoan? 0: 1,
          'quotation': quotation,
        })
      }
    } else {
      if (carModelInfoJSONString && carModelInfoJSONString.length) {
        let carModelInfo = JSON.parse(options.carModelsInfo)
        var carSKUInfo = {}
        if (carSKUInfoJSONString && carSKUInfoJSONString.length) {
          /**
           * 页面来自于车源列表
           */
          this.data.source = 'carSources'
          carSKUInfo = JSON.parse(options.carInfo)
        } else {
          /**
           * 页面来自于车系列表, 是没有 carSKUInfo 字段的，所以必须使用 carModelInfo 中
           * lowestPriceSku 字段来设置 carSKUInfo 字段
           */
          this.data.source = 'carModels'
          carSKUInfo = carModelInfo.lowestPriceSku
        }

        // 设置报价表单数据
        let quotationItems = [
          {
            itemNumber: carSKUInfo.skuId,
            itemName: carModelInfo.carModelName,
            itemPic: app.config.imgAliyuncsUrl + carSKUInfo.skuPic,
            specifications: carSKUInfo.externalColorName + '/' + carSKUInfo.internalColorName,
            guidePrice: carModelInfo.officialPrice,
            sellingPrice: carSKUInfo.price
          }
        ]

        this.setData({
          'quotation.quotationItems': quotationItems,
          carSKUInfo: carSKUInfo,
          carModelInfo: carModelInfo
        })
      }
    }

    /**
     * 公共行为
     */
    // 设置 snsId
    app.getUserInfo(function (userInfo) {
      console.log(userInfo)
      that.data.quotation.snsId = userInfo.snsId
      that.data.quotation.loginChannel = userInfo.loginChannel
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
		let changeCarsColorSTUInfo = wx.getStorageSync('changeCarsColorSTUInfo')
		
		if(changeCarsColorSTUInfo) {
			let specifications = `${changeCarsColorSTUInfo.externalColorName}/${changeCarsColorSTUInfo.internalColorName}`
			let sellingPrice = changeCarsColorSTUInfo.price
			let itemNumber = changeCarsColorSTUInfo.skuId
			let skuPic = `${app.config.imgAliyuncsUrl}${changeCarsColorSTUInfo.skuPic}`
      console.log('quotationCreate.onShow')
      console.log(changeCarsColorSTUInfo)
			this.setData({
				carSKUInfo: changeCarsColorSTUInfo,
				'quotation.quotationItems[0].specifications': specifications,
				'quotation.quotationItems[0].sellingPrice': sellingPrice,
				'quotation.quotationItems[0].itemNumber': itemNumber,
				'quotation.quotationItems[0].itemPic': skuPic
			})
      this.updateForSomeReason()
      try {
        wx.removeStorageSync('changeCarsColorSTUInfo')
      } catch (e) {
        // Do something when catch error
      }
		}
  },
  onHide() {

  },
  onUnload() {
  },
  onReachBottom() {

  },
  onPullDownRefresh() {

  },
  updateForSomeReason() {

    let carPrice = this.data.quotation.quotationItems[0].sellingPrice
    let officialPrice = this.data.quotation.quotationItems[0].guidePrice
    let requiredExpenses = this.data.quotation.requiredExpenses
    let otherExpenses = this.data.quotation.otherExpenses

    let paymentRatio = this.data.quotation.paymentRatio
    let expenseRate = this.data.quotation.expenseRate
    let stages = this.data.quotation.stages

    let monthlyPayment
    let totalPayment
    let advancePayment
    if (this.isLoanTabActive()) {
      totalPayment = util.totalPaymentByLoan(carPrice, paymentRatio, expenseRate, stages * 12, requiredExpenses, otherExpenses)
      advancePayment = util.advancePaymentByLoan(carPrice, paymentRatio, requiredExpenses, otherExpenses);
      monthlyPayment = util.monthlyLoanPaymentByLoan(carPrice, paymentRatio, expenseRate, stages * 12);
    } else {
      totalPayment = carPrice + otherExpenses + requiredExpenses
      advancePayment = carPrice
      monthlyPayment = 0
    }

    /// 实时计算优惠点数
    let downPrice = util.downPrice(carPrice, officialPrice)
    let downPriceFlag = util.downPriceFlag(downPrice);
    let downPriceString = util.priceStringWithUnit(downPrice)
    let downPoint = util.downPoint(carPrice, officialPrice).toFixed(0)

    console.log(downPriceFlag)

    this.setData({
      'quotation.totalPayment': Math.floor(totalPayment),
      'quotation.advancePayment': Math.floor(advancePayment),
      'quotation.monthlyPayment': Math.floor(monthlyPayment),
      'quotation.hasLoan': this.isLoanTabActive(),
      priceChange: {
        flag: downPriceFlag,
        price: downPriceString,
        point: downPoint
      }
    });
  },
  isLoanTabActive(e) {
    return this.data.activeIndex == 0
  },
  // event handler
  handlerTabClick(e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id,
    });
    this.updateForSomeReason()
  },
  handlerPaymentRatioChange (e) {
    this.setData({
      'paymentRatiosIndex': e.detail.value,
      'quotation.paymentRatio': this.data.paymentRatiosArray[e.detail.value]
    })
    this.updateForSomeReason()
  },
  handlerStagesChange (e) {
    this.setData({
      'stagesIndex': e.detail.value,
      'quotation.stages': this.data.stagesArray[e.detail.value]
    })
    this.updateForSomeReason()
  },
  handlerExpenseRateChange (e) {
    let that = this

    this.$wuxDialog.open({
      title: '贷款费率',
      content: '费率(%)',
      inputNumber: this.data.quotation.expenseRate,
      inputNumberPlaceholder: '输入贷款年利率',
      inputType: 'digit',
      confirmText: '确定',
      cancelText: '取消',
      validate: (e) => {
        if (e.detail.value > 0) {
          return true
        } else {
          return false
        }
      },
      confirm: (res) => {
        let expenseRate = Number(res.inputNumber)
        that.setData({
          'quotation.expenseRate': expenseRate
        })
        that.updateForSomeReason()
      },
      cancel: () => {
      }
    })
  },
  handlerSellingPriceChange (e) {
    let that = this

    let sellingPrice = this.data.quotation.quotationItems[0].sellingPrice

    this.$wuxDialog.open({
      title: '裸车价',
      inputNumber: sellingPrice,
      inputNumberPlaceholder: '输入裸车价',
      inputNumberMaxLength: 9,
      confirmText: '确定',
      cancelText: '取消',
      confirm: (res) => {
        let sellingPrice = Number(res.inputNumber)
        that.setData({
          'quotation.quotationItems[0].sellingPrice': sellingPrice
        })
        that.updateForSomeReason()
      },
      cancel: () => {
      }
    })
  },
  handlerRequiredExpensesChange (e) {
    let that = this

    let requiredExpenses = this.data.quotation.requiredExpenses

    this.$wuxDialog.open({
      title: '必要花费',
      content: '购置税、上牌费、车船税、保险等',
      inputNumber: requiredExpenses,
      inputNumberPlaceholder: '输入必要花费',
      inputNumberMaxLength: 9,
      confirmText: '确定',
      cancelText: '取消',
      confirm: (res) => {
        let requiredExpenses = Number(res.inputNumber)

        that.setData({
          'quotation.requiredExpenses': requiredExpenses
        })

        that.updateForSomeReason()
      },
      cancel: () => {
      }
    })
  },
  handlerOtherExpensesChange (e) {
    let that = this

    let otherExpenses = this.data.quotation.otherExpenses

    this.$wuxDialog.open({
      title: '其他花费',
      content: '精品费、安装费等',
      inputNumber: otherExpenses,
      inputNumberPlaceholder: '输入其他花费',
      inputNumberMaxLength: 9,
      confirmText: '确定',
      cancelText: '取消',
      confirm: (res) => {
        let otherExpenses = Number(res.inputNumber)

        that.setData({
          'quotation.otherExpenses': otherExpenses
        })

        that.updateForSomeReason()
      },
      cancel: () => {
      }
    })
  },
  handlerRemarkChange (e) {
    let remark = e.detail.value
    this.setData({
      'quotation.remark': remark
    })
  },
  handlerSaveQuotationDraft(e) {
    let that = this;

    let quotation = this.data.quotation

    this.requestSaveQuotationDraft(quotation, {
      success: function (res) {
        let quotationDraft = res
        // 请求成功后弹出对话框
        const hideDialog = that.$wuxDialog.open({
          title: '保存成功',
          content: '发送给客户',
          inputNumberPlaceholder: '输入对方手机号码',
          confirmText: '发送报价单',
          cancelText: '暂不发送',
          validate: function (e) {
            let mobile = e.detail.value
            return mobile.length === 11
          },
          confirm: (res) => {
            let mobile = res.inputNumber
            that.requestPublishQuotation(quotationDraft.draftId, mobile, {
              success: (res) => {
                /// 立即发送报价单
                let quotation = res

                app.fuckingLarryNavigatorTo.quotation = quotation
                app.fuckingLarryNavigatorTo.source = that.data.source

                if (that.data.source === 'quotationDetail') {
                  wx.navigateBack({
                    delta: 2, // 回退前 delta(默认为1) 页面
                    success: function(res){
                      // success
                    },
                    fail: function() {
                      app.fuckingLarryNavigatorTo = null
                    },
                    complete: function() {
                      // complete
                    }
                  })

                } else {
                  wx.switchTab({
                    url: '../quotationsList/quotationsList',
                    success: (res) => {

                    },
                    fail: () => {
                      app.fuckingLarryNavigatorTo = null
                    },
                    complete: () => {

                    }
                  })
                }
              },
              fail: () => {
                //
              },
              complete: () => {

              }
            })
          },
          cancel: () => {
            /// 暂不发送, 不带电话号码发送
            that.requestPublishQuotation(quotationDraft.draftId, null, {
              success: (res) => {
                let quotation = res

                app.fuckingLarryNavigatorTo.quotation = quotation
                app.fuckingLarryNavigatorTo.source = that.data.source

                if (that.data.source === 'quotationDetail') {
                  wx.navigateBack({
                    delta: 2, // 回退前 delta(默认为1) 页面
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
                  wx.switchTab({
                    url: '../quotationsList/quotationsList',
                    success: (res) => {

                    },
                    fail: () => {
                      app.fuckingLarryNavigatorTo = null
                    },
                    complete: () => {

                    }
                  })
                }
              },
              fail: () => {
                //
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
   * @param customerMobile  客户手机号，选项
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
    if (draftId && draftId !== '') {
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
   * 生成报价草稿
   *
   * @param quotationDraft 编辑的报价草稿数据
   * @param object          回调对象
   *
   {
   "quotationName":"报价单名称，没有可以不传",
   "quotationItems":[
      {
        itemNumber: '',
        sellingPrice: ''
      }
   ],
   "hasLoan":"必传，true/false，boolean，是否贷款",
   "paymentRatio":"首付比例（%），decimal，全款时不传，取值范围0~100",
   "stages":"贷款期数，int，全款时不传",
   "requiredExpenses":"必需费用（元），deciaml，取值范围0~999999999",
   "otherExpenses":"其他费用（元），deciaml，取值范围0~999999999",
   "advancePayment":"必传，首次支付金额，如果全款则为全款金额",
   "monthlyPayment":"月供金额，每月还款金额，全款时不传",
   "remark":"备注"
   }
   */
  requestSaveQuotationDraft(quotationDraft, object) {
    if (quotationDraft && typeof quotationDraft === 'object') {
      // FIXME: 直接将提交对象转换为正常的提交对象
      let data = {}
      if (quotationDraft.hasLoan) {
        data = {
          quotationName: quotationDraft.quotationName,
          quotationItems: [{
            itemNumber: quotationDraft.quotationItems[0].itemNumber,
            sellingPrice: quotationDraft.quotationItems[0].sellingPrice
          }],
          hasLoan: quotationDraft.hasLoan,
          paymentRatio: quotationDraft.paymentRatio,
          stages: quotationDraft.stages,
          expenseRate: quotationDraft.expenseRate,
          requiredExpenses: quotationDraft.requiredExpenses,
          otherExpenses: quotationDraft.otherExpenses,
          advancePayment: quotationDraft.advancePayment,
          monthlyPayment: quotationDraft.monthlyPayment,
          totalPayment: quotationDraft.totalPayment,
          remark: quotationDraft.remark,
          loginChannel: quotationDraft.loginChannel,
          snsId: quotationDraft.snsId
        }
      } else {
        data = {
          quotationName: quotationDraft.quotationName,
          quotationItems: [{
            itemNumber: quotationDraft.quotationItems[0].itemNumber,
            sellingPrice: quotationDraft.quotationItems[0].sellingPrice
          }],
          hasLoan: quotationDraft.hasLoan,
          requiredExpenses: quotationDraft.requiredExpenses,
          otherExpenses: quotationDraft.otherExpenses,
          advancePayment: quotationDraft.advancePayment,
          totalPayment: quotationDraft.totalPayment,
          remark: quotationDraft.remark,
          loginChannel: quotationDraft.loginChannel,
          snsId: quotationDraft.snsId
        }
      }
      app.modules.request({
        url: app.config.ymcServerHTTPSUrl + 'sale/quotation/draft',
        data: data,
        method: 'POST',
        success: function(res) {
          object.success(res);
        },
        fail: function(err) {
          object.fail(err);
        },
        complete: function() {
          object.complete();
        }
      })
    } else {
      object.fail({
        alertMessage: "参数验证错误"
      })
      object.complete()
    }
  },
  headlerChangeColor (e) {
    let carModelsInfo = e.currentTarget.dataset.carmodelinfo
    let carSKUInfo = e.currentTarget.dataset.carskuinfo
    let quotation = this.data.quotation

    if (this.data.source === 'quotationDetail') {
      wx.navigateTo({
        url: '../../changeCarColor/changeCarColor?quotation='+JSON.stringify(quotation)
      })
    } else if (this.data.source === 'carSources' || this.data.source === 'carModels') {
      wx.navigateTo({
        url: '../../changeCarColor/changeCarColor?carModelsInfo='+JSON.stringify(carModelsInfo)+'&carSKUInfo='+JSON.stringify(carSKUInfo)
      })
    }
  }
});