import {
  $wuxTrack
} from "../../components/wux"

let app = getApp()
let markersData = []
Page({
  data: {
    pageId: 'amap',
    pageName: '报价详情-地图',
    markers: [],
    latitude: '',
    longitude: '',
    textData: {}
  },
  makertap: function(e) {
    var id = e.markerId;
    var that = this;
    that.showMarkerInfo(markersData,id);
    that.changeMarkerColor(markersData,id);
  },
  onLoad: function() {
    var that = this;
    app.amap.getPoiAround({
      iconPathSelected: '../../images/icons/marker_checked.png',
      iconPath: '../../images/icons/marker.png',
      success: function(data){

        console.log(data)
        markersData = data.markers;
        that.setData({
          markers: markersData
        });
        that.setData({
          latitude: markersData[0].latitude
        });
        that.setData({
          longitude: markersData[0].longitude
        });
        that.showMarkerInfo(markersData,0);
      },
      fail: function(info){
        wx.showModal({title:info.errMsg})
      }
    })
  },
  onShow: function() {
    const event = {
      eventAction: 'pageShow',
      eventLabel: `页面展开`
    }
    $wuxTrack.push(event)
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
  }
})
