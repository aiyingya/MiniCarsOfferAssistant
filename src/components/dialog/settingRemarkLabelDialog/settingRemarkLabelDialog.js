
import Component from '../../component'

export default {
  /**
   * 默认参数
   */
  setDefaults() {
    return {
      cancelText: `取消`,
      confirmText: `确定`,
      currentTag: {
        content: '', // 备注内容
        price: 0, // 实际价格
        mileage: [], // 公里数标签
        condition: [], // 特殊条件标签
        sourceArea: [] // 货源地标签
      },
      handlerSettingTags() {}, // 确定选中好的标签
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

    console.log(options)
    // 实例化组件
    const component = new Component({
      scope: `$wux.settingRemarkLabelDialog`,
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
          this.init()
        },
        /**
         * 确认行为
         *
         * @param {any} e
         */
        confirm(e) {
          let _condition = options.currentTag.condition
          let _sourceArea = options.currentTag.sourceArea
          let _mileage = options.currentTag.mileage
          options.currentTag.comment = e.detail.value.comment
          options.currentTag.price = e.detail.value.price
          let _list = []
          _condition.forEach((item, index) => {
            if (item.selected) {
              let temp = {
                name: item.name,
                type: item.type // 这里type之前以为不一样 后来tpye值都一样了
              }
              _list.push(temp)
            }
          })
          _sourceArea.forEach((item, index) => {
            if (item.selected) {
              let temp = {
                name: item.name,
                type: item.type
              }
              _list.push(temp)
            }
          })
          _mileage.forEach((item, index) => {
            if (item.selected) {
              let temp = {
                name: item.name,
                type: item.type
              }
              _list.push(temp)
            }
          })

          typeof options.handlerSettingTags === `function` && options.handlerSettingTags(_list, options.currentTag.comment, options.currentTag.price)
          this.hide()
        },
        /**
         * 取消行为
         *
         * @param {any} e
         */
        cancel(e) {
          this.hide()
        },
        close() {
          if (typeof options.close === 'function') {
            this.hide(options.close())
            return
          }
          this.hide()
        },
        init() {
        },
        /**
         *
         * @param _list 当前公里数标签/特殊条件标签/货源地标签列表
         * @param _checkeds 当前标签中，所有选中的标签列表
         * @returns {*}
         */
        tempSetCheck(_list, _checkedNames) {
          _list.forEach((item, index) => {
            item.selected = false
            if (typeof _checkedNames === 'object') {
              _checkedNames.forEach((name, _index) => {
                if (name === item.name) {
                  item.selected = true
                }
              })
            } else {
              if (_checkedNames === item.name) {
                item.selected = true
              }
            }
          })
          return _list
        },
        handlerMileageTagChange(e) {
          console.log('radio发生change事件，携带value值为：', e.detail.value)
          let _checkedNames = e.detail.value
          let _mileage = options.currentTag.mileage
          _mileage = this.tempSetCheck(_mileage, _checkedNames)
          options.currentTag.mileage = _mileage
          this.setData({
            [`${this.options.scope}.currentTag.mileage`]: _mileage
          })
        },
        handlerConditionTagChange(e) {
          console.log('checkbox发生change事件，携带value值为：', e.detail.value)
          let _checkedNames = e.detail.value
          let _condition = options.currentTag.condition
          _condition = this.tempSetCheck(_condition, _checkedNames)
          options.currentTag.condition = _condition
          this.setData({
            [`${this.options.scope}.currentTag.condition`]: _condition
          })
        },
        handlerSourceAreaTagChange(e) {
          console.log('radio发生change事件，携带value值为：', e.detail.value)
          let _checkedNames = e.detail.value
          let _sourceArea = options.currentTag.sourceArea
          _sourceArea = this.tempSetCheck(_sourceArea, _checkedNames)
          options.currentTag.sourceArea = _sourceArea

          this.setData({
            [`${this.options.scope}.currentTag.sourceArea`]: _sourceArea,
          })
        },
        handleDown() {
          let price = Number(options.currentTag.price) || 0
          price = --price
          this.setData({
            [`${this.options.scope}.currentTag.price`]: price
          })
          options.currentTag.price = price
        },
        handleUp() {
          let price = Number(options.currentTag.price) || 0
          price = ++price
          this.setData({
            [`${this.options.scope}.currentTag.price`]: price
          })
          options.currentTag.price = price
        },
        handlePriceChange(e) {
          let price = Number(e.detail.value) || 0
          this.setData({
            [`${this.options.scope}.currentTag.price`]: price
          })
          options.currentTag.price = price
        },
      }
    })

    component.show()
    return component.hide
  }
}
