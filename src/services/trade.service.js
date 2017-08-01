
// @flow
/**
 * Created by David on 27/03/2017.
 */
import BaseTradeService from '../landrover/business/service/trade.service'

import { container } from '../landrover/business/index'
export default class TradeService extends BaseTradeService {

  constructor () {
    super()
  }

  /**
   * 搜索联想接口
   *
   * @param {string} text
   * @param {number} n
   * @returns {Promise<Array<SearchResult>>}
   * @memberof TradeService
   */
  searchInput (text: string, n: number): Promise<Array<SearchResult>> {
    return this.retrieveSearchResult(text, n)
  }

  /**
   * 热推 车辆型号(spu)
   *
   * @returns {Promise<Array<HotCarModel>>}
   *
   * @memberof TradeService
   */
  getHotPushCarModels (): Promise<Array<HotCarModel>> {
    return this.retrieveHotCarModels()
  }

  /**
   * 热推 车辆品牌(brand)
   *
   * @returns {Promise<Array<HotCarBrand>>}
   * @memberof TradeService
   */
  getHotPushBrands (): Promise<Array<HotCarBrand>> {
    return this.retrieveHotBrands()
  }

  /**
   *  获取用户搜索记录
   *
   * @returns {Promise<Array<string>>}
   * @memberof TradeService
   */
  getUserSearchHistory (): Promise<Array<string>> {
    return this.retrieveSearchHistory(null)
  }

  /**
   *  上传用户搜索记录
   *
   * @param {string} searchText
   * @returns {Promise<void>}
   * @memberof TradeService
   */
  postUserSearchHistory (searchText: string): Promise<void> {
    const auth = container.userService.auth
    const userId = auth != null? auth.userId : null
    const channel = 'wxapp'
    return this.postSearchHistory(searchText, userId, channel)
  }

  /**
   * 获取导航路径中的 车辆系列(serial) 列表
   *
   * @param {number} brandId
   * @param {boolean} [showDeleted=false]
   * @param {boolean} [resultGroupByFirstLetter=true]
   * @param {boolean} [showSaleCount=true]
   * @param {number} [brandLevel=1]
   * @returns {(Promise<Array<CarModel> | Array<CarGroup>>)}
   * @memberof TradeService
   */
  getNavigatorForCarSeries (
    brandId: number,
    showDeleted: boolean = false,
    resultGroupByFirstLetter: boolean = true,
    showSaleCount: boolean = true,
    brandLevel: number = 1
    ): Promise<Array<CarModel> | Array<CarGroup>> {
    return this.retrieveNavigatorCarSeries(brandId, showDeleted, resultGroupByFirstLetter, showSaleCount, brandLevel)
  }

  /**
   * 获取导航路径中的 车辆品牌(brand) 列表
   *
   * @param {(0 | 1)} [categoryCode=0]
   * @param {boolean} [showDeleted=false]
   * @param {boolean} [resultGroupByFirstLetter=true]
   * @param {boolean} [showSaleCount=true]
   * @param {number} [brandLevel=1]
   * @returns
   * @memberof TradeService
   */
  getNavigatorForCarBrands (
    categoryCode: 0 | 1 = 0,
    showDeleted: boolean = false,
    resultGroupByFirstLetter: boolean = true,
    showSaleCount: boolean = true,
    brandLevel: number = 1
    ): Promise<Array<CarBrand> | Array<CarGroup>> {
    return this.retrieveNavigatorCarBrands(categoryCode, showDeleted, resultGroupByFirstLetter, showSaleCount, brandLevel)
  }
}
