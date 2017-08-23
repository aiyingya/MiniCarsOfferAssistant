import {
  $wuxToast
} from "../../components/wux"
import { container, config } from '../../landrover/business/index'

const app = getApp()

Page({
  data: {
    isLogin: false,
    roleName: null,
    userName: '',
    userMobile: '',
    userPortrait: '../../images/icons/icon_head_default_44.png',
    userTenants: '',
    version: config.version,
    manager: false
  },
  onLoad() {
    let version = null
    if (config.env === 'prd') {
      version = `v${config.version}`
    } else {
      version = `v${config.version}.${config.build}-${config.env}`
    }
    this.setData({
      version
    })
  },
  onShow() {
    /**
     * fucking larry 跳转流程
     * @type {*}
     */
    let quotation = app.fuckingLarryNavigatorTo.quotation
    let source = app.fuckingLarryNavigatorTo.source

    if (quotation && typeof quotation === 'object') {
      wx.navigateTo({
        url: '/pages/quote/quotationsList/quotationsList',
        success: function (res) { },
        fail: function () {
          app.fuckingLarryNavigatorTo.quotation = null
          app.fuckingLarryNavigatorTo.source = null
        },
        complete: function () { }
      })
    }

    if (container.userService.isLogin()) {
      // 如果是雇员
      const userInfo = container.userService.auth
      const weixinUsersInfo = container.userService.weixin.userInfo

      if (container.userService.role != null) {
        if (container.userService.role.roleName === 'employee') {
          this.setData({
            isLogin: true,
            roleName: container.userService.role.roleName,
            manager: container.userService.role.roleInfo.tenants[0].manager,
            userName: weixinUsersInfo ? weixinUsersInfo.weixinName : '匿名用户',
            userPortrait: weixinUsersInfo ? weixinUsersInfo.portrait : '../../images/icons/icon_head_default_44.png'
          })
        } else if (container.userService.role.roleName === 'guest') {
          this.setData({
            isLogin: true,
            roleName: container.userService.role.roleName,
            manager: false,
            userName: weixinUsersInfo ? weixinUsersInfo.weixinName : '匿名用户',
            userPortrait: weixinUsersInfo ? weixinUsersInfo.portrait : '../../images/icons/icon_head_default_44.png'
          })
        }
      }

      container.userService.getRoleInformation()
        .then(res => {
          if (res.roleName === 'employee') {
            const userInfoForEmployee = res.roleInfo
            this.setData({
              isLogin: true,
              roleName: userInfoForEmployee.roleName,
              userMobile: userInfoForEmployee.mobile,
              userName: weixinUsersInfo ? weixinUsersInfo.weixinName || userInfoForEmployee.mobile : '匿名用户',
              userPortrait: weixinUsersInfo ? weixinUsersInfo.portrait : '../../images/icons/icon_head_default_44.png',
              userTenants: userInfoForEmployee.tenants,
              manager: userInfoForEmployee.tenants[0].manager
            })
          } else if (res.roleName === 'guest') {
            const userInfoForGuest = res.roleInfo
            this.setData({
              isLogin: true,
              roleName: userInfoForGuest.roleName,
              userMobile: userInfoForGuest.mobile,
              userName: weixinUsersInfo ? weixinUsersInfo.weixinName || userInfoForGuest.mobile : '匿名用户',
              userPortrait: weixinUsersInfo ? weixinUsersInfo.portrait : '../../images/icons/icon_head_default_44.png',
              userTenants: '',
              manager: false
            })
          }
        })
        .catch(err => {
        })
    } else {
      this.setData({
        isLogin: false,
        roleName: null,
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
    container.userService.logout()
      .then(res => {
        this.setData({
          isLogin: false,
          roleName: null,
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
