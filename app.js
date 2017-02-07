//app.js
var config = require('./lib/config.js')
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function (auth) {
          wx.getUserInfo({
            success: function (res) {
							let HTTPS_URL = config.serverHTTPSUrl('dev')
							console.log(res)
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
							wx.request({
								url: HTTPS_URL + '/user/weixin', //仅为示例，并非真实的接口地址
								method: 'POST',
								data: {

								},
								header: {
										'content-type': 'application/json'
								},
								success: function(res) {
									console.log(res.data)
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
  }
})