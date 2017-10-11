
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
    // 更新发布时间
    const publishDate = util.dateCompatibility(carSourceItem.publishTime)
    carSourceItem.viewModelPublishDateDesc = util.dateDiff(publishDate)

    // 内外饰颜色处理
    const internalColors = carSourceItem.simpleInteriorColor.split('/')
    const processedInternalColors = []
    for (let color of internalColors) {
      const processedColor = color.replace(/色$/, '')
      processedInternalColors.push(processedColor)
    }
    carSourceItem.viewModelInternalColor = processedInternalColors.join('+')

    // 降价
    const quoted = util.quotedPriceByMethod(carSourceItem.salePrice, this.spuOfficialPrice, this.quotedMethod)
    carSourceItem.viewModelQuoted = quoted
    carSourceItem.viewModelQuoted.price = carSourceItem.salePrice
    carSourceItem.viewModelQuoted.priceDesc = util.priceStringWithUnit(carSourceItem.salePrice)
  }
}
