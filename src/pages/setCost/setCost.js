import { $wuxToast } from "../../components/wux"
import { $wuxInputNumberDialog } from "../../components/wux"
import { $flexInputDialog } from "../../components/wux"
import { $checkboxDialog } from "../../components/wux"
import util from '../../utils/util'
import { container } from '../../landrover/business/index'

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
      /**
       * 计费方式.
       */

      billingway: ["月息","万元系数"],
      billingwayValue: 0,
      interest: {
        oneInterest: "0",
        twoInterest: "0",
        threeInterest: "0"
      },
      coefficient: {
        oneInterest: "0",
        twoInterest: "0",
        threeInterest: "0"
      },
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
     * 报价单时效.
     */
    // quotationAging: {
    //   agingIndex: 0,
    //   agingValue: ["24","58","-1"],
    //   agingText: ["24小时","48小时","无限制"],
    // },
    /**
     * 报价单时效.
     */
    selectedAging:{
      agingIndex: 0,
      agingData: ["1","2","3"],
      agingValue: ["24","48",""],
      agingText: ["小时","小时","无限制"]
    },
    /**
     * 其他费用.
     */
    othersCost: {
      registration: "500",
      service: "500"
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
    return container.saasService.gettingPreference()
      .then((res) => {
        if (res) {
          console.log(res)
          that.setData({
            "raisePrice.freight": res.freight,
            "raisePrice.profit": res.profit,
            "loan.interest.oneInterest": res.oneInterest,
            "loan.interest.twoInterest": res.twoInterest,
            "loan.interest.threeInterest": res.threeInterest,
            "loan.coefficient.oneInterest": res.oneWYXS,
            "loan.coefficient.twoInterest": res.twoWYXS,
            "loan.coefficient.threeInterest": res.threeWYXS,
            "loan.rebates": res.loanRebate,
            "loan.service": res.loanFee,
            "loan.billingwayValue": res.interestType - 1,
            "othersCost.registration": res.carNumberFee,
            "othersCost.service": res.serviceFee,
            "insurances.rebates": res.insuranceRebate,
            "selectedAging.agingValue[0]": res.validTime.firstChoose,
            "selectedAging.agingValue[1]": res.validTime.secondChoose,
            "selectedAging.agingIndex": (Number(res.validTime.chooseWho) - 1) //1,2,3 - 0,1,2
          })
        }
      })
      .catch(err => {

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
    return container.saasService.gettingInsurance().then((res) => {
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
        if (e.detail.value >= 0 && e.detail.value!="") {
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
  handleChangeBillingway(e) {
    let that = this
    this.setData({
      'loan.billingwayValue': e.detail.value
    })
  },
  /**
   * 设置息费.
   */
  handleChangeInterest() {
    let that = this
    let billingwayValue = this.data.loan.billingwayValue
    let content = billingwayValue == 0 ? '月息(厘)' : '万元系数'
    let inputPlaceholder = billingwayValue == 0 ? '输入月息' : '输入万元系数'
    let inputList = billingwayValue == 0 ? this.data.loan.interest : this.data.loan.coefficient
    let parameter = billingwayValue == 0 ? 'loan.interest' : 'loan.coefficient'
    $flexInputDialog.open({
      title: '计费方式',
      content: content,
      inputList: inputList
      ,
      inputPlaceholder: inputPlaceholder,
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
        console.log(res)
        that.setData({
          [`${parameter}`]: res
        })
      },
      cancel: () => {}
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
  handleChangeLoanService() {
    let that = this
    this.popupInputNumberDialog({
      title: '贷款手续费',
      inputNumber: this.data.loan.service,
      inputNumberPlaceholder: '输入贷款手续费',
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
      title: '代收上牌费',
      inputNumber: this.data.othersCost.registration,
      inputNumberPlaceholder: '输入上牌费',
      dataparameter: 'othersCost.registration'
    })
  },
  /**
   * 服务费.
   */
  handleChangeService() {
    let that = this

    this.popupInputNumberDialog({
      title: '服务费',
      inputNumber: this.data.othersCost.service,
      inputNumberPlaceholder: '输入服务费',
      dataparameter: 'othersCost.service'
    })
  },
  /**
   * 报价单时效.
   */
  // handleChangeAging(e) {
  //   let agingIndex = e.detail.value
  //   this.setData({
  //     'quotationAging.agingIndex': agingIndex
  //   })
  // },
  /**
   * 上报设置信息.
   */
  handlePushSet() {
    let that = this
    let interestType = that.data.loan.billingwayValue == 0 ? 1 : 2
    const _firstChoose = that.data.selectedAging.agingValue[0]
    const _secondChoose = that.data.selectedAging.agingValue[1]
    if(( !!!_firstChoose && _firstChoose !==0) || ( !!!_secondChoose && _secondChoose !==0)){
      wx.showModal({
        title: '提示',
        content: '亲，报价单时效不能为空喔'
      })
      return
    }

    if(_firstChoose === _secondChoose){
      wx.showModal({
        title: '提示',
        content: '亲，报价单时效不能相同喔'
      })
      return
    }

    let data = {
      "insuranceTypes": that.data.insurances.checkedValues,
      "freight": that.data.raisePrice.freight,
      "profit": that.data.raisePrice.profit,
      "oneInterest": that.data.loan.interest.oneInterest,
      "twoInterest": that.data.loan.interest.twoInterest,
      "threeInterest": that.data.loan.interest.threeInterest,
      "oneWYXS": that.data.loan.coefficient.oneInterest,
      "twoWYXS": that.data.loan.coefficient.twoInterest,
      "threeWYXS": that.data.loan.coefficient.threeInterest,
      "interestType": interestType,
      "loanRebate": that.data.loan.rebates,
      "loanFee": that.data.loan.service,
      "carNumberFee": that.data.othersCost.registration,
      "insuranceRebate": that.data.insurances.rebates,
      "serviceFee":that.data.othersCost.service,
      "validTime": {
        "firstChoose":_firstChoose,
        "secondChoose":_secondChoose,
        "chooseWho":that.data.selectedAging.agingData[that.data.selectedAging.agingIndex]
      }
    }
    // console.log(data)
    container.saasService.settingPreference(data)
      .then(res => {
        /**
         * 报价设置已设置.
         */
        try {
          wx.setStorageSync('isSetPreference', 'true')
          wx.navigateBack()
        } catch (e) {

        }
      })
      .catch(err => {
        console.log(res)
      })
  },
  /**
   * 处理单选事件
   *
   * @param {any} e
   */
  agingChange(e) {
    let that = this
    let index = e.detail.value
    that.setData({
      'selectedAging.agingIndex': index
    })
    console.log(index,that.data.selectedAging.agingValue[index])
  },
  agingInput(e) {
    let that = this
    let index = e.currentTarget.dataset.index
    let hours = e.detail.value
    that.setData({
      ['selectedAging.agingValue['+index+']'] : hours
    })
    console.log(index,that.data.selectedAging.agingValue[index])
  }
})
