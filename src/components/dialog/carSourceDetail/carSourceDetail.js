import Component from '../../component'
import * as wxapi from 'fmt-wxapp-promise'

export default {

  component: null,

  data() {
    return {
      close() {}
    }
  },

  /**
   * 货源详情列表
   *
   * @param {Object} opts 配置项
   * @param {String} opts.carModel
   * @param {String} opts.carSourceItem
   * @param {Function} opts.close
   * @param {Function} opts.bookCar
   * @param {Function} opts.Contact
   * @param {Function} opts.JumpTo
   * @param {Function} opts.SelectLogisticsBlock
   * @param {Function} opts.close
   */
  sourceDetail(opts) {
    const that = this

    const setDefaults = function () {
      return {
        // 当前页面拥有三个状态 sourceList(行情列表页面) sourceDetail(行情详情页面) contactList(联络方式列表)
        page: 'sourceDetail',
        carModel: {},
        carSourceItem: {},
        originalText: '',
        hasFoldOriginalText: true,
        hasFoldTagCollection: true,
        showCopyOriginalText: true
      }
    }

    const options = Object.assign({
      animateCss: undefined,
      visible: !1
    }, setDefaults(), opts)

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
    this.component = new Component({
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
          if (typeof options.close === 'function') {
            this.hide(options.close())
            return
          }
          this.hide()
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
        handlerCreateQuoted(e) {
          typeof options.handlerCreateQuoted === `function` && options.handlerCreateQuoted(e)
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
          wxapi.makePhoneCall({ phoneNumber: contact })
            .then()
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
          wxapi.setClipboardData({ data: originalText }).then((res) => {
            wxapi.showToast({
              title: '复制成功',
              icon: 'success',
              duration: 2000
            })
          }, (err) => {

          })
        }
      }
    })

    this.component.show()

    // 加载原文数据
    if (!options.carSourceItem.supplierSelfSupport && !options.carSourceItem.viewModelContentItems) {
      this.component.setData({
        [`${this.component.options.scope}.carSourceItem.viewModelLoading`]: '原文加载中...'
      })

      const app = getApp()
      app.saasService.requestCarSourceContent(options.carSourceItem.id, {
        success: function (res) {
          console.log(res)
          if (res) {
            /// 原文基本数据
            const contentItems = []
            const content = res.content
            options.originalText = content
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

              that.component.setData({
                [`${that.component.options.scope}.carSourceItem.viewModelContentItems`]: contentItems
              })
            } else {
              that.component.setData({
                [`${that.component.options.scope}.carSourceItem.viewModelLoading`]: '无原文数据'
              })
            }
          } else {
            that.component.setData({
              [`${that.component.options.scope}.carSourceItem.viewModelLoading`]: '加载失败'
            })
          }
        },
        fail: function () {
          that.component.setData({
            [`${that.component.options.scope}.carSourceItem.viewModelLoading`]: '加载失败'
          })
        }
      })
    }

    return this.component.hide
  },

  /**
   * 当前货源来源的公司列表
   *
   * {Object} opts
   * {String} opts.spuId
   * {Number} opts.quotationPrice
   * {Object} opts.carModel
   * {Object} opts.mode
   * @returns
   */
  companyList(opts) {
    const that = this

    const setDefaults = function() {
      return {
        page: 'companyList',

        spuId: '',
        quotationPrice: 0,

        carModel: {},
        mode: {}
      }
    }

    const options = Object.assign({
      animateCss: undefined,
      visible: !1
    }, setDefaults(), opts)

    this.component = new Component({
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
          if (typeof options.close === 'function') {
            this.hide(options.close())
            return
          }
          this.hide()
        },
        handlerCompanyClick(e) {
          typeof options.contact === 'function' && options.contact()
        },
        handlerCreateQuoted(e) {
          typeof options.handlerCreateQuoted === `function` && options.handlerCreateQuoted(e)
        }
      }
    })

    this.component.show()

    that.component.setData({
      [`${that.component.options.scope}.status`]: "加载中"
    })
    const app = getApp()
    app.saasService.getCompanies(options.spuId, options.quotationPrice)
      .then(res => {
        that.component.setData({
          [`${that.component.options.scope}.companyList`]: res,
          [`${that.component.options.scope}.status`]: '没有供应商所在公司数据',
        })
      })
      .catch(err => {
        that.component.setData({
          [`${that.component.options.scope}.status`]: "加载失败"
        })
      })

    return this.component.hid
  },

  /**
   * 电话确认界面展示
   *
   * @param {Object} opts
   * @param {String} opts.spuId
   * @param {Number} opts.quotationPrice
   * @param {String} opts.companyId
   * @param {String} opts.companyName
   * @param {String} opts.supplierId
   * @param {String} opts.from
   * @param {Function} opts.contact
   * @returns
   */
  contactList(opts) {
    const that = this

    const setDefaults = function() {
      return {
        page: 'contactList',
        // 必要参数
        spuId: '',
        quotationPrice: 0,
        companyId: '',
        companyName: '',
        from: null,
        // 返回数据
        contactList: {}
      }
    }

    const options = Object.assign({
      animateCss: undefined,
      visible: !1
    }, setDefaults(), opts)

    // 当传入的 from 有值时，则说明需要将上一个页面的保存的参数拿出来以备返回按钮
    var oldOptions
    if (options.from && options.from.length) {
      oldOptions = this.component.options.data
    }

    this.component = new Component({
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
          if (typeof options.close === 'function') {
            this.hide(options.close())
            return
          }
          this.hide()
        },
        /**
         * 后退
         *
         */
        back(e) {
          const from = e.currentTarget.dataset.from
          if (from.length) {
            that.open(from, oldOptions)
          }
        },
        handlerContactClick(e) {
          const contact = e.currentTarget.dataset.contact
          const contactPromise = wxapi.makePhoneCall({ phoneNumber: contact })
          .then(res => {
            console.log('拨打电话' + contact + '成功')
          })

          typeof options.contact === 'function' && options.contact(contactPromise)
        }
      }
    })

    this.component.show()

    that.component.setData({
      [`${that.component.options.scope}.status`]: '加载中'
    })
    const app = getApp()
    app.saasService.getContacts(options.spuId, options.quotationPrice, options.companyId, options.supplierId)
      .then(res => {
        that.component.setData({
          [`${that.component.options.scope}.contactList`]: res[0],
          [`${that.component.options.scope}.status`]: '没有供应商联系方式'
        })
      })
      .catch(err => {
        that.component.setData({
          [`${that.component.options.scope}.status`]: '加载失败'
        })
      })

    return this.component.hide
  },

  open(page, opts) {
    if (page === 'companyList') {
      return this.companyList(opts)
    } else if (page === 'contactList') {
      return this.contactList(opts)
    } else if (page === 'sourceDetail') {
      return this.sourceDetail(opts)
    }
  }
}
