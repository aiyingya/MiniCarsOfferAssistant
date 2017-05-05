import {
  $wuxInputNumberDialog,
  $wuxContentDialog,
  $wuxSpecialUploadDialog
} from "../../../components/wux"
import $wuxSpecificationsDialog from './specificationsDialog/specificationsDialog'
import util from '../../../utils/util'


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
        itemType: 'self', // self/third/party
        itemName: '',
        itemPic: '',
        specifications: '',
        guidePrice: 0,//指导价
        sellingPrice: 0,//卖➕
        originalPrice: 0,//原始➕
        baseSellingPrice: 0//加了利润的原始➕
      }], // skuId
      hasLoan: true, // 必传，true/false，boolean，是否贷款
      paymentRatio: 30, // 首付比例（%），decimal，全款时不传，取值范围0~100
      stages: 3, // 贷款期数，int，全款时不传
      expenseRate: 4, //  贷款的万元系数和月息. 原：贷款费率（%），decimal，全款时不传，取值范围0~100
      requiredExpensesAll: {//必需费用（元），deciaml，取值范围0~999999999,
        purchaseTax:0,//购置
        licenseFee:0,//上牌
        vehicleAndVesselTax:0,//车船
        insuranceAmount:0//保险金额
      },
      otherExpensesAll:{// 其他费用（元），deciaml，取值范围0~999999999",
        boutiqueCost:0,//精品费用
        installationFee:0,//安装费
        serverFee:0,//
        otherFee:0
      },
      insuranceDetail:{
        "iTotal":0,//"保险总额",
        "iJQX":0,//"交强险",
        "iDSZZRX":0,//"第三者责任险",
        "iCLSSX":0,//"车辆损失险",
        "iQCDQX":0,//"全车盗抢险",
        "iBLDDPSX":0,//"玻璃单独破碎险",
        "iZRSSX":0,//"自燃损失险",
        "iBJMPTYX":0,//"不计免赔特约险",
        "iWGZRX":0,//"无过责任险",
        "iCSRYZRX":0,//"车上人员责任险",
        "iCSHHX":0//"车身划痕险"
      },
      advancePayment: 0, // 必传，首次支付金额，如果全款则为全款金额",
      monthlyPayment: 0, // 月供金额，每月还款金额，全款时不传",
      totalPayment: 0, // 总落地价格
      remark: '', // "无"
      read: false
    },
    requestResult:{
      "carPrice":"161600",//显示裸车价= 裸车价+运费+利润
      "oneInterest":5,//"一年期月息",
      "twoInterest": 6,//"二年期月息",
      "threeInterest":7, //"三年期月息",
      "oneWYXS":0.5,//"一年期万元系数",
      "twoWYXS":0.5,//"二年期万元系数",
      "threeWYXS": 0.5,//"三年期万元系数",
      "interestType":1,//"默认选中的贷款方式 1 月息 2 万元系数"
      "carNumberFee":'200'//"上牌服务费"
    },
    expensesAllInfo:[
      {
        type:'requiredfee',
        target:'purchaseTax',//expensesAllEnum上一一对应
        title:'购置税',
        protoname: 'quotation.requiredExpensesAll.purchaseTax',
        price:0//这里需要引用quotation.requiredExpensesAll.purchaseTax的值
      },//购置
      {
        type:'requiredfee',
        target:'licenseFee',
        title:'上牌费用',
        protoname:'quotation.requiredExpensesAll.licenseFee',
        price:0//同上
      },//上牌
      {
        type:'requiredfee',
        target:'vehicleAndVesselTax',
        title:'车船税',
        protoname:'quotation.requiredExpensesAll.vehicleAndVesselTax',
        price:0//同上
      },//车船
      {
        type:'requiredfee',
        target:'insuranceAmount',
        title:'保险金额',
        protoname:'quotation.requiredExpensesAll.insuranceAmount',
        price:0//同上
      },//保险金额
      {
        type:'otherfee',
        target:'boutiqueCost',
        title:'精品费用',
        protoname:'quotation.otherExpensesAll.boutiqueCost',
        price:0//同上
      },//精品费用 其它
      {
        type:'otherfee',
        target:'installationFee',
        title:'安装费',
        protoname:'quotation.otherExpensesAll.installationFee',
        price:0//同上
      },//安装费 其它
      {
        type:'otherfee',
        target:'serverFee',
        title:'服务费',
        protoname:'quotation.otherExpensesAll.serverFee',
        price:0//同上
      },//安装费 其它
      {
        type:'otherfee',
        target:'otherFee',
        title:'其它',
        protoname:'quotation.otherExpensesAll.otherFee',
        price:0//同上
      }//其它
    ],
    priceChange: {
      flag: 0, // 1 为上， 0 为未增加, -1 为下
      price: '', // 1.9 万
      point: ''
    },
    /// 表单相关
    paymentRatiosArray: [10, 20, 30, 40, 50, 60, 70, 80, 90],
    paymentRatiosIndex: 2,
    stagesArray: [1, 2, 3],
    stagesIndex: 2,
    /// SKU 数据
    carSKUInfo: {
      skuId: '', // "1D71D878-4CBB-4DE7-AEC0-A59A00BEDBE3"
      skuPic: '', // "/upload/image/original/201512/021043092970.jpg"
      externalColorId: '', // "013211E6-57FC-43DA-889D-782E69BEA5BF"
      externalColorName: '', // "星光棕"
      internalColorId: '', // "1B2AA0C6-F698-4CBC-89A5-B51F3498E28F"
      internalColorName: '', // "黑色"
      price: 0, // 232560
      priceStr: '', // "23.26"
      discount: 0, // 73440 元
      status: '', // "in_stock"
      remark: '' // "无"
    },
    // SPU 数据
    carModelInfo: {
      carModelId: '', // "C5997556-CAB7-47F8-A2E6-21026C2EF082",
      carModelName: '', // "宝马1系 2015款 120i 运动设计套装 欧V（符合国V标准）",
      officialPrice: 0, // 306000,
      officialPriceStr: '', // "30.60",
      lowestPriceSku: {
        skuId: '', // "023010CE-65CC-47B6-A7A2-A59A00BEDC79",
        skuPic: '', // "/upload/image/original/201512/021043356647.jpg",
        externalColorId: '', // "C869C59C-E619-47FB-8A7C-F5BB24932F6E",
        externalColorName: '', // "绯红色",
        internalColorId: '', // "1B2AA0C6-F698-4CBC-89A5-B51F3498E28F",
        internalColorName: '', // "黑色",
        price: 0, // 232560,
        priceStr: '', // "23.26",
        discount: 0, // 73440,
        status: '', // "no_stock",
        remark: '' // "无"
      },
      count: '' // "7.34"
    },
    source: '', // carModels/carSources/quotationDetail/
    showPreferenceSetting:false,
    isSpecialBranch:false, //宝马、奥迪、MINI展示下xx点
    isOnLoad:true
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


    this.utilsExpensesAllInfo()

    let quotationJSONString = options.quotation
    let carSkuInfoJSONString = options.carSkuInfo
    let carModelInfoJSONString = options.carModelsInfo


    if (quotationJSONString && quotationJSONString.length) {
      /***
       * 来源页面来自于详情页面， 参数中有 quotation
       */
      this.data.source = 'quotationDetail'
      var quotation = util.urlDecodeValueForKeyFromOptions('quotation', options)

      if (quotation.hasLoan) {
        let stagesIndex = this.data.stagesArray.indexOf(quotation.stages)
        let paymentRatiosIndex = this.data.paymentRatiosArray.indexOf(quotation.paymentRatio)
        // 需要初始化设置已经设置的还款周期和首付比率
        this.setData({
          activeIndex: quotation.hasLoan ? 0 : 1,
          quotation: quotation,
          stagesIndex: stagesIndex,
          paymentRatiosIndex: paymentRatiosIndex
        })
      } else {
        // 对于是全款的情况， 需要手动设置贷款的相应参数数据
        quotation.paymentRatio = 30
        quotation.stages = 3
        quotation.expenseRate = res.interestType === 1 ? res.threeInterest : res.threeWYXS

        this.setData({
          activeIndex: quotation.hasLoan ? 0 : 1,
          'quotation': quotation
        })
      }
    } else {
      if (carModelInfoJSONString && carModelInfoJSONString.length) {
        var carModelInfo = util.urlDecodeValueForKeyFromOptions('carModelsInfo', options)
        var carSkuInfo = {}
        if (carSkuInfoJSONString && carSkuInfoJSONString.length) {
          /**
           * 页面来自于车源列表
           */
          this.data.source = 'carSources'
          carSkuInfo = util.urlDecodeValueForKeyFromOptions('carSkuInfo', options)
        } else {
          /**
           * 页面来自于车系列表, 是没有 carSKUInfo 字段的，所以必须使用 carModelInfo 中
           * lowestPriceSku 字段来设置 carSKUInfo 字段
           */
          this.data.source = 'carModels'
          carSkuInfo = carModelInfo.lowestPriceSku
        }

        const itemNumber = carSkuInfo.skuId || ''
        const itemType = carSkuInfo.viewModelSupplierSelfSupport ? 'self' : 'third_party'
        const itemPic = carSkuInfo.skuPic || carModelInfo.pic || ''
        const specifications = carSkuInfo.externalColorName + '/' + carSkuInfo.internalColorName
        const guidePrice = carSkuInfo.officialPrice || carModelInfo.officialPrice
        const originalPrice = carSkuInfo.price || carModelInfo.officialPrice

        const  isShow = that.isShowDownDot(carModelInfo.carModelName)
        this.setData({
          'isSpecialBranch': isShow
        })

        var user = app.userService;
        //获取报价单接口
        app.saasService.getCreatCarRecordInfo({
          data:{
            "userId": user.auth.userId,
            "carPrice":originalPrice
          },
          success: (res) => {
            this.setData({
              'requestResult': res
            })
            let sellingPrice = res.carPrice;
            this.setData({
              'quotation.requiredExpensesAll.licenseFee':res.carNumberFee
            })

            // 设置报价表单数据
            let quotationItems = [{
              itemNumber: itemNumber,
              itemType: itemType,
              itemName: carModelInfo.carModelName,
              itemPic: itemPic,
              specifications: specifications,
              guidePrice: guidePrice,
              sellingPrice: sellingPrice,
              originalPrice: originalPrice,
              baseSellingPrice: sellingPrice
            }]
            this.setData({
              'quotation.quotationItems': quotationItems,
              carSKUInfo: carSkuInfo,
              carModelInfo: carModelInfo
            })

            this.updateForSomeReason()

            wx.getSystemInfo({
              success: function (res) {
                that.setData({
                  sliderLeft: 0,
                  sliderOffset: res.windowWidth / 2 * that.data.activeIndex
                });
              }
            });

          },
          fail: () => {},
          complete: () => {}
        });
      }
    }

  },
  onReady() {},
  onShow() {
    //判断是否需要显示报价偏好设置
    this.setData({
      showPreferenceSetting: (app.userService.isSetPreference() === "false")
    })
    console.log(app.userService.isSetPreference())
    if(this.data.isOnLoad){
      this.setData({
        isOnLoad: false
      })
      return;
    }

    const _insurances = wx.getStorageSync("insurancesAll")? JSON.parse(wx.getStorageSync("insurancesAll")):null

    let insuranceDetail = {
      "iTotal":0,//"保险总额",
      "iJQX":0,//"交强险",
      "iDSZZRX":0,//"第三者责任险",
      "iCLSSX":0,//"车辆损失险",
      "iQCDQX":0,//"全车盗抢险",
      "iBLDDPSX":0,//"玻璃单独破碎险",
      "iZRSSX":0,//"自燃损失险",
      "iBJMPTYX":0,//"不计免赔特约险",
      "iWGZRX":0,//"无过责任险",
      "iCSRYZRX":0,//"车上人员责任险",
      "iCSHHX":0//"车身划痕险"
    }

    if(!_insurances){
      return
    }

    _insurances.businessInsurances.forEach((item,index)=> {
      if(!item.checked){
        return
      }
      if(item.name === '第三方责任险'){
        insuranceDetail.iDSZZRX = item.amount
        return
      }
      if(item.name === '车辆损失险'){
        insuranceDetail.iCLSSX = item.amount
        return
      }
      if(item.name === '全车盗抢险'){
        insuranceDetail.iQCDQX = item.amount
        return
      }
      if(item.name === '玻璃单独破碎险'){
        insuranceDetail.iBLDDPSX = item.amount
        return
      }
      if(item.name === '自燃损失险'){
        insuranceDetail.iZRSSX = item.amount
        return
      }
      if(item.name === '不计免赔特约险'){
        insuranceDetail.iBJMPTYX = item.amount
        return
      }
      if(item.name === '无过责任险'){
        insuranceDetail.iWGZRX = item.amount
        return
      }
      if(item.name === '车上人员责任险'){
        insuranceDetail.iCSRYZRX = item.amount
        return
      }
      if(item.name === '车身划痕险'){
        insuranceDetail.iCSHHX = item.amount
        return
      }
    })
    insuranceDetail.iTotal = _insurances.insuranceTotal
    insuranceDetail.iJQX = _insurances.trafficInsurance

    this.setData({
      'quotation.insuranceDetail': insuranceDetail
    })

    this.setData({
      'quotation.requiredExpensesAll.insuranceAmount': _insurances.insuranceTotal
    })
    this.insuranceUpdate(_insurances.insuranceTotal)//保险金额修改

  },
  onHide() {},
  onUnload() {},
  onReachBottom() {},
  onPullDownRefresh() {},
  isShowDownDot(name){
    if(name.indexOf('宝马') >-1 || name.indexOf('奥迪')>-1 || name.indexOf('MINI')>-1){
      return true;
    }
    return false;
  },
  updateForSomeReason() {
    let that = this
    this.utilsExpensesAllInfo()

    let requiredExpenses = 0
    var _temp1 = this.data.quotation.requiredExpensesAll
    for(let key of Object.keys(_temp1)){
      requiredExpenses += _temp1[key]
    }

    let otherExpenses = 0
    var _temp2 = this.data.quotation.otherExpensesAll
    for(let key of Object.keys(_temp2)){
      otherExpenses += _temp2[key]
    }

    let carPrice = this.data.quotation.quotationItems[0].sellingPrice
    let officialPrice = this.data.quotation.quotationItems[0].guidePrice

    let paymentRatio = this.data.quotation.paymentRatio
    let expenseRate = this.data.quotation.expenseRate
    let stages = this.data.quotation.stages

    let monthlyPayment
    let totalPayment
    let advancePayment
    if (this.isLoanTabActive()) {
      let isMonth = (that.data.requestResult.interestType===1);
      const wRate = isMonth ? (10000/(stages*12) + expenseRate * 10) : expenseRate//万元系数
      advancePayment = util.advancePaymentByLoan(carPrice, paymentRatio, requiredExpenses, otherExpenses);
      monthlyPayment = util.monthlyLoanPaymentByLoan(carPrice, paymentRatio, wRate);

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
      activeIndex: e.currentTarget.id
    });
    this.updateForSomeReason()
  },
  handlerPaymentRatioChange(e) {
    this.setData({
      'paymentRatiosIndex': e.detail.value,
      'quotation.paymentRatio': this.data.paymentRatiosArray[e.detail.value]
    })
    this.updateForSomeReason()
  },
  handlerStagesChange(e) {
    let that = this
    this.setData({
      'stagesIndex': e.detail.value,
      'quotation.stages': this.data.stagesArray[e.detail.value]
    })
    const isMonth = this.data.requestResult.interestType;

    let year = this.data.stagesArray[e.detail.value];
    var expenseRate = this.data.quotation.expenseRate;
    const rateObj= this.data.requestResult;
    switch (year){
      case 1:
        expenseRate = isMonth ? rateObj.oneInterest : rateObj.oneWYXS
        break;
      case 2:
        expenseRate = isMonth ? rateObj.twoInterest : rateObj.twoWYXS
        break;
      case 3:
        expenseRate = isMonth ? rateObj.threeInterest : rateObj.threeWYXS
        break;
    }
    that.setData({
      'quotation.expenseRate': Number(expenseRate)
    })
    this.updateForSomeReason()
  },
  handlerExpenseRateChange(e) {
    let that = this
   let con = that.data.requestResult.interestType===1 ? '月息（厘）':'万元系数（元）';
    $wuxInputNumberDialog.open({
      title: '贷款月息或万元系',
      content: con,
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
      cancel: () => {}
    })
  },
  handlerSellingPriceChange(e) {
    let that = this

    const _guidePrice = this.data.quotation.quotationItems[0].guidePrice
    const _sellingPrice = this.data.quotation.quotationItems[0].sellingPrice
    const _baseSellingPrice = this.data.quotation.quotationItems[0].baseSellingPrice

    var _downPrice = Number(_guidePrice - _sellingPrice)
    $wuxInputNumberDialog.open({
      title: '裸车价',
      inputNumber: _downPrice,
      content: "￥" + _baseSellingPrice,
      inputNumberPlaceholder: '输入裸车价',
      inputNumberMaxLength: 9,
      confirmText: '确定',
      cancelText: '取消',
      priceStyle: true,
      confirm: (res) => {

        let downPrice = Number(res.inputNumber)

        that.setData({
          'quotation.quotationItems[0].sellingPrice': Number(_guidePrice - downPrice)
        })
        that.updateForSomeReason()
      },
      cancel: () => {}
    })
  },
  handlerExpensesChange(e) {
    let that = this
    var expensesInfo = e.currentTarget.dataset.feetype

    let requiredExpenses = this.data.quotation.requiredExpenses
    const carModelsInfoKeyValueString = util.urlEncodeValueForKey('carModelInfo', this.data.carModelInfo)
    if(expensesInfo.title === '保险金额') {
      wx.navigateTo({
        url: `../../insurance/insurance?${carModelsInfoKeyValueString}`
      })
    }else {
      $wuxInputNumberDialog.open({
        title: expensesInfo.title,
        content: expensesInfo.title,
        inputNumber: expensesInfo.price ? expensesInfo.price : "",
        inputNumberPlaceholder: '输入'+expensesInfo.title,
        inputNumberMaxLength: 9,
        confirmText: '确定',
        cancelText: '取消',
        confirm: (res) => {
          let price = Number(res.inputNumber)
          //这里如何写入插值变量
          that.setData({
            [expensesInfo.protoname] : price
          })
          that.updateForSomeReason()

        },
        cancel: () => {}
      })
    }
  },
  handlerRemarkChange(e) {
    let remark = e.detail.value
    this.setData({
      'quotation.remark': remark
    })
  },
  handlerSaveQuotationDraft(e) {
    let that = this;
    let quotation ={}
    quotation = Object.assign({}, quotation, that.data.quotation)

    function isSendRequest (quotationDraft,mobile,name,sex) {

      app.saasService.requestPublishQuotation(quotationDraft.draftId, mobile,name,sex ,{
        success: (res) => {
          let quotation1 = res

          app.fuckingLarryNavigatorTo.quotation = quotation1
          app.fuckingLarryNavigatorTo.source = that.data.source

          if (that.data.source === 'quotationDetail') {
            wx.navigateBack({
              delta: 2, // 回退前 delta(默认为1) 页面
              success: function (res) {
                // success
              },
              fail: function () {
                // fail
                if(mobile){
                  app.fuckingLarryNavigatorTo.source = null
                  app.fuckingLarryNavigatorTo.quotation = null
                }
              },
              complete: function () {
                // complete
              }
            })
          } else {
            wx.switchTab({
              url: '/pages/usersQuote/usersQuote',
              success: (res) => {

              },
              fail: () => {
                app.fuckingLarryNavigatorTo.source = null
                app.fuckingLarryNavigatorTo.quotation = null
              },
              complete: () => {

              }
            })
          }
        },
        fail: () => {
          console.log("fail 保存报价单失败")
        },
        complete: () => {}
      })
    }

    // 请求成功后弹出对话框
    $wuxSpecialUploadDialog.open({
      title: '保存并分享！',
      content: '分享给客户',
      inputNumberPlaceholder: '输入对方的手机号码',
      inputNumberPlaceholder1: '姓名（选填）',
      radioNames: [
        {name: 1, value: '先生', checked: 'true'},
        {name: 0, value: '女士'}
      ],
      defaultRadio:1,
      confirmText: '发送报价单',
      cancelText: '仅保存',
      validate: function (e) {
        let mobile = e.detail.value
        return mobile.length === 11
      },
      confirm: (res) => {
        let mobile = res.inputNumber
        let customerName =res.inputName
        let customerSex = res.inputSex
        //保存报价单
        app.saasService.requestSaveQuotationDraft(quotation, {
          success: function (res) {
            let quotationDraft = res
            //发送报价单
            isSendRequest(quotationDraft,mobile,customerName,customerSex)
          },
          fail: function () {},
          complete: function () {}
        })
      },
      cancel: () => {
        //保存报价单
        app.saasService.requestSaveQuotationDraft(quotation, {
          success: function (res) {
            let quotationDraft = res
            /// 暂不发送, 不带电话号码发送（发布当前报价草稿到某个用户） 保留1.5以前的逻辑
            isSendRequest(quotationDraft,null,null,null)
          },
          fail: function () {},
          complete: function () {}
        })
      }
    })
  },
  headlerChangeColor(e) {
    const that = this
    const specifications = this.data.quotation.quotationItems[0].specifications
    const array = specifications.split('/')

    const externalColorName = array[0]
    const internalColorName = array[1]
    // 输入车源
    $wuxSpecificationsDialog.open({
      title: '配色',
      content: '填写 外饰/内饰 颜色',
      externalColorName: externalColorName,
      internalColorName: internalColorName,
      confirmText: '确定',
      cancelText: '取消',
      confirm: (externalColorName, internalColorName) => {
        that.setData({
          'quotation.quotationItems[0].specifications': externalColorName + '/' + internalColorName
        })
      },
      cancel: () => {

      }
    })
  },
  goPreferenceSetting(e) {
    wx.navigateTo({
      url: `../../setCost/setCost`
    })
  },
  utilsExpensesAllInfo(){
    //把必须其它金额，赋值给expensesAllInfo对象，用于页面显示金额
    const that = this
    const _requiredExpensesAll = that.data.quotation.requiredExpensesAll
    const _otherExpensesAll = that.data.quotation.otherExpensesAll

    that.data.expensesAllInfo.forEach(({target},index) =>{
      let flag = false
      for(let key of Object.keys(_requiredExpensesAll)){

        if(target == key){
          that.setData({
            ['expensesAllInfo['+index+'].price'] : _requiredExpensesAll[key]
          })
          flag = true
        }
      }
      if(flag){
        return
      }
      for(let key of Object.keys(_otherExpensesAll)){
        if(target == key){
          that.setData({
            ['expensesAllInfo['+index+'].price'] : _otherExpensesAll[key]
          })
        }
      }
    })
  },
  insuranceUpdate(mount){
    const that = this
    let flag = false
    that.data.expensesAllInfo.forEach(({target},index) =>{
      if(!flag && target == 'insuranceAmount'){
        that.setData({
          ['expensesAllInfo['+index+'].price'] : mount
        })
      }
    })
  },
  lookIncome(){
    let carPrice = this.data.quotation.quotationItems[0].sellingPrice
    let paymentRatio = this.data.quotation.paymentRatio
    var user = app.userService;
    app.saasService.getProfit({
      "userId": user.auth.userId,
      "loanNum": util.loanPaymentByLoan1(carPrice, paymentRatio),
      "insuranceNum": this.data.quotation.requiredExpensesAll.insuranceAmount
    },
     {
       success: (res) => {
         $wuxContentDialog.open({
           title: '收益详情',
           totleContent: {name:'总利润约',value:'￥'+res.totalProfit},
           detailContent: [
             {name:'裸车价收益约',value:'￥'+ res.profit},
             {name:'保险收益约',value:'￥'+res.insuranceProfit},
             {name:'贷款收益约',value:'￥'+res.loanProfit}
           ]
         })
       },
       fail:() => {},
       complete: () => {},
      }
    );

  }
});
