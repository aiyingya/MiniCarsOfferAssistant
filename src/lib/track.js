/*jslint forin: true, plusplus: true, sloppy: true, vars: true*/
//
//  track.js 基于微信小程序页面埋点.
//  Version 1.0.0
//
//  Created by pandali on 17-02-17.
//  Copyright (c) 2016年 yaomaiche. All rights reserved.
//

import tools from './tools'
import modules from './modules'

class Track {
  constructor($scope) {
    Object.assign(this, {
      $scope,
    })
    this.__init()
  }

  __HTTPS(evn) {
    let HTTPS = {
      dev: 'https://ubt.yaomaiche.com/acquire/report/',
      gqc: 'https://ubt.yaomaiche.com/acquire/report/',
      prd: 'https://ubt.yaomaiche.com/acquire/report/'
    };
    return HTTPS[evn];
  }

  /**
   * 初始化类方法
   */
  __init() {
    this.__initDefaults()
    this.__initTools()
    this.__initPush()
  }

  /**
   * 工具方法
   */
  __initTools() {
    this.tools = new tools
  }

  /**
   * 默认参数
   */
  __initDefaults() {
    this.Track = {
      push: {
        version: '1.0.0',
      },
    }

    this.$scope.setData({
      [`$Track`]: this.$Track
    })
  }

  __initPush() {
    const that = this
    const extend = that.tools.extend
    const clone = that.tools.clone
    const $scope = that.$scope
    const system = wx.getSystemInfoSync()

    that.$TrackPush = {
      /**
       * 默认参数
       */
      defaults: {
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
      },

      push(opts = {}){
        const options = extend(clone(this.defaults), opts)
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

            modules.request({
              method: 'GET',
              url: that.__HTTPS('dev'),
              data: options,
              loadingType: 'none',
              success(res) {
                console.log(options, system, res)
              }
            })
          }
        })
      }
    }
  }

  /**
   * 获取页面信息.
   */
  __getPagesInfo() {

  }
}

export default Track
