/**
 * Created by David on 28/03/2017.
 */

import Service from './base.service'

import util from '../utils/util'

export default class SAASService extends Service {


  urls = {
    dev: 'https://test.yaomaiche.com/ymcdev/',
    gqc: 'https://test.yaomaiche.com/ymcgqc/',
    prd: 'https://ymcapi.yaomaiche.com/ymc/'
  }



  constructor(userService) {
    super()
    this.userService = userService;

  }

  sendMessageByPromise(opts) {
    return super.sendMessageByPromise(opts)
  }

  sendMessage(opts, loadingType = 'toast') {
    opts.loadingType = loadingType
    super.sendMessage(opts)
  }


  sendMessagePromise(opts) {
    super.sendMessagePromise(opts)
  }

  /**
   * 发布当前报价草稿到某个用户
   *
   * @param {String} draftId         草稿 id
   * @param {String} customerMobile  客户手机号
   * @param {String} customerName    客户名字
   * @param {Number} customerSex     客户性别
   * @param {Boolean} isSendMessage   是否从后台发送短信
   * @param {Number} effectiveness   时效性
   * @param {Object} object          回调对象
   * @memberof SAASService
   */
  requestPublishQuotation (draftId, customerMobile, customerName, customerSex, isSendMessage, effectiveness, object) {
    if (draftId && draftId !== '') {
      this.sendMessage({
        path: 'sale/quotation',
        data: {
          draftId: draftId,
          customerMobile: customerMobile,
          customerName: customerName,
          customerSex: customerSex,
          sendMessage: isSendMessage ? true : (isSendMessage === undefined) ? true :false, //防止后端没有判断，兼容以前的调用
          validTime: effectiveness
        },
        method: 'POST',
        // header: {}, // 设置请求的 header
        success: function (res) {
          object.success(res);
        },
        fail: function () {
          object.fail();
        },
        complete: function () {
          object.complete();
        }
      })
    } else {
      object.fail();
      object.complete();
    }
  }

  /**
   * 生成报价草稿
   *
   * @param quotationDraft 编辑的报价草稿数据
   * @param object          回调对象
   *
   {
   "quotationName":"报价单名称，没有可以不传",
   "quotationItems":[
      {
        sellingPrice: ''
      }
   ],
   "hasLoan":"必传，true/false，boolean，是否贷款",
   "paymentRatio":"首付比例（%），decimal，全款时不传，取值范围0~100",
   "stages":"贷款期数，int，全款时不传",
   "requiredExpenses":"必需费用（元），deciaml，取值范围0~999999999",
   "otherExpenses":"其他费用（元），deciaml，取值范围0~999999999",
   "advancePayment":"必传，首次支付金额，如果全款则为全款金额",
   "monthlyPayment":"月供金额，每月还款金额，全款时不传",
   "remark":"备注"
   }
   */
  requestSaveQuotationDraft(quotationDraft, object) {
    if (quotationDraft && typeof quotationDraft === 'object') {
      // FIXME: 直接将提交对象转换为正常的提交对象
      let data = {}
      if (quotationDraft.hasLoan) {
        data = {
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
          boutiqueFee:quotationDraft.otherExpensesAll.boutiqueCost,
          serviceFee:quotationDraft.otherExpensesAll.serverFee,
          installFee:quotationDraft.otherExpensesAll.installationFee,
          otherFee:quotationDraft.otherExpensesAll.otherFee
        }
      } else {
        data = {
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
          boutiqueFee:quotationDraft.otherExpensesAll.boutiqueCost,
          serviceFee:quotationDraft.otherExpensesAll.serverFee,
          installFee:quotationDraft.otherExpensesAll.installationFee,
          otherFee:quotationDraft.otherExpensesAll.otherFee

        }
      }
      data.loanFee = quotationDraft.loanFee
      data.saleMobile = quotationDraft.saleMobile
      data.rateType = quotationDraft.rateType
      data.marketPrice = quotationDraft.quotationItems[0].originalPrice
      data.insuranceDetail = quotationDraft.insuranceDetail
      data.carCapacity = quotationDraft.carCapacity//排量
      data.electricCar = quotationDraft.electricCar//是否纯电动
      let snsId
      if (this.userService.isLogin) {
        snsId = this.userService.auth.userId
      } else {
        snsId = this.userService.snsId
      }

      data.snsId = snsId
      data.loginChannel = this.userService.loginChannel

      this.sendMessage({
        path: 'sale/quotation/draft',
        data: data,
        method: 'POST',
        success: function (res) {
          object.success(res);
        },
        fail: function (err) {
          object.fail(err);
        },
        complete: function () {
          object.complete();
        }
      })
    } else {
      object.fail({
        alertMessage: '参数验证错误'
      })
      object.complete()
    }
  }

  /**
   * 发起订车行为
   *
   * @param skuIds          [String]
   * @param quotationId     可选
   * @param customerMobile  可选
   * @param object
   */
  requestBookCar(itemName, spec, itemPrice, itemCount, object) {
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
  requestQuotationsList(pageIndex, pageSize, object) {
    if (pageIndex > 0 && pageSize > 0) {
      let snsId
      if (this.userService.isLogin) {
        snsId = this.userService.auth.userId
      } else {
        snsId = this.userService.snsId
      }
      
      this.sendMessage({
        path: 'sale/quotation',
        loadingType: object.loadingType,
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
                qitem.createdTime = util.getTimeDifferenceString(qitem.quotationTime)
                qitem.viewModel = {
                  totalPayment: totalPayment,
                  sellingPrice: sellingPrice,
                  guidePrice: guidePrice,
                  itemName: qitem.quotationItems[0].itemName,
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
      })
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
  requestDeleteRecotd(id,opts) {
    this.sendMessage({
      path: `sale/quotation/delete/${id}`,
      loadingType: opts.loadingType,
      data: opts.data,
      method: 'POST',
      success: opts.success,
      fail: opts.fail,
      complete: opts.complete
    })
  }
  /**
   * 获取车源列表
   * @param carModelId
   * @param object
   */
  requestCarSourcesList(carModelId, object) {
    // MARK： 目前只取地址列表中的第一个

    const data = {
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
   * @param spuId
   * @param carSourceId
   * @param tagName
   * @param supplierId
   * @param addOrRemove
   * @param object
   */
  requestAddOrRemoveTagnameForASupplier (spuId, carSourceId, tagName, supplierId, addOrRemove, object) {
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
   * @param carSourceId
   * @param object
   */
  requestCarSourceContent (carSourceId, object) {
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
   * @param text
   * @param pageIndex
   * @param pageSize
   * @param object
   */
  requestSearchCarSpu (text, pageIndex, pageSize, object) {
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
   */
  requestSearchSpuBySpuId (spuId,data,object) {
    this.sendMessage({
      path: `supply/car/spu/${spuId}`,
      method: 'GET',
      data: data || {},
      success: object.success,
      fail: object.fail,
      complete: object.complete
    })
  }

  requestSearchSpuByCarSeriesId (carSeriesId, inStock, object) {
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
   *  sid 车型ID
   *  type 获取类型
   *  inStock 是否获取有货 默认true
   *  object callback
   */
  requireCarSpu(sid,data,type,inStock,object){
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
   * @param opts
   */
  pushCallRecord(opts){
    this.sendMessage({
      path: "api/user/addCallRecord",
      method: 'POST',
      data: opts.data || {},
      success: opts.success,
      fail: opts.fail
    })
  }

  /**
   * 获取创建报价单的信息
   * @param opts
   */
  getCreatCarRecordInfo(opts){

    this.sendMessage({
      path: `sale/quotation/initQuotation?userId=${opts.data.userId}&carPrice=${opts.data.carPrice}`,
      method: 'GET',
      success: opts.success,
      fail: opts.fail
    })
  }

  /**
   * 查询报价偏好设置.
   * @param opts
   */
  gettingPreference(opts) {
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
  settingPreference(opts) {
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
   * 查询收益
   * @param opts
   * {
    "totalProfit":"总收益",
    "profit":"裸车收益",
    "insuranceProfit": "保险收益",
    "loanProfit": "贷款收益",
    }
   */
  getProfit(data,opts){
    // sale/quotation/queryProfit?userId={用户id}&loanNum={贷款金额}&insuranceNum={保险金额}&carPrice={客户裸车价}&marketPrice={行情价}&boutiqueFee={精品费用}&loanServiceFee={贷款服务费}&installFee={安装费用}&otherFee={其他费用}
    return this.sendMessageByPromise({
      path: 'sale/quotation/queryProfit',
      method: 'GET',
      data:data
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
  gettingVehicleAndVesselTax(opts) {
    return this.sendMessageByPromise({
      path: `sale/quotation/getCarTax?capacity=${opts.data.capacity}&place=${opts.data.place}`,
      method: 'GET'
    })
  }
  /**
   * 行情走势.
   * @param opts
   */
  gettingMarketTrend(opts) {
    return this.sendMessageByPromise({
      path: `sale/quotation/getPriceTrend?spuId=${opts.spuId}`,
      method: 'GET',
      success: opts.success,
      fail: opts.fail
    })
  }
  /**
   * 获得的当前 spu 的当前众数 top n
   *
   * @param {String} spuId
   * @returns {Promise}
   * @memberof SAASService
   */
  getTopNOfCurrentMode(spuId) {
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
   * @param {String} spuId
   * @param {Number} quotationPrice
   * @param {String} companyId
   * @param {String} supplierId
   * @returns Promise
   * @memberof SAASService
   */
  getContacts(spuId, quotationPrice, companyId, supplierId) {
    return this.sendMessageByPromise({
      path: `sale/quotation/callRecord`,
      data: {
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
   * @param {String} spuId
   * @param {Number} quotationPrice
   * @returns Promise
   * @memberof SAASService
   */
  getCompanies(spuId, quotationPrice) {
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
  getCheckHistory(opts) {
    return this.sendMessageByPromise({
      path: 'api/user/getViewRecord',
      method: 'GET',
      data: opts.data || {}
    })
  }
}
