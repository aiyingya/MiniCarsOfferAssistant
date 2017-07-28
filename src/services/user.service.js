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
}
