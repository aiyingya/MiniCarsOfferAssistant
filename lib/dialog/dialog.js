import tools from '../tools'

/**
 * 自定义 dialog 组件
 * @param {Object} $scope 作用域对象
 */
class wux {
  constructor($scope) {
    Object.assign(this, {
      $scope,
    })
    this.__init()
  }

  /**
   * 初始化类方法
   */
  __init() {
    this.__initDefaults()
    this.__initTools()
    this.__initComponents()
  }

  /**
   * 默认参数
   */
  __initDefaults() {
    this.$wux = {
      dialog: {
        visible: !1,
      },
    }

    this.$scope.setData({
      [`$wux`]: this.$wux
    })
  }

  /**
   * 工具方法
   */
  __initTools() {
    this.tools = new tools
  }

  /**
   * 初始化所有组件
   */
  __initComponents() {
    this.__initDialog()
  }

  /**
   * 对话框组件
   */
  __initDialog() {
    const that = this
    const extend = that.tools.extend
    const clone = that.tools.clone
    const $scope = that.$scope

    that.$wuxDialog = {
      /**
       * 默认参数
       */
      defaults: {
        showCancel: !0,
        title: '',
        content: '',
        phoneNumber: '',
        phoneNumberPlaceholder: '',
        confirmText: '确定',
        confirmDisabled: true,
        cancelText: '取消',
        resultPhoneNumber: '',
        confirm: function(res) {},
        cancel: function() {},
      },
      /**
       * 显示dialog组件
       * @param {Object} opts 参数对象
       * @param {Boolean} opts.showCancel 是否显示取消按钮
       * @param {String} opts.title 提示标题
       * @param {String} opts.content 提示文本
       * @param {String} opts.phoneNumber 表单中的电话号码
       * @param {String} opts.phoneNumberPlaceholder 表单中的电话号码输入框的 placeholder
       * @param {String} opts.confirmText 确定按钮的文字
       * @param {String} opts.cancelText 取消按钮的文字
       * @param {Function} opts.confirm 点击确定按钮的回调函数
       * @param {Function} opts.cancel 点击按钮按钮的回调函数
       */
      open(opts = {}) {
        const options = extend(clone(this.defaults), opts)
        const hideDialog = (cb) => {
          that.setHidden('dialog')
          typeof cb === 'function' && cb()
        }

        // 渲染组件
        console.log(options);
        $scope.setData({
          [`$wux.dialog`]: options,
          [`$wux.dialog.dialogConfirm`]: `dialogConfirm`,
          [`$wux.dialog.dialogCancel`]: `dialogCancel`,
          [`$wux.dialog.phoneNumberInput`]: `phoneNumberInput`,
          [`$wux.dialog.phoneNumberConfirm`]: `phoneNumberConfirm`,
          [`$wux.dialog.phoneNumberFocus`]: `phoneNumberFocus`,
          [`$wux.dialog.phoneNumberBlur`]: `phoneNumberBlur`
        })

        // 绑定tap事件
        $scope.dialogConfirm = (e) => {
          let res = e.detail.value
          hideDialog(options.confirm(res))
        }
        $scope.dialogCancel = (e) => {
          hideDialog(options.cancel)
        }

        $scope.phoneNumberInput = (e) => {
          that.$scope.setData({
            [`$wux.dialog.confirmDisabled`]: e.detail.value.length !== 11
          })
        }

        $scope.phoneNumberConfirm = (e) => {
        }

        $scope.phoneNumberBlur = (e) => {
        }

        $scope.phoneNumberFocus = (e) => {
        }

        that.setVisible('dialog')

        return $scope.dialogCancel
      },
    }
  }

  /**
   * 设置元素显示
   */
  setVisible(key, className = 'weui-animate-fade-in') {
    this.$scope.setData({
      [`$wux.${key}.visible`]: !0,
      [`$wux.${key}.animateCss`]: className,
    })
  }

  /**
   * 设置元素隐藏
   */
  setHidden(key, className = 'weui-animate-fade-out', timer = 300) {
    this.$scope.setData({
      [`$wux.${key}.animateCss`]: className,
    })

    setTimeout(() => {
      this.$scope.setData({
        [`$wux.${key}.visible`]: !1,
      })
    }, timer)
  }
}

export default wux