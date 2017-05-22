
import Component from '../component'

export default {
  /**
   * 默认参数
   */
  setDefaults() {
    return {
      title: undefined,
      content: undefined,
      checkboxItems: undefined,
      confirmDisabled: true,
      checkedValues: []
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
      close() {}
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
   */
  open(opts = {}) {


    const options = Object.assign({
      animateCss: undefined,
      visible: !1
    }, this.setDefaults(), opts)
    // 实例化组件
    const component = new Component({
      scope: `$wux.checkboxDialog`,
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
        checkboxChange: function (e) {

          let checkboxItems = options.checkboxItems
          let values = e.detail.value
          let name = e.currentTarget.dataset.name
          let disabled = !options.validate(e)
          let checkedValues = []
          for (let item of checkboxItems) {
            if(item.name === name) {
              item.checked = false
              for (let value of values) {
                if(item.id == value){
                  item.checked = true
                  checkedValues.push(item.id)
                  break
                }
              }

              // Fuckind Larry
              // 关联取消的险种，取消a关联b也取消，但a取消的时候应该不可以再重新选择b
              if(name === '第三者责任险' && item.checked) {
                for(let item1 of checkboxItems) {
                  if(item1.name === '不计免赔特约险' || item1.name === '无过责任险') {
                    item1.checked = true
                  }
                }
              }else if(name === '第三者责任险' && !item.checked) {
                for(let item1 of checkboxItems) {
                  if(item1.name === '不计免赔特约险' || item1.name === '无过责任险') {
                    item1.checked = false
                  }
                }
              }
              if(name === '车辆损失险' && item.checked) {
                for(let item1 of checkboxItems) {
                  if(item1.name === '不计免赔特约险' || item1.name === '全车盗抢险' || item1.name === '车身划痕险') {
                    item1.checked = true
                  }
                }
              }else if(name === '车辆损失险' && !item.checked) {
                for(let item1 of checkboxItems) {
                  if(item1.name === '不计免赔特约险' || item1.name === '全车盗抢险' || item1.name === '车身划痕险') {
                    item1.checked = false
                  }
                }
              }

              if(name === '不计免赔特约险' || name === '无过责任险') {
                for(let item1 of checkboxItems) {
                  if(item1.name === '第三者责任险' && !item1.checked) {
                    item.checked = false
                  }
                }
              }
              if(name === '不计免赔特约险' || name === '全车盗抢险' || name === '车身划痕险') {
                for(let item2 of checkboxItems) {
                  if(item2.name === '车辆损失险' && !item2.checked) {
                    item.checked = false
                  }
                }
              }
            }
          }

          this.setData({
            [`${this.options.scope}.confirmDisabled`]: false,
            [`${this.options.scope}.checkboxItems`]: checkboxItems
          })
        },
        /**
         * 确认行为
         *
         * @param {any} e
         */
        confirm(e) {

          const res = e.detail.value
          const value = options.checkboxItems
          const checkedValues = []
          for(let item of value) {
            if(item.checked) {
              checkedValues.push(item.id)
            }
          }
          console.log(checkedValues)
          this.hide(options.confirm(value,checkedValues))
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
