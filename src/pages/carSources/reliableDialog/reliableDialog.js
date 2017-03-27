import tools from '../../../lib/tools'

/**
 * 自定义 reliableDialog 组件
 * @param {Object} $scope 作用域对象
 */
class wux {
  constructor($scope) {
    Object.assign(this, {
      $scope
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
      reliableDialog: {
        visible: !1
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
    this.__initreliableDialog()
  }

  /**
   * 对话框组件
   */
  __initreliableDialog() {
    const that = this
    const extend = that.tools.extend
    const clone = that.tools.clone
    const $scope = that.$scope

    that.$wuxReliableDialog = {
      /**
       * 默认参数
       */
      defaults: {
        showCancel: !0,
        spuId: '',
        carSource: {}
      },
      /**
       * 显示reliableDialog组件
       * @param {Object} opts 参数对象
       * @param {Function} opts.supplier 供应商对象
       * @param {Function} opts.close 点击按钮按钮的回调函数
       */
      open(opts = {}) {
        const options = extend(clone(this.defaults), opts)
        const hideReliableDialog = (cb) => {
          that.setHidden('reliableDialog')
          typeof cb === 'function' && cb()
        }
        const noHideReliableDialog = (cb) => {
          typeof cb === 'function' && cb()
        }

        // 渲染组件

        $scope.setData({
          [`$wux.reliableDialog`]: options,
          [`$wux.reliableDialog.reliableDialogClose`]: `reliableDialogClose`,
          [`$wux.reliableDialog.reliableDialogFollow`]: `reliableDialogFollow`,
          [`$wux.reliableDialog.reliableDialogReliable`]: `reliableDialogReliable`
        })

        // 绑定tap事件
        $scope.reliableDialogClose = (e) => {
          hideReliableDialog(options.close(options.carSource))
        }
        $scope.reliableDialogFollow = (e) => {
          // 关注
        }
        $scope.reliableDialogReliable = (e) => {
          const reliable = e.currentTarget.dataset.reliable
          if (reliable === '1') {
            if (options.carSource.hasBeenReliableByUser === 1) {
              if (options.carSource.hasBeenReliableCount) {
                options.carSource.hasBeenReliableCount --
              }
              options.carSource.hasBeenReliableByUser = 0
            } else {
              if (options.carSource.hasBeenReliableByUser === 0) {
              } else {
                if (options.carSource.hasBeenUnReliableCount) {
                  options.carSource.hasBeenUnReliableCount --
                }
              }
              options.carSource.hasBeenReliableCount ++
              options.carSource.hasBeenReliableByUser = 1
            }
          } else if (reliable === '-1') {
            if (options.carSource.hasBeenReliableByUser === -1) {
              if (options.carSource.hasBeenUnReliableCount) {
                options.carSource.hasBeenUnReliableCount --
              }
              options.carSource.hasBeenReliableByUser = 0
            } else {
              if (options.carSource.hasBeenReliableByUser === 0) {
              } else {
                if (options.carSource.hasBeenReliableCount) {
                  options.carSource.hasBeenReliableCount --
                }
              }
              options.carSource.hasBeenUnReliableCount ++
              options.carSource.hasBeenReliableByUser = -1
            }
          }
          $scope.setData({
            [`$wux.reliableDialog.carSource`]: options.carSource
          })
        }

        that.setVisible('reliableDialog')

        return $scope.reliableDialogClose
      },
    }
  }

  /**
   * 设置元素显示
   */
  setVisible(key, className = 'weui-animate-fade-in') {
    this.$scope.setData({
      [`$wux.${key}.visible`]: !0,
      [`$wux.${key}.animateCss`]: className
    })
  }

  /**
   * 设置元素隐藏
   */
  setHidden(key, className = 'weui-animate-fade-out', timer = 300) {
    this.$scope.setData({
      [`$wux.${key}.animateCss`]: className
    })

    setTimeout(() => {
      this.$scope.setData({
        [`$wux.${key}.visible`]: !1
      })
    }, timer)
  }
}

export default wux
