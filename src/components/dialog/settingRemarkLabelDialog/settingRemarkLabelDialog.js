
import Component from '../../component'
import service from '../../../utils/service'
import util from '../../../utils/util'

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
        sourceArea: [], // 货源地标签
        spuSummary: {} // 车款信息
      },
      settingPriceInfo: {
        isPoint: false, // 是：点数 否：金额
        isPlusPrice: false, // 是否加价/加点
        differenceValue: 0, // 差异值
        inputNumberMaxLength: 9 // 输入框最大数值
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
          this._initData()
        },
        _initData() {
          const carPrice = options.currentTag.price,
            officialPrice = options.currentTag.spuSummary.officialPrice,
            carModelName = options.currentTag.spuSummary.carModelName
          const _isPoint = service.isComputePointByCarBranch(carModelName)
          let _downPrice = util.downPrice(carPrice, officialPrice)
          const _isPlusPrice = (_downPrice < 0)
          let _point = util.downPoint(carPrice, officialPrice).toFixed(2)
          let _diffValue
          if (_isPoint) {
            _diffValue = _point
          } else {
            _diffValue = Math.abs(_downPrice)
          }
          this.setData({
            [`${this.options.scope}.settingPriceInfo.isPoint`]: _isPoint,
            [`${this.options.scope}.settingPriceInfo.isPlusPrice`]: _isPlusPrice,
            [`${this.options.scope}.settingPriceInfo.differenceValue`]: _diffValue
          })

          options.settingPriceInfo.isPoint = _isPoint
          options.settingPriceInfo.isPlusPrice = _isPlusPrice
          options.settingPriceInfo.differenceValue = _diffValue
        },
        /**
         * 确认行为
         *
         * @param {any} e
         */
        confirm(e) {
          let _condition = options.currentTag.condition,
            _sourceArea = options.currentTag.sourceArea,
            _mileage = options.currentTag.mileage,
            _isPoint = options.settingPriceInfo.isPoint,
            _officialPrice = options.currentTag.spuSummary.officialPrice,
            _isPlus = options.settingPriceInfo.isPlusPrice,
            _differenceValue = e.detail.value.differenceValue
          let price = util.getChangeCarPrice(_isPlus, _isPoint, _officialPrice, _differenceValue)
          options.currentTag.comment = e.detail.value.comment
          options.currentTag.price = price
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
        /**
         * 处理输入事件
         *
         * @param {any} e
         */
        handlerinput(e) {
          console.log('eliya-输入', e.detail.value || 0)
          options.settingPriceInfo.differenceValue = e.detail.value || 0
          this.setData({
            [`${this.options.scope}.settingPriceInfo.differenceValue`]: e.detail.value
          })
        },
        /**
         * 减金额行为
         *
         * @param {any} e
         */
        buttonMinus(e, priceStep = 100, pointsStep = 1) {
          var number = options.settingPriceInfo.differenceValue || 0
          let text
          if (!options.settingPriceInfo.isPoint) {
            options.settingPriceInfo.differenceValue = (Number(number) >= priceStep) ? (Number(number) - priceStep) : number
            text = Number(options.settingPriceInfo.differenceValue)
          } else {
            options.settingPriceInfo.differenceValue = (Number(number) >= pointsStep) ? (Number(number) - pointsStep) : number
            text = Number(options.settingPriceInfo.differenceValue).toFixed(2)
          }
          this.setData({
            [`${this.options.scope}.settingPriceInfo.differenceValue`]: text
          })
        },
        /**
         * 加金额行为
         *
         * @param e
         */
        buttonPlus(e, priceStep = 100, pointsStep = 1) {
          var number = options.settingPriceInfo.differenceValue || 0
          let text
          if (!options.settingPriceInfo.isPoint) {
            options.settingPriceInfo.differenceValue = Number(number) + priceStep
            text = Number(options.settingPriceInfo.differenceValue)
          } else {
            options.settingPriceInfo.differenceValue = Number(number) + pointsStep
            text = Number(options.settingPriceInfo.differenceValue).toFixed(2)
          }

          this.setData({
            [`${this.options.scope}.settingPriceInfo.differenceValue`]: text
          })
        },
        changePush() {
          const _isPlus = options.settingPriceInfo.isPlusPrice
          options.settingPriceInfo.isPlusPrice = !_isPlus
          this.setData({
            [`${this.options.scope}.settingPriceInfo.isPlusPrice`]: !_isPlus
          })
        }
      }
    })

    component.show()
    return component.hide
  }
}
