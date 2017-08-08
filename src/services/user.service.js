// @flow

import BaseUserService from '../landrover/business/service/user.service'

import Util from '../utils/util'
import { config, storage } from '../landrover/business/index'

/**
 * 用户中心服务
 *
 * @export
 * @class UserService
 * @extends {BaseUserService}
 */
export default class UserService extends BaseUserService {

  /**
   * 要卖车用户业务层用户信息
   *
   * @type {(RoleInfoForEmployee | RoleInfoForGuest | null)}
   * @memberof UserService
   */
  roleInfo: RoleInfoForEmployee | RoleInfoForGuest | null = null;

  /**
   * 角色名称
   *
   * 'guest' 指访客, 即除此登录拥有 10 天体验时间, 时间过期后即无法登陆
   * 'employee' 指雇员, 即可以无限制登录使用要卖车的人员
   *
   * @type {('guest' | 'employee' | null)}
   * @memberof UserService
   */
  roleName: 'guest' | 'employee' | null = null;

  location: Array<Address>;

  address: any = {};

  mobile: ?string;

  constructor() {
    super()
  }

  setup(): Promise<void> {
    return super.setup()
      .then(() => {
        return this.getRoleInformation()
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
  retriveRoleInfomation(
    sessionId: string,
    userId: string,
  ): Promise<RoleEntity> {
    const
      sid = sessionId,
      uid = userId
    return this.request(
      'cgi/wxapp/role',
      'GET',
      {
        sid,
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
  createAuthenticationForMiniProgram(
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
   * 获取租户的用户信息
   *
   * @param {string} userId
   * @returns {Promise<URoleInfoForEmployee>}
   * @memberof UserService
   */
  retrieveTenantMemberUserInfo(
    userId: string
  ): Promise<RoleInfoForEmployee> {
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
      'GET',
      {
        mobile
      }
    )
  }

  /**
   * 获取当前登录用户的角色信息
   *
   * @returns {Promise<RoleEntity>}
   * @memberof UserService
   */
  getRoleInformation(): Promise<RoleEntity> {
    if (this.auth == null) {
      return Promise.reject(new Error('该接口需要登录态'))
    }

    if (this.weixin.sessionId == null) {
      return Promise.reject(new Error('该接口需要 sessionId'))
    }

    return this.retriveRoleInfomation(this.weixin.sessionId, this.auth.userId)
      .then((res: RoleEntity) => {
        this.roleName = res.roleName
        this.roleInfo = res.roleInfo

        if (res.roleName === 'guest') {
          // 当用户信息为 guest 时做什么操作
          return res
        } else if (res.roleName === 'employee') {
          const location = []
          if (res.roleInfo.tenants) {
            for (let item of res.roleInfo.tenants) {
              const address = item.address
              if (address != null) {
                location.push(address)
              }
            }
          }
          this.location = location
          this.mobile = res.roleInfo.mobile
          this.address = res.roleInfo.tenants ? res.roleInfo.tenants[0].address : {}
          return res
        }
      })
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

  getLocation(): Promise<RoleInfoForEmployee | null> {
    return this.getRoleInformation()
      .then((res: RoleEntity) => {
        if (res.roleName === 'employee') {
          return res.roleInfo
        } else {
          return null
        }
      })
  }
}
