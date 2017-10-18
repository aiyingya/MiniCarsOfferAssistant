// @flow


import $wuxCarSourceDetailDialog from '../../components/dialog/carSourceDetail/carSourceDetail'
import {
  container, system, util
} from '../../landrover/business/index'

import {
  $wuxToast,
  $wuxTrack
} from "../../components/wux"

import * as wxapi from 'fmt-wxapp-promise'
import SAASService from '../../services/saas.service'
import UserService from '../../services/user.service'
import utils from '../../utils/util'
import CarSourceManager from '../../components/carSource/carSource.manager'

const saasService: SAASService = container.saasService
const userService: UserService = container.userService
// let userCommentPaginationList: PaginationList<UserComment> | null = null

Page({
  userCommentPaginationList: {},
  carSourcePaginationList: {},
  spuPaginationList: {},
  data: {
    // 行情信息
    company: null,
    carSources: [],
    spuForCarSources: null,
    carSourcesEmptyStatus: {
      iconPath: '/images/icons/icon_evaluate_empty.png',
      title: '该供应商暂无车辆行情',
      description: ''
    },
    isDefaultRecommend: true,
    isSearching: false,
    searchResults: [],
    searchViewModel: {
      searchBarValue: '',
      disabled: false,
      searchBarPlaceholder: '🔍 输入品牌/车系/指导价'
    },

    // 联系方式
    contactRecords: [],
    contactRecordsEmptyStatus: {
      iconPath: '/images/icons/icon_evaluate_empty.png',
      title: '该供应商暂无联系方式',
      description: ''
    },

    // 评价内容
    comments: [],
    commentsEmptyStatus: {
      iconPath: '/images/icons/icon_evaluate_empty.png',
      title: '该供应商暂无评论信息',
      description: '如果您与供应商有过成交或沟通， 请尽快评价哦'
    },

    submitTags: [
      {
        id: 0,
        name: '靠谱',
        imageNormal: '/images/icons/icon_reliable_face_off.png',
        imageHighlight: '/images/icons/icon_reliable_face.png',
        highlightClass: 'reliable_highlight',
        value: '靠谱'
      },
      {
        id: 1,
        name: '不靠谱',
        imageNormal: '/images/icons/icon_unreliable_face_off.png',
        imageHighlight: '/images/icons/icon_unreliable_face.png',
        highlightClass: 'unreliable_highlight',
        value: '不靠谱'
      }
    ],
    submitSelectedTagIndex: -1,
    submitTextareaValue: '',
    submitButtonValid: false,
    submitButtonTagValid: false,

    filters: null,
    filtersSelectedIndexes: null,

    activeIndex: 0
  },
  onLoad(options) {
    const system = wxapi.getSystemInfoSync()
    const company = utils.urlDecodeValueForKeyFromOptions('company', options)

    // 以下数值通通为页面元素的高度  scrollViewHeight：为获取滚动元素的高度数值
    this.setData({
      company,
      scrollViewHeight: system.windowHeight - util.px(188 + 96 + 210),
      linkmanViewHeight: system.windowHeight - util.px(188),
      carSourceViewHeight: system.windowHeight - util.px(188 + 200)
    })

    wxapi.showToast({ title: '加载中...', icon: 'loading', mask: true })
      .then(() => {
        return this.filters()
          .then(res => {
            return this.refresh(company.companyId)
          })
      })
      .then(() => { wxapi.hideToast() })
      .catch(() => { wxapi.hideToast() })
  },
  onShow() {
  },
  onScrollToLower(e) {
    const tabIndex = e.currentTarget.dataset.tabIndex

    if (tabIndex == 0) {
      if (this.data.isSearching === true) {
        this.spuLoadMore()
          .then(res => {
            this.setData({ searchResults: res.list })
          })
      } else {
        this.carSourcesLoadMore()
          .then((res) => {
            this.setData({ carSources: res.list })
          })
      }
    } else if (tabIndex == 1) {
      // do nothing
    } else if (tabIndex == 2) {
      this.commentsLoadMore()
        .then((res: PaginationList<UserComment>) => {
          this.setData({
            comments: res.list
          })
        })
    } else {
      console.error('错误的 tab index')
    }
  },
  refresh(companyId: number) {
    // 更新公司数据
    saasService.retrieveSupplyCompany(companyId)
      .then((res: Company) => {
        this.setData({
          company: res
        })
      })

    const promise1 = this.commentsRefresh()
      .then((res: PaginationList<UserComment>) => {
        this.setData({
          comments: res.list
        })
      })

    const promise2 = this.contactRecordsList()
      .then((res: Array<ContactRecord>) => {
        this.setData({
          contactRecords: res
        })
      })
    const promise3 = this.carSourcesRefresh()
      .then((res: PaginationList<{
        spuSummary: SpuSummary,
        itemDetail: CarSource
      }>) => {
        this.setData({
          carSources: res.list
        })
      })

    const promise = Promise.race([promise1, promise2, promise3])
    return promise
  },
  filters(): Promise<void> {
    return saasService.retrieveFiltersOfCompanyUserComments()
      .then((res: Array<Filter>) => {
        const filtersSelectedIndexes = []
        res.forEach((filter, i) => {
          filter.id = i
          filter.items.forEach((item, j) => {
            item.id = j
            if (item.selected === true) {
              filtersSelectedIndexes.push(j)
            }
          })
        })

        this.setData({
          filters: res,
          filtersSelectedIndexes: filtersSelectedIndexes
        })
      })
  },
  getCurrentFilterItem(): Item {
    const filters = this.data.filters
    const selectedIndex = this.data.filtersSelectedIndexes[0]
    return filters[0].items[selectedIndex]
  },
  /**
   * 获取联系记录列表
   *
   * @returns {Promise<Array<ContactRecord>>}
   */
  contactRecordsList(): Promise<Array<ContactRecord>> {
    const companyId = this.data.company.companyId
    return saasService.getAllContactsByCompany(companyId)
  },
  carSourcesRefresh(): Promise<PaginationList<{
    spuSummary: SpuSummary,
    itemDetail: CarSource
  }>> {
    const companyId = this.data.company.companyId
    const spuId = this.data.spuForCarSources
    return saasService.getCarSourceItemsByCompanyForSPU(companyId, spuId)
      .then((res: Pagination<{
        spuSummary: SpuSummary,
        itemDetail: CarSource
      }>) => {
        for (let carSourceWithSPU of res.content) {
          this.processCarSourceWithSPU(carSourceWithSPU)
        }
        this.carSourcePaginationList = { list: res.content, pagination: res, loadingMore: false }
        return this.carSourcePaginationList
      })
  },
  carSourcesLoadMore(): Promise<PaginationList<{
    spuSummary: SpuSummary,
    itemDetail: CarSource
  }>> {
    if (this.carSourcePaginationList == null) {
      return Promise.reject(new Error('缺少第一页'))
    }

    const pagination = this.carSourcePaginationList.pagination
    if (pagination == null) {
      return Promise.reject(new Error('没有分页对象'))
    }

    if (this.carSourcePaginationList.loadingMore === true) {
      return Promise.reject(new Error('正在获取更多数据'))
    }

    if (pagination.last) {
      return Promise.reject(new Error('已经最后一页了'))
    }

    let pageIndex = pagination.number
    if (pagination.hasNext) {
      pageIndex = pageIndex + 1
    }

    const companyId = this.data.company.companyId
    const spuId = this.data.spuForCarSources

    this.carSourcePaginationList.loadingMore = true
    return saasService.getCarSourceItemsByCompanyForSPU(companyId, spuId, pageIndex)
      .then((res: Pagination<{
        spuSummary: SpuSummary,
        itemDetail: CarSource
      }>) => {
        if (this.carSourcePaginationList == null) {
          return Promise.reject(new Error('缺少第一页'))
        }
        this.carSourcePaginationList.loadingMore = false

        const pagination = this.carSourcePaginationList.pagination
        if (pagination == null) {
          return Promise.reject(new Error('没有分页对象'))
        }

        if (res.numberOfElements === 0) {
          // 返回没数据
        } else {
          this.carSourcePaginationList.pagination = res
          if (this.carSourcePaginationList.list != null) {
            for (let carSourceWithSPU of res.content) {
              this.processCarSourceWithSPU(carSourceWithSPU)
            }
            this.carSourcePaginationList.list = this.carSourcePaginationList.list.concat(res.content)
          } else {
            this.carSourcePaginationList.list = res.content
          }
        }

        return this.carSourcePaginationList
      })
      .catch(err => {
        this.carSourcePaginationList.loadingMore = false
        return Promise.reject(err)
      })
  },
  commentsRefresh(): Promise<PaginationList<UserComment>> {
    this.userCommentPaginationList = null

    const companyId = this.data.company.companyId
    const item = this.getCurrentFilterItem()

    return saasService.retrieveUserComments(companyId, item.value)
      .then((res: Pagination<UserComment>) => {
        this.userCommentPaginationList = { list: res.content, pagination: res, loadingMore: false }
        return this.userCommentPaginationList
      })
  },
  commentsLoadMore(): Promise<PaginationList<UserComment>> {
    if (this.userCommentPaginationList == null) {
      return Promise.reject(new Error('缺少第一页'))
    }

    const pagination = this.userCommentPaginationList.pagination
    if (pagination == null) {
      return Promise.reject(new Error('没有分页对象'))
    }

    if (this.userCommentPaginationList.loadingMore === true) {
      return Promise.reject(new Error('正在获取更多数据'))
    }

    if (pagination.last) {
      return Promise.reject(new Error('已经最后一页了'))
    }

    let pageIndex = pagination.number
    if (pagination.hasNext) {
      pageIndex = pageIndex + 1
    }

    const companyId = this.data.company.companyId
    const item = this.getCurrentFilterItem()

    this.userCommentPaginationList.loadingMore = true
    return saasService.retrieveUserComments(companyId, item.value, pageIndex)
      .then((res: Pagination<UserComment>) => {
        if (this.userCommentPaginationList == null) {
          return Promise.reject(new Error('缺少第一页'))
        }
        this.userCommentPaginationList.loadingMore = false

        const pagination = this.userCommentPaginationList.pagination
        if (pagination == null) {
          return Promise.reject(new Error('没有分页对象'))
        }

        if (res.numberOfElements === 0) {
          // 返回没数据
        } else {
          this.userCommentPaginationList.pagination = res
          if (this.userCommentPaginationList.list != null) {
            this.userCommentPaginationList.list = this.userCommentPaginationList.list.concat(res.content)
          } else {
            this.userCommentPaginationList.list = res.content
          }
        }

        return this.userCommentPaginationList
      })
      .catch(err => {
        this.userCommentPaginationList.loadingMore = false
        return Promise.reject(err)
      })
  },
  spuRefresh(): Promise<PaginationList<CarSpuContent>> {
    this.spuPaginationList = null
    const text = this.data.searchViewModel.searchBarValue
    return saasService.requestSearchCarSpu(text)
      .then((res: Pagination<CarSpuContent>) => {
        this.spuPaginationList = { list: res.content, pagination: res, loadingMore: false }
        return this.spuPaginationList
      })
  },
  spuLoadMore(): Promise<PaginationList<CarSpuContent>> {
    if (this.spuPaginationList == null) {
      return Promise.reject(new Error('缺少第一页'))
    }

    const pagination = this.spuPaginationList.pagination
    if (pagination == null) {
      return Promise.reject(new Error('没有分页对象'))
    }

    if (this.spuPaginationList.loadingMore === true) {
      return Promise.reject(new Error('正在获取更多数据'))
    }

    if (pagination.last) {
      return Promise.reject(new Error('已经最后一页了'))
    }

    let pageIndex = pagination.number
    if (pagination.hasNext) {
      pageIndex = pageIndex + 1
    }

    const text = this.data.searchViewModel.searchBarValue

    this.spuPaginationList.loadingMore = true
    return saasService.requestSearchCarSpu(text, pageIndex)
      .then((res: Pagination<UserComment>) => {
        if (this.spuPaginationList == null) {
          return Promise.reject(new Error('缺少第一页'))
        }
        this.spuPaginationList.loadingMore = false

        const pagination = this.spuPaginationList.pagination
        if (pagination == null) {
          return Promise.reject(new Error('没有分页对象'))
        }

        if (res.numberOfElements === 0) {
          // 返回没数据
        } else {
          this.spuPaginationList.pagination = res
          if (this.spuPaginationList.list != null) {
            this.spuPaginationList.list = this.spuPaginationList.list.concat(res.content)
          } else {
            this.spuPaginationList.list = res.content
          }
        }

        return this.spuPaginationList
      })
      .catch(err => {
        this.spuPaginationList.loadingMore = false
        return Promise.reject(err)
      })
  },
  onFilterItemButtonClick(e) {
    const filterId = e.currentTarget.dataset.filterId
    let itemId = e.currentTarget.dataset.itemId

    const filters = this.data.filters
    const filtersSelectedIndexes = this.data.filtersSelectedIndexes
    if (filtersSelectedIndexes[filterId] == itemId) {
      // 反向选中, 意味着选择全部
      filtersSelectedIndexes[filterId] = 0
      itemId = 0
    } else {
      filtersSelectedIndexes[filterId] = itemId
    }

    this.setData({ filtersSelectedIndexes })

    wxapi.showToast({ title: '加载中...', icon: 'loading', mask: true })
      .then(() => {
        return this.commentsRefresh()
          .then((res: PaginationList<UserComment>) => {
            this.setData({
              comments: res.list
            })
          })
      })
      .then(() => { wxapi.hideToast() })
      .catch(() => { wxapi.hideToast() })
  },
  onTextareaInput(e) {
    const textarea = e.detail.value
    const submitSelectedTagIndex = this.data.submitSelectedTagIndex

    this.setData({
      submitButtonValid: textarea.length > 0
    })
  },
  onFormSubmitClick(e) {
    const value = e.detail.value
    const content = value.content
    if (content.length === 0) {
      $wuxToast.show({ type: 'text', timer: 2000, color: '#ffffff', text: '评论内容不能为空' })
      return
    }

    const submitSelectedTagIndex = this.data.submitSelectedTagIndex
    if (submitSelectedTagIndex === -1) {
      $wuxToast.show({ type: 'text', timer: 2000, color: '#ffffff', text: '必须选择一个标签' })
      return
    }

    const companyId = this.data.company.companyId
    const userId = userService.auth.userId
    const mobile = userService.mobile

    const tags = this.data.submitTags
    let tagString = ''
    if (submitSelectedTagIndex !== -1) {
      tagString = tags[submitSelectedTagIndex].value
    }

    wxapi.showToast({ title: '加载中...', icon: 'loading', mask: true })
      .then(() => {
        return saasService.createUserCommentsWithTagLabel(
          companyId,
          userId,
          content,
          mobile,
          [tagString]
        )
          .then(res => {
            // 重置评论输入板
            this.setData({
              submitSelectedTagIndex: -1,
              submitTextareaValue: ''
            })

            return this.commentsRefresh()
              .then((res: PaginationList<UserComment>) => {
                this.setData({
                  comments: res.list
                })
              })
          })
          .then(res => {
            this.setData({ comments: res.list })
          })
      })
      .then(() => {
        wxapi.hideToast()
        $wuxToast.show({ type: 'text', timer: 2000, color: '#ffffff', text: '评论成功!' })
      })
      .catch(() => { wxapi.hideToast() })
  },
  onTagButtonClick(e) {
    const id = Number(e.currentTarget.dataset.id)
    if (id == this.data.submitSelectedTagIndex) {
      this.setData({
        submitSelectedTagIndex: -1,
        submitButtonTagValid: false
      })
    } else {
      this.setData({
        submitSelectedTagIndex: id,
        submitButtonTagValid: true
      })
    }
  },
  onCallButtonClickToMobile(e) {
    const contactRecord = e.currentTarget.dataset.contactRecord
    const supplierPhone = contactRecord.supplierPhone
    wxapi.makePhoneCall({ phoneNumber: supplierPhone })
      .then(res => {
      /**
       * 上报 TODO:v2.0 这里联系电话上报
       */
        const supplierId = contactRecord.supplierId
        return saasService.pushCallRecord(supplierId, supplierPhone, null)
      })
      .then(res => {
        return this.contactRecordsList()
      })
      .then((res: Array<ContactRecord>) => {
        this.setData({
          contactRecords: res
        })
      })
  },
  onCallButtonClick(e) {
    const company = e.currentTarget.dataset.company
    this.actionContact(null, null, null, company.companyId, company.companyName)
  },
  processCarSourceWithSPU(carSourceWithSPU: {
    spuSummary: SpuSummary,
    itemDetail: CarSource
  }) {
    const carModelsInfo = carSourceWithSPU.spuSummary
    const isShowDownPrice = !(carModelsInfo.carModelName.includes('宝马') || carModelsInfo.carModelName.includes('奥迪') || carModelsInfo.carModelName.toLowerCase().includes('mini'))
    const quotedMethod: QuotedMethod = isShowDownPrice ? 'PRICE' : 'POINTS'
    const carSourceManger = new CarSourceManager(carModelsInfo.officialPrice, quotedMethod)

    carSourceManger.processCarSourceItem(carSourceWithSPU.itemDetail)
  },
  // event handler
  handlerTabClick(e) {
    this.setData({
      activeIndex: e.currentTarget.id
    })
  },
  // 搜索处理逻辑
  onSearchInputEdit(e) {
    this.searchTextWithEventHandler(e)
  },
  onSearchInputFocus(e) {
    this.searchTextWithEventHandler(e)
  },
  onSearchInputConfirm(e) {
    const searchText = e.detail.value
    if (searchText != null && searchText.length > 0) {
      this.data.searchViewModel.searchBarValue = searchText
      this.spuRefresh()
    }
  },
  onSearchInputBlur(e) {
    this.searchTextWithEventHandler(e)
  },
  searchTextWithEventHandler(e) {
    const searchText = e.detail.value

    if (searchText != null && searchText.length > 0) {
      if (searchText !== this.data.searchViewModel.searchBarValue) {
        // 将分页器移除
        this.data.searchViewModel.searchBarValue = searchText
        this.spuPaginationList = null
        this.spuRefresh()
          .then((res: PaginationList<CarSpuContent>) => {
            this.setData({
              isDefaultRecommend: false,
              isSearching: true,
              searchResults: res.list
            })
          })
          .catch(err => {
            this.setData({ isDefaultRecommend: true, isSearching: false })
          })
      } else {
        // do nothing
      }
    } else {
      // 将分页器移除， 回复默认情况
      this.data.searchViewModel.searchBarValue = searchText
      this.spuPaginationList = null
      this.data.spuForCarSources = null
      this.carSourcesRefresh()
        .then((res: PaginationList<{
          spuSummary: SpuSummary,
          itemDetail: CarSource
        }>) => {
          this.setData({
            isDefaultRecommend: true,
            isSearching: false,
            carSources: res.list
          })
        })
        .catch(err => {
          this.setData({ isDefaultRecommend: false, isSearching: true })
        })
    }
  },
  onSPUInfomationClick(e) {
    const spuInformation: CarSpuContent = e.currentTarget.dataset.spuInformation
    this.data.spuForCarSources = spuInformation.carModelId
    this.carSourcesRefresh()
      .then((res: PaginationList<{
        spuSummary: SpuSummary,
        itemDetail: CarSource
      }>) => {
        this.setData({
          isSearching: false,
          carSources: res.list
        })
      })
      .catch(err => {
        this.setData({ isSearching: true })
      })
  },
  onCarSourceWithSPUCellClick(e) {
    const carSourceWithSPU: { spuSummary: SpuSummary, itemDetail: CarSource } = e.currentTarget.dataset.carSourceWithSpu
    const carModelsInfo = carSourceWithSPU.spuSummary
    const carSourceItem = carSourceWithSPU.itemDetail

    $wuxCarSourceDetailDialog.sourceDetail({
      carModel: carModelsInfo,
      carSourceItem: carSourceItem,
      contact: () => {
        this.actionContactWithCarSourceItem(carModelsInfo, carSourceItem, 'sourceDetail')
      },
      handlerCreateQuoted: (e) => {
        const carSKU = {
          showPrice: carSourceItem.viewModelQuoted.price,
          skuId: null,
          skuPic: null,
          externalColorId: null,
          externalColorName: carSourceItem.exteriorColor,
          internalColorId: null,
          internalColorName: carSourceItem.simpleInteriorColor,
          price: null,
          priceStr: null,
          discount: null,
          status: null,
          remark: null,
          metallicPaint: carSourceItem.metallicPaint,
          metallicPaintAmount: carSourceItem.metallicPaintAmount
        }
        this.jumpToCreateQuotation(carSKU, carModelsInfo)
      },
      handlerGoMore(e) {
        let _showCarModelName = '【' + carModelsInfo.officialPriceStr + '】' + carModelsInfo.carModelName
        let _showColorName = carSourceItem.exteriorColor + ' / ' + carSourceItem.viewModelInternalColor
        let _carSourceItemKeyValueString = utils.urlEncodeValueForKey('carSourceItem', carSourceItem)
        let _carSourceId = carSourceItem.id
        let url = `../carSourcesMore/carSourcesMore?${_carSourceItemKeyValueString}&showCarModelName=${_showCarModelName}&showColorName=${_showColorName}&carSourceId=${_carSourceId}`
        wx.navigateTo({ url })
      },
      close: () => {
      },
      reportError: (e) => {
        console.log('report error')
      }
    })
  },
  onDefaultRecommendButtonClick(e) {
    if (this.data.isSearching === true) {
      this.data.spuForCarSources = null
      this.carSourcesRefresh()
        .then((res: PaginationList<{
          spuSummary: SpuSummary,
          itemDetail: CarSource
        }>) => {
          this.setData({
            isSearching: false,
            carSources: res.list
          })
        })
        .catch(err => {
          this.setData({ isSearching: true })
        })
    } else {
      // do nothing
    }
  },
  jumpToCreateQuotation(carSKU, carSPU) {
    const carModelsInfoKeyValueString = utils.urlEncodeValueForKey('carModelsInfo', carSPU)
    const carSkuInfoKeyValueString = utils.urlEncodeValueForKey('carSkuInfo', carSKU)
    wx.navigateTo({
      url: '/pages/quote/quotationCreate/quotationCreate?' + carModelsInfoKeyValueString + '&' + carSkuInfoKeyValueString
    })
  },
  actionContactWithCarSourceItem(carModelsInfo, carSourceItem: CarSource, from) {
    this.actionContact(
      null,
      null,
      carSourceItem.id,
      carSourceItem.companyId,
      carSourceItem.companyName,
      from,
      (supplier) => {
        /**
         * 1.4.0 埋点 拨打供货方电话
         * davidfu
         */
        this.data.pageParameters = {
          productId: carModelsInfo.carModelId,
          color: carSourceItem.exteriorColor,
          parameters: {
            carSourceId: carSourceItem.id,
            supplierId: supplier.supplierId
          }
        }
        const event = {
          eventAction: 'click',
          eventLabel: '拨打供货方电话'
        }
        $wuxTrack.push(event)
      })
  },
  /**
   * 包装的联系人接口
   *
   * @param {any} carSourceId
   * @param {any} companyId
   * @param {any} companyName
   * @param {any} from
   * @param {any} completeHandler
   */
  actionContact(spuId, quotedPrice, carSourceId, companyId, companyName, from, completeHandler) {
    $wuxCarSourceDetailDialog.contactList({
      spuId: spuId,
      quotedPrice: quotedPrice,
      carSourceId: carSourceId,
      companyId: companyId,
      companyName: companyName,
      from: from,
      contact: (supplier) => {
        typeof completeHandler === 'function' && completeHandler(supplier)
      }
    })
  },
})
