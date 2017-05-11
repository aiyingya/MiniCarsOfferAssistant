import {
  $wuxInputNumberDialog,
  $wuxDialog
} from "../../../components/wux"
import util from '../../../utils/util'
const app = getApp()

Page({
  data: {
    // 导航头部数据
    activeIndex: 0,
    slderOffset: 0,
    sliderLeft: 0,

    /* 报价单主体数据 */
    quotation: {
      quotationId: '0',
      draftId: '0',
      quotationName: '',
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
      remark: '',
      loginChannel: '',
      snsId: '',
      customerMobile: '',
      read: false,
      source: 'quotationDetail',
      pageShare: false,
      rateType:1 //"费率类型 1 月息 2 万元系数",
    },
    priceChange: {
      flag: '', // true 为上， false 为下
      price: '', // 1.9 万
      point: '' // 6 点
    }
  },
  onLoad(options) {
    let that = this;
    let quotation = util.urlDecodeValueForKeyFromOptions('quotation', options)
    let carPrice = quotation.quotationItems[0].sellingPrice
    let officialPrice = quotation.quotationItems[0].guidePrice

    /// 实时计算优惠点数
    let downPrice = util.downPrice(carPrice, officialPrice)
    let downPriceFlag = util.downPriceFlag(downPrice);
    let downPriceString = util.priceStringWithUnit(downPrice)
    let downPoint = util.downPoint(carPrice, officialPrice).toFixed(0)

    /**
     * 分享进入页面，在未登录的情况下 跳转到登录页
     */
    if (!app.userService.isLogin()) {
      setTimeout(function(){
        that.setData({
          pageShare: true
        })
      },1000)
      this.setData({options: options})
      wx.navigateTo({
        url: '../../login/login'
      })
    }else {
      this.setData({
        quotation: quotation,
        pageShare: false,
        priceChange: {
          flag: downPriceFlag,
          price: downPriceString,
          point: downPoint
        }
      })
      wx.showShareMenu()
    }
  },
  onReady() {

  },
  onShow() {
    /**
     * 登陆后刷新页面.
     */
    let options = this.data.options
    console.log(`pageShare:${this.data.pageShare}`)
    if(this.data.pageShare === true) {
      this.onLoad(options)
    }
  },
  /**
   * 页面分享.
   */
  onShareAppMessage () {
    let quotation = this.data.quotation
    let quotationInfoKeyValueString = util.urlEncodeValueForKey('quotation', quotation)
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
    const quotationKeyValueString = util.urlEncodeValueForKey('quotation', this.data.quotation)
    wx.navigateTo({
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
    let that = this;
    wx.makePhoneCall({
      phoneNumber: this.data.quotation.customerMobile,
      success: (res) => {
        console.log('拨打电话' + that.data.quotation.customerMobile + '成功');
      }
    })
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
        app.saasService.requestPublishQuotation(that.data.quotation.draftId, mobile, {
          success: (res) => {
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
          },
          fail: () => {
            //
          },
          complete: () => {

          }
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
      buttons: [{
          text: '发起订车',
          type: 'weui-dialog__btn_primary',
          onTap: function () {
            const quotationItem = that.data.quotation.quotationItems[0]
            app.saasService.requestBookCar(quotationItem.itemName, quotationItem.specifications, quotationItem.guidePrice, 1, {
              success: (res) => {
                wx.showModal({
                  content: '提交成功，请保持通话畅通',
                  success: function (res) {
                    if (res.confirm) {}
                  }
                })
              },
              fail: (err) => {
                wx.showModal({
                  title: '提示',
                  content: err.alertMessage,
                  success: function (res) {
                    if (res.confirm) {
                      console.log('用户点击确定')
                    }
                  }
                })
              },
              complete: () => {

              }
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
  }
})
