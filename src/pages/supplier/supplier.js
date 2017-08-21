// @flow
import $wuxCarSourceDetailDialog from '../../components/dialog/carSourceDetail/carSourceDetail'
import {
  $wuxToast
} from "../../components/wux"
import * as wxapi from 'fmt-wxapp-promise'
import { container } from '../../landrover/business/index'
import util from '../../utils/util'
import SAASService from '../../services/saas.service'
import UserService from '../../services/user.service'

const saasService: SAASService = container.saasService
const userService: UserService = container.userService

let whiteListRows: Array<Company> | null = null

let searchPaginationList: PaginationList<Company> | null = null
let searchCurrentText: string = ''

Page({
  data: {
    searchBarPlaceholder: '🔍 输入供应商名称',
    searchBarValue: '',
    sectionTitle: '',
    sectionRows: null,

    // 模糊查找结果
    fuzzyShow: false,
    fuzzySearchResultViews: null,
  },
  onLoad() {
    wxapi.showToast({ title: '加载中...', icon: 'loading', mask: true })
      .then(() => {
        return this.whiteList()
      })
      .then(() => { wxapi.hideToast() })
      .catch(() => { wxapi.hideToast() })
  },
  onShow() {
  },
  onPullDownRefresh() {
    this.whiteList()
      .then(res => {
        this.setData({
          searchBarValue: ''
        })
        wx.stopPullDownRefresh()
      })
  },
  onReachBottom() {
    this.searchLoadMore()
  },
  whiteList(): Promise<Array<Company>> {
    const sectionTitle = '靠谱的供应商推荐'
    this.setData({ sectionTitle })
    return saasService.retrieveSupplierWhiteList()
      .then((res: Array<Company>) => {
        const sectionRows = res
        this.setData({
          fuzzyShow: false,
          sectionTitle,
          sectionRows
        })
        return res
      })
  },
  fuzzySearch(searchText: string): Promise<Array<Company>> {
    return saasService.retrieveFuzzySupplierSearchResult(searchText)
      .then((res: Array<Company>) => {
        this.setData({
          fuzzyShow: true,
          fuzzySearchResults: res
        })
        return res
      })
      .catch(err => {
        return Promise.reject(err)
      })
  },
  formatSearchText(searchText: string): string {
    if (searchText.length > 5) {
      let index = 0
      let string = ''
      for (let char of searchText) {
        if (index < 5) {
          string = string.concat(char)
        } else {
          break
        }
      }
      return `${string}...`
    } else {
      return searchText
    }
  },
  searchRefresh(searchText: string): Promise<any> {
    searchPaginationList = null

    searchCurrentText = searchText
    let sectionTitle = `加载中...`
    this.setData({
      fuzzyShow: false,
      sectionTitle,
      sectionRows: []
    })

    return saasService.retrieveSupplierSearchResult(searchText)
      .then((res: Pagination<Company>) => {
        if (res.totalElements !== 0) {
          const searchText2 = this.formatSearchText(searchText)
          sectionTitle = `与 '${searchText2}' 相关的记录 ${res.number}/${res.totalPages}页 共${res.totalElements}个`
          searchPaginationList = { list: res.content, pagination: res, loadingMore: false }
          this.setData({ sectionTitle, sectionRows: searchPaginationList.list })
        } else {
          sectionTitle = `没有搜索结果`
          this.setData({ sectionTitle })
        }
      })
      .catch(err => {
        sectionTitle = `搜索出错...`
        this.setData({ sectionTitle })
      })
  },
  searchLoadMore(): Promise<any> {
    if (searchPaginationList == null) {
      return Promise.reject(new Error('缺少第一页'))
    }

    const pagination = searchPaginationList.pagination
    if (pagination == null) {
      return Promise.reject(new Error('没有分页对象'))
    }

    if (searchPaginationList.loadingMore === true) {
      return Promise.reject(new Error('正在获取更多数据'))
    }


    let pageIndex = pagination.number
    if (pagination.last) {
      return Promise.reject(new Error('已经最后一页了'))
    }

    if (pagination.hasNext) {
      pageIndex = pageIndex + 1
    }

    const searchText = searchCurrentText

    searchPaginationList.loadingMore = true
    return saasService.retrieveSupplierSearchResult(searchText, null, pageIndex)
      .then((res: Pagination<Company>) => {
        if (searchPaginationList == null) {
          return Promise.reject(new Error('缺少第一页'))
        }
        searchPaginationList.loadingMore = false

        const pagination = searchPaginationList.pagination
        if (pagination == null) {
          return Promise.reject(new Error('没有分页对象'))
        }

        if (res.numberOfElements === 0) {
          // 返回没数据
        } else {
          searchPaginationList.pagination = res
          if (searchPaginationList.list != null) {
            searchPaginationList.list = searchPaginationList.list.concat(res.content)
          } else {
            searchPaginationList.list = res.content
          }

          const searchText2 = this.formatSearchText(searchText)
          const sectionTitle = `与 '${searchText2}' 相关的记录 ${res.number}/${res.totalPages}页 共${res.totalElements}个`

          this.setData({
            sectionTitle,
            sectionRows: searchPaginationList.list
          })
        }
      })
      .catch(err => {
        if (searchPaginationList != null) {
          searchPaginationList.loadingMore = false
        }
        return Promise.reject(err)
      })
  },
  onSearchInputEdit(e) {
    this.searchTextWithEventHandler(e)
  },
  onSearchInputFocus(e) {
    this.searchTextWithEventHandler(e)
  },
  onSearchInputConfirm(e) {
    const searchText = e.detail.value
    if (searchText != null && searchText.length > 0) {
      this.searchRefresh(searchText)
    }
  },
  onSearchInputBlur(e) {
    this.searchTextWithEventHandler(e)
  },
  searchTextWithEventHandler(e) {
    const searchText = e.detail.value

    if (searchText != null && searchText.length > 0) {
      if (searchText !== searchCurrentText) {
        // 将分页器移除
        searchPaginationList = null
        this.fuzzySearch(searchText)
      } else {
        // do nothing
      }
    } else {
      // 将分页器移除
      searchPaginationList = null
      this.whiteList()
    }
  },
  onCallButtonClick(e) {
    if (userService.isLogin()) {
      const company = e.currentTarget.dataset.company
      this.actionContact(company.companyId, company.companyName)
    } else {
      wx.navigateTo({ url: '../login/login' })
    }
  },
  onRowClick(e) {
    const company = e.currentTarget.dataset.company
    this.routeToSupplierDetail(company)
  },
  onFuzzyRowClick(e) {
    const company = e.currentTarget.dataset.company
    this.routeToSupplierDetail(company)
  },
  routeToSupplierDetail(company: Company) {
    if (userService.isLogin()) {
      const companyKeyValueString = util.urlEncodeValueForKey('company', company)
      wx.navigateTo({ url: '/pages/supplierDetail/supplierDetail?' + companyKeyValueString })
    } else {
      wx.navigateTo({ url: '../login/login' })
    }
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
