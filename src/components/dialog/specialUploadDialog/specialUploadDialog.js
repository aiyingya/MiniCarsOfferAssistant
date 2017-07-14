
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
      inputNumber1: undefined,
      inputNumberPlaceHolder: undefined,
      inputNumberPlaceholder1: undefined,
      inputNumberMaxLength: -1,
      inputNumberMaxLength1: -1,
      inputType: 'number',
      confirmDisabled: true,
      radioNames:[],
      defaultRadio:undefined,
      effectivenessCustomValue: '',//时效性自定义时间
      // effectivenessCustomChecked: false,
      validTimeObj:{
        firstChoose:24,
        secondChoose:48,
        chooseWho:1, //这里的值是1 2 3  之前错认为是 1 2 -1
        otherChoose:'' //用户的自定义选项值
      },
      defaultCheck:1 // 1：24小时,2：24小时,3无限制,4随机值

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
      scope: `$wux.specialUploadDialog`,
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
         * 处理单选事件
         *
         * @param {any} e
         */
        radioChange(e) {
          options.defaultRadio = e.detail.value
        },
        effectivenessRadioChange(e) {
          // const index = e.currentTarget.dataset.index
          // options.defaultEffectivenessRadio = e.detail.value
          // this.setData({
          //   [`${this.options.scope}.effectivenessSelectedRadioIndex`]: index
          // })
          var arr = e.detail.value.split('!')
          options.effectivenessCustomValue = arr[0]
          options.defaultCheck =  arr[1]
          this.setData({
            [`${this.options.scope}.effectivenessCustomValue`]:arr[0],
            [`${this.options.scope}.defaultCheck`]:arr[1]
          })

        },
        // 用来修改自定义输入框的 radio 的 value 值
        customEffectivenessInput(e) {
          // let selectedIndex = e.currentTarget.dataset.selectedIndex
          options.validTimeObj.otherChoose = e.detail.value
          this.setData({
            [`${this.options.scope}.validTimeObj.otherChoose`]: e.detail.value
          })
        },
        customEffectivenessFocus(e) {
          // this.setData({
          //   [`${this.options.scope}.effectivenessCustomChecked`]: true
          // })
        },
        /**
         * 确认行为
         *
         * @param {any} e
         */
        confirm(e) {
          const res = e.detail.value
          const arr = res.inputEffectiveness.split('!')
          res.inputEffectiveness =  arr[0]
          if(arr[1] ==4){
            res.inputEffectiveness = options.validTimeObj.otherChoose
          }
          this.hide(options.confirm(res))
        },
        /**
         * 取消行为
         *
         * @param {any} e
         */
        cancel(e) {

          let userSelectVal = options.effectivenessCustomValue
          if(options.defaultCheck == 4){
            userSelectVal = options.validTimeObj.otherChoose
            if(!userSelectVal){
              wx.showModal({
                title: '提示',
                content: '亲，自定义小时不能为空喔'
              })
              return
            }
          }
          let result ={
            inputNumber:options.inputNumber,
            inputName:options.inputNumber1,
            inputSex:options.defaultRadio,
            inputEffectiveness:userSelectVal
          }
          this.hide(options.cancel(result))
        },
        close(){
          if (typeof options.close === 'function') {
            this.hide(options.close())
            return
          }
          this.hide()
        },
        init(){
          let _this = this;

          if (typeof options.initMobValidate === 'function') {
            let disabled = !options.initMobValidate(options.inputNumber)
            this.setData({
              [`${this.options.scope}.confirmDisabled`]: disabled
            })
          }

          //初始化报价单时效
          const _validTime = options.effectivenessCustomValue //_validTime／effectivenessCustomValue 时效值 为空是新建 否则是更新
          if(_validTime !== 0 && !_validTime ){
              //新建报价单时取偏好设置中默认值
              const _radioIndex = options.validTimeObj.chooseWho ? options.validTimeObj.chooseWho : 1 //默认为第一个选项
              options.defaultCheck = _radioIndex  //_radioIndex === 3 是无限制
              options.effectivenessCustomValue = (_radioIndex === 3) ? -1 : _validTime
          }
          else if(options.validTimeObj.firstChoose == _validTime){
            options.defaultCheck = 1;
          }else if(options.validTimeObj.secondChoose == _validTime){
            options.defaultCheck = 2;
          }else if("-1" == _validTime){
            options.defaultCheck = 3;
          }else{
            options.defaultCheck = 4;
            options.validTimeObj.otherChoose = _validTime
          }
          _this.setData({
            [`${_this.options.scope}.defaultCheck`]:options.defaultCheck,
            [`${_this.options.scope}.validTimeObj.otherChoose`]:options.validTimeObj.otherChoose,
            [`${_this.options.scope}.effectivenessCustomValue`]:options.validTimeObj.otherChoose

          })
        }
      }
    })

    component.show()


    return component.hide
  }
}
