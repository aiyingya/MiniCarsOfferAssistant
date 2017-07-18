// @flow
import Service from './base.service'
import { storage } from '../index'

export default class UserService extends Service {

  baseUrl = {
    dev: 'https://test.yaomaiche.com/ucdev/',
    gqc: 'https://test.yaomaiche.com/ucgqc/',
    prd: 'https://ymcapi.yaomaiche.com/uc/'
  }

  auth: ?Auth

  clientId: ?string

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
  snsId: ?SNSIdType

  loginChannel: LoginChannelType

  userInfo: ?any

  userInfoForWeixin: ?UserInfoForWeixin

  userInfoForTenant: ?UserInfoForTenant

  isAuthAvailable(): boolean {
    const currentDate = new Date()
    const currentTime = currentDate.getTime()
    if (this.auth != null) {
      const expireTime = this.auth.expireIn
      return currentTime < expireTime
    } else {
      return false
    }
  }

  constructor() {
    super()

    this.auth = null
    this.clientId = null
    this.snsId = null
    this.loginChannel = 'guest'

    this.userInfo = null
    this.userInfoForWeixin = null
    this.userInfoForTenant = null
  }

  setup(): void {
    super.setup()

    this.getClientId(false)
    this.loadUserInfo()
    this.refreshAccessToken()
  }

  p_timestampFromNowWithDelta(delta: number): number {
    const currentDate = new Date()
    const currentTime = currentDate.getTime()
    const expirationTime = currentTime + delta
    return expirationTime
  }

  p_authIsNotAvailablePromise(): Promise<any> {
    return new Promise((resolve, reject) => {
      reject()
    })
  }

  /**
   * clientId API
   */
  retrieveClientId(): Promise<any> {
    const deviceId = storage.getItemSync('deviceId')
    if (deviceId != null && deviceId.length > 0) {
      const userId = this.auth != null ? this.auth.userId : null
      return this.request(
        'cgi/visitor',
        'GET',
        {
          deviceId,
          userId
        }
      )
    } else {
      console.error('同步获取 deviceId 为空')
      return this.p_authIsNotAvailablePromise()
    }
  }

  /**
   * 用户授权 API
   */

  createVCode(mobile: string, type: VCodeType = 'SMS', useCase: UseCaseType = 'access', strictlyCheck: boolean = true): Promise<void> {
    return this.request(
      'cgi/vcode',
      'POST',
      {
        mobile,
        type,
        useCase,
        strictlyCheck
      }
    )
  }

  createAuthentication(type: AuthType, entity: AuthEntity, channel: string, ): Promise<any> {
    let data
    if (type === 'code') {
      const vcode = entity
      data = { type, vcode, channel }
    } else if (type === 'password') {
      const passport = entity
      data = { type, passport, channel }
    }

    return this.request(
      'cgi/authorization',
      'POST',
      data
    )
  }

  retrieveAuthenticationInformation(): Promise<AuthInfoType> {
    return this.request(
      'user',
      'GET',
    )
  }

  deleteAuthentication(): Promise<any> {
    return this.request('cgi/authorization', 'DELETE')
  }

  updateAuthentication(): Promise<any> {
    if (this.auth != null) {
      const Authorization = this.auth.refreshToken
      return this.request(
        'cgi/authorization',
        'PUT',
        null,
        {
          Authorization
        }
      )
    } else {
      return this.p_authIsNotAvailablePromise()
    }
  }

  retrieveUserExist(key: string): Promise<any> {
    return this.request(
      'user/exist',
      'GET',
      {
        key
      }
    )
  }

  createPassword(newPassword: string): Promise<any> {
    if (this.auth != null) {
      const userId = this.auth.userId
      return this.request(
        `user/${userId}/pwd`,
        'POST',
        {
          newPassword
        }
      )
    } else {
      return this.p_authIsNotAvailablePromise()
    }
  }

  updatePassword(newPassword: string, password?: string): Promise<any> {
    if (this.auth != null) {
      const userId = this.auth.userId
      return this.request(
        `user/${userId}/pwd`,
        'PUT',
        {
          newPassword,
          password
        }
      )
    } else {
      return this.p_authIsNotAvailablePromise()
    }
  }

  /**
   * 用户信息 API
   */

  /**
   * 三方登录 API
   */

  createAuthenticationByWechat(appKey: string, openId: string, code: string): Promise<any> {
    return this.request(
      'cgi/authorization/weixin',
      'POST',
      {
        appKey,
        openId,
        code
      }
    )
  }

  createBindingWithWechatAccount(): Promise<any> {
    if (this.auth != null) {
      const snsId = this.snsId
      const userId = this.auth.userId
      return this.request(
        'cgi/user/weixin/binding',
        'POST',
        {
          snsId,
          userId
        }
      )
    } else {
      return this.p_authIsNotAvailablePromise()
    }
  }

  /**
  * 微信用户 API
  */

  createOrUpdateWechatUserInformation(code: string, encryptedData: string, iv: string): Promise<any> {
    return this.request(
      'cgi/user/weixin',
      'POST',
      {
        code,
        encryptedData,
        iv
      }
    )
  }

  /**
   * 租户 api
   */
  retrieveTenantMemberExist(mobile: string): Promise<any> {
    return this.request(
      'cgi/tenant/member/exist',
      'GET',
      {
        mobile
      }
    )
  }

  retrieveTenantMemberUserInfo(): Promise<any> {
    if (this.auth != null) {
      const userId = this.auth.userId
      return this.request(
        `cgi/tenant/member/${userId}/tenant`,
        'GET'
      )
    } else {
      return this.p_authIsNotAvailablePromise()
    }
  }

  login(authType: AuthType, authEntity: AuthEntity, channel: string): Promise<Auth> {
    return this.createAuthentication(authType, authEntity, channel)
      .then(auth => {
        const expireIn = this.p_timestampFromNowWithDelta(auth.expireMillis)
        auth.expireIn = expireIn
        this.auth = auth
        this.loginChannel = 'yuntu'
        this.getClientId(true)
        this.saveUserInfo()

        // this.getLocation()
        return auth
      })
  }

  logout(): Promise<any> {
    return this.deleteAuthentication()
      .then(res => {
        this.auth = null
        if (this.snsId == null) {
          throw 'snsId 不应该为 空(null) 或者 未定义(undefined) 状态'
        } else if (typeof this.snsId === 'string') {
          this.loginChannel = 'guest'
        } else if (typeof this.snsId === 'number') {
          this.loginChannel = 'weixin'
        }
        this.saveUserInfo()
        this.getClientId(true)
      })
  }

  refreshAccessToken(): Promise<Auth> {
    if (this.isAuthAvailable()) {
      return this.updateAuthentication()
        .then(auth => {
          const expireIn = this.p_timestampFromNowWithDelta(auth.expireMillis)
          auth.expireIn = expireIn
          this.auth = auth
          this.loginChannel = 'yuntu'
          this.getClientId(true)
          this.saveUserInfo()

          return auth
        })
    } else {
      return this.p_authIsNotAvailablePromise()
    }
  }

  getClientId(force: boolean): Promise<any> {
    let retrieveClientIdPromise
    if (force) {
      retrieveClientIdPromise = this.retrieveClientId()
    } else {
      if (this.clientId != null) {
        const clientId = this.clientId
        return new Promise((resolve, reject) => {
          resolve({ clientId })
        })
      } else {
        const clientId = storage.getItemSync('clientId')
        if (clientId != null && clientId.length > 0) {
          this.clientId = clientId
          return new Promise((resolve, reject) => {
            resolve({ clientId })
          })
        }

        if (clientId == null) {
          console.error('同步获取 clientId 发生错误')
        }

        if (!storage.removeItemSync('clientId')) {
          console.error('同步删除 clientId 发生错误')
        }
        retrieveClientIdPromise = this.retrieveClientId()
      }
    }

    return retrieveClientIdPromise
      .then(res => {
        this.clientId = res.clientId
        this.setClientId(this.clientId)
      })
  }

  setClientId(clientId: string): void {
    this.clientId = clientId
    if (!storage.setItemSync('clientId', clientId)) {
      console.error('设置删除 clientId 发生错误')
    }
  }

  saveUserInfo(): void {
     const userInfo = {
       loginChannel: this.loginChannel,
       auth: this.auth,
       weixinUserInfo: this.userInfoForWeixin,
       snsId: this.snsId
     }

     const userInfoJSONString = JSON.stringify(userInfo)
     if (!storage.setItemSync('auth', userInfoJSONString)) {
        console.error('同步设置 auth 出错')
     }
  }

  loadUserInfo(): void {
    const userInfoJSONString = storage.getItemSync('auth')
    if (userInfoJSONString != null && userInfoJSONString.length > 0) {
      const userInfo = JSON.parse(userInfoJSONString)
              this.loginChannel = userInfo.loginChannel || 'guest'
        this.snsId = userInfo.snsId || null
        this.auth = userInfo.auth || null
        this.userInfoForWeixin = userInfo.weixinUserInfo || null
    } else {
      if (userInfoJSONString == null) {
        console.error('同步获取 auth 出错')
      }
    }
  }

  clearUserInfo(): void {
    if (storage.removeItemSync('auth')) {
      this.loginChannel = 'guest'
      this.snsId = null
      this.auth = null
      this.userInfoForWeixin = null
    } else {
      console.error('同步删除 auth 出错')
    }
  }

  getTenant(): Promise<any> {
    return this.retrieveTenantMemberUserInfo()
      .then( tenant => {
        this.userInfoForTenant = tenant
      })
  }

}
