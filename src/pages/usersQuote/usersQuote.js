import {
  $wuxToast
} from "../../components/wux"

let app = getApp()

Page({
  data: {
    isLogin: false,
    userName: '',
    userMobile: '',
    userPortrait: '../../images/icons/icon_head_default_44.png',
    userTenants: ''
  },
  onLoad() {},
  onShow() {
    let that = this

    /**
     * fucking larry 跳转流程
     * @type {*}
     */
    let quotation = app.fuckingLarryNavigatorTo.quotation
    let source = app.fuckingLarryNavigatorTo.source

    if (quotation && typeof quotation === 'object') {
      wx.navigateTo({
        url: '/pages/quote/quotationsList/quotationsList',
        success: function (res) {},
        fail: function () {},
        complete: function () {}
      })
    }

    if (app.userService.isLogin()) {
      const userInfo = app.userService.auth
      const weixinUsersInfo = app.userService.weixinUserInfo

      this.setData({
        isLogin: true
      })
      app.userService.getLocation({
        success: function (res) {
          that.setData({
            userName: weixinUsersInfo ? weixinUsersInfo.weixinName || res.mobile : '',
            userPortrait: weixinUsersInfo ? weixinUsersInfo.weixinPortrait : '../../images/icons/icon_head_default_44.png',
            userMobile: res.mobile,
            userTenants: res.tenants
          })
        },
        fail: function (err) {
          $wuxToast.show({
            type: false,
            timer: 2000,
            color: '#fff',
            text: '服务器错误'
          })
        }
      })
    } else {
      this.setData({
        isLogin: false,
        userName: '',
        userMobile: '',
        userPortrait: '../../images/icons/icon_head_default_44.png',
        userTenants: ''
      })
    }
  },
  handleToLogin() {
    wx.navigateTo({
      url: '../login/login'
    })
  },
  handleUserLogout() {
    let that = this
    app.userService.logout({
      success: function () {
        that.setData({
          isLogin: false,
          userName: '',
          userMobile: '',
          userPortrait: '../../images/icons/icon_head_default_44.png',
          userTenants: ''
        })
      },
      fail: function () {
        // do nothing
      }
    })
  },
  handleToQuoteRecord() {
    if (app.userService.isLogin()) {
      wx.navigateTo({
        url: '../quote/quotationsList/quotationsList'
      })
    }
  },
  handleToSupplier() {
    if (app.userService.isLogin()) {
      wx.navigateTo({
        url: '../supplier/supplier'
      })
    }
  },
  handleToSetcost() {
    if (app.userService.isLogin()) {
      wx.navigateTo({
        url: '../setCost/setCost'
      })
    }
  },
  handleToInsurance() {
    if (app.userService.isLogin()) {
      wx.navigateTo({
        url: '../insurance/insurance'
      })
    }
  }
})
