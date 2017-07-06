import { $checkTimeDialog } from "../../components/wux"
import util from '../../utils/util'
let app = getApp()
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
  makertap: function(e) {
    var id = e.markerId;
    var that = this;
    that.showMarkerInfo(markersData,id);
    that.changeMarkerColor(markersData,id);
  },
  onLoad: function(options) {
    let current = options.current
    try {
      let quotationItemKeyDetail = wx.getStorageSync('quotationItemKeyDetail')
      let opts = {
        quotation: quotationItemKeyDetail
      }
      let quotation = util.urlDecodeValueForKeyFromOptions('quotation', opts)
      let that = this
      let historyList = this.data.historyList
      let noHistoryContainer = quotation.customerPhone === '无' ? 'height100' : ''
      let currentQuotationItem = quotation.quotationList[current]
      console.log(quotation)
      this.setData({
        'quotationItem.customerPhone': quotation.customerPhone,
        'quotationItem.customerName': quotation.customerName,
        'quotationItem.shared': currentQuotationItem.shared,
        quotationsList: quotation.quotationList,
        noHistoryContainer: noHistoryContainer,
        swiperCurrent: current,
        showCurrent: current
      })
      this.getCheckHistory(current)
    } catch (e) {
      // Do something when catch error
    }
//    
//    console.log(quotation)
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
  showMarkerInfo: function(data,i){
    var that = this;
    that.setData({
      textData: {
        name: data[i].name,
        desc: data[i].address
      }
    });
  },
  changeMarkerColor: function(data,i){
    var that = this;
    var markers = [];
    for(var j = 0; j < data.length; j++){
      if(j==i){
        data[j].iconPath = "../../images/icons/marker_checked.png";
      }else{
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
        if(value.type === 'add') {
          time = value.val
        }else if(value.type === 'reduce') {
          time = -(value.val)
        }else if(value.type === 'close') {
          time = 0
        }
        const promise = that.postValidTime(quotationCurrent.quotationId,time)

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
  postValidTime(id,time) {
    let that = this
    let showCurrent = this.data.showCurrent
    let quotationsList = this.data.quotationsList
    
    return app.saasService.postValidTime({
      data: {
        quotationId: id,
        times: time
      }
    }).then((res) => {
     
      for(let item of quotationsList) {
        if(item.quotationId === id) {
          if(time == 0){
            item.validTime = time
          }else {
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
      
    }, (err) => {
      
    })
  },
  /**
   * 获取历史查看记录.
   */
  getCheckHistory(index) {
    let that = this
    let quotation = this.data.quotationsList[index]
    let quotationId = quotation.quotationId
    return app.saasService.getCheckHistory({
      data: {
        quotationId: quotationId
      }
    }).then((res) => {
      let markers = []
      let historyList = []
      let noHistory = ''
      let noHistoryContainer = ''
      let isShowAmap = false
      if(res.length > 0) {
        for(let item of res) {
          
          item.checkTime = util.getTimeDifferenceString(item.createDate)
          item.markers = [{
            address: item.placeName,
            height:32,
            iconPath:"../../images/icons/marker.png",
            id:0,
            latitude: item.positionY,
            longitude: item.positionX,
            name: item.placeName,
            width:22
          }]
          item.latitude = item.positionY
          item.longitude = item.positionX
          historyList.push(item)
        }
        isShowAmap = true
      }else {
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
      
    }, (err) => {
      
    })
  },
  /**
   * 跳转订单详情.
   */
  handleToquotationDetail(e) {
    let quotationKeyValueString = util.urlEncodeValueForKey('quotation', e.currentTarget.dataset.quotation)
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
    
    const quotationKeyValueString = util.urlEncodeValueForKey('quotation', quotationCurrent)
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
    let phone = e.currentTarget.dataset.phone
    
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  /**
   * 长按复制手机号.
   */
  handleSetClipboard(e) {

    const phone = e.currentTarget.dataset.phone
    if(phone !== '无') {
      wx.setClipboardData({
        data: phone,
        success: function(res) {
          wx.getClipboardData({
            success: function(res) {
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