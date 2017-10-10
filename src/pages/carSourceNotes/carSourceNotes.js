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
      comment:"", // 备注内容
      price:110,
      mileage: [], // 公里数标签
      condition: [], // 特殊条件标签
      sourceArea: [], // 货源地标签
    }
  },
  onLoad(options) {
    wxapi.showToast({title: '加载中...', icon: 'loading', mask: true})
      .then(() => {
        return this.records()
          .then((res) => {
            this.setData({
              records: res
            })
          })
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
      carSourceManger.processCarSourceItem(callRecord.carSource)
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
      handlerGoMore(e) {
        // TODO:2.0 需要注意国庆以后下面的参数取值可能有变化，因为会更新历史返回的数据结构，这里需要十分注意、十分注意、十分注意
        let _showCarModelName = '【' + carModelsInfo.officialPriceStr + '】' + carModelsInfo.carModelName
        let _showColorName = carSourceItem.externalColor + ' / ' + carSourceItem.viewModelInternalColor
        let _carSourceItemKeyValueString = utils.urlEncodeValueForKey('carSourceItem', carSourceItem)
        let _itemId = 1 // TODO:2.0 itemId为临时Id，接口需要国庆后提供
        let url = `../carSourcesMore/carSourcesMore?${_carSourceItemKeyValueString}&showCarModelName=${_showCarModelName}&showColorName=${_showColorName}&itemId=${_itemId}`
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
          carSourceId = carSourceItem.id,
          contactPhone = carSourceItem.contact || supplier.supplierPhone,
          spuItem = selectedDateSection.callRecordBySpu[spuItemIndex]

        saasService.pushCallRecordForCarSource(supplierId, supplierPhone, contactPhone, carSourceId)

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
    })
  },
  /**
   * 获取商品所有标签
   *
   * @param itemId 商品id
   */
  getTags(itemId) {
    const userId = userService.auth.userId
    return saasService.getQueryCompanyRemark(userId, itemId).then((res) => {
      this.setData({
        'currentTag': res
      })
      return res
    })
  },
  handleUpdate() {
    console.log('修改标签和备注')
    // TODO:1.20 2为临时参数
    const itemId = 2
    const userId = userService.auth.userId
    const mobile = userService.mobile
    this.getTags(itemId).then((res) => {
      // 本来想组装数据，怕不稳定还是不装了
      $settingRemarkLabelDialog.open({
        currentTag: res,
        handlerSettingTags: (tags, comment, price) => {
          saasService.settingCompanyTags(
            itemId,
            comment,
            price,
            userId,
            tags,
            mobile
          ).then((res) => {})
        },
        close: () => {

        }
      })
    })
  }
})
