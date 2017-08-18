// @flow


import $wuxCarSourceDetailDialog from '../../components/dialog/carSourceDetail/carSourceDetail'
import {
  container
} from '../../landrover/business/index'

import {
  $wuxToast
} from "../../components/wux"

import * as wxapi from 'fmt-wxapp-promise'
import SAASService from '../../services/saas.service'
import UserService from '../../services/user.service'
import util from '../../utils/util'

const saasService: SAASService = container.saasService
const userService: UserService = container.userService
let paginationList: PaginationList<UserComment> | null = null

Page({
  data: {
    filters: null,
    filtersSelectedIndexes: null,

    company: null,
    comments: [
      {
        commentId: 0,
        companyId: 0,
        tag: '靠谱',
        content: "阿凡达发放的三方的发发发发送发送发送发送发送发送答复是否三方三多发的发发发地方的发发发的方",
        star: 3,
        createdDate: "2017-9-10",
        userId: 1,
        phone: '1582321****'
      }
    ],

    submitTags: [
      {
        id: 0,
        name: '靠谱',
        imageNormal: '/images/icons/icon_reliable_face_off.png',
        imageHighlight: '/images/icons/icon_reliable_face.png',
        value: '靠谱'
      },
      {
        id: 1,
        name: '不靠谱',
        imageNormal: '/images/icons/icon_unreliable_face_off.png',
        imageHighlight: '/images/icons/icon_unreliable_face.png',
        value: '不靠谱'
      }
    ],
    submitSelectedTagIndex: -1,
    submitTextareaValue: '',
    submitButtonValid: false,
    submitButtonTagValid: false
  },
  onLoad(options) {
    const company = util.urlDecodeValueForKeyFromOptions('company', options)
    this.setData({
      company
    })

    if (!userService.isLogin()) {
      wx.navigateTo({
        url: '../login/login'
      })
    } else {
      // 初次进入加载
      wxapi.showToast({ title: '加载中...', icon: 'loading', mask: true })
        .then(() => {
          return this.refresh()
            .then((res: PaginationList<UserComment>) => {
              this.setData({
                comments: res.list
              })
            })
        })
        .then(() => { wxapi.hideToast() })
        .catch(() => { wxapi.hideToast() })
    }
  },
  onShow() { },
  onPullDownRefresh() {
    this.refresh()
      .then((res: PaginationList<UserComment>) => {
        wx.stopPullDownRefresh()
        this.setData({
          comments: res.list
        })
      })
  },
  onReachBottom() {
    this.commentsLoadMore()
      .then((res: PaginationList<UserComment>) => {
        this.setData({
          comments: res.list
        })
      })
  },
  refresh(): Promise<PaginationList<UserComment>> {
    return this.filters()
      .then(res => {
        return this.commentsRefresh()
      })
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
  commentsRefresh(): Promise<PaginationList<UserComment>> {
    paginationList = null

    const companyId = this.data.company.companyId
    const item = this.getCurrentFilterItem()

    return saasService.retrieveUserComments(companyId, item.value)
      .then((res: Pagination<UserComment>) => {
        paginationList = { list: res.content, pagination: res, loadingMore: false }
        return paginationList
      })
  },
  commentsLoadMore(): Promise<PaginationList<UserComment>> {
    if (paginationList == null) {
      return Promise.reject(new Error('缺少第一页'))
    }

    const pagination = paginationList.pagination
    if (pagination == null) {
      return Promise.reject(new Error('没有分页对象'))
    }

    if (paginationList.loadingMore === true) {
      return Promise.reject(new Error('正在获取更多数据'))
    }

    paginationList.loadingMore = true

    const companyId = this.data.company.companyId

    const item = this.getCurrentFilterItem()

    let pageIndex = pagination.number
    if (pagination.hasNext) {
      pageIndex = pageIndex + 1
    }
    return saasService.retrieveUserComments(companyId, item.value, pageIndex)
      .then((res: Pagination<UserComment>) => {
        if (paginationList == null) {
          return Promise.reject(new Error('缺少第一页'))
        }
        paginationList.loadingMore = false

        const pagination = paginationList.pagination
        if (pagination == null) {
          return Promise.reject(new Error('没有分页对象'))
        }

        if (res.numberOfElements === 0) {
          // 返回没数据
        } else {
          paginationList.pagination = res
          if (paginationList.list != null) {
            paginationList.list.concat(res.content)
          } else {
            paginationList.list = res.content
          }
        }

        return paginationList
      })
      .catch(err => {
        paginationList.loadingMore = false
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

    const item = filters[filterId].items[itemId]

    wxapi.showToast({ title: '加载中...', icon: 'loading', mask: true })
      .then(() => {
        return this.commentsRefresh(item.value)
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
            this.setData({
              submitSelectedTagIndex: -1,
              submitTextareaValue: ''
            })
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
  onCallButtonClick(e) {
    const company = e.currentTarget.dataset.company
    this.actionContact(company.companyId, company.companyName)
  },
  actionContact(companyId, companyName, completeHandler) {
    $wuxCarSourceDetailDialog.contactList({
      companyId: companyId,
      companyName: companyName,
      contact: (makePhonePromise, supplier) => {
        makePhonePromise
          .then(res => {
            console.log('拨打电话' + supplier.supplierPhone + '成功')
            typeof completeHandler === 'function' && completeHandler(supplier)
          })
          .catch(err => {
            console.error(err, '拨打电话' + supplier.supplierPhone + '失败')
          })
      }
    });
  }
})
