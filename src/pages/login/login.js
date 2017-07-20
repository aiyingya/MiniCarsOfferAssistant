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
    container.userService.retrieveWeixinAccountHasBound(sessionId)
      .then((hasBound: boolean) => {
        this.setData({
          userHasBoundWeixinAccount: hasBound
        })
      })
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
    if (this.data.lockSMSButton) return

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

    this.data.lockSMSButton = true
    const promise = container.userService.canWeixinAccountLogin(this.data.userPhoneValue)
      .then(res => {
        this.data.lockSMSButton = false
        this.setData({
          notUserInYMC: !res.success,
          notUserInYMCMessage: res.message
        })
        if (res.success === true) {
          return container.userService.createVCode(this.data.userPhoneValue)
        } else {
          return Promise.reject(new Error('cancel_error'))
        }
      })
      .then(() => {
        this.countDown()
        this.setData({
          notUserInYMC: false
        })
      })
      .catch(err => {
        if (err.message === 'cancel_error') {
        } else {
          this.data.lockSMSButton = false

          $wuxToast.show({
            type: false,
            timer: 2000,
            color: '#ffffff',
            text: '服务器错误，请稍后再试'
          })
        }
      })
  },
  countDown() {
    let time = 30
    let that = this
    let t = setInterval(function () {
      if (time > 0) {
        time--
        let STR = `已发送(${time}s)`
        that.setData({
          codeText: STR,
          countDownOver: false,
          countDownClass: 'count-down'
        })
      } else {
        clearInterval(t)
        that.setData({
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
        text: '需要选择与微信号绑定才能登陆'
      })
      return
    }

    const code = this.data.userCodeValue
    const mobile = this.data.userPhoneValue
    const useCase = 'access'
    const authEntity = { code, mobile, useCase }

    container.userService.login('code', authEntity, '')
      .then(res => {
        console.log('登陆成功!')
      })
      .catch(err => {
        $wuxToast.show({
          type: false,
          timer: 2000,
          color: '#fff',
          text: err.message
        })
        return Promise.reject()
      })
      .then(() => {
        container.userService.boundAccountForWeixin()
          .then(() => {
            wx.navigateBack()
          })
          .catch(err => {
            console.log
          })
      })
  },
  boundSelectHandler(e) {
    this.setData({
      boundSelected: !this.data.boundSelected
    })
  }

})
