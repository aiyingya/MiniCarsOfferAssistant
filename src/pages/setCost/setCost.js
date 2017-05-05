import { $wuxToast } from "../../components/wux"
import { $wuxInputNumberDialog } from "../../components/wux"
import { $flexInputDialog } from "../../components/wux"
import { $checkboxDialog } from "../../components/wux"
import util from '../../utils/util'

let app = getApp()

Page({
  data: {
    /**
     * 自动加价.
     */
    raisePrice: {
      freight: "0",
      profit: "0"
    },
    /**
     * 贷款相关.
     */
    loan: {
      billingway: {
        oneInterest: "0",
        twoInterest: "0",
        threeInterest: "0"
      },
      interest: "0",
      rebates: "0",
      service: "0"
    },
    /**
     * 保险相关.
     */
    insurances: {
      rebates: "0",
      insuranceTypeItems: [],
      checkedValues: []
    },
    /**
     * 其他费用.
     */
    othersCost: {
      registration: "500"
    }
  },
  onLoad() {
  
    wx.showToast({
      title: '正在加载',
      icon: 'loading',
      duration: 10000,
      mask: true
    })
    const promise = this.reloadAllData()
    promise.then(res => {
      wx.hideToast()
    }, err => {
      wx.hideToast()
    })
    
  },
  /**
   * 获取报价设置信息.
   *
   * @returns {Promise}
   */
  getDefaultPreference() {
    const that = this
    return app.saasService.gettingPreference().then((res) => {
      if (res) {
        console.log(res)
        that.setData({
          "raisePrice.freight": res.freight,
          "raisePrice.profit": res.profit,
          "loan.billingway.oneInterest": res.oneInterest,
          "loan.billingway.twoInterest": res.twoInterest,
          "loan.billingway.threeInterest": res.threeInterest,
          "loan.rebates": res.loanRebate,
          "loan.service": res.loanFee,
          "othersCost.registration": res.carNumberFee,
          "insurances.rebates": res.insuranceRebate
        })
      }
    }, (err) => {

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
        for(let item of res.insurances) {
          if(item.checked) {
            checkedValues.push(item.id)
          }
        }
        that.setData({
          'insurances.insuranceTypeItems': res.insurances,
          'insurances.checkedValues': checkedValues
        })
      }
    }, (err) => {

    })
  },
  /**
   * 所有数据加载方法
   *
   * @returns {Promise}
   */
  reloadAllData() {
    const promise1 = this.getDefaultPreference()
    const promise2 = this.getDefaultInsurance()
    const promise = Promise.race([promise1, promise2])
    return promise
  },
  /**
   * 弹出框.
   */
  popupInputNumberDialog(options) {
    let that = this
    $wuxInputNumberDialog.open({
      title: options.title,
      inputNumber: options.inputNumber,
      inputNumberPlaceholder: options.inputNumberPlaceholder,
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
        let value = Number(res.inputNumber)
        that.setData({
          [`${options.dataparameter}`]: value
        })
      },
      cancel: () => {}
    })
  },
  /**
   * 设置默认运费.
   */
  handleChangeFreight() {
    let that = this
    this.popupInputNumberDialog({
      title: '默认运费',
      inputNumber: this.data.raisePrice.freight,
      inputNumberPlaceholder: '输入默认运费',
      dataparameter: 'raisePrice.freight'
    })
  },
  /**
   * 设置默认需盈利
   */
  handleChangeProfit() {
    let that = this
    this.popupInputNumberDialog({
      title: '默认需盈利',
      inputNumber: this.data.raisePrice.profit,
      inputNumberPlaceholder: '输入默认需盈利',
      dataparameter:'raisePrice.profit'
    })
  },
  /**
   * 设置计费方式.
   */
  handleChangeBillingway() {
    let that = this
    $flexInputDialog.open({
      title: '计费方式',
      content: '月息(厘)',
      inputList: this.data.loan.billingway,
      inputPlaceholder: '输入月息',
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
        console.log(res)
        that.setData({
          'loan.billingway': res
        })
      },
      cancel: () => {}
    })
  },
  /**
   * 设置月息.
   */
  handleChangeInterest() {
    let that = this
    this.popupInputNumberDialog({
      title: '月息(厘)',
      inputNumber: this.data.loan.interest,
      inputNumberPlaceholder: '输入月息',
      dataparameter: 'loan.interest'
    })
  },
  /**
   * 设置默认返点
   */
  handleChangeRebates() {
    let that = this
    this.popupInputNumberDialog({
      title: '默认返点(%)',
      inputNumber: this.data.loan.rebates,
      inputNumberPlaceholder: '输入默认返点',
      dataparameter: 'loan.rebates'
    })
  },
  /**
   * 设置贷款服务费.
   */
  handleChangeService() {
    let that = this
    this.popupInputNumberDialog({
      title: '贷款服务费',
      inputNumber: this.data.loan.service,
      inputNumberPlaceholder: '输入贷款服务费',
      dataparameter: 'loan.service'
    })
  },
  /**
   * 设置保险返点.
   */
  handleChangeInsuranceRebates() {
    let that = this

    this.popupInputNumberDialog({
      title: '返点(%)',
      inputNumber: this.data.insurances.rebates,
      inputNumberPlaceholder: '输入保险返点',
      dataparameter: 'insurances.rebates'
    })
  },
  /**
   * 设置保险种类.
   */
  handleChangeInsuranceType (e) {
    let that = this
    $checkboxDialog.open({
      title: '请选择险种',
      checkboxItems: this.data.insurances.insuranceTypeItems,
      confirmText: '确定',
      cancelText: '取消',
      validate: (e) => {
        if (e.detail.value > 0) {
          return true
        } else {
          return false
        }
      },
      confirm: (value,checkedValues) => {
        that.setData({
          'insurances.insuranceTypeItems': value,
          'insurances.checkedValues': checkedValues
        })
      },
      cancel: () => {}
    })
  },
  /**
   * 上牌费.
   */
  handleChangeRegistration() {
    let that = this

    this.popupInputNumberDialog({
      title: '上牌费',
      inputNumber: this.data.othersCost.registration,
      inputNumberPlaceholder: '输入保险返点',
      dataparameter: 'othersCost.registration'
    })
  },
  /**
   * 上报设置信息.
   */
  handlePushSet() {
    let that = this
    let data = {
      "insuranceTypes": that.data.insurances.checkedValues,
      "freight": that.data.raisePrice.freight,
      "profit": that.data.raisePrice.profit,
      "oneInterest": that.data.loan.billingway.oneInterest,
      "twoInterest": that.data.loan.billingway.twoInterest,
      "threeInterest": that.data.loan.billingway.threeInterest,
      "interestType": 1,
      "loanRebate": that.data.loan.rebates,
      "loanFee": that.data.loan.service,
      "carNumberFee": that.data.othersCost.registration,
      "insuranceRebate": that.data.insurances.rebates
    }
    console.log(data)
    app.saasService.settingPreference({
      data: data,
      success(res) {
        /**
         * 报价设置已设置.
         */
        try {
          wx.setStorageSync('isSetPreference', 'true')
          wx.navigateBack()
        } catch (e) { 
          
        }
      },
      fail(res) {
        console.log(res)
      }
    })
    
  }
})