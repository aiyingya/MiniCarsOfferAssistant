// @flow
import $wuxCarSourceDetailDialog from '../../components/dialog/carSourceDetail/carSourceDetail'
import { container } from '../../landrover/business/index'
import $settingRemarkLabelDialog from '../../components/dialog/settingRemarkLabelDialog/settingRemarkLabelDialog'

import { $wuxToast, $wuxTrack } from "../../components/wux"

import * as wxapi from 'fmt-wxapp-promise'
import SAASService from '../../services/saas.service'
import UserService from '../../services/user.service'
import CarSourceManager from '../../components/carSource/carSource.manager'
import utils from '../../utils/util'

const saasService: SAASService = container.saasService
const userService: UserService = container.userService
let selectedDateSection: {
  callDateStr: string,
  callRecordBySpu: Array<{
    spuSummary: CarModel,
    callRecordList: Array<{
      lastCallDate: string,
      carSource: CarSource
    }>
  }>
} | null = null
let carSourceManger: CarSourceManager | null = null

Page({
  data: {

    // 时间分区
    selectedIndex: -1,
    selectedSubIndex: -1,

    records: null,
    currentTag: {
      comment: '', // 备注内容
      price: 110,
      mileage: [], // 公里数标签
      condition: [], // 特殊条件标签
      sourceArea: [], // 货源地标签
    }
  },
  quotedMethod(brandName){
    const isShowDownPrice = !(brandName.includes('宝马') || brandName.includes('奥迪') || brandName.toLowerCase().includes('mini'))
    const quotedMethod: QuotedMethod = isShowDownPrice ? 'PRICE' : 'POINTS'
    carSourceManger.quotedMethod = quotedMethod
  },
  onLoad(options) {
    wxapi.showToast({title: '加载中...', icon: 'loading', mask: true})
      .then(() => {
        return this.getLoad()
      })
      .then(() => {
        wxapi.hideToast()
      })
      .catch(() => {
        wxapi.hideToast()
      })

  },
  onShow() { },
  onHide() { },
  getLoad() {
    this.setData({
      selectedIndex: -1,
      selectedSubIndex: -1
    })
    return this.records()
      .then((res) => {
        this.setData({
          records: res
        })

        let _records = res

        for (let mode of _records) {
          for (let spuItem of mode.callRecordBySpu) {

            // 构建车源管理器
            const carModelsInfo = spuItem.spuSummary
            const isShowDownPrice = !(carModelsInfo.carModelName.includes('宝马') || carModelsInfo.carModelName.includes('奥迪') || carModelsInfo.carModelName.toLowerCase().includes('mini'))
            const quotedMethod: QuotedMethod = isShowDownPrice ? 'PRICE' : 'POINTS'
            carSourceManger = new CarSourceManager(carModelsInfo.officialPrice, quotedMethod)

            for (let callRecord of spuItem.callRecordList) {
              carSourceManger.processCarSourceItem(callRecord.itemDetail)
            }
          }
        }
        console.log(_records)
      })
  },
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

    if (this.data.selectedIndex == index) {
      // 如果还是点击当前分区内的值
      if (this.data.selectedSubIndex == subIndex) {
        // 点击已经选中的分区
        selectedDateSection = null
        carSourceManger = null
        this.setData({
          selectedIndex: -1,
          selectedSubIndex: -1
        })
        return
      } else {
        // 点击未选中的分区
      }
    } else {
      // 如果点击其他分区内的值
    }

    // 点击其他分区
    const records = this.data.records
    selectedDateSection = records[index]
    const spuItem = selectedDateSection.callRecordBySpu[subIndex]

    // 构建车源管理器
    const carModelsInfo = spuItem.spuSummary
    const isShowDownPrice = !(carModelsInfo.carModelName.includes('宝马') || carModelsInfo.carModelName.includes('奥迪') || carModelsInfo.carModelName.toLowerCase().includes('mini'))
    const quotedMethod: QuotedMethod = isShowDownPrice ? 'PRICE' : 'POINTS'
    carSourceManger = new CarSourceManager(carModelsInfo.officialPrice, quotedMethod)

    for (let callRecord of spuItem.callRecordList) {
      carSourceManger.processCarSourceItem(callRecord.itemDetail)
    }

    this.setData({
      selectedIndex: index,
      selectedSubIndex: subIndex,
      [`records[${index}].callRecordBySpu[${subIndex}]`]: spuItem
    })
  },
  onCarSourceCellClick(e) {

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
    const carSourceItem = spuItem.callRecordList[carSourceItemIndex].itemDetail

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
        this.actionContactWithCarSourceItem(carModelsInfo.carModelId, carSourceItem, 'sourceDetail')
      },
      handlerCreateQuoted: (e) => {
        const carSku = {
          externalColorName: carSourceItem.externalColor,
          internalColorName: carSourceItem.internalColor,
          showPrice: carSourceItem.viewModelQuoted.price
        }
        const carModelsInfoKeyValueString = utils.urlEncodeValueForKey('carModelsInfo', carModelsInfo)
        const carSkuInfoKeyValueString = utils.urlEncodeValueForKey('carSkuInfo', carSku)
        wx.navigateTo({
          url: '/pages/quote/quotationCreate/quotationCreate?' + carModelsInfoKeyValueString + '&' + carSkuInfoKeyValueString
        })
      },
      handlerGoMore(e) {
        let _showCarModelName = '【' + carModelsInfo.officialPriceStr + '】' + carModelsInfo.carModelName
        let _showColorName = carSourceItem.exteriorColor + ' / ' + carSourceItem.viewModelInternalColor
        let _carSourceItemKeyValueString = utils.urlEncodeValueForKey('carSourceItem', carSourceItem)
        let _carSourceId = carSourceItem.id
        let url = `../carSourcesMore/carSourcesMore?${_carSourceItemKeyValueString}&showCarModelName=${_showCarModelName}&showColorName=${_showColorName}&carSourceId=${_carSourceId}`
        wx.navigateTo({ url })
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
  onContactButtonClick(e) {

    const spuItemIndex = e.currentTarget.dataset.skuIndex
    const carSourceItemIndex = e.currentTarget.dataset.carSourceIndex

    if (selectedDateSection === null) {
      console.error('没有选中')
      return
    }

    const spuItem = selectedDateSection.callRecordBySpu[spuItemIndex]
    const carSourceItem = spuItem.callRecordList[carSourceItemIndex].itemDetail

    this.actionContactWithCarSourceItem(spuItem.spuSummary.carModelId, carSourceItem, null)
  },
  actionContactWithCarSourceItem(spuId, carSourceItem, from) {
    console.log("kkkkkkk")
      this.actionContact(
      spuId,
      carSourceItem.viewModelQuoted.price,
      carSourceItem.id,
      carSourceItem.companyId,
      carSourceItem.companyName,
      from,
      (supplier) => {
        if (selectedDateSection === null) {
          console.error('没有选中')
          return
        }

        /**
         * 1.4.0 埋点 拨打供货方电话
         * davidfu
         */
        this.data.pageParameters = {
          productId: spuId,
          color: carSourceItem.externalColorName,
          parameters: {
            carSourceId: carSourceItem.id,
            supplierId: supplier.supplierId
          }
        }
        const event = {
          eventAction: 'click',
          eventLabel: '拨打供货方电话'
        }
        $wuxTrack.push(event)
      },
      () => {
        // 刷新页面
        this.getLoad()
      })
  },
  /**
   * 包装的联系人接口
   *
   * @param {any} carSourceId
   * @param {any} companyId
   * @param {any} companyName
   * @param {any} from
   * @param {any} completeHandler
   */
  actionContact(spuId, quotedPrice, carSourceId, companyId, companyName, from, completeHandler, lableSuccessHandler) {
    $wuxCarSourceDetailDialog.contactList({
      spuId: spuId,
      quotedPrice: quotedPrice,
      carSourceId: carSourceId,
      companyId: companyId,
      companyName: companyName,
      from: from,
      contact: (supplier) => {
        typeof completeHandler === 'function' && completeHandler(supplier)
      },
      lableSuccess: () => {
        typeof lableSuccessHandler === 'function' && lableSuccessHandler()
      },
    })
  },
  /**
   * 获取商品所有标签
   *
   * @param itemId 商品id
   */
  getTags(carSourceId) {
    const userId = userService.auth.userId
    return saasService.getQueryCompanyRemark(userId, carSourceId).then((res) => {
      this.setData({
        'currentTag': res
      })
      return res
    })
  },
  handleUpdate(e) {
    const carSourceId = e.currentTarget.dataset.carsourceid
    const userId = userService.auth.userId
    const mobile = userService.mobile
    this.getTags(carSourceId).then((res) => {
      // 本来想组装数据，怕不稳定还是不装了
      $settingRemarkLabelDialog.open({
        currentTag: res,
        handlerSettingTags: (tags, comment, price) => {
          saasService.settingCompanyTags(
            carSourceId,
            comment,
            price,
            userId,
            tags,
            mobile
          ).then((res) => {
            // 成功新增一条标签记录
            wx.showToast({
              title: '设置成功',
              icon: 'success',
              duration: 3000,
              success: () => {
                this.getLoad()
              }
            })
          })
        },
        close: () => {

        }
      })
    })
  }
})
