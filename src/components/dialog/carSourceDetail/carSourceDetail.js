// @flow
import Component from '../../component'
import * as wxapi from 'fmt-wxapp-promise'
import { $wuxToast } from "../../wux"
import { container } from '../../../landrover/business/index'
import SAASService from '../../../services/saas.service'
import $settingRemarkLabelDialog from '../settingRemarkLabelDialog/settingRemarkLabelDialog'


const saasService: SAASService = container.saasService
const userService: UserService = container.userService
export default {

  component: null,

  data() {
    return {
      close() { }
    }
  },

  /**
   * 货源详情列表
   *
   * @param {Object} opts 配置项
   * @param {String} opts.carModel
   * @param {CarSource} opts.carSourceItem
   * @param {Function} opts.close
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

    // 判断是否该显示 复制原文 按钮
    options.showCopyOrignalText = wx.setClipboardData != null ? true : false

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
        close(e) {
          if (typeof options.close === 'function') {
            this.hide(options.close())
            return
          }
          this.hide()
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
        handlerGoMore(e) {
          typeof options.handlerGoMore === `function` && options.handlerGoMore(e)
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
          const phoneNumber = e.currentTarget.dataset.contact
          wxapi.makePhoneCall({ phoneNumber: phoneNumber })
            .catch(err => {
              if (err.message === 'makePhoneCall:fail cancel') {
                return Promise.reject(err)
              }
              // 如果拨打电话出错， 则统一将电话号码写入黏贴板
              if (phoneNumber && phoneNumber.length) {
                if (wx.canIUse('setClipboardData')) {
                  wxapi.setClipboardData({ data: phoneNumber })
                    .then(() => {
                      $wuxToast.show({
                        type: 'text',
                        timer: 3000,
                        color: '#fff',
                        text: '号码已复制， 可粘贴拨打'
                      })
                    })
                    .catch(err => {
                      console.error(err)
                      $wuxToast.show({
                        type: 'text',
                        timer: 2000,
                        color: '#fff',
                        text: '号码复制失败， 请重试'
                      })
                    })
                } else {
                  $wuxToast.show({
                    type: 'text',
                    timer: 2000,
                    color: '#fff',
                    text: '你的微信客户端版本太低， 请尝试更新'
                  })
                  return Promise.reject(err)
                }
              }
            })
          // 这里打给客服 不需要上报手机
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
    if (!options.carSourceItem.viewModelContentItems) {
      this.component.setData({
        [`${this.component.options.scope}.carSourceItem.viewModelLoading`]: '原文加载中...'
      })

      saasService.getCarSourceOriginalMessage(options.carSourceItem.id)
        .then(res => {
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
        })
        .catch(err => {
          that.component.setData({
            [`${that.component.options.scope}.carSourceItem.viewModelLoading`]: '加载失败'
          })
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

    const setDefaults = function () {
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
        close(e) {
          if (typeof options.close === 'function') {
            this.hide(options.close())
            return
          }
          this.hide()
        },
        handlerCompanyClick(e) {
          const companyName = e.currentTarget.dataset.companyName
          const companyId = e.currentTarget.dataset.companyId
          typeof options.contact === 'function' && options.contact({ companyId, companyName })
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
    saasService.getCompanies(options.spuId, options.quotationPrice)
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
   * @param {Number} opts.spuId
   * @param {Number} opts.quotedPrice
   * @param {Number} opts.carSourceId
   * @param {Number} opts.companyId
   * @param {String} opts.companyName
   * @param {String} opts.from
   * @param {Function} opts.contact
   * @returns
   */
  contactList(opts) {
    const that = this

    const setDefaults = function () {
      return {
        page: 'contactList',
        // 必要参数
        spuId: null,
        quotedPrice: null,
        carSourceId: null,
        companyId: null,
        companyName: null,
        from: null,
        // 返回数据
        companyModel: {}
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
        /**
         * 获取商品所有标签
         *
         * @param carSourceId 商品id
         */
        getTags(carSourceId) {
          const userId = userService.auth.userId
          return saasService.getQueryCompanyRemark(userId, carSourceId).then((res: CompanyRemark) => {
            return res
          })
        },
        handlerContactClick(e) {
          const
            supplier = e.currentTarget.dataset.supplier,
            phoneNumber = supplier.supplierPhone,
            carSourceId = options.carSourceId
          const contactPromise = wxapi.makePhoneCall({ phoneNumber })
            .catch(err => {
              if (err.message === 'makePhoneCall:fail cancel') {
                return Promise.reject(err)
              }
              // 如果拨打电话出错， 则统一将电话号码写入黏贴板
              if (phoneNumber && phoneNumber.length) {
                if (wx.canIUse('setClipboardData')) {
                  wxapi.setClipboardData({ data: phoneNumber })
                    .then(() => {
                      $wuxToast.show({
                        type: 'text',
                        timer: 3000,
                        color: '#fff',
                        text: '号码已复制， 可粘贴拨打'
                      })
                    })
                    .catch(err => {
                      console.error(err)
                      $wuxToast.show({
                        type: 'text',
                        timer: 2000,
                        color: '#fff',
                        text: '号码复制失败， 请重试'
                      })
                    })
                } else {
                  $wuxToast.show({
                    type: 'text',
                    timer: 2000,
                    color: '#fff',
                    text: '你的微信客户端版本太低， 请尝试更新'
                  })
                  return Promise.reject(err)
                }
              }
            })

          /**
           * 联系电话弹层，统一上报位置
           */
          const supplierId = supplier.supplierId
          saasService.pushCallRecord(supplierId, phoneNumber, carSourceId)

          /**
           * 拨打电话成功后
           * 1.推送成功事件
           * 2.有carSourceId就提示用户打标签
           */
          contactPromise
            .then(res => {
              console.log('拨打电话' + supplier.supplierPhone + '成功')
              // 推送成功事件
              typeof options.contact === 'function' && options.contact(supplier)

              // 有carSourceId就提示用户打标签
              const userId = userService.auth.userId
              const mobile = userService.mobile
              carSourceId && this.getTags(carSourceId).then((res: CompanyRemark) => {
                setTimeout(() => {
                  $settingRemarkLabelDialog.open({
                    currentTag: res,
                    handlerSettingTags: (tags, comment, price) => {
                      // 让用户打标签
                      saasService.settingCompanyTags(
                        carSourceId,
                        comment,
                        price,
                        userId,
                        tags,
                        mobile
                      ).then((res) => {
                        // 成功新增一条标签记录
                        wxapi.showToast({
                          title: '备注成功',
                          icon: 'success',
                          duration: 2000
                        }).then(() => {
                          // 推送成功事件
                          typeof options.lableSuccess === 'function' && options.lableSuccess(supplier)
                        })
                      })
                    },
                    close: () => {}
                  })
                }, 2000)
              })
            })
            .catch(err => {
              console.error(err, '拨打电话' + supplier.supplierPhone + '失败')
            })
        }
      }
    })

    this.component.show()

    this.component.setData({
      [`${that.component.options.scope}.status`]: '加载中'
    })

    let promise = null
    if (opts.carSourceId != null) {
      promise = saasService.retrieveContactsByCarSourceItem(opts.carSourceId)
    } else {
      // 傅斌 这个地方通过使用 spuId 是否存在来判断该用哪个接口
      if (opts.spuId != null) {
        // 车源列表的众数获取供应商列表
        promise = saasService.getAllSuppliersByCompanyAndPriceForSPU(opts.spuId, opts.companyId, opts.quotedPrice)
      } else {
        // 供应商页面中获取供应商列表
        promise = saasService.getAllSuppliersByCompany(opts.companyId)
      }
      // ...或许还有其他未开发类型的电话列表接口
    }
    promise
      .then(res => {
        this.component.setData({
          [`${this.component.options.scope}.supplierModels`]: res,
          [`${this.component.options.scope}.status`]: '没有供应商联系方式'
        })
      })
      .catch(err => {
        this.component.setData({
          [`${this.component.options.scope}.status`]: '加载失败'
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
