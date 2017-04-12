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

  sendMessageByPromise(opts) {
    console.log('sendMessageByPromise')
    return super.sendMessageByPromise(opts)
  }

  /**
   * 搜索联想接口
   *
   * @param {any} opts
   * @param {String} opts.text 不详
   * @param {String} opts.n 不详
   * @returns {Promise}
   *
   * @memberOf TradeService
   */
  searchInput (opts) {
    return this.sendMessageByPromise({
      path: 'cgi/search/car/index',
      method: 'GET',
      data: {
        text: opts.text,
        n: opts.n
      }
    })
  }

  /**
   * 热推 车辆型号(spu)
   *
   * @returns {Promise}
   *
   * @memberOf TradeService
   */
  getHotPushCarModels () {
    return this.sendMessageByPromise({
      path: 'cgi/navigate/items/hot',
      method: 'GET',
      data: {}
    })
  }

  /**
   * 热推 车辆品牌(brand)
   *
   * @returns {Promise}
   *
   * @memberOf TradeService
   */
  getHotPushBrands () {
    return this.sendMessageByPromise({
      path: 'cgi/navigate/brands/hot',
      method: 'GET',
      data: {}
    })
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
   *  获取导航路径中的 车辆系列(serial) 列表
   *
   * @param {Object} opts
   * @param {String} opts.brandId
   * @param {Boolean} opts.deleted
   * @param {Boolean} opts.group
   * @param {Boolean} opts.joinOnSaleCount
   * @param {Number} opts.level
   * @returns {Promise}
   *
   * @memberOf TradeService
   */
  getNavigatorForCarSeries (opts) {
    return this.sendMessageByPromise({
      path: 'cgi/navigate/models/query',
      method: 'POST',
      data: {
        brandId: opts.brandId,
        deleted: false,
        group: true,
        joinOnSaleCount: true,
        level: 1
      }
    })
  }

  /**
   *  获取导航路径中的 车辆品牌(brand) 列表
   *
   * @param {Object} opts
   * @param {String} opts.code
   * @param {Boolean} opts.deleted
   * @param {Boolean} opts.group
   * @param {Boolean} opts.joinOnSaleCount
   * @param {Number} opts.level
   * @returns {Promise}
   *
   * @memberOf TradeService
   */
  getNavigatorForCarBrands (opts) {
    return this.sendMessageByPromise({
      path: 'cgi/navigate/brands/query',
      method: 'POST',
      data: {
        code: '0',
        deleted: false,
        group: true,
        joinOnSaleCount: true,
        level: 1
      }
    })
  }
}
