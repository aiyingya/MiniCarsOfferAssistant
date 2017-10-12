// @flow
import {
  $wuxDialog,
  $wuxInputNumberDialog,
  $wuxTrack
} from '../../components/wux'
import $wuxCarSourceDetailDialog from '../../components/dialog/carSourceDetail/carSourceDetail'

import util from '../../utils/util'
import { container } from '../../landrover/business/index'

import CarSourceManager from '../../components/carSource/carSource.manager'
import SAASService from '../../services/saas.service'
import UserService from '../../services/user.service'

const saasService: SAASService = container.saasService
const userService: UserService = container.userService
const carSourceManger: CarSourceManager = new CarSourceManager()

Page({
  // 车源行情商品缓存最原始的数据 Array<CarSourcesBySKU>
  cacheCarSourcesBySkuInSpuList: [],
  // 车源行情商品当前筛选条件下的全量数据 Array<{ carSku: CarSKU, viewModelPageData: Pagination<CarSource>, viewModelCarSourceItemList: Array<CarSource> }>
  currentCarSourcesBySkuInSpuList: [],
  data: {
    // ubt 相关
    pageId: 'carSources',
    pageName: '车源列表',
    pageParameters: {},
    // 有无数据 init/data/none
    nodata: 'init',
    // data/none
    searchnodata: 'data',
    // 全局视图
    windowHeight: '',
    // 头部 SPU 信息视图
    carModelsInfo: '',
    // 车源行情商品的当前展示数据
    carSourcesBySkuInSpuList: [],
    logisticsList: [],
    selectedSectionIndex: -1,
    selectedSectionId: '0',
    // 当前 spuId 众数 top N
    topNOfCurrentModeHeight: 178,
    topNOfCurrentMode: {},
    topNOfCurrentModeHidden: true,

    showDetailTitle: false,
    overLayDropdownOffset: 178 + 60,
    pageShare: false,
    options: '',
    carModelLabel: {
      unfold: ''
    },
    praiseModels: []
  },
  onLoad(options) {
    console.log(options)
    const carModelsInfo = util.urlDecodeValueForKeyFromOptions('carModelsInfo', options)
    /**
     * 分享进入页面，在未登录的情况下 跳转到登录页
     */
    if (!userService.isLogin()) {
      setTimeout(function () {
        this.setData({
          pageShare: true
        })
      }, 1000)
      this.setData({
        options: options
      })
      wx.navigateTo({
        url: '../login/login'
      })
    } else {

      const isShowDownPrice = !(carModelsInfo.brandName.includes('宝马') || carModelsInfo.brandName.includes('奥迪') || carModelsInfo.brandName.toLowerCase().includes('mini'))
      const quotedMethod: QuotedMethod = isShowDownPrice ? 'PRICE' : 'POINTS'
      carSourceManger.spuOfficialPrice = carModelsInfo.officialPrice
      carSourceManger.quotedMethod = quotedMethod

      this.setData({
        carModelsInfo: carModelsInfo,
        pageShare: false //  避免分享页面二次加载.
      })

      try {
        const res = wx.getSystemInfoSync()
        this.pixelRatio = res.pixelRatio
        this.apHeight = 16
        this.offsetTop = 80
        this.setData({
          windowHeight: res.windowHeight + 'px'
        })
      } catch (e) {

      }

      // 获取众数 top N
      this.setData({
        'topNOfCurrentMode.referenceStatus': '加载中',
        'topNOfCurrentMode.topNStatus': '加载中'
      })
      saasService.getTopNOfCurrentMode(carModelsInfo.carModelId)
        .then(res => {
          // const reference = res.reference

          // 1.7.1 参考成交价移除
          // if (reference) {
          //   this.setData({
          //     topNOfCurrentModeHeight: 288,
          //     overLayDropdownOffset: 288 + 60
          //   })
          //   reference.viewModelQuoted = util.quotedPriceWithDownPriceByFlag(-reference.discount, reference.guidePrice, this.isShowDownPrice)
          //   reference.viewModelQuoted.price = reference.price
          //   reference.viewModelQuoted.priceDesc = util.priceStringWithUnit(reference.price)
          // } else {
          //   res.referenceStatus = '暂无'
          // }

          let topNOfCurrentModeHidden = true
          if (res.priceList && res.priceList.length) {
            topNOfCurrentModeHidden = false
            for (let topMode of res.priceList) {
              topMode.viewModelQuoted = util.quotedPriceWithDownPriceByFlag(-topMode.discount, topMode.guidePrice, this.isShowDownPrice)
              topMode.viewModelQuoted.price = topMode.price
              topMode.viewModelQuoted.priceDesc = util.priceStringWithUnit(topMode.price)
            }
          } else {
            topNOfCurrentModeHidden = true
            res.topNStatus = '暂无'
          }

          this.setData({
            topNOfCurrentMode: res,
            topNOfCurrentModeHidden
          })
        })
        .catch(err => {
          this.setData({
            'topNOfCurrentMode.referenceStatus': '加载失败',
            'topNOfCurrentMode.topNStatus': '加载失败'
          })
        })

      saasService.getAllCarSourceItemsForSPU(carModelsInfo.carModelId)
        .then(res => {
          // 口碑参数
          let praiseModels = []
          if (res && res.praiseModels) {
            praiseModels = res.praiseModels
            if (praiseModels.length > 0) {
              for (let item of praiseModels) {
                item.style = ''
                if (item.praiseType) {
                  item.style = 'goodlabel'
                }
              }
            }
          }

          // 烘焙最初的车辆行情商品数据
          const carSourcesBySkuInSpuList = this.bakeTheRawCarSourcesBySkuInSpuList(res.items)
          this.cacheCarSourcesBySkuInSpuList = carSourcesBySkuInSpuList

          // 搜索过滤数据
          const newCarSourcesBySkuInSpuList = this.updateSearchResult({})
          this.selectCarSku(-1)

          // 补全 SPU 信息
          carModelsInfo.capacity = res.capacity
          carModelsInfo.isElectricCar = res.electricCar
          carModelsInfo.seatNums = res.seatNums

          this.setData({
            praiseModels: praiseModels,
            nodata: carSourcesBySkuInSpuList.length !== 0 ? 'data' : 'none',
            searchnodata: newCarSourcesBySkuInSpuList.length !== 0 ? 'data' : 'none',
            carSourcesBySkuInSpuList: newCarSourcesBySkuInSpuList,
            selectedSectionIndex: -1,
            selectedSectionId: '0',
            carModelsInfo: carModelsInfo
          })
        })

      if (wx.showShareMenu) {
        wx.showShareMenu()
      }
    }
  },
  onShow() {
    /**
     * 1.4.0 埋点
     * 行情列表展开
     * davidfu
     */
    this.data.pageParameters = {
      productId: this.data.carModelsInfo.carModelId
    }
    const event = {
      eventAction: 'pageShow',
      eventLabel: `页面展开`
    }
    $wuxTrack.push(event)

    /**
     * 登录后刷新页面.
     */
    console.log(`pageShare:${this.data.pageShare}`)
    if (this.data.pageShare === true) {
      console.log('页面刷新')
      let options = this.data.options
      this.onLoad(options)
    }
  },
  /**
   * 页面分享.
   */
  onShareAppMessage() {
    let carModelsInfo = this.data.carModelsInfo
    let carModelsInfoKeyValueString = util.urlEncodeValueForKey('carModelsInfo', carModelsInfo)
    return {
      title: '要卖车，更好用的卖车助手',
      path: `pages/carSources/carSources?${carModelsInfoKeyValueString}`,
      success(res) {
        // 分享成功

      },
      fail(res) {
        // 分享失败
      }
    }
  },
  handlerScroll(e) {
    const that = this
    if (e.detail) {
      if (e.detail.scrollTop > this.data.overLayDropdownOffset) {
        if (!this.data.showDetailTitle) {
          wx.setNavigationBarTitle({
            title: this.data.carModelsInfo.carModelName,
            success: function () {
              that.data.showDetailTitle = true
            }
          })
        }
      } else {
        if (this.data.showDetailTitle) {
          wx.setNavigationBarTitle({
            title: '车源列表',
            success: function () {
              that.data.showDetailTitle = false
            }
          })
        }
      }

      if (e.detail.scrollTop > this.data.overLayDropdownOffset) {
        if (!this.data.hasOverLayDropdown) {
          this.setData({
            hasOverLayDropdown: true
          })
        }
      } else {
        if (this.data.hasOverLayDropdown) {
          this.setData({
            hasOverLayDropdown: false
          })
        }
      }
    }
  },
  showFold(a, b, c) {
    const that = this
    this.setData({
      [`carSourcesBySkuInSpuList[${b}].viewModelPageData`]: a.viewModelPageData,
      [`carSourcesBySkuInSpuList[${b}].viewModelCarSourceItemList`]: a.viewModelCarSourceItemList,
      selectedSectionIndex: b
    })

    setTimeout(function () {
      that.setData({
        selectedSectionId: c
      })
    }, 100)
  },
  hideFold(a, b, c) {
    this.setData({
      selectedSectionIndex: -1
    })
  },
  /**
   * 预处理车源集合对象
   * @param carSourcesBySkuInSpuItem
   */
  preprocessCarSourcesBySkuInSpuItem(carSourcesBySkuInSpuItem: CarSourcesBySKU) {
    // 分页数据
    this.actionPullRefresh(carSourcesBySkuInSpuItem)

    // SKU 信息处理
    carSourcesBySkuInSpuItem.viewModelQuoted = util.quotedPriceByMethod(carSourcesBySkuInSpuItem.lowestSalePrice, this.data.carModelsInfo.officialPrice, carSourceManger.quotedMethod)
    carSourcesBySkuInSpuItem.viewModelQuoted.price = carSourcesBySkuInSpuItem.lowestSalePrice
    carSourcesBySkuInSpuItem.viewModelQuoted.priceDesc = util.priceStringWithUnit(carSourcesBySkuInSpuItem.lowestSalePrice)
  },

  /**
   *
   *
   * @param {any} carSourcesBySkuInSpuItem
   * @param {any} number
   * @param {any} size
   */
  pageData(carSourcesBySkuInSpuItem: CarSourcesBySKU, number, size) {
    const totalElements = carSourcesBySkuInSpuItem.itemDetails.length
    const totalPages = Math.ceil(carSourcesBySkuInSpuItem.itemDetails.length / size)

    let last
    let content
    let fixedNumber
    if (number + 1 > totalPages) {
      content = carSourcesBySkuInSpuItem.itemDetails.slice((totalPages - 1) * size, (totalPages - 1) * size + size)
      fixedNumber = totalPages - 1
      last = true
    } else {
      content = carSourcesBySkuInSpuItem.itemDetails.slice(number * size, number * size + size)
      fixedNumber = number
      if (number + 1 === totalPages) {
        last = true
      } else {
        last = false
      }
    }

    for (let carSourceItem of content) {
      carSourceManger.processCarSourceItem(carSourceItem)
    }

    return {
      number: fixedNumber,
      size,
      totalElements,
      totalPages,
      content,
      last
    }
  },
  handlerPullRefresh(e) {
    const skuItemIndex = e.currentTarget.dataset.skuIndex
    const carSourcesBySkuInSpuItem = this.currentCarSourcesBySkuInSpuList[skuItemIndex]

    this.actionPullRefresh(carSourcesBySkuInSpuItem)
    this.setData({
      [`carSourcesBySkuInSpuList[${skuItemIndex}]`]: carSourcesBySkuInSpuItem
    })
  },
  handlerLoadMore(e) {
    const skuItemIndex = e.currentTarget.dataset.skuIndex
    const carSourcesBySkuInSpuItem = this.currentCarSourcesBySkuInSpuList[skuItemIndex]

    this.actionLoadMore(carSourcesBySkuInSpuItem)
    this.setData({
      [`carSourcesBySkuInSpuList[${skuItemIndex}]`]: carSourcesBySkuInSpuItem
    })
  },
  /**
   * 针对一个 carSourcesBySkuInSpuItem 进行重新刷新分页数据
   *
   * @param {Object} carSourcesBySkuInSpuItem
   */
  actionPullRefresh(carSourcesBySkuInSpuItem) {
    const pageData = this.pageData(carSourcesBySkuInSpuItem, 0, 10)
    carSourcesBySkuInSpuItem.viewModelCarSourceItemList = pageData.content
    carSourcesBySkuInSpuItem.viewModelPageData = pageData
  },
  actionLoadMore(carSourcesBySkuInSpuItem) {
    const pageData = this.pageData(carSourcesBySkuInSpuItem, carSourcesBySkuInSpuItem.viewModelPageData.number + 1, 10)
    carSourcesBySkuInSpuItem.viewModelCarSourceItemList = carSourcesBySkuInSpuItem.viewModelCarSourceItemList.concat(pageData.content)
    carSourcesBySkuInSpuItem.viewModelPageData = pageData
  },
  selectCarSku(selectedCarSkuIndex) {
    let section = null
    if (selectedCarSkuIndex === -1) { } else {
      section = this.currentCarSourcesBySkuInSpuList[selectedCarSkuIndex]
    }
    return section
  },
  /**
   * 页面数据主入口，由于该页面有筛选条件，所以页面的初始数据也必须走这个接口以保证初始的筛选条件无误
   * @param object
   */
  updateSearchResult() {
    wx.showToast({
      title: '正在处理',
      icon: 'loading',
      mask: true
    })

    const currentCarSourcesBySkuInSpuList = []
    const carSourcesBySkuInSpuList = []
    for (let carSourcesItemBySku of this.cacheCarSourcesBySkuInSpuList) {
      const newCarSourceItemList = []
      for (let carSourceItem of carSourcesItemBySku.itemDetails) {
        newCarSourceItemList.push(carSourceItem)
      }

      if (newCarSourceItemList.length) {
        // 如果新的车辆行情商品列表有值
        const newCarSourcesBySkuItem = {}
        newCarSourcesBySkuItem.itemDetails = newCarSourceItemList
        newCarSourcesBySkuItem.title = carSourcesItemBySku.title
        newCarSourcesBySkuItem.lowestSalePrice = carSourcesItemBySku.lowestSalePrice
        this.preprocessCarSourcesBySkuInSpuItem(newCarSourcesBySkuItem)
        currentCarSourcesBySkuInSpuList.push(newCarSourcesBySkuItem)

        const new2CarSourcesBySkuItem = {}
        new2CarSourcesBySkuItem.title = carSourcesItemBySku.title
        new2CarSourcesBySkuItem.lowestSalePrice = carSourcesItemBySku.lowestSalePrice
        new2CarSourcesBySkuItem.viewModelQuoted = {}
        new2CarSourcesBySkuItem.viewModelPageData = {}
        new2CarSourcesBySkuItem.viewModelCarSourceItemList = []
        Object.assign(new2CarSourcesBySkuItem.viewModelQuoted, newCarSourcesBySkuItem.viewModelQuoted)
        Object.assign(new2CarSourcesBySkuItem.viewModelPageData, newCarSourcesBySkuItem.viewModelPageData)
        Object.assign(new2CarSourcesBySkuItem.viewModelCarSourceItemList, newCarSourcesBySkuItem.viewModelCarSourceItemList)
        carSourcesBySkuInSpuList.push(new2CarSourcesBySkuItem)
      }
    }

    setTimeout(function () {
      wx.hideToast()
    }, 300)
    this.currentCarSourcesBySkuInSpuList = currentCarSourcesBySkuInSpuList

    return carSourcesBySkuInSpuList
  },
  /**
   * 预留方法
   *
   * @param {any} carSourcesBySkuInSpuList
   * @returns
   */
  bakeTheRawCarSourcesBySkuInSpuList(carSourcesBySkuInSpuList) {
    return carSourcesBySkuInSpuList
  },
  actionContactWithMode(spuId, mode, company, from) {
    this.actionContact(
      spuId,
      mode.viewModelQuoted.price,
      null,
      company.companyId,
      company.companyName,
      from,
      (supplier) => {
      })
  },
  actionContactWithCarSourceItem(skuItemIndex, carSourceItemIndex, carSourceItem: CarSource, from) {
    this.actionContact(
      null,
      null,
      carSourceItem.id,
      carSourceItem.companyId,
      carSourceItem.companyName,
      from,
      (supplier) => {
        const skuItem = this.currentCarSourcesBySkuInSpuList[skuItemIndex]
        /**
         * 1.4.0 埋点 拨打供货方电话
         * davidfu
         */
        this.data.pageParameters = {
          productId: this.data.carModelsInfo.carModelId,
          color: skuItem.title,
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
  actionContact(spuId, quotedPrice, carSourceId, companyId, companyName, from, completeHandler) {
    $wuxCarSourceDetailDialog.contactList({
      spuId: spuId,
      quotedPrice: quotedPrice,
      carSourceId: carSourceId,
      companyId: companyId,
      companyName: companyName,
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
   * 众数选项点击后行为
   *
   * @param {any} e
   */
  handlerModeClick(e) {
    const that = this
    const mode = e.currentTarget.dataset.mode
    $wuxCarSourceDetailDialog.companyList({
      spuId: this.data.carModelsInfo.carModelId,
      quotationPrice: mode.viewModelQuoted.price,
      carModel: this.data.carModelsInfo,
      mode: mode,
      contact: function (res) {
        const company = res
        that.actionContactWithMode(that.data.carModelsInfo.carModelId, mode, company, 'companyList')
      },
      handlerCreateQuoted(e) {
        const carSKU = {
          showPrice: mode.viewModelQuoted.price,
          skuId: null,
          skuPic: null,
          externalColorId: null,
          externalColorName: null,
          internalColorId: null,
          internalColorName: null,
          price: null,
          priceStr: null,
          discount: null,
          status: null,
          remark: null,
          metallicPaint: null,
          metallicPaintAmount: 0
        }
        this.jumpToCreateQuotation(carSKU)
      }
    })
  },
  /**
   * 选择 SKU 分区
   * @param e
   */
  handlerSelectCarSku(e) {
    const index = e.currentTarget.dataset.skuIndex

    let actualIndex = -1
    let actualId = this.data.selectedSectionId

    if (index === this.data.selectedSectionIndex) {
      const section = this.selectCarSku(actualIndex)
      this.hideFold(section, actualIndex, actualId)
    } else {
      actualIndex = index
      actualId = actualIndex.toString()
      const section = this.selectCarSku(actualIndex)
      this.showFold(section, actualIndex, actualId)

      /**
       * 1.4.0 埋点
       * 用户选择外饰分区颜色
       * davidfu
       */
      this.data.pageParameters = {
        productId: this.data.carModelsInfo.carModelId,
        color: section.title
      }
      const event = {
        eventAction: 'click',
        eventLabel: '选择外饰分区'
      }
      $wuxTrack.push(event)
    }
  },
  /**
   * 联系电话
   * @param e
   */
  onContactButtonClick(e) {
    const skuItemIndex: number = e.currentTarget.dataset.skuIndex
    const carSourceItemIndex: number = e.currentTarget.dataset.carSourceIndex
    const skuItem: CarSourcesBySKU = this.currentCarSourcesBySkuInSpuList[skuItemIndex]
    const carSourceItem = skuItem.itemDetails[carSourceItemIndex]

    this.actionContactWithCarSourceItem(skuItemIndex, carSourceItemIndex, carSourceItem, null)
  },
  /**
   * 点击供货列表项目得到的供货详情
   * @param e
   */
  onCarSourceCellClick(e) {
    const skuItemIndex: number = e.currentTarget.dataset.skuIndex
    const carSourceItemIndex: number = e.currentTarget.dataset.carSourceIndex
    const skuItem: CarSourcesBySKU = this.currentCarSourcesBySkuInSpuList[skuItemIndex]
    const carSourceItem = skuItem.itemDetails[carSourceItemIndex]
    const carModelsInfo = this.data.carModelsInfo

    /**
     * 1.4.0 埋点
     * 用户选择行情
     * davidfu
     */
    this.data.pageParameters = {
      productId: this.data.carModelsInfo.carModelId,
      color: skuItem.title,
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
        this.actionBookCar(carModelsInfo, skuItem, updateCarSourceItem)
      },
      contact: () => {
        this.actionContactWithCarSourceItem(skuItemIndex, carSourceItemIndex, carSourceItem, 'sourceDetail')
      },
      handlerCreateQuoted: (e) => {
        const carSKU = {
          showPrice: carSourceItem.viewModelQuoted.price,
          skuId: null,
          skuPic: null,
          externalColorId: null,
          externalColorName: carSourceItem.exteriorColor,
          internalColorId: null,
          internalColorName: carSourceItem.simpleInteriorColor,
          price: null,
          priceStr: null,
          discount: null,
          status: null,
          remark: null,
          metallicPaint: skuItem.metallicPaint,
          metallicPaintAmount: skuItem.metallicPaintAmount
        }
        this.jumpToCreateQuotation(carSKU)
      },
      handlerGoMore(e) {
        let _showCarModelName = '【' + carModelsInfo.officialPriceStr + '】' + carModelsInfo.carModelName
        let _showColorName = carSourceItem.exteriorColor + ' / ' + carSourceItem.viewModelInternalColor
        let _carSourceItemKeyValueString = util.urlEncodeValueForKey('carSourceItem', carSourceItem)
        let _carSourceId = carSourceItem.id
        let url = `../carSourcesMore/carSourcesMore?${_carSourceItemKeyValueString}&showCarModelName=${_showCarModelName}&showColorName=${_showColorName}&carSourceId=${_carSourceId}`
        wx.navigateTo({ url })
      },
      close: () => {
        this.setData({
          [`carSourcesBySkuInSpuList[${skuItemIndex}].viewModelCarSourceItemList[${carSourceItemIndex}]`]: carSourceItem
        })
      },
      reportError: (e) => {
        console.log('report error')
      }
    })
  },
  /**
   * 切换label.
   */
  handleSwitchShow() {
    let that = this
    let carModelLabel = that.data.carModelLabel

    if (carModelLabel.unfold !== '') {
      that.setData({
        'carModelLabel.unfold': ''
      })
    } else {
      that.setData({
        'carModelLabel.unfold': 'show'
      })
    }
  },
  jumpToCreateQuotation(carSKU) {
    const carModelsInfoKeyValueString = util.urlEncodeValueForKey('carModelsInfo', this.data.carModelsInfo)
    const carSkuInfoKeyValueString = util.urlEncodeValueForKey('carSkuInfo', carSKU)
    wx.navigateTo({
      url: '/pages/quote/quotationCreate/quotationCreate?' + carModelsInfoKeyValueString + '&' + carSkuInfoKeyValueString
    })
  }
})
