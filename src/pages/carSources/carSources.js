let app = getApp();
let util = require('../../utils/util.js')

Page({
  data: {
    // 有无数据 init/data/none
    nodata: 'init',
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
    app: app
  },
  onLoad (options) {
    const that = this

    const carModelsInfo = util.urlDecodeValueForKeyFromOptions('carModelsInfo', options);

    this.setData({
      carModelsInfo: carModelsInfo
    })
    const HTTPS_YMCAPI = app.config.ymcServerHTTPSUrl
    try {
      const res = wx.getSystemInfoSync();
      this.pixelRatio = res.pixelRatio;
      this.apHeight = 16;
      this.offsetTop = 80;
      this.setData({windowHeight: res.windowHeight + 'px'})
    } catch (e) {

    }

    console.log(app.globalData)

    // MARK： 目前只取地址列表中的第一个
    const locations = app.globalData.location
    const data = {
      userId: app.userInfo().userId
    }

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


    app.modules.request({
      url: HTTPS_YMCAPI + 'product/car/spu/' + carModelsInfo.carModelId + '/sources',
      method: 'GET',
      data: data,
      success: function (res) {
        // let carSourcesBySkuInSpuList = []
        // for (let carSourcesBySkuInSpuItem of res.carSourcesBySkuInSpuList) {
        // that.preprocessCarSourcesBySkuInSpuItem(carSourcesBySkuInSpuItem)
        // carSourcesBySkuInSpuList.push(carSourcesBySkuInSpuItem)
        // }

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
          } else if (i == 1) {
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
          carSourcesBySkuInSpuList: newCarSourcesBySkuInSpuList,
          selectedSectionIndex: -1
        })
      }
    })

    /// 初始化自定义组件
    this.$wuxDialog = app.wux(this).$wuxDialog
    this.$wuxReliableDialog = app.wux(this).$wuxReliableDialog
    this.$wuxNormalDialog = app.wux(this).$wuxNormalDialog
    this.$wuxCarSourceDetailDialog = app.wux(this).$wuxCarSourceDetailDialog
  },
  onShow () {
    const that = this
    const valueString = wx.getStorageSync('recent_contact')
    if (valueString && typeof valueString === 'string') {
      const value = JSON.parse(valueString)
      console.log(value)

      const spuId = value.spuId
      const carSource = value.carSource
      const supplier = carSource.supplier
      const skuIndex = value.skuIndex
      const carSourceIndex = value.carSourceIndex
      console.log(spuId)
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
  showReliableDialog(spuId, skuIndex, carSource, carSourceIndex) {
    // 24 小时以内， 弹框走起
    const that = this
    const hasBeenReliableByUser = carSource.hasBeenReliableByUser
    const hideDialog = this.$wuxReliableDialog.open({
      spuId: spuId,
      carSource: carSource,
      close: (updatedCarSource) => {
        that.requestReliable(spuId, carSource.id, updatedCarSource.supplier.id, hasBeenReliableByUser, updatedCarSource.hasBeenReliableByUser, {
          success: function () {
          },
          fail: function () {
          },
          complete: function () {
          }
        })
        that.updateTheCarSource(skuIndex, carSourceIndex, updatedCarSource)
        that.setData({
          carSourcesBySkuInSpuList: that.data.carSourcesBySkuInSpuList
        })
      },
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
    carSourcesBySkuInSpuItem.carSku.viewModelTags = [...tagsSet]
    carSourcesBySkuInSpuItem.carSku.viewModelCarSourceCount = carSourcesBySkuInSpuItem.carSourcesList.length
    carSourcesBySkuInSpuItem.carSku.viewModelSupplierSelfSupport = carSourcesBySkuInSpuItem.carSourcesList[0].supplierSelfSupport
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
      if (carSourceItem.others.length > 0) {
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
      if (carSourceItem.others.length === 1) {
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
      if (carSourceItem.others.length > 0) {
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
      if (carSourceItem.others.length > 0) {
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

    this.processCarSourcePlaceItem(selectedCarSourcePlace, carSourceItem)
  },
  processCarSourcePlaceItem (carSourcePlaceItem, carSourceItem) {
    this.updateTheCarSourcePlace(carSourcePlaceItem, carSourceItem)
  },
  selectCarSku (selectedCarSkuIndex, carSourcesBySkuInSpuList) {
    let actualCarSourcesBySkuInSpuList
    if (carSourcesBySkuInSpuList) {
      actualCarSourcesBySkuInSpuList = carSourcesBySkuInSpuList
    } else {
      actualCarSourcesBySkuInSpuList = this.data.carSourcesBySkuInSpuList
    }

    if (selectedCarSkuIndex === -1) {
    } else {
      const section = actualCarSourcesBySkuInSpuList[selectedCarSkuIndex]
      this.updateTheCarSku(selectedCarSkuIndex, section)
    }
    return carSourcesBySkuInSpuList
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
      carSourcePlaceItem.viewModelExpectedDeliveryDaysDesc = '约' + logisticsDestination.expectedDeliveryDays + '天'
      carSourcePlaceItem.viewModelSelectedLogisticsDestination.viewModelLogisticsFeeDesc = util.priceStringWithUnit(logisticsDestination.logisticsFee)
    } else {
      carSourcePlaceItem.viewModelPrice = carSourcePlaceItem.totalPrice
      carSourcePlaceItem.viewModelPriceDesc = util.priceStringWithUnit(carSourcePlaceItem.totalPrice)
      carSourcePlaceItem.viewModelDiscount = carSourcePlaceItem.discount
      carSourcePlaceItem.viewModelDiscountDesc = util.priceStringWithUnit(carSourcePlaceItem.discount)
      carSourcePlaceItem.viewModelExpectedDeliveryDaysDesc = null
    }
  },
  updateTheCarSourcePlace (carSourcePlaceItem, carSourceItem) {
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
    const selectedExternalCarColorName = this.data.selectedExternalCarColorName
    const selectedInternalCarColorName = this.data.selectedInternalCarColorName
    const selectedSourcePublishDate = object.sourcePublishDate || this.getIdWithFiltersIndex(0)
    const selectedLogistics = object.logistics || this.getIdWithFiltersIndex(1)

    console.log('selected color: ex:' + selectedExternalCarColorName + 'in:' + selectedInternalCarColorName)
    console.log('selected source publish date:' + selectedSourcePublishDate)
    console.log('selected logistics:' + selectedLogistics)

    const selectedSourcePublishDateFilter = function (filterId, carSourceItem) {
      const now = new Date().getTime();
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
      return true;
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
        }

        // FIXME: 这里需不需要来一段 update， 否则无法构建合适的结果
        return !(!carSourceItem.lowest && !carSourceItem.fastest && !carSourceItem.others)
      }
      return true
    }

    const selectedColorFilter = function (externalColorName,
                                          internalColorName,
                                          carSourcesBySkuItem) {
      console.log(externalColorName)
      console.log(internalColorName)
      console.log(carSourcesBySkuItem)

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

    const carSourcesBySkuInSpuList = this.data.cacheCarSourcesBySkuInSpuList
    const newCarSourcesBySkuInSpuList = []
    for (let carSourcesBySkuItem of carSourcesBySkuInSpuList) {
      const newCarSourcesList = []
      if (selectedColorFilter(selectedExternalCarColorName, selectedInternalCarColorName, carSourcesBySkuItem)) {
        for (let carSourceItem of carSourcesBySkuItem.carSourcesList) {
          if (selectedLogisticsFilter(selectedLogistics, carSourceItem) &&
            selectedSourcePublishDateFilter(selectedSourcePublishDate, carSourceItem)) {
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
  handlerAmendCarFacade (e) {
    const that = this;
    const selectedFilterIndex = e.currentTarget.dataset.selectedFilterIndex;
    if (selectedFilterIndex !== this.data.selectedFilterIndex) {
      // 父级
      let firstFilters = []
      if (selectedFilterIndex == 0) {
        firstFilters.push({
          id: '-1',
          name: "全部"
        })
      }
      const dropDownFiltersData = firstFilters.concat(this.data.dropDownFilters[selectedFilterIndex].items);

      // 子级
      let subFirstFilters = []
      subFirstFilters.push({
        id: '-1',
        name: '全部'
      })

      let dropDownSubFiltersData;
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
        dropDownSubFiltersData: dropDownSubFiltersData,
      })
    } else {
      this.setData({
        showRmendCarFacade: !this.data.showRmendCarFacade
      })
    }
  },
  headlerRemoveRmendCarFacade () {
    const carSourcesBySkuInSpuList = this.updateSearchResult({color: -1})
    this.selectCarSku(-1, carSourcesBySkuInSpuList)
    this.setData({
      carSourcesBySkuInSpuList: carSourcesBySkuInSpuList,
      selectedSectionIndex: -1,
      showRmendCarFacade: false
    })
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

      let dropDownSubFiltersData;
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

      that.headlerRemoveRmendCarFacade()
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

    let newCarSourcesBySkuInSpuList
    if (scrollFilterIndex == 0) {
      // 车源发布时间
      newCarSourcesBySkuInSpuList = that.updateSearchResult({sourcePublishDate: selectedFilterId})
    } else if (scrollFilterIndex == 1) {
      // 是否包邮
      newCarSourcesBySkuInSpuList = that.updateSearchResult({logistics: selectedFilterId})
    }

    this.setData({
      scrollFiltersSelectedIndexes: scrollFiltersSelectedIndexes,
      carSourcesBySkuInSpuList: newCarSourcesBySkuInSpuList,
      selectedSectionIndex: -1
    })
  },
  /**
   * 选择 SKU 分区
   * @param e
   */
  handlerSelectCarSku (e) {
    const index = e.currentTarget.dataset.skuItemIndex
    const skuItem = e.currentTarget.dataset.skuItem

    let actualIndex

    if (index === this.data.selectedSectionIndex) {
      actualIndex = -1
    } else {
      actualIndex = index
    }

    this.selectCarSku(actualIndex)
    this.setData({
      carSourcesBySkuInSpuList: this.data.carSourcesBySkuInSpuList,
      selectedSectionIndex: actualIndex
    })
  },
  // /**
  //  * 关注一个供应商
  //  * @param e
  //  */
  // handlerFollow(e) {
  //   const that = this
  //
  //   const skuIndex = e.currentTarget.dataset.skuIndex
  //   const carSourceIndex = e.currentTarget.dataset.carSourceIndex
  //   const carSource = e.currentTarget.dataset.carSource
  //   const supplier = e.currentTarget.dataset.supplier
  //
  //   this.requestFocusOrNotASupplier(supplier.id, !supplier.hasFocused, {
  //     success: function (res) {
  //       supplier.hasFocused = !supplier.hasFocused
  //       carSource.supplier = supplier
  //       that.updateTheCarSource(skuIndex, carSourceIndex, carSource)
  //     },
  //     fail: function () {
  //
  //     },
  //     complete: function () {
  //
  //     }
  //   })
  // },
  /**
   * 评价某一个供应商是否靠谱
   * @param e
   */
  handlerReliable(e) {
    console.log("handlerReliable")
    const that = this;

    const skuIndex = e.currentTarget.dataset.skuIndex
    const carSourceIndex = e.currentTarget.dataset.carSourceIndex
    const carSource = e.currentTarget.dataset.carSource
    const supplier = e.currentTarget.dataset.supplier
    const spuId = this.data.carModelsInfo.carModelId

    this.showReliableDialog(spuId, skuIndex, carSource, carSourceIndex)
  },
  /**
   * 联系电话
   * @param e
   */
  handlerContact (e) {
    const carModelsInfo = this.data.carModelsInfo
    const skuIndex = e.currentTarget.dataset.skuIndex
    const carSourceIndex = e.currentTarget.dataset.carSourceIndex
    const carSource = e.currentTarget.dataset.carSource
    const contact = carSource.supplier.contact;

    this.actionContact(carModelsInfo.carModelId, skuIndex, carSourceIndex, carSource, contact)
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

    this.$wuxNormalDialog.open({
      title: '提示',
      content: '发起定车后， 将会有工作人员与您联系',
      confirmText: '发起定车',
      confirm: function () {
        const spec = skuItem.carSku.externalColorName + '/' + skuItem.carSku.internalColorName
        const itemPrice = carSourceItem.viewModelSelectedCarSourcePlace.viewModelPrice

        that.requestBookCar(carModelsInfo.carModelName, spec, itemPrice, 1, {
          success (res){
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
  handlerCarSourceMore (e) {
    const skuItemIndex = e.currentTarget.dataset.skuIndex
    const carSourceItem = e.currentTarget.dataset.carSource
    const carSourceItemIndex = e.currentTarget.dataset.carSourceIndex

    carSourceItem.viewModelSelectedTab = -1

    console.log(carSourceItem)
    this.updateTheCarSource(skuItemIndex, carSourceItemIndex, carSourceItem)

    this.setData({
      carSourcesBySkuInSpuList: this.data.carSourcesBySkuInSpuList
    })
  },
  handlerCarSourceTabClick (e) {
    const tabItem = e.currentTarget.dataset.tabItem
    const tabItemIndex = e.currentTarget.dataset.tabItemIndex

    const skuItemIndex = e.currentTarget.dataset.skuIndex
    const carSourceItem = e.currentTarget.dataset.carSource
    const carSourceItemIndex = e.currentTarget.dataset.carSourceIndex

    carSourceItem.viewModelSelectedTab = tabItemIndex
    this.selectCarSourcePlace(tabItem.value, carSourceItem)
    this.updateTheCarSource(skuItemIndex, carSourceItemIndex, carSourceItem)

    this.setData({
      carSourcesBySkuInSpuList: this.data.carSourcesBySkuInSpuList
    })
  },
  /**
   * 点击供货列表项目得到的供货详情
   * @param e
   */
  handlerCarSourceDetail (e) {
    const that = this

    const carModelsInfo = this.data.carModelsInfo
    const skuItem = e.currentTarget.dataset.sku
    const skuItemIndex = e.currentTarget.dataset.skuIndex
    const carSourceItem = e.currentTarget.dataset.carSource
    const carSourceItemIndex = e.currentTarget.dataset.carSourceIndex
    const carSourcePlaceItem = e.currentTarget.dataset.carSourcePlace
    const contact = carSourceItem.supplier.contact

    /// 判断有没有需要设置的 car source place， 没有则使用默认设置好的
    if (carSourcePlaceItem) {
      this.selectCarSourcePlace(carSourcePlaceItem, carSourceItem)
      this.updateTheCarSource(skuItemIndex, carSourceItemIndex, carSourceItem)
    }

    this.$wuxCarSourceDetailDialog.open({
      app: app,
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
          carSourcesBySkuInSpuList: that.data.carSourcesBySkuInSpuList
        })
      },
      reportError: function (e) {
        console.log('report error')
      }
    })
  },
  handlerCreateQuoted (e) {
    const skuItem = e.currentTarget.dataset.sku

    console.log(skuItem)
    const carModelsInfoKeyValueString = util.urlEncodeValueForKey('carModelsInfo', this.data.carModelsInfo)
    const carSkuInfoKeyValueString = util.urlEncodeValueForKey('carSkuInfo', skuItem.carSku)

    wx.navigateTo({
      url: '/pages/quote/quotationCreate/quotationCreate?' + carModelsInfoKeyValueString + '&' + carSkuInfoKeyValueString
    })
  },
  /**
   * 发起订车行为
   *
   * @param skuIds          [String]
   * @param quotationId     可选
   * @param customerMobile  可选
   * @param object
   */
  requestBookCar(itemName, spec, itemPrice, itemCount, object) {
    app.modules.request({
      url: app.config.ymcServerHTTPSUrl + 'sale/quotation/order',
      data: {
        userId: app.userInfo().userId,
        itemName: itemName,
        spec: spec,
        itemPrice: itemPrice,
        itemCount: itemCount
      },
      method: 'POST',
      success: object.success,
      fail: object.fail,
      complete: object.complete
    })
  },
  /**
   * 对某一个供应商关注/取消操作
   * @param supplierId
   * @param object
   */
  requestFocusOrNotASupplier (supplierId, focusOrNot, object) {
    if (supplierId && typeof supplierId === 'string') {
      const method = focusOrNot ? 'POST' : 'DELETE'
      app.modules.request({
        url: app.config.ucServerHTTPSUrl + 'cgi/user/' + app.userInfo().userId + '/focus',
        data: {
          type: 'supplier',
          targetId: supplierId
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
  },
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
  },
  requestReliableOrNotASupplier (spuId, carSourceId, supplierId, reliableOrNot, object) {
    this.requestAddOrRemoveTagnameForASupplier(spuId, carSourceId, '靠谱', supplierId, reliableOrNot, object);
  },
  requestUnReliableOrNotASupplier (spuId, carSourceId, supplierId, UnReliableOrNot, object) {
    this.requestAddOrRemoveTagnameForASupplier(spuId, carSourceId, '不靠谱', supplierId, UnReliableOrNot, object);
  },
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
      app.modules.request({
        url: app.config.ymcServerHTTPSUrl + 'product/car/spu/' + spuId + '/source/' + carSourceId + '/tag',
        data: {
          tagName: tagName,
          userId: app.userInfo().userId,
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
})
