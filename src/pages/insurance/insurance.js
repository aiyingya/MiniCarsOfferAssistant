let app = getApp()
import util from '../../utils/util'
Page({
  data: {
    InsuranceDetail: {
      /**
       * 保险总额.
       */
      insuranceTotal: '',
      /**
       * 商业险总额.
       */
      businessTatal: '',
      /**
       * 交强险.
       */
      trafficInsurance: 950,
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
    standards: ["家用6座以下", "家用6座以上"],
    standardIndex: 0,
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
        glassBroken: {
          domestic: 0.002,
          import: 0.0033
        }
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
        glassBroken: {
          domestic: 0.002,
          import: 0.0033
        }
      }
    },
    /**
     * 商业险类型.
     */
    businessRisks: [
      {name: '第三方责任险', id: '0', checked: true},
      {name: '车辆损失险', id: '1'},
      {name: '全车盗抢险', id: '2'},
      {name: '玻璃单独破碎险', id: '3'},
      {name: '自然损失险', id: '4'},
      {name: '不计免赔特约险', id: '5'},
      {name: '无过责任险', id: '6'},
      {name: '车上人员责任险', id: '7'},
      {name: '车身划痕险', id: '8'}
    ],
    /**
     * 裸车价.
     */
    officialPrice: 0
  },
  onLoad(options) {
    let carModelInfo = util.urlDecodeValueForKeyFromOptions('carModelInfo', options)
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
    
    
    this.data.officialPrice = carModelInfo.officialPrice

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
    let trafficInsurance = e.detail.value == 0 ? 950 : 1100
    console.log(trafficInsurance,e.detail.value)
    this.setData({
      standardIndex: e.detail.value,
      'InsuranceDetail.trafficInsurance': trafficInsurance
    })
  },
  bindChangeBusinessRisks(e) {  
    let businessRisks = this.data.businessRisks
    let values = e.detail.value
    for (let item of businessRisks) {
      item.checked = false
      for (let val of values) {
        if(item.id == val){
          item.checked = true
          break
        }
      }
    }
    this.setData({
      businessRisks: businessRisks
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
    let standardIndex = this.data.standardIndex 
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
    for(let item of businessRisks) { 
      if(item.checked) {
        switch (item.name) {
          case '第三方责任险':
            liabilityInsurance = standardIndex == 0 ? this.data.spuStandard.spuUnderSix.liability[10]
                                                    : this.data.spuStandard.spuAboveSix.liability[10]
            businessTatal += liabilityInsurance
            break
          case '车辆损失险':
            let basis = standardIndex == 0 ? this.data.spuStandard.spuUnderSix.vehicleBasis
                                           : this.data.spuStandard.spuAboveSix.vehicleBasis
            vehicleLossInsurance = basis + officialPrice*0.128
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
            let glassBrokenRate = standardIndex == 0 ? this.data.spuStandard.spuUnderSix.glassBroken.domestic
                                                     : this.data.spuStandard.spuAboveSix.glassBroken.domestic
            glassBrokenInsurance = officialPrice*glassBrokenRate
            businessTatal += glassBrokenInsurance
            break
          default:

            break
        }  
      }    
    }
    
    that.setData({
      'InsuranceDetail.businessTatal': businessTatal.toFixed(2),
      'InsuranceDetail.liabilityInsurance': liabilityInsurance,
      'InsuranceDetail.vehicleLossInsurance': vehicleLossInsurance,
      'InsuranceDetail.vehicleDQInsurance': vehicleDQInsurance,
      'InsuranceDetail.glassBrokenInsurance': glassBrokenInsurance
      
    })
    
    console.log(businessTatal)
  }
  
})