// @flow

import BaseUserService from '../landrover/business/service/user.service'

import {
  config,
  storage,
  request,
  ui
} from '../landrover/business/index'

/**
 * 用户中心服务
 *
 * @export
 * @class UserService
 * @extends {BaseUserService}
 */
export default class UserService extends BaseUserService {

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
   * 微信登录的异步 promise
   *
   * @type {(Promise<{ sessionId: string }> | null)}
   * @memberof UserService
   */
  promiseForWeixinLogin: Promise<{
    sessionId: string
  }> | null = null;

  /**
   *
   * 要卖车用户业务层用户信息
   *
   * 角色名称
   * 'guest' 指访客, 即除此登录拥有 10 天体验时间, 时间过期后即无法登陆
   * 'employee' 指雇员, 即可以无限制登录使用要卖车的人员
   *
   * @type {(RoleEntity | null)}
   * @memberof UserService
   */
  role: RoleEntity | null = null;

  location: Array<Address>;

  address: any = {};

  constructor() {
    super()
  }

  setup(): Promise<void> {
    const promise = super.setup()
    console.info('user.service 开始启动')
    let promiseResolveForWeixinLogin = null
    let promiseRejectForWeixinLogin = null
    this.promiseForWeixinLogin = new Promise((resolve, reject) => {
      promiseResolveForWeixinLogin = resolve
      promiseRejectForWeixinLogin = reject
    })

    return promise
      .then(() => {
        console.log('开始微信三方登录')
        return this.loginForWeixin()
          .then(res => {
            if (promiseResolveForWeixinLogin != null) {
              promiseResolveForWeixinLogin(res)
            }
          }, err => {
            if (promiseRejectForWeixinLogin != null) {
              promiseRejectForWeixinLogin(err)
            }
            return Promise.reject(err)
          })
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
            console.error(err)
          })
      })
      .then(res => {
        if (this.auth == null) {
          console.info('没有登录, 无需获取用户角色信息')
          return Promise.resolve()
        } else {
          console.info('已经登录, 获取用户角色信息')
          return this.getRoleInformation()
        }
      })
      .then(() => {
        console.info('微信小程序 user.service 启动完毕')
      })
      .catch(err => {
        console.error('微信小程序 user.service 启动失败' + err.stack)
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
   * 查询当前登录用户的角色信息
   *
   * @param {string} sessionId
   * @param {string} userId
   * @returns {Promise<RoleEntity>}
   * @memberof UserService
   */
  retrieveRoleInformation(
    sessionId: string,
    userId: string
  ): Promise<RoleEntity> {
    const
      sid = sessionId,
      uid = userId
    return this.request(
      'cgi/wxapp/role',
      'GET', {
        sid,
        uid
      }
    )
  }

  /**
   * 专门提供给要买车小程序的登录接口
   * 1.9.0 新增
   *
   * @param {AuthEntity} entity
   * @param {string} appId
   * @returns {Promise<Auth>}
   * @memberof UserService
   */
  createAuthenticationForMiniProgram(
    entity: AuthEntity,
    appId: string
  ): Promise<Auth> {
    return this.request(
      'cgi/wxapp/auth/yuntu',
      'POST',
      {
        ...entity,
        appId
      }
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
      'POST', {
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
      'PUT', {
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
      'PUT', {
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
      'GET', {
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
  ): Promise<{
    success: boolean,
    message: string
  }> {
    const sid = sessionId
    const m = mobile
    return this.request(
      'cgi/wxapp/mobile/check',
      'GET', {
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
      'GET', {
        sid
      }
    )
  }



  /**
   * 获取租户的用户信息
   *
   * @param {string} userId
   * @returns {Promise<URoleInfoForEmployee>}
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
      'GET', {
        mobile
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
  loginForWeixin(): Promise<{
    sessionId: string
  }> {
    const promiseForWeixinLoginFunction: () => Promise<{
      sessionId: string
    }> = () => {
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
          return this.createAuthenticationByMiniProgram(config.appId, code)
        })
        .then((sessionId: string) => {
          if (this.loginChannel === 'guest') {
            this.loginChannel = 'weixin'
          }
          this.weixin.sessionId = sessionId
          this.saveUserInfo()
          return {
            sessionId
          }
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
                return {
                  sessionId
                }
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
  checkAndRequestAuthorize(
    scope: ScopeForWeixin,
    require?: boolean = false
  ): Promise<{
    scopeAuthorize: boolean
  }> {
    const requirePromise: () => Promise<{
      scopeAuthorize: boolean
    }> = () => {
      return ui.showModal('提示', `要买车 需要获取您的用户信息， 否则会影响用户体验`)
        .then(res => {
          if (res.confirm === true) {
            return request.openSettingForWeixin()
              .then(res => {
                const scopeAuthorize = res.authSetting[scope]
                return Promise.resolve({
                  scopeAuthorize
                })
              })
          }
          if (res.cancel === true) {
            const scopeAuthorize = false
            return Promise.resolve({
              scopeAuthorize
            })
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
          return Promise.resolve({
            scopeAuthorize
          })
        } else {
          return request.authorizeForWeixin(scope)
            .then(res => {
              console.log('获取权限成功')
              return Promise.resolve({
                scopeAuthorize: true
              })
            }, err => {
              console.log('获取权限失败')
              return Promise.resolve({
                scopeAuthorize: false
              })
            })
        }
      })
      .then(res => {
        const scopeAuthorize = res.scopeAuthorize
        if (scopeAuthorize == false && require == true) {
          return requirePromise()
        } else {
          return Promise.resolve({
            scopeAuthorize
          })
        }
      })
  }

  /**
   * 获取当前登录用户的角色信息
   *
   * @returns {Promise<RoleEntity>}
   * @memberof UserService
   */
  getRoleInformation(): Promise<RoleEntity | null> {
    if (this.auth == null) {
      return Promise.reject(new Error('该接口需要登录态'))
    }

    if (this.weixin.sessionId == null) {
      return Promise.reject(new Error('该接口需要 sessionId'))
    }

    return this.retrieveRoleInformation(this.weixin.sessionId, this.auth.userId)
      .then((res: RoleEntity)=> {
        this.role = res

        if (res.roleName === 'guest') {
          // 当用户信息为 guest 时做什么操作
          const roleInfo = res.roleInfo
          return res
        } else if (res.roleName === 'employee') {
          const roleInfo = res.roleInfo
          const location = []
          if (roleInfo.tenants != null) {
            for (let item of roleInfo.tenants) {
              const address = item.address
              if (address != null) {
                location.push(address)
              }
            }
          }
          this.location = location
          this.address = roleInfo.tenants ? roleInfo.tenants[0].address : {}
          return res
        } else {
          return null
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
  getUserInfoForWeixin(
    withCredentials: boolean
  ): Promise<UserInfoForWeixin> {
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

  canWeixinAccountLogin(
    mobile: string
  ): Promise<{
    success: boolean,
    message: string
  }> {
    const sessionId = this.weixin.sessionId
    if (sessionId != null) {
      return this.retrieveWeixinAccountCanLogin(sessionId, mobile)
    } else {
      return Promise.reject({
        success: false,
        message: '微信三方登录未成功'
      })
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
  loginForMiniProgram(
    mobile: string,
    code: string
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
          console.info('登录后刷新失败')
          return authNeedRefresh
        })
    }

    const authEntity: AuthEntity = {
      type: 'code',
      vcode: {
        mobile,
        code,
        useCase: 'registerOrAccess'
      }
    }
    const appId = config.appId

    return this.createAuthenticationForMiniProgram(authEntity, appId)
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
        console.error('登录失败')
        return Promise.reject()
      })
  }

  saveUserInfo(): void {
    super.saveUserInfo()

    const userInfo = {
      weixin: this.weixin,
      versionCode: config.versionCode
    }

    const userInfoJSONString = JSON.stringify(userInfo)
    if (!storage.setItemSync('weixin_auth', userInfoJSONString)) {
      console.error('同步设置 auth 出错')
    }
  }

  loadUserInfo(): void {
    super.loadUserInfo()

    const userInfoJSONString = storage.getItemSync('weixin_auth')
    console.log("获得 weixin_auth" + userInfoJSONString)
    if (userInfoJSONString != null && userInfoJSONString.length > 0) {
      const userInfo = JSON.parse(userInfoJSONString)
      const originalVersionCode = userInfo.versionCode
      if (originalVersionCode == null) {
        // 1.8.0 之前, 直接清空登录态
        if (storage.removeItemSync('weixin_auth')) {
          this.weixin = {
            userInfo: null,
            sessionId: null
          }
        } else {
          console.error('同步移除 weixin_auth 出错')
        }
      } else {
        // 1.8.0 以及之后
        this.weixin.userInfo = userInfo.weixin.userInfo || null
        this.weixin.sessionId = userInfo.weixin.sessionId || null
      }
    } else {
      if (userInfoJSONString == null) {
        console.error('同步获取 weixin_auth 出错')
      }
    }
  }

  clearUserInfo(): void {
    super.clearUserInfo()
    if (storage.removeItemSync('weixin_auth')) { } else {
      console.error('同步删除 auth 出错')
    }
  }

}

