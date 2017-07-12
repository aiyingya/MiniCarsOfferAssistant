
// @flow
/**
 *
 *
 * Created by David on 28/03/2017.
 */

import Service from './base.service'

import UserService from './user.service'
import util from '../utils/util'

export default class SAASService extends Service {

  userService: UserService

  urls = {
    dev: 'https://test.yaomaiche.com/ymcdev/',
    gqc: 'https://test.yaomaiche.com/ymcgqc/',
    prd: 'https://ymcapi.yaomaiche.com/ymc/'
  }

  constructor() {
    super()
  }

  setup() {
    super.setup()
    const app = getApp()
    this.userService = app.userService
  }

  /**
   *
   *
   * @param {*} opts
   * @returns {Promise<any>}
   * @memberof SAASService
   */
  sendMessageByPromise(opts: any): Promise<any> {
    return super.sendMessageByPromise(opts)
  }

  /**
   * 该方法已经废弃，请勿在使用该方法
   *
   * @param {*} opts
   * @param {('none'|'toast'|'navigation')} [loadingType='toast']
   * @memberof SAASService
   */
  sendMessage(opts: any, loadingType: 'none'|'toast'|'navigation' = 'toast') {
    opts.loadingType = loadingType
    super.sendMessage(opts)
  }

  /**
   * 发布已经生成的报价单
   *
   * @param {number} draftId
   * @param {string} customerMobile
   * @param {string} customerName
   * @param {number} customerSex
   * @param {boolean} [isSendMessage=true]
   * @param {number} effectiveness
   * @memberof SAASService
   */
  requestPublishQuotation(draftId: number, customerMobile: string, customerName: string, customerSex: number, isSendMessage: boolean = true, effectiveness: number): Promise<any> {
    return this.sendMessageByPromise({
      path: 'sale/quotation',
      data: {draftId, customerMobile, customerName, customerSex, isSendMessage, effectiveness},
      method: 'POST'
    })
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
   * @param {Number} quotationDraft.metallicPaintAmount 金属漆加价
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
            sellingPrice: quotationDraft.quotationItems[0].sellingPrice
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
          carPrice : quotationDraft.quotationItems[0].sellingPrice,
          purchaseTax:quotationDraft.requiredExpensesAll.purchaseTax,
          carTax:quotationDraft.requiredExpensesAll.vehicleAndVesselTax,
          carNumFee:quotationDraft.requiredExpensesAll.licenseFee,
          metallicPaintAmount:quotationDraft.requiredExpensesAll.metallicPaintAmount,
          boutiqueFee:quotationDraft.otherExpensesAll.boutiqueCost,
          serviceFee:quotationDraft.otherExpensesAll.serverFee,
          installFee:quotationDraft.otherExpensesAll.installationFee,
          otherFee:quotationDraft.otherExpensesAll.otherFee
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
          carPrice : quotationDraft.quotationItems[0].sellingPrice,
          purchaseTax:quotationDraft.requiredExpensesAll.purchaseTax,
          carTax:quotationDraft.requiredExpensesAll.vehicleAndVesselTax,
          carNumFee:quotationDraft.requiredExpensesAll.licenseFee,
          metallicPaintAmount:quotationDraft.requiredExpensesAll.metallicPaintAmount,
          boutiqueFee:quotationDraft.otherExpensesAll.boutiqueCost,
          serviceFee:quotationDraft.otherExpensesAll.serverFee,
          installFee:quotationDraft.otherExpensesAll.installationFee,
          otherFee:quotationDraft.otherExpensesAll.otherFee
        }
      }

      let snsId
      if (this.userService.isLogin) {
        snsId = this.userService.auth.userId
      } else {
        snsId = this.userService.snsId
      }
      const data_part_2: any = {
        loanFee: quotationDraft.loanFee,
        saleMobile: quotationDraft.saleMobile,
        rateType: quotationDraft.rateType,
        marketPrice: quotationDraft.quotationItems[0].originalPrice,
        insuranceDetail: quotationDraft.insuranceDetail,
        carCapacity: quotationDraft.carCapacity,//排量
        electricCar: quotationDraft.electricCar,//是否纯电动
        snsId: snsId,
        loginChannel: this.userService.loginChannel
      }

      const data = Object.assign({}, data_part_1, data_part_2)

      return this.sendMessageByPromise({
        path: 'sale/quotation/draft',
        data: data,
        method: 'POST'
      })
  }

  /**
   * 发起订车行为
   *
   * @param skuIds          [String]
   * @param quotationId     可选
   * @param customerMobile  可选
   * @param object
   */
  requestBookCar(itemName: string, spec: string, itemPrice: number, itemCount: number, object: any) {
    this.sendMessage({
      path: 'sale/quotation/order',
      data: {
        userId: this.userService.auth.userId,
        itemName: itemName,
        spec: spec,
        itemPrice: itemPrice,
        itemCount: itemCount
      },
      method: 'POST',
      success: function (res) {
        object.success()
      },
      fail: function (err) {
        object.fail(err)
      },
      complete: function () {
        object.complete()
      }
    })
  }

  /**
   * 获取报价列表
   *
   * @param pageIndex 页面索引号
   * @param pageSize  页面大小
   */
  requestQuotationsList(pageIndex: number, pageSize: number, object: any) {
    if (pageIndex > 0 && pageSize > 0) {
      let snsId
      if (this.userService.isLogin) {
        snsId = this.userService.auth.userId
      } else {
        snsId = this.userService.snsId
      }

      this.sendMessage({
        path: 'sale/quotation/new',
        data: {
          channel: this.userService.loginChannel,
          snsId: snsId,
          pageIndex: pageIndex,
          pageSize: pageSize
        },
        method: 'GET',
        success: function(res){

          for(let item of res.content) {
            item.checkTime = util.getTimeDifferenceString(item.viewTime)
            item.checkMoreNumber = 2

            if(item.quotationList.length > 0) {
              for(let qitem of item.quotationList) {
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
                  itemName: `【${qitem.quotationItems[0].guidePrice/100}】${qitem.quotationItems[0].itemName}`,
                  priceChange: {
                    flag: downPriceFlag,
                    price: downPriceString
                  }
                }
              }
            }
          }
          console.log(res.content)
          object.success(res);
        },
        fail: function() {
          object.fail();
        },
        complete: function() {
          object.complete();
        }
      }, object.loadingType)
    } else {
      object.fail();
      object.complete();
    }
  }

  /**
   * 删除报价记录
   *
   * @param id 报价单ID
   * @param opts
   */
  requestDeleteRecotd(id: number, opts: any) {
    this.sendMessage({
      path: `sale/quotation/delete/${id}`,
      data: opts.data,
      method: 'POST',
      success: opts.success,
      fail: opts.fail,
      complete: opts.complete
    }, opts.loadingType)
  }
  /**
   * 获取车源列表
   * @param carModelId
   * @param object
   */
  requestCarSourcesList(carModelId: number, object: any) {
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

    this.sendMessage({
      path: `product/car/spu/${carModelId}/sources`,
      method: 'GET',
      data: data,
      success: object.success,
      fail:object.fail,
      complete:object.complete
    })
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
  requestAddOrRemoveTagnameForASupplier (spuId: number, carSourceId: number, tagName: string, supplierId: number, addOrRemove: boolean, object: any) {
    if (spuId && carSourceId  && tagName && supplierId) {
      const method = addOrRemove ? 'POST' : 'DELETE'
      this.sendMessage({
        path: `product/car/spu/${spuId}/source/${carSourceId}/tag`,
        data: {
          tagName: tagName,
          userId: this.userService.auth.userId,
          supplierId: supplierId
        },
        loadingType: 'none',
        method: method,
        success: object.success,
        fail: object.fail,
        complete: object.complete
      }, 'none')
    } else {
      object.fail()
      object.complete()
    }
  }

  /**
   * 获取三方车源信息的原文
   *
   * @param {number} carSourceId
   * @param {{}} object
   * @memberof SAASService
   */
  requestCarSourceContent (carSourceId: number, object: any) {
    this.sendMessage({
      path: `product/car/source/${carSourceId}/content`,
      loadingType: 'none',
      method: 'GET',
      success: object.success,
      fail: object.fail,
      complete: object.complete
    }, 'none')
  }

  /**
   * 搜索结果
   *
   * @param {string} text
   * @param {number} pageIndex
   * @param {number} pageSize
   * @param {{}} object
   * @memberof SAASService
   */
  requestSearchCarSpu (text: string, pageIndex: number, pageSize: number, object: any) {
    this.sendMessage({
      path: `search/car/spu`,
      loadingType: 'none',
      method: 'GET',
      data: {
        text: text,
        pageIndex: pageIndex,
        pageSize: pageSize
      },
      success: object.success,
      fail: object.fail,
      complete: object.complete
    })
  }

  /**
   *
   *
   * @param {number} spuId
   * @param {{}} data
   * @param {{}} object
   * @memberof SAASService
   */
  requestSearchSpuBySpuId (spuId: number, data: any, object: any) {
    this.sendMessage({
      path: `supply/car/spu/${spuId}`,
      method: 'GET',
      data: data || {},
      success: object.success,
      fail: object.fail,
      complete: object.complete
    })
  }

  /**
   *
   *
   * @param {number} carSeriesId
   * @param {boolean} inStock
   * @param {{}} object
   * @memberof SAASService
   */
  requestSearchSpuByCarSeriesId (carSeriesId: number, inStock: boolean, object: any) {
    this.sendMessage({
      path: `supply/car/spu`,
      method: 'GET',
      data: {
        carSeriesId: carSeriesId,
        inStock: inStock
      },
      success: object.success,
      fail: object.fail,
      complete: object.complete
    })
  }

  /**
   *  获取车款列表(包含搜索)
   *
   * @param {number} sid
   * @param {any} data
   * @param {('CAR_SPU'|string)} type
   * @param {boolean} inStock
   * @param {{}} object
   * @memberof SAASService
   */
  requireCarSpu(sid: number, data: any, type: 'CAR_SPU'|'CAR_SERIES', inStock: boolean, object: any) {
    let path = type === 'CAR_SPU' ? `supply/car/spu/${sid}` : 'supply/car/spu/'
    let resdata = {
      carSeriesId: sid,
      inStock: inStock
    }
    data = type === 'CAR_SPU' ? data : resdata
    this.sendMessage({
      path: path,
      method: 'GET',
      data: resdata,
      success: object.success,
      fail: object.fail,
      complete: object.complete
    })
  }

  /**
   * 车源上报
   *
   * @param {number} userId
   * @param {string} userPhone
   * @param {number} supplierId
   * @param {string} supplierPhone
   * @param {number} messageResultId
   * @param {string} contactPhone
   * @returns {Promise<any>}
   * @memberof SAASService
   */
  pushCallRecord(userId: number, userPhone: string, supplierId: number, supplierPhone: string, messageResultId: number, contactPhone: string): Promise<any> {
    return this.sendMessageByPromise({
      path: "api/user/addCallRecord",
      method: 'POST',
      data: {
        userId,
        userPhone,
        supplierId,
        supplierPhone,
        messageResultId,
        contactPhone
      }
    })
  }

  /**
   * 获取创建报价单的信息
   *
   * @param {Object} opts
   * @param {Number} opts.carPrice
   * @returns
   * @memberof SAASService
   */
  getCreatCarRecordInfo(opts: any){
    const userId = this.userService.auth.userId
    return this.sendMessageByPromise({
      path: 'sale/quotation/initQuotation',
      data: Object.assign({ userId }, opts),
      method: 'GET',
      success: opts.success,
      fail: opts.fail
    })
  }

  /**
   * 查询报价偏好设置.
   * @param opts
   */
  gettingPreference(opts: any) {
    let userId = this.userService.auth.userId
    return this.sendMessageByPromise({
      path:`api/config/getQuotaSet/${userId}`,
      method: 'GET',
      data: {}
    })
  }

  /**
   * 报价偏好设置.
   * @param opts
   */
  settingPreference(opts: any) {
    let userId = this.userService.auth.userId
    opts.data.userId = userId
    this.sendMessage({
      path: "api/config/saveQuota",
      method: 'POST',
      data: opts.data || {},
      success: opts.success,
      fail: opts.fail
    })
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
    return this.sendMessageByPromise({
      path: 'sale/quotation/queryProfit',
      method: 'GET',
      data: {
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
    })
  }

  /**
   * 获取保险信息.
   * @param opts
   */
  gettingInsurance() {
    let userId = this.userService.auth.userId
    return this.sendMessageByPromise({
      path: `api/config/getInsurance/${userId}`,
      method: 'GET'
    })
  }

  /**
   * 获取保险信息.
   * @param data.capacity 排量
   * @param data.place 门店所在省
   */
  gettingVehicleAndVesselTax(opts: any) {
    return this.sendMessageByPromise({
      path: `sale/quotation/getCarTax?capacity=${opts.data.capacity}&place=${opts.data.place}`,
      method: 'GET'
    })
  }

  /**
   * 行情走势.
   * @param opts
   */
  gettingMarketTrend(opts:any) {
    return this.sendMessageByPromise({
      path: `sale/quotation/getPriceTrend?spuId=${opts.spuId}`,
      method: 'GET'
    })
  }

  /**
   * 获得的当前 spu 的当前众数 top n
   *
   * @param {number} spuId
   * @returns {Promise<any>}
   * @memberof SAASService
   */
  getTopNOfCurrentMode(spuId: number): Promise<any> {
    return this.sendMessageByPromise({
      path: `sale/quotation/getCurrentPrice`,
      data: {
        spuId: spuId
      },
      method: 'GET'
    })
  }

  /**
   * 获取某一个公司内部对一个 spu 报价为 quotationPrice 的所有联系方式
   *
   * @param {number} spuId
   * @param {number} quotationPrice
   * @param {number} companyId
   * @param {number} supplierId
   * @returns {Promise<any>}
   * @memberof SAASService
   */
  getContacts(spuId: number, quotationPrice: number, companyId: number, supplierId: number): Promise<any> {
    return this.sendMessageByPromise({
      path: `sale/quotation/callRecord`,
      data: {
        userId: this.userService.auth.userId,
        spuId: spuId,
        companyId: companyId || '',
        supplierId: supplierId || '',
        price: quotationPrice || ''
      },
      method: 'GET'
    })
  }

  /**
   * 获取对一个 spu 报价为 quotationPrice 的所有公司列表
   *
   * response [Model]
   *
   * companyId
   * companyName
   * price
   * spuId
   * spuName
   * sourceId
   * mesNum
   * principalPhone
   * wechatCount
   *
   * @param {number} spuId
   * @param {number} quotationPrice
   * @returns {Promise<any>}
   * @memberof SAASService
   */
  getCompanies(spuId: number, quotationPrice: number): Promise<any> {
    return this.sendMessageByPromise({
      path: `sale/quotation/getCompanyList`,
      data: {
        spuId: spuId,
        price: quotationPrice || ''
      },
      method: 'GET'
    })
  }

  /**
   * 获取历史浏览记录.
   * @param opts
   */
  getCheckHistory(opts: any): Promise<any> {
    return this.sendMessageByPromise({
      path: 'api/user/getViewRecord',
      method: 'GET',
      data: opts.data || {}
    })
  }

  /**
   * 修改订单有效时长.
   * @param opts
   */
  postValidTime(opts: any): Promise<any> {
    return this.sendMessageByPromise({
      path: 'sale/quotation/modifyValidTime',
      method: 'POST',
      data: opts.data || {}
    })
  }
}
