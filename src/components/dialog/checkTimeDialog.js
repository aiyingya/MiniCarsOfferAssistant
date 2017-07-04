
import Component from '../component'

export default {
  /**
   * 默认参数
   */
  setDefaults() {
    return {
      title: undefined,
      content: undefined,
      radioItems: {name: '现在关闭', value: '-1', checked: false},
      confirmDisabled: true,
      checkedValues: [],
      addTimes: '',
      reduceTimes: '',
      validsTime: ''
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

    console.log(options)
    let timeinterval = ''
    // 实例化组件
    const component = new Component({
      scope: `$wux.checkTimeDialog`,
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
          if (options.validTime > 0){
            let date = options.createdTime.replace(/-/g,'/')
            let deadline = new Date(Date.parse(new Date(date)) +  options.validTime * 60 * 60 * 1000);
            this.initializeClock(deadline);
          }else if(options.validTime == 0) {
            this.setData({
              [`${this.options.scope}.validsTime`]: '已失效'
            })
          }else {
            this.setData({
              [`${this.options.scope}.validsTime`]: '无限制'
            })
          }

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
         * 获取时差.
         *
         * @param {endtime}
         */
        getTimeRemaining(endtime) {
          let t = Date.parse(endtime) - Date.parse(new Date());
          let seconds = Math.floor((t / 1000) % 60);
          let minutes = Math.floor((t / 1000 / 60) % 60);
          let hours = Math.floor((t / (1000 * 60 * 60)) % 24);
          let days = Math.floor(t / (1000 * 60 * 60 * 24));
          return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
          };
        },
        /**
         * 有效时长倒计时.
         *
         * @param opts
         */
        initializeClock(endtime) {
          let that = this;

          function updateClock() {
            let t = that.getTimeRemaining(endtime);
            let days =  t.days > 0 ? `${t.days}天 `: '';
            let hours = ('0' + t.hours).slice(-2);
            let minutes = ('0' + t.minutes).slice(-2);
            let seconds = ('0' + t.seconds).slice(-2);

            that.setData({
              [`${that.options.scope}.validsTime`]: `${days}${hours}:${minutes}:${seconds}`
            })

            if (t.total <= 0) {
              clearInterval(timeinterval)
              that.setData({
                [`${that.options.scope}.validsTime`]: '已失效'
              })
            }
          }
          updateClock();
          timeinterval = setInterval(updateClock, 1000)
        },
        /**
         * 处理输入事件
         *
         * @param {any} e
         */
        checkboxChange(e) {
          let radioItems = options.radioItems
          let values = e.detail.value
          let name = e.currentTarget.dataset.name
          let disabled = !options.validate(e)

          if(radioItems.checked == false) {
            radioItems.checked = true
          }else {
            radioItems.checked = false
          }
          this.setData({
            [`${this.options.scope}.confirmDisabled`]: false,
            [`${this.options.scope}.radioItems`]: radioItems,
            [`${this.options.scope}.addTimes`]: '',
            [`${this.options.scope}.reduceTimes`]: '',
          })

        },
        handleAddTimes(e) {
          let disabled = false
          let addTimes = e.detail.value
          let radioItems = options.radioItems

          if (typeof options.validate === 'function') {
            disabled = !options.validate(e)
          }
          radioItems.checked = false
          this.setData({
            [`${this.options.scope}.confirmDisabled`]: disabled,
            [`${this.options.scope}.addTimes`]: addTimes,
            [`${this.options.scope}.reduceTimes`]: '',
            [`${this.options.scope}.radioItems`]: radioItems
          })

        },
        handleReduceTimes(e) {
          let disabled = false
          let reduceTimes = e.detail.value
          let radioItems = options.radioItems

          if (typeof options.validate === 'function') {
            disabled = !options.validate(e)
          }
          radioItems.checked = false
          this.setData({
            [`${this.options.scope}.confirmDisabled`]: disabled,
            [`${this.options.scope}.addTimes`]: '',
            [`${this.options.scope}.reduceTimes`]: reduceTimes,
            [`${this.options.scope}.radioItems`]: radioItems
          })
        },
        /**
         * 确认行为
         *
         * @param {any} e
         */
        confirm(e) {
          let value = {}
          let res = e.detail.value
          let radioItems = options.radioItems

          if(radioItems.checked) {
            value.type = 'close'
            value.val = '-1'
          }else {
            if(res.addTime) {
              value.type = 'add'
              value.val = res.addTime
            }else if(res.reduceTime) {
              value.type = 'reduce'
              value.val = res.reduceTime
            }
          }
          clearInterval(timeinterval)
          this.hide(options.confirm(value))
        },
        /**
         * 取消行为
         *
         * @param {any} e
         */
        cancel(e) {
          clearInterval(timeinterval)
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
