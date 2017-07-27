import {
  $wuxToast
} from "../../components/wux"

import { container } from '../../landrover/business/index'

Page({
  data: {
    userPhoneValue: '',
    userCodeValue: '',
    codeText: '获取验证码',
    countDownOver: true,
    countDownClass: '',
    notUserInYMC: false,
    notUserInYMCMessage: '',
    userHasBoundWeixinAccount: false,
    boundSelected: false,
    lockSMSButton: false
  },
  onLoad() {
    const sessionId = container.userService.weixin.sessionId
    if (sessionId != null) {
      container.userService.retrieveWeixinAccountHasBound(sessionId)
        .then((hasBound: boolean) => {
          this.setData({
            userHasBoundWeixinAccount: hasBound
          })
        })
        .catch(err => {
          console.error('请求出错')
        })
    } else {
      wx.showToast({
        title: '微信三方登录...',
        icon: 'loading',
        duration: 10000,
        mask: true
      })
      container.userService.promiseForWeixinLogin
        .then(res => {
          wx.hideToast()
          const realSessionId = res.sessionId
          return container.userService.retrieveWeixinAccountHasBound(realSessionId)
        })
        .then((hasBound: boolean) => {
          this.setData({
            userHasBoundWeixinAccount: hasBound
          })
        })
        .catch(err => {
          wx.hideToast()
        })
    }
  },
  handleLoginPhone(e) {
    let val = e.detail.value
    this.data.userPhoneValue = val
  },
  handleSMSCode(e) {
    let val = e.detail.value
    this.data.userCodeValue = val
  },
  handleGetSMSCode() {
    if (this.data.lockSMSButton === true) {
      return
    }

    if (!this.data.countDownOver) return

    if (!this.data.userPhoneValue || this.data.userPhoneValue.length !== 11) {
      $wuxToast.show({
        type: false,
        timer: 2000,
        color: '#ffffff',
        text: '手机号输入不正确'
      })
      return
    }

    this.setData({
      codeText: '获取中...',
      lockSMSButton: true
    })
    const promise = container.userService.canWeixinAccountLogin(this.data.userPhoneValue)
      .then(res => {
        this.setData({
          notUserInYMC: !res.success,
          notUserInYMCMessage: res.message,
        })
        if (res.success === true) {
          return container.userService.createVCode(this.data.userPhoneValue, 'SMS', 'access', true)
            .then(() => {
              this.countDown()
              this.setData({
                notUserInYMC: false,
                lockSMSButton: false
              })
            })
            .catch(err => {
              return Promise.reject()
            })
        } else {
          return Promise.reject()
        }
      })
      .catch(err => {
        this.setData({
          codeText: '获取验证码',
          lockSMSButton: false
        })
      })
  },
  countDown() {
    let time = 30
    const t = setInterval(() => {
      if (time > 0) {
        time--
        const STR = `已发送(${time}s)`
        this.setData({
          codeText: STR,
          countDownOver: false,
          countDownClass: 'count-down'
        })
      } else {
        clearInterval(t)
        this.setData({
          codeText: '重新获取',
          countDownOver: true,
          countDownClass: ''
        })
      }
    }, 1000)
  },
  userLogin() {
    if (!this.data.userPhoneValue) {
      $wuxToast.show({
        type: false,
        timer: 2000,
        color: '#fff',
        text: '手机号输入不正确'
      })
      return
    }

    if (!this.data.userCodeValue) {
      $wuxToast.show({
        type: false,
        timer: 2000,
        color: '#fff',
        text: '验证码输入不正确'
      })
      return
    }

    if (!this.data.userHasBoundWeixinAccount && !this.data.boundSelected) {
      $wuxToast.show({
        type: false,
        timer: 2000,
        color: '#fff',
        text: '需要选择与微信号绑定才能登录'
      })
      return
    }

    const code = this.data.userCodeValue
    const mobile = this.data.userPhoneValue
    const useCase = 'access'
    const authEntity = { code, mobile, useCase }

    wx.showToast({ title: '登录中...', icon: 'loading', mask: true })
    container.userService.login('code', authEntity, '')
      .then(() => {
        console.log("登录成功")
        return container.userService.boundAccountForWeixin()
      })
      .then(() => {
        console.log("绑定成功")
        wx.navigateBack()
      })
      .catch(err => {
      })
      .then(() => {
        wx.hideToast()
      })
  },
  boundSelectHandler(e) {
    this.setData({
      boundSelected: !this.data.boundSelected
    })
  }

})
