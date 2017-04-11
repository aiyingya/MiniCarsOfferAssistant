/*jslint forin: true, plusplus: true, sloppy: true, vars: true */
//
//  track.js 基于微信小程序页面埋点.
//  Version 1.0.0
//
//  Created by pandali on 17-02-17.
//  Copyright (c) 2016年 yaomaiche. All rights reserved.
//

import UBTService from '../../services/ubt.service.js'

export default {

  UBTService: new UBTService(),
  /**
   * 默认参数
   */
  setDefaults() {
    const system = wx.getSystemInfoSync()
    return {
      deviceType: 'wx_miniapps',
      appVersion: 'WXMA:1.0.0',
      tk_cityIp: '',
      tk_cardCity: '',
      pageId: '',
      referPageId: '',
      os: system.model,
      screen: `${system.windowWidth}x${system.windowHeight}`,
      language: system.language,
      eventAction: 'pageShow'
    }
  },
  /**
   * 默认数据
   */
  data() {
    return {}
  },
  push(opts = {}) {
    const options = Object.assign({}, this.setDefaults, opts)
    /**
     * 获取地理位置
     */
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let latitude = res.latitude
        let longitude = res.longitude

        options.latitude = latitude
        options.longitude = longitude

        this.UBTService.report({
          options: options,
          success: function () {
            // 成功
          },
          fail: function () {
            // 失败
          }
        })
      }
    })
  }
}
