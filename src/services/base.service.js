/**
 * Created by David on 28/03/2017.
 */

import config from '../config'
import YMC from './YMC'

export default class Services {
  urls = {}
  ymc = new YMC()

  /**
   * 发送消息的封装方法
   *
   * @param {Object} options
   * @param {String} options.path
   * @param {String} options.method
   * @param {Object} options.header
   * @param {Object} options.data
   * @param {Function} options.success
   * @param {Function} options.fail
   *
   * @memberOf Services
   */
  sendMessage(options) {
    const url = `${this.urls[config.ENV]}${options.path}`
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

  /**
   * 发送消息的封装方法
   *
   * @param {Object} options
   * @param {String} options.path
   * @param {Sting} options.method
   * @param {Object} options.header
   * @param {Object} options.data
   *
   * @memberOf Services
   */
  sendMessageByPromise(options) {
    const url = `${this.urls[config.ENV]}${options.path}`
    return this.ymc.requestByPromise({
      url: url,
      method: options.method,
      header: options.header,
      data: options.data
    })
  }

}
