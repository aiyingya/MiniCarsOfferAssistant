import Component from '../component'

export default {
  /**
   * 默认参数
   */
  setDefaults() {
    return {
      totleContent: undefined,// {name:'总利润约',value:'0'}
      detailContent: []
    }
  },
  /**
   * 默认数据
   */
  data() {
    return {
      close() {}
    }
  },
  open(opts = {}) {
    const options = Object.assign({
      animateCss: undefined,
      visible: !1
    }, this.setDefaults(), opts)

    // 实例化组件
    const component = new Component({
      scope: `$wux.contentDialog`,
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
        close(){
          this.hide(options.close())
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
        }
      }
    })

    component.show()

    return component.hide
  }
}
