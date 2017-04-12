/**
 * Created by David on 28/03/2017.
 */

import { ENV } from './config'
import YMC from './YMC'

export default class Services {
  urls = {}
  ymc = new YMC()

  sendMessage(options) {
    const url = `${this.urls[ENV]}${options.path}`
    this.ymc.request({
      url: url,
      method: options.method,
      header: options.header,
      data: options.data,
      success: options.success,
      fail: options.fail,
      loadingType: options.loadingType
    })
  }

  sendMessageByPromise(options) {
    const url = `${this.urls[ENV]}${options.path}`
    return this.ymc.requestByPromise({
      url: url,
      method: options.method,
      header: options.header,
      data: options.data
    })
  }
}
