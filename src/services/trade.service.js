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

  sendMessage(opts, loadingType = 'toast') {
    opts.loadingType = loadingType
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
    },'none')
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
    }, 'none')
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
    }, 'none')
  }
  
  /**
   *  获取用户搜索记录
   *  clientId 用户ID
   */
  getUserSearchHistory(opts) {
    this.sendMessage({
      path: 'cgi/search/history/text',
      method: 'GET',
      data: opts.data,
      success: opts.success,
      fail: opts.fail
    }, 'none')
  }
  
  /**
   *  上传用户搜索记录
   *  clientId 用户ID
   */
  postUserSearchHistory(opts) {
    this.sendMessage({
      path: 'cgi/search/history/text',
      method: 'POST',
      data: opts.data,
      success: opts.success,
      fail: opts.fail
    }, 'none')
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
