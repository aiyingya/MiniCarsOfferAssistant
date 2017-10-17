import utils from '../../../utils/util'

Page({
  data: {
    insuranceDetail:{
      "iTotal": 0 ,//"保险总额",
      "showDetail": 0,//"是否显示保险明细",
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
      "carSize":0//车辆规格 如：家用6座以下
    },
    otherSumAmount:0
  },
  onLoad(options){

    let insuranceDetail = utils.urlDecodeValueForKeyFromOptions('insuranceDetail', options)
    this.setData({
      insuranceDetail:insuranceDetail,
      otherSumAmount: (Number(insuranceDetail.iTotal) -  Number(insuranceDetail.iJQX)).toFixed(0)
    })
  }
})
