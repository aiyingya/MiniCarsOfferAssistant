// @flow
import $wuxCarSourceDetailDialog from '../../components/dialog/carSourceDetail/carSourceDetail'
import {
  container, system, util
} from '../../landrover/business/index'

import {
  $wuxToast,
  $wuxTrack
} from "../../components/wux"

import * as wxapi from 'fmt-wxapp-promise'
import SAASService from '../../services/saas.service'
import UserService from '../../services/user.service'
import CarSourceManager from '../../components/carSource/carSource.manager'
import utils from '../../utils/util'

const saasService: SAASService = container.saasService
const userService: UserService = container.userService
let selectedDateSection: {
  callDateStr: string,
  callRecordBySpu: Array<{ spuSummary: CarModel, callRecordList: Array<{ lastCallDate: string, carSource: CarSource }> }>
} | null = null
let carSourceManger: CarSourceManager | null = null

Page({
  data: {

    // 时间分区
    selectedIndex: -1,

    records: null
  },
  onLoad(options) {

    wxapi.showToast({ title: '加载中...', icon: 'loading', mask: true })
      .then(() => {
        return this.records()
          .then((res) => {
            this.setData({
              records: res
            })
          })
      })
      .then(() => { wxapi.hideToast() })
      .catch(() => { wxapi.hideToast() })

  },
  onShow() { },
  onHide() { },
  records() {
    if (userService.auth != null) {
      const userId = userService.auth.userId
      return saasService.retrieveContactRecordWithCarSourceByCarModel(userId)
        .then(res => {
          return res
        })
    } else {
      return Promise.resolve(null)
    }
  },
  onSectionClick(e) {
    const index = e.currentTarget.dataset.index
    const subIndex = e.currentTarget.dataset.subIndex
    if (this.data.selectedIndex === subIndex) {
      selectedDateSection = null
      carSourceManger = null
      this.setData({ selectedIndex: -1 })
    } else {
      selectedDateSection = this.data.records[index]
      const spuItem = selectedDateSection.callRecordBySpu[subIndex]

      // 构建车源管理器
      const carModelsInfo = spuItem.spuSummary
      const isShowDownPrice = !(carModelsInfo.carModelName.includes('宝马') || carModelsInfo.carModelName.includes('奥迪') || carModelsInfo.carModelName.toLowerCase().includes('mini'))
      const quotedMethod: QuotedMethod = isShowDownPrice ? 'PRICE' : 'POINTS'
      carSourceManger = new CarSourceManager(carModelsInfo.officialPrice, quotedMethod)

      for (let callRecord of spuItem.callRecordList) {
        carSourceManger.processCarSourceItem(callRecord.carSource)
      }

      this.setData({
        selectedIndex: subIndex,
        [`records[${index}].callRecordBySpu[${subIndex}]`]: spuItem
      })
    }
  },
  handlerCarSourceMore(e) { },
  handlerCarSourceDetail(e) {
    const selectedIndex = this.data.selectedIndex
    const spuItemIndex = e.currentTarget.dataset.skuIndex
    const carSourceItemIndex = e.currentTarget.dataset.carSourceIndex
    // const carSourcePlaceItem = e.currentTarget.dataset.carSourcePlace

    if (selectedDateSection === null) {
      console.error('没有选中')
      return
    }

    const spuItem = selectedDateSection.callRecordBySpu[spuItemIndex]
    const carModelsInfo = spuItem.spuSummary
    const carSourceItem = spuItem.callRecordList[carSourceItemIndex].carSource
    const contact = carSourceItem.supplier.contact

    /// 判断有没有需要设置的 car source place， 没有则使用默认设置好的
    // if (carSourcePlaceItem) {
    // this.selectCarSourcePlace(carSourcePlaceItem, carSourceItem)
    // this.updateTheCarSource(spuItemIndex, carSourceItemIndex, carSourceItem)
    // }

    /**
     * 1.4.0 埋点
     * 用户选择行情
     * davidfu
     */
    this.data.pageParameters = {
      productId: spuItem.carModelId,
      color: carSourceItem.externalColorName,
      parameters: {
        carSourceId: carSourceItem.id
      }
    }
    const event = {
      eventAction: 'click',
      eventLabel: `车源详情`
    }
    $wuxTrack.push(event)

    $wuxCarSourceDetailDialog.sourceDetail({
      carModel: carModelsInfo,
      carSourceItem: carSourceItem,
      bookCar: (updateCarSourceItem) => {
        this.actionBookCar(spuItem, null, updateCarSourceItem)
      },
      contact: () => {
        this.actionContactWithCarSourceItem(carModelsInfo.carModelId, spuItemIndex, carSourceItemIndex, carSourceItem, 'sourceDetail')
      },
      handlerCreateQuoted: (e) => {
        const carSku = {
          externalColorName: carSourceItem.externalColor,
          internalColorName: carSourceItem.internalColor,
          showPrice: carSourceItem.viewModelSelectedCarSourcePlace.viewModelQuoted.price
        }
        const carModelsInfoKeyValueString = utils.urlEncodeValueForKey('carModelsInfo', carModelsInfo)
        const carSkuInfoKeyValueString = utils.urlEncodeValueForKey('carSkuInfo', carSku)
        wx.navigateTo({
          url: '/pages/quote/quotationCreate/quotationCreate?' + carModelsInfoKeyValueString + '&' + carSkuInfoKeyValueString
        })
      },
      close: () => {
        if (selectedIndex != -1) {
          this.setData({
            [`records[${selectedIndex}].callRecordBySpu[${spuItemIndex}].callRecordList[${carSourceItemIndex}].carSource`]: carSourceItem
          })
        }
      },
      reportError: (e) => {
        console.log('report error')
      }
    })
  },
  handlerCarSourceTabClick(e) { },
  handlerContact(e) {
    const spuItemIndex = e.currentTarget.dataset.skuIndex
    const carSourceItemIndex = e.currentTarget.dataset.carSourceIndex

    if (selectedDateSection === null) {
      console.error('没有选中')
      return
    }

    const spuItem = selectedDateSection.callRecordBySpu[spuItemIndex]
    const carSourceItem = spuItem.callRecordList[carSourceItemIndex].carSource

    this.actionContactWithCarSourceItem(spuItem.spuSummary.carModelId, spuItemIndex, carSourceItemIndex, carSourceItem, null)
  },
  actionContactWithCarSourceItem(spuId, spuItemIndex, carSourceItemIndex, carSourceItem, from) {

    this.actionContact(spuId,
      carSourceItem.viewModelSelectedCarSourcePlace.viewModelQuoted.price,
      carSourceItem.supplier.companyId,
      carSourceItem.supplier.companyName,
      carSourceItem.supplier.id,
      from,
      (supplier) => {
        if (selectedDateSection === null) {
          console.error('没有选中')
          return
        }

        /**
         * 上报
         */
        const
          supplierId = supplier.supplierId,
          supplierPhone = supplier.supplierPhone,
          messageResultId = carSourceItem.id,
          contactPhone = carSourceItem.contact || supplier.supplierPhone,
          spuItem = selectedDateSection.callRecordBySpu[spuItemIndex]

        container.saasService.pushCallRecord(supplierId, supplierPhone, messageResultId, contactPhone)

        /**
         * 1.4.0 埋点 拨打供货方电话
         * davidfu
         */
        this.data.pageParameters = {
          productId: spuId,
          color: carSourceItem.externalColorName,
          parameters: {
            carSourceId: carSourceItem.id,
            supplierId: carSourceItem.supplier.id
          }
        }
        const event = {
          eventAction: 'click',
          eventLabel: '拨打供货方电话'
        }
        $wuxTrack.push(event)
      })
  },
  /**
   * 包装的联系人接口
   *
   * @param {Number} spuId
   * @param {Number} quotationPrice
   * @param {Number} companyId
   * @param {String} companyName
   * @param {Number} supplierId
   * @param {String} from
   * @param {Function} completeHandler
   */
  actionContact(spuId, quotationPrice, companyId, companyName, supplierId, from, completeHandler) {
    $wuxCarSourceDetailDialog.contactList({
      spuId: spuId,
      quotationPrice: quotationPrice,
      companyId: companyId,
      companyName: companyName,
      supplierId: supplierId,
      from: from,
      contact: (makePhonePromise, supplier) => {
        makePhonePromise
          .then(res => {
            console.log('拨打电话' + supplier.supplierPhone + '成功')
            typeof completeHandler === 'function' && completeHandler(supplier)
          })
          .catch(err => {
            console.error(err, '拨打电话' + supplier.supplierPhone + '失败')
          })
      }
    });
  }

})
