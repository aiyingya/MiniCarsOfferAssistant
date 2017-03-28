//
//  UserService.js 用户登录注册.
//  Version 1.0.0
//
//  Created by pandali on 17-02-23.
//  Copyright (c) 2016年 yaomaiche. All rights reserved.
//
import config from '../lib/config'
import modules from '../lib/modules'
import clientjs from '../lib/client'

class UserService {

  constructor() {
    /**
     * guest | yuntu | weixin
     * @type {string}
     */
    this.loginChannel = 'guest'

    /**
     * 要买车用户登录信息对象
     */
    this.auth = null

    /***
     * 微信用户信息，该对象的存在与否用来标示客户端是否获得微信用户信息
     *
     * appKey "wxd5d5bf6b593d886e"
     * city : ""
     * country : "CN"
     * extra : "en"
     * gender : 1
     * openId : "oJNr60EADGT-ChvW0ValxcGcx29k"
     * province : "Shanghai"
     * weixinName : "傅斌"
     * weixinPortrait : "http://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83eopEuOnnoMv4l2otkB2d209UPSabmhQUzBGPXX3lic2HU3KahDicODEVskez8vzhSZ2qXjGZOibQhTeg/0"
     */
    this.weixinUserInfo = null
    /**
     * 当 loginChannel 为 guest, snsId 是一个 {String}, 来自于 clientId
     * 当 loginChannel 为 yuntu, snsId
     * 当 loginChannel 为 weixin,
     *
     * snsId 用来存在与否服务端对是否获得 用户的微信用户信息
     * 当为 {Number} 时，意味着服务端知晓其微信用户信息
     * 当为 {String} 时，意味着服务端不知晓其微信用户信息
     * @type {String|Number}
     */
    this.snsId = null

    /**
     * 这两个字段不需要持久化，每次进入页面都会获取最新的结果
     * @type {null}
     */
    this.location = null
    this.mobile = null

    this.__loadUserInfo()

    this.getWeixinUserInfo()
    this.getNewAccessToken()
    this.getLocation()
  }

  __loadUserInfo () {
    try {
      const userInfoString = wx.getStorageSync('__userInfo__')
      if (userInfoString) {
        const userInfo = JSON.parse(userInfoString)
        console.log('读取用户信息')
        console.log(userInfo)
        this.loginChannel = userInfo.loginChannel || 'guest'
        this.snsId = userInfo.snsId || null
        this.auth = userInfo.auth || null
        this.weixinUserInfo = userInfo.weixinUserInfo || null
      }
    } catch (e) {
      console.log(e)
    }
  }

  __saveUserInfo () {
    const userInfo = {
      loginChannel: this.loginChannel,
      auth: this.auth,
      weixinUserInfo: this.weixinUserInfo,
      snsId: this.snsId
    }

    console.log("保存用户信息")
    console.log(userInfo)
    try {
      const userInfoString = JSON.stringify(userInfo)
      wx.setStorageSync('__userInfo__', userInfoString)
    } catch (e) {
      console.log(e)
    }
  }

  __clearUserInfo () {
    try {
      wx.removeStorageSync('__userInfo__')
      this.loginChannel = 'guest'
      this.snsId = null
      this.auth = null
      this.weixinUserInfo = null
    } catch (e) {
      console.log(e)
    }
  }

  __sendMessage(opts) {
    const _HTTPS = `${config.ucServerHTTPSUrl}${opts.path}`
    const module = new modules
    module.request({
      url: _HTTPS,
      method: opts.method,
      header: opts.header,
      data: opts.data,
      success: opts.success,
      fail: opts.fail,
      loadingType: 'none'
    })
  }

  // 获取时间戳.
  __getTimestamp(ms) {
    let currentDate = new Date()
    let currentTime = currentDate.getTime()
    let expirationTime = currentTime + ms

    return expirationTime
  }

  /**
   * 获取验证码.
   */
  getSMSCode(opts) {
    if (!opts) return

    console.log('get SMS code')
    this.__sendMessage({
      path: 'cgi/vcode',
      method: 'POST',
      data: {
        "type": "SMS",
        "mobile": opts.mobile,
        "useCase": 'access',// register(注册)/access(登录)/registerOrAccess(注册或登录)/resetPassword(忘记密码)
        "strictlyCheck": true // 是否校验手机号，如果校验，则注册时用户已存在会抛出异常；登录/修改密码时，用户不存在会抛出异常"
      },
      success: opts.success,
      fail: opts.fail
    })
  }

  /**
   * 用户登录
   */
  login(opts) {
    const that = this
    if (!opts) return

    console.log('password login')
    this.__sendMessage({
      path: 'cgi/authorization',
      method: 'POST',
      data: {
        "type": "code",
        "vcode": {
          "mobile": opts.mobile,
          "code": opts.code,
          "useCase": 'access' //"使用场景，枚举：access(注册、登录)/resetPassword(忘记密码)"
        }
      },
      success: function (res) {
        console.log(res)
        if (res) {
          const expireIn = that.__getTimestamp(res.expireMillis)
          res.expireIn = expireIn
          const userInfo = res
          const userInfoString = JSON.stringify(res)
          try {
            that.auth = userInfo
            that.loginChannel = 'yuntu'
            opts.success(res)
            that.__saveUserInfo()
          } catch (e) {
            console.log(e)
          }
        }
      },
      fail: opts.fail
    })
  }

  logout (opts) {
    this.auth = null
    if (typeof this.snsId === 'undefined' || !this.snsId) {
      throw 'snsId 不应该为 空(null) 或者 未定义(undefined) 状态'
    } else if (typeof this.snsId === 'string') {
      this.loginChannel = 'guest'
    } else if (typeof this.snsId === 'number') {
      this.loginChannel = 'weixin'
    }
    this.__saveUserInfo()
  }

  /**
   * 运图账号是否登录
   * @return {boolean|*|null}
   */
  isLogin () {
    return this.loginChannel === 'yuntu' && this.auth
  }

  /**
   *
   * @return {boolean}
   */
  hasWeixinBinding () {
    return typeof this.snsId === 'number'
  }

  /**
   *
   * @return {boolean}
   */
  hasWeixinUserInfo () {
    if (this.weixinUserInfo) {
      return true
    } else {
      return false
    }
  }

  /**
   * 判断用户是否是租户成员
   */

  exsitTenanTmember(opts) {
    if (!opts) return
    console.log('exsit tenant tmeber')
    this.__sendMessage({
      path: 'cgi/tenant/member/exist',
      method: 'GET',
      data: {
        "mobile": opts.mobile,
      },
      success: opts.success,
      fail: opts.fail
    })
  }

  /**
   * 刷新用户信息.
   */
  newAccessToken(opts) {
    console.log('get new accessToken')
    let that = this
    this.__sendMessage({
      method: 'PUT',
      path: 'cgi/authorization',
      header: {
        Authorization: opts.refreshToken
      },
      data: {},
      success: function (res) {
        if (res) {
          let expireIn = that.__getTimestamp(res.expireMillis)
          res.expireIn = expireIn
          const userInfo = res
          try {
            that.auth = userInfo
            that.loginChannel = 'yuntu'
            opts.success(res)
            that.__saveUserInfo()
          } catch (e) {
            console.log(e)
          }
        }
      },
      fail: function (err) {
        opts.fail(err)
      }
    })
  }

  /**
   * 绑定微信号
   */
  userBindWeixin(opts) {
    const snsId = this.weixinUserInfo.snsId
    const userId = this.auth.userId
    this.__sendMessage({
      path: 'cgi/user/weixin/binding',
      method: 'POST',
      header: {
        Authorization: this.auth.accessToken
      },
      data: {
        snsId: snsId,
        userId: userId
      },
      success: opts.success,
      fail: opts.fail
    })
  }

  /**
   * 上传用户微信信息
   */
  uploadWeixinUserInfo(opts) {
    this.__sendMessage({
      path: 'cgi/user/weixin',
      method: 'POST',
      data: {
        "code": opts.authCode,
        "encryptedData": opts.encryptedData,
        "iv": opts.iv
      },
      success: opts.success,
      fail: opts.fail
    })
  }

  getLocationId (opts) {
    const that = this
    this.__sendMessage({
      path: `cgi/tenant/member/${opts.userId}/tenant`,
      method: 'GET',
      data: {},
      header: {
        Authorization: opts.accessToken
      },
      success: opts.success,
      fail: opts.fail
    })
  }

  // /**
  //  * 对某一个供应商关注/取消操作
  //  * @param supplierId
  //  * @param object
  //  */
  // requestFocusOrNotASupplier (supplierId, focusOrNot, object) {
  //   if (supplierId && typeof supplierId === 'string') {
  //     const method = focusOrNot ? 'POST' : 'DELETE'
  //     app.modules.request({
  //       url: app.config.ucServerHTTPSUrl + 'cgi/user/' + app.userInfo().userId + '/focus',
  //       data: {
  //         type: 'supplier',
  //         targetId: supplierId
  //       },
  //       loadingType: 'none',
  //       method: method,
  //       success: object.success,
  //       fail: object.fail,
  //       complete: object.complete
  //     })
  //   } else {
  //     object.fail()
  //     object.complete()
  //   }
  // }

  getNewAccessToken () {
    const currentDate = new Date()
    const currentTime = currentDate.getTime()
    if (this.isLogin()) {
      let token = this.auth.accessToken
      let expireTime = this.auth.expireIn
      let refreshToken = this.auth.refreshToken
      if (currentTime > expireTime) {
        console.log('登录超时，请重新登录')
        this.newAccessToken({
          refreshToken: refreshToken,
          success(res) {
            console.log(res)
          },
          fail(err) {
            console.log(res)
          }
        })
      }
    }
  }

  getLocation () {
    let that = this
    if (this.isLogin()) {
      this.getLocationId({
        userId: this.auth.userId,
        accessToken: this.auth.accessToken,
        success (res) {
          let location = []
          if (res.tenants) {
            for (let item of res.tenants) {
              if (item.address) {
                location.push(item.address)
              }
            }
          }
          that.location = location
          that.mobile = res.mobile
        }
      })
    }
  }

  getWeixinUserInfo (cb) {
    let that = this

    if (this.weixinUserInfo) {
      typeof cb == "function" && cb(this.weixinUserInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function (auth) {
          // 该接口只会在用户第一次进入时使用，并弹出弹框并一直记住当时的选择
          wx.getUserInfo({
            success: function (res) {
              /**
               * 客户端本地获得微信用户信息，此时用户被定义为 guest snsId{null}
               * @type {*}
               */
              if (!that.isLogin()) {
                that.loginChannel = 'guest'
                that.snsId = null
              }
              that.weixinUserInfo = res.auth

              that.uploadWeixinUserInfo({
                authCode: auth.code,
                encryptedData: res.encryptedData,
                iv: res.iv,
                success: function (res2) {
                  /**
                   * 服务端获得微信用户信息，此时用户被定义为 weixin snsId{Number}
                   */
                  if (!that.isLogin()) {
                    that.loginChannel = 'weixin'
                  }
                  that.snsId = res2.snsId
                  that.weixinUserInfo = res2

                  typeof cb == "function" && cb(that.weixinUserInfo)
                  that.__saveUserInfo()
                },
                fail: function () {
                  clientjs.getClientId(function (clientId) {

                    if (!that.isLogin()) {
                      that.snsId = clientId
                    }

                    typeof cb == "function" && cb(that.weixinUserInfo)
                    that.__saveUserInfo()
                  })
                }
              })
            },
            fail: function (res) {
              clientjs.getClientId(function (clientId) {
                if (!that.isLogin()) {
                  that.loginChannel = 'guest'
                  that.snsId = clientId
                }
                that.weixinUserInfo = null
                typeof cb == "function" && cb(that.weixinUserInfo)
                that.__saveUserInfo()
              })
            }
          })
        }
      })
    }
  }
}

export default UserService
