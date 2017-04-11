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
      carModel: {},
      skuItem: {},
      carSourceItem: {}
    }
  },
  /**
   * 显示dialog组件
   * @param {Object} opts 配置项
   * @param {String} opts.spuId
   * @param {String} opts.carModel
   * @param {String} opts.skuItem
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
        jumpTo(e) {
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
          if (res) {
            /// 原文基本数据
            const contentItems = []
            const content = res.content
            if (content && content.length) {
              const indexOf = res.indexOf
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
