//app.js
import config from 'lib/config'
import wux from 'lib/wux'
import clientjs from 'lib/client'
import modules from 'lib/modules'
import user from 'lib/user'

App({
  onLaunch () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  getUserInfo (cb) {
    let that = this
		
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
			//调用登录接口
      wx.login({
        success: function (auth) {
        	// 该接口只会在用户第一次进入时使用，并弹出弹框并一直记住当时的选择
					wx.getUserInfo({
						success: function (res) {
							let HTTPS_URL = config.ucServerHTTPSUrl
							modules.request({
								url: HTTPS_URL + 'user/weixin', 
								method: 'POST',
								loadingType: 'none',
								data: {
									"code": auth.code,
									"encryptedData": res.encryptedData,
									"iv": res.iv
								},
								success: function(res) {
									console.log(res)
									let userinfo = res;
									that.globalData.userInfo = userinfo
									that.globalData.userInfo.loginChannel = 'weixin'
									typeof cb == "function" && cb(that.globalData.userInfo)
								},
								fail: function () {
                  clientjs.getClientId(function (clientId) {
                    that.globalData.userInfo = {
                      loginChannel: 'guest',
                      snsId: clientId
                    }
                    typeof cb == "function" && cb(that.globalData.userInfo)
                  })
                }
							})
						},
						fail: function (res) {
							clientjs.getClientId(function (clientId) {
								that.globalData.userInfo = {
								  loginChannel: 'guest',
									snsId: clientId
								}
                typeof cb == "function" && cb(that.globalData.userInfo)
              })
						}
					})
        }
      })
    }
  },
  globalData:{
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
    userInfo: null
  },
  wux: wux,
	config: config,
	modules: modules,
	user: user,
	// FIXME: 这个地方的逻辑是存放即需要跨页面跳转的报价单数据
	fuckingLarryNavigatorTo: {
  	quotation: null,
		source: ''
	}
})