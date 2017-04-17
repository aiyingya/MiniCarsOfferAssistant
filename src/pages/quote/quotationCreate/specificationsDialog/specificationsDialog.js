import Component from '../../../../components/component'

export default {
  /**
   * 默认参数
   */
  setDefaults() {
    return {
      spuId: '',
      carSource: {},
      cancel() {},
      cancelText: `取消`,
      confirm() {},
      confirmText: `确定`
    }
  },
  /**
   * 默认数据
   */
  data() {
    return {}
  },
  /**
   * 显示dialog组件
   * @param {Object} opts 配置项
   * @param {String} opts.spuId 提示标题
   * @param {Object} opts.carSource 验证函数
   * @param {Object} opts.confirm 验证函数
   * @param {Object} opts.cancel 验证函数
   */
  open(opts = {}) {
    const options = Object.assign({
      animateCss: undefined,
      visible: !1
    }, this.setDefaults(), opts)

    // 实例化组件
    const component = new Component({
      scope: `$wux.specificationsDialog`,
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
        onTouchMoveWithCatch(e) {},
        /**
         * 关闭
         *
         * @param {any} e
         */
        close(e) {
          this.hide(options.close(options.carSource))
        },
        cancel(e) {
          this.hide(options.cancel)
        },
        confirm(e) {
          const externalColorName = e.detail.value.externalColorName || '未知'
          const internalColorName = e.detail.value.internalColorName || '未知'
          this.hide(options.confirm(externalColorName, internalColorName))
        }
      }
    })

    component.show()

    return component.hide
  }
}
