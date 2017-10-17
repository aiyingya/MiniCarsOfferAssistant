// @flow
/**
 *
 *
 * Created by David on 28/03/2017.
 */

import Service from '../landrover/business/service/base.service'

import UserService from './user.service'
import util from '../utils/util'
import {
  container
} from '../landrover/business/index'

/**
 *
 *
 * @export
 * @class SAASService
 * @extends {Service}
 */
export default class SAASService extends Service {

  userService: UserService

  responsePackFormat = 'old'

  baseUrl = {
    dev: 'https://test.yaomaiche.com/ymcdev/',
    gqc: 'https://test.yaomaiche.com/ymcgqc/',
    prd: 'https://ymcapi.yaomaiche.com/ymc/'
  }

  constructor() {
    super()
  }

  setup(): Promise<void> {
    this.userService = container.userService
    return super.setup()
  }

  /**
   * 发布已经生成的报价单
   *
   * @param {number} draftId
   * @param {string} customerMobile
   * @param {string} customerName
   * @param {number} customerSex
   * @param {boolean} [sendMessage=true]
   * @param {number} validTime
   * @returns {Promise<any>}
   * @memberof SAASService
   */
  requestPublishQuotation(
    draftId: number,
    customerMobile: string,
    customerName: string,
    customerSex: number,
    sendMessage: boolean = true,
    validTime: number
  ): Promise<any> {
    return this.request(
      'sale/quotation',
      'POST', {
        draftId,
        customerMobile,
        customerName,
        customerSex,
        sendMessage,
        validTime
      }
    )
  }

  /**
   * 生成报价草稿
   *
   * @param {Object} quotationDraft
   * @param {String} quotationDraft.name 报价单名称，没有可以不传
   * @param {Array} quotationDraft.Items 商品列表
   * @param {String} quotationDraft.Items[].itemType 商品类型
   * @param {String} quotationDraft.Items[].itemPic 商品图片
   * @param {String} quotationDraft.Items[].itemName 商品名称
   * @param {String} quotationDraft.Items[].specifications 外饰/内饰
   * @param {Number} quotationDraft.Items[].guidePrice 官价
   * @param {Number} quotationDraft.Items[].sellingPrice 裸车价
   * @param {Boolean} quotationDraft.hasLoan 必传，true/false，boolean，是否贷款
   * @param {Number} quotationDraft.paymentRatio 首付比例（%），decimal，全款时不传，取值范围0~100
   * @param {Number} quotationDraft.stages 贷款期数，int，全款时不传
   * @param {Number} quotationDraft.expenseRate
   * @param {Number} quotationDraft.requiredExpenses 必需费用（元），deciaml，取值范围0~999999999
   * @param {Number} quotationDraft.otherExpenses 其他费用（元），deciaml，取值范围0~999999999
   * @param {Number} quotationDraft.advancePayment 必传，首次支付金额，如果全款则为全款金额
   * @param {Number} quotationDraft.monthlyPayment 月供金额，每月还款金额，全款时不传
   * @param {Number} quotationDraft.totalPayment
   * @param {Number} quotationDraft.remark 备注
   * @param {Number} quotationDraft.carPrice
   * @param {Number} quotationDraft.purchaseTax
   * @param {Number} quotationDraft.carTax
   * @param {Number} quotationDraft.carNumFee
   * @param {Number} quotationDraft.boutiqueFee
   * @param {Number} quotationDraft.serviceFee
   * @param {Number} quotationDraft.installFee
   * @param {Number} quotationDraft.otherFee
   * @param {Number} quotationDraft.loanFee
   * @param {Number} quotationDraft.saleMobile
   * @param {Number} quotationDraft.rateType
   * @param {Number} quotationDraft.marketPrice
   * @param {Number} quotationDraft.insuranceDetail
   * @param {Number} quotationDraft.carCapacity 排量
   * @param {Boolean} quotationDraft.electricCar 是否纯电动
   * @param {Number} quotationDraft.insuranceDetail
   * @param {Number} quotationDraft.metallicPaintFee 金属漆加价
   *
   * @returns {Promise}
   * @memberof SAASService
   */
  requestSaveQuotationDraft(quotationDraft: any): Promise<any> {
    // FIXME: 直接将提交对象转换为正常的提交对象
    let data_part_1: any = {}
    if (quotationDraft.hasLoan) {
      data_part_1 = {
        quotationName: quotationDraft.quotationName,
        quotationItems: [{
          itemType: quotationDraft.quotationItems[0].itemType,
          itemName: quotationDraft.quotationItems[0].itemName,
          itemPic: quotationDraft.quotationItems[0].itemPic,
          specifications: quotationDraft.quotationItems[0].specifications,
          guidePrice: quotationDraft.quotationItems[0].guidePrice,
          sellingPrice: quotationDraft.quotationItems[0].sellingPrice,
          spuId: quotationDraft.spuId
        }],
        hasLoan: quotationDraft.hasLoan,
        paymentRatio: quotationDraft.paymentRatio,
        stages: quotationDraft.stages,
        expenseRate: quotationDraft.expenseRate,
        requiredExpenses: quotationDraft.requiredExpenses,
        otherExpenses: quotationDraft.otherExpenses,
        advancePayment: quotationDraft.advancePayment,
        monthlyPayment: quotationDraft.monthlyPayment,
        totalPayment: quotationDraft.totalPayment,
        remark: quotationDraft.remark,
        carPrice: quotationDraft.quotationItems[0].sellingPrice,
        purchaseTax: quotationDraft.requiredExpensesAll.purchaseTax,
        carTax: quotationDraft.requiredExpensesAll.vehicleAndVesselTax,
        carNumFee: quotationDraft.requiredExpensesAll.licenseFee,
        metallicPaintFee: quotationDraft.requiredExpensesAll.metallicPaintFee,
        boutiqueFee: quotationDraft.otherExpensesAll.boutiqueCost,
        serviceFee: quotationDraft.otherExpensesAll.serverFee,
        installFee: quotationDraft.otherExpensesAll.installationFee,
        otherFee: quotationDraft.otherExpensesAll.otherFee
      }
    } else {
      data_part_1 = {
        quotationName: quotationDraft.quotationName,
        quotationItems: [{
          itemType: quotationDraft.quotationItems[0].itemType,
          itemName: quotationDraft.quotationItems[0].itemName,
          itemPic: quotationDraft.quotationItems[0].itemPic,
          specifications: quotationDraft.quotationItems[0].specifications,
          guidePrice: quotationDraft.quotationItems[0].guidePrice,
          sellingPrice: quotationDraft.quotationItems[0].sellingPrice
        }],
        hasLoan: quotationDraft.hasLoan,
        requiredExpenses: quotationDraft.requiredExpenses,
        otherExpenses: quotationDraft.otherExpenses,
        advancePayment: quotationDraft.advancePayment,
        totalPayment: quotationDraft.totalPayment,
        remark: quotationDraft.remark,
        carPrice: quotationDraft.quotationItems[0].sellingPrice,
        purchaseTax: quotationDraft.requiredExpensesAll.purchaseTax,
        carTax: quotationDraft.requiredExpensesAll.vehicleAndVesselTax,
        carNumFee: quotationDraft.requiredExpensesAll.licenseFee,
        metallicPaintFee: quotationDraft.requiredExpensesAll.metallicPaintFee,
        boutiqueFee: quotationDraft.otherExpensesAll.boutiqueCost,
        serviceFee: quotationDraft.otherExpensesAll.serverFee,
        installFee: quotationDraft.otherExpensesAll.installationFee,
        otherFee: quotationDraft.otherExpensesAll.otherFee
      }
    }
    console.log(quotationDraft)
    let snsId = null
    if (this.userService.auth != null) {
      snsId = this.userService.auth.userId
    } else if (this.userService.weixin.userInfo != null) {
      snsId = this.userService.weixin.userInfo.customerId
    }
    const data_part_2: any = {
      loanFee: quotationDraft.loanFee,
      saleMobile: quotationDraft.saleMobile,
      rateType: quotationDraft.rateType,
      marketPrice: quotationDraft.quotationItems[0].originalPrice,
      insuranceDetail: quotationDraft.insuranceDetail,
      carCapacity: quotationDraft.carCapacity, //排量
      electricCar: quotationDraft.electricCar, //是否纯电动
      snsId: snsId,
      loginChannel: this.userService.loginChannel
    }

    const data = Object.assign({}, data_part_1, data_part_2)

    return this.request(
      'sale/quotation/draft',
      'POST',
      data
    )
  }

  /**
   * 发起订车行为
   *
   * @param skuIds          [String]
   * @param quotationId     可选
   * @param customerMobile  可选
   * @param object
   */
  requestBookCar(
    itemName: string,
    spec: string,
    itemPrice: number,
    itemCount: number
  ): Promise<any> {
    return this.request(
      'sale/quotation/order',
      'POST', {
        userId: this.userService.auth.userId,
        itemName: itemName,
        spec: spec,
        itemPrice: itemPrice,
        itemCount: itemCount
      },
    )
  }

  /**
   * 获取报价列表
   *
   * @param pageIndex 页面索引号
   * @param pageSize  页面大小
   */
  requestQuotationsList(
    pageIndex: number,
    pageSize: number,
  ): Promise<any> {
    let snsId = null
    if (this.userService.auth != null) {
      snsId = this.userService.auth.userId
    } else if (this.userService.weixin.userInfo != null) {
      snsId = this.userService.weixin.userInfo.customerId
    }
    return this.request(
      'sale/quotation/new',
      'GET', {
        channel: this.userService.loginChannel,
        snsId: snsId,
        pageIndex: pageIndex,
        pageSize: pageSize
      }
    )
      .then(res => {
        for (let item of res.content) {
          item.checkTime = util.getTimeDifferenceString(item.viewTime)
          item.checkMoreNumber = 2

          if (item.quotationList.length > 0) {
            for (let qitem of item.quotationList) {
              let totalPayment = util.priceStringWithUnit(qitem.totalPayment);
              let sellingPrice = util.priceStringWithUnit(qitem.quotationItems[0].sellingPrice);
              let guidePrice = util.priceStringWithUnitNumber(qitem.quotationItems[0].guidePrice);

              /// 实时计算优惠点数
              let downPrice = util.downPrice(qitem.quotationItems[0].sellingPrice, qitem.quotationItems[0].guidePrice)
              let downPriceFlag = util.downPriceFlag(downPrice);
              let downPriceString = ''
              if (downPriceFlag !== 0) {
                downPriceString = util.priceStringWithUnit(downPrice)
              }

              /**
               * 计算时间.
               */
              item.shared = qitem.shared
              qitem.createdTime = util.getTimeDifferenceString(qitem.quotationTime)
              qitem.viewModel = {
                totalPayment: totalPayment,
                sellingPrice: sellingPrice,
                guidePrice: guidePrice,
                itemName: `【${qitem.quotationItems[0].guidePrice / 100}】${qitem.quotationItems[0].itemName}`,
                priceChange: {
                  flag: downPriceFlag,
                  price: downPriceString
                }
              }
            }
          }
        }
        return res
      })
  }

  /**
   * 删除报价记录
   *
   * @param id 报价单ID
   * @param opts
   */
  requestDeleteRecotd(quotationId: number) {
    return this.request(
      `sale/quotation/delete/${quotationId}`,
      'POST'
    )
  }

  /**
   * 获取车源列表
   * @deprecated 2.0.0
   * @param carModelId
   * @param object
   */
  requestCarSourcesList(
    carModelId: number
  ): Promise<{
    capacity: number,
    carModelId: number,
    carModelName: string,
    carSourcesBySkuInSpuList: Array<{ carSku: CarSKUForCarSource, carSourcesList: Array<CarSource> }>,
    electricCar: boolean,
    filters: Array<Filter>,
    officialPrice: number,
    officialPriceStr: string,
    seatNums: Array<number>,
    praiseModels: Array<PraiseModel>
  }> {
    // MARK： 目前只取地址列表中的第一个
    const data: {
      userId: string,
      pid?: number,
      cid?: number,
      did?: number
    } = {
        userId: this.userService.auth.userId
      }
    const locations = this.userService.location
    if (locations && locations.length > 0) {
      const location = locations[0]
      if (location.provinceId) {
        data.pid = location.provinceId
      }
      if (location.cityId) {
        data.cid = location.cityId
      }
      if (location.districtId) {
        data.did = location.districtId
      }
    }
    return this.request(
      `product/car/spu/${carModelId}/sources`,
      'GET',
      data
    )
  }

  /**
   * 获取车辆行情商品列表接口
   *
   * @description 2.0.0 新增
   * @param {number} spuId
   * @returns {Promise<{
   *     spuId: number,
   *     spuName: string,
   *     guidePrice: number,
   *     seatNums: Array<number>,
   *     capacity: number,
   *     electricCar: boolean,
   *     praiseModels: Array<PraiseModel>,
   *     items: Array<CarSourcesBySKU>
   *   }>}
   * @memberof SAASService
   */
  getAllCarSourceItemsForSPU(
    spuId: number
  ): Promise<{
    spuId: number,
    spuName: string,
    guidePrice: number,
    seatNums: Array<number>,
    capacity: number,
    electricCar: boolean,
    praiseModels: Array<PraiseModel>,
    items: Array<CarSourcesBySKU>
  }> {
    return this.request(
      `car/spu/${spuId}/items`,
      `GET`
    )
  }

  /**
   * 获取某一个公司下的车辆行情列表
   * 分页
   *
   * @description 2.0.0 新增
   * @param {number} companyId
   * @returns {Promise<Array<{
   *     spuSummary: SpuSummary,
   *     itemDetail: CarSource
   *   }>>}
   * @memberof SAASService
   */
  getCarSourceItemsByCompanyForSPU(
    companyId: number,
    spuId: number,
    pageIndex: number | null = 1,
    pageSize: number | null = 10
  ): Promise<Pagination<{
    spuSummary: SpuSummary,
    itemDetail: CarSource
  }>> {
    return this.request(
      `supply/company/${companyId}/items`,
      `GET`,
      {
        spuId,
        pageIndex,
        pageSize
      }
    )
  }

  /**
   * 获取特定 spu 下的特定公司特定报价的供应商联系列表
   *
   * 来源 车源详情中众数页面中的电话列表调用
   * @description 2.0.0 新增
   * @param {number} spuId
   * @param {number} companyId
   * @param {number} salePrice
   * @returns {Promise<Array<Supplier>>}
   * @memberof SAASService
   */
  getAllSuppliersByCompanyAndPriceForSPU(
    spuId: number,
    companyId: number,
    quotedPrice: number
  ): Promise<Array<Supplier>> {
    const salePrice = quotedPrice
    return this.request(
      `supply/company/${companyId}/suppliers`,
      `GET`,
      {
        salePrice,
        spuId
      }
    )
  }

  /**
   * 获取特定 companyId 下的特定公司特定报价的供应商联系列表
   *
   *  来源 供应商列表调用
   * @description 2.0.0 新增
   * @param {number} companyId
   * @returns {Promise<Array<Supplier>>}
   * @memberof SAASService
   */
  getAllSuppliersByCompanyAndPriceForCompanyId(
    companyId: number
  ): Promise<Array<Supplier>> {
    return this.request(
      `/supply/company/call?cid=${companyId}`,
      `GET`
    )
  }

  /**
   * 打标签接口
   *
   * @param {number} spuId
   * @param {number} carSourceId
   * @param {string} tagName
   * @param {number} supplierId
   * @param {boolean} addOrRemove
   * @param {{}} object
   * @memberof SAASService
   */
  requestAddOrRemoveTagnameForASupplier(
    spuId: number,
    carSourceId: number,
    tagName: string,
    supplierId: number,
    addOrRemove: boolean,
    object: any
  ) {
    const method = addOrRemove ? 'POST' : 'DELETE'
    return this.request(
      `product/car/spu/${spuId}/source/${carSourceId}/tag`,
      method, {
        tagName: tagName,
        userId: this.userService.auth.userId,
        supplierId: supplierId
      }
    )
  }

  /**
   * 获取三方车源信息的原文
   *
   * @deprecated 2.0.0
   * @param {number} carSourceId
   * @memberof SAASService
   */
  requestCarSourceContent(
    carSourceId: number,
  ): Promise<{
    content: string,
    indexOf: Array<number>
  }> {
    return this.request(
      `product/car/source/${carSourceId}/content`,
      'GET'
    )
  }

  /**
   * 获取车辆行情的原文
   *
   * @description 2.0.0 新增
   * @param {number} carSourceId
   * @returns {Promise<{
   *     content: string,
   *     indexOf: Array<number>
   *   }>}
   * @memberof SAASService
   */
  getCarSourceOriginalMessage(
    carSourceId: number
  ): Promise<{
    content: string,
    indexOf: Array<number>
  }> {
    const itemId = carSourceId
    return this.request(
      `car/item/${itemId}/message`,
      'GET'
    )
  }

  /**
   * v2.0 供应商行情搜索调用的第一个接口
   *
   * @param {string} text
   * @param {number} pageIndex
   * @param {number} pageSize
   * @ return 搜索结果
   * @memberof SAASService
   */
  requestSearchCarSpu(
    text: string,
    pageIndex: number | null = 1,
    pageSize: number | null = 10,
    userId?: number // 贤达确认：userid从来就没用到过
  ): Promise<Pagination<CarSpuContent>> {
    return this.request(
      `search/car/spu`,
      'GET', {
        text: text,
        userId,
        pageIndex: pageIndex,
        pageSize: pageSize
      }
    )
  }

  /**
   *
   * @param {number} spuId
   * @param {{}} data
   * @param {{}} object
   * @memberof SAASService
   */
  requestSearchSpuBySpuId(
    spuId: number,
    data: any
  ): Promise<any> {
    return this.request(
      `supply/car/spu/${spuId}`,
      'GET',
      data || {},
    )
  }

  /**
   * 车系内的所有车款行情
   *
   * @param {number} carSeriesId
   * @param {boolean} inStock
   * @param {{}} object
   * @memberof SAASService
   */
  requestSearchSpuByCarSeriesId(
    carSeriesId: number,
    inStock: boolean
  ): Promise<CarModelsResponse> {
    return this.request(
      `supply/car/spu`,
      'GET', {
        carSeriesId: carSeriesId,
        inStock: inStock
      }
    )
  }

  /**
   *  获取车款列表(包含搜索)
   *
   * @param {number} sid
   * @param {any} data
   * @param {('CAR_SPU'|string)} type
   * @param {boolean} inStock
   * @memberof SAASService
   */
  requireCarSpu(
    sid: number,
    data: any,
    type: 'CAR_SPU' | 'CAR_SERIES',
    inStock: boolean
  ): Promise<any> {
    let path = type === 'CAR_SPU' ? `supply/car/spu/${sid}` : 'supply/car/spu/'
    let resdata = {
      carSeriesId: sid,
      inStock: inStock
    }
    data = type === 'CAR_SPU' ? data : resdata
    return this.request(
      path,
      'GET',
      resdata
    )
  }

  /**
   * 车源上报
   *
   * @param {number} supplierId
   * @param {string} supplierPhone
   * @returns {Promise<any>}
   * @memberof SAASService
   */
  pushCallRecord(
    supplierId: number,
    supplierPhone: string,
    carSourceId: number
  ): Promise<any> {
    const userId = this.userService.auth.userId
    const userPhone = this.userService.mobile
    const itemId = carSourceId
    const contactPhone = supplierPhone
    // 每次拨打电话都会上报，在上报的时候增加拨打记录
    return this.request(
      'api/user/addCallRecord',
      'POST', {
        userId,
        userPhone,
        supplierId,
        supplierPhone,
        contactPhone,
        itemId
      }
    )
  }


  /**
   * 获取创建报价单的信息
   *
   * @returns
   * @memberof SAASService
   */
  getCreatCarRecordInfo(
    carPrice: number
  ): Promise<{
    carNumberFee: number,
    carPrice: number,
    interestType: 1,
    loanFee: number,
    serviceFee: number,
    oneInterest: number,
    oneWYXS: number,
    twoInterest: number,
    twoWYXS: number,
    threeInterest: number,
    threeWYXS: number,
    validTime: {
      chooseWho: number,
      firstChoose: number,
      secondChoose: number
    }
  }> {
    const userId = this.userService.auth.userId
    return this.request(
      'sale/quotation/initQuotation',
      'GET', {
        userId,
        carPrice
      }
    )
  }

  /**
   * 查询报价偏好设置.
   * @param opts
   */
  gettingPreference() {
    let userId = this.userService.auth.userId
    return this.request(
      `api/config/getQuotaSet/${userId}`,
      'GET'
    )
  }

  /**
   * 报价偏好设置.
   * @param opts
   */
  settingPreference(data: any) {
    const userId = this.userService.auth.userId
    return this.request(
      "api/config/saveQuota",
      'POST', {
        userId,
        ...data
      }
    )
  }

  /**
   * 通过各种费用计算贷款收益
   *
   * @param {number} loanNum 贷款金额
   * @param {number} insuranceNum 保险金额
   * @param {number} carPrice 客户裸车价
   * @param {number} marketPrice 行情价
   * @param {number} boutiqueFee 精品费用
   * @param {number} loanServiceFee 贷款服务费
   * @param {number} installFee 安装费用
   * @param {number} otherFee 其他费用
   * @param {number} serviceFee 服务费用
   * @returns {Promise<{
   *       totalProfit: number, 总收益
   *       profit: number,  裸车收益
   *       insuranceProfit: number, 保险收益
   *       loanProfit: number 贷款收益
   *     }>}
   * @memberof SAASService
   */
  getProfit(
    loanNum: number,
    insuranceNum: number,
    carPrice: number,
    marketPrice: number,
    boutiqueFee: number,
    loanServiceFee: number,
    installFee: number,
    otherFee: number,
    serviceFee: number
  ): Promise<{
    totalProfit: number,
    profit: number,
    insuranceProfit: number,
    loanProfit: number
  }> {
    const userId = this.userService.auth.userId
    return this.request(
      'sale/quotation/queryProfit',
      'GET', {
        userId,
        loanNum,
        insuranceNum,
        carPrice,
        marketPrice,
        boutiqueFee,
        loanServiceFee,
        installFee,
        otherFee,
        serviceFee
      }
    )
  }

  /**
   * 获取保险信息.
   * @param opts
   */
  gettingInsurance() {
    const userId = this.userService.auth.userId
    return this.request(
      `api/config/getInsurance/${userId}`,
      'GET'
    )
  }

  /**
   * 获取保险信息.
   * @param data.capacity 排量
   * @param data.place 门店所在省
   */
  gettingVehicleAndVesselTax(
    capacity: number,
    place: string
  ): Promise<any> {
    return this.request(
      'sale/quotation/getCarTax',
      'GET', {
        capacity,
        place
      }
    )
  }

  /**
   * 获取某一个 spu 的行情走势.
   *
   * @param {number} spuId
   * @returns {Promise<SPUMarketTrendEntity>}
   * @memberof SAASService
   */
  gettingMarketTrend(
    spuId: number
  ): Promise<SPUMarketTrendEntity> {
    return this.request(
      `sale/quotation/getPriceTrend`,
      'GET', {
        spuId
      }
    )
  }

  /**
   * 获得的当前 spu 的当前众数 top n
   *
   * @param {number} spuId
   * @returns {Promise<any>}
   * @memberof SAASService
   */
  getTopNOfCurrentMode(
    spuId: number
  ): Promise<any> {
    return this.request(
      `sale/quotation/getCurrentPrice`,
      'GET', {
        spuId: spuId
      }
    )
  }

  /**
   * 获取某一个公司内部对一个 spu 报价为 quotationPrice 的所有联系方式
   *
   * @deprecated 2.0.0
   * @param {number} companyId
   * @param {(number | null)} supplierId
   * @param {(number | null)} spuId
   * @param {(number | null)} quotationPrice
   * @returns {Promise<Array<Supplier>>}
   * @memberof SAASService
   */
  getContacts(
    companyId: number,
    supplierId: number | null,
    spuId: number | null,
    quotationPrice: number | null
  ): Promise<Array<{
    companyId: number | null,
    companyName: string | null,
    supplierModels: Array<{
      supplierId: number,
      supplierName: string,
      supplierPhone: string,
      callCount: number
    }>
  }>> {
    if (supplierId == null && spuId == null && quotationPrice == null) {
      return this.retrieveContactsByCompany(companyId)
        .then(res => {
          return [
            {
              companyId: null,
              companyName: null,
              supplierModels: res
            }
          ]
        })
    } else {
      const userId = this.userService.auth.userId
      return this.retrieveContactsForCarSource(
        userId,
        companyId,
        supplierId,
        spuId,
        quotationPrice
      )
    }
  }

  /**
   * 查找某个公司某个供应商某个 spuId 某个报价下的联系人列表
   *
   * @deprecated 2.0.0
   * @param {string} userId
   * @param {number} companyId
   * @param {number} supplierId
   * @param {number} spuId
   * @param {number} quotationPrice
   * @returns {Promise<Array<Supplier>>}
   * @memberof SAASService
   *
   */
  retrieveContactsForCarSource(
    userId: string,
    companyId: number,
    supplierId: number,
    spuId: number,
    quotationPrice: number
  ): Promise<Array<{
    companyId: number | null,
    companyName: string | null,
    supplierModels: Array<{
      supplierId: number,
      supplierName: string,
      supplierPhone: string,
      callCount: number
    }>
  }>> {
    const price = quotationPrice
    return this.request(
      'sale/quotation/callRecord',
      'GET',
      {
        userId,
        companyId,
        supplierId,
        spuId,
        price
      }
    )
  }

  /**
   *
   * 查找某个公司下的供应商联系人列表
   *
   * @description 2.0.0 接口返回字段增加了联系次数
   * @param {number} companyId
   * @returns {Promise<Array<Supplier>>}
   * @memberof SAASService
   */
  getAllContactsByCompany(
    companyId: number
  ): Promise<Array<{
    supplierId: number,
    supplierName: string,
    supplierPhone: string,
    callCount: number
  }>> {
    const cid = companyId
    return this.request(
      'supply/company/call',
      'GET',
      {
        cid
      }
    )
  }

  /**
   * 通过车辆行情商品来获取上架过相同商品的供应商联络方式
   *
   * @description 2.0.0 新增
   * @param {number} carSourceItemId
   * @returns {Promise<Array<Supplier>>}
   * @memberof SAASService
   */
  retrieveContactsByCarSourceItem(
    carSourceItemId: number
  ): Promise<Array<ContactRecord>> {
    const itemId = carSourceItemId
    return this.request(
      `car/item/${itemId}/suppliers`,
      `GET`
    )
  }

  /**
   * 获取对一个 spu 报价为 quotationPrice 的所有公司列表
   *
   * @param {number} spuId
   * @param {number} quotationPrice
   * @returns {Promise<Array<{
   *     companyId: number,
   *     companyName: string,
   *     mesNum: number,
   *     price: number,
   *     principalPhone: string,
   *     sourceId: string,
   *     spuId: string,
   *     wechatCount: number
   *   }>>}
   * @memberof SAASService
   */
  getCompanies(
    spuId: number,
    quotationPrice: number
  ): Promise<Array<{
    companyId: number,
    companyName: string,
    mesNum: number,
    price: number,
    principalPhone: string,
    sourceId: string,
    spuId: string,
    wechatCount: number
  }>> {
    return this.request(
      'sale/quotation/getCompanyList',
      'GET',
      {
        spuId: spuId,
        price: quotationPrice || ''
      }
    )
  }

  /**
   * 获取历史浏览记录.
   * @param opts
   */
  getCheckHistory(
    quotationId: number
  ): Promise<any> {
    return this.request(
      'api/user/getViewRecord',
      'GET', {
        quotationId
      }
    )
  }

  /**
   * 修改订单有效时长.
   * @param opts
   */
  postValidTime(
    quotationId: number,
    times: number
  ): Promise<any> {
    return this.request(
      'sale/quotation/modifyValidTime',
      'POST', {
        quotationId,
        times
      }
    )
  }

  /**
   * 获取砍价记录.
   * @param opts
   */
  getBargainData(
    targetId: number,
    salePersonId: number,
    status: 'used' | 'running',
    isStoreLead: boolean
  ): Promise<any> {
    return this.request(
      'sale/quotation/cutPriceActivities',
      'GET', {
        targetId,
        salePersonId,
        status,
        isStoreLead
      }
    )
  }

  /**
   * 结束砍价活动.
   * @param opts
   */
  finishActivity(
    activityId: number,
    targetId: number
  ): Promise<any> {
    return this.request(
      'sale/quotation/finishActivity',
      'POST', {
        activityId,
        targetId
      }
    )
  }

  /**
   * 核销优惠券.
   * @param opts
   */
  cancelCoupon(
    couponCode: string
  ): Promise<any> {
    return this.request(
      'sale/quotation/exchangeCoupon',
      'POST', {
        couponCode
      }
    )
  }

  /**
   * 获取潜客列表.
   * @param opts
   */
  getPotentialData(
    targetId: number
  ): Promise<any> {
    return this.request(
      'sale/quotation/cutPriceLeads',
      'GET', {
        targetId
      }
    )
  }

  /**
   * 获取砍价二维码.
   * @param opts
   */
  getBargainQRcode(
    quotationId: string,
    targetId: string,
    width: number,
    height: number
  ): Promise<any> {
    return this.request(
      'sale/quotation/makeQRCode',
      'GET', {
        quotationId,
        targetId,
        width,
        height
      }
    )
  }

  /**
   * 获取报价记录详情列表
   * @param opts
   */
  getQuoteDateilList(
    snsId: string,
    mobile: string
  ): Promise<any> {
    return this.request(
      'sale/quotation/getQuotationByPhone',
      'GET', {
        snsId,
        mobile
      }
    )
  }

  // 1.12.0 需求接口

  /**
   * 供应商模糊查找接口
   *
   * @param {string} searchText
   * @param {(number | null)} [resultMaxCount=null]
   * @returns {Promise<Array<Company>>}
   * @memberof SAASService
   */
  retrieveFuzzySupplierSearchResult(
    searchText: string,
    resultMaxCount: number | null = null
  ): Promise<Array<Company>> {
    const
      text = searchText,
      n = resultMaxCount
    return this.request(
      'supply/company/index',
      'GET', {
        text,
        n
      }
    )
  }

  /**
   * 供应商搜索结果接口
   * 分页
   *
   * @param {string} searchText
   * @param {(number | null)} [resultMaxCount=null]
   * @param {number} pageIndex
   * @param {number} pageSize
   * @returns {Promise<Pagination<Company>>}
   * @memberof SAASService
   */
  retrieveSupplierSearchResult(
    searchText: string,
    resultMaxCount: number | null = null,
    pageIndex: number | null = 1,
    pageSize: number | null = 10
  ): Promise<Pagination<Company>> {
    const
      text = searchText,
      n = resultMaxCount
    return this.request(
      'supply/company/search',
      'GET', {
        text,
        n,
        pageIndex,
        pageSize
      }
    )
  }

  /**
   * 推荐公司接口
   *
   * @description 2.0.0 接口更新, 增加 mainBrand(主营品牌) 和 mainSeries(主营车系) 两个字段, 接口名称由"白名单接口"改为"推荐公司接口"
   * @returns {Promise<Array<Company>>}
   * @memberof SAASService
   */
  getAllRecommendedCompanies(): Promise<Array<Company>> {
    return this.request(
      'supply/company/commend',
      'GET'
    )
  }

  /**
   * 获取评论接口
   *
   * @param {number} companyId
   * @param {string} tagLabel
   * @param {number} pageIndex
   * @param {number} pageSize
   * @returns {Promise<Pagination<UserComment>>}
   * @memberof SAASService
   */
  retrieveUserComments(
    companyId: number,
    tagLabel: string | null = null,
    pageIndex: number | null = 1,
    pageSize: number | null = 10
  ): Promise<Pagination<UserComment>> {
    const
      cid = companyId,
      label = tagLabel
    return this.request(
      'supply/company/comment/list',
      'GET', {
        cid,
        label,
        pageIndex,
        pageSize
      }
    )
  }

  /**
   * 为某一个公司创建一个带标签的评论
   *
   * @param {number} companyId
   * @param {string} userId
   * @param {string} content
   * @param {string} phone
   * @param {Array<string>} tags
   * @returns {Promise<UserComment>}
   * @memberof SAASService
   */
  createUserCommentsWithTagLabel(
    companyId: number,
    userId: string,
    content: string,
    phone: string,
    tags: Array<string>
  ): Promise<UserComment> {
    const
      cid = companyId
    return this.request(
      'supply/company/comment',
      'POST',
      {
        cid,
        tags,
        userId,
        content,
        phone,
      }
    )
  }

  /**
   * 获取筛选标签
   *
   * @returns {Promise<Array<Filter>>}
   * @memberof SAASService
   */
  retrieveFiltersOfCompanyUserComments(): Promise<Array<Filter>> {
    return this.request(
      'supply/company/comment/filter',
      'GET'
    )
  }

  /**
   * 根据供应商 id 查询供应商公司信息
   *
   * @param {number} companyId
   * @returns {Promise<Company>}
   * @memberof SAASService
   */
  retrieveSupplyCompany(companyId: number): Promise<Company> {
    return this.request(
      `supply/company/${companyId}`,
      'GET'
    )
  }

  /**
   * 获取基于行情的通话记录, 结果依据车型分区
   *
   * @description 2.0.0 接口地址更换
   * @param {string} userId
   * @returns {Promise<Array<{
   *     spuSummary: CarModel,
   *     callRecordList: Array<{ lastCallDate: string, carSource: CarSource }>
   *   }>>}
   * @memberof SAASService
   */
  retrieveContactRecordWithCarSourceByCarModel(
    userId: string,
  ): Promise<Array<{
    callDateStr: string,
    callRecordBySpu: Array<{ spuSummary: CarModel, callRecordList: Array<{ lastCallDate: string, carSource: CarSource }> }>
  }>> {
    return this.request(
      `api/user/${userId}/sourceMemo`,
      `GET`
    )
  }

  /**
   * 给商品写入标签
   *
   * @description 2.0.0 新增
   * @param {number} carSourceId 车辆行情的商品 id
   * @param {string} content  备注内容
   * @param {string} price  页面填入的价格(元)
   * @param {string} userId 用户 id
   * @param {Array<CompanyTag>}
   * @param {string} phone
   * @returns {Promise<any>}
   * @memberof SAASService
   */
  settingCompanyTags(
    carSourceId: number,
    content: string,
    price: string,
    userId: string,
    tags: Array<CompanyTag>,
    userPhone: string
  ): Promise<any> {
    const itemId = carSourceId
    return this.request(
      `api/user/item/addComment`,
      'POST',
      {
        itemId,
        content,
        price,
        userId,
        tags,
        userPhone
      }
    )
  }

  /**
   * 获得商品所有标签
   *
   * @description 2.0.0 新增
   * @param {string} userId 用户 id
   * @param {string} carSourceId  车辆行情的商品 id
   * @returns {Promise<CompanyRemark>}
   * @memberof SAASService
   */
  getQueryCompanyRemark(
    userId: string,
    carSourceId: number
  ): Promise<CompanyRemark> {
    const itemId = carSourceId
    return this.request(
      `api/user/item/comment`,
      'GET',
      {
        userId,
        itemId
      }
    )
  }

  /**
   * 获取车源信息中更多标签，备注
   *
   * @description 2.0.0 新增
   * @param {number} carSourceId 车辆行情的商品 id
   * @param {number} pageIndex
   * @param {number} pageSize
   * @returns {Promise<CarSourceComment>}
   * @memberof SAASService
   */
  getCarSourceMore(
    carSourceId: number,
    pageIndex: number,
    pageSize: number
  ): Promise<CarSourceComment> {
    const itemId = carSourceId
    return this.request(
      `supply/car/${itemId}/comment`,
      'GET',
      {
        pageIndex,
        pageSize
      }
    )
  }
}
