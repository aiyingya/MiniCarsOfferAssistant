import { $checkTimeDialog, $wuxToast } from "../../components/wux"
import utils from '../../utils/util'
import * as wxapi from 'fmt-wxapp-promise'
import { container } from '../../landrover/business/index'

let markersData = []
Page({
  data: {
    markers: [],
    latitude: '',
    longitude: '',
    textData: {},
    quotationsList: [],
    historyList: [],
    showAmapIndex: 0,
    showAmap: true,
    noHistory: '',
    noHistoryContainer: '',
    isShowAmap: false,
    quotationItem: {
      customerPhone: '',
      customerName: '',
      shared: false
    },
    swiperCurrent: 0,
    showCurrent: 0
  },
  makertap: function (e) {
    var id = e.markerId;
    var that = this;
    that.showMarkerInfo(markersData, id);
    that.changeMarkerColor(markersData, id);
  },
  onLoad: function (options) {
    let that = this
    /**
     * 分享进入页面，在未登录的情况下 跳转到登录页
     */
    if (!container.userService.isLogin()) {
      setTimeout(function () {
        that.setData({
          pageShare: true
        })
      }, 1000)

      this.setData({ options: options })
      wx.navigateTo({
        url: '../../login/login'
      })
    } else {
      let current = options.current || 0
      let mobile = options.mobile
      this.getQuoteDateilList(mobile, current)
    }

    //    app.amap.getPoiAround({
    //      iconPathSelected: '../../images/icons/marker_checked.png',
    //      iconPath: '../../images/icons/marker.png',
    //      success: function(data){
    //        console.log(data.markers)
    //        markersData = data.markers;
    //        for(let item of historyList) {
    //          item.markers = markersData
    //          item.latitude = markersData[0].latitude
    //          item.longitude = markersData[0].longitude
    //        }
    //
    ////        that.setData({
    ////          historyList: historyList
    ////        });
    //        that.showMarkerInfo(markersData,0);
    //      },
    //      fail: function(info){
    //        wx.showModal({title:info.errMsg})
    //      }
    //    })
  },
  getQuoteDateilList(mobile, current) {
    let that = this
    let userId = container.userService.auth.userId
    if (mobile) {
      container.saasService.getQuoteDateilList(
        userId,
        mobile
      )
        .then((res) => {
          if (res) {
            let noHistoryContainer = res.customerPhone === '无' ? 'height100' : ''
            let currentQuotationItem = res.quotationList[current]

            if (res.quotationList.length > 0) {
              for (let qitem of res.quotationList) {
                let totalPayment = utils.priceStringWithUnit(qitem.totalPayment);
                let sellingPrice = utils.priceStringWithUnit(qitem.quotationItems[0].sellingPrice);
                let guidePrice = utils.priceStringWithUnitNumber(qitem.quotationItems[0].guidePrice);

                /// 实时计算优惠点数
                let downPrice = utils.downPrice(qitem.quotationItems[0].sellingPrice, qitem.quotationItems[0].guidePrice)
                let downPriceFlag = utils.downPriceFlag(downPrice);
                let downPriceString = ''
                if (downPriceFlag !== 0) {
                  downPriceString = utils.priceStringWithUnit(downPrice)
                }

                /**
                 * 计算时间.
                 */
                qitem.createdTime = utils.getTimeDifferenceString(qitem.quotationTime)
                qitem.viewModel = {
                  totalPayment: totalPayment,
                  sellingPrice: sellingPrice,
                  guidePrice: guidePrice,
                  itemName: `【${qitem.quotationItems[0].guidePrice / 100}】${qitem.quotationItems[0].itemName}`,
                  priceChange: {
                    flag: downPriceFlag,
                    price: downPriceString
                  }
                }
              }
            }

            that.setData({
              'quotationItem.customerPhone': res.customerPhone,
              'quotationItem.customerName': res.customerName,
              'quotationItem.shared': currentQuotationItem.shared,
              quotationsList: res.quotationList,
              noHistoryContainer: noHistoryContainer,
              swiperCurrent: current,
              showCurrent: current
            })
            that.getCheckHistory(current)
          }
        }, (err) => {

        })
    }
  },
  showMarkerInfo: function (data, i) {
    var that = this;
    that.setData({
      textData: {
        name: data[i].name,
        desc: data[i].address
      }
    });
  },
  changeMarkerColor: function (data, i) {
    var that = this;
    var markers = [];
    for (var j = 0; j < data.length; j++) {
      if (j == i) {
        data[j].iconPath = "../../images/icons/marker_checked.png";
      } else {
        data[j].iconPath = "../../images/icons/marker.png";
      }
      markers.push(data[j]);
    }
    that.setData({
      markers: markers
    });
  },
  /**
   * swiper 切换.
   */
  handleChangeSwiper(e) {
    let current = e.detail.current
    this.setData({
      showCurrent: current
    })
    this.getCheckHistory(current)
  },
  /**
   * 查看地图.
   */
  handleCheckAmap(e) {
    const historyList = this.data.historyList
    const amapindex = e.currentTarget.dataset.amapindex

    this.setData({
      showAmapIndex: amapindex
    })
  },
  /**
   * 调整时效 弹窗.
   */
  handleAdjusttimes() {
    let that = this
    let showCurrent = this.data.showCurrent
    let quotationsList = this.data.quotationsList
    let quotationCurrent = quotationsList[showCurrent]

    this.setData({
      showAmap: false
    })
    $checkTimeDialog.open({
      title: '时效调整',
      validTime: quotationCurrent.validTime, // 报价单有效时间
      createdTime: quotationCurrent.quotationTime, // 报价单创建时间
      confirmText: '确认',
      cancelText: '取消',
      validate: (e) => {
        if (e.detail.value > 0) {
          return true
        } else {
          return false
        }
      },
      confirm: (value) => {

        let time = ''
        if (value.type === 'add') {
          time = value.val
        } else if (value.type === 'reduce') {
          time = -(value.val)
        } else if (value.type === 'close') {
          time = 0
        }
        const promise = that.postValidTime(quotationCurrent.quotationId, time)

        promise.then(res => {
          that.setData({
            showAmap: true
          })
        }, err => {

        })
      },
      cancel: () => {
        that.setData({
          showAmap: true
        })
      }
    })
  },
  /**
  * 调整时效 POST.
  */
  postValidTime(id, time) {
    let that = this
    let showCurrent = this.data.showCurrent
    let quotationsList = this.data.quotationsList

    return container.saasService.postValidTime(id, time)
      .then((res) => {
        for (let item of quotationsList) {
          if (item.quotationId === id) {
            if (time == 0) {
              item.validTime = time
            } else {
              let valTime = item.validTime + Number(time)
              item.validTime = valTime <= 0 ? 0 : valTime
            }
          }
        }
        let valueString = JSON.stringify(quotationsList)
        let quotationKeyValueString = encodeURIComponent(valueString)
        try {
          wx.setStorageSync('quotationItemKeyDetail', quotationKeyValueString)
          that.setData({
            quotationsList: quotationsList
          })
        } catch (e) {

        }
      })
      .catch(err => {

      })
  },
  /**
   * 获取历史查看记录.
   */
  getCheckHistory(index) {
    let that = this
    let quotation = this.data.quotationsList[index]
    let quotationId = quotation.quotationId
    return container.saasService.getCheckHistory(quotationId)
      .then((res) => {
        let markers = []
        let historyList = []
        let noHistory = ''
        let noHistoryContainer = ''
        let isShowAmap = false
        if (res.length > 0) {
          for (let item of res) {

            item.checkTime = utils.getTimeDifferenceString(item.createDate)
            item.markers = [{
              address: item.placeName,
              height: 32,
              iconPath: "../../images/icons/marker.png",
              id: 0,
              latitude: item.positionY,
              longitude: item.positionX,
              name: item.placeName,
              width: 22
            }]
            item.latitude = item.positionY
            item.longitude = item.positionX
            historyList.push(item)
          }
          isShowAmap = true
        } else {
          noHistory = 'nohistory'
          noHistoryContainer = 'height100'
        }

        this.setData({
          historyList: historyList,
          noHistory: noHistory,
          noHistoryContainer: noHistoryContainer,
          isShowAmap: isShowAmap,
          'quotationItem.shared': quotation.shared
        })
      })
      .catch(err => {
      })
  },
  /**
   * 跳转订单详情.
   */
  handleToquotationDetail(e) {
    let quotationKeyValueString = utils.urlEncodeValueForKey('quotation', e.currentTarget.dataset.quotation)
    wx.navigateTo({
      url: '/pages/quote/quotationDetail/quotationDetail?' + quotationKeyValueString,
      success: function (res) {
        console.log('quotationDetail 页面跳转成功');
      },
      fail: function () {
        console.log('quotationDetail 页面跳转失败');
      },
      complete: function () {

      }
    })
  },
  /**
   * 分享报价单.
   */
  handleToShareDatail() {
    let showCurrent = this.data.showCurrent
    let quotationsList = this.data.quotationsList
    let quotationCurrent = quotationsList[showCurrent]

    const quotationKeyValueString = utils.urlEncodeValueForKey('quotation', quotationCurrent)
    wx.navigateTo({
      url: '/pages/quote/quotationDetail/quotationDetail?' + quotationKeyValueString,
      success: function (res) {
      },
      fail: function () {
      },
      complete: function () {
        app.fuckingLarryNavigatorTo.quotation = null
        app.fuckingLarryNavigatorTo.source = null
      }
    })
  },
  /**
   * 联系客户.
   */
  handlePhoneCall(e) {
    const phoneNumber = e.currentTarget.dataset.phone
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
    // 这里打给客户 不需要上报手机

  },
  /**
   * 长按复制手机号.
   */
  handleSetClipboard(e) {

    const phone = e.currentTarget.dataset.phone
    if (phone !== '无') {
      wx.setClipboardData({
        data: phone,
        success: function (res) {
          wx.getClipboardData({
            success: function (res) {
              console.log(res.data) // data
              wx.showToast({
                title: '手机号复制成功',
                icon: 'success',
                duration: 2000
              })
            }
          })
        }
      })
    }
  }
})
