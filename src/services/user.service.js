// @flow

//  UserService.js 用户登录注册.
//  Version 1.0.0
//
//  Created by pandali on 17-02-23.
//  Copyright (c) 2016年 yaomaiche. All rights reserved.
//

import Service from './base.service'

import Util from '../utils/util'
import config from '../config'
import * as wxapi from 'fmt-wxapp-promise'

/**
 * 用户中心服务
 *
 * @export
 * @class UserService
 * @extends {Service}
 */
export default class UserService extends Service {

  static AuthKey = config.getNamespaceKey('auth')
  static ClientIdKey = config.getNamespaceKey('clientId')

  urls = {
    dev: 'https://test.yaomaiche.com/ucdev/',
    gqc: 'https://test.yaomaiche.com/ucgqc/',
    prd: 'https://uc.yaomaiche.com/uc/'
  }

  /**
   * 登录渠道
   *
   * @type {('guest'|'weixin'|'yuntu')}
   * @memberof UserService
   */
  loginChannel: 'guest' | 'weixin' | 'yuntu' = 'guest'

  /**
   * 用户中心鉴权对象
   *
   * @type {Auth}
   * @memberof UserService
   */
  auth: Auth

  /**
   * 微信用户信息，该对象的存在与否用来标示客户端是否获得微信用户信息
   *
   * @type {WeixinUserInfo}
   * @memberof UserService
   */
  weixinUserInfo: WeixinUserInfo

  /**
   * 客户端 id
   *
   * @type {string}
   * @memberof UserService
   */
  clientId: string

  /**
   * 这两个字段不需要持久化，每次进入页面都会获取最新的结果
   *
   * @type {[{
   *     provinceId: number,
   *     cityId: number,
   *     districtId: number
   *   }]}
   * @memberof UserService
   */
  location: [{
    provinceId: number,
    cityId: number,
    districtId: number
  }]

  /**
   * 用户移动电话号码
   *
   * @type {string}
   * @memberof UserService
   */
  mobile: string

  address: any = {}

  /**
   * 当 loginChannel 为 guest, snsId 是一个 {String}, 来自于 clientId
   * 当 loginChannel 为 yuntu, snsId
   * 当 loginChannel 为 weixin,
   *
   * snsId 用来存在与否服务端对是否获得 用户的微信用户信息
   * 当为 {number} 时，意味着服务端知晓其微信用户信息
   * 当为 {string} 时，意味着服务端不知晓其微信用户信息
   *
   * @type {((string | number))}
   * @memberof UserService
   */
  snsId: string | number

  constructor() {
    super()
  }

  setup() {
    super.setup()

    this.__getClientId((clientId: ?string) => {
      console.log('本次的用户的 clientId 为' + (clientId != null ? clientId : '空'))
    })
    this.__loadUserInfo()

    this.getWeixinUserInfo(null)
    this.getNewAccessToken()
    this.getLocation()
  }

  /**
   * 用户是否设置过报价设置.
   *
   * @returns {('true' | 'false')}
   * @memberof UserService
   */
  isSetPreference(): 'true' | 'false' {
    const setPreference = wx.getStorageSync('isSetPreference') || 'false'
    return setPreference
  }

  /**
   * 是否登录
   *
   * @returns {boolean}
   * @memberof UserService
   */
  isLogin(): boolean {
    return this.loginChannel === 'yuntu' && this.auth != null
  }

  /**
   * 是否绑定微信账号
   *
   * @returns {boolean}
   * @memberof UserService
   */
  hasWeixinBinding(): boolean {
    return typeof this.snsId === 'number'
  }

  /**
   * 是否本地有微信账号信息
   *
   * @returns {boolean}
   * @memberof UserService
   */
  hasWeixinUserInfo(): boolean {
    if (this.weixinUserInfo != null) {
      return true
    } else {
      return false
    }
  }

  /**
   * 从存储中载入用户信息对象
   *
   * @memberof UserService
   */
  __loadUserInfo() {
    try {
      const userInfoString = wx.getStorageSync(UserService.AuthKey)
      if (userInfoString) {
        const userInfo = JSON.parse(userInfoString)
        console.log('读取用户信息', userInfo)
        this.loginChannel = userInfo.loginChannel || 'guest'
        this.snsId = userInfo.snsId || null
        this.auth = userInfo.auth || null
        this.weixinUserInfo = userInfo.weixinUserInfo || null
      }
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * 将内存中的用户信息保存到本地存储
   *
   * @memberof UserService
   */
  __saveUserInfo() {
    const userInfo = {
      loginChannel: this.loginChannel,
      auth: this.auth,
      weixinUserInfo: this.weixinUserInfo,
      snsId: this.snsId
    }

    console.log("保存用户信息", userInfo)
    try {
      const userInfoString = JSON.stringify(userInfo)
      wx.setStorageSync(UserService.AuthKey, userInfoString)
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * 彻底清除本地存储的用户信息
   *
   * @memberof UserService
   */
  __clearUserInfo() {
    try {
      wx.removeStorageSync(UserService.AuthKey)
      this.loginChannel = 'guest'
      this.snsId = null
      this.auth = null
      this.weixinUserInfo = null
    } catch (e) {
      console.error(e)
    }
  }

  // 获取时间戳.
  __getTimestamp(ms: number) {
    let currentDate = new Date()
    let currentTime = currentDate.getTime()
    let expirationTime = currentTime + ms

    return expirationTime
  }

  __setClientId(clientId: string) {
    this.clientId = clientId
    try {
      wx.setStorageSync(UserService.ClientIdKey, clientId);
    } catch (e) {
      console.error('设置删除 clientId 发生错误' + e)
    }
  }

  __getClientId(callback: (clientId: string) => void, forceUpdate: boolean = false) {
    if (forceUpdate) {
      this.__requestClientId(callback)
    } else {
      if (this.clientId != null) {
        if (callback != null) callback(this.clientId)
      } else {
        try {
          const clientId: ?string = wx.getStorageSync(UserService.ClientIdKey)
          if (clientId != null && clientId.length > 0) {
            this.clientId = clientId
            if (callback != null) callback(clientId)
          } else {
            try {
              wx.removeStorageSync(UserService.ClientIdKey)
            } catch (e) {
              console.error('同步删除 clientId 发生错误' + e);
            }
            this.__requestClientId(callback)
          }
        } catch (e) {
          console.error('同步获取 clientId 发生错误' + e);
        }
      }
    }
  }

  __requestClientId(callback: (clientId: string) => void) {
    const DeviceKey = config.getNamespaceKey('deviceId')
    let deviceId: ?string = null
    try {
      deviceId = wx.getStorageSync(DeviceKey)
    } catch (e) {
      console.error('同步获取 deviceId 发生错误' + e)
    } finally {
      if (deviceId != null && deviceId.length > 0) {
        this.getVisitor(deviceId)
          .then(res => {
            console.log("__requestClientId", res)
            this.clientId = res.clientId
            this.__setClientId(this.clientId)
            if (callback != null) callback(this.clientId)
          }, err => {
            // 网络请求失败
            if (callback != null) callback(null)
          })
      }
    }
  }

  /**
   * 获取验证码.
   *
   * register(注册)/access(登录)/registerOrAccess(注册或登录)/resetPassword(忘记密码)
   * 是否校验手机号，如果校验，则注册时用户已存在会抛出异常；登录/修改密码时，用户不存在会抛出异常"
   *
   * @param {string} mobile
   * @param {string} [type='SMS']
   * @param {('register' | 'access' | 'registerOrAccess' | 'resetPassword')} useCase='access'
   * @param {boolean} [strictlyCheck=true]
   * @returns {Promise<any>}
   * @memberof UserService
   */
  getSMSCode(
    mobile: string,
    type: string = 'SMS',
    useCase: 'register' | 'access' | 'registerOrAccess' | 'resetPassword' = 'access',
    strictlyCheck: boolean = true
  ): Promise<any> {
    return this.sendMessageByPromise({
      path: 'cgi/vcode',
      method: 'POST',
      data: {
        type,
        mobile,
        useCase,
        strictlyCheck
      }
    })
  }

  /**
   * 用户登录
   * "使用场景，枚举：access(注册、登录)/resetPassword(忘记密码)"
   *
   * @param {string} mobile
   * @param {string} code
   * @param {('access' | 'resetPassword')} [useCase='access']
   * @param {'code'} [type='code']
   * @returns {Promise<any>}
   * @memberof UserService
   */
  login(
    mobile: string,
    code: string,
    useCase: 'access' | 'resetPassword' = 'access',
    type: 'code' = 'code',
  ): Promise<any> {
    return this.sendMessageByPromise({
      path: 'cgi/authorization',
      method: 'POST',
      data: {
        type,
        vcode: {
          mobile,
          code,
          useCase
        }
      }
    })
      .then(res => {
        // console.log(res)
        if (res) {
          const expireIn = this.__getTimestamp(res.expireMillis)
          res.expireIn = expireIn
          this.auth = res
          this.loginChannel = 'yuntu'
          this.__getClientId(null, true)
          this.__saveUserInfo()
          //登录时记录用户信息
          this.getLocation()
          return res
        }
      })
  }

  /**
   * 用户登出
   *
   * @returns {Promise<any>}
   * @memberof UserService
   */
  logout(): Promise<any> {
    this.auth = null
    if (this.snsId == null) {
      throw 'snsId 不应该为 空(null) 或者 未定义(undefined) 状态'
    } else if (typeof this.snsId === 'string') {
      this.loginChannel = 'guest'
    } else if (typeof this.snsId === 'number') {
      this.loginChannel = 'weixin'
    }
    this.__saveUserInfo()
    this.__getClientId(null, true)

    return new Promise(function (resolve, reject) {
      resolve()
    });
  }

  /**
   * 判断用户是否是租户成员
   *
   * @param {string} mobile
   * @returns {Promise<any>}
   * @memberof UserService
   */
  exsitTenanTmember(mobile: string): Promise<any> {
    return this.sendMessageByPromise({
      path: 'cgi/tenant/member/exist',
      method: 'GET',
      data: {
        mobile
      }
    })
  }

  /**
   * 刷新用户信息.
   *
   * @returns {Promise<any>}
   * @memberof UserService
   */
  newAccessToken(): Promise<any> {
    const Authorization = this.auth != null ? this.auth.refreshToken : null
    return this.sendMessageByPromise({
      method: 'PUT',
      path: 'cgi/authorization',
      header: {
        Authorization
      }
    })
      .then(res => {
        if (res) {
          let expireIn = this.__getTimestamp(res.expireMillis)
          res.expireIn = expireIn
          this.auth = res
          this.loginChannel = 'yuntu'
          this.__getClientId(null, true)
          this.__saveUserInfo()
          return res
        }
      })
  }

  /**
   * 绑定微信号
   *
   * @returns {Promise<any>}
   * @memberof UserService
   */
  userBindWeixin(): Promise<any> {
    const snsId = this.snsId
    const userId = this.auth != null ? this.auth.userId : null
    return this.sendMessageByPromise({
      path: 'cgi/user/weixin/binding',
      method: 'POST',
      data: {
        snsId,
        userId
      }
    })
  }

  /**
   * 上传用户微信信息
   *
   * @param {string} code
   * @param {string} encryptedData
   * @param {string} iv
   * @returns {Promise<any>}
   * @memberof UserService
   */
  uploadWeixinUserInfo(code: string, encryptedData: string, iv: string): Promise<any> {
    return this.sendMessageByPromise({
      path: 'cgi/user/weixin',
      method: 'POST',
      data: {
        code,
        encryptedData,
        iv
      }
    })
  }

  /**
   * 获取定位
   *
   * @returns {Promise<any>}
   * @memberof UserService
   */
  getLocationId(): Promise<any> {
    if (this.auth != null) {
      const userId = this.auth.userId
      return this.sendMessageByPromise({
        path: `cgi/tenant/member/${userId}/tenant`,
        method: 'GET',
      })
    } else {
      return null
    }
  }

  getNewAccessToken(): Promise<any> {
    const currentDate = new Date()
    const currentTime = currentDate.getTime()
    if (this.auth != null) {
      const expireTime = this.auth.expireIn
      if (currentTime > expireTime) {
        console.log('登录超时，请重新登录')
        return this.newAccessToken()
          .then(res => {
            console.log(res)
          },
          err => {
            console.log(err)
          })
      }
    }
    return null
  }

  getLocation(): Promise<any> {
    if (this.isLogin()) {
      const promise = this.getLocationId()
      if (promise != null) {
        return promise
          .then(res => {
            const location = []
            if (res.tenants) {
              for (let item of res.tenants) {
                if (item.address) {
                  location.push(item.address)
                }
              }
            }
            this.location = location
            this.mobile = res.mobile
            this.address = res.tenants ? res.tenants[0].address : {}
            return res
          })
      }
    }
    return null
  }

  /**
   * 获取微信用户信息
   *
   * @param {(weixinUserInfo: WeixinUserInfo) => void} callback
   * @returns {Promise<any>}
   * @memberof UserService
   */
  getWeixinUserInfo(callback: (weixinUserInfo: WeixinUserInfo) => void): Promise<any> {
    if (this.weixinUserInfo != null) {
      if (callback != null) callback(this.weixinUserInfo)
      return null
    } else {
      //调用登录接口
      return wxapi.login()
        .then(auth => {
          return auth
        }, e => {
          console.log("error", JSON.stringify(e))
        })
        .then(auth => {
          //这里需要引用auth的值，所以在回调内写then
          wxapi.getUserInfo()
            .then(res => {
              /**
               * 客户端本地获得微信用户信息，此时用户被定义为 guest snsId{null}
               * @type {*}
               */
              if (!this.isLogin()) {
                this.loginChannel = 'guest'
                this.snsId = null
              }
              this.weixinUserInfo = res.userInfo

              this.uploadWeixinUserInfo(auth.code, res.encryptedData, res.iv)
                .then(res2 => {
                  /**
                   * 服务端获得微信用户信息，此时用户被定义为 weixin snsId{Number}
                   */
                  if (!this.isLogin()) {
                    this.loginChannel = 'weixin'
                  }
                  this.snsId = res2.snsId
                  this.weixinUserInfo = res2

                  if (callback != null) callback(this.weixinUserInfo)
                  this.__saveUserInfo()
                }, err2 => {
                  this.__getClientId((clientId: ?string) => {
                    if (!this.isLogin()) {
                      this.snsId = clientId
                    }

                    if (callback != null) callback(this.weixinUserInfo)
                    this.__saveUserInfo()
                  })
                })
            }, err => {
              this.__getClientId((clientId: ?string) => {
                if (!this.isLogin()) {
                  this.loginChannel = 'guest'
                  this.snsId = clientId
                }
                this.weixinUserInfo = null
                if (callback != null) callback(this.weixinUserInfo)
                this.__saveUserInfo()
              })
            })
        })
    }
  }

  /**
   * 获取 clientId 的方法
   *
   * @param {string} deviceId
   * @returns {Promise<any>}
   * @memberof UserService
   */
  getVisitor(deviceId: string): Promise<any> {
    const userId = this.auth ? this.auth.userId : null
    return this.sendMessageByPromise({
      path: 'cgi/visitor',
      data: {
        deviceId,
        userId
      }
    })
  }
}
