
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
      params:{
        ellingPrice : 0,
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
              [`${this.options.scope}.content`]:  "￥" + Math.floor(price)
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
        buttonMinus(e){
          var number = options.inputNumber;
          if(!number ){
            return
          }
          let text
          if(!options.params.isPoint){
            options.inputNumber = (Number(number)>=100) ? (Number(number) - 100) : number
            text = Number(options.inputNumber)
          }else{
            options.inputNumber = (Number(number)>=1) ? (Number(number) - 1) : number
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
        /**
         * 加金额行为
         *
         * @param {any} e
         */
        buttonPlus(e){
          var number = options.inputNumber;
          if(!number && Number(number)!=0){
            return
          }
          let text
          if(!options.params.isPoint){
            options.inputNumber = Number(number) + 100
            text = Number(options.inputNumber)
          }else{
            options.inputNumber = Number(number) + 1
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
