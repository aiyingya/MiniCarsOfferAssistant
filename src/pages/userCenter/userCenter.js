// @flow
import {
  $wuxToast
} from '../../components/wux'

import UserService from '../../services/user.service'
import { container, config } from '../../landrover/business/index'

const userService: UserService = container.userService
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
    manager: false,
    userCenterEntries: [
      {
        name: '报价记录',
        loginNeeded: true,
        roleNameNeeded: 'guest',
        managerNeeded: null,
        iconPath: '/images/icons/tab_icon_price_off.png',
        route: 'quotationsList'
      },
      {
        name: '报价偏好设置',
        loginNeeded: true,
        roleNameNeeded: 'guest',
        managerNeeded: null,
        iconPath: '/images/icons/icon_collection.png',
        route: 'setCost'
      },
      {
        name: '砍价活动管理',
        loginNeeded: true,
        roleNameNeeded: 'employee',
        managerNeeded: false,
        iconPath: '/images/icons/icon_activity_management.png',
        route: 'bargain'
      },
      {
        name: '潜客',
        loginNeeded: true,
        roleNameNeeded: 'employee',
        managerNeeded: true,
        iconPath: '/images/icons/icon_potential_people.png',
        route: 'potential'
      },
      {
        name: '行情备忘',
        loginNeeded: true,
        roleNameNeeded: 'guest',
        managerNeeded: null,
        iconPath: '/images/icons/icon_contact_note.png',
        route: 'carSourceNotes'
      }
    ]
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

      if (userService.role != null) {
        if (userService.role.roleName === 'employee') {
          this.setData({
            isLogin: true,
            roleName: userService.role.roleName,
            manager: userService.role.roleInfo.tenants[0].manager,
            userName: weixinUsersInfo ? weixinUsersInfo.weixinName : '匿名用户',
            userPortrait: weixinUsersInfo ? weixinUsersInfo.portrait : '../../images/icons/icon_head_default_44.png'
          })
        } else if (userService.role.roleName === 'guest') {
          this.setData({
            isLogin: true,
            roleName: userService.role.roleName,
            manager: false,
            userName: weixinUsersInfo ? weixinUsersInfo.weixinName : '匿名用户',
            userPortrait: weixinUsersInfo ? weixinUsersInfo.portrait : '../../images/icons/icon_head_default_44.png'
          })
        }
      }

      userService.getRoleInformation()
        .then(res => {
          if (res == null) {
            return
          }

          if (res.roleName === 'employee') {
            const userInfoForEmployee = res.roleInfo
            this.setData({
              isLogin: true,
              roleName: res.roleName,
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
              roleName: res.roleName,
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
    userService.logout()
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
      })
      .catch(err => {
      })
  },
  onEntryRowClick(e) {
    const entry = e.currentTarget.dataset.item

    if (userService.role == null) {
      console.error('登陆后没有角色信息')
      return
    }

    if (!(
      entry.loginNeeded === true &&
      entry.loginNeeded === userService.isLogin &&
      entry.roleNameNeeded != null &&
      entry.roleNameNeeded === userService.role.roleName
    )) {
      const route = entry.route
      let url = '..'
      if (route === 'quotationsList') {
        url = `${url}/quote`
      }
      url = `${url}/${route}/${route}`
      wx.navigateTo({ url })
    }
  }
})
