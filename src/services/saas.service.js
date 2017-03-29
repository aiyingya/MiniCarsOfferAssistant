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
    this.userService = userService
  }

  /**
   * 发布当前报价草稿到某个用户
   *
   * @param draftId         草稿id
   * @param customerMobile  客户手机号，选项
   * @param object          回调对象
   *
   {
    "quotationId":"报价单ID",
    "draftId":"报价单草稿ID",
    "quotationName":"报价单名称，没有可以不传",
    "quotationItems":[{
        "itemName":"商品名称",
        "specifications":"商品规格",
        "guidePrice":"指导价",
        "sellingPrice":"售价"
    }
    ],
    "hasLoan":"必传，true/false，boolean，是否贷款",
    "paymentRatio":"首付比例（%），decimal，全款时没有，取值范围0~100",
    "stages":"贷款期数，int，全款时没有",
    "requiredExpenses":"必需费用（元），deciaml，取值范围0~999999999",
    "otherExpenses":"其他费用（元），deciaml，取值范围0~999999999",
    "advancePayment":"首次支付金额，如果全款则为全款金额",
    "monthlyPayment":"月供金额，每月还款金额，全款时没有",
    "remark":"备注",
    "loginChannel":"必传，登录渠道，目前固定为weixin",
    "snsId":"必传，由上报微信用户信息的API返回",
    "customerMobile":"客户手机号"
   }
   */
  requestPublishQuotation (draftId, customerMobile, object) {
    if (draftId && draftId !== '') {
      this.sendMessage({
        path: 'sale/quotation',
        data: {
          draftId: draftId,
          customerMobile: customerMobile
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
          remark: quotationDraft.remark
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
          remark: quotationDraft.remark
        }
      }

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
          let content = res.content
          for (var i = 0; i < content.length; i++) {
            var item = content[i]
            let totalPayment = util.priceStringWithUnit(item.totalPayment);
            let sellingPrice = util.priceStringWithUnit(item.quotationItems[0].sellingPrice);
            let guidePrice = util.priceStringWithUnit(item.quotationItems[0].guidePrice);

            /// 实时计算优惠点数
            let downPrice = util.downPrice(item.quotationItems[0].sellingPrice, item.quotationItems[0].guidePrice)
            let downPriceFlag = util.downPriceFlag(downPrice);
            let downPriceString = ''
            if (downPriceFlag !== 0) {
              downPriceString = util.priceStringWithUnit(downPrice)
            }

            item.viewModel = {
              totalPayment: totalPayment,
              sellingPrice: sellingPrice,
              guidePrice: guidePrice,
              priceChange: {
                flag: downPriceFlag,
                price: downPriceString
              }
            }
            item.priceChange
          }
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
   * 对某一个供应商的某一个货源做靠谱操作
   * @param supplierId
   * @param object
   */
  requestReliable (spuId, carSourceId, supplierId, hasBeenReliableByUser, updatedHasBeenReliableByUser, object) {
    console.log(spuId)
    console.log(carSourceId)
    console.log(supplierId)
    console.log(hasBeenReliableByUser)
    console.log(updatedHasBeenReliableByUser)
    if (hasBeenReliableByUser === updatedHasBeenReliableByUser) {
      // 没变化
    } else {
      if (hasBeenReliableByUser === -1) {
        this.requestUnReliableOrNotASupplier(spuId, carSourceId, supplierId, false, object)
      } else if (hasBeenReliableByUser === 1) {
        this.requestReliableOrNotASupplier(spuId, carSourceId, supplierId, false, object)
      }

      if (updatedHasBeenReliableByUser === -1) {
        this.requestUnReliableOrNotASupplier(spuId, carSourceId, supplierId, true, object)
      } else if (updatedHasBeenReliableByUser === 1) {
        this.requestReliableOrNotASupplier(spuId, carSourceId, supplierId, true, object)
      }
    }
  }
  requestReliableOrNotASupplier (spuId, carSourceId, supplierId, reliableOrNot, object) {
    this.requestAddOrRemoveTagnameForASupplier(spuId, carSourceId, '靠谱', supplierId, reliableOrNot, object);
  }
  requestUnReliableOrNotASupplier (spuId, carSourceId, supplierId, UnReliableOrNot, object) {
    this.requestAddOrRemoveTagnameForASupplier(spuId, carSourceId, '不靠谱', supplierId, UnReliableOrNot, object);
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
      })
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
    })
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
}
