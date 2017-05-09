let app = getApp()
import util from '../../utils/util'
Page({
  data: {
    InsuranceDetail: {
      /**
       * 保险总额.
       */
      insuranceTotal: '0',
      /**
       * 商业险总额.
       */
      businessTatal: '0',
      /**
       * 交强险.
       */
      trafficInsurance: 0,
      /**
       * 第三者责任险.
       */
      liabilityInsurance: '0',
      /**
       * 车辆损失险.
       */
      vehicleLossInsurance: '0',
      /**
       * 全车盗抢险.
       */
      vehicleDQInsurance: '0',
      /**
       * 玻璃单独破碎险.
       */
      glassBrokenInsurance: '0',
      /**
       * 自燃损失险.
       */
      gcombustionLossInsurance: '0',
      /**
       * 不计免赔特约险.
       */
      franchiseInsurance: '0',
      /**
       * 无过责任险.
       */
      responsibilityInsurance: '0',
      /**
       * 车上人员责任险.
       */
      personnelCarInsurance: '0',
      /**
       * 车身划痕险.
       */
      scratchesInsurance: '0'
    }, 
    /** 
     * spu规格.
     */
    standards: [],
    standardIndex: 0,
    saddleValue: 0,
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
    scratchesTypes: [2000,5000,10000,20000],
    scratchesTypesValue: ["保额2000元","保额5000元","保额10000元","保额20000元"],
    scratchesTypesIndex: 1,
    /**
     * 商业险类型.
     */
    businessRisks: [],
    /**
     * 第三方责任险赔付额度.
     */
    liabilityTypes: [5,10,20,50,100],
    liabilityTypesValue: ["赔付额度5万","赔付额度10万","赔付额度20万","赔付额度50万","赔付额度100万"],
    liabilityTypesIndex: 1,
    /**
     * 玻璃单独破碎险选择进口、国产.
     */
    glassBrokenTypes: ["国产","进口"],
    glassBrokenTypesIndex: 0,
    /**
     * 裸车价.
     */
    officialPrice: 0,
    /**
     * 设置保险明细字体颜色.
     */
    ChangeInsuranceTotalStyle: '',
    /**
     * 页面来源.
     */
    pageSource: 'new',
    carModelInfo: ''
  },
  onLoad(options) {
    let carModelInfo = util.urlDecodeValueForKeyFromOptions('carModelInfo', options)
    // 页面来源.
    let pageSource = options.pageSource
    let seatNums = carModelInfo.seatNums
    let standards = [] 
    let standardIndex = 0
    let sixUnder = [], sixAbove = []
    let trafficInsurance = 950
    console.log(pageSource,carModelInfo)
    if(pageSource === 'new') {
      if(seatNums && seatNums.length > 0) {
        for(let item of seatNums) {
          if(item < 6) {
            sixUnder.push(item)
          }else {
            sixAbove.push(item)
          }
        }
      }
    }else {
      if(carModelInfo && carModelInfo.insuranceDetail.carSize == 0) {
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
    trafficInsurance = standards[standardIndex] == '家用6座以下' ? 950 : 1100
    this.data.officialPrice = pageSource === 'editor' ? carModelInfo.carPrice : carModelInfo.sellingPrice
    this.setData({
      standards: standards,
      pageSource: pageSource,
      carModelInfo: carModelInfo,
      'InsuranceDetail.trafficInsurance': trafficInsurance
    })
    wx.showToast({
      title: '正在加载',
      icon: 'loading',
      duration: 10000,
      mask: true
    })
    const promise1 = this.getDefaultInsurance()
    const promise = Promise.race([promise1])
    promise.then(res => {
      wx.hideToast()
    }, err => {
      wx.hideToast()
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
    return app.saasService.gettingInsurance().then((res) => {
      if (res) {
        let pageSource = that.data.pageSource
        let carModelInfo = that.data.carModelInfo

        that.setData({
          'businessRisks': res.insurances
        })
        that.insuranceCostCount(res.insurances)
      }
    }, (err) => {

    })
  },
  /**
   * 车座位切换.
   */
  handleChangeStandard: function(e) {
    
    let trafficInsurance = this.data.standards[e.detail.value] == '家用6座以下' ? 950 : 1100
    // all Insurance.
    let businessRisks = this.data.businessRisks
    this.setData({
      standardIndex: e.detail.value,
      'InsuranceDetail.trafficInsurance': trafficInsurance
    })
    this.insuranceCostCount(businessRisks)
  },
  /**
   * 保险选择.
   */
  bindChangeBusinessRisks(e) {  
    let businessRisks = this.data.businessRisks
    let values = e.detail.value
    let name = e.currentTarget.dataset.name
 
    for (let item of businessRisks) {
      if(item.name === name) {
        item.checked = false
        for (let val of values) {
          if(item.id == val){
            item.checked = true   
          }
        } 
        if(name === '第三者责任险' && item.checked) {
          businessRisks[5].checked = true
          businessRisks[6].checked = true
        }else if(name === '第三者责任险' && !item.checked) {
          businessRisks[5].checked = false
          businessRisks[6].checked = false
        }
        if(name === '车辆损失险' && item.checked) {
          businessRisks[2].checked = true
          businessRisks[6].checked = true
          businessRisks[8].checked = true
        }else if(name === '车辆损失险' && !item.checked) {
          businessRisks[2].checked = false
          businessRisks[6].checked = false
          businessRisks[8].checked = false
        }
      } 
    }
    
    this.setData({
      businessRisks: businessRisks
    })
    this.insuranceCostCount(businessRisks)
  },
  /**
   * 修改保险总额.
   */
  handleChangeInsuranceTotal(e) {
    let value = e.detail.value
    // 当保险总额手动改变时，保险明细字体变灰.
    this.setData({
      ChangeInsuranceTotalStyle: 'color-gray',
      'InsuranceDetail.insuranceTotal': value
    })
  },
  /**
   * 修改第三方责任险赔付额度.
   */
  handleChangeLiabilityTypes(e) {
    let businessRisks = this.data.businessRisks
    this.setData({
      liabilityTypesIndex: e.detail.value
    })
    this.insuranceCostCount(businessRisks)
  },
  /**
   * 修改玻璃破碎险类型.
   */
  handleChangeGlassBrokenTypes(e) {
    let businessRisks = this.data.businessRisks
    this.setData({
      glassBrokenTypesIndex: e.detail.value
    })
    this.insuranceCostCount(businessRisks)
  },
  /**
   * 修改车身划痕险保额.
   */
  handleChangeScratchesTypes(e) {
    let businessRisks = this.data.businessRisks
    this.setData({
      scratchesTypesIndex: e.detail.value
    })
    this.insuranceCostCount(businessRisks)
  },
  /**
   * 保险费用计算.
   */
  insuranceCostCount(data) {
    let that = this
    // 裸车价.
    let officialPrice = this.data.officialPrice
    let businessRisks = data
    // spu规格.
    
    let standardIndex = this.data.standards[this.data.standardIndex] == '家用6座以下' ? 0 : 1
    // 初始化总金额为0.
    let totalAmount = 0
    // 商业险总额.
    let businessTatal = 0
    // 交强险.
    let trafficInsurance = this.data.InsuranceDetail.trafficInsurance
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
    
    for(let item of businessRisks) { 
      if(item.checked) {
        switch (item.name) {
          case '第三者责任险':
            let liabilityTypesIndex = this.data.liabilityTypes[this.data.liabilityTypesIndex]
            liabilityInsurance = standardIndex == 0 ? this.data.spuStandard.spuUnderSix.liability[liabilityTypesIndex]
                                                    : this.data.spuStandard.spuAboveSix.liability[liabilityTypesIndex]
            businessTatal += liabilityInsurance
            break
          case '车辆损失险':
            let basis = standardIndex == 0 ? this.data.spuStandard.spuUnderSix.vehicleBasis
                                           : this.data.spuStandard.spuAboveSix.vehicleBasis
            vehicleLossInsurance = basis + officialPrice*0.0128
            businessTatal += vehicleLossInsurance
            break
          case '全车盗抢险':
            let basisPremium = standardIndex == 0 ? this.data.spuStandard.spuUnderSix.vehicleDQ.basisPremium
                                                  : this.data.spuStandard.spuAboveSix.vehicleDQ.basisPremium
            let ratePremium = standardIndex == 0 ? this.data.spuStandard.spuUnderSix.vehicleDQ.rate
                                                 : this.data.spuStandard.spuAboveSix.vehicleDQ.rate
            vehicleDQInsurance = basisPremium + officialPrice*ratePremium
            businessTatal += vehicleDQInsurance
            break
          case '玻璃单独破碎险':
            let glassBrokenIndex = this.data.glassBrokenTypesIndex
            let glassBrokenRate = standardIndex == 0 ? this.data.spuStandard.spuUnderSix.glassBroken[glassBrokenIndex]
                                                     : this.data.spuStandard.spuAboveSix.glassBroken[glassBrokenIndex]
            glassBrokenInsurance = officialPrice*glassBrokenRate
            businessTatal += glassBrokenInsurance
            break
          case '自燃损失险':
            gcombustionLossInsurance = officialPrice*0.0015
            businessTatal += gcombustionLossInsurance
            break
          case '不计免赔特约险':
            if(liabilityInsurance > 0 && vehicleLossInsurance > 0) {
              franchiseInsurance = liabilityInsurance*0.2 + vehicleLossInsurance*0.2
              
              businessTatal += franchiseInsurance
            }
            
            break
          case '无过责任险':
 
            responsibilityInsurance = liabilityInsurance*0.2 
            businessTatal += responsibilityInsurance
            break
          case '车上人员责任险':
            let personnelCarRate = standardIndex == 0 ? this.data.spuStandard.spuUnderSix.personnelCarRate
                                                      : this.data.spuStandard.spuAboveSix.personnelCarRate
            personnelCarInsurance = officialPrice*personnelCarRate 
            businessTatal += personnelCarInsurance
            break
          case '车身划痕险':
            let scratches = 0
            let scratchesTypesIndex = this.data.scratchesTypes[this.data.scratchesTypesIndex]
            console.log(officialPrice/10000)
            if(officialPrice/10000 < 30) {
              scratches = this.data.scratches[scratchesTypesIndex].one
            }else if(30<= officialPrice/10000 && officialPrice/10000 <= 50) {
              scratches = this.data.scratches[scratchesTypesIndex].two
            }else{
              scratches = this.data.scratches[scratchesTypesIndex].three
            }
            scratchesInsurance = scratches 
            businessTatal += scratchesInsurance
            break
          default:

            break
        }  
      }    
    }
    
    totalAmount = businessTatal+trafficInsurance
    
    that.setData({
      'InsuranceDetail.businessTatal': businessTatal.toFixed(0),
      'InsuranceDetail.liabilityInsurance': liabilityInsurance.toFixed(0),
      'InsuranceDetail.vehicleLossInsurance': vehicleLossInsurance.toFixed(0),
      'InsuranceDetail.vehicleDQInsurance': vehicleDQInsurance.toFixed(0),
      'InsuranceDetail.glassBrokenInsurance': glassBrokenInsurance.toFixed(0),
      'InsuranceDetail.gcombustionLossInsurance': gcombustionLossInsurance.toFixed(0),
      'InsuranceDetail.franchiseInsurance': franchiseInsurance.toFixed(0),
      'InsuranceDetail.responsibilityInsurance': responsibilityInsurance.toFixed(0),
      'InsuranceDetail.personnelCarInsurance': personnelCarInsurance.toFixed(0),
      'InsuranceDetail.scratchesInsurance': scratchesInsurance.toFixed(0),
      'InsuranceDetail.insuranceTotal': totalAmount.toFixed(0),
      ChangeInsuranceTotalStyle: '',
      saddleValue: standardIndex
    })
  },
  handleChangeSubmit() {
    
    let businessRisks = this.data.businessRisks
    let InsuranceDetail = this.data.InsuranceDetail
    let insurancesAll = {}
    for(let item of businessRisks) {
      if(item.checked) {
        switch (item.name) {
          case '第三者责任险':
            item.amount = InsuranceDetail.liabilityInsurance
            item.index = this.data.liabilityTypesIndex
            break
          case '车辆损失险':
            item.amount = InsuranceDetail.vehicleLossInsurance
            break
          case '全车盗抢险': 
            item.amount = InsuranceDetail.vehicleDQInsurance
            break
          case '玻璃单独破碎险': 
            item.amount = InsuranceDetail.glassBrokenInsurance
            item.index = this.data.glassBrokenTypesIndex
            break
          case '自燃损失险':
            item.amount = InsuranceDetail.gcombustionLossInsurance
            break
          case '不计免赔特约险':
            item.amount = InsuranceDetail.franchiseInsurance
            break
          case '无过责任险': 
            item.amount = InsuranceDetail.responsibilityInsurance
            break
          case '车上人员责任险': 
            item.amount = InsuranceDetail.personnelCarInsurance
            break
          case '车身划痕险': 
            item.amount = InsuranceDetail.scratchesInsurance
            item.index = this.data.scratchesTypesIndex
            break
          default:

            break
        } 
      }
    }
    insurancesAll.businessInsurances = businessRisks
    insurancesAll.trafficInsurance = InsuranceDetail.trafficInsurance
    insurancesAll.insuranceTotal = InsuranceDetail.insuranceTotal
    insurancesAll.saddleValue = this.data.saddleValue
    /**
     * 保存设置.
     */
    try {
      wx.setStorageSync('insurancesAll', JSON.stringify(insurancesAll))
      wx.navigateBack()
    } catch (e) { 

    }
  }
})