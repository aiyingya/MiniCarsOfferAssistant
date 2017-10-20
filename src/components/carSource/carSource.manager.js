
// @flow
import utils from '../../utils/util'

export default class CarSourceManager {

  spuOfficialPrice: number

  quotedMethod: QuotedMethod

  constructor(spuOfficialPrice: number = 0, quotedMethod?: QuotedMethod = 'PRICE') {
    this.spuOfficialPrice = spuOfficialPrice
    this.quotedMethod = quotedMethod
  }

  /**
   * 处理车源对象
   * @param carSourceItem
   */
  processCarSourceItem(carSourceItem: CarSource, otherSalePrice?: number = 0) {
    let salePrice
    if (otherSalePrice) {
      salePrice = otherSalePrice
    } else {
      salePrice = carSourceItem.salePrice
    }
    // 更新发布时间
    const publishDate = utils.dateCompatibility(carSourceItem.publishTime)
    carSourceItem.viewModelPublishDateDesc = utils.dateDiff(publishDate)

    // 内外饰颜色处理
    const internalColors = carSourceItem.simpleInteriorColor.split('/')
    const processedInternalColors = []
    for (let color of internalColors) {
      const processedColor = color.replace(/色$/, '')
      processedInternalColors.push(processedColor)
    }
    carSourceItem.viewModelInternalColor = processedInternalColors.join('+')

    // 降价
    const quoted = utils.quotedPriceByMethod(salePrice, this.spuOfficialPrice, this.quotedMethod)
    carSourceItem.viewModelQuoted = quoted
    carSourceItem.viewModelQuoted.price = salePrice
    carSourceItem.viewModelQuoted.priceDesc = utils.priceStringWithUnit(salePrice)

    // 如果货源不是一口价
    if (carSourceItem.viewModelQuoted.price === this.spuOfficialPrice) {
      carSourceItem.viewModelEqualWithOfficialPrice = true
    } else {
      carSourceItem.viewModelEqualWithOfficialPrice = false
    }
  }
}
