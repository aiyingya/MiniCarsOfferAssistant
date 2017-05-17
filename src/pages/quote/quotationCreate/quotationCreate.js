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
        "iCSHHX":0,//"车身划痕险"
        "carSize":0,//"车辆规格"
        "iDSZZRX_INDEX":1,
        "iBLDDPSX_INDEX":0,
        "iCSHHX_INDEX":1
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
      "carNumberFee":'200',//"上牌服务费"
      "loanFee":0 //贷款服务费
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
        title:'金融服务费',
        protoname:'quotation.otherExpensesAll.serverFee',
        price:0//同上
      },//安装费 其它 临时脑补的费用
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
      count: '' // "7.34"
    },
    source: '', // carModels/carSources/quotationDetail/
    showPreferenceSetting:false,
    isSpecialBranch:false, //宝马、奥迪、MINI展示下xx点
    isOnLoad:true,
    diffPrice:0,//是否加价卖
    isShowTextarea:true,
    businessRisks:''
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
        insuranceAmount:quotation.insuranceDetail.iTotal || 0//保险金额
      }

      quotation.otherExpensesAll = {// 其他费用（元），deciaml，取值范围0~999999999",
        boutiqueCost:quotation.boutiqueFee || 0,//精品费用
        installationFee:quotation.installFee || 0,//安装费
        serverFee:quotation.serviceFee || 0,//
        otherFee:quotation.otherFee || 0
      }

      const  isShow = that.isShowDownDot(quotation.quotationItems[0].itemName)
      this.setData({
        'isSpecialBranch': isShow
      })


      this.setData({
        'quotation': quotation,
        'quotation.quotationItems[0].baseSellingPrice': quotation.carPrice,
        'carModelsInfo.sellingPrice': quotation.carPrice,
        'quotation.quotationItems[0].originalPrice':quotation.marketPrice
      })

      //获取报价单接口
      app.saasService.getCreatCarRecordInfo({
        data:{
          "userId": app.userService.auth.userId,
          "carPrice":0 //随便🚢一个金额，该接口我不需要加价后的裸车价
        },
        success: (res) => {

          res.interestType = quotation.rateType;
          that.setData({
            'requestResult': res
          })
          if(!quotation.hasLoan){
            this.setData({
              'quotation.otherExpensesAll.serverFee':res.loanFee
            })
          }


          that.updateForSomeReason()
          activeIndexCss()

        },
        fail: () => {},
        complete: () => {}
      });

      const promise1 = that.getDefaultInsurance()
      const promise = Promise.race([promise1])
      promise.then(res => {
        //wx.hideToast()

      }, err => {
        //wx.hideToast()
      })
      console.log(quotation)

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

        const originalPrice = carSkuInfo.showPrice || carSkuInfo.viewModelQuoted.price// || carModelInfo.officialPrice

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
            const capacity = carModelInfo.capacity
            const isElectricCar = carModelInfo.isElectricCar
            const loanFee = res.loanFee
            this.setData({
              'quotation.requiredExpensesAll.licenseFee':res.carNumberFee,
              'quotation.otherExpensesAll.serverFee':res.loanFee,
              'quotation.requiredExpensesAll.purchaseTax':Math.floor(util.purchaseTax(sellingPrice, isElectricCar ? null : capacity))
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

            that.initVehicleAndVesselTax(function(){
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
      "iDSZZRX_INDEX":1,
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
    this.updateForSomeReason()
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
    let productFee = 0

    var _temp1 = this.data.quotation.requiredExpensesAll
    for(let key of Object.keys(_temp1)){
      requiredExpenses += Number(_temp1[key])
    }

    var _temp2 = this.data.quotation.otherExpensesAll
    for(let key of Object.keys(_temp2)){
      if(key === "serverFee"){
        productFee = Number(_temp2[key])
      }
      otherExpenses += Number(_temp2[key])
    }

    let carPrice = this.data.quotation.quotationItems[0].sellingPrice
    let officialPrice = this.data.quotation.quotationItems[0].guidePrice

    let paymentRatio = this.data.quotation.paymentRatio
    let stages = this.data.quotation.stages

    let expenseRate = this.data.quotation.expenseRate

    let monthlyPayment
    let totalPayment
    let advancePayment
    if (this.isLoanTabActive()) {
      let isMonth = (that.data.requestResult.interestType===1);
      if(expenseRate === undefined){
        expenseRate = that.setExpenseRate(stages)
      }
      const wRate = isMonth ? (10000/(stages*12) + expenseRate * 10) : expenseRate//万元系数
      totalPayment = util.totalPaymentByLoan(carPrice, paymentRatio, expenseRate, stages * 12, requiredExpenses, otherExpenses)
      advancePayment = util.advancePaymentByLoan(carPrice, paymentRatio, requiredExpenses, otherExpenses);
      monthlyPayment = util.monthlyLoanPaymentByLoan(carPrice, paymentRatio, wRate);

    } else {
      //全款
      totalPayment = carPrice + otherExpenses + requiredExpenses - productFee
      advancePayment = carPrice
      monthlyPayment = 0
    }

    /// 实时计算优惠点数
    let downPrice = util.downPrice(carPrice, officialPrice)
    let downPriceFlag = util.downPriceFlag(downPrice);
    let downPriceString = util.priceStringWithUnit(downPrice)
    let downPoint = util.downPoint(carPrice, officialPrice).toFixed(2)

    console.log(downPriceFlag)


    if(!that.data.initPoint){
      this.setData({
        initPoint:downPoint,
        initSellingPrice:carPrice
      });
    }
    var diffPrice = Number(carPrice - officialPrice);

    this.setData({
      'quotation.totalPayment': Math.floor(totalPayment),
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
      content: "￥" + _sellingPrice,
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

        let price
        if(_isPoint && ((_diffPrice > 0) === _isPlus)  && (Number(_hasInitPoint) === Number(res.inputNumber))){
          price = _initSellingPrice
        }else{
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
        that.insuranceCostCountDefault(businessRisks)

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

    let requiredExpenses = this.data.quotation.requiredExpenses

    let carModelsInfoKeyValueString
    let pageSource = 'new'
    if(this.data.source === 'quotationDetail'){
      //TODO:盼盼需要他的格式，但是格式太大
      carModelsInfoKeyValueString = util.urlEncodeValueForKey('carModelInfo', this.data.quotation)
      //编辑
      /*{
        "iTotal":"保险总额",
        "showDetail":"是否显示保险明细",
        "iJQX":"交强险",
        "iDSZZRX":"第三者责任险",
        "iCLSSX":"车辆损失险",
        "iQCDQX":"全车盗抢险",
        "iBLDDPSX":"玻璃单独破碎险",
        "iZRSSX":"自燃损失险",
        "iBJMPTYX":"不计免赔特约险",
        "iWGZRX":"无过责任险",
        "iCSRYZRX":"车上人员责任险",
        "iCSHHX":"车身划痕险",
        "carSize":"车辆规格" 0 6座一下 1 6座以上
      }*/
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

    if(that.data.activeIndex == 1){
      //全款没有金融服务费
      quotation.otherExpensesAll.serverFee =0
    }

    function isSendRequest (quotationDraft,mobile,name,sex) {

      app.saasService.requestPublishQuotation(quotationDraft.draftId, mobile ,{
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
      },name,sex)
    }

    that.hideInput()
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
        that.showInput()

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
    let carPrice = this.data.quotation.quotationItems[0].sellingPrice
    let paymentRatio = this.data.quotation.paymentRatio
    var user = app.userService;

    that.hideInput()
    app.saasService.getProfit({
      "userId": user.auth.userId,
      "loanNum": util.loanPaymentByLoan1(carPrice, paymentRatio),
      "insuranceNum": this.data.quotation.requiredExpensesAll.insuranceAmount,
      "carPrice":carPrice,
      "marketPrice":that.data.quotation.quotationItems[0].originalPrice,
      "boutiqueFee":that.data.quotation.otherExpensesAll.boutiqueCost,
      "loanServiceFee":that.data.quotation.otherExpensesAll.serverFee,
      "installFee":that.data.quotation.otherExpensesAll.installationFee,
      "otherFee":that.data.quotation.otherExpensesAll.otherFee
    },
     {
       success: (res) => {
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
         if(res.otherFee){
           _detailContent.push({name: '其它收益约', value: '￥' + res.otherFee})
         }

         $wuxContentDialog.open({
           title: '收益详情',
           totleContent: {name:'总利润约',value:'￥'+_totle},
           detailContent: _detailContent,
           close: () => {
             that.showInput()
           }
         })

       },
       fail:() => {console.log("查看收益失败")},
       complete: () => {}
      }
    );

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
  initVehicleAndVesselTax(call){
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
    let price
    var user = app.userService;
    app.saasService.gettingVehicleAndVesselTax({
      data:{
        capacity:capacity,
        place:user.address.provinceName//provinceId
      },
      success:(data)=>{
        that.setData({'quotation.requiredExpensesAll.vehicleAndVesselTax': data})
        if(typeof(call) === 'function'){
          call(data)
        }
      }
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
    return app.saasService.gettingInsurance().then((res) => {
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
    // 裸车价.
    let officialPrice = carModelsInfo.sellingPrice
    let seatNums = carModelsInfo.seatNums
    let standards = []
    let sIndex = 0
    let sixUnder = [], sixAbove = []

    if(seatNums && seatNums.length > 0) {
      for(let item of seatNums) {
        if(item < 6) {
          sixUnder.push(item)
        }else {
          sixAbove.push(item)
        }
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

    let insuranceDetail = {
      "iTotal":0,//"保险总额",
      "iJQX":trafficInsurance,//"交强险",
      "iDSZZRX":0,//"第三者责任险", 1
      "iCLSSX":0,//"车辆损失险",1
      "iQCDQX":0,//"全车盗抢险",1
      "iBLDDPSX":0,//"玻璃单独破碎险",1
      "iZRSSX":0,//"自燃损失险",1
      "iBJMPTYX":0,//"不计免赔特约险",1
      "iWGZRX":0,//"无过责任险",1
      "iCSRYZRX":0,//"车上人员责任险",1
      "iCSHHX":0,//"车身划痕险"1
      "carSize":standardIndex,//"车辆规格"
      "iDSZZRX_INDEX":1,
      "iBLDDPSX_INDEX":0,
      "iCSHHX_INDEX":1
    }
    for(let item of businessRisks) {
      if(item.checked) {
        switch (item.name) {
          case '第三者责任险':
            liabilityInsurance = standardIndex == 0 ? 920 : 831
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
            let glassBrokenRate = 0.002
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
            let scratches = 0

            if(officialPrice/10000 < 30) {
              scratches = 570
            }else if(30<= officialPrice/10000 && officialPrice/10000 <= 50) {
              scratches = 900
            }else{
              scratches = 1100
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
