/*jslint forin: true, plusplus: true, sloppy: true, vars: true */
//
//  track.js 基于微信小程序页面埋点.
//  Version 1.0.0
//
//  Created by pandali on 17-02-17.
//  Copyright (c) 2016年 yaomaiche. All rights reserved.
//

import UBTService from '../../services/ubt.service.js'

import config from '../../config'

import Component from '../component'

export default {

  UBTService: new UBTService(),
  /**
   * 默认参数
   */
  setDefaults() {
    const system = config.system
    return {
      deviceType: system.platform,
      appVersion: `${config.name}:${config.version}`,
      pageId: null,
      pageName: null,
      os: `${system.system}|wechat ${system.version}|sdk ${system.SDKVersion}`,
      screen: `${system.windowWidth}x${system.windowHeight}`,
      language: system.language,
      phoneModel: system.model,
      deviceId: config.device.deviceId,
      eventAction: null,
      eventLabel: null,
      eventSource: null,
      eventValue: null,
      eventCategory: null
    }
  },
  /**
   * 默认数据
   */
  data() {
    return {}
  },
  /**
   *
   * @param {Object} [opts={}]
   * @param {String} [opts.eventAction]
   * @param {String} [opts.eventLabel]
   * @param {String} [opts.eventCategory]
   * @param {Number} [opts.eventValue]
   */
  push(opts = {}) {
    const that = this
    const data = Object.assign({}, this.setDefaults())

    const component = new Component({
      scope: `$wux.track`,
      data: {},
      methods: {

      }
    })

    data.pageId = component.page.data.pageId
    data.pageName = component.page.data.pageName
    data.parameters = component.page.data.pageParameters

    if (opts.eventAction === 'click') {
      const clickData = {
        [opts.eventLabel] : 1
      }
      data.clickData = JSON.stringify(clickData)
      data.eventAction = 'click'
    } else {
      Object.assign(data, opts)
    }

    // data.lat = config.location.latitude
    // data.lng = config.location.longitude

    this.UBTService.report(data)
  }
}
