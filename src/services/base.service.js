// @flow
/**
 * Created by David on 28/03/2017.
 */

import config from '../config'
import YMC from './YMC'

/**
 *
 *
 * @export
 * @class Services
 */
export default class Services {

  urls = {}
  ymc = new YMC()

  /**
   * 发送消息的封装方法 ***该方法已经废弃，请勿再使用***
   *
   * @param {Object} options
   * @param {String} options.path
   * @param {String} options.method
   * @param {object} options.header
   * @param {object} options.data
   * @param {function} options.success
   * @param {function} options.fail
   *
   * @memberof Services
   */
  sendMessage(options: any) {
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
   *
   *
   * @param {({
   *     path: string,
   *     data?: any,
   *     header?: any,
   *     method?: 'GET'|'POST'|'PUT'|'DELETE'|'OPTIONS'|'HEAD'|'TRACE'|'CONNECT',
   *     dataType?: 'json'
   *   })} {
   *     path,
   *     data,
   *     header,
   *     method,
   *     dataType
   *   }
   * @returns {Promise<any>}
   * @memberof Services
   */
  sendMessageByPromise({
    path,
    data,
    header,
    method,
    dataType
  }: {
      path: string,
      data?: any,
      header?: any,
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'TRACE' | 'CONNECT',
      dataType?: 'json'
    }): Promise<any> {
    const url = `${this.urls[config.ENV]}${path}`
    return this.ymc.requestByPromise(
      url,
      data,
      header,
      method,
      data
    )
  }

  /**
   * 启动服务
   *
   * @memberof Services
   */
  setup() {

  }
}
