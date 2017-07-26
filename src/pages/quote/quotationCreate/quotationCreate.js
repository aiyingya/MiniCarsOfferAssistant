import {
  $wuxInputNumberDialog,
  $wuxContentDialog,
  $wuxSpecialUploadDialog
} from "../../../components/wux"
import $wuxSpecificationsDialog from './specificationsDialog/specificationsDialog'
import util from '../../../utils/util'
import { container } from '../../../landrover/business/index'

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
      loanFee:0,//贷款手续费
      saleMobile:"",//销售手机号
      quotationItems: [{
        itemType: 'self', // self/third/party
        itemName: '',
        itemPic: '',
        specifications: '',
        guidePrice: 0,//指导价
        sellingPrice: 0,//卖的价格
        originalPrice: 0,//原始最低价格（据说是行情价）
        baseSellingPrice: 0//加了利润的原始最低价格
      }], // skuId
      hasLoan: true, // 必传，true/false，boolean，是否贷款
      paymentRatio: 30, // 首付比例（%），decimal，全款时不传，取值范围0~100
      stages: 3, // 贷款期数，int，全款时不传
      expenseRate: 4, //  贷款的万元系数和月息. 原：贷款费率（%），decimal，全款时不传，取值范围0~100
      requiredExpensesAll: {//必需费用（元），deciaml，取值范围0~999999999,
        purchaseTax:0,//购置
        licenseFee:0,//上牌
        vehicleAndVesselTax:0,//车船
        insuranceAmount:0,//保险金额
        metallicPaintFee:0//金属漆
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
        "iCSHHX":0,//"车身划痕险"
        "carSize":0,//"车辆规格"
        "iDSZZRX_INDEX":3,
        "iBLDDPSX_INDEX":0,
        "iCSHHX_INDEX":1
      },
      advancePayment: 0, // 必传，首次支付金额，如果全款则为全款金额",
      monthlyPayment: 0, // 月供金额，每月还款金额，全款时不传",
      totalPayment: 0, // 总落地价格
      loanInterest:0,//贷款利息
      remark: '', // "无"
      read: false,
      x: 0,
      y: 0
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
      "carNumberFee":'200',//"上牌服务费"
      "loanFee":0, //贷款服务费
      "validTime":{
        "firstChoose":24,
        "secondChoose":48,
        "chooseWho":1
      }
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
        title:'代收上牌费',
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
        type:'requiredfee',
        target:'metallicPaintFee',
        title:'金属漆加价',
        protoname:'quotation.requiredExpensesAll.metallicPaintFee',
        price:0//同上
      },//金属漆
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
        price:0
      },
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
    initPoint:'',
    initSellingPrice:0,
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
      count: '', // "7.34"
      capacity:null,//排量
      isElectricCar:false//是否纯电动车
    },
    source: '', // carModels/carSources/quotationDetail/
    showPreferenceSetting:false,
    isSpecialBranch:false, //宝马、奥迪、MINI展示下xx点
    isOnLoad:true,
    diffPrice:0,//是否加价卖
    isShowTextarea:true,
    businessRisks:'',
    /**
     *根据spu规格计算保险
     */
    spuStandard: {
      /**
       * 6座以下.
       */
      spuUnderSix: {
        /**
         * 第三者责任险.
         */
        liability: {
          '5': 638,
          '10': 920,
          '20': 1141,
          '30': 1265,
          '50': 1546,
          '100': 2012
        },
        /**
         * 车辆损失险基础保费.
         */
        vehicleBasis: 539,
        /**
         * 全车盗抢险.
         */
        vehicleDQ: {
          basisPremium: 120,
          rate: 0.0049
        },
        /**
         * 玻璃单独破碎险
         */
        glassBroken: [0.002,0.0033],
        /**
         * 车上人员责任险
         */
        personnelCarRate: 0.0069
      },
      /**
       * 6座以上.
       */
      spuAboveSix: {
        /**
         * 第三者责任险.
         */
        liability: {
          '5': 590,
          '10': 831,
          '20': 1014,
          '30': 1178,
          '50': 1352,
          '100': 1760
        },
        /**
         * 车辆损失险基础保费.
         */
        vehicleBasis: 646,
        /**
         * 全车盗抢险.
         */
        vehicleDQ: {
          basisPremium: 140,
          rate: 0.0044
        },
        /**
         * 玻璃单独破碎险
         */
        glassBroken: [0.002,0.0033],
        /**
         * 车上人员责任险
         */
        personnelCarRate: 0.0066
      }
    },
    /**
     * 根据裸车价算车身划痕险.
     */
    scratches: {
      '2000': {
        one: 400,
        two: 585,
        three: 850
      },
      '5000': {
        one: 570,
        two: 900,
        three: 1100
      },
      '10000': {
        one: 760,
        two: 1170,
        three: 1500
      },
      '20000': {
        one: 1140,
        two: 1780,
        three: 2250
      }
    },
    canIUse:{
      movablearea:false
    },
    contentDialogFun:null,
    touchStatus:0, //0.无状态 1.点击了按钮 2.移动了按钮
    getProfitResult:{}
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

    this.setData({
      'canIUse.movablearea': wx.canIUse ? wx.canIUse('movable-area') : false
    })

    let quotationJSONString = options.quotation
    let carSkuInfoJSONString = options.carSkuInfo
    let carModelInfoJSONString = options.carModelsInfo

    function activeIndexCss () {
      wx.getSystemInfo({
        success: function (res) {
          that.setData({
            sliderLeft: 0,
            sliderOffset: res.windowWidth / 2 * that.data.activeIndex
          });
        }
      });
    }

    if (quotationJSONString && quotationJSONString.length) {
      /***
       * 来源页面来自于详情页面， 参数中有 quotation
       */
      this.data.source = 'quotationDetail'
      var quotation = util.urlDecodeValueForKeyFromOptions('quotation', options)

      if (quotation.hasLoan) {
        let stagesIndex = this.data.stagesArray.indexOf(quotation.stages)
        let paymentRatiosIndex = this.data.paymentRatiosArray.indexOf(quotation.paymentRatio)

        that.setExpenseRate(that.data.stagesArray[stagesIndex])
        // 需要初始化设置已经设置的还款周期和首付比率
        this.setData({
          activeIndex: quotation.hasLoan ? 0 : 1,
          stagesIndex: stagesIndex,
          paymentRatiosIndex: paymentRatiosIndex
        })

      } else {
        // 对于是全款的情况， 需要手动设置贷款的相应参数数据
        quotation.paymentRatio = 30
        quotation.stages = 3

        this.setData({
          activeIndex: quotation.hasLoan ? 0 : 1
        })
      }

      quotation.requiredExpensesAll = {//必需费用（元），deciaml，取值范围0~999999999,
        purchaseTax:quotation.purchaseTax || 0,//购置
        licenseFee:quotation.carNumFee || 0,//上牌
        vehicleAndVesselTax:quotation.carTax || 0,//车船
        insuranceAmount:quotation.insuranceDetail.iTotal || 0,//保险金额
        metallicPaintFee: quotation.metallicPaintFee || 0//金属漆
      }

      quotation.otherExpensesAll = {// 其他费用（元），deciaml，取值范围0~999999999",
        boutiqueCost:quotation.boutiqueFee || 0,//精品费用
        installationFee:quotation.installFee || 0,//安装费
        serverFee:quotation.serviceFee || 0,//服务费
        otherFee:quotation.otherFee || 0
      }

      const isShow = that.isShowDownDot(quotation.quotationItems[0].itemName)

      // 保险相关.
      const insuranceDetail = quotation.insuranceDetail

      this.setData({
        'isSpecialBranch': isShow,
        'quotation': quotation,
        'quotation.quotationItems[0].baseSellingPrice': quotation.carPrice,
        'carModelsInfo.sellingPrice': quotation.carPrice,
        'quotation.quotationItems[0].originalPrice':quotation.marketPrice,
        'carModelInfo.capacity':quotation.carCapacity,
        'carModelInfo.isElectricCar':quotation.electricCar
      })
      console.log(quotation.insuranceDetail)
      //获取报价单接口
      container.saasService.getCreatCarRecordInfo({ carPrice: 0 }) // 随便传一个金额，该接口我不需要加价后的裸车价
        .then(res => {
          res.interestType = quotation.rateType;
          that.setData({
            'requestResult': res
          })
          if (!quotation.hasLoan) {
            //初始化贷款手续费
            this.setData({
              'quotation.loanFee': res.loanFee
            })
          }
          that.updateForSomeReason()
          activeIndexCss()
        })

      const promise1 = that.getDefaultInsurance()
      const promise = Promise.race([promise1])
      promise
        .then(res => {
          //wx.hideToast()
        }, err => {
          //wx.hideToast()
        })
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
        const specifications = (carSkuInfo.externalColorName || '-') + '/' + (carSkuInfo.internalColorName || '-')
        const guidePrice = carSkuInfo.officialPrice || carModelInfo.officialPrice

        const originalPrice = carSkuInfo.showPrice || carSkuInfo.viewModelQuoted.price// || carModelInfo.officialPrice

        const  isShow = that.isShowDownDot(carModelInfo.carModelName)
        var user = container.userService;
        this.setData({
          'quotation.requiredExpensesAll.metallicPaintFee': carSkuInfo.metallicPaintAmount || 0,
          'quotation.saleMobile':user.mobile,
          isSpecialBranch: isShow
        })

        //获取报价单接口
        container.saasService.getCreatCarRecordInfo({ carPrice: originalPrice })
          .then(res => {
            this.setData({
              'requestResult': res
            })

            let sellingPrice = res.carPrice;
            const capacity = carModelInfo.capacity
            const isElectricCar = carModelInfo.isElectricCar
            this.setData({
              'quotation.requiredExpensesAll.licenseFee': res.carNumberFee || 0,
              'quotation.loanFee': res.loanFee || 0,
              'quotation.otherExpensesAll.serverFee': res.serviceFee || 0,
              'quotation.requiredExpensesAll.purchaseTax': Math.floor(util.purchaseTax(sellingPrice, isElectricCar ? null : capacity))
            })

            // 设置报价表单数据
            let quotationItems = [{
              itemNumber: itemNumber,
              itemType: itemType,
              itemName: carModelInfo.carModelName,
              itemPic: itemPic,
              specifications: specifications,
              guidePrice: guidePrice,
              sellingPrice: Math.floor(sellingPrice),
              originalPrice: originalPrice,
              baseSellingPrice: Math.floor(sellingPrice)
            }]
            carModelInfo.sellingPrice = sellingPrice
            this.setData({
              'quotation.quotationItems': quotationItems,
              carSKUInfo: carSkuInfo,
              carModelInfo: carModelInfo
            })
            console.log(carModelInfo)

            that.initVehicleAndVesselTax().then(data => {
              // 计算默认保险.
              const promise1 = that.getDefaultInsurance()
              const promise = Promise.race([promise1])
              promise.then(res => {
                //wx.hideToast()
                that.updateForSomeReason()
              }, err => {
                //wx.hideToast()
              })
            })

            activeIndexCss()
            this.setExpenseRate(this.data.stagesArray[this.data.stagesIndex])

          })
      }
    }
  },
  onReady() {},
  onShow() {
    //判断是否需要显示报价偏好设置
    this.setData({
      showPreferenceSetting: (container.userService.isSetPreference() === "false")
    })
    console.log(container.userService.isSetPreference())
    if(this.data.isOnLoad){
      this.setData({
        isOnLoad: false
      })
      return
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
      "iCSHHX":0,//"车身划痕险"
      "carSize":0,//"车辆规格"
      "iDSZZRX_INDEX":3,
      "iBLDDPSX_INDEX":0,
      "iCSHHX_INDEX":1
    }

    if(!_insurances){
      return
    }

    _insurances.businessInsurances.forEach((item,index)=> {
      if(!item.checked){
        return
      }
      if(item.name === '第三者责任险'){
        insuranceDetail.iDSZZRX = item.amount
        insuranceDetail.iDSZZRX_INDEX = item.index
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
        insuranceDetail.iBLDDPSX_INDEX = item.index
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
        insuranceDetail.iCSHHX_INDEX = item.index
        return
      }
    })
    insuranceDetail.iTotal = _insurances.insuranceTotal
    insuranceDetail.iJQX = _insurances.trafficInsurance
    insuranceDetail.carSize = _insurances.saddleValue//： 0 6座一下 1 6座以上;
    this.setData({
      'quotation.insuranceDetail': insuranceDetail
    })

    this.setData({
      'quotation.requiredExpensesAll.insuranceAmount': _insurances.insuranceTotal
    })
    this.insuranceUpdate(_insurances.insuranceTotal)//保险金额修改
    setTimeout(() => {
      this.updateForSomeReason()
    }, 0);
  },
  onHide() {},
  onUnload() {
    // 页面卸载，清除保险金额.
    try {
      wx.removeStorageSync('insurancesAll')
    } catch (e) {

    }
  },
  onReachBottom() {},
  onPullDownRefresh() {},
  tap: function(e) {
    this.setData({
      x: 30,
      y: 30
    });
  },
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
    let otherExpenses = 0

    const _loanServerFee = this.data.quotation.loanFee
    var _temp1 = this.data.quotation.requiredExpensesAll
    for(let key of Object.keys(_temp1)){
      requiredExpenses += Number(_temp1[key])
    }

    var _temp2 = this.data.quotation.otherExpensesAll
    for(let key of Object.keys(_temp2)){
      otherExpenses += Number(_temp2[key])
    }
    otherExpenses += _loanServerFee



    let carPrice = this.data.quotation.quotationItems[0].sellingPrice
    let officialPrice = this.data.quotation.quotationItems[0].guidePrice

    let paymentRatio = this.data.quotation.paymentRatio
    let stages = this.data.quotation.stages

    let expenseRate = this.data.quotation.expenseRate

    let monthlyPayment
    let totalPayment
    let advancePayment
    let loanInterest
    if (this.isLoanTabActive()) {
      let isMonth = (that.data.requestResult.interestType===1);
      if(expenseRate === undefined){
        expenseRate = that.setExpenseRate(stages)
      }
      const wRate = isMonth ? util.tranMonthToW(expenseRate,stages) : expenseRate//万元系数
      const monthRate = isMonth ? expenseRate : util.tranWToMonth(expenseRate,stages)//万元系数
      totalPayment = util.totalPaymentByLoan(carPrice, paymentRatio, monthRate, stages * 12, requiredExpenses, otherExpenses)
      advancePayment = util.advancePaymentByLoan(carPrice, paymentRatio, requiredExpenses, otherExpenses);
      monthlyPayment = util.monthlyLoanPaymentByLoan(carPrice, paymentRatio, wRate);
      loanInterest = util.loanPaymentInterest(carPrice,paymentRatio,monthRate,stages * 12)
    } else {
      //全款
      totalPayment = carPrice + otherExpenses + requiredExpenses - _loanServerFee
      advancePayment = carPrice
      monthlyPayment = 0
    }

    /// 实时计算优惠点数
    let downPrice = util.downPrice(carPrice, officialPrice)
    let downPriceFlag = util.downPriceFlag(downPrice);
    let downPriceString = util.priceStringWithUnit(downPrice)
    let downPoint = util.downPoint(carPrice, officialPrice).toFixed(2)

    if(!that.data.initPoint){
      this.setData({
        initPoint:downPoint,
        initSellingPrice:carPrice
      });
    }
    var diffPrice = Number(carPrice - officialPrice);

    this.setData({
      'quotation.totalPayment': Math.floor(totalPayment),
      'quotation.loanInterest': Math.floor(loanInterest),
      'quotation.advancePayment': Math.floor(advancePayment),
      'quotation.monthlyPayment': Math.floor(monthlyPayment),
      'quotation.hasLoan': this.isLoanTabActive(),
      diffPrice:diffPrice,
      priceChange: {
        flag: downPriceFlag,
        price: downPriceString,
        point: downPoint
      }
    });

    this.initIncome()

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
  setExpenseRate(year){
    const isMonth = (this.data.requestResult.interestType ===1);
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
    this.setData({
      'quotation.expenseRate': Number(expenseRate)
    })
    return Number(expenseRate);
  },
  handlerStagesChange(e) {
    let that = this
    this.setData({
      'stagesIndex': e.detail.value,
      'quotation.stages': this.data.stagesArray[e.detail.value]
    })

    let year = this.data.stagesArray[e.detail.value];
    this.setExpenseRate(year)
    this.updateForSomeReason()
  },
  handlerExpenseRateChange(e) {
    let that = this
   let con = that.data.requestResult.interestType===1 ? '月息（厘）':'万元系数（元）';
    that.hideInput()
    $wuxInputNumberDialog.open({
      title: '贷款月息或万元系数',
      content: con,
      inputNumber: this.data.quotation.expenseRate,
      inputNumberPlaceholder: '输入贷款年利率',
      inputType: 'digit',
      confirmText: '确定',
      cancelText: '取消',
      validate: (e) => {
        if (e.detail.value >= 0 && e.detail.value!="") {
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
        that.showInput()

      },
      cancel: () => {
        that.showInput()
      },
      close: () => {
        that.showInput()
      }
    })
  },
  handlerSellingPriceChange(e) {
    let that = this

    const _guidePrice = Number(this.data.quotation.quotationItems[0].guidePrice)
    const _sellingPrice = Number(this.data.quotation.quotationItems[0].sellingPrice)
    const _diffPrice = Number(that.data.diffPrice) //指导价差价
    const _isPoint = that.data.isSpecialBranch
    const _hasInitPoint =that.data.initPoint
    const _initSellingPrice = that.data.initSellingPrice
    const quotation = this.data.quotation
    let _inputT
    if(_isPoint){
      //报给客户的下的点数=（指导价-裸车价）/指导价*100  保留两位小数 裸车价是加价后的
      _inputT = that.data.priceChange.point
    }else{
      _inputT = Math.abs(_diffPrice)
    }

    this.hideInput()
    $wuxInputNumberDialog.open({
      title: '裸车价',
      inputNumber: _inputT,
      content: _sellingPrice,
      inputNumberPlaceholder: '输入裸车价',
      inputNumberMaxLength: 9,
      confirmText: '确定',
      cancelText: '取消',
      priceStyle: true,
      params:{
        sellingPrice : _sellingPrice,
        initSellingPrice : _initSellingPrice,
        initIsPlus:(_diffPrice > 0),
        isPlus :(_diffPrice > 0),
        isPoint:_isPoint,
        hasInitPoint:_hasInitPoint,
        guidePrice:_guidePrice
      },
      confirm: (res) => {
        let _isPlus = (res.isPlus === 'true' )
        let source = this.data.source
        let price

        if(_isPoint && ((_diffPrice > 0) === _isPlus)  && (Number(_hasInitPoint) === Number(res.inputNumber))){
          price = _initSellingPrice
        } else {
          price = util.getChangeCarPrice(_isPlus,_isPoint,_guidePrice,res.inputNumber)
        }

        const isElectricCar = this.data.carModelInfo.isElectricCar
        const capacity = this.data.carModelInfo.capacity
        that.setData({
          'quotation.quotationItems[0].sellingPrice': Math.floor(price),
          'carModelInfo.sellingPrice': Math.floor(price),
          'quotation.carPrice': Math.floor(price),
          'quotation.requiredExpensesAll.purchaseTax':Math.floor(util.purchaseTax(price,isElectricCar? null:capacity))
        })
        let businessRisks = this.data.businessRisks
        let insurancesAll = wx.getStorageSync("insurancesAll") ? JSON.parse(wx.getStorageSync("insurancesAll")) : null

        if(source == 'quotationDetail') {
          console.log(quotation)
          for(let item of businessRisks) {
            switch (item.name) {
              case '第三者责任险':
                if(quotation.insuranceDetail.iDSZZRX > 0) {
                  item.checked = true

                }else {
                  item.checked = false

                }
                break
              case '车辆损失险':
                if(quotation.insuranceDetail.iCLSSX > 0) {
                  item.checked = true
                }else {
                  item.checked = false
                }
                break
              case '全车盗抢险':
                if(quotation.insuranceDetail.iQCDQX > 0) {
                  item.checked = true
                }else {
                  item.checked = false
                }
                break
              case '玻璃单独破碎险':
                if(quotation.insuranceDetail.iBLDDPSX > 0) {
                  item.checked = true
                }else {
                  item.checked = false
                }
                break
              case '自燃损失险':
                if(quotation.insuranceDetail.iZRSSX > 0) {
                  item.checked = true
                }else {
                  item.checked = false
                }
                break
              case '不计免赔特约险':
                if(quotation.insuranceDetail.iBJMPTYX > 0) {
                  item.checked = true
                }else {
                  item.checked = false
                }
                break
              case '无过责任险':
                if(quotation.insuranceDetail.iWGZRX > 0) {
                  item.checked = true
                }else {
                  item.checked = false
                }
                break
              case '车上人员责任险':
                if(quotation.insuranceDetail.iCSRYZRX > 0) {
                  item.checked = true
                }else {
                  item.checked = false
                }
                break
              case '车身划痕险':
                if(quotation.insuranceDetail.iCSHHX > 0) {
                  item.checked = true
                }else {
                  item.checked = false

                }
                break
              default:

                break
            }
          }
        }

        if(insurancesAll != null) {
          that.insuranceCostCountDefault(insurancesAll.businessInsurances)
        }else {
          that.insuranceCostCountDefault(businessRisks)
        }

        that.updateForSomeReason()
        that.showInput()

      },
      cancel: () => {
        that.showInput()
      },
      close: () => {
        that.showInput()
      }
    })
  },
  handlerExpensesChange(e) {
    let that = this
    var expensesInfo = e.currentTarget.dataset.feetype
    var curPrice = e.currentTarget.dataset.price

    let carModelsInfoKeyValueString
    let pageSource = 'new'
    if(this.data.source === 'quotationDetail'){
      carModelsInfoKeyValueString = util.urlEncodeValueForKey('carModelInfo', this.data.quotation)
      //编辑
      pageSource = 'editor'
    }else{
      //新建
      carModelsInfoKeyValueString = util.urlEncodeValueForKey('carModelInfo', this.data.carModelInfo)
      pageSource = 'new'
    }

    if(expensesInfo.title === '保险金额') {
      wx.navigateTo({
        url: `../../insurance/insurance?${carModelsInfoKeyValueString}&pageSource=${pageSource}`
      })
    }else {
      that.hideInput()
      $wuxInputNumberDialog.open({
        title: expensesInfo.title,
        content: expensesInfo.title,
        inputNumber: (curPrice || curPrice === 0) ? curPrice : "",
        inputNumberPlaceholder: '输入'+expensesInfo.title,
        inputNumberMaxLength: 9,
        confirmText: '确定',
        cancelText: '取消',
        validate: (e) => {
          if (e.detail.value >= 0 && e.detail.value!="") {
            return true
          } else {
            return false
          }
        },
        confirm: (res) => {
          let price = Number(res.inputNumber)
          //这里如何写入插值变量
          that.setData({
            [expensesInfo.protoname] : price
          })
          that.updateForSomeReason()
          that.showInput()

        },
        cancel: () => {that.showInput()},
        close: () => {
          that.showInput()
        }

      })
    }
  },
  handlerLoanChange(e) {
    let that = this
    const _loanFee = that.data.quotation.loanFee
      that.hideInput()
      $wuxInputNumberDialog.open({
        title: '贷款手续费',
        content: '贷款手续费',
        inputNumber: (_loanFee || _loanFee === 0) ? _loanFee : "",
        inputNumberPlaceholder: '输入贷款手续费',
        inputNumberMaxLength: 9,
        confirmText: '确定',
        cancelText: '取消',
        validate: (e) => {
          if (e.detail.value >= 0 && e.detail.value!="") {
            return true
          } else {
            return false
          }
        },
        confirm: (res) => {
          let price = Number(res.inputNumber)
          //这里如何写入插值变量
          that.setData({'quotation.loanFee': price})
          that.updateForSomeReason()
          that.showInput()
        },
        cancel: () => {that.showInput()},
        close: () => {
          that.showInput()
        }
      })
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
    quotation.rateType= that.data.requestResult.interestType
    quotation.carCapacity = that.data.carModelInfo.capacity//排量
    quotation.electricCar = that.data.carModelInfo.isElectricCar//是否纯电动

    if(that.data.activeIndex == 1){
      //全款没有贷款手续费
      quotation.loanFee = 0
    }

    /**
     * 包装的发布报价单发送接口
     *
     * @param {Number} quotationDraft
     * @param {String} mobile
     * @param {String} name
     * @param {Number} sex
     * @param {Boolean} isSend
     * @param {Number} validTime
     */
    function isSendRequest(quotationDraft, mobile, name, sex, isSend, validTime) {

      container.saasService.requestPublishQuotation(quotationDraft.draftId, mobile, name, sex, isSend, validTime)
        .then(res => {
          let quotation1 = res

          app.fuckingLarryNavigatorTo.quotation = quotation1
          app.fuckingLarryNavigatorTo.source = that.data.source

          if (that.data.source === 'quotationDetail') {
            wx.navigateBack({
              delta: 2,
              success: function (res) {
                // success
              },
              fail: function () {
                // fail
                if (mobile) {
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
        }, err => {
          console.log("fail 保存报价单失败")
        })
    }

    that.hideInput()
    // 请求成功后弹出对话框
    $wuxSpecialUploadDialog.open({
      title: '保存并分享！',
      content: '分享给客户',
      inputNumberPlaceholder: '输入对方的手机号码',
      inputNumberPlaceholder1: '姓名（选填）',
      radioNames: [
        {name: 1, value: '先生'},
        {name: 0, value: '女士'}
      ],
      inputNumber1:quotation.customerName,
      inputNumber:quotation.customerMobile,
      defaultRadio:quotation.customerSex === undefined ? undefined:Number(quotation.customerSex),
      effectivenessCustomValue: quotation.validTime,//说明： 为空时 是创建报价单 否则为编辑
      confirmText: '发送报价单',
      cancelText: '仅保存',
      validTimeObj: that.data.requestResult.validTime,
      initMobValidate: function (mobile) {
        return mobile ? mobile.length === 11 : false
      },
      validate: function (e) {
        let mobile = e.detail.value
        return mobile.length === 11
      },
      confirm: (res) => {
        const mobile = res.inputNumber
        const customerName = res.inputName
        const customerSex = Number(res.inputSex)
        const effectiveness = Number(res.inputEffectiveness)
        //保存报价单

        container.saasService.requestSaveQuotationDraft(quotation)
          .then(res => {
            let quotationDraft = res
            //发送报价单
            isSendRequest(quotationDraft, mobile, customerName, customerSex, true, effectiveness)
          })
        that.showInput()
      },
      cancel: (res) => {
        //保存报价单
        let mobile = res.inputNumber
        if (mobile) {
          mobile = mobile.length === 11 ? mobile : ""
        }
        const customerName =res.inputName
        const customerSex = Number(res.inputSex)
        const effectiveness = Number(res.inputEffectiveness)
        container.saasService.requestSaveQuotationDraft(quotation)
          .then(res => {
            let quotationDraft = res
            /// 暂不发送, 不带电话号码发送（发布当前报价草稿到某个用户） 保留1.5以前的逻辑
            isSendRequest(quotationDraft, mobile, customerName, customerSex, false, effectiveness)
          })
        that.showInput()
      },
      close: () => {
        that.showInput()
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
    that.hideInput()
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
        that.showInput()
      },
      cancel: () => {
        that.showInput()
      },
      close: () => {
        that.showInput()
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
    let that = this
    console.log("查看收益")
    that.hideInput()
     const res = that.data.getProfitResult;
     console.log("已经有收益结果")
     //设计搞与原型搞上无全款显示效果，临时脑补判断条件与显示画面...

     let _totle
     let _detailContent =[]
     _detailContent.push({
       name:'裸车价收益约',value:'￥'+ res.profit
     },{name:'保险收益约',value:'￥'+res.insuranceProfit})


     if(this.isLoanTabActive()) {
       //贷款
       _detailContent.push({name: '贷款收益约', value: '￥' + res.loanProfit})
       _totle = res.totalProfit
     }else{
       //全款
       _detailContent.push({name: '贷款收益约', value: '￥0'})
       _totle = (Number(res.totalProfit) - Number(res.loanProfit))
     }

     if(res.boutiqueFee){
       _detailContent.push({name: '精品收益约', value: '￥' + res.boutiqueFee})
     }
     if(res.installFee){
       _detailContent.push({name: '安装收益约', value: '￥' + res.installFee})
     }
     if(res.serviceFee){
       _detailContent.push({name: '服务收益约', value: '￥' + res.serviceFee})
     }
     if(res.otherFee){
       _detailContent.push({name: '其它收益约', value: '￥' + res.otherFee})
     }

    let _contentDialogFun = $wuxContentDialog.open({
       title: '收益详情',
       totleContent: {name:'总利润约',value:'￥'+_totle},
       detailContent: _detailContent,
       close: () => {
         that.showInput()
       }
     })
     that.setData({
       contentDialogFun : _contentDialogFun
     })
  },
  initIncome(){
    //初始化收益
    let that = this
    let carPrice = this.data.quotation.quotationItems[0].sellingPrice
    let paymentRatio = this.data.quotation.paymentRatio
    var user = container.userService;

    let _insuranceAmount = that.data.quotation.requiredExpensesAll.insuranceAmount - that.data.quotation.insuranceDetail.iJQX
    container.saasService.getProfit(
      util.loanPaymentByLoan1(carPrice, paymentRatio),
      _insuranceAmount,
      carPrice,
      that.data.quotation.quotationItems[0].originalPrice,
      that.data.quotation.otherExpensesAll.boutiqueCost,
      that.data.quotation.loanFee,
      that.data.quotation.otherExpensesAll.installationFee,
      that.data.quotation.otherExpensesAll.otherFee,
      that.data.quotation.otherExpensesAll.serverFee
    )
      .then(res => {
        that.setData({
          getProfitResult: res
        })
      }, err => {
        console.log("查看收益失败")
      })
  },
  touchStartIncome(){
    console.log("touchStartIncome")
    const that = this
    if(that.data.touchStatus != 0){
      //用于touchEndIncome的300ms延时关闭，
      return
    }
    that.setData({
      touchStatus : 1
    })
    setTimeout(()=>{
      console.log("touchStartIncome400","touchStatus:"+that.data.touchStatus)
      if(that.data.touchStatus === 3){
        that.lookIncome()
      }
    },500)
  },
  touchMoveIncome(){
    const that = this
    if(that.data.touchStatus===2 || that.data.touchStatus ===4){
      return
    }
    if(that.data.touchStatus === 3){
      that.setData({
        touchStatus : 4
      })
      return
    }
    that.setData({
      touchStatus : 2
    })
  },
  longTapIncome(){
    console.log("longTapIncome")
    //手指触摸后，超过350ms再离开的事件
    const that = this
    that.setData({
      touchStatus : 3
    })
  },
  touchEndIncome(){
    console.log("touchEndIncome")
    const that = this
      setTimeout(()=>{
        if(typeof(that.data.contentDialogFun) == 'function') {
          that.data.contentDialogFun()
        }
        that.showInput()
        that.setData({
          touchStatus : 0
        })
      },300)


  },
  showInput(){
    this.setData({
      isShowTextarea:true
    })
  },
  hideInput(){
    this.setData({
      isShowTextarea:false
    })
  },
  initVehicleAndVesselTax(){
    let that  = this
    //初始化车船税
    const isElectricCar = this.data.carModelInfo.isElectricCar
    const capacity = this.data.carModelInfo.capacity
    if(isElectricCar || !capacity){
      if(typeof(call) === 'function'){
        call()
      }
      return ;
    }
    var user = container.userService;

    return container.saasService.gettingVehicleAndVesselTax({
      data:{
        capacity:capacity,
        place:user.address.provinceName//provinceId
      }
    }).then(data=>{
      that.setData({'quotation.requiredExpensesAll.vehicleAndVesselTax': data})
    })

  },
  /**
   * 获取保险信息.
   *
   * @returns {Promise}
   */
  getDefaultInsurance() {
    const that = this
    const checkedValues = []
    const source = this.data.source
    const quotation = this.data.quotation
    return container.saasService.gettingInsurance().then((res) => {
      if (res) {
        if(source === 'quotationDetail') {
          for(let item of res.insurances) {
            switch (item.name) {
              case '第三者责任险':
                if(quotation.insuranceDetail.iDSZZRX > 0) {
                  item.checked = true
                }
                break
              case '车辆损失险':
                if(quotation.insuranceDetail.iCLSSX > 0) {
                  item.checked = true
                }
                break
              case '全车盗抢险':
                if(quotation.insuranceDetail.iQCDQX > 0) {
                  item.checked = true
                }
                break
              case '玻璃单独破碎险':
                if(quotation.insuranceDetail.iBLDDPSX > 0) {
                  item.checked = true
                }
                break
              case '自燃损失险':
                if(quotation.insuranceDetail.iZRSSX > 0) {
                  item.checked = true
                }
                break
              case '不计免赔特约险':
                if(quotation.insuranceDetail.iBJMPTYX > 0) {
                  item.checked = true
                }
                break
              case '无过责任险':
                if(quotation.insuranceDetail.iWGZRX > 0) {
                  item.checked = true
                }
                break
              case '车上人员责任险':
                if(quotation.insuranceDetail.iCSRYZRX > 0) {
                  item.checked = true
                }
                break
              case '车身划痕险':
                if(quotation.insuranceDetail.iCSHHX > 0) {
                  item.checked = true
                }
                break
              default:

                break
            }
          }
        }

        that.setData({
          'businessRisks': res.insurances
        })
        if(that.data.source != 'quotationDetail') {
          that.insuranceCostCountDefault(res.insurances)
        }
      }
    }, (err) => {

    })
  },
  /**
   * 默认保险费用计算.
   */
  insuranceCostCountDefault(data) {
    let that = this
    let expensesAllInfo = this.data.expensesAllInfo
    let businessRisks = data
    // spu规格.
    let carModelsInfo = this.data.carModelInfo
    let quotation = this.data.quotation
    let insuranceDetail = this.data.quotation.insuranceDetail
    // 裸车价.
    let officialPrice = carModelsInfo.sellingPrice
    let seatNums = carModelsInfo.seatNums
    let standards = []
    let sIndex = 0
    let sixUnder = [], sixAbove = []
    let liabilityTypes = [5,10,20,30,50,100]
    let scratchesTypes = [2000,5000,10000,20000]

    if(seatNums && seatNums.length > 0) {
      for(let item of seatNums) {
        if(item < 6) {
          sixUnder.push(item)
        }else {
          sixAbove.push(item)
        }
      }
    }else {
      if(quotation.insuranceDetail.carSize == 0){
        sixUnder.push('0')
      }else {
        sixAbove.push('1')
      }
    }

    if(sixUnder.length > 0){
      standards = ["家用6座以下"]
    }else if(sixAbove.length > 0) {
      standards = ["家用6座以上"]
    }else if(sixUnder.length > 0 && sixAbove.length > 0) {
      standards = ["家用6座以下","家用6座以上"]
    }
    let standardIndex = standards[sIndex] == '家用6座以下' ? 0 : 1
    console.log(standardIndex)
    // 初始化总金额为0.
    let totalAmount = 0
    // 商业险总额.
    let businessTatal = 0
    // 交强险.
    let trafficInsurance = standardIndex === 0 ? 950 : 1100
    // 第三方责任险.
    let liabilityInsurance = 0
    // 车辆损失险.
    let vehicleLossInsurance = 0
    // 全车盗抢险
    let vehicleDQInsurance = 0
    // 玻璃单独破碎险
    let glassBrokenInsurance = 0
    // 自然损失险
    let gcombustionLossInsurance = 0
    // 不计免赔特约险
    let franchiseInsurance = 0
    // 无过责任险
    let responsibilityInsurance = 0
    // 车上人员责任险
    let personnelCarInsurance = 0
    // 车身划痕险
    let scratchesInsurance = 0

    let insurancesAll = wx.getStorageSync("insurancesAll") ? JSON.parse(wx.getStorageSync("insurancesAll")) : null

    insuranceDetail.iJQX = trafficInsurance //"交强险",
    insuranceDetail.carSize = standardIndex //"车辆规格"

    for(let item of businessRisks) {
      if(item.checked) {
        switch (item.name) {
          case '第三者责任险':
            let iDSZZRX_INDEX = liabilityTypes[insuranceDetail.iDSZZRX_INDEX]
            liabilityInsurance = standardIndex == 0 ? this.data.spuStandard.spuUnderSix.liability[iDSZZRX_INDEX]
                                                    : this.data.spuStandard.spuAboveSix.liability[iDSZZRX_INDEX]
            businessTatal += liabilityInsurance
            insuranceDetail.iDSZZRX = liabilityInsurance.toFixed(0)
            break
          case '车辆损失险':
            let basis = standardIndex == 0 ? 539 : 646
            vehicleLossInsurance = basis + officialPrice*0.0128
            businessTatal += Number(vehicleLossInsurance.toFixed(0))
            insuranceDetail.iCLSSX = vehicleLossInsurance.toFixed(0)
            break
          case '全车盗抢险':
            let basisPremium = standardIndex == 0 ? 120 : 140
            let ratePremium = standardIndex == 0 ? 0.0049 : 0.0044
            vehicleDQInsurance = basisPremium + officialPrice*ratePremium
            businessTatal += Number(vehicleDQInsurance.toFixed(0))
            insuranceDetail.iQCDQX = vehicleDQInsurance.toFixed(0)
            break
          case '玻璃单独破碎险':
            let iBLDDPSX_INDEX = insuranceDetail.iBLDDPSX_INDEX
            let glassBrokenRate = standardIndex == 0 ? this.data.spuStandard.spuUnderSix.glassBroken[iBLDDPSX_INDEX]
                                                    : this.data.spuStandard.spuAboveSix.glassBroken[iBLDDPSX_INDEX]
            glassBrokenInsurance = officialPrice*glassBrokenRate
            businessTatal += Number(glassBrokenInsurance.toFixed(0))
            insuranceDetail.iBLDDPSX = glassBrokenInsurance.toFixed(0)
            break
          case '自燃损失险':
            gcombustionLossInsurance = officialPrice*0.0015
            businessTatal += Number(gcombustionLossInsurance.toFixed(0))
            insuranceDetail.iZRSSX = gcombustionLossInsurance.toFixed(0)
            break
          case '不计免赔特约险':
            if(liabilityInsurance > 0 && vehicleLossInsurance > 0) {
              franchiseInsurance = liabilityInsurance*0.2 + vehicleLossInsurance*0.2
              businessTatal += Number(franchiseInsurance.toFixed(0))
              insuranceDetail.iBJMPTYX = franchiseInsurance.toFixed(0)
            }

            break
          case '无过责任险':
            responsibilityInsurance = liabilityInsurance*0.2
            businessTatal += Number(responsibilityInsurance.toFixed(0))
            insuranceDetail.iWGZRX = responsibilityInsurance.toFixed(0)
            break
          case '车上人员责任险':
            let personnelCarRate = standardIndex == 0 ? 0.0069 : 0.0066
            personnelCarInsurance = officialPrice*personnelCarRate
            businessTatal += Number(personnelCarInsurance.toFixed(0))
            insuranceDetail.iCSRYZRX = personnelCarInsurance.toFixed(0)

            break
          case '车身划痕险':
            let iCSHHX_INDEX = scratchesTypes[insuranceDetail.iCSHHX_INDEX]
            let scratches = 0

            if(officialPrice/10000 < 30) {
              scratches = this.data.scratches[iCSHHX_INDEX].one
            }else if(30<= officialPrice/10000 && officialPrice/10000 <= 50) {
              scratches = this.data.scratches[iCSHHX_INDEX].two
            }else{
              scratches = this.data.scratches[iCSHHX_INDEX].three
            }

            businessTatal += scratches
            insuranceDetail.iCSHHX = scratches.toFixed(0)
            break
          default:

            break
        }
      }
    }

    totalAmount = (businessTatal+trafficInsurance).toFixed(0)

    for(let item1 of expensesAllInfo) {
      if(item1.title === '保险金额') {

        item1.price = totalAmount
      }
    }
    insuranceDetail.iTotal = totalAmount

    if(insurancesAll !== null) {

      insurancesAll.insuranceTotal = totalAmount
      try {
        wx.setStorageSync('insurancesAll', JSON.stringify(insurancesAll))
        console.log(insurancesAll)
      } catch (e) {

      }
    }
    that.setData({
      expensesAllInfo: expensesAllInfo,
      'quotation.requiredExpensesAll.insuranceAmount': totalAmount,
      'quotation.insuranceDetail': insuranceDetail
    })
    return totalAmount
  }
});
