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
        options.carSourceItem.originalText = "\
        [甜点车款4]一汽大众\
        17款速腾1528白16500\
        17款速腾1628白17500\
        17款高尔夫百万辆纪念版1449白16500\
        17款高尔夫百万辆纪念版1549白17500\
        16款宝来1198白15000\
        16款宝来1318白15000\
        浙江现车 本月开票,可单台，量大价更优"

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
          noHideCarSourceDetailDialog(options.jumpTo(e))
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