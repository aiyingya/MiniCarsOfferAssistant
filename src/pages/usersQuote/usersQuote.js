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
        fail: function () {
          app.fuckingLarryNavigatorTo.quotation = null
          app.fuckingLarryNavigatorTo.source = null
        },
        complete: function () {}
      })
    }

    if (app.userService.isLogin()) {
      const userInfo = app.userService.auth
      const weixinUsersInfo = app.userService.weixinUserInfo

      this.setData({
        isLogin: true
      })
      app.userService.getLocation()
        .then(res => {
          this.setData({
            userName: weixinUsersInfo ? weixinUsersInfo.nickName || res.mobile : '',
            userPortrait: weixinUsersInfo ? weixinUsersInfo.avatarUrl : '../../images/icons/icon_head_default_44.png',
            userMobile: res.mobile,
            userTenants: res.tenants
          })
        }, err => {
          $wuxToast.show({
            type: false,
            timer: 2000,
            color: '#fff',
            text: '服务器错误'
          })
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
    app.userService.logout()
      .then(res => {
        that.setData({
          isLogin: false,
          userName: '',
          userMobile: '',
          userPortrait: '../../images/icons/icon_head_default_44.png',
          userTenants: ''
        })
      }, err => {
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
  }
})
