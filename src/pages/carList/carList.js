//index.js
let app = getApp()
import util from '../../utils/util'

Page({
  data: {
    hotCarLists: [],
    brandGroupList: [],
    alpha: '',
    windowHeight: '',
    showCarSeries: '',
    showMask: '',
    showCarSeriesInner: '',
    showCarSeriesImageUrl: '',
    carManufacturerSeriesList: [],
    showNodata: false
  },
  onLoad() {
    let that = this
    try {
      let res = wx.getSystemInfoSync()
      this.pixelRatio = res.pixelRatio
      this.apHeight = 16
      this.offsetTop = 80
      console.log(res)
      this.setData({windowHeight: res.windowHeight + 'px'})
    } catch (e) {

    }

    app.tradeService.getNavigatorForCarBrands()
      .then(function (res) {
        if (res) {
          that.setData({
            brandGroupList: res
          })
        }
      }, function (err) {
      })
  },
  handlerAlphaTap(e) {
    let {ap} = e.target.dataset
    let that = this
    that.setData({alpha: ap})
    that.setData({alphanetToast: ap})
  },
  handlerMove(e) {
    let {brandGroupList} = this.data
    let moveY = e.touches[0].clientY
    let rY = moveY - this.offsetTop
    let that = this
    if (rY >= 0) {
      let index = Math.ceil((rY - that.apHeight) / that.apHeight)
      if (0 <= index < brandGroupList.length) {
        let nonwAp = brandGroupList[index]
        if (nonwAp) {
          that.setData({alpha: nonwAp.title})
          that.setData({alphanetToast: nonwAp.title})
        }
      }
    }
  },
  handlerSelectCarSeries(e) {
    let carSeries = e.currentTarget.dataset.carseries;
    console.log(carSeries)
    let that = this;
    let {HTTPS_YMCAPI} = this.data;

    app.tradeService.getNavigatorForCarSeries({ brandId: carSeries.id })
      .then(function (res) {
        if (res) {
          let data = res
          let showNodata = false
          if (data.length === 0) {
            showNodata = true
          }
          that.setData({
            showCarSeriesImageUrl: carSeries.logoUrl,
            carManufacturerSeriesList: data,
            showNodata: showNodata
          })
        }
      }, function (err) {
      })

    that.setData({
      showCarSeries: carSeries,
      showCarSeriesImageUrl: carSeries.logoUrl,
      showMask: 'showMask',
      showCarSeriesInner: 'rightToLeft'
    })
  },
  removeCarSeriesInner(e) {
    let that = this;
    that.setData({
      showCarSeries: '',
      showCarSeriesImageUrl: '',
      carManufacturerSeriesList: [],
      showNodata: false
    });
  },
  handlerToCarsModels(e) {
    const carsInfoKeyValueString = util.urlEncodeValueForKey('carsInfo', e.currentTarget.dataset.carsinfo)
    if (app.userService.isLogin()) {
      wx.navigateTo({
        url: '../carModels/carModels?' + carsInfoKeyValueString
      })
    } else {
      wx.navigateTo({
        url: '../login/login'
      })
    }
  },
  onTouchMoveWithCatch () {
    // 拦截触摸移动事件， 阻止透传
  }
})
