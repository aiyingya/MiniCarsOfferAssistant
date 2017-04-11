import Component from '../../../components/component'

export default {
  /**
   * 默认参数
   */
  setDefaults() {
    return {
      spuId: '',
      carSource: {}
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
   * @param {Object} opts.close 验证函数
   * @param {Object} opts.follow 验证函数
   * @param {Object} opts.reliable 验证函数
   */
  open(opts = {}) {
    const options = Object.assign({
      animateCss: undefined,
      visible: !1
    }, this.setDefaults(), opts)

    // 实例化组件
    const component = new Component({
      scope: `$wux.reliableDialog`,
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
        /**
         * 可靠
         *
         * @param {any} e
         */
        reliable(e) {
          const reliable = e.currentTarget.dataset.reliable
          if (reliable === '1') {
            if (options.carSource.hasBeenReliableByUser === 1) {
              if (options.carSource.hasBeenReliableCount) {
                options.carSource.hasBeenReliableCount--
              }
              options.carSource.hasBeenReliableByUser = 0
            } else {
              if (options.carSource.hasBeenReliableByUser === 0) {} else {
                if (options.carSource.hasBeenUnReliableCount) {
                  options.carSource.hasBeenUnReliableCount--
                }
              }
              options.carSource.hasBeenReliableCount++
                options.carSource.hasBeenReliableByUser = 1
            }
          } else if (reliable === '-1') {
            if (options.carSource.hasBeenReliableByUser === -1) {
              if (options.carSource.hasBeenUnReliableCount) {
                options.carSource.hasBeenUnReliableCount--
              }
              options.carSource.hasBeenReliableByUser = 0
            } else {
              if (options.carSource.hasBeenReliableByUser === 0) {} else {
                if (options.carSource.hasBeenReliableCount) {
                  options.carSource.hasBeenReliableCount--
                }
              }
              options.carSource.hasBeenUnReliableCount++
                options.carSource.hasBeenReliableByUser = -1
            }
          }
          this.setData({
            [`${this.options.scope}.carSource`]: options.carSource
          })
        }
      }
    })

    component.show()

    return component.hide
  }
}
