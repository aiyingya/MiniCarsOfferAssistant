
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
        sellingPrice: 0, // 初始传入的报价
        guidePrice:0          // 官价，该价格应该是标盘的中心
      },
      scale: [],
      scaleValue: [],
      scrollLeft: 0,
      sellingPrice : 0,     // 当前设置的报价
      quoted: {},
      tenScaleWidthPx: 0,
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
      validate() { return true }
    }
  },
  pxForNumber(number) {
    return String(number).length * this.fourDigestsLength / 4
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
    if (quotedMethod === 'POINTS') {
      lowerRate = lowerRate || 0.4
      upperRate = upperRate || 0.1
    } else if (quotedMethod === 'PRICE') {
      lowerRate = lowerRate || 0.5
      upperRate = upperRate || 0.1
    }

    const rangeLength = Math.ceil(guidePrice * (upperRate + lowerRate))
    const rangeLocationLower = Math.ceil(guidePrice * (1 - lowerRate))
    const rangeLocationUpper = Math.ceil(guidePrice * (1 + upperRate))

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
   *
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
    for (let index = 0; index < plate.scaleCount; index ++) {
      let guidePriceFlag = false
      if (index + plate.scaleCountForLower === plate.scaleCountForGuidePrice) {
        guidePriceFlag = true
      }

      if (index % 10 === 0) {
        const scaleValue = plate.rangeLocationLower + this.valueFromScaleCount(index, options.params.guidePrice, options.params.quotedMethod)
        options.scaleValue.push({index, scaleValue})
      }
      options.scale.push({index, guidePriceFlag})
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
