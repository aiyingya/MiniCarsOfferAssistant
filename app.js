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
		
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
    	// FIXME: 设置 fucking_larray
			//调用登录接口
      wx.login({
        success: function (auth) {
					wx.getUserInfo({
						success: function (res) {
							let HTTPS_URL = config.ucServerHTTPSUrl;
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
									let userinfo = res;
									that.globalData.userInfo = userinfo;
									typeof cb == "function" && cb(that.globalData.userInfo)
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