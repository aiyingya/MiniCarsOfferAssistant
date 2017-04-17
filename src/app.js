// config 接口需要在应用开始执行
import config from './config'

import wxcharts from './modules/wxcharts'

import UserService from './services/user.service'
import TradeService from './services/trade.service'
import SAASService from './services/saas.service'

const userService = new UserService()
const tradeService = new TradeService()

const saasService = new SAASService(userService)

App({
  onLaunch (options) {
    console.log('onLaunch:')
    console.log(options)
    // FIXME: 目前在启动的时候会检查本地存放的伪设备唯一 Id
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  globalData: {
  },
  wxcharts: wxcharts,
  userService: userService,
  tradeService: tradeService,
  saasService: saasService,

  // FIXME: 这个地方的逻辑是存放即需要跨页面跳转的报价单数据
  fuckingLarryNavigatorTo: {
    quotation: null,
    source: ''
  }
})
