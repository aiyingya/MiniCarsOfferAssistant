// @flow
import Service from './base.service'
import { config, storage, device, ui } from '../index'

export default class UserService extends Service {
  baseUrl = {
    dev: 'https://test.yaomaiche.com/ucdev/',
    gqc: 'https://test.yaomaiche.com/ucgqc/',
    prd: 'https://uc.yaomaiche.com/uc/'
    // prd: 'http://192.168.1.155:8080/uc/'
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
   * 用户账号关联的手机号码
   *
   * @type {(string | null)}
   * @memberof UserService
   */
  mobile: string | null = null;

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
  userInfo: UserInfo | null = null;

  /**
   * clientId 获取异步 promise
   *
   * @type {(Promise<{ clientId: string }> | null)}
   * @memberof UserService
   */
  promiseForClientId: Promise<{ clientId: string }> | null = null;

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

    let promiseResolveForClientId = null
    let promiseRejectForClientId = null
    this.promiseForClientId = new Promise((resolve, reject) => {
      promiseResolveForClientId = resolve
      promiseRejectForClientId = reject
    })

    return super.setup()
      .then(() => {
        console.log('获取 clientId')
        return this.getClientId(false)
          .then(res => {
            if (promiseResolveForClientId != null) {
              promiseResolveForClientId(res)
            }
            console.log(res)
          }, err => {
            if (promiseRejectForClientId != null) {
              promiseRejectForClientId(err)
            }
            return Promise.reject(err)
          })
      })
      .then(() => {
        if (this.auth != null) {
          return this.refreshAccessToken(this.auth)
            .catch(err => {
              // 新失时发现 auth 过期, 或者调动接口失败
              console.error(err)
            })
        } else {
          return Promise.resolve()
        }
      })
      .then(() => {
        if (this.auth == null) {
          console.info('没有登录, 无需获取用户角色信息')
          return Promise.resolve(null)
        } else {
          console.info('已经登录, 获取用户角色信息')
          return this.getUserMobile()
        }
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
   * @param {AuthEntity} entity
   * @param {string} channel
   * @returns {Promise<Auth>}
   * @memberof UserService
   */
  createAuthentication(
    entity: AuthEntity,
    channel: string
  ): Promise<Auth> {
    return this.request(
      'cgi/authorization',
      'POST',
      {
        ...entity,
        channel
      }
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
      'GET'
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
   *
   *
   * @param {string} userId
   * @returns {Promise<{ mobile: string }>}
   * @memberof UserService
   */
  retrieveUserMobile(
    userId: string
  ): Promise<{ mobile: string }> {
    const uid = userId
    return this.request(
      `cgi/user/mobile`,
      'GET',
      {
        uid
      }
    )
  }

  /**
   * 用户信息 API
   */

  /**
   * 获取用户信息
   *
   * @param {string} userId
   * @returns {Promise<UserInfo>}
   * @memberof UserService
   */
  retrieveUserInformation(
    userId: string
  ): Promise<UserInfo> {
    return this.request(
      `cgi/user/${userId}/info`,
      'GET'
    )
  }

  /**
   * 包装方法
   */

  login(
    authEntity: AuthEntity,
    channel: string
  ): Promise<Auth> {
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
          console.info('登录后刷新失败' + err)
          return authNeedRefresh
        })
    }

    return this.createAuthentication(authEntity, channel)
      .then(auth => {
        const expireIn = this.p_timestampFromNowWithDelta(auth.expireMillis)
        auth.expireIn = expireIn
        this.auth = auth
        this.loginChannel = 'yuntu'
        this.getClientId(true)
        this.saveUserInfo()
        return promiseForUpdateAuthentication(auth)
      })
      .then(auth => {
        return this.getUserMobile()
      })
      .catch(err => {
        console.error('登录失败' + err)
        return Promise.reject(err)
      })
  }

  logout(): Promise<void> {
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

  getUserMobile(): Promise<{ mobile: string }> {
    const userId = this.auth != null ? this.auth.userId : null
    return this.retrieveUserMobile(userId)
      .then(res => {
        this.mobile = res.mobile
        return res
      })
  }

  getUserInfo(): Promise<UserInfo> {
    const userId = this.auth != null ? this.auth.userId : null

    return this.retrieveUserInformation(userId)
      .then((res: UserInfo) => {
        this.userInfo = res
        return res
      })
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
      versionCode: config.versionCode
    }

    const userInfoJSONString = JSON.stringify(userInfo)
    if (!storage.setItemSync('auth', userInfoJSONString)) {
      console.error('同步设置 auth 出错')
    }
  }

  loadUserInfo(): void {
    const userInfoJSONString = storage.getItemSync('auth')
    console.log('获得 auth' + userInfoJSONString)
    if (userInfoJSONString != null && userInfoJSONString.length > 0) {
      const userInfo = JSON.parse(userInfoJSONString)
      const originalVersionCode = userInfo.versionCode
      if (originalVersionCode == null) {
        // 1.8.0 之前, 直接清空登录态
        if (storage.removeItemSync('auth')) {
          this.loginChannel = 'guest'
          this.auth = null
          this.userInfo = null
        } else {
          console.error('同步移除 auth 出错')
        }
      } else {
        // 1.8.0 以及之后
        this.loginChannel = userInfo.loginChannel || 'guest'
        this.auth = userInfo.auth || null
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
    } else {
      console.error('同步删除 auth 出错')
    }
  }
}
