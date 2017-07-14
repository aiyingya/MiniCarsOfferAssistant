import {
  $wuxToast
} from "../../components/wux"
const app = getApp()

Page({
  data: {
    userPhoneValue: '',
    userCodeValue: '',
    codeText: '获取验证码',
    countDownOver: true,
    countDownClass: '',
    notUserInYMC: false
  },
  onLoad() {},
  handleLoginPhone(e) {
    let val = e.detail.value
    this.data.userPhoneValue = val
  },
  handleSMSCode(e) {
    let val = e.detail.value
    this.data.userCodeValue = val
  },
  handleGetSMSCode() {
    let that = this

    if (!that.data.countDownOver) return

    console.log(this.data.userPhoneValue)

    if (!this.data.userPhoneValue || this.data.userPhoneValue.length !== 11) {
      $wuxToast.show({
        type: false,
        timer: 2000,
        color: '#fff',
        text: '手机号输入不正确'
      })
      return
    }
    app.userService.exsitTenanTmember(this.data.userPhoneValue)
      .then(res => {
        if (res) {
          app.userService.getSMSCode(that.data.userPhoneValue)
            .then(res => {
              this.countDown()
              this.setData({
                notUserInYMC: false
              })
            })
        } else {
          that.setData({
            notUserInYMC: true
          })
        }
      }, err => {
        $wuxToast.show({
          type: false,
          timer: 2000,
          color: '#fff',
          text: '服务器错误，请稍后再试'
        })
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
    let that = this
    if (!that.data.userPhoneValue) {
      $wuxToast.show({
        type: false,
        timer: 2000,
        color: '#fff',
        text: '手机号输入不正确'
      })
      return
    }

    if (!that.data.userCodeValue) {
      $wuxToast.show({
        type: false,
        timer: 2000,
        color: '#fff',
        text: '验证码输入不正确'
      })
      return
    }

    app.userService.login(that.data.userPhoneValue, that.data.userCodeValue)
      .then(res => {
        if (res) {
          if (app.userService.hasWeixinUserInfo()) {
            app.userService.userBindWeixin()
              .then(res => {
                wx.navigateBack()
              }, err => {
                wx.navigateBack()
              })
          } else {
            wx.navigateBack()
          }
        }
      }, err => {
        $wuxToast.show({
          type: false,
          timer: 2000,
          color: '#fff',
          text: err.message
        })
      })
  }
})
