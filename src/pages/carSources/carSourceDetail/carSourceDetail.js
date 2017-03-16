import tools from '../../../lib/tools'

/**
 * 自定义 carSourceDetailDialog 组件
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
      carSourceDetailDialog: {
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
    this.__initcarSourceDetailDialog()
  }

  /**
   * 对话框组件
   */
  __initcarSourceDetailDialog() {
    const that = this
    const extend = that.tools.extend
    const clone = that.tools.clone
    const $scope = that.$scope

    that.$wuxCarSourceDetailDialog = {
      /**
       * 默认参数
       */
      defaults: {
        showCancel: !0,
        hasFoldOriginalText: false,
        hasFoldTagCollection: false,
        spuId: '',
        carModel: {},
        skuItem: {},
        carSourceItem: {},
      },
      /**
       * 显示carSourceDetailDialog组件
       * @param {Object} opts 参数对象
       * @param {Function} opts.supplier 供应商对象
       * @param {Function} opts.close 点击按钮按钮的回调函数
       */
      open(opts = {}) {
        const options = extend(clone(this.defaults), opts)
        /// 原文基本数据

        const contentItems = []
        const content = options.carSourceItem.content
        if (content && content.length) {
          const indexOf = options.carSourceItem.indexOf
          for (let i = 0; i < content.length; i++) {
            const contentItem = content[i]
            if (indexOf.includes(i)) {
              contentItems.push({
                a: contentItem,
                b: true
              })
            } else {
              contentItems.push({
                a: contentItem,
                b: false
              })
            }
          }
          options.carSourceItem.viewModelContentItems = contentItems
        }

        if (options.carSourceItem.viewModelSelectedCarSourcePlace.destinationList) {
          for (let logisticsDestination of options.carSourceItem.viewModelSelectedCarSourcePlace.destinationList) {
            if (logisticsDestination.destType === 'store') {
              logisticsDestination.viewModelDestTypeDesc = '门店'
            } else if (logisticsDestination.destType === 'station') {
              logisticsDestination.viewModelDestTypeDesc = '驿站'
            } else if (logisticsDestination.destType === 'mainline') {
              logisticsDestination.viewModelDestTypeDesc = '干线自提'
            }
          }
        }

        const hideCarSourceDetailDialog = (cb) => {
          that.setHidden('carSourceDetailDialog')
          typeof cb === 'function' && cb()
        }
        const noHideCarSourceDetailDialog = (cb) => {
          typeof cb === 'function' && cb()
        }

        // 渲染组件

        $scope.setData({
          [`$wux.carSourceDetailDialog`]: options,
          [`$wux.carSourceDetailDialog.carSourceDetailDialogClose`]: `carSourceDetailDialogClose`,
          [`$wux.carSourceDetailDialog.carSourceDetailDialogBookCar`]: `carSourceDetailDialogBookCar`,
          [`$wux.carSourceDetailDialog.carSourceDetailDialogJumpTo`]: `carSourceDetailDialogJumpTo`,
          [`$wux.carSourceDetailDialog.carSourceDetailDialogSelectLogisticsBlock`]: `carSourceDetailDialogSelectLogisticsBlock`,
          [`$wux.carSourceDetailDialog.carSourceDetailDialogSwitchFold`]: `carSourceDetailDialogSwitchFold`,
          [`$wux.carSourceDetailDialog.carSourceDetailDialogReportError`]: `carSourceDetailDialogReportError`
        })

        // 绑定tap事件
        $scope.carSourceDetailDialogClose = (e) => {
          hideCarSourceDetailDialog(options.close(e))
        }
        $scope.carSourceDetailDialogBookCar = (e) => {
          noHideCarSourceDetailDialog(options.bookCar(e))
        }
        $scope.carSourceDetailDialogJumpTo = (e) => {
          options.hasFoldTagCollection = !options.hasFoldTagCollection
          $scope.setData({
            [`$wux.carSourceDetailDialog.hasFoldTagCollection`]: options.hasFoldTagCollection
          })
        }

        /**
         * 选择不同的物流终点
         * @param e
         */
        $scope.carSourceDetailDialogSelectLogisticsBlock = (e) => {
          // 选择物流行为

          noHideCarSourceDetailDialog(options.selectLogisticsBlock(e))
        }

        $scope.carSourceDetailDialogSwitchFold = (e) => {
          options.hasFoldOriginalText = !options.hasFoldOriginalText
          $scope.setData({
            [`$wux.carSourceDetailDialog.hasFoldOriginalText`]: options.hasFoldOriginalText
          })
        }

        $scope.carSourceDetailDialogReportError = (e) => {
          noHideCarSourceDetailDialog(options.reportError(e))
        }

        that.setVisible('carSourceDetailDialog')

        return $scope.carSourceDetailDialogClose
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