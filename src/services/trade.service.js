
// @flow
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

  /**
   * 搜索联想接口
   *
   * @param {string} text
   * @param {number} n
   * @returns {Promise<any>}
   * @memberof TradeService
   */
  searchInput (text: string, n: number): Promise<any> {
    return this.sendMessageByPromise({
      path: 'cgi/search/car/index',
      method: 'GET',
      data: {
        text,
        n
      }
    })
  }

  /**
   * 热推 车辆型号(spu)
   *
   * @returns {Promise<any>}
   *
   * @memberof TradeService
   */
  getHotPushCarModels(): Promise<any> {
    return this.sendMessageByPromise({
      path: 'cgi/navigate/items/hot',
      method: 'GET',
      data: {}
    })
  }

  /**
   * 热推 车辆品牌(brand)
   *
   * @returns {Promise<any>}
   * @memberof TradeService
   */
  getHotPushBrands(): Promise<any> {
    return this.sendMessageByPromise({
      path: 'cgi/navigate/brands/hot',
      method: 'GET'
    })
  }

  /**
   *  获取用户搜索记录
   *
   * @param {string} clientId
   * @returns {Promise<any>}
   * @memberof TradeService
   */
  getUserSearchHistory(clientId: string): Promise<any> {
    return this.sendMessageByPromise({
      path: 'cgi/search/history/text',
      method: 'GET',
      data: {
        clientId
      }
    })
  }

  /**
   *  上传用户搜索记录
   *
   * @param {number} userId
   * @param {string} text
   * @returns {Promise<any>}
   * @memberof TradeService
   */
  postUserSearchHistory(userId: number, text: string): Promise<any> {
    const channel = 'wxapp'
    return this.sendMessageByPromise({
      path: 'cgi/search/history/text',
      method: 'POST',
      data: {
        userId,
        text,
        channel
      }
    })
  }

  /**
   *  获取导航路径中的 车辆系列(serial) 列表
   *
   * @param {number} brandId
   * @param {boolean} [deleted=false]
   * @param {boolean} [group=true]
   * @param {boolean} [joinOnSaleCount=true]
   * @param {number} [level=1]
   * @returns
   * @memberof TradeService
   */
  getNavigatorForCarSeries(
    brandId: number,
    deleted: boolean = false,
    group: boolean = true,
    joinOnSaleCount: boolean = true,
    level: number = 1
    ) {
    return this.sendMessageByPromise({
      path: 'cgi/navigate/models/query',
      method: 'POST',
      data: {
        brandId,
        deleted,
        group,
        joinOnSaleCount,
        level
      }
    })
  }

  /**
   *  获取导航路径中的 车辆品牌(brand) 列表
   *
   * @param {number} [code=0]
   * @param {boolean} [deleted=false]
   * @param {boolean} [group=true]
   * @param {boolean} [joinOnSaleCount=true]
   * @param {number} [level=1]
   * @returns
   * @memberof TradeService
   */
  getNavigatorForCarBrands (
    code: number = 0,
    deleted: boolean = false,
    group: boolean = true,
    joinOnSaleCount: boolean = true,
    level: number = 1
    ) {
    return this.sendMessageByPromise({
      path: 'cgi/navigate/brands/query',
      method: 'POST',
      data: {
        code,
        deleted,
        group,
        joinOnSaleCount,
        level
      }
    })
  }
}
