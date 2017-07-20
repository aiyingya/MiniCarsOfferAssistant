// @flow
import Service from './base.service'
import { config, storage, request, device, ui } from '../index'

export default class UserService extends Service {

  baseUrl = {
    dev: 'https://test.yaomaiche.com/ucdev/',
    gqc: 'https://test.yaomaiche.com/ucgqc/',
    prd: 'https://ymcapi.yaomaiche.com/uc/'
  }

  auth: ?Auth = null

  clientId: ?string = null

  loginChannel: LoginChannelType

  userInfo: any

  userInfoForTenant: ?UserInfoForTenant

  weixin: {
    userInfo: ?UserInfoForWeixin,
    sessionId: ?string
  }

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
    this.loginChannel = 'guest'

    this.userInfo = null
    this.userInfoForTenant = null

    this.weixin = {
      userInfo: null,
      sessionId: null
    }
  }

  setup(): Promise<void> {
    return super.setup()
      .then(() => {
        console.info('user.service 开始启动')
      })
      .then(() => {
        console.log('获取 clientId')
        return this.getClientId(false)
      })
      .then(() => {
        console.log('载入持久化的数据')
        this.loadUserInfo()
        if (this.auth != null) {
          console.log('刷新 token')
          return this.refreshAccessToken(this.auth)
        } else {
          return Promise.resolve()
        }
      })
      .then(() => {
        console.log('开始微信三方登录')
        return this.loginForWeixin()
      })
      .then(() => {
        // 检查并弱请求 userInfo 权限，并获取用户信息更新
        // 该流程的成功与否不会影响最终启动流程
        console.log('检查 userinfo 权限 并更新用户信息')
        return this.checkAndRequestAuthorize('scope.userInfo', true)
          .then((res) => {
            if (res.scopeAuthorize == true) {
              return this.getUserInfoForWeixin(true)
            } else {
              return Promise.resolve()
            }
          })
          .catch(err => {
            // userInfo 权限失败，或者获取用户信息失败，也不影响流程
          })
      })
      .then(() => {
        console.info('user.service 启动完毕')
      })
      .catch(err => {
        console.error('user.service 启动失败')
      })
  }

  p_timestampFromNowWithDelta(delta: number): number {
    const currentDate = new Date()
    const currentTime = currentDate.getTime()
    const expirationTime = currentTime + delta
    return expirationTime
  }

  /**
   * clientId API
   */
  retrieveClientId(deviceId: string, userId: ?string): Promise<any> {
    return this.request(
      'cgi/visitor',
      'GET',
      {
        deviceId,
        userId
      }
    )
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

  updateAuthentication(refreshToken: string): Promise<Auth> {
    const Authorization = refreshToken
    return this.request(
      'cgi/authorization',
      'PUT',
      null,
      {
        Authorization
      }
    )
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

  createPassword(userId: string, newPassword: string): Promise<any> {
    return this.request(
      `user/${userId}/pwd`,
      'POST',
      {
        newPassword
      }
    )
  }

  updatePassword(userId: string, newPassword: string, password?: string): Promise<any> {
    return this.request(
      `user/${userId}/pwd`,
      'PUT',
      {
        newPassword,
        password
      }
    )
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

  /**
   * 租户 api
   */
  retrieveTenantMemberExist(mobile: string): Promise<boolean> {
    return this.request(
      'cgi/tenant/member/exist',
      'GET',
      {
        mobile
      }
    )
  }

  retrieveTenantMemberUserInfo(userId: string): Promise<UserInfoForTenant> {
    return this.request(
      `cgi/tenant/member/${userId}/tenant`,
      'GET'
    )
  }

  /**
   * 微信小程序 api
   */

  /**
   *
   *
   * @param {string} appId
   * @param {string} code
   * @returns {Promise<string>} sessionId
   * @memberof UserService
   */
  createAuthenticationByMiniProgram(appId: string, code: string): Promise<string> {
    return this.request(
      'cgi/wxapp/auth',
      'POST',
      {
        appId,
        code
      }
    )
  }

  updateUserInfoByMiniProgram(sessionId: string, encrypted: boolean, userInfo: UserInfoEntityForWeixin): Promise<UserInfoForWeixin> {
    // let data
    // if (encrypted === true) {
    // const encryptedData: UserInfoForMiniProgramEncrypted = userInfo
    // data = encryptedData
    // } else {
    // const plainData: UserInfoForMiniProgramPlain = userInfo
    // data = plainData
    // }
    return this.request(
      'cgi/wxapp/user',
      'PUT',
      {
        sessionId,
        encrypted,
        ...userInfo
      }
    )
  }

  createBoundWithWeixinAccount(userId: string, sessionId: string): Promise<void> {
    return this.request(
      'cgi/wxapp/user/bound',
      'PUT',
      {
        sessionId,
        userId
      }
    )
  }

  retrieveWeixinAccountHasBound(sessionId: string): Promise<boolean> {
    const sid = sessionId
    return this.request(
      'cgi/wxapp/user/bound',
      'GET',
      {
        sid
      }
    )
  }

  retrieveWeixinAccountCanLogin(sessionId: string, mobile: string): Promise<{ success: boolean, message: string }> {
    const sid = sessionId
    const m = mobile
    return this.request(
      'cgi/wxapp/mobile/check',
      'GET',
      {
        sid,
        m
      }
    )
  }

  /**
   * 微信三方登录包裹接口
   * 自动获取 sessionId 到本地
   *
   * @returns {Promise<{ sessionId: string }>}
   * @memberof UserService
   */
  loginForWeixin(): Promise<{ sessionId: string }> {
    return request.checkSessionForWeixin()
      .then(() => {
        // 登录有效
        const sessionId = this.weixin.sessionId
        if (sessionId != null) {
          // 有 sessionId
          return { sessionId }
        } else {
          // 没有 sessionId
          return Promise.reject()
        }
      })
      .catch(() => {
        // 登录过期 || 登录没过期但是没有 sessionId
        return request.loginForWeixin()
          .then(res => {
            const code = res.code
            return code
          })
          .catch(err => {
            // login 接口出错的情况
            return Promise.reject(new Error('wx.login fail'))
          })
          .then((code: string) => {
            // FIXME: appid 需要抽象
            return this.createAuthenticationByMiniProgram('wxd5d5bf6b593d886e', code)
          })
          .then((sessionId: string) => {
            this.loginChannel = 'weixin'
            this.weixin.sessionId = sessionId
            this.saveUserInfo()
            return { sessionId }
          })
          .catch(err => {
            this.loginChannel = 'guest'
            this.weixin.sessionId = null
            this.saveUserInfo()
            console.error('微信三方登录失败')
            console.error(err)
            return Promise.reject(err)
          })
      })
  }


  /**
   * 绑定账号
   * 前提条件
   * 需要 sessionId， 也就是微信成功登录
   * 需要 userId, 也就是 yuntu 账号成功登录
   *
   * @returns {Promise<void>}
   * @memberof UserService
   */
  boundAccountForWeixin(): Promise<void> {
    const sessionId = this.weixin.sessionId
    if (sessionId == null) {
      return Promise.reject(new Error('sessionId must not be null'))
    }
    const auth = this.auth
    if (auth == null) {
      return Promise.reject(new Error('auth must not be null'))
    }

    return this.retrieveWeixinAccountHasBound(sessionId)
      .then((hasBound: boolean) => {
        if (hasBound) {
          return Promise.resolve()
        } else {
          return this.createBoundWithWeixinAccount(auth.userId, sessionId)
        }
      })
      .catch(err => {
        return Promise.reject(new Error('微信账号绑定失败'))
      })
  }

  /**
   * 检查并获取授权
   *
   * @param {('scope.userInfo' | '')} scope
   * @param {boolean} [require=false]
   * @returns {Promise<{ scopeAuthorize: boolean }>}
   * @memberof UserService
   */
  checkAndRequestAuthorize(scope: 'scope.userInfo' | '', require?: boolean = false): Promise<{ scopeAuthorize: boolean }> {
    const requirePromise: () => Promise<{ scopeAuthorize: boolean }> = () => {
      return ui.showModal('提示', `要买车 需要获取您的用户信息， 否则会影响用户体验`)
        .then(res => {
          if (res.confirm === true) {
            return request.openSettingForWeixin()
              .then(res => {
                const scopeAuthorize = res.authSetting[scope]
                return Promise.resolve({ scopeAuthorize })
              })
          }
          if (res.cancel === true) {
            const scopeAuthorize = false
            return Promise.resolve({ scopeAuthorize })
          }
        })
        .catch(err => {
          return Promise.reject(new Error(`引导用户开启 ${scope} 权限时发生错误`))
        })
    }

    return request.getSettingForWeixin()
      .then(res => {
        return res.authSetting[scope]
      })
      .then((scopeAuthorize: boolean) => {
        if (scopeAuthorize === true) {
          return Promise.resolve({ scopeAuthorize })
        } else {
          return request.authorizeForWeixin(scope)
            .then(res => {
              console.log('获取权限成功')
              return Promise.resolve({ scopeAuthorize: true })
            }, err => {
              console.log('获取权限失败')
              return Promise.resolve({ scopeAuthorize: false })
            })
        }
      })
      .then(res => {
        const scopeAuthorize = res.scopeAuthorize
        if (scopeAuthorize == false && require == true) {
          return requirePromise()
        } else {
          return Promise.resolve({ scopeAuthorize })
        }
      })
  }

  /**
   * 获取用户信息，其中包括了向微信获取用户信息，更新至服务器后台并获取实际可用的用户信息实体
   *
   * @param {boolean} withCredentials
   * @returns {Promise<UserInfoForWeixin>}
   * @memberof UserService
   */
  getUserInfoForWeixin(withCredentials: boolean): Promise<UserInfoForWeixin> {
    const sessionId = this.weixin.sessionId
    if (sessionId == null) {
      return Promise.reject(new Error('sessionId must not be null'))
    }

    return request.getUserInfoForWeixin(withCredentials)
      .then(userInfoFromMiniProgram => {

        let data: UserInfoEntityForWeixin
        if (withCredentials) {
          const userInfo: UserInfoEncryptedEntityForWeixin = {
            encryptedData: userInfoFromMiniProgram.encryptedData,
            iv: userInfoFromMiniProgram.iv
          }
          data = userInfo
        } else {
          const userInfo: UserInfoPlainEntityForWeixin = {
            rawData: userInfoFromMiniProgram.rawData,
            signature: userInfoFromMiniProgram.signature,
            userInfo: {
              weixinName: userInfoFromMiniProgram.nickName,
              portrait: userInfoFromMiniProgram.avatarUrl,
              country: userInfoFromMiniProgram.country,
              province: userInfoFromMiniProgram.province,
              city: userInfoFromMiniProgram.city,
              sex: userInfoFromMiniProgram.gender
            }
          }
          data = userInfo
        }

        return this.updateUserInfoByMiniProgram(sessionId, withCredentials, data)
      })
      .then(userInfoForWeixin => {
        this.weixin.userInfo = userInfoForWeixin
        this.saveUserInfo()
        return userInfoForWeixin
      })
      .catch(err => {
        console.error(err.message)
        return Promise.reject(err)
      })
  }

  canWeixinAccountLogin(mobile: string): Promise<{ success: boolean, message: string }> {
    const sessionId = this.weixin.sessionId
    if (sessionId != null) {
      return this.retrieveWeixinAccountCanLogin(sessionId, mobile)
    } else {
      return Promise.reject({ success: false, message: '微信三方登录未成功' })
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
        return auth
      })
  }

  logout(): Promise<any> {
    return this.deleteAuthentication()
      .then(res => {
        this.auth = null
        this.loginChannel = 'weixin'
        this.saveUserInfo()
        this.getClientId(true)
      })
  }

  refreshAccessToken(auth: Auth): Promise<Auth> {
    if (this.isAuthAvailable) {
      return Promise.resolve(auth)
    } else {
      return this.updateAuthentication(auth.refreshToken)
        .then(auth => {
          const expireIn = this.p_timestampFromNowWithDelta(auth.expireMillis)
          auth.expireIn = expireIn
          this.auth = auth
          this.loginChannel = 'yuntu'
          this.getClientId(true)
          this.saveUserInfo()

          return auth
        })
    }
  }

  getClientId(force: boolean): Promise<{ clientId: string }> {
    const deviceId = device.deviceId
    const userId = this.auth != null ? this.auth.userId : null
    let retrieveClientIdPromise
    if (force) {
      retrieveClientIdPromise = this.retrieveClientId(deviceId, userId)
    } else {
      if (this.clientId != null) {
        const clientId = this.clientId
        return Promise.resolve({ clientId })
      } else {
        const clientId = storage.getItemSync('clientId')
        if (clientId != null && clientId.length > 0) {
          this.clientId = clientId
          return Promise.resolve({ clientId })
        }

        if (clientId == null) {
          console.error('同步获取 clientId 发生错误')
        }

        if (!storage.removeItemSync('clientId')) {
          console.error('同步删除 clientId 发生错误')
        }
        retrieveClientIdPromise = this.retrieveClientId(deviceId, userId)
      }
    }

    return retrieveClientIdPromise
      .then(res => {
        const clientId = res.clientId
        this.clientId = clientId
        this.setClientId(clientId)
        return { clientId }
      })
  }

  setClientId(clientId: string): void {
    this.clientId = clientId
    if (!storage.setItemSync('clientId', clientId)) {
      console.error('设置 clientId 发生错误')
    }
  }

  saveUserInfo(): void {
    const userInfo = {
      loginChannel: this.loginChannel,
      auth: this.auth,
      weixin: this.weixin,
      versionCode: config.versionCode
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
      const originalVersionCode = userInfo.versionCode
      if (originalVersionCode == null) {
        // 如果取出的用户信息为 null / undefined
        // 意味着在 1.8.0 之前
        this.loginChannel = userInfo.loginChannel || 'guest'
        this.auth = userInfo.auth || null
        this.weixin.userInfo = userInfo.weixinUserInfo || null
      } else {
        // 1.8.0 以及之后
        this.loginChannel = userInfo.loginChannel || 'guest'
        this.auth = userInfo.auth || null
        this.weixin.userInfo = userInfo.weixin.userInfo || null
        this.weixin.sessionId = userInfo.weixin.sessionId || null
      }

    } else {
      if (userInfoJSONString == null) {
        console.error('同步获取 auth 出错')
      }
    }
  }

  clearUserInfo(): void {
    if (storage.removeItemSync('auth')) {
      this.loginChannel = 'guest'
      this.auth = null
      this.weixin = {
        userInfo: null,
        sessionId: null
      }
    } else {
      console.error('同步删除 auth 出错')
    }
  }

  getTenant(): Promise<UserInfoForTenant> {
    const auth = this.auth
    if (auth == null) {
      return Promise.reject(new Error('auth should be not null'))
    }
    return this.retrieveTenantMemberUserInfo(auth.userId)
      .then(tenant => {
        this.userInfoForTenant = tenant
        return tenant
      })
  }

}
