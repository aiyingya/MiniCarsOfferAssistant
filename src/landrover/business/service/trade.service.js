// @flow
import Service from './base.service'
import { config, storage, request, device, ui } from '../index'

export default class TradeService extends Service {
  baseUrl = {
    dev: 'https://test.yaomaiche.com/tradedev/',
    gqc: 'https://test.yaomaiche.com/tradegqc/',
    prd: 'https://trade.yaomaiche.com/trade/'
  };

  constructor() {
    super()
  }

  /**
   * 获取搜索结果
   *
   * @param {string} searchText
   * @param {number} resultMaxCount  查询结果最多数量，服务端有默认值 10
   * @returns {Promise<Array<SearchResult>>}
   * @memberof TradeService
   */
  retrieveSearchResult(
    searchText: string,
    resultMaxCount: number | null
  ): Promise<Array<SearchResult>> {
    const text = searchText
    const n = resultMaxCount
    return this.request(
      'cgi/search/car/index',
      'GET',
      {
        text,
        n
      }
    )
  }

  /**
   * 获取热推车型
   *
   * @returns {Promise<Array<HotCarModel>>}
   * @memberof TradeService
   */
  retrieveHotCarModels(): Promise<Array<HotCarModel>> {
    return this.request(
      'cgi/navigate/items/hot',
      'GET'
    )
  }

  /**
   * 获取热推车辆品牌
   *
   * @returns {Promise<Array<HotCarBrand>>}
   * @memberof TradeService
   */
  retrieveHotBrands(): Promise<Array<HotCarBrand>> {
    return this.request(
      'cgi/navigate/brands/hot',
      'GET'
    )
  }

  /**
   * 获取用户搜索记录
   *
   * @param {number} resultMaxCount 查询最大记录条数，默认10
   */
  retrieveSearchHistory(
    resultMaxCount: number | null
  ): Promise<Array<string>> {
    const n = resultMaxCount
    return this.request(
      'cgi/search/history/text',
      'GET',
      {
        n
      }
    )
  }

  /**
   * 上传搜索记录
   * @param {string} searchText 搜索文字
   * @param {*} userId ，没有可以不传
   * @param {string} channel 渠道，传 wxapp，ymc等
   */
  postSearchHistory(
    searchText: string,
    userId: string | null,
    channel: string
  ): Promise<void> {
    const text = searchText
    return this.request(
      'cgi/search/history/text',
      'POST',
      {
        userId,
        text,
        channel
      }
    )
  }

  /**
   * 获取导航路径中的车辆品牌 (brand) 列表
   *
   * @param {boolean} showDeleted 是否显示删除的品牌
   * @param {boolean} resultGroupByFirstLetter 结果是否按首字母分组
   * @param {boolean} showSaleCount  是否显示在售数量
   * @param {*} brandLevel 品牌等级，1级 2级，null 为所有
   */
  retrieveNavigatorCarBrands(
    categoryCode: 0 | 1,
    showDeleted: boolean = false,
    resultGroupByFirstLetter: boolean = false,
    showSaleCount: boolean = false,
    brandLevel: number = 1
  ): Promise<Array<CarBrand> | Array<CarGroup>> {
    const code = categoryCode // 分类Code, 0 车， 1 精品
    const deleted = showDeleted
    const group = resultGroupByFirstLetter
    const joinOnSaleCount = showSaleCount
    const level = brandLevel
    return this.request(
      'cgi/navigate/brands/query',
      'POST',
      {
        code,
        deleted,
        group,
        joinOnSaleCount,
        level
      }
    )
  }

  /**
   * 获取导航路径中的 车辆系列(serial) 列表
   *
   * @param {number} brandId 所属品牌 ID
   * @param {boolean} showDeleted 是否显示删除的品牌
   * @param {boolean} resultGroupByFirstLetter 结果是否按型号分组
   * @param {boolean} showSaleCount  是否显示在售数量
   * @param {*} brandLevel 品牌等级，1级 2级，null 为所有
   * @returns {Promise<any>}
   * @memberof TradeService
   */
  retrieveNavigatorCarSeries(
    brandId: number,
    showDeleted: boolean = false,
    resultGroupByFirstLetter: boolean = false,
    showSaleCount: boolean = false,
    brandLevel: number = 1
  ): Promise<Array<CarModel> | Array<CarGroup>> {
    const deleted = showDeleted
    const group = resultGroupByFirstLetter
    const joinOnSaleCount = showSaleCount
    const level = brandLevel
    return this.request(
      'cgi/navigate/models/query',
      'POST',
      {
        brandId,
        deleted,
        group,
        joinOnSaleCount,
        level
      }
    )
  }
}
