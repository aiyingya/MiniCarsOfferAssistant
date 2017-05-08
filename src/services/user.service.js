//
//  UserService.js 用户登录注册.
//  Version 1.0.0
//
//  Created by pandali on 17-02-23.
//  Copyright (c) 2016年 yaomaiche. All rights reserved.
//

import Service from './base.service'
import Util from '../utils/util'
import config from '../config'
import * as wxapi from 'wxapp-promise'


export default class UserService extends Service {

  static AuthKey = config.getNamespaceKey('auth')
  static ClientIdKey = config.getNamespaceKey('clientId')

  static GuestLogin = 'guest'
  static WexinLogin = 'weixin'
  static YuntuLogin = 'yuntu'

  urls = {
    dev: 'https://test.yaomaiche.com/ucdev/',
    gqc: 'https://test.yaomaiche.com/ucgqc/',
    prd: 'https://uc.yaomaiche.com/uc/'
  }

  constructor () {
    super()



    /**
     * guest | yuntu | weixin
     * @type {string}
     */
    this.loginChannel = UserService.GuestLogin

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

    this.clientId = null
    /**
     * 用户是否设置过报价设置.
     */
    this.isSetPreference = function() {
      const setPreference = wx.getStorageSync('isSetPreference') || 'false'
      return setPreference
    }

    this.__getClientId(function(clientId) {
      console.log('本次的用户的 clientId 为' + clientId)
    })
    this.__loadUserInfo()

    this.getWeixinUserInfo()
    this.getNewAccessToken()
    this.getLocation({
      success: function () { },
      fail: function () { }
    })
  }

  sendMessage(opts, loadingType = 'none') {
    opts.loadingType = loadingType
    super.sendMessage(opts)
  }

  __loadUserInfo () {
    try {
      const userInfoString = wx.getStorageSync(UserService.AuthKey)
      if (userInfoString) {
        const userInfo = JSON.parse(userInfoString)
        console.log('读取用户信息',userInfo)
        this.loginChannel = userInfo.loginChannel || UserService.GuestLogin
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

    console.log("保存用户信息",userInfo)
    try {
      const userInfoString = JSON.stringify(userInfo)
      wx.setStorageSync(UserService.AuthKey, userInfoString)
    } catch (e) {
      console.log(e)
    }
  }

  __clearUserInfo () {
    try {
      wx.removeStorageSync(UserService.AuthKey)
      this.loginChannel = UserService.GuestLogin
      this.snsId = null
      this.auth = null
      this.weixinUserInfo = null
    } catch (e) {
      console.log(e)
    }
  }

  // 获取时间戳.
  __getTimestamp(ms) {
    let currentDate = new Date()
    let currentTime = currentDate.getTime()
    let expirationTime = currentTime + ms

    return expirationTime
  }

  __setClientId (clientId) {
    this.clientId = clientId
    try {
      wx.setStorageSync(UserService.ClientIdKey, clientId);
    } catch (e) {
      console.log('设置删除 clientId 发生错误' + e)
    }
  }

  __getClientId (cb, forceUpdate=false) {
    let that = this
    if (forceUpdate) {
      that.__requestClientId(cb)
    } else {
      if (this.clientId && this.clientId.length) {
        typeof cb === 'function' && cb(this.clientId)
      } else {
        try {
          let clientId = wx.getStorageSync(UserService.ClientIdKey)

          if (clientId && clientId.length) {
            that.clientId = clientId
            typeof cb === 'function' && cb(this.clientId)
          } else {
            try {
              wx.removeStorageSync(UserService.ClientIdKey)
            } catch (e) {
              console.log('同步删除 clientId 发生错误' + e);
            }
            that.__requestClientId(cb)
          }
        } catch (e) {
          console.log('同步获取 clientId 发生错误' + e);
        }
      }
    }
  }

  __requestClientId (cb) {
    let that = this
    const DeviceKey = config.getNamespaceKey('deviceId')
    const deviceId = wx.getStorageSync(DeviceKey)
    this.getVisitor({
      deviceId: deviceId,
      success: function(res) {
        console.log("__requestClientId",res)
        that.clientId = res.clientId
        that.__setClientId(that.clientId)
        typeof cb === 'function' && cb(that.clientId)
      },
      fail: function() {
        // 网络请求失败
        typeof cb === 'function' && cb(null)
      }
    })
  }

  /**
   * 获取验证码.
   */
  getSMSCode(opts) {
    if (!opts) return

    console.log('get SMS code')

    this.sendMessage({
      path: 'cgi/vcode',
      method: 'POST',
      data: {
        "type": "SMS",
        "mobile": opts.mobile,
        "useCase": 'access',// register(注册)/access(登录)/registerOrAccess(注册或登录)/resetPassword(忘记密码)
        "strictlyCheck": true // 是否校验手机号，如果校验，则注册时用户已存在会抛出异常；登录/修改密码时，用户不存在会抛出异常"
      },
      success: opts.success,
      fail: opts.fail,
      complete:opts.complete
    })
  }

  /**
   * 用户登录
   */
  login(opts) {
    const that = this
    if (!opts) return

    console.log('password login')
    this.sendMessage({
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
        // console.log(res)
        if (res) {
          const expireIn = that.__getTimestamp(res.expireMillis)
          res.expireIn = expireIn
          that.auth = res
          that.loginChannel = UserService.YuntuLogin
          opts.success(res)
          that.__getClientId(function (clientId) {}, true)
          that.__saveUserInfo()
          //登录时记录用户信息
          that.getLocation({
            success: function () { },
            fail: function () { }
          })
        }
      },
      fail: opts.fail
    }, 'toast')
  }



  logout (opts) {
    this.auth = null
    if (typeof this.snsId === 'undefined' || !this.snsId) {
      throw 'snsId 不应该为 空(null) 或者 未定义(undefined) 状态'
    } else if (typeof this.snsId === 'string') {
      this.loginChannel = UserService.GuestLogin
    } else if (typeof this.snsId === 'number') {
      this.loginChannel = UserService.WexinLogin
    }
    this.__saveUserInfo()

    this.__getClientId(function (clientId) {}, true)

    opts.success()
  }

  /**
   * 运图账号是否登录
   * @return {boolean|*|null}
   */
  isLogin () {
    return this.loginChannel === UserService.YuntuLogin && this.auth
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
    this.sendMessage({
      path: 'cgi/tenant/member/exist',
      method: 'GET',
      data: {
        "mobile": opts.mobile
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
    this.sendMessage({
      method: 'PUT',
      path: 'cgi/authorization',
      header: {
        Authorization: this.auth.refreshToken
      },
      data: {},
      success: function (res) {
        if (res) {
          let expireIn = that.__getTimestamp(res.expireMillis)
          res.expireIn = expireIn
          that.auth = res
          that.loginChannel = UserService.YuntuLogin
          opts.success(res)
          that.__getClientId(function (clientId) {}, true)
          that.__saveUserInfo()
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
    this.sendMessage({
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
    this.sendMessage({
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
    this.sendMessage({
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

  getNewAccessToken () {
    const currentDate = new Date()
    const currentTime = currentDate.getTime()
    if (this.isLogin()) {
      let expireTime = this.auth.expireIn
      if (currentTime > expireTime) {
        console.log('登录超时，请重新登录')
        this.newAccessToken({
          success(res) {
            console.log(res)
          },
          fail(err) {
            console.log(err)
          }
        })
      }
    }
  }

  getLocation (opts) {
    let that = this
    if (this.isLogin()) {
      this.getLocationId({
        userId: this.auth.userId,
        accessToken: this.auth.accessToken,
        success: function (res) {
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
          opts.success(res)
        },
        fail: function () {
          opts.fail()
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
      wxapi.login().then(auth=>{
        return auth
      },e =>{
        console.log("error",JSON.stringify(e))
      }).then(auth=>{
        //这里需要引用auth的值，所以在回调内写then
        wxapi.getUserInfo().then(res=>{
          /**
           * 客户端本地获得微信用户信息，此时用户被定义为 guest snsId{null}
           * @type {*}
           */
          if (!that.isLogin()) {
            that.loginChannel = UserService.GuestLogin
            that.snsId = null
          }
          that.weixinUserInfo = res.userInfo

          that.uploadWeixinUserInfo({
            authCode: auth.code,
            encryptedData: res.encryptedData,
            iv: res.iv,
            success: function (res2) {
              /**
               * 服务端获得微信用户信息，此时用户被定义为 weixin snsId{Number}
               */
              if (!that.isLogin()) {
                that.loginChannel = UserService.WexinLogin
              }
              that.snsId = res2.snsId
              that.weixinUserInfo = res2

              typeof cb == "function" && cb(that.weixinUserInfo)
              that.__saveUserInfo()
            },
            fail: function () {
              that.__getClientId(function (clientId) {

                if (!that.isLogin()) {
                  that.snsId = clientId
                }

                typeof cb == "function" && cb(that.weixinUserInfo)
                that.__saveUserInfo()
              })
            }
          })

        },e=>{
          that.__getClientId(function (clientId) {
            if (!that.isLogin()) {
              that.loginChannel = UserService.GuestLogin
              that.snsId = clientId
            }
            that.weixinUserInfo = null
            typeof cb == "function" && cb(that.weixinUserInfo)
            that.__saveUserInfo()
          })
        })
      })

    }
  }

  getVisitor (opts) {
    const userId = this.isLogin() ? this.auth.userId : ''
    this.sendMessage({
      path: 'cgi/visitor',
      data: {
        deviceId: opts.deviceId,
        userId: userId
      },
      success: opts.success,
      fail: opts.fail
    })
  }
}
