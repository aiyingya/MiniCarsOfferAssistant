import Component from '../../../components/component'

export default {
  /**
   * 默认参数
   */
  setDefaults() {
    return {
      hasFoldOriginalText: true,
      hasFoldTagCollection: true,
      spuId: '',
      showCopyOriginalText: true,
      originalText: '',
      carModel: {},
      carSourceItem: {}
    }
  },
  /**
   * 显示dialog组件
   * @param {Object} opts 配置项
   * @param {String} opts.spuId
   * @param {String} opts.carModel
   * @param {String} opts.carSourceItem
   * @param {Function} opts.close
   * @param {Function} opts.bookCar
   * @param {Function} opts.Contact
   * @param {Function} opts.JumpTo
   * @param {Function} opts.SelectLogisticsBlock
   * @param {Function} opts.close
   */
  open(opts = {}) {
    const options = Object.assign({
      animateCss: undefined,
      visible: !1
    }, this.setDefaults(), opts)

    // 将物流门店逻辑处理修复
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

    // 判断是否该显示 复制原文 按钮
    options.showCopyOrignalText = wx.canIUse('setClipboardData')

    // 实例化组件
    const component = new Component({
      scope: `$wux.carSourceDetailDialog`,
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
        onTouchMoveWithCatch(e) { },

        close(e) {
          this.hide(options.close)
        },
        /**
         * 订车行为
         *
         * @param {any} e
         */
        bookCar(e) {
          typeof options.bookCar === `function` && options.bookCar(options.carSourceItem)
        },
        /**
         * 联络用户
         *
         * @param {any} e
         */
        contact(e) {
          typeof options.contact === `function` && options.contact(e)
        },
        /**
         * 跳转行为
         *
         * @param {any} e
         */
        switchFoldTag(e) {
          options.hasFoldTagCollection = !options.hasFoldTagCollection
          this.setData({
            [`${this.options.scope}.hasFoldTagCollection`]: options.hasFoldTagCollection
          })
        },
        /**
         * 联络公司客服
         *
         * @param {any} e
         */
        contactStaff(e) {
          const contact = e.currentTarget.dataset.contact
          wx.makePhoneCall({
            phoneNumber: contact,
            success: function (res) { }
          })
        },
        /**
         * 选择不同的物流终点
         * @param e
         */
        selectLogisticsBlock(e) {
          // 选择物流行为
          const carSource = options.selectLogisticsBlock(e)
          options.carSourceItem = carSource
          this.setData({
            [`${this.options.scope}.carSourceItem`]: options.carSourceItem
          })
        },

        switchFold(e) {
          options.hasFoldOriginalText = !options.hasFoldOriginalText
          this.setData({
            [`${this.options.scope}.hasFoldOriginalText`]: options.hasFoldOriginalText
          })
        },

        reportError(e) {
          typeof options.reportError === `function` && options.reportError(e)
        },
        /**
         * 复制原文到剪切板
         * @param e
         */
        copyOrignalText(e) {
          const originalText = options.originalText
          wx.setClipboardData({data: originalText}).then((res) => {

          }, (err) => {

          })
        }
      }
    })

    component.show()

    // 加载原文数据
    if (!options.carSourceItem.supplierSelfSupport && !options.carSourceItem.viewModelContentItems) {
      component.setData({
        [`${component.options.scope}.carSourceItem.viewModelLoading`]: '原文加载中...'
      })

      const app = getApp()
      app.saasService.requestCarSourceContent(options.carSourceItem.id, {
        success: function (res) {
          console.log(res)
          if (res) {
            /// 原文基本数据
            const contentItems = []
            const content = res.content
            if (content && content.length) {
              const indexOf = res.indexOf
              let i = 0;
              for (let contentItem of content) {
                if (indexOf.indexOf(i) !== -1) {
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
                i = i + 1
              }

              component.setData({
                [`${component.options.scope}.carSourceItem.viewModelContentItems`]: contentItems
              })
            } else {
              component.setData({
                [`${component.options.scope}.carSourceItem.viewModelLoading`]: '无原文数据'
              })
            }
          } else {
            component.setData({
              [`${component.options.scope}.carSourceItem.viewModelLoading`]: '加载失败'
            })
          }
        },
        fail: function () {
          component.setData({
            [`${component.options.scope}.carSourceItem.viewModelLoading`]: '加载失败'
          })
        }
      })
    }

    return component.hide
  }
}
