// @flow
import Service from './base.service'
import { config, storage, request, device, ui } from '../index'

export default class UserService extends Service {

  baseUrl = {
    dev: 'https://test.yaomaiche.com/ucdev/',
    gqc: 'https://test.yaomaiche.com/ucgqc/',
    prd: 'https://ymcapi.yaomaiche.com/uc/'
  };

  /**
   * 运图账号登录鉴权对象
   *
   * @type {(Auth | null)}
   * @memberof UserService
   */
  auth: Auth | null = null;

  /**
   * 当前用户状态的的 clientId 由 userId + deviceId 服务器生成
   * clientId 的获取时机为启动后无登录状态时获取，登录和登出运图账号登录状态时重新获取
   *
   * @type {(string | null)}
   * @memberof UserService
   */
  clientId: string | null = null;

  /**
   * 登录渠道，目前支持 guest 游客， weixin 微信，yuntu 运图
   * 用户第一次进入界面默认状态就是 游客
   * 通过微信登录后即为 微信登录
   * 运图账号登录后即为 运图登录
   *
   * @type {LoginChannelType}
   * @memberof UserService
   */
  loginChannel: LoginChannelType = 'guest';

  /**
   * 运图账号用户信息
   *
   * @type {UserInfo}
   * @memberof UserService
   */
  userInfo: UserInfo;

  /**
   * 运图账号租户用户信息
   *
   * @type {(UserInfoForTenant | null)}
   * @memberof UserService
   */
  userInfoForTenant: UserInfoForTenant | null = null;

  /**
   * 微信登录相关信息
   *
   * userInfo 后台处理过的微信账号的用户信息
   * sessionId 后台处理过交由客户端保存的会话标识
   *
   * @type {({
   *     userInfo: UserInfoForWeixin | null,
   *     sessionId: string | null
   *   })}
   * @memberof UserService
   */
  weixin: {
    userInfo: UserInfoForWeixin | null,
    sessionId: string | null
  } = {
    userInfo: null,
    sessionId: null
  };

  /**
   * 微信登陆的异步 promise
   *
   * @type {(Promise<{ sessionId: string }> | null)}
   * @memberof UserService
   */
  promiseForWeixinLogin: Promise<{ sessionId: string }> | null = null;

  constructor() {
    super()
  }

  /**
   * 当前鉴权对象是否有效
   * accessToken 是否存在 expireIn 在有效期内
   * 当前的过期时间为真实过期时间前一天
   *
   * @returns {boolean}
   * @memberof UserService
   */
  isAuthAvailable(): boolean {
    const currentDate = new Date()
    const currentTime = currentDate.getTime()
    if (this.auth != null) {
      const expireTime = this.auth.expireIn
      // 在过期时间前一天设置为过期标识
      return currentTime < expireTime
    } else {
      return false
    }
  }

  setup(): Promise<void> {
    console.info('user.service 开始启动')
    console.log('载入持久化的数据')
    this.loadUserInfo()

    return super.setup()
      .then(() => {
        console.log('获取 clientId')
        return this.getClientId(false)
          .then(res => {
            console.log(res)
          })
      })
      .then(() => {
        if (this.auth != null) {
          return this.refreshAccessToken(this.auth)
            .catch(err => {
              // 新失时发现 auth 过期, 或者调动接口失败
            })
        } else {
          return Promise.resolve()
        }
      })
      .then(() => {
        console.log('开始微信三方登录')
        this.promiseForWeixinLogin = this.loginForWeixin()
        return this.promiseForWeixinLogin
      })
      .then(() => {
        // 检查并弱请求 userInfo 权限，并获取用户信息更新
        // 该流程的成功与否不会影响最终启动流程
        console.log('检查 userinfo 权限 并更新用户信息')
        return this.checkAndRequestAuthorize('scope.userInfo', true)
          .then((res) => {
            if (res.scopeAuthorize == true) {
              console.log('更新用户信息')
              return this.getUserInfoForWeixin(true)
                .then(res => {
                  console.log(res)
                })
            } else {
              console.log('没有更新用户信息')
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
        console.error('user.service 启动失败' + err.stack)
      })
  }

  /**
   * 通过过期时间量计算过期的时间戳
   *
   * @param {number} delta 过期时间量
   * @returns {number} 过期时间戳
   * @memberof UserService
   */
  p_timestampFromNowWithDelta(delta: number): number {
    const currentDate = new Date()
    const currentTime = currentDate.getTime()
    const expirationTime = currentTime + delta
    return expirationTime
  }


  /**
   * 获取 clientId
   *
   * @param {string} deviceId
   * @param {(string|null)} userId
   * @returns {Promise<{ clientId: string }>}
   * @memberof UserService
   */
  retrieveClientId(
    deviceId: string,
    userId: string | null
  ): Promise<{ clientId: string }> {
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
   * 创建验证码验证流程
   * 支持语音和短信验证码
   *
   * @param {string} mobile
   * @param {VCodeType} type
   * @param {UseCaseType} useCase
   * @param {boolean} strictlyCheck
   * @returns {Promise<void>}
   * @memberof UserService
   */
  createVCode(
    mobile: string,
    type: VCodeType,
    useCase: UseCaseType,
    strictlyCheck: boolean
  ): Promise<void> {
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

  /**
   * 授权或者登录
   * 支持验证码和密码两种方式
   *
   * + 请求
   *
   * 当 type === 'code'
   * entity 的类型应该为 VCode
   * 当 type === 'password'
   * entity 的类型应该为 Passport
   *
   * + 响应
   *
   * 当 (type === 'code') && (userCase === 'registerOrAccess' | 'access')
   * 其 scope 为 com.yuntu.*
   *
   * 当 (type === 'code') && (userCase === 'resetPassword' | 'register')
   * 其 scope 为 com.yuntu.uc.passport.resetPassword
   * 注 重置和修改密码必须使用 scope 为 com.yuntu.uc.passport.resetPassword 的 accessToken
   *
   * 注 初次获得的 accessToken 的有效期为 30分钟，登录和注册登录流程需要额外刷新一次 token
   *
   * 当 (type === 'code') && (userCase === 'registerOrAccess')
   * 其 extra 会有可能返回 'access' | 'setPassword'
   * 'access' 意味着直接登录
   * 'setPassword' 意味着需要客户端设置密码
   *
   * @param {AuthType} type
   * @param {AuthEntity} entity
   * @param {string} channel
   * @returns {Promise<Auth>}
   * @memberof UserService
   */
  createAuthentication(
    type: AuthType,
    entity: AuthEntity,
    channel: string
  ): Promise<Auth> {
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

  /**
   *
   *
   * @returns {Promise<AuthInfoType>}
   * @memberof UserService
   */
  retrieveAuthenticationInformation(
  ): Promise<AuthInfoType> {
    return this.request(
      'user',
      'GET',
    )
  }

  /**
   * 删除授权
   *
   * @returns {Promise<void>}
   * @memberof UserService
   */
  deleteAuthentication(
  ): Promise<void> {
    return this.request('cgi/authorization', 'DELETE')
  }

  /**
   * 更新授权对象，更新完毕后新的 accessToken 有效期为 7 天
   *
   * @param {string} refreshToken
   * @returns {Promise<Auth>}
   * @memberof UserService
   */
  updateAuthentication(
    refreshToken: string
  ): Promise<Auth> {
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

  /**
   * 判断用户是否存在
   *
   * @param {string} loginName 用户名/手机号/邮箱
   * @returns {Promise<boolean>}
   * @memberof UserService
   */
  retrieveUserExist(
    loginName: string
  ): Promise<boolean> {
    const key = loginName
    return this.request(
      'user/exist',
      'GET',
      {
        key
      }
    )
  }

  /**
   * 设置密码
   *
   * @param {string} userId
   * @param {string} newPassword
   * @returns {Promise<void>}
   * @memberof UserService
   */
  createPassword(
    userId: string,
    newPassword: string
  ): Promise<void> {
    return this.request(
      `user/${userId}/pwd`,
      'POST',
      {
        newPassword
      }
    )
  }

  /**
   * 修改密码，用于无法获得登录权限的况下
   *
   * @param {string} accessToken 授权范围为 'com.yuntu.uc.passport.resetPassword' 的 accessToken
   * @param {string} userId
   * @param {string} newPassword
   * @returns {Promise<void>}
   * @memberof UserService
   */
  updatePasswordWithoutLogin(
    accessToken: string,
    userId: string,
    newPassword: string
  ): Promise<void> {
    const Authorization = accessToken
    return this.request(
      `user/${userId}/pwd`,
      'PUT',
      {
        newPassword
      },
      {
        Authorization
      }
    )
  }

  /**
   * 修改密码，用于已经有登录权限的情况下
   *
   * @param {string} userId
   * @param {string} newPassword
   * @param {string} password
   * @returns {Promise<void>}
   * @memberof UserService
   */
  updatePassword(
    userId: string,
    newPassword: string,
    password: string
  ): Promise<void> {
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
   * 查看租户是否存在
   *
   * @param {string} mobile
   * @returns {Promise<boolean>}
   * @memberof UserService
   */
  retrieveTenantMemberExist(
    mobile: string
  ): Promise<boolean> {
    return this.request(
      'cgi/tenant/member/exist',
      'GET',
      {
        mobile
      }
    )
  }

  /**
   * 获取租户的用户信息
   *
   * @param {string} userId
   * @returns {Promise<UserInfoForTenant>}
   * @memberof UserService
   */
  retrieveTenantMemberUserInfo(
    userId: string
  ): Promise<UserInfoForTenant> {
    return this.request(
      `cgi/tenant/member/${userId}/tenant`,
      'GET'
    )
  }

  /**
   * 微信小程序创建登录鉴权
   *
   * @param {string} appId 微信的 appId
   * @param {string} code 通过 wx.login 接口获得的 code
   * @returns {Promise<string>} sessionId
   * @memberof UserService
   */
  createAuthenticationByMiniProgram(
    appId: string,
    code: string
  ): Promise<string> {
    return this.request(
      'cgi/wxapp/auth',
      'POST',
      {
        appId,
        code
      }
    )
  }

  /**
   * 微信小程序更新用户信息
   *
   * 当 encrypted === true
   * userInfo 的实体类型为 UserInfoEncryptedEntityForWeixin
   * 当 encrypted === false
   * userInfo 的实体类型为 UserInfoPlainEntityForWeixin
   *
   * @param {string} sessionId
   * @param {boolean} encrypted 是否需要上传敏感信息
   * @param {UserInfoEntityForWeixin} userInfo 微信小程序中获得的用户信息，包含加密的和不加密的
   * @returns {Promise<UserInfoForWeixin>}
   * @memberof UserService
   */
  updateUserInfoByMiniProgram(
    sessionId: string,
    encrypted: boolean,
    userInfo: UserInfoEntityForWeixin
  ): Promise<UserInfoForWeixin> {
    let data
    if (encrypted === true) {
      const encryptedData = userInfo
      data = encryptedData
    } else {
      const plainData = userInfo
      data = plainData
    }
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

  /**
   * 创建微信账号和运图账号之间的绑定关系
   *
   * @param {string} userId
   * @param {string} sessionId
   * @returns {Promise<void>}
   * @memberof UserService
   */
  createBoundWithWeixinAccount(
    userId: string,
    sessionId: string
  ): Promise<void> {
    return this.request(
      'cgi/wxapp/user/bound',
      'PUT',
      {
        sessionId,
        userId
      }
    )
  }

  /**
   * 检测当前的微信账号是否已经绑定过运图账号
   *
   * @param {string} sessionId
   * @returns {Promise<boolean>}
   * @memberof UserService
   */
  retrieveWeixinAccountHasBound(
    sessionId: string
  ): Promise<boolean> {
    const sid = sessionId
    return this.request(
      'cgi/wxapp/user/bound',
      'GET',
      {
        sid
      }
    )
  }

  /**
   * 检测当前手机号否等登录要卖车小程序
   *
   * @param {string} sessionId
   * @param {string} mobile
   * @returns {Promise<{ success: boolean, message: string }>}
   * @memberof UserService
   */
  retrieveWeixinAccountCanLogin(
    sessionId: string,
    mobile: string
  ): Promise<{ success: boolean, message: string }> {
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
   * 验证当前 sessionId 是否有效
   *
   * @param {string} sessionId
   * @returns {Promise<boolean>}
   * @memberof UserService
   */
  retrieveWeixinSessionIdValidation(
    sessionId: string
  ): Promise<boolean> {
    const sid = sessionId
    return this.request(
      'cgi/wxapp/auth',
      'GET',
      {
        sid
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
    const promiseForWeixinLoginFunction: () => Promise<{ sessionId: string }> = () => {
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
          if (this.loginChannel === 'guest') {
            this.loginChannel = 'weixin'
          }
          this.weixin.sessionId = sessionId
          this.saveUserInfo()
          return { sessionId }
        })
        .catch(err => {
          console.error('微信三方登录失败')
          console.error(err)
          return Promise.reject(err)
        })
    }

    const sessionId = this.weixin.sessionId
    this.weixin.sessionId = null
    if (sessionId != null) {
      return this.retrieveWeixinSessionIdValidation(sessionId)
        .then((validate: boolean) => {
          if (validate === true) {
            return request.checkSessionForWeixin()
              .then(res => {
                this.weixin.sessionId = sessionId
                return { sessionId }
              })
              .catch(err => {
                return Promise.reject()
              })
          } else {
            return Promise.reject()
          }
        })
        .catch(err => {
          return promiseForWeixinLoginFunction()
        })
    } else {
      return promiseForWeixinLoginFunction()
    }
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
  checkAndRequestAuthorize(scope: ScopeForWeixin, require?: boolean = false): Promise<{ scopeAuthorize: boolean }> {
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
            console.info('登陆后刷新失败')
            return authNeedRefresh
          })
    }

    return this.createAuthentication(authType, authEntity, channel)
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

  logout(): Promise<any> {
    return this.deleteAuthentication()
      .then(res => {
        this.clearUserInfo()
        this.getClientId(true)
      })
  }

  refreshAccessToken(auth: Auth): Promise<Auth> {
    const currentDate = new Date()
    const currentTime = currentDate.getTime()
    const expireTime = auth.expireIn

    if (currentTime < expireTime - auth.expireMillis / 2) {
      // 有效期内一半
      return Promise.resolve(auth)
    } else {
      if (currentTime < expireTime) {
        // 有效期外一半, 刷新处理
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
      } else {
        // 超过有效期, 直接删除当前登录状态
        ui.showToast('登录已失效, 请重新登录')
        this.clearUserInfo()
        return Promise.reject(new Error('access token 过期'))
      }
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
    console.log("获得 auth" + userInfoJSONString)
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
      this.loginChannel = 'weixin'
      this.auth = null
      this.userInfo = null
      this.userInfoForTenant = null
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
