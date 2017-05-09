import {
  $wuxDialog,
  $wuxInputNumberDialog,
  $wuxTrack
} from '../../components/wux'
import $wuxCarSourceDetailDialog from './carSourceDetail/carSourceDetail'

import util from '../../utils/util'
import config from '../../config'

let app = getApp()

Page({

  cacheCarSourcesBySkuInSpuList: [],
  // 是否需要展示下点，目前仅限于 宝马/奥迪/MINI
  isShowDownPrice: true,
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
    // 筛选下拉视图
    showRmendCarFacade: '',
    filters: [],
    // 下拉菜单筛选
    dropDownFilters: [],
    dropDownFiltersData: '',
    dropDownSubFiltersData: '',
    // 选择哪一个数据筛选集合
    selectedFilterIndex: -1,
    selectedExternalCarColorIndex: -1,
    selectedExternalCarColorId: '-1',
    selectedExternalCarColorName: '全部',
    selectedInternalCarColorIndex: -1,
    selectedInternalCarColorId: '-1',
    selectedInternalCarColorName: '全部',
    // 横向滚动菜单筛选
    scrollFilters: [],
    scrollFiltersData: [],
    selectedScrollFilterIndex: -1,
    scrollFiltersSelectedIndexes: [],
    carSourcesBySkuInSpuList: [],
    logisticsList: [],
    selectedSectionIndex: -1,
    selectedSectionId: '0',
    showDetailTitle: false,
    hasOverLayDropdown: false,
    pageShare: false,
    options: ''
  },
  onLoad(options) {
    console.log(options)
    const that = this
    const carModelsInfo = util.urlDecodeValueForKeyFromOptions('carModelsInfo', options)
    /**
     * 分享进入页面，在未登录的情况下 跳转到登录页
     */
    if (!app.userService.isLogin()) {
      setTimeout(function () {
        that.setData({
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
      this.isShowDownPrice = isShowDownPrice

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

      app.saasService.requestCarSourcesList(carModelsInfo.carModelId, {
        success: function (res) {

          let filters = res.filters
          let dropDownFilters = []
          let scrollFilters = []
          let scrollFiltersSelectedIndexes = []

          let sourcePublishDateFilterId
          let seatNum = res.seatNums

          for (let i = 0; i < filters.length; i++) {
            let filter = filters[i]
            // FIXME: 这里的问题是使用了不严谨的方法获取数据
            if (i === 0) {
              dropDownFilters.push(filter)
            } else if (i === 1) {
              scrollFilters.push(filter)
              scrollFiltersSelectedIndexes.push(-1)
              // 车源发布信息， 默认为 全部
              sourcePublishDateFilterId = '-1'
            } else {
              scrollFilters.push(filter)
              scrollFiltersSelectedIndexes.push(-1)
            }
          }

          const carSourcesBySkuInSpuList = that.bakeTheRawCarSourcesBySkuInSpuList(res.carSourcesBySkuInSpuList)

          that.setData({
            nodata: carSourcesBySkuInSpuList.length !== 0 ? 'data' : 'none',
            filters: filters,
            dropDownFilters: dropDownFilters,
            scrollFilters: scrollFilters,
            scrollFiltersSelectedIndexes: scrollFiltersSelectedIndexes
          })
          that.cacheCarSourcesBySkuInSpuList = carSourcesBySkuInSpuList

          const newCarSourcesBySkuInSpuList = that.updateSearchResult({})
          that.selectCarSku(-1, newCarSourcesBySkuInSpuList)
          that.setData({
            searchnodata: newCarSourcesBySkuInSpuList.length !== 0 ? 'data' : 'none',
            carSourcesBySkuInSpuList: newCarSourcesBySkuInSpuList,
            selectedSectionIndex: -1,
            selectedSectionId: '0'
          })

          carModelsInfo.capacity = res.capacity
          carModelsInfo.isElectricCar = res.electricCar
          carModelsInfo.seatNums = seatNum
          that.setData({
            carModelsInfo: carModelsInfo
          })

        }
      })

      wx.showShareMenu()
    }
  },
  onShow() {
    console.log('onshow')
    /**
     * 1.4.0 埋点
     * 用户选择外饰分区颜色
     * davidfu
     */
    this.data.pageParameters = {
      spuId: this.data.carModelsInfo.carModelId
    }
    const event = {
      eventAction: 'pageShow',
      eventLabel: `页面展开`
    }
    $wuxTrack.push(event)

    const that = this
    /**
     * 登陆后刷新页面.
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
      if (e.detail.scrollTop > 60) {
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
            title: '车源详情',
            success: function () {
              that.data.showDetailTitle = false
            }
          })
        }
      }

      if (e.detail.scrollTop > 60) {
        if (!this.data.hasOverLayDropdown) {
          console.log('fuck')
          this.setData({
            hasOverLayDropdown: true
          })
        }
      } else {
        if (this.data.hasOverLayDropdown) {
          console.log('fuck you')
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
      [`carSourcesBySkuInSpuList[${b}].viewModelCarSourcesList`]: a.viewModelCarSourcesList,
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
  preprocessCarSourcesBySkuInSpuItem(carSourcesBySkuInSpuItem) {
    console.log('preprocessCarSourcesBySkuInSpuItem')
    // 获取全部车源中,合并不同的标签集合
    let tags = []
    for (let carSourceItem of carSourcesBySkuInSpuItem.carSourcesList) {
      this.processCarSourceItemOnlyOnce(carSourceItem)
      tags = tags.concat(carSourceItem.viewModelTags)
    }
    const tagsSet = new Set(tags)
    carSourcesBySkuInSpuItem.carSku.viewModelTags = [...tagsSet]

    // 分页数据
    this.actionPullRefresh(carSourcesBySkuInSpuItem)

    // 获取全部车源中,分别获取自营和三方货源中的第一个
    let lowestSelfPlatformCarSourceItem = null
    let lowestThirdCarSourceItem = null
    for (let carSourceItem of carSourcesBySkuInSpuItem.carSourcesList) {
      if (carSourceItem.supplierSelfSupport) {
        if (lowestSelfPlatformCarSourceItem) {
          continue
        } else {
          lowestSelfPlatformCarSourceItem = carSourceItem
          lowestSelfPlatformCarSourceItem.lowestPrice = lowestSelfPlatformCarSourceItem.lowestPrice || this.data.carModelsInfo.officialPrice
        }
      } else {
        if (lowestThirdCarSourceItem) {
          break
        } else {
          lowestThirdCarSourceItem = carSourceItem
          lowestThirdCarSourceItem.lowestPrice = lowestThirdCarSourceItem.lowestPrice || this.data.carModelsInfo.officialPrice
        }
      }
    }
    let lowestCarSource
    if (lowestThirdCarSourceItem && lowestSelfPlatformCarSourceItem) {
      lowestCarSource = lowestSelfPlatformCarSourceItem.lowestPrice > lowestThirdCarSourceItem.lowestPrice ? lowestThirdCarSourceItem : lowestSelfPlatformCarSourceItem
    } else if (lowestThirdCarSourceItem) {
      lowestCarSource = lowestThirdCarSourceItem
    } else if (lowestSelfPlatformCarSourceItem) {
      lowestCarSource = lowestSelfPlatformCarSourceItem
    }
    carSourcesBySkuInSpuItem.carSku.viewModelLowestCarSource = lowestCarSource

    carSourcesBySkuInSpuItem.carSku.viewModelQuoted = util.quotedPriceByFlag(carSourcesBySkuInSpuItem.carSku.viewModelLowestCarSource.lowestPrice, this.data.carModelsInfo.officialPrice, this.isShowDownPrice)
    carSourcesBySkuInSpuItem.carSku.viewModelQuoted.price = carSourcesBySkuInSpuItem.carSku.viewModelLowestCarSource.lowestPrice
    carSourcesBySkuInSpuItem.carSku.viewModelQuoted.priceDesc = util.priceStringWithUnit(carSourcesBySkuInSpuItem.carSku.viewModelLowestCarSource.lowestPrice)
    // 自营与否
    carSourcesBySkuInSpuItem.carSku.viewModelSupplierSelfSupport = carSourcesBySkuInSpuItem.carSku.viewModelLowestCarSource.supplierSelfSupport
  },
  /**
   *
   *
   * @param {any} carSourcesBySkuInSpuItem
   * @param {any} number
   * @param {any} size
   */
  pageData(carSourcesBySkuInSpuItem, number, size) {
    const totalElements = carSourcesBySkuInSpuItem.carSourcesList.length
    const totalPages = Math.ceil(carSourcesBySkuInSpuItem.carSourcesList.length / size)

    let last
    let content
    let fixedNumber
    if (number + 1 > totalPages) {
      content = carSourcesBySkuInSpuItem.carSourcesList.slice((totalPages - 1) * size, (totalPages - 1) * size + size)
      fixedNumber = totalPages - 1
      last = true
    } else {
      content = carSourcesBySkuInSpuItem.carSourcesList.slice(number * size, number * size + size)
      fixedNumber = number
      if (number + 1 === totalPages) {
        last = true
      } else {
        last = false
      }
    }

    for (let carSourceItem of content) {
      this.processCarSourceItem(carSourceItem)
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
  handlerPullReresh(e) {
    const skuItemIndex = e.currentTarget.dataset.skuIndex
    const carSourcesBySkuInSpuItem = this.data.carSourcesBySkuInSpuList[skuItemIndex]

    this.actionPullRefresh(carSourcesBySkuInSpuItem)
    this.setData({
      [`carSourcesBySkuInSpuList[${skuItemIndex}]`]: carSourcesBySkuInSpuItem
    })
  },
  handlerLoadMore(e) {
    const skuItemIndex = e.currentTarget.dataset.skuIndex
    const carSourcesBySkuInSpuItem = this.data.carSourcesBySkuInSpuList[skuItemIndex]

    this.actionLoadMore(carSourcesBySkuInSpuItem)
    this.setData({
      [`carSourcesBySkuInSpuList[${skuItemIndex}]`]: carSourcesBySkuInSpuItem
    })
  },
  actionPullRefresh(carSourcesBySkuInSpuItem) {
    const pageData = this.pageData(carSourcesBySkuInSpuItem, 0, 10)
    carSourcesBySkuInSpuItem.viewModelCarSourcesList = pageData.content
    carSourcesBySkuInSpuItem.viewModelPageData = pageData
  },
  actionLoadMore(carSourcesBySkuInSpuItem) {
    const pageData = this.pageData(carSourcesBySkuInSpuItem, carSourcesBySkuInSpuItem.viewModelPageData.number + 1, 10)
    carSourcesBySkuInSpuItem.viewModelCarSourcesList = carSourcesBySkuInSpuItem.viewModelCarSourcesList.concat(pageData.content)
    carSourcesBySkuInSpuItem.viewModelPageData = pageData
  },
  processCarSourceItemOnlyOnce(carSourceItem) {
    let carSourcePlaceArray = []

    const carSourcePlaceLowest = carSourceItem.viewModelLowest
    if (carSourcePlaceLowest) {
      // FIXME: 初始化状态下，无法得知某一货源地下的最低报价就是从第一个物流方案得来的，很可能压根就没有物流方案
      carSourcePlaceArray.push(carSourcePlaceLowest)
    }

    // 到货快
    const carSourcePlaceFastest = carSourceItem.viewModelFastest
    if (carSourcePlaceFastest) {
      carSourcePlaceArray.push(carSourcePlaceFastest)
    }

    // 其他
    const moreArray = carSourceItem.viewModelOthers
    if (moreArray) {
      carSourcePlaceArray = carSourcePlaceArray.concat(moreArray)
    }

    // 更新分区标签
    const tags = []
    if (carSourceItem.supplierSelfSupport) {
      tags.push('垫款发车')
    }
    for (let carSourcePlaceItem of carSourcePlaceArray) {
      if (carSourcePlaceItem.priceFixed) {
        tags.push('一口价')
        break
      }
    }
    carSourceItem.viewModelTags = tags
  },
  /**
   * 处理车源对象
   * @param carSourceItem
   */
  processCarSourceItem(carSourceItem) {
    // 价格最低
    const carSourcePlaceLowest = carSourceItem.viewModelLowest
    if (carSourcePlaceLowest) {
      // FIXME: 初始化状态下，无法得知某一货源地下的最低报价就是从第一个物流方案得来的，很可能压根就没有物流方案
      this.selectLogisticsDestinationForCarSourcePlaceOfCarSource(carSourceItem, carSourcePlaceLowest, 0)
    }

    // 到货快
    const carSourcePlaceFastest = carSourceItem.viewModelFastest
    if (carSourcePlaceFastest) {
      this.selectLogisticsDestinationForCarSourcePlaceOfCarSource(carSourceItem, carSourcePlaceFastest, 0)
    }

    // 更多项目
    if (carSourceItem.viewModelOthers && carSourceItem.viewModelOthers.length > 0) {
      for (let carSourcePlaceItem of carSourceItem.viewModelOthers) {
        this.selectLogisticsDestinationForCarSourcePlaceOfCarSource(carSourceItem, carSourcePlaceItem, 0)
      }
    }

    /**
     * 判断各种奇葩情况下每个货源的展示情况
     */
    let selectedCarSourcePlace = null
    if (carSourcePlaceFastest && carSourcePlaceLowest) {
      // 价格低和到货快 同时存在
      if (carSourceItem.viewModelOthers && carSourceItem.viewModelOthers.length > 0) {
        carSourceItem.viewModelTabs = [{
            name: '价格低',
            value: carSourcePlaceLowest
          },
          {
            name: '到货快',
            value: carSourcePlaceFastest
          }
        ]
        carSourceItem.viewModelTabMore = carSourceItem.viewModelOthers
        selectedCarSourcePlace = carSourcePlaceLowest
      } else {
        carSourceItem.viewModelTabs = [{
            name: '价格低',
            value: carSourcePlaceLowest
          },
          {
            name: '到货快',
            value: carSourcePlaceFastest
          }
        ]
        carSourceItem.viewModelTabMore = null
        selectedCarSourcePlace = carSourcePlaceLowest
      }
    } else if (!carSourcePlaceFastest && !carSourcePlaceLowest) {
      // 价格低和到货快 同时不存在
      if (carSourceItem.viewModelOthers && carSourceItem.viewModelOthers.length === 1) {
        carSourceItem.viewModelTabs = null
        carSourceItem.viewModelTabMore = null
        selectedCarSourcePlace = carSourceItem.viewModelOthers[0]
      } else {
        carSourceItem.viewModelTabs = [{
          name: '推荐',
          value: carSourceItem.viewModelOthers[0]
        }]
        carSourceItem.viewModelTabMore = carSourceItem.viewModelOthers.shift()
        selectedCarSourcePlace = carSourceItem.viewModelOthers[0]
      }
    } else if (carSourcePlaceFastest && !carSourcePlaceLowest) {
      // 价格低不存在， 到货快存在
      if (carSourceItem.viewModelOthers && carSourceItem.viewModelOthers.length > 0) {
        carSourceItem.viewModelTabs = [{
          name: '到货快',
          value: carSourcePlaceFastest
        }]
        carSourceItem.viewModelTabMore = carSourceItem.viewModelOthers
        selectedCarSourcePlace = carSourcePlaceFastest
      } else {
        carSourceItem.viewModelTabs = [{
          name: '到货快',
          value: carSourcePlaceFastest
        }]
        carSourceItem.viewModelTabMore = null
        selectedCarSourcePlace = carSourcePlaceFastest
      }
    } else if (!carSourcePlaceFastest && carSourcePlaceLowest) {
      // 价格低存在， 到货快不存在
      if (carSourceItem.viewModelOthers && carSourceItem.viewModelOthers.length > 0) {
        carSourceItem.viewModelTabs = [{
          name: '价格低',
          value: carSourcePlaceLowest
        }]
        carSourceItem.viewModelTabMore = carSourceItem.viewModelOthers
        selectedCarSourcePlace = carSourcePlaceLowest
      } else {
        carSourceItem.viewModelTabs = [{
          name: '价格低',
          value: carSourcePlaceLowest
        }]
        carSourceItem.viewModelTabMore = null
        selectedCarSourcePlace = carSourcePlaceLowest
      }
    }

    carSourceItem.viewModelSelectedTab = 0
    this.selectCarSourcePlace(selectedCarSourcePlace, carSourceItem)

    // 更新发布时间
    const publishDate = util.dateCompatibility(carSourceItem.publishDate)
    carSourceItem.viewModelPublishDateDesc = util.dateDiff(publishDate)

    // 内外饰颜色处理
    const internalColors = carSourceItem.internalColor.split('/')
    const processedInternalColors = []
    for (let color of internalColors) {
      const processedColor = color.replace(/色$/, '')
      processedInternalColors.push(processedColor)
    }
    carSourceItem.viewModelInternalColor = processedInternalColors.join('+')

    this.processCarSourcePlaceItem(selectedCarSourcePlace, carSourceItem)
  },
  processCarSourcePlaceItem(carSourcePlaceItem, carSourceItem) {
    this.updateTheCarSourcePlace(carSourcePlaceItem, carSourceItem)
  },
  selectCarSku(selectedCarSkuIndex) {
    let section = null
    if (selectedCarSkuIndex === -1) {} else {
      section = this.data.carSourcesBySkuInSpuList[selectedCarSkuIndex]
      //this.updateTheCarSku(selectedCarSkuIndex, section)
    }
    return section
  },
  /**
   * 选择货源下某个货源地
   * @param carSourceItem
   * @param
   */
  selectCarSourcePlace(selectedCarSourcePlaceItem, carSourceItem) {
    carSourceItem.viewModelSelectedCarSourcePlace = selectedCarSourcePlaceItem
    return carSourceItem
  },
  /**
   * 选择货源下某个货源地下的某一个物流方案
   * @param carSourcePlaceItem
   * @param selectedLogisticsDestinationIndex
   */
  selectLogisticsDestinationForCarSourcePlaceOfCarSource(carSourceItem,
    carSourcePlaceItem,
    selectedLogisticsDestinationIndex) {
    if (carSourcePlaceItem.destinationList && carSourcePlaceItem.destinationList.length) {
      const selectedLogisticsDestination = carSourcePlaceItem.destinationList[selectedLogisticsDestinationIndex]
      if (selectedLogisticsDestination) {
        carSourcePlaceItem.viewModelSelectedLogisticsDestination = selectedLogisticsDestination
        carSourcePlaceItem.viewModelSelectedLogisticsDestinationIndex = selectedLogisticsDestinationIndex
        this.updateTheLogisticsDestination(selectedLogisticsDestination, carSourcePlaceItem, carSourceItem)
        return carSourceItem
      }
    }
    carSourcePlaceItem.viewModelSelectedLogisticsDestination = null
    carSourcePlaceItem.viewModelSelectedLogisticsDestinationIndex = -1
    this.updateTheLogisticsDestination(null, carSourcePlaceItem, carSourceItem)
    return carSourceItem
  },
  updateTheLogisticsDestination(logisticsDestination, carSourcePlaceItem, carSourceItem) {
    if (logisticsDestination) {
      carSourcePlaceItem.viewModelQuoted = util.quotedPriceWithDownPriceByFlag(logisticsDestination.discount, this.data.carModelsInfo.officialPrice, this.isShowDownPrice)
      carSourcePlaceItem.viewModelQuoted.price = logisticsDestination.totalPrice
      carSourcePlaceItem.viewModelQuoted.priceDesc = util.priceStringWithUnit(logisticsDestination.totalPrice)
      if (logisticsDestination.expectedDeliveryDays) {
        carSourcePlaceItem.viewModelExpectedDeliveryDaysDesc = '约' + logisticsDestination.expectedDeliveryDays + '天'
      } else {
        carSourcePlaceItem.viewModelExpectedDeliveryDaysDesc = ''
      }
      carSourcePlaceItem.viewModelSelectedLogisticsDestination.viewModelLogisticsFeeDesc = util.priceStringWithUnit(logisticsDestination.logisticsFee)
    } else {
      carSourcePlaceItem.viewModelQuoted = util.quotedPriceWithDownPriceByFlag(carSourcePlaceItem.discount, this.data.carModelsInfo.officialPrice, this.isShowDownPrice)
      carSourcePlaceItem.viewModelQuoted.price = carSourcePlaceItem.totalPrice
      carSourcePlaceItem.viewModelQuoted.priceDesc = util.priceStringWithUnit(carSourcePlaceItem.totalPrice)
      carSourcePlaceItem.viewModelExpectedDeliveryDaysDesc = null
    }

    // 如果货源不是一口价
    if (!carSourceItem.supplierSelfSupport && !carSourcePlaceItem.priceFixed && carSourcePlaceItem.viewModelQuoted.price === this.data.carModelsInfo.officialPrice) {
      carSourcePlaceItem.viewModelEquelWithOfficialPrice = true
    } else {
      carSourcePlaceItem.viewModelEquelWithOfficialPrice = false
    }
  },
  updateTheCarSourcePlace(carSourcePlaceItem, carSourceItem) {
    const tags = []
    if (carSourcePlaceItem.priceFixed) {
      tags.push('一口价')
    }
    if (carSourceItem.supplierSelfSupport) {
      tags.push('垫款发车')
    }
    carSourcePlaceItem.viewModelTags = tags
    this.updateTheLogisticsDestination(carSourcePlaceItem.viewModelSelectedLogisticsDestination, carSourcePlaceItem, carSourceItem)
  },
  /**
   * 由于更新一个二维数组中的 carSource 对象暂时没有更好的办法，所以只能通过全量
   * 更新 this.data 中的二维数组才能达到目的
   *
   * @param carSkuIndex        sku 列表索引
   * @param carSourceIndex  车源列表索引
   * @param carSourceItem       车源实体
   */
  updateTheCarSource(carSkuIndex, carSourceIndex, carSourceItem) {
    // 更新发布时间
    const publishDate = util.dateCompatibility(carSourceItem.publishDate)
    carSourceItem.viewModelPublishDateDesc = util.dateDiff(publishDate)

    this.updateTheCarSourcePlace(carSourceItem.viewModelSelectedCarSourcePlace, carSourceItem)

    let actualCarSourceItem
    if (carSourceItem) {
      actualCarSourceItem = carSourceItem
    } else {
      actualCarSourceItem = this.data.carSourcesBySkuInSpuList[carSkuIndex].carSourcesList[carSourceIndex]
    }
    this.data.carSourcesBySkuInSpuList[carSkuIndex].carSourcesList[carSourceIndex] = actualCarSourceItem
  },
  /**
   * 更新 sku 分区数据
   * @param skuIndex
   */
  updateTheCarSku(carSkuIndex, carSkuItem) {
    let actualCarSkuItem
    if (carSkuItem) {
      actualCarSkuItem = carSkuItem
    } else {
      const list = this.data.carSourcesBySkuInSpuList
      actualCarSkuItem = list[carSkuIndex]
    }

    this.preprocessCarSourcesBySkuInSpuItem(actualCarSkuItem)
  },
  /**
   * 页面数据主入口，由于该页面有筛选条件，所以页面的初始数据也必须走这个接口以保证初始的筛选条件无误
   * @param object
   */
  updateSearchResult(object) {
    wx.showToast({
      title: '正在处理',
      icon: 'loading',
      mask: true
    })

    const selectedExternalCarColorName = this.data.selectedExternalCarColorName
    const selectedInternalCarColorName = this.data.selectedInternalCarColorName
    const selectedSourcePublishDate = object.sourcePublishDate || this.getIdWithFiltersIndex(0)
    const selectedLogistics = object.logistics || this.getIdWithFiltersIndex(1)

    console.log('selected color: ex:' + selectedExternalCarColorName + 'in:' + selectedInternalCarColorName)
    console.log('selected source publish date:' + selectedSourcePublishDate)
    console.log('selected logistics:' + selectedLogistics)

    const selectedSourcePublishDateFilter = function (filterId, carSourceItem) {
      const now = new Date().getTime()
      const publishDate = util.dateCompatibility(carSourceItem.publishDate)
      const diff = now - publishDate

      const minute = 1000 * 60
      const hour = minute * 60

      const _hour = diff / hour

      if (filterId === '-1') {
        return true
      } else {
        return _hour <= parseInt(filterId)
      }
      return true
    }

    const selectedLogisticsFilter = function (filterId, carSourceItem) {
      if (filterId === '-1') {
        carSourceItem.viewModelLowest = carSourceItem.lowest
        carSourceItem.viewModelFastest = carSourceItem.fastest
        carSourceItem.viewModelOthers = carSourceItem.others
        return true
      } else if (filterId === '0') {
        if (carSourceItem.lowest && carSourceItem.lowest.logisticsFree) {
          carSourceItem.viewModelLowest = carSourceItem.lowest
        } else {
          carSourceItem.viewModelLowest = null
        }

        if (carSourceItem.fastest && carSourceItem.fastest.logisticsFree) {
          carSourceItem.viewModelFastest = carSourceItem.fastest
        } else {
          carSourceItem.viewModelFastest = null
        }

        if (carSourceItem.others && carSourceItem.others.length > 0) {
          const othersWithLogisticsFree = []
          for (let carSourcePlaceItem of carSourceItem.others) {
            if (carSourcePlaceItem.logisticsFree) {
              othersWithLogisticsFree.push(carSourcePlaceItem)
            }
          }
          if (othersWithLogisticsFree.length > 0) {
            carSourceItem.viewModelOthers = othersWithLogisticsFree
          } else {
            carSourceItem.viewModelOthers = null
          }
        } else {
          carSourceItem.viewModelOthers = null
        }
        return (carSourceItem.viewModelLowest || carSourceItem.viewModelfastest || carSourceItem.viewModelOthers)
      }
      return true
    }

    const selectedColorFilter = function (externalColorName,
      internalColorName,
      carSourcesBySkuItem) {
      if (externalColorName === '全部') {
        return true
      } else {
        if (externalColorName === carSourcesBySkuItem.carSku.externalColorName) {
          if (internalColorName === '全部') {
            return true
          } else {
            if (internalColorName === carSourcesBySkuItem.carSku.internalColorName) {
              return true
            } else {
              return false
            }
          }
        } else {
          return false
        }
      }
    }

    const selectedExternalColorFilter = function (externalColorName,
      carSourcesBySkuItem) {
      if (externalColorName === '全部') {
        return true
      } else {
        if (carSourcesBySkuItem.carSku.externalColorName === externalColorName) {
          return true
        } else {
          return false
        }
      }
    }

    const selectedInternalColorFilter = function (internalColorName,
      carSourceItem) {
      if (internalColorName === '全部') {
        return true
      } else {
        if (carSourceItem.internalColor === internalColorName) {
          return true
        } else {
          return false
        }
      }
    }

    const carSourcesBySkuInSpuList = []
    Object.assign(carSourcesBySkuInSpuList, this.cacheCarSourcesBySkuInSpuList)
    console.log(carSourcesBySkuInSpuList)
    const newCarSourcesBySkuInSpuList = []
    for (let carSourcesBySkuItem of carSourcesBySkuInSpuList) {
      const newCarSourcesList = []
      if (selectedExternalColorFilter(selectedExternalCarColorName, carSourcesBySkuItem)) {
        for (let carSourceItem of carSourcesBySkuItem.carSourcesList) {
          if (selectedLogisticsFilter(selectedLogistics, carSourceItem) &&
            selectedSourcePublishDateFilter(selectedSourcePublishDate, carSourceItem) &&
            selectedInternalColorFilter(selectedInternalCarColorName, carSourceItem)) {
            newCarSourcesList.push(carSourceItem)
          }
        }

        if (newCarSourcesList.length) {
          // 如果有值
          const newCarSourcesBySkuItem = {}
          newCarSourcesBySkuItem.carSourcesList = newCarSourcesList
          newCarSourcesBySkuItem.carSku = {}

          Object.assign(newCarSourcesBySkuItem.carSku, carSourcesBySkuItem.carSku)

          this.preprocessCarSourcesBySkuInSpuItem(newCarSourcesBySkuItem)

          newCarSourcesBySkuInSpuList.push(newCarSourcesBySkuItem)
        }
      }
    }

    setTimeout(function () {
      wx.hideToast()
    }, 300)
    console.log(newCarSourcesBySkuInSpuList)
    return newCarSourcesBySkuInSpuList
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
  getIdWithFiltersIndex(index) {
    const selectedIndex = this.data.scrollFiltersSelectedIndexes[index]
    if (selectedIndex === -1) {
      return '-1'
    } else {
      return this.data.scrollFilters[index].items[selectedIndex].id
    }
  },
  actionContact(spuId, skuItemIndex, carSourceItemIndex, carSourceItem, contact) {
    // MARK: 注意区分呢 supplier.contact 和 carSource.contact 两个概念
    const phoneNumber = carSourceItem.contact || contact
    const that = this

    /**
     * 上报
     */
    that.pushCallRecord(carSourceItem);

    wx.makePhoneCall({
      phoneNumber: phoneNumber,
      success: function (res) {

        /**
         * 1.4.0 埋点
         * davidfu
         */
        if (carSourceItem.supplierSelfSupport) {
          that.data.pageParameters.carSourceId = carSourceItem.itemId
        } else {
          that.data.pageParameters.carSourceId = carSourceItem.id
        }
        that.data.pageParameters.supplierSelfSupport = carSourceItem.supplierSelfSupport
        that.data.pageParameters.supplierId = carSourceItem.supplier.id
        const event = {
          eventAction: 'click',
          eventLabel: '拨打供货方电话'
        }
        $wuxTrack.push(event)
      }
    })
  },
  actionBookCar(carModelsInfo, skuItem, carSourceItem) {
    const that = this

    $wuxDialog.open({
      title: '提示',
      content: '发起定车后， 将会有工作人员与您联系',
      buttons: [{
          text: '发起订车',
          type: 'weui-dialog__btn_primary',
          onTap: function () {
            const spec = skuItem.carSku.externalColorName + '/' + skuItem.carSku.internalColorName
            const itemPrice = carSourceItem.viewModelSelectedCarSourcePlace.viewModelQuoted.price

            app.saasService.requestBookCar(carModelsInfo.carModelName, spec, itemPrice, 1, {
              success(res) {
                wx.showModal({
                  title: '提示',
                  content: '提交成功，请保持通话畅通',
                  success: function (res) {
                    if (res.confirm) {}
                  }
                })
              },
              fail(err) {
                wx.showModal({
                  title: '提示',
                  content: err.alertMessage,
                  success: function (res) {
                    if (res.confirm) {}
                  }
                })
              },
              complete() {

              }
            })
          }
        },
        {
          text: '取消',
          onTap: function () {

          }
        }
      ]
    })
  },
  handlerAmendCarFacade(e) {
    const that = this
    const selectedFilterIndex = e.currentTarget.dataset.selectedFilterIndex
    if (selectedFilterIndex !== this.data.selectedFilterIndex) {
      // 父级
      let firstFilters = []
      if (selectedFilterIndex == 0) {
        firstFilters.push({
          id: '-1',
          name: '全部'
        })
      }
      const dropDownFiltersData = firstFilters.concat(this.data.dropDownFilters[selectedFilterIndex].items)

      // 子级
      let subFirstFilters = []
      subFirstFilters.push({
        id: '-1',
        name: '全部'
      })

      let dropDownSubFiltersData
      if (this.data.selectedExternalCarColorIndex != -1) {
        const filter = this.data.dropDownFilters[selectedFilterIndex].items[this.data.selectedExternalCarColorIndex]
        if (filter.items) {
          dropDownSubFiltersData = subFirstFilters.concat(filter.items)
        }
      } else {
        dropDownSubFiltersData = subFirstFilters
      }

      that.setData({
        showRmendCarFacade: true,
        selectedFilterIndex: selectedFilterIndex,
        dropDownFiltersData: dropDownFiltersData,
        dropDownSubFiltersData: dropDownSubFiltersData
      })
    } else {
      if (this.data.showRmendCarFacade) {
        this.handlerRemoveRmendCarFacade()
      } else {
        this.setData({
          showRmendCarFacade: true
        })
      }
    }
  },
  handlerRemoveRmendCarFacade() {
    const carSourcesBySkuInSpuList = this.updateSearchResult({
      color: -1
    })
    this.carSourcesBySkuInSpuList = carSourcesBySkuInSpuList

    this.setData({
      searchnodata: carSourcesBySkuInSpuList.length !== 0 ? 'data' : 'none',
      carSourcesBySkuInSpuList: carSourcesBySkuInSpuList,
      showRmendCarFacade: false
    })

    this.selectCarSku(-1, carSourcesBySkuInSpuList)
    this.hideFold(null, -1, this.data.selectedSectionId)
  },
  /**
   * 搜索入口方法，收集所有的搜索条件，合并后得出结果
   * @param e
   */
  handlerSelectItem(e) {
    const filterItem = e.currentTarget.dataset.filterItem
    const superFilterItem = e.currentTarget.dataset.superFilterItem
    const filterIndex = e.currentTarget.dataset.filterIndex
    const filterPosition = e.currentTarget.dataset.filterPosition
    const superFilterPosition = e.currentTarget.dataset.superFilterPosition

    const that = this
    if (filterPosition === 'left') {
      // 子级
      let subFirstFilters = []
      subFirstFilters.push({
        id: '-1',
        name: '全部'
      })

      let dropDownSubFiltersData
      if (filterIndex != -1) {
        if (filterItem.items) {
          dropDownSubFiltersData = subFirstFilters.concat(filterItem.items)
        } else {
          dropDownSubFiltersData = subFirstFilters
        }
      } else {
        dropDownSubFiltersData = subFirstFilters
      }

      this.setData({
        selectedExternalCarColorIndex: filterIndex,
        selectedExternalCarColorId: filterItem.id,
        selectedExternalCarColorName: filterItem.name,
        selectedInternalCarColorIndex: '-1',
        selectedInternalCarColorId: '-1',
        selectedInternalCarColorName: '全部',
        dropDownSubFiltersData: dropDownSubFiltersData
      })
    } else if (filterPosition === 'right') {
      this.setData({
        selectedInternalCarColorIndex: filterIndex,
        selectedInternalCarColorId: filterItem.id,
        selectedInternalCarColorName: filterItem.name
      })

      that.handlerRemoveRmendCarFacade()
    }
  },
  /**
   * 横向滚动栏筛选项目点击行为
   * @param e
   */
  handlerFilterSelected(e) {
    const that = this

    const scrollFilterIndex = e.currentTarget.dataset.scrollFilterIndex
    const scrollFilterItem = e.currentTarget.dataset.scrollFilterItem
    const filterIndex = e.currentTarget.dataset.filterIndex
    const filterItem = e.currentTarget.dataset.filterItem

    let selectedFilterId = filterItem.id
    const scrollFiltersSelectedIndexes = this.data.scrollFiltersSelectedIndexes
    const selectedFilterIndex = scrollFiltersSelectedIndexes[scrollFilterIndex]

    if (selectedFilterIndex === filterIndex) {
      scrollFiltersSelectedIndexes[scrollFilterIndex] = -1
      // 如果是点击已经选中的按钮， 则直接进入全部选择
      selectedFilterId = '-1'
    } else {
      scrollFiltersSelectedIndexes[scrollFilterIndex] = filterIndex
    }

    this.setData({
      scrollFiltersSelectedIndexes: scrollFiltersSelectedIndexes
    })

    let newCarSourcesBySkuInSpuList
    if (scrollFilterIndex == 0) {
      // 车源发布时间
      newCarSourcesBySkuInSpuList = that.updateSearchResult({
        sourcePublishDate: selectedFilterId
      })
    } else if (scrollFilterIndex == 1) {
      // 是否包邮
      newCarSourcesBySkuInSpuList = that.updateSearchResult({
        logistics: selectedFilterId
      })
    }

    this.setData({
      searchnodata: newCarSourcesBySkuInSpuList.length !== 0 ? 'data' : 'none',
      carSourcesBySkuInSpuList: newCarSourcesBySkuInSpuList
    })
    this.selectCarSku(-1)
    this.hideFold(null, -1, this.data.selectedSectionId)
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
        spuId: this.data.carModelsInfo.carModelId,
        externalColorName: section.carSku.externalColorName
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
  handlerContact(e) {
    const skuItemIndex = e.currentTarget.dataset.skuIndex
    const carSourceItemIndex = e.currentTarget.dataset.carSourceIndex

    const carModelsInfo = this.data.carModelsInfo
    const skuItem = this.data.carSourcesBySkuInSpuList[skuItemIndex]
    const carSourceItem = skuItem.carSourcesList[carSourceItemIndex]
    const contact = carSourceItem.supplier.contact

    this.actionContact(carModelsInfo.carModelId, skuItemIndex, carSourceItemIndex, carSourceItem, contact)
  },
  handlerCarSourceMore(e) {
    console.log('more')
    const skuItemIndex = e.currentTarget.dataset.skuIndex
    const carSourceItemIndex = e.currentTarget.dataset.carSourceIndex

    const skuItem = this.data.carSourcesBySkuInSpuList[skuItemIndex]
    const carSourceItem = skuItem.carSourcesList[carSourceItemIndex]

    carSourceItem.viewModelSelectedTab = -1

    this.selectCarSourcePlace(carSourceItem.viewModelTabMore[0], carSourceItem)
    this.updateTheCarSource(skuItemIndex, carSourceItemIndex, carSourceItem)

    this.setData({
      [`carSourcesBySkuInSpuList[${skuItemIndex}].viewModelCarSourcesList[${carSourceItemIndex}]`]: carSourceItem
    })
  },
  handlerCarSourceTabClick(e) {
    console.log('tab')
    console.log(e)
    const tabItem = e.currentTarget.dataset.tabItem
    const tabItemIndex = e.currentTarget.dataset.tabItemIndex

    const skuItemIndex = e.currentTarget.dataset.skuIndex
    const carSourceItemIndex = e.currentTarget.dataset.carSourceIndex

    const skuItem = this.data.carSourcesBySkuInSpuList[skuItemIndex]
    const carSourceItem = skuItem.carSourcesList[carSourceItemIndex]

    carSourceItem.viewModelSelectedTab = tabItemIndex

    this.selectCarSourcePlace(tabItem.value, carSourceItem)
    this.updateTheCarSource(skuItemIndex, carSourceItemIndex, carSourceItem)

    this.setData({
      [`carSourcesBySkuInSpuList[${skuItemIndex}].viewModelCarSourcesList[${carSourceItemIndex}]`]: carSourceItem
    })
  },
  /**
   * 点击供货列表项目得到的供货详情
   * @param e
   */
  handlerCarSourceDetail(e) {
    const that = this

    const skuItemIndex = e.currentTarget.dataset.skuIndex
    const carSourceItemIndex = e.currentTarget.dataset.carSourceIndex
    const carSourcePlaceItem = e.currentTarget.dataset.carSourcePlace

    const carModelsInfo = this.data.carModelsInfo
    const skuItem = this.data.carSourcesBySkuInSpuList[skuItemIndex]
    const carSourceItem = skuItem.carSourcesList[carSourceItemIndex]
    const contact = carSourceItem.supplier.contact

    /// 判断有没有需要设置的 car source place， 没有则使用默认设置好的
    if (carSourcePlaceItem) {
      this.selectCarSourcePlace(carSourcePlaceItem, carSourceItem)
      this.updateTheCarSource(skuItemIndex, carSourceItemIndex, carSourceItem)
    }

    /**
     * 1.4.0 埋点
     * 用户选择外饰分区颜色
     * davidfu
     */
    if (carSourceItem.supplierSelfSupport) {
      this.data.pageParameters.carSourceId = carSourceItem.itemId
    } else {
      this.data.pageParameters.carSourceId = carSourceItem.id
    }
    this.data.pageParameters.supplierSelfSupport = carSourceItem.supplierSelfSupport
    const event = {
      eventAction: 'click',
      eventLabel: `车源详情`
    }
    $wuxTrack.push(event)

    $wuxCarSourceDetailDialog.open({
      carModel: this.data.carModelsInfo,
      carSourceItem: carSourceItem,
      bookCar: function (updateCarSourceItem) {
        that.actionBookCar(carModelsInfo, skuItem, updateCarSourceItem)
      },
      contact: function () {
        that.actionContact(carModelsInfo.carModelId, skuItemIndex, carSourceItemIndex, carSourceItem, contact)
      },
      selectLogisticsBlock: function (e) {
        console.log(e)
        let carSource = e.currentTarget.dataset.carSource
        const logisticsIndex = e.currentTarget.dataset.logisticsIndex
        const logistics = e.currentTarget.dataset.logistics

        if (logisticsIndex != carSource.viewModelSelectedCarSourcePlace.viewModelSelectedLogisticsDestinationIndex) {
          carSource = that.selectLogisticsDestinationForCarSourcePlaceOfCarSource(carSource, carSource.viewModelSelectedCarSourcePlace, logisticsIndex)
          that.updateTheCarSource(skuItemIndex, carSourceItemIndex, carSource)
        } else {
          // 如果索引相同， 不作任何事情
        }
        return carSource
      },
      close: function () {
        that.setData({
          [`carSourcesBySkuInSpuList[${skuItemIndex}].viewMdoelCarSourcesList[${carSourceItemIndex}]`]: carSourceItem
        })
      },
      reportError: function (e) {
        console.log('report error')
      }
    })
  },
  handlerCreateQuoted(e) {
    const skuItemIndex = e.currentTarget.dataset.skuIndex

    const skuItem = this.data.carSourcesBySkuInSpuList[skuItemIndex]
    console.log(this.data.carModelsInfo)
    const carModelsInfoKeyValueString = util.urlEncodeValueForKey('carModelsInfo', this.data.carModelsInfo)
    const carSkuInfoKeyValueString = util.urlEncodeValueForKey('carSkuInfo', skuItem.carSku)

    wx.navigateTo({
      url: '/pages/quote/quotationCreate/quotationCreate?' + carModelsInfoKeyValueString + '&' + carSkuInfoKeyValueString
    })
  },
  onTouchMoveWithCatch() {
    // 拦截触摸移动事件， 阻止透传
  },
  pushCallRecord(curItem) {
    //拨打电话时,用户信息，行情上报
    let updata= {
      "userId":app.userService.auth.userId,
      "userPhone":app.userService.mobile,
      "supplierId":curItem.supplier.id,
      "supplierPhone":curItem.supplier.contact,
      "messageResultId":curItem.id,
      "contactPhone": curItem.contact || curItem.supplier.contact
    }

    app.saasService.pushCallRecord({data:updata});

  }
})
