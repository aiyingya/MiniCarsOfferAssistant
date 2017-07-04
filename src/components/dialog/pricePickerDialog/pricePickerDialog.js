
import Component from '../../component'
import util from '../../../utils/util'
import config from '../../../config'

export default {
  adjustUpdateTimeoutId: null,
  scalePx: 0,
  /**
   * 默认参数
   */
  setDefaults() {
    return {
      title: undefined,
      content: undefined,
      params: {
        quotedMethod: 'PRICE',
        sellingPrice: 0,
        guidePrice:0
      },
      scale: [],              // 表盘刻度
      scaleValue: [],         // 表盘刻度标注
      scrollLeft: 0,          // 设置当前 scroll view 的滚动距离
      sellingPrice : 0,       // 当前设置的报价
      quoted: {},             // 报价处理对象
      tenScaleWidthPx: 0,     // 十个刻度的实际 px
      tenScaleMarginLeftPx: 0,
      scalePx: 0,
      blankWidthPx: 0
    }
  },
  /**
   * 默认数据
   */
  data() {
    return {
      cancel() {},
      cancelText: `取消`,
      confirm() {},
      close() {},
      confirmText: `确定`,
    }
  },
  scaleCountFromValue(value, guidePrice, quotedMethod = 'PRICE') {
    if (quotedMethod === 'POINTS') {
      return Math.ceil(value * 100 / guidePrice * 2)
    } else if (quotedMethod === 'PRICE') {
      return Math.ceil(value / 100)
    }
  },
  valueFromScaleCount(scaleCount, guidePrice, quotedMethod = 'PRICE') {
    if (quotedMethod === 'POINTS') {
      return scaleCount * guidePrice / (100 * 2)
    } else if (quotedMethod === 'PRICE') {
      return scaleCount * 100
    }
  },
  prepareForPlate(guidePrice, sellingPrice, quotedMethod = 'PRICE', lowerRate, upperRate) {
    let rangeLength
    let rangeLocationLower
    let rangeLocationUpper

    if (quotedMethod === 'POINTS') {
      lowerRate = lowerRate || 1
      upperRate = upperRate || 1
    } else if (quotedMethod === 'PRICE') {
      lowerRate = lowerRate || 0.5
      upperRate = upperRate || 0.1
    }

    const originalRangeLength = Math.floor(guidePrice * (upperRate + lowerRate))
    const originalRangeLocationLower = Math.floor(guidePrice * (1 - lowerRate))
    const originalRangeLocationUpper = Math.floor(guidePrice * (1 + upperRate))

    if (quotedMethod === 'POINTS') {
      rangeLength = originalRangeLength
      rangeLocationLower = originalRangeLocationLower
      rangeLocationUpper = originalRangeLocationUpper

    } else if (quotedMethod === 'PRICE') {
      const rangeLengthMod = originalRangeLength % 100
      rangeLength = originalRangeLength - rangeLengthMod

      const rangeLocationLowerMod = originalRangeLocationLower % 100
      rangeLocationLower = originalRangeLocationLower - rangeLocationLowerMod
      rangeLocationUpper = originalRangeLocationUpper - (rangeLengthMod - rangeLocationLowerMod)
    }

    const scaleCount = this.scaleCountFromValue(rangeLength, guidePrice, quotedMethod) + 1
    const scaleCountForLower = this.scaleCountFromValue(rangeLocationLower, guidePrice, quotedMethod)
    const scaleCountForUpper = this.scaleCountFromValue(rangeLocationUpper, guidePrice, quotedMethod) + 1
    const scaleCountForGuidePrice = this.scaleCountFromValue(guidePrice, guidePrice, quotedMethod)
    const scaleCountForSellingPrice = this.scaleCountFromValue(sellingPrice, guidePrice, quotedMethod)

    return {
      rangeLength,
      rangeLocationLower,
      rangeLocationUpper,
      scaleCount,
      scaleCountForLower,
      scaleCountForUpper,
      scaleCountForGuidePrice,
      scaleCountForSellingPrice
    }
  },
  scrollLeftForValue(sellingPrice, rangeLocationLower, guidePrice, quotedMethod = 'PRICE') {
    const scaleCountSellingPrice = this.scaleCountFromValue(sellingPrice - rangeLocationLower, guidePrice, quotedMethod)
    const scrollLeft = scaleCountSellingPrice * this.scalePx + this.scalePx / 2
    return scrollLeft
  },
  valueForScrollLeft(offsetX, rangeLocationLower, guidePrice, quotedMethod = 'PRICE') {
    const absoluteOffset = offsetX - this.scalePx / 2
    const relativeScaleCount = (((absoluteOffset % this.scalePx) > this.scalePx / 2) ? 1 : 0) + (absoluteOffset / this.scalePx)
    const absoluteSellingPrice = rangeLocationLower + this.valueFromScaleCount(relativeScaleCount, guidePrice, quotedMethod)
    return {
      relativeScaleCount,
      absoluteSellingPrice
    }
  },
  adjustForScrollLeft(offsetX) {
    const absoluteOffset = offsetX - this.scalePx / 2
    const delta = absoluteOffset % this.scalePx
    const adjustScrollLeft = offsetX - delta + ((delta > this.scalePx / 2 )? this.scalePx / 2 : 0)
    return adjustScrollLeft
  },
  /**
   * 显示dialog组件
   * @param {Object} opts 配置项
   * @param {String} opts.title 提示标题
   * @param {String} opts.content 提示文本
   * @param {Function} opts.confirmText 确认按钮的文字
   * @param {Function} opts.cancelText 取消按钮的文字
   * @param {Function} opts.confirm 点击确认的回调函数
   * @param {Function} opts.cancel 点击确认的取消函数
   * @param {String} opts.params.quotedMethod 报价方式 PRICE按价 / POINTS按点 / DIRECT 直接报价, 暂不支持
   * @param {Number} opts.params.sellingPrice 报价, 由外部传入的初始报价值
   * @param {Number} opts.params.guidePrice 官价, 由外部传入的官方价格
   */
  open(opts = {}) {
    const that = this
    const options = Object.assign({
      animateCss: undefined,
      visible: !1
    }, this.setDefaults(), opts)

    const originalScalePx = Math.floor(config.px(30))
    options.scalePx = originalScalePx + (originalScalePx % 2 === 1 ? 1 : 0)
    this.scalePx = options.scalePx
    options.tenScaleWidthPx = this.scalePx * 10
    options.tenScaleMarginLeftPx = (options.tenScaleWidthPx - this.scalePx) / 2
    const screenWidthPx = config.system.screenWidth
    options.blankWidthPx = (screenWidthPx * 0.8 > 300 ? 300 : screenWidthPx * 0.8) / 2

    const plate = this.prepareForPlate(options.params.guidePrice, options.params.sellingPrice, options.params.quotedMethod)
    console.log(plate)
    let guidePriceGroupFlag = false
    // 获取最后一组组合
    const lastGroup = Number.parseInt((plate.scaleCount - 1) / 10) * 10
    for (let index = 0; index < plate.scaleCount; index ++) {

      let guidePriceFlag = false
      let bigScaleFlag = false
      if (index + plate.scaleCountForLower === plate.scaleCountForGuidePrice) {
        guidePriceGroupFlag = true
        const guidePriceBigScaleIndex = Number.parseInt(index / 10)
        for (let i = guidePriceBigScaleIndex * 10; i < guidePriceBigScaleIndex * 10 + 10; i++ ) {
          if (i + plate.scaleCountForLower === plate.scaleCountForGuidePrice ) {
            guidePriceFlag = true
          } else {
            guidePriceFlag = false
          }
          options.scale.push({index: i, guidePriceFlag, bigScaleFlag})
        }
      }



      if (index % 10 === 0) {
        if (guidePriceGroupFlag === false) {
          if (index === lastGroup ) {
            bigScaleFlag = false
          } else {
            bigScaleFlag = true
          }
          options.scale.push({index, guidePriceFlag, bigScaleFlag})
        } else {
          guidePriceGroupFlag = false
        }

        const scaleValue = plate.rangeLocationLower + this.valueFromScaleCount(index, options.params.guidePrice, options.params.quotedMethod)
        options.scaleValue.push({index, scaleValue})
      } else if (index === plate.scaleCount - 1) {
        const mode = index % 10
        for (let i = lastGroup + 1; i <= lastGroup + mode; i ++ ) {
          guidePriceFlag = false
          bigScaleFlag = false
          options.scale.push({index: i, guidePriceFlag, bigScaleFlag})
        }
      }

    }

    const scrollLeft = this.scrollLeftForValue(options.params.sellingPrice, plate.rangeLocationLower, options.params.guidePrice, options.params.quotedMethod)
    options.scrollLeft = scrollLeft

    // 实例化组件
    const component = new Component({
      scope: `$wux.pricePickerDialog`,
      data: options,
      methods: {
        /**
         * 隐藏
         */
        hide(cb) {
          if (this.removed) return !1
          this.removed = !0
          this.setHidden()
          setTimeout(() => typeof cb === `function` && cb(), 300)
        },
        /**
         * 显示
         */
        show() {
          if (this.removed) return !1
          this.setVisible()
        },
        /**
         * 防止事件透传
         *
         * @param {any} e
         */
        onTouchMoveWithCatch(e) {
          console.log(e)
        },
        /**
         * 确认行为
         *
         * @param {any} e
         */
        confirm(e) {
          const quoted = this._data.quoted
          const sellingPrice = this._data.sellingPrice
          const res = {
            quoted,
            sellingPrice
          }
          this.hide(options.confirm(res))
        },
        /**
         * 取消行为
         *
         * @param {any} e
         */
        cancel(e) {
          this.hide(options.cancel())
        },
        close() {
          if (typeof options.close === 'function') {
            this.hide(options.close())
            return
          }
          this.hide()
        },
        scroll(e) {
          const scrollLeft = e.detail.scrollLeft
          const adjustScrollLeft = that.adjustForScrollLeft(scrollLeft)
          if (adjustScrollLeft === scrollLeft) {
            const value = that.valueForScrollLeft(e.detail.scrollLeft, plate.rangeLocationLower, this._data.params.guidePrice, this._data.params.quotedMethod)
            this._data.sellingPrice = value.absoluteSellingPrice

            const quoted = util.quotedPriceByMethod(value.absoluteSellingPrice, this._data.params.guidePrice, this._data.params.quotedMethod)
            this._data.quoted = quoted

            this.setData({
              [`${this.options.scope}.sellingPrice`]: value.absoluteSellingPrice,
              [`${this.options.scope}.quoted`]: quoted
            })
          } else {
            clearTimeout(that.adjustUpdateTimeoutId)
            that.adjustUpdateTimeoutId = setTimeout(() => {
              this.setData({
                [`${this.options.scope}.scrollLeft`]: adjustScrollLeft
              })
            }, 1000);
          }
        }
      }
    })

    component.show()

    return component.hide
  }
}
