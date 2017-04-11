/**
 * Created by David on 27/03/2017.
 */
import Service from './base.service'

export default class UBTService extends Service {

  urls = {
    dev: 'https://ubt.yaomaiche.com/',
    gqc: 'https://ubt.yaomaiche.com/',
    prd: 'https://ubt.yaomaiche.com/'
  }

  constructor() {
    super()
  }

  sendMessage(opts, loadingType = 'none') {
    opts.loadingType = loadingType
    super.sendMessage(opts)
  }

  /**
   * 上报信息
   * @param opts
   */
  report(opts) {
    this.sendMessage({
      path: 'acquire/report',
      method: 'GET',
      data: opts.options,
      success: opts.success,
      fail: opts.fail
    })
  }
}
