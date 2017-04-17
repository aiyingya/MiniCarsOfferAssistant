/**
 * Created by David on 27/03/2017.
 */
import Service from './base.service'

export default class UBTService extends Service {

  urls = {
    dev: 'https://test.yaomaiche.com/ubtdev/',
    gqc: 'https://test.yaomaiche.com/ubtgqc/',
    prd: 'https://ubt.yaomaiche.com/'
  }

  constructor() {
    super()
  }

  sendMessageByPromise(opts) {
    return super.sendMessageByPromise(opts)
  }

  /**
   * 上报信息
   *
   * @param {Object} opts
   * @param {Object} opts.data 上报数据集合
   * @returns {Promise}
   *
   * @memberOf UBTService
   */
  report(opts) {
    return this.sendMessageByPromise({
      path: 'acquire/report',
      method: 'GET',
      data: opts.data
    })
  }
}
