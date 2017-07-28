
import Component from '../../component'

export default {
  /**
   * 默认参数
   */
  setDefaults() {
    return {
      title: undefined,
      content: undefined,
      inputNumber: undefined,
      inputNumberPlaceholder: undefined,
      confirmDisabled: true,
      promoCode: undefined
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
      validate() { return true },
      initMobValidate() { return true },
      validate1() { return true },
      close() {}
    }
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
   * @param {Function} opts.validate 验证函数
   *
   */
  open(opts = {}) {
    const options = Object.assign({
      animateCss: undefined,
      visible: !1
    }, this.setDefaults(), opts)

    // 实例化组件
    const component = new Component({
      scope: `$wux.bargainCancelDialog`,
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
         * 处理输入事件1
         *
         * @param {any} e
         */
        inputNumberInput1(e) {
          options.inputNumber1 = (typeof(e) === 'object') ? e.detail.value :e
          //validate1
        },
        
        /**
         * 确认行为
         *
         * @param {any} e
         */
        confirm(e) {
          const res = e.detail.value
          const val = res.inputNumber
          this.hide(options.confirm(val))
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
        }
      }
    })

    component.show()


    return component.hide
  }
}
