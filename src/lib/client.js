/*jslint forin: true, plusplus: true, sloppy: true, vars: true*/
//
//  clientjs.js 为用户生成clientId.
//  Version 1.0.0
//
//  Created by pandali on 16-12-30.
//  Copyright (c) 2016年 yaomaiche. All rights reserved.
//

import Util from '../utils/util'

export default class Client {

  constructor (userService) {
    this.clientId = ''
    this.userService = userService
    const that = this;
    this.getClientId(function(clientId) {
      console.log('本次的用户的 clientId 为' + clientId)
    })
  }

  setClientId (clientId) {
    this.clientId = clientId
    try {
      wx.setStorageSync('clientId', clientId);
    } catch (e) {
      console.log('设置删除 clientId 发生错误' + e)
    }
  }

  getClientId (cb, forceUpdate=false) {
    let that = this
    if (forceUpdate) {
      that.requestClientId(cb)
    } else {
      if (this.clientId && this.clientId.length) {
        typeof cb === 'function' && cb(this.clientId)
      } else {
        try {
          let clientId = wx.getStorageSync('clientId')

          if (clientId && clientId.length) {
            that.clientId = clientId
            typeof cb === 'function' && cb(this.clientId)
          } else {
            try {
              wx.removeStorageSync('clientId')
            } catch (e) {
              console.log('同步删除 clientId 发生错误' + e);
            }
            that.requestClientId(cb)
          }
        } catch (e) {
          console.log('同步获取 clientId 发生错误' + e);
        }
      }
    }
  }

  requestClientId (cb) {
    let that = this
    const deviceId = wx.getStorageSync(Util.DeviceIdKey)
    this.userService.getVisitor({
      deviceId: deviceId,
      success: function(res) {
        console.log(res)
        that.clientId = res.clientId
        that.setClientId(that.clientId)
        typeof cb === 'function' && cb(that.clientId)
      },
      fail: function() {
        // 网络请求失败
        typeof cb === 'function' && cb(null)
      }
    })
  }

}
