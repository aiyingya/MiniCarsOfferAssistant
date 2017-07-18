// @flow

//  UserService.js 用户登录注册.
//  Version 1.0.0
//
//  Created by pandali on 17-02-23.
//  Copyright (c) 2016年 yaomaiche. All rights reserved.
//

import BaseUserService from '../landrover/business/service/user.service'

import Util from '../utils/util'
import { storage } from '../landrover/business/index'
import * as wxapi from 'fmt-wxapp-promise'

/**
 * 用户中心服务
 *
 * @export
 * @class UserService
 * @extends {Service}
 */
export default class UserService extends BaseUserService {

  location: Array<Address>

  address: any = {}

  mobile: ?string

  constructor() {
    super()
  }

  setup() {
    super.setup()

    this.getWeixinUserInfo()
    this.getLocation()
  }

  /**
   * 用户是否设置过报价设置.
   *
   * @returns {('true' | 'false')}
   * @memberof UserService
   */
  isSetPreference(): 'true' | 'false' {
    const setPreference = storage.getItemSync('isSetPreference') || 'false'
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

  getLocation(): Promise<any> {
    return this.getTenant()
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

  /**
   * 获取微信用户信息
   *
   * @param {(weixinUserInfo: WeixinUserInfo) => void} callback
   * @returns {Promise<any>}
   * @memberof UserService
   */
  getWeixinUserInfo(): Promise<UserInfoForWeixin> {
    if (this.userInfoForWeixin != null) {
      return new Promise((resolve, reject) => {
        resolve(this.userInfoForWeixin)
      })
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
              this.userInfoForWeixin = res.userInfo

              this.createOrUpdateWechatUserInformation(res.code, res.encryptedData, res.iv)
                .then(res2 => {
                  /**
                   * 服务端获得微信用户信息，此时用户被定义为 weixin snsId{Number}
                   */
                  if (!this.isLogin()) {
                    this.loginChannel = 'weixin'
                  }
                  this.snsId = res2.snsId
                  this.userInfoForWeixin = res2

                  this.saveUserInfo()
                  return new Promise((resolve, reject) => {
                    resolve(this.userInfoForWeixin)
                  })
                }, err2 => {
                  this.getClientId(false)
                  .then( res => {
                    if (!this.isLogin()) {
                      this.snsId = res.clientId
                    }

                    if (callback != null) callback(this.weixinUserInfo)
                    this.saveUserInfo()
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
}
