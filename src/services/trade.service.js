/**
 * Created by David on 27/03/2017.
 */
import Service from './base.service'

export default class TradeService extends Service {

  urls = {
    dev: 'https://test.yaomaiche.com/tradedev/',
    gqc: 'https://test.yaomaiche.com/tradegqc/',
    prd: 'https://trade.yaomaiche.com/trade/'
  }

  constructor () {
    super()
  }

  sendMessage(opts) {
    opts.loadingType = 'toast'
    super.sendMessage(opts)
  }

  /**
   * 搜索联想
   * @param opts
   */
  searchInput (opts) {
    this.sendMessage({
      path: 'cgi/search/car/index',
      method: 'GET',
      data: {
        text: opts.text,
        n: opts.n
      },
      success: opts.success,
      fail: opts.fail
    })
  }

  /**
   * 热推车型
   * @param opts
   */
  getHotPushCars (opts) {
    this.sendMessage({
      path: 'cgi/navigate/items/hot',
      method: 'GET',
      data: {},
      success: opts.success,
      fail: opts.fail
    })
  }

  /**
   * 热推车品牌
   * @param opts
   */
  getHotPushBrands (opts) {
    this.sendMessage({
      path: 'cgi/navigate/brands/hot',
      method: 'GET',
      data: {},
      success: opts.success,
      fail: opts.fail
    })
  }

  /**
   * 品牌选车系
   * @param opts
   */
  getNavigatorForCarSeries (opts) {
    this.sendMessage({
      path: 'cgi/navigate/models/query',
      method: 'POST',
      data: {
        brandId: opts.brandId,
        deleted: false,
        group: true,
        joinOnSaleCount: true,
        level: 1
      },
      success: opts.success,
      fail: opts.fail
    })
  }

  getNavigatorForCarBrands (opts) {
    this.sendMessage({
      path: 'cgi/navigate/brands/query',
      method: 'POST',
      data: {
        code: '0',
        deleted: false,
        group: true,
        joinOnSaleCount: true,
        level: 1
      },
      success: opts.success,
      fail: opts.fail
    })
  }
}
