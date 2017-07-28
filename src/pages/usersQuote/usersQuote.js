import {
  $wuxToast
} from "../../components/wux"
import { container, config } from '../../landrover/business/index'

const app = getApp()

Page({
  data: {
    isLogin: false,
    userName: '',
    userMobile: '',
    userPortrait: '../../images/icons/icon_head_default_44.png',
    userTenants: '',
    version: config.version,
    manager: false
  },
  onLoad() {
    let version = null
    let manager = container.userService.isLogin() ? container.userService.userInfoForTenant.tenants[0].manager : false
    if (config.env === 'prd') {
      version = `v${config.version}`
    } else {
      version = `v${config.version}.${config.build}-${config.env}`
    }
    this.setData({
      version,
      manager: manager
    })
  },
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

    if (container.userService.isLogin()) {
      const userInfo = container.userService.auth
      const weixinUsersInfo = container.userService.weixin.userInfo

      this.setData({
        isLogin: true,
        userName: weixinUsersInfo ? weixinUsersInfo.weixinName : '匿名用户',
        userPortrait: weixinUsersInfo ? weixinUsersInfo.portrait : '../../images/icons/icon_head_default_44.png'
      })
      container.userService.getLocation()
        .then(res => {
          this.setData({
            userMobile: res.mobile,
            userTenants: res.tenants,
            manager: container.userService.userInfoForTenant.tenants[0].manager,
            userName: weixinUsersInfo ? weixinUsersInfo.weixinName || res.mobile : '匿名用户',
            userPortrait: weixinUsersInfo ? weixinUsersInfo.portrait : '../../images/icons/icon_head_default_44.png',
          })
        })
        .catch(err => {
        })
    } else {
      this.setData({
        isLogin: false,
        userName: '',
        userMobile: '',
        userPortrait: '../../images/icons/icon_head_default_44.png',
        userTenants: '',
        manager: false
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
    container.userService.logout()
      .then(res => {
        that.setData({
          isLogin: false,
          userName: '',
          userMobile: '',
          userPortrait: '../../images/icons/icon_head_default_44.png',
          userTenants: '',
          manager: false
        })
      }, err => {
      })
  },
  handleToNewPages(e) {
    const page = e.currentTarget.dataset.page
    if (container.userService.isLogin()) {
      wx.navigateTo({
        url: `../${page}/${page}`
      })
    }
  },
  handleToQuoteRecord() {
    if (container.userService.isLogin()) {
      wx.navigateTo({
        url: '../quote/quotationsList/quotationsList'
      })
    }
  }
})
