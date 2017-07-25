
import Component from '../component'
import util from '../../utils/util'
export default {
  /**
   * 默认参数
   */
  setDefaults() {
    return {
      title: undefined,
      content: undefined,
      inputNumber: undefined,
      inputNumberPlaceHolder: undefined,
      inputNumberMaxLength: -1,
      inputType: 'number',
      confirmDisabled: true,
      priceStyle: false,
      longTapLock: false,
      longTapIntervalId: 0,
      params: {
        sellingPrice : 0,
        initSellingPrice : 0,
        initIsPlus:false,//初始化的加减
        isPlus :false,
        isPoint:false,
        hasInitPoint:0,
        guidePrice:0
      }
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
  /**
   * 显示dialog组件
   * @param {Object} opts 配置项
   * @param {String} opts.title 提示标题
   * @param {String} opts.content 提示文本
   * @param {String} opts.inputNumber 默认输入框文本
   * @param {String} opts.inputNumberPlaceHolder 默认输入框的 placeHolder
   * @param {Function} opts.confirmText 确认按钮的文字
   * @param {Function} opts.cancelText 取消按钮的文字
   * @param {Function} opts.confirm 点击确认的回调函数
   * @param {Function} opts.cancel 点击确认的取消函数
   * @param {Function} opts.validate 验证函数
   * @param {String} opts.priceStyle 是否使用价格样式
   *
   */
  open(opts = {}) {
    const options = Object.assign({
      animateCss: undefined,
      visible: !1
    }, this.setDefaults(), opts)

    // 实例化组件
    const component = new Component({
      scope: `$wux.inputNumberDialog`,
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
        },
        /**
         * 处理输入事件
         *
         * @param {any} e
         */
        inputNumberInput(e) {
          options.inputNumber = (typeof(e) === 'object') ? e.detail.value :e

          let disabled = false
          if (typeof options.validate === 'function') {
            disabled = !options.validate(e)
          }
          this.setData({
            [`${this.options.scope}.confirmDisabled`]: disabled
          })

          if(options.priceStyle){
            const _isPlus = options.params.isPlus
            let price
            if(options.params.isPoint && (options.params.initIsPlus === _isPlus) && (Number(options.params.hasInitPoint) === Number(options.inputNumber))){
              price = options.params.initSellingPrice
            }else{
              price = util.getChangeCarPrice(options.params.isPlus,options.params.isPoint,options.params.guidePrice,options.inputNumber)
            }
            this.setData({
              [`${this.options.scope}.content`]: Math.floor(price)
            })
          }
        },

        /**
         * 裸车价输入时间
         *
         * @param {any} e
         */
        inputPriceInput(e) {
          const sellingPrice = Number(e.detail.value)
          if (sellingPrice > 99999999) {
            return '99999999'
          }
          if (sellingPrice < 0) {
            return '0'
          }

          if (options.priceStyle) {
            const quotedMethod = options.params.isPoint ? 'POINTS' : 'PRICE'

            const quoted = util.quotedPriceByMethod(sellingPrice, options.params.guidePrice, quotedMethod, false)
            const isPlus = quoted.quotedSymbol === 'PLUS'
            const quotedValueOrRange = options.params.isPoint ? quoted.quotedValue : quoted.quotedRange

            this.setData({
              [`${this.options.scope}.params.isPlus`]: isPlus,
              [`${this.options.scope}.params.sellingPrice`]: sellingPrice,
              [`${this.options.scope}.inputNumber`]: quotedValueOrRange
            })
          }
        },
        /**
         * 确认行为
         *
         * @param {any} e
         */
        confirm(e) {
          const res = e.detail.value
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
        close(){
          if (typeof options.close === 'function') {
            this.hide(options.close())
            return
          }
          this.hide()
        },
        /**
         * 减金额行为
         *
         * @param {any} e
         */
        buttonMinus(e, priceStep = 100, pointsStep = 1) {
          // 长按锁
          if (this.options.longTapSkipNextTap === true) {
            this.options.longTapSkipNextTap = false
            return
          }

          var number = options.inputNumber;
          if(!number ){
            return
          }
          let text
          if(!options.params.isPoint){
            options.inputNumber = (Number(number)>=priceStep) ? (Number(number) - priceStep) : number
            text = Number(options.inputNumber)
          }else{
            options.inputNumber = (Number(number)>=pointsStep) ? (Number(number) - pointsStep) : number
            text = Number(options.inputNumber).toFixed(2)
          }
          let price
          if(options.params.isPoint && (Number(options.params.hasInitPoint) === Number(options.inputNumber))){
            price = options.params.initSellingPrice
          }else{
            price = util.getChangeCarPrice(options.params.isPlus,options.params.isPoint,options.params.guidePrice,options.inputNumber)
          }
          this.setData({
            [`${this.options.scope}.inputNumber`]: text,
            [`${this.options.scope}.content`]:  "￥" + Math.floor(price)
          })
          this.inputNumberInput(options.inputNumber)
        },
        buttonLargeMinus(e) {
          this.options.longTapLock = true
          this.buttonMinus(e, 500, 5)
          this.options.longTapIntervalId = setInterval(() => {
            this.buttonMinus(e, 500, 5)
          }, 500)
        },
        /**
         * 加金额行为
         *
         * @param {any} e
         */
        buttonPlus(e, priceStep = 100, pointsStep = 1){
          console.log('buttonPlus')
          // 长按锁
          if (this.options.longTapSkipNextTap === true) {
            this.options.longTapSkipNextTap = false
            return
          }

          var number = options.inputNumber;
          if(!number && Number(number)!=0){
            return
          }
          let text
          if(!options.params.isPoint){
            options.inputNumber = Number(number) + priceStep
            text = Number(options.inputNumber)
          }else{
            options.inputNumber = Number(number) + pointsStep
            text = Number(options.inputNumber).toFixed(2)
          }
          let price
          if(options.params.isPoint && (Number(options.params.hasInitPoint) === Number(options.inputNumber))){
            price = options.params.initSellingPrice
          }else{
            price = util.getChangeCarPrice(options.params.isPlus,options.params.isPoint,options.params.guidePrice,options.inputNumber)
          }
          this.setData({
            [`${this.options.scope}.inputNumber`]: text,
            [`${this.options.scope}.content`]:  "￥" + Math.floor(price)
          })
          this.inputNumberInput(options.inputNumber)
        },
        buttonLargePlus(e) {
          this.options.longTapLock = true
          this.buttonPlus(e, 500, 5)
          this.options.longTapIntervalId = setInterval(() => {
            this.buttonPlus(e, 500, 5)
          }, 500)
        },
        buttonLargeCancel(e) {
          this.clearLongTap()
        },
        buttonLargeEnd(e) {
          this.clearLongTap()
        },
        clearLongTap() {
          clearInterval(this.options.longTapIntervalId)
          this.options.longTapIntervalId = 0
          if (this.options.longTapLock === true) {
            this.options.longTapSkipNextTap = true
            this.options.longTapLock = false
          }
        },
        changePush(){
          const _isPlus = options.params.isPlus
          options.params.isPlus =!_isPlus


          let price
          if(options.params.isPoint && (options.params.initIsPlus === _isPlus) && (Number(options.params.hasInitPoint) === Number(options.inputNumber))){
            price = options.params.initSellingPrice
          }else{
            price = util.getChangeCarPrice(options.params.isPlus,options.params.isPoint,options.params.guidePrice,options.inputNumber)
          }
          this.setData({
            [`${this.options.scope}.content`]:  "￥" + Math.floor(price)
          })

          this.setData({
            [`${this.options.scope}.params.isPlus`]: !_isPlus
          })
          this.setData({
            [`${this.options.scope}.confirmDisabled`]: false
          })
        }
      }
    })

    component.show()

    return component.hide
  }
}
