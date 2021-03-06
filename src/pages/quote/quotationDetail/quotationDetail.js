import {
  $wuxInputNumberDialog,
  $wuxDialog,
  $qrCodeDialog,
  $wuxTrack,
  $wuxToast
} from "../../../components/wux"
import utils from '../../../utils/util'
import * as wxapi from 'fmt-wxapp-promise'
import { container } from '../../../landrover/business/index'
import Calculate from '../../../utils/calculate'
const app = getApp()

Page({
  data: {
    pageId: 'quotationsDetail',
    pageName: '报价详情',
    // 导航头部数据
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    roleName: null,
    /* 报价单主体数据 */
    quotation: {
      quotationId: '0',
      draftId: '0',
      quotationName: '',
      loanInterest: 0,
      quotationItems: [{
        itemName: '',
        itemPic: '',
        specifications: '',
        guidePrice: '',
        sellingPrice: ''
      }],
      hasLoan: true, // 必传，true/false，boolean，是否贷款
      paymentRatio: 30, // 首付比例（%），decimal，全款时不传，取值范围0~100
      stages: 3, // 贷款期数，int，全款时不传
      expenseRate: 4,
      requiredExpenses: 0, // 必需费用（元），deciaml，取值范围0~999999999,
      otherExpenses: 0, // 其他费用（元），deciaml，取值范围0~999999999",
      advancePayment: 0, // 必传，首次支付金额，如果全款则为全款金额",
      monthlyPayment: 0, // 月供金额，每月还款金额，全款时不传",
      totalPayment: 0, // 总落地价格
      downPaymentAmount: 0,
      loanPaymentAmount: 0,
      remark: '',
      loginChannel: '',
      snsId: '',
      customerMobile: '',
      read: false,
      source: 'quotationDetail',
      pageShare: false,
      rateType: 1, //"费率类型 1 月息 2 万元系数",
      metallicPaintFee: 0
    },
    priceChange: {
      flag: '', // true 为上， false 为下
      price: '', // 1.9 万
      point: '' // 6 点
    },
    cutPriceCount: '',
    cutPriceCountStyle: '',
    isSpecialBranch: false, //宝马、奥迪、MINI展示下xx点
    // 支付比率的显示值
    paymentRatiosValue: 0,
    // 1.14.0 增加的首付和贷款金额
    nakedCarPriceItems: {
      left: { name: '首付款', value: 0, keyPath: 'left' },
      right: { name: '贷款金额', value: 0, keyPath: 'right' }
    },
    nakedCarPriceItemsEdit: false
  },
  onLoad(options) {
    let that = this;
    let quotation = utils.urlDecodeValueForKeyFromOptions('quotation', options)
    let carPrice = quotation.quotationItems[0].sellingPrice
    let officialPrice = quotation.quotationItems[0].guidePrice
    console.log(quotation)
    /// 实时计算优惠点数
    let downPrice = utils.downPrice(carPrice, officialPrice)
    let downPriceFlag = utils.downPriceFlag(downPrice)
    let downPriceString = utils.priceStringWithUnit(downPrice)
    let downPoint = utils.downPoint(carPrice, officialPrice).toFixed(0)
    let cutPriceCount, cutPriceCountStyle
    const isShow = that.isShowDownDot(quotation.quotationItems[0].itemName)
    /**
     * 分享进入页面，在未登录的情况下 跳转到登录页
     */
    if (!container.userService.isLogin()) {
      setTimeout(function () {
        that.setData({
          pageShare: true
        })
      }, 1000)

      this.setData({ options: options })
      wx.navigateTo({
        url: '../../login/login'
      })
    } else {
      const calculate = new Calculate()

      let paymentRatiosValue = 0
      if (that.data.quotation.hasLoan) {
        const isMonth = (quotation.rateType === 1)
        const expenseRate = quotation.expenseRate
        const stages = quotation.stages
        const paymentRatio = quotation.paymentRatio
        const monthRate = isMonth ? expenseRate : calculate.monthlyLoanPaymentRateFrom(expenseRate, stages * 12) // 万元系数

        calculate.nakedCarPrice = carPrice
        calculate.stages = stages * 12
        calculate.downPaymentRate = paymentRatio
        calculate.monthlyLoanPaymentRate = monthRate
        calculate.run()

        quotation.loanInterest = calculate.totalInterestAmount

        paymentRatiosValue = Math.ceil((paymentRatio * 0.1))
      }
      if (quotation.cutPriceCount || quotation.cutPriceCount === 0) {
        cutPriceCount = true
        cutPriceCountStyle = 'cutPriceCountStyle'
      } else {
        cutPriceCount = false
        cutPriceCountStyle = ''
      }

      this.setData({
        quotation: quotation,
        isSpecialBranch: isShow,
        pageShare: false,
        cutPriceCount: cutPriceCount,
        cutPriceCountStyle: cutPriceCountStyle,
        priceChange: {
          flag: downPriceFlag,
          price: downPriceString,
          point: downPoint
        },
        paymentRatiosValue: paymentRatiosValue,
        [`nakedCarPriceItems.left.value`]: calculate.downPaymentAmount,
        [`nakedCarPriceItems.right.value`]: calculate.loanPaymentAmount
      })

      if (wx.showShareMenu) {
        wx.showShareMenu()
      }
    }
  },
  onReady() {

  },
  onShow() {
    this.setData({
      roleName: container.userService.role.roleName
    })

    const event = {
      eventAction: 'pageShow',
      eventLabel: `页面展开`
    }
    $wuxTrack.push(event)

    /**
     * 登录后刷新页面.
     */
    let options = this.data.options
    console.log(`pageShare:${this.data.pageShare}`)
    if (this.data.pageShare === true) {
      this.onLoad(options)
    }
  },
  /**
   * 页面分享.
   */
  onShareAppMessage() {
    let quotation = this.data.quotation
    let quotationInfoKeyValueString = utils.urlEncodeValueForKey('quotation', quotation)
    return {
      title: '要卖车，更好用的卖车助手',
      path: `pages/quote/quotationDetail/quotationDetail?${quotationInfoKeyValueString}`,
      success(res) {
        // 分享成功

      },
      fail(res) {
        // 分享失败
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
  // event handler
  handlerTabClick(e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  handlerEditQuotation(e) {
    let that = this
    const quotationKeyValueString = utils.urlEncodeValueForKey('quotation', this.data.quotation)
    wx.redirectTo({
      url: '/pages/quote/quotationCreate/quotationCreate?' + quotationKeyValueString,
      success: function (res) {
        // success
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },
  handlerContactWithCustomer(e) {
    const phoneNumber = this.data.quotation.customerMobile
    wxapi.makePhoneCall({ phoneNumber: phoneNumber })
      .catch(err => {
        if (err.message === 'makePhoneCall:fail cancel') {
          return Promise.reject(err)
        }
        // 如果拨打电话出错， 则统一将电话号码写入黏贴板
        if (phoneNumber && phoneNumber.length) {
          if (wx.canIUse('setClipboardData')) {
            wxapi.setClipboardData({ data: phoneNumber })
              .then(() => {
                $wuxToast.show({
                  type: 'text',
                  timer: 3000,
                  color: '#fff',
                  text: '号码已复制， 可粘贴拨打'
                })
              })
              .catch(err => {
                console.error(err)
                $wuxToast.show({
                  type: 'text',
                  timer: 2000,
                  color: '#fff',
                  text: '号码复制失败， 请重试'
                })
              })
          } else {
            $wuxToast.show({
              type: 'text',
              timer: 2000,
              color: '#fff',
              text: '你的微信客户端版本太低， 请尝试更新'
            })
            return Promise.reject(err)
          }
        }
      })

    // 这里打给客户 不需要上报手机
  },
  //
  handlerShareToCustomer(e) {
    let that = this;

    $wuxInputNumberDialog.open({
      title: '发送给客户',
      inputNumberPlaceholder: '输入对方手机号码',
      confirmText: '发送报价单',
      cancelText: '暂不发送',
      validate: function (e) {
        let mobile = e.detail.value
        return mobile.length === 11
      },
      confirm: (res) => {
        let mobile = res.inputNumber
        const quotation = that.data.quotation
        container.saasService.requestPublishQuotation(quotation.draftId, mobile, quotation.customerName, quotation.customerSex, true, quotation.validTime)
          .then(res => {
            let quotation = res

            app.fuckingLarryNavigatorTo.quotation = quotation
            app.fuckingLarryNavigatorTo.source = that.data.source

            wx.navigateBack({
              delta: 1, // 回退前 delta(默认为1) 页面
              success: function (res) {
                // success
              },
              fail: function () {
                // fail
              },
              complete: function () {
                // complete
              }
            })
          })
      },
      cancel: () => {

      }
    })
  },
  // 非编辑态下的订车按钮
  handlerBookCar(e) {
    const that = this

    $wuxDialog.open({
      title: '提示',
      content: '发起定车后， 将会有工作人员与您联系',
      buttons: [
        {
          text: '发起订车',
          type: 'weui-dialog__btn_primary',
          onTap: function () {
            const quotationItem = that.data.quotation.quotationItems[0]
            container.saasService.requestBookCar(
              quotationItem.itemName,
              quotationItem.specifications,
              quotationItem.guidePrice,
              1
            )
              .then(res => {
                wx.showModal({
                  content: '提交成功，请保持通话畅通',
                  success: function (res) {
                    if (res.confirm) { }
                  }
                })
              })
              .catch(err => {
                wx.showModal({
                  title: '提示',
                  content: err.alertMessage,
                  success: function (res) {
                    if (res.confirm) {
                      console.log('用户点击确定')
                    }
                  }
                })
              })
          }
        },
        {
          text: '取消',
          onTap: function () {
            // 取消
          }
        }
      ]
    })
  },
  lookDetail() {
    if (!this.data.quotation.insuranceDetail.showDetail) {
      return
    }
    let insuranceDetail = utils.urlEncodeValueForKey('insuranceDetail', this.data.quotation.insuranceDetail)
    wx.navigateTo({
      url: `../../insurance/insuranceDetail/insuranceDetail?${insuranceDetail}`
    })
  },
  isShowDownDot(name) {
    if (name.indexOf('宝马') > -1 || name.indexOf('奥迪') > -1 || name.indexOf('MINI') > -1) {
      return true;
    }
    return false;
  },
  /**
   * 发起砍价活动.
   */

  handlerBargainActive(e) {
    if (container.userService.role.roleName === 'guest') {
      $wuxToast.show({
        type: 'text',
        timer: 2000,
        color: '#fff',
        text: '体验权限暂时无法使用发起砍价功能'
      })

      return
    }

    let that = this
    const quotationItem = that.data.quotation
    const tenantId = container.userService.address.tenantId
    console.log(quotationItem)
    const cutPriceCount = this.data.cutPriceCount

    if (cutPriceCount) return
    container.saasService.getBargainQRcode(
      quotationItem.quotationId,
      tenantId,
      300,
      300
    ).then((res) => {
      console.log(res)
      $qrCodeDialog.open({
        content: res
      })
    }, (err) => {

    })
  }

})
