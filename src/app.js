//app.js
import wux from './lib/wux'
import clientjs from './lib/client'
import modules from './lib/modules'
import wxcharts from './modules/wxcharts'
import config from './lib/config'

import UserService from './services/user.service'

App({
  onLaunch () {
    console.log(modules)
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  globalData: {
  },
  wux: wux,
  config: config,
  modules: new modules,
  wxcharts: wxcharts,
  userService: new UserService(),
  // FIXME: 这个地方的逻辑是存放即需要跨页面跳转的报价单数据
  fuckingLarryNavigatorTo: {
    quotation: null,
    source: ''
  }
})
