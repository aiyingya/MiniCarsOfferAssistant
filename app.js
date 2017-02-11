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
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
    	// FIXME: 设置 fucking_larray
			wx.setStorageSync('snsId', 'fucking_larry')

			//调用登录接口
      wx.login({
        success: function (auth) {
					wx.getUserInfo({
						success: function (res) {
							let HTTPS_URL = config.ucServerHTTPSUrl;
							that.globalData.userInfo = res.userInfo
							typeof cb == "function" && cb(that.globalData.userInfo)
							modules.request({
								url: HTTPS_URL + 'user/weixin', 
								method: 'POST',
								data: {
									"code": auth.code,
									"encryptedData": res.encryptedData,
									"iv": res.iv
								},
								success: function(res) {
									console.log(res)
								}
							})
						}
					})
        }
      })
    }
  },
  globalData:{
    userInfo:null
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