import {
  $wuxDialog,
  $wuxInputNumberDialog
} from '../../components/wux'
import $wuxCarSourceDetailDialog from './carSourceDetail/carSourceDetail'
import $wuxReliableDialog from './reliableDialog/reliableDialog'

import util from '../../utils/util.js'

let app = getApp()

Page({
  data: {
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
    cacheCarSourcesBySkuInSpuList: [],
    selectedSectionIndex: -1,
    selectedSectionId: '0',
    app: app,
    showDetailTitle: false,
    hasOverLayDropdown: false
  },
  onLoad (options) {
    console.log(options)

    const that = this

    const carModelsInfo = util.urlDecodeValueForKeyFromOptions('carModelsInfo', options)

    this.setData({
      carModelsInfo: carModelsInfo
    })

    try {
      const res = wx.getSystemInfoSync()
      this.pixelRatio = res.pixelRatio
      this.apHeight = 16
      this.offsetTop = 80
      this.setData({windowHeight: res.windowHeight + 'px'})
    } catch (e) {

    }

    app.saasService.requestCarSourcesList(carModelsInfo.carModelId, {
      success: function (res) {

        let filters = res.filters
        let dropDownFilters = []
        let scrollFilters = []
        let scrollFiltersSelectedIndexes = []

        let sourcePublishDateFilterId
        for (let i = 0; i < filters.length; i++) {
          let filter = filters[i]
          // FIXME: 这里的问题是使用了不严谨的方法获取数据
          if (i === 0) {
            dropDownFilters.push(filter)
          } else if (i === 1) {
            // 车源发布信息， 默认为 24小时
            scrollFilters.push(filter)
            scrollFiltersSelectedIndexes.push(-1)
            if (filter.items && filter.items.length) {
              sourcePublishDateFilterId = filter.items[1].id
            }
          } else {
            scrollFilters.push(filter)
            scrollFiltersSelectedIndexes.push(-1)
          }
        }

        const carSourcesBySkuInSpuList = res.carSourcesBySkuInSpuList

        that.setData({
          nodata: carSourcesBySkuInSpuList.length !== 0 ? 'data' : 'none',
          cacheCarSourcesBySkuInSpuList: carSourcesBySkuInSpuList,
          filters: filters,
          dropDownFilters: dropDownFilters,
          scrollFilters: scrollFilters,
          scrollFiltersSelectedIndexes: scrollFiltersSelectedIndexes
        })

        const newCarSourcesBySkuInSpuList = that.updateSearchResult({})
        that.selectCarSku(-1, newCarSourcesBySkuInSpuList)
        that.setData({
          searchnodata: newCarSourcesBySkuInSpuList.length !== 0 ? 'data' : 'none',
          carSourcesBySkuInSpuList: newCarSourcesBySkuInSpuList,
          selectedSectionIndex: -1,
          selectedSectionId: '0'
        })
      }
    })
  },
  onShow () {
    const that = this
    const valueString = wx.getStorageSync('recent_contact')
    if (valueString && typeof valueString === 'string') {
      const value = JSON.parse(valueString)

      const spuId = value.spuId
      const carSource = value.carSource
      const skuIndex = value.skuIndex
      const carSourceIndex = value.carSourceIndex

      if (typeof value === 'object') {
        const now = new Date()
        const contactDate = new Date(value.dateString)
        if (now - contactDate < 60 * 60 * 1000 * 24) {
          this.showReliableDialog(spuId, skuIndex, carSource, carSourceIndex)
        } else {
          // 24 小时以外
        }

        try {
          wx.removeStorageSync('recent_contact')
        } catch (e) {
          wx.removeStorage({
            key: 'recent_contact',
            success: function (res) {
              // success
            },
            fail: function () {
              // fail
            },
            complete: function () {
              // complete
            }
          })
        }
      }
    }
  },
  handlerScroll (e) {
    const that = this
    if (e.detail) {
      console.log(e.detail)
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
  showReliableDialog (spuId, skuItemIndex, carSourceItem, carSourceItemIndex) {
    // 24 小时以内， 弹框走起

    const that = this
    const hasBeenReliableByUser = carSourceItem.hasBeenReliableByUser
    $wuxReliableDialog.open({
      spuId: spuId,
      carSource: carSourceItem,
      close: (updatedCarSource) => {
        app.saasService.requestReliable(spuId, carSourceItem.id, updatedCarSource.supplier.id, hasBeenReliableByUser, updatedCarSource.hasBeenReliableByUser, {
          success: function () {
          },
          fail: function () {
          },
          complete: function () {
          }
        })
        that.updateTheCarSource(skuItemIndex, carSourceItemIndex, updatedCarSource)
        that.setData({
          [`carSourcesBySkuInSpuList[${skuItemIndex}].carSourcesList[${carSourceItemIndex}]`]: updatedCarSource
        })
      }
    })
  },
  showFold (a, b, c) {
    const that = this
    this.setData({
      [`carSourcesBySkuInSpuList[${b}]`]: a,
      selectedSectionIndex: b
    })

    setTimeout(function () {
      that.setData({
        selectedSectionId: c
      })
    }, 100)
  },
  hideFold (a, b, c) {
    this.setData({
      selectedSectionIndex: -1
    })
  },
  /**
   * 预处理车源集合对象
   * @param carSourcesBySkuInSpuItem
   */
  preprocessCarSourcesBySkuInSpuItem (carSourcesBySkuInSpuItem) {
    let tags = []
    for (let carSourceItem of carSourcesBySkuInSpuItem.carSourcesList) {
      this.processCarSourceItem(carSourceItem)
      tags = tags.concat(carSourceItem.viewModelTags)
    }
    // 合并不同的标签集合
    const tagsSet = new Set(tags)

    // 分别获取自营和三方货源中的第一个
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

    if (lowestThirdCarSourceItem && lowestSelfPlatformCarSourceItem) {
      carSourcesBySkuInSpuItem.carSku.viewModelLowestCarSource = lowestSelfPlatformCarSourceItem.lowestPrice > lowestThirdCarSourceItem.lowestPrice ? lowestThirdCarSourceItem : lowestSelfPlatformCarSourceItem
    } else if (lowestThirdCarSourceItem) {
      carSourcesBySkuInSpuItem.carSku.viewModelLowestCarSource = lowestThirdCarSourceItem
    } else if (lowestSelfPlatformCarSourceItem) {
      carSourcesBySkuInSpuItem.carSku.viewModelLowestCarSource = lowestSelfPlatformCarSourceItem
    }

    carSourcesBySkuInSpuItem.carSku.viewModelTags = [...tagsSet]
    carSourcesBySkuInSpuItem.carSku.viewModelCarSourceCount = carSourcesBySkuInSpuItem.carSourcesList.length

    carSourcesBySkuInSpuItem.carSku.viewModelSupplierSelfSupport = carSourcesBySkuInSpuItem.carSku.viewModelLowestCarSource.supplierSelfSupport
    carSourcesBySkuInSpuItem.carSku.viewModelLowestCarSourcePrice = carSourcesBySkuInSpuItem.carSku.viewModelLowestCarSource.lowestPrice
    carSourcesBySkuInSpuItem.carSku.viewModelLowestCarSourcePriceDesc = util.priceStringWithUnit(carSourcesBySkuInSpuItem.carSku.viewModelLowestCarSourcePrice)
    carSourcesBySkuInSpuItem.carSku.viewModelLowestCarSourceDiscount = util.downPrice(carSourcesBySkuInSpuItem.carSku.viewModelLowestCarSourcePrice, this.data.carModelsInfo.officialPrice)
    carSourcesBySkuInSpuItem.carSku.viewModelLowestCarSourceDiscountDesc = util.priceStringWithUnit(carSourcesBySkuInSpuItem.carSku.viewModelLowestCarSourceDiscount)
  },
  /**
   * 处理车源对象
   * @param carSourceItem
   */
  processCarSourceItem (carSourceItem) {
    let carSourcePlaceArray = []
    // 价格最低
    const carSourcePlaceLowest = carSourceItem.lowest
    if (carSourcePlaceLowest) {
      // FIXME: 初始化状态下，无法得知某一货源地下的最低报价就是从第一个物流方案得来的，很可能压根就没有物流方案
      carSourcePlaceArray.push(carSourcePlaceLowest)
      this.selectLogisticsDestinationForCarSourcePlaceOfCarSource(carSourceItem, carSourcePlaceLowest, 0)
    }

    // 到货快
    const carSourcePlaceFastest = carSourceItem.fastest
    if (carSourcePlaceFastest) {
      carSourcePlaceArray.push(carSourcePlaceFastest)
      this.selectLogisticsDestinationForCarSourcePlaceOfCarSource(carSourceItem, carSourcePlaceFastest, 0)
    }

    // 其他
    const moreArray = carSourceItem.others
    if (moreArray) {
      carSourcePlaceArray = carSourcePlaceArray.concat(moreArray)
    }

    // 更多项目
    if (carSourceItem.others && carSourceItem.others.length > 0) {
      for (let carSourcePlaceItem of carSourceItem.others) {
        this.selectLogisticsDestinationForCarSourcePlaceOfCarSource(carSourceItem, carSourcePlaceItem, 0)
      }
    }

    /**
     * 判断各种奇葩情况下每个货源的展示情况
     */
    let selectedCarSourcePlace = null
    if (carSourcePlaceFastest && carSourcePlaceLowest) {
      // 价格低和到货快 同时存在
      if (carSourceItem.others && carSourceItem.others.length > 0) {
        carSourceItem.viewModelTabs = [
          {name: '价格低', value: carSourcePlaceLowest},
          {name: '到货快', value: carSourcePlaceFastest}
        ]
        carSourceItem.viewModelTabMore = carSourceItem.others
        selectedCarSourcePlace = carSourcePlaceLowest
      } else {
        carSourceItem.viewModelTabs = [
          {name: '价格低', value: carSourcePlaceLowest},
          {name: '到货快', value: carSourcePlaceFastest}
        ]
        carSourceItem.viewModelTabMore = null
        selectedCarSourcePlace = carSourcePlaceLowest
      }
    } else if (!carSourcePlaceFastest && !carSourcePlaceLowest) {
      // 价格低和到货快 同时不存在
      if (carSourceItem.others && carSourceItem.others.length === 1) {
        carSourceItem.viewModelTabs = null
        carSourceItem.viewModelTabMore = null
        selectedCarSourcePlace = carSourceItem.others[0]
      } else {
        carSourceItem.viewModelTabs = [
          {name: '推荐', value: carSourceItem.others[0]}
        ]
        carSourceItem.viewModelTabMore = carSourceItem.others.shift()
        selectedCarSourcePlace = carSourceItem.others[0]
      }
    } else if (carSourcePlaceFastest && !carSourcePlaceLowest) {
      // 价格低不存在， 到货快存在
      if (carSourceItem.others && carSourceItem.others.length > 0) {
        carSourceItem.viewModelTabs = [
          {name: '到货快', value: carSourcePlaceFastest}
        ]
        carSourceItem.viewModelTabMore = carSourceItem.others
        selectedCarSourcePlace = carSourcePlaceFastest
      } else {
        carSourceItem.viewModelTabs = [
          {name: '到货快', value: carSourcePlaceFastest}
        ]
        carSourceItem.viewModelTabMore = null
        selectedCarSourcePlace = carSourcePlaceFastest
      }
    } else if (!carSourcePlaceFastest && carSourcePlaceLowest) {
      // 价格低存在， 到货快不存在
      if (carSourceItem.others && carSourceItem.others.length > 0) {
        carSourceItem.viewModelTabs = [
          {name: '价格低', value: carSourcePlaceLowest}
        ]
        carSourceItem.viewModelTabMore = carSourceItem.others
        selectedCarSourcePlace = carSourcePlaceLowest
      } else {
        carSourceItem.viewModelTabs = [
          {name: '价格低', value: carSourcePlaceLowest}
        ]
        carSourceItem.viewModelTabMore = null
        selectedCarSourcePlace = carSourcePlaceLowest
      }
    }

    carSourceItem.viewModelSelectedTab = 0
    this.selectCarSourcePlace(selectedCarSourcePlace, carSourceItem)

    // 更新发布时间
    const publishDate = util.dateCompatibility(carSourceItem.publishDate)
    carSourceItem.viewModelPublishDateDesc = util.dateDiff(publishDate)

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
  processCarSourcePlaceItem (carSourcePlaceItem, carSourceItem) {
    this.updateTheCarSourcePlace(carSourcePlaceItem, carSourceItem)
  },
  selectCarSku (selectedCarSkuIndex) {
    let section = null
    if (selectedCarSkuIndex === -1) {
    } else {
      section = this.data.carSourcesBySkuInSpuList[selectedCarSkuIndex]
      this.updateTheCarSku(selectedCarSkuIndex, section)
    }
    return section
  },
  /**
   * 选择货源下某个货源地
   * @param carSourceItem
   * @param
   */
  selectCarSourcePlace (selectedCarSourcePlaceItem, carSourceItem) {
    carSourceItem.viewModelSelectedCarSourcePlace = selectedCarSourcePlaceItem
    return carSourceItem
  },
  /**
   * 选择货源下某个货源地下的某一个物流方案
   * @param carSourcePlaceItem
   * @param selectedLogisticsDestinationIndex
   */
  selectLogisticsDestinationForCarSourcePlaceOfCarSource (carSourceItem,
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
  updateTheLogisticsDestination (logisticsDestination, carSourcePlaceItem, carSourceItem) {
    if (logisticsDestination) {
      carSourcePlaceItem.viewModelPrice = logisticsDestination.totalPrice
      carSourcePlaceItem.viewModelPriceDesc = util.priceStringWithUnit(logisticsDestination.totalPrice)
      carSourcePlaceItem.viewModelDiscount = logisticsDestination.discount
      carSourcePlaceItem.viewModelDiscountDesc = util.priceStringWithUnit(logisticsDestination.discount)
      if (logisticsDestination.expectedDeliveryDays) {
        carSourcePlaceItem.viewModelExpectedDeliveryDaysDesc = '约' + logisticsDestination.expectedDeliveryDays + '天'
      } else {
        carSourcePlaceItem.viewModelExpectedDeliveryDaysDesc = ''
      }
      carSourcePlaceItem.viewModelSelectedLogisticsDestination.viewModelLogisticsFeeDesc = util.priceStringWithUnit(logisticsDestination.logisticsFee)
    } else {
      carSourcePlaceItem.viewModelPrice = carSourcePlaceItem.totalPrice
      carSourcePlaceItem.viewModelPriceDesc = util.priceStringWithUnit(carSourcePlaceItem.totalPrice)
      carSourcePlaceItem.viewModelDiscount = carSourcePlaceItem.discount
      carSourcePlaceItem.viewModelDiscountDesc = util.priceStringWithUnit(carSourcePlaceItem.discount)
      carSourcePlaceItem.viewModelExpectedDeliveryDaysDesc = null
    }

    // 如果货源不是一口价
    if (!carSourceItem.supplierSelfSupport && !carSourcePlaceItem.priceFixed && carSourcePlaceItem.viewModelPrice === this.data.carModelsInfo.officialPrice) {
      carSourcePlaceItem.viewModelPriceDesc = '价格电议'
      carSourcePlaceItem.viewModelEquelWithOfficialPrice = true
    } else {
      carSourcePlaceItem.viewModelEquelWithOfficialPrice = false
    }
  },
  updateTheCarSourcePlace (carSourcePlaceItem, carSourceItem) {
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
  updateTheCarSource (carSkuIndex, carSourceIndex, carSourceItem) {
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
  updateTheCarSku (carSkuIndex, carSkuItem) {
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
  updateSearchResult (object) {
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
      } else if (filterId === '0') {
        return _hour <= 12
      } else if (filterId === '1') {
        return _hour <= 24
      } else if (filterId === '2') {
        return _hour > 24
      }
      return true
    }

    const selectedLogisticsFilter = function (filterId, carSourceItem) {
      if (filterId === '-1') {
        return true
      } else if (filterId === '0') {
        if (carSourceItem.lowest && carSourceItem.lowest.logisticsFree) {

        } else {
          carSourceItem.lowest = null
        }

        if (carSourceItem.fastest && carSourceItem.fastest.logisticsFree) {

        } else {
          carSourceItem.fastest = null
        }

        if (carSourceItem.others && carSourceItem.others.length > 0) {
          const othersWithLogisticsFree = []
          for (let carSourcePlaceItem of carSourceItem.others) {
            if (carSourcePlaceItem.logisticsFree) {
              othersWithLogisticsFree.push(carSourcePlaceItem)
            }
          }
          if (othersWithLogisticsFree.length > 0) {
            carSourceItem.others = othersWithLogisticsFree
          } else {
            carSourceItem.others = null
          }
        } else {
          carSourceItem.others = null
        }

        console.log(carSourceItem)

        return (carSourceItem.lowest || carSourceItem.fastest || carSourceItem.others)
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

    const carSourcesBySkuInSpuList = this.data.cacheCarSourcesBySkuInSpuList
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
  getIdWithFiltersIndex (index) {
    const selectedIndex = this.data.scrollFiltersSelectedIndexes[index]
    if (selectedIndex === -1) {
      return '-1'
    } else {
      return this.data.scrollFilters[index].items[selectedIndex].id
    }
  },
  actionContact (spuId, skuItemIndex, carSourceItemIndex, carSourceItem, contact) {
    wx.makePhoneCall({
      phoneNumber: contact,
      success: function (res) {
        if (!carSourceItem.supplierSelfSupport) {
          // 非自营的供货商才可以评价靠谱与否
          const now = new Date()
          const value = {
            skuIndex: skuItemIndex,
            carSourceIndex: carSourceItemIndex,
            spuId: spuId,
            carSource: carSourceItem,
            dateString: now.toDateString()
          }
          wx.setStorageSync('recent_contact', JSON.stringify(value))
        }
      }
    })
  },
  actionBookCar (carModelsInfo, skuItem, carSourceItem) {
    const that = this

    $wuxDialog.open({
      title: '提示',
      content: '发起定车后， 将会有工作人员与您联系',
      confirmText: '发起定车',
      confirm: function () {
        const spec = skuItem.carSku.externalColorName + '/' + skuItem.carSku.internalColorName
        const itemPrice = carSourceItem.viewModelSelectedCarSourcePlace.viewModelPrice

        app.saasService.requestBookCar(carModelsInfo.carModelName, spec, itemPrice, 1, {
          success (res) {
            wx.showModal({
              title: '提示',
              content: '提交成功，请保持通话畅通',
              success: function (res) {
                if (res.confirm) {
                }
              }
            })
          },
          fail (err) {
            wx.showModal({
              title: '提示',
              content: err.alertMessage,
              success: function (res) {
                if (res.confirm) {
                }
              }
            })
          },
          complete () {

          }
        })
      },
      cancel: function () {
        // 取消
      }
    })
  },
  handlerAmendCarFacade (e) {
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
  handlerRemoveRmendCarFacade () {
    const carSourcesBySkuInSpuList = this.updateSearchResult({color: -1})
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
  handlerSelectItem (e) {
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
  handlerFilterSelected (e) {
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
      newCarSourcesBySkuInSpuList = that.updateSearchResult({sourcePublishDate: selectedFilterId})
    } else if (scrollFilterIndex == 1) {
      // 是否包邮
      newCarSourcesBySkuInSpuList = that.updateSearchResult({logistics: selectedFilterId})
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
  handlerSelectCarSku (e) {
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
    }
  },
  /**
   * 评价某一个供应商是否靠谱
   * @param e
   */
  handlerReliable (e) {
    console.log('handlerReliable')
    const that = this

    const skuItemIndex = e.currentTarget.dataset.skuIndex
    const carSourceItemIndex = e.currentTarget.dataset.carSourceIndex
    const spuId = this.data.carModelsInfo.carModelId

    const skuItem = this.data.carSourcesBySkuInSpuList[skuItemIndex]
    const carSourceItem = skuItem.carSourcesList[carSourceItemIndex]

    this.showReliableDialog(spuId, skuItemIndex, carSourceItem, carSourceItemIndex)
  },
  /**
   * 联系电话
   * @param e
   */
  handlerContact (e) {
    const skuItemIndex = e.currentTarget.dataset.skuIndex
    const carSourceItemIndex = e.currentTarget.dataset.carSourceIndex

    const carModelsInfo = this.data.carModelsInfo
    const skuItem = this.data.carSourcesBySkuInSpuList[skuItemIndex]
    const carSourceItem = skuItem.carSourcesList[carSourceItemIndex]
    const contact = carSourceItem.supplier.contact

    this.actionContact(carModelsInfo.carModelId, skuItemIndex, carSourceItemIndex, carSourceItem, contact)
  },
  handlerCarSourceMore (e) {
    const skuItemIndex = e.currentTarget.dataset.skuIndex
    const carSourceItemIndex = e.currentTarget.dataset.carSourceIndex

    const skuItem = this.data.carSourcesBySkuInSpuList[skuItemIndex]
    const carSourceItem = skuItem.carSourcesList[carSourceItemIndex]

    carSourceItem.viewModelSelectedTab = -1

    this.selectCarSourcePlace(carSourceItem.viewModelTabMore[0], carSourceItem)
    this.updateTheCarSource(skuItemIndex, carSourceItemIndex, carSourceItem)

    this.setData({
      [`carSourcesBySkuInSpuList[${skuItemIndex}].carSourcesList[${carSourceItemIndex}]`]: carSourceItem
    })
  },
  handlerCarSourceTabClick (e) {
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
      [`carSourcesBySkuInSpuList[${skuItemIndex}].carSourcesList[${carSourceItemIndex}]`]: carSourceItem
    })
  },
  /**
   * 点击供货列表项目得到的供货详情
   * @param e
   */
  handlerCarSourceDetail (e) {
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

    $wuxCarSourceDetailDialog.open({
      carModel: this.data.carModelsInfo,
      skuItem: skuItem,
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
          [`carSourcesBySkuInSpuList[${skuItemIndex}].carSourcesList[${carSourceItemIndex}]`]: carSourceItem
        })
      },
      reportError: function (e) {
        console.log('report error')
      }
    })
  },
  handlerCreateQuoted (e) {
    const skuItemIndex = e.currentTarget.dataset.skuIndex

    const skuItem = this.data.carSourcesBySkuInSpuList[skuItemIndex]

    const carModelsInfoKeyValueString = util.urlEncodeValueForKey('carModelsInfo', this.data.carModelsInfo)
    const carSkuInfoKeyValueString = util.urlEncodeValueForKey('carSkuInfo', skuItem.carSku)

    wx.navigateTo({
      url: '/pages/quote/quotationCreate/quotationCreate?' + carModelsInfoKeyValueString + '&' + carSkuInfoKeyValueString
    })
  },
  onTouchMoveWithCatch () {
    // 拦截触摸移动事件， 阻止透传
  }
})
