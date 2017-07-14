// @flow
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

  /**
   * 上报信息
   *
   * @param {any} data
   * @returns {Promise<any>}
   * @memberof UBTService
   */
  report(data: any): Promise<any> {
    return this.sendMessageByPromise({
      path: 'acquire/report',
      method: 'GET',
      data: data
    })
  }
}
