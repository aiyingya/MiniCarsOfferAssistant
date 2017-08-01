// @flow

//  UserService.js 用户登录注册.
//  Version 1.0.0
//
//  Created by pandali on 17-02-23.
//  Copyright (c) 2016年 yaomaiche. All rights reserved.
//

import BaseUserService from '../landrover/business/service/user.service'

import Util from '../utils/util'
import { config, storage } from '../landrover/business/index'

import { $wuxToast } from '../components/wux'

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

  request(
    path: string,
    method: RequestMethod,
    data: ?{ [string]: any } = null,
    header?: ?{ [string]: string } = null,
  ): Promise<any> {
    console.log(`${path} ${method}`)
    console.log(data)
    return super.request(path, method, data, header)
      .then(res => {
        console.log(res)
        return res
      })
  }

  setup(): Promise<void> {
    return super.setup()
      .then(() => {
        this.getLocation()
      })
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
    return this.isAuthAvailable()
  }

  /**
   * 查询访客信息接口
   * 1.9.0 新增
   *
   * @param {string} appId
   * @param {string} userId
   * @returns {Promise<GuestEntity>}
   * @memberof UserService
   */
  retrieveGuestInformation(
    appId: string,
    userId: string
  ): Promise<GuestEntity> {
    const aid = appId
    const uid = userId
    return this.request(
      'cgi/wxapp/guest',
      'GET',
      {
        aid,
        uid
      }
    )
  }

  /**
   * 专门提供给要买车小程序的登录接口
   * 1.9.0 新增
   *
   * @param {AuthType} type
   * @param {AuthEntity} entity
   * @param {string} appId
   * @returns {Promise<Auth>}
   * @memberof UserService
   */
  createAuthenticationForMiniProgram (
    type: AuthType,
    entity: AuthEntity,
    appId: string
  ): Promise<Auth> {
    let data
    if (type === 'code') {
      const vcode = entity
      data = { type, vcode, appId }
    } else if (type === 'password') {
      const passport = entity
      data = { type, passport, appId }
    }

    return this.request(
      'cgi/wxapp/auth/yuntu',
      'POST',
      data
    )
  }

  /**
   * 获取访客信息方法
   *
   * @returns {Promise<GuestEntity>}
   * @memberof UserService
   */
  getGuestUserInfo(): Promise<GuestEntity> {
    if (this.auth != null) {
      return this.retrieveGuestInformation(config.appId, this.auth.userId)
    } else {
      return Promise.reject(new Error('该接口要登录态'))
    }
  }

  /**
   * 小程序专用登录接口, 接受电话号码和验证码登录
   *
   * @param {string} mobile
   * @param {string} code
   * @returns {Promise<Auth>}
   * @memberof UserService
   */
  login(mobile: string, code: string): Promise<Auth> {
    // 更新 token 的 promise 方法, 该方法要保证即便失败也能返回之前需要刷新的 auth 对象
    const promiseForUpdateAuthentication: (authNeedRefresh: Auth) => Promise<Auth> = (authNeedRefresh: Auth) => {
      return this.updateAuthentication(authNeedRefresh.refreshToken)
        .then(auth => {
          const expireIn = this.p_timestampFromNowWithDelta(auth.expireMillis)
          auth.expireIn = expireIn
          this.auth = auth
          this.loginChannel = 'yuntu'
          this.getClientId(true)
          this.saveUserInfo()
          return auth
        })
        .catch(err => {
          console.info('登录后刷新失败')
          return authNeedRefresh
        })
    }

    const authEntity: AuthEntity = {
      mobile,
      code,
      useCase: 'registerOrAccess'
    }
    const appId = config.appId

    return this.createAuthenticationForMiniProgram('code', authEntity, appId)
      .then(auth => {
        const expireIn = this.p_timestampFromNowWithDelta(auth.expireMillis)
        auth.expireIn = expireIn
        this.auth = auth
        this.loginChannel = 'yuntu'
        this.getClientId(true)
        this.saveUserInfo()
        return promiseForUpdateAuthentication(auth)
      })
      .catch(err => {
        console.error('登录失败')
        return Promise.reject()
      })
  }

  /**
   * 保留方法, 该方法通过获取租户数据填充本地数据
   *
   * @returns {Promise<UserInfoForTenant>}
   * @memberof UserService
   */
  getLocation(): Promise<UserInfoForTenant> {
    return this.getTenant()
      .then((res: UserInfoForTenant) => {
        const location = []
        if (res.tenants) {
          for (let item of res.tenants) {
            const address = item.address
            if (address != null) {
              location.push(address)
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
