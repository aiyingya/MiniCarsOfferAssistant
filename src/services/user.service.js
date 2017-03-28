//
//  UserService.js 用户登录注册.
//  Version 1.0.0
//
//  Created by pandali on 17-02-23.
//  Copyright (c) 2016年 yaomaiche. All rights reserved.
//
import config from '../lib/config'
import modules from '../lib/modules'

class UserService {

  constructor() {
    /**
     * 要买车用户信息对象
     */
    this.userInfo = null

    /***
     * 目前有两种情况，第一种，当用户授权微信信息，则数据结构如下，loginChannel 为 weixin
     * 第二种，当用户拒绝授权微信信息，则数据结构仅仅为 {loginChannel: 'guest', snsId: '{{clientId}}'}
     *
     * appKey "wxd5d5bf6b593d886e"
     * city : ""
     * country : "CN"
     * extra : "en"
     * gender : 1
     * openId : "oJNr60EADGT-ChvW0ValxcGcx29k"
     * province : "Shanghai"
     * snsId : "2"
     * weixinName : "傅斌"
     * weixinPortrait : "http://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83eopEuOnnoMv4l2otkB2d209UPSabmhQUzBGPXX3lic2HU3KahDicODEVskez8vzhSZ2qXjGZOibQhTeg/0"
     * loginChannel: 'weixin' 'weixin'|'guest'
     */
    this.weixinUserInfo = null
    this.location = null
    this.mobile = null

    this.getUserInfo()
    this.getWeixinUserInfo()
    this.getNewAccessToken()
    this.getLocation()
  }

  __sendMessage(opts) {
    const _HTTPS = `${config.ucServerHTTPSUrl}${opts.path}`
    const module = new modules
    module.request({
      url: _HTTPS,
      method: opts.method,
      header: opts.header,
      data: opts.data,
      success: opts.success,
      fail: opts.fail,
      loadingType: 'none'
    })
  }

  // 获取时间戳.
  __getTimestamp(ms) {
    let currentDate = new Date()
    let currentTime = currentDate.getTime()
    let expirationTime = currentTime + ms

    return expirationTime
  }

  /**
   * 获取验证码.
   */
  getSMSCode(opts) {
    if (!opts) return

    console.log('get SMS code')
    this.__sendMessage({
      path: 'cgi/vcode',
      method: 'POST',
      data: {
        "type": "SMS",
        "mobile": opts.mobile,
        "useCase": 'access',// register(注册)/access(登录)/registerOrAccess(注册或登录)/resetPassword(忘记密码)
        "strictlyCheck": true // 是否校验手机号，如果校验，则注册时用户已存在会抛出异常；登录/修改密码时，用户不存在会抛出异常"
      },
      success: opts.success,
      fail: opts.fail
    })
  }

  /**
   * 用户登录
   */
  login(opts) {
    const that = this
    if (!opts) return

    console.log('password login')
    this.__sendMessage({
      path: 'cgi/authorization',
      method: 'POST',
      data: {
        "type": "code",
        "vcode": {
          "mobile": opts.mobile,
          "code": opts.code,
          "useCase": 'access' //"使用场景，枚举：access(注册、登录)/resetPassword(忘记密码)"
        }
      },
      success: function (res) {
        console.log(res)
        if (res) {
          const expireIn = that.__getTimestamp(res.expireMillis)
          res.expireIn = expireIn
          const userInfo = res
          const userInfoString = JSON.stringify(res)
          try {
            wx.setStorageSync('userInfo', userInfoString)
            that.userInfo = userInfo
            opts.success(res)
          } catch (e) {
            console.log(e)
          }
        }
      },
      fail: opts.fail
    })
  }

  logout (opts) {
    try {
      wx.removeStorageSync('userInfo')
      this.userInfo = null
      opts.success()
    } catch (e) {
      console.log(e)
      opts.fail()
    }
  }

  isLogin () {
    if (this.userInfo) {
      return true
    } else {
      return false
    }
  }

  /**
   * 判断用户是否是租户成员
   */

  exsitTenanTmember(opts) {
    if (!opts) return
    console.log('exsit tenant tmeber')
    this.__sendMessage({
      path: 'cgi/tenant/member/exist',
      method: 'GET',
      data: {
        "mobile": opts.mobile,
      },
      success: opts.success,
      fail: opts.fail
    })
  }

  /**
   * 刷新用户信息.
   */
  newAccessToken(opts) {
    console.log('get new accessToken')
    let that = this
    this.__sendMessage({
      method: 'PUT',
      path: 'cgi/authorization',
      header: {
        Authorization: opts.refreshToken
      },
      data: {},
      success: function (res) {
        if (res) {
          let expireIn = that.__getTimestamp(res.expireMillis)
          res.expireIn = expireIn
          const userInfo = res
          const userInfoString = JSON.stringify(res)
          try {
            wx.setStorageSync('userInfo', userInfoString)
            that.userInfo = userInfo
            opts.success(res)
          } catch (e) {
            console.log(e)
          }
        }
      },
      fail: function (err) {
        try {
          wx.removeStorageSync('userInfo')
          that.userInfo = null
          opts.fail(err)
        } catch (e) {
          console.log(e)
        }
      }
    })
  }

  /**
   * 绑定微信号
   */
  userBindWeixin(opts) {
    console.log('****')
    console.log(this.weixinUserInfo)
    console.log(this.userInfo)
    const snsId = this.weixinUserInfo.snsId
    const userId = this.userInfo.userId
    this.__sendMessage({
      path: 'cgi/user/weixin/binding',
      method: 'POST',
      header: {
        Authorization: this.userInfo.accessToken
      },
      data: {
        snsId: snsId,
        userId: userId
      },
      success: opts.success,
      fail: opts.fail
    })
  }

  /**
   * 上传用户微信信息
   */
  uploadWeixinUserInfo(opts) {
    this.__sendMessage({
      path: 'cgi/user/weixin',
      method: 'POST',
      data: {
        "code": opts.authCode,
        "encryptedData": opts.encryptedData,
        "iv": opts.iv
      },
      success: opts.success,
      fail: opts.fail
    })
  }

  getLocationId (opts) {
    console.log(opts)
    const that = this
    this.__sendMessage({
      path: `cgi/tenant/member/${opts.userId}/tenant`,
      method: 'GET',
      data: {},
      header: {
        Authorization: opts.accessToken
      },
      success: opts.success,
      fail: opts.fail
    })
  }

  // /**
  //  * 对某一个供应商关注/取消操作
  //  * @param supplierId
  //  * @param object
  //  */
  // requestFocusOrNotASupplier (supplierId, focusOrNot, object) {
  //   if (supplierId && typeof supplierId === 'string') {
  //     const method = focusOrNot ? 'POST' : 'DELETE'
  //     app.modules.request({
  //       url: app.config.ucServerHTTPSUrl + 'cgi/user/' + app.userInfo().userId + '/focus',
  //       data: {
  //         type: 'supplier',
  //         targetId: supplierId
  //       },
  //       loadingType: 'none',
  //       method: method,
  //       success: object.success,
  //       fail: object.fail,
  //       complete: object.complete
  //     })
  //   } else {
  //     object.fail()
  //     object.complete()
  //   }
  // }

  getNewAccessToken () {
    const currentDate = new Date()
    const currentTime = currentDate.getTime()
    if (this.isLogin()) {
      let token = this.userInfo.accessToken
      let expireTime = this.userInfo.expireIn
      let refreshToken = this.userInfo.refreshToken
      if (currentTime > expireTime) {
        console.log('登录超时，请重新登录')
        this.newAccessToken({
          refreshToken: refreshToken,
          success(res) {
            console.log(res)
          },
          fail(err) {
            console.log(res)
          }
        })
      }
    }
  }

  getLocation () {
    let that = this
    if (this.isLogin()) {
      this.getLocationId({
        userId: this.userInfo.userId,
        accessToken: this.userInfo.accessToken,
        success (res) {
          let location = []
          if (res.tenants) {
            for (let item of res.tenants) {
              if (item.address) {
                location.push(item.address)
              }
            }
          }
          that.location = location
          that.mobile = res.mobile
        }
      })
    }
  }

  getWeixinUserInfo (cb) {
    let that = this

    if (this.weixinUserInfo) {
      typeof cb == "function" && cb(this.weixinUserInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function (auth) {
          // 该接口只会在用户第一次进入时使用，并弹出弹框并一直记住当时的选择
          wx.getUserInfo({
            success: function (res) {
              that.uploadWeixinUserInfo({
                authCode: auth.code,
                encryptedData: res.encryptedData,
                iv: res.iv,
                success: function (res2) {
                  that.weixinUserInfo = res2
                  that.weixinUserInfo.loginChannel = 'weixin'
                  typeof cb == "function" && cb(that.weixinUserInfo)
                },
                fail: function () {
                  clientjs.getClientId(function (clientId) {
                    that.weixinUserInfo = {
                      loginChannel: 'guest',
                      snsId: clientId
                    }
                    typeof cb == "function" && cb(that.weixinUserInfo)
                  })
                }
              })
            },
            fail: function (res) {
              clientjs.getClientId(function (clientId) {
                that.weixinUserInfo = {
                  loginChannel: 'guest',
                  snsId: clientId
                }
                typeof cb == "function" && cb(that.weixinUserInfo)
              })
            }
          })
        }
      })
    }
  }

  getUserInfo () {
    if (this.userInfo) {

    } else {
      try {
        const userInfoString = wx.getStorageSync('userInfo')
        const userInfo = JSON.parse(userInfoString)
        if (userInfo) {
          this.userInfo = userInfo
        } else {
          try {
            wx.removeStorageSync('userInfo')
            this.userInfo = null
          } catch (e) {
            console.log(e)
          }
        }
      } catch (e) {
        console.log(e)
      }
    }
  }
}

export default UserService
