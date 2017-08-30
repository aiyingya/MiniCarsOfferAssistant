
// @flow
import util from '../../utils/util'

export default class CarSourceManager {

  spuOfficialPrice: number

  quotedMethod: QuotedMethod

  constructor (spuOfficialPrice: number = 0, quotedMethod?: QuotedMethod = 'PRICE') {
    this.spuOfficialPrice = spuOfficialPrice
    this.quotedMethod = quotedMethod
  }

  /**
   * 处理车源对象
   * @param carSourceItem
   */
  processCarSourceItem(carSourceItem: CarSource) {
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
    if (selectedCarSourcePlace != null) {
      this.selectCarSourcePlace(selectedCarSourcePlace, carSourceItem)
    } else {
      console.error('selected carsource place is null')
    }

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

    if (selectedCarSourcePlace != null) {
      this.processCarSourcePlaceItem(selectedCarSourcePlace, carSourceItem)
    } else {
      console.error('selected carsource place is null')
    }
  }

  processCarSourcePlaceItem(carSourcePlaceItem: CarSourcePlace, carSourceItem: CarSource) {
    this.updateTheCarSourcePlace(carSourcePlaceItem, carSourceItem)
  }

  /**
   * 选择货源下某个货源地
   * @param carSourceItem
   * @param
   */
  selectCarSourcePlace(selectedCarSourcePlaceItem: CarSourcePlace, carSourceItem: CarSource) {
    carSourceItem.viewModelSelectedCarSourcePlace = selectedCarSourcePlaceItem
    return carSourceItem
  }

  /**
   * 选择货源下某个货源地下的某一个物流方案
   * @param carSourcePlaceItem
   * @param selectedLogisticsDestinationIndex
   */
  selectLogisticsDestinationForCarSourcePlaceOfCarSource(
    carSourceItem: CarSource,
    carSourcePlaceItem: CarSourcePlace,
    selectedLogisticsDestinationIndex: number
  ) {
    if (carSourcePlaceItem.destinationList != null) {
      if (carSourcePlaceItem.destinationList.length > 0) {
        const selectedLogisticsDestination = carSourcePlaceItem.destinationList[selectedLogisticsDestinationIndex]
        if (selectedLogisticsDestination) {
          carSourcePlaceItem.viewModelSelectedLogisticsDestination = selectedLogisticsDestination
          carSourcePlaceItem.viewModelSelectedLogisticsDestinationIndex = selectedLogisticsDestinationIndex
          this.updateTheLogisticsDestination(selectedLogisticsDestination, carSourcePlaceItem, carSourceItem)
          return carSourceItem
        } else {
          console.info('selected logistics does not exists')
        }
      } else {
        console.info('carSourcePlaceItem s destinationList is empty ')
      }
    } else {
      console.info('carSourcePlaceItem do not has property destinationList')
    }

    carSourcePlaceItem.viewModelSelectedLogisticsDestination = null
    carSourcePlaceItem.viewModelSelectedLogisticsDestinationIndex = -1
    this.updateTheLogisticsDestination(null, carSourcePlaceItem, carSourceItem)
    return carSourceItem
  }

  updateTheCarSourcePlace(carSourcePlaceItem: CarSourcePlace, carSourceItem: CarSource) {
    const tags = []
    if (carSourcePlaceItem.priceFixed) {
      tags.push('一口价')
    }
    if (carSourceItem.supplierSelfSupport) {
      tags.push('垫款发车')
    }
    carSourcePlaceItem.viewModelTags = tags
    this.updateTheLogisticsDestination(carSourcePlaceItem.viewModelSelectedLogisticsDestination, carSourcePlaceItem, carSourceItem)
  }

  updateTheLogisticsDestination(logisticsDestination: Logistics | null, carSourcePlaceItem: CarSourcePlace, carSourceItem: CarSource) {
    if (logisticsDestination != null) {
      const quoted = util.quotedPriceByMethod(logisticsDestination.discount, this.spuOfficialPrice, this.quotedMethod)
      carSourcePlaceItem.viewModelQuoted = quoted
      carSourcePlaceItem.viewModelQuoted.price = logisticsDestination.totalPrice
      carSourcePlaceItem.viewModelQuoted.priceDesc = util.priceStringWithUnit(logisticsDestination.totalPrice)

      if (logisticsDestination.expectedDeliveryDays) {
        carSourcePlaceItem.viewModelExpectedDeliveryDaysDesc = '约' + logisticsDestination.expectedDeliveryDays + '天'
      } else {
        carSourcePlaceItem.viewModelExpectedDeliveryDaysDesc = ''
      }
      if (carSourcePlaceItem.viewModelSelectedLogisticsDestination != null) {
        carSourcePlaceItem.viewModelSelectedLogisticsDestination.viewModelLogisticsFeeDesc = util.priceStringWithUnit(logisticsDestination.logisticsFee)
      }
    } else {
      const quoted = util.quotedPriceByMethod(carSourcePlaceItem.discount, this.spuOfficialPrice, this.quotedMethod)
      carSourcePlaceItem.viewModelQuoted = quoted
      carSourcePlaceItem.viewModelQuoted.price = carSourcePlaceItem.totalPrice
      carSourcePlaceItem.viewModelQuoted.priceDesc = util.priceStringWithUnit(carSourcePlaceItem.totalPrice)
      carSourcePlaceItem.viewModelExpectedDeliveryDaysDesc = null
    }

    // 如果货源不是一口价
    if (!carSourceItem.supplierSelfSupport && !carSourcePlaceItem.priceFixed && carSourcePlaceItem.viewModelQuoted.price === this.spuOfficialPrice) {
      carSourcePlaceItem.viewModelEqualWithOfficialPrice = true
    } else {
      carSourcePlaceItem.viewModelEqualWithOfficialPrice = false
    }
  }
}
