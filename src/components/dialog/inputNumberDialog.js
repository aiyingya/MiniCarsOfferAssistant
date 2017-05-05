
import Component from '../component'

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
      upText:"下"//是否是加价
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
        /**
         * 减金额行为
         *
         * @param {any} e
         */
        buttonMinus(e){
          options.inputNumber = options.inputNumber ? Math.floor(options.inputNumber - 1)  : 0
          let price = options.inputNumber && Math.floor(options.inputNumber)
          this.setData({
            [`${this.options.scope}.inputNumber`]: price
          })
          this.inputNumberInput(options.inputNumber)
        },
        /**
         * 加金额行为
         *
         * @param {any} e
         */
        buttonPlus(e){
          options.inputNumber = options.inputNumber ? Math.floor(options.inputNumber + 1)  : 1
          let price = Math.floor(options.inputNumber)
          this.setData({
            [`${this.options.scope}.inputNumber`]: price
          })
          this.inputNumberInput(options.inputNumber)
        }
      }
    })

    component.show()

    return component.hide
  }
}
