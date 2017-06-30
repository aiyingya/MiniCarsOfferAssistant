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
    historyList: [{index:1},{index:1},{index:1},{index:1},{index:1}],
    showAmapIndex: 0,
    showAmap: true,
    noHistory: ''
  },
  makertap: function(e) {
    var id = e.markerId;
    var that = this;
    that.showMarkerInfo(markersData,id);
    that.changeMarkerColor(markersData,id);
  },
  onLoad: function(options) {
    let quotation = util.urlDecodeValueForKeyFromOptions('quotation', options)
    let that = this
    let historyList = this.data.historyList
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
    this.setData({
      quotationsList: quotation.quotationList
    })
    this.getCheckHistory(0)
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
   * 调整时效.
   */
  handleAdjusttimes() {
    let that = this
    this.setData({
      showAmap: false
    })
    $checkTimeDialog.open({
      title: '时效调整',
      checkboxItems: '',
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
        console.log(value)
        that.setData({
          showAmap: true
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
      console.log(res)
      let markers = []
      let historyList = []
      let noHistory = ''
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
      }else {
        noHistory = 'nohistory'
      }
      
      this.setData({
        historyList: historyList,
        noHistory: noHistory
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
  
})