import { storage, container } from './landrover/business/index'
import * as wxapi from 'fmt-wxapp-promise'
import wxcharts from './modules/wxcharts'
import { $wuxToast } from './components/wux'

import UserService from './services/user.service'
import TradeService from './services/trade.service'
import SAASService from './services/saas.service'

import amapFile from './modules/amap-wx'

const userService = new UserService()
const tradeService = new TradeService()
const saasService = new SAASService()

container.userService = userService
container.tradeService = tradeService
container.saasService = saasService

container.chart = wxcharts

const amap = new amapFile.AMapWX({key:'63572efadd84fa26c86bd62f78fe0152'});

App({
  onLaunch (options) {
    console.log('onLaunch:')
    console.log(options)
    // FIXME: 目前在启动的时候会检查本地存放的伪设备唯一 Id
    //调用API从本地缓存中获取数据
    const logs = storage.getItemSync('logs') || []
    logs.unshift(Date.now())
    storage.setItemSync('logs', logs)
  },
  onShow () {
    userService.setup()
    tradeService.setup()
    saasService.setup()
  },
  onHide () {

  },
  onError (e) {
    console.error(e)
  },
  globalData: {
  },
  amap: amap,

  // FIXME: 这个地方的逻辑是存放即需要跨页面跳转的报价单数据
  fuckingLarryNavigatorTo: {
    quotation: null,
    source: ''
  }
})
