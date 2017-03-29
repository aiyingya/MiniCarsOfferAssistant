//index.js
import util from '../../utils/util'

let app = getApp()
Page({
  data: {
    hotCarLists: [],
    hotCarsTypes: [],
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
  //事件处理函数
  searchCarType() {
    console.log('To Search')
    if (app.userService.isLogin()) {
      wx.navigateTo({
        url: '../search/search'
      })
    } else {
      wx.navigateTo({
        url: '../login/login'
      })
    }
  },
  handleCheckMore() {
    wx.navigateTo({
      url: '../carList/carList'
    })
  },
  onLoad() {
    let that = this
    try {
      let res = wx.getSystemInfoSync()
      this.pixelRatio = res.pixelRatio
      this.apHeight = 16
      this.offsetTop = 80
      this.setData({windowHeight: res.windowHeight + 'px'})
    } catch (e) {

    }

    // 获取热推车品牌
    app.tradeService.getHotPushBrands({
      success: function (res) {
        if (res) {
          console.log(res)
          that.setData({
            hotCarLists: res
          })
        }
      },
      fail: function () {

      }
    })

    // 获取热推车型.
    that.getHotpushCars()

    /// 初始化自定义组件
    this.$wuxTrack = app.wux(this).$wuxTrack

//		const push = this.$wuxTrack.push({
//			appVersion: '1.0.1'
//		})
  },
  onShow() {
  },
  onPullDownRefresh() {
    // 下拉刷新
    wx.stopPullDownRefresh()
    this.onLoad()
  },
  getHotpushCars () {
    let that = this
    app.tradeService.getHotPushCars({
      success: function (res) {
        let depreciate

        for (let item of res) {
          item.depreciate = (item.guidePrice - item.salePrice)
          item.depreciateSTR = (Math.abs(item.guidePrice - item.salePrice) / 10000).toFixed(2)
        }
        that.setData({
          hotCarsTypes: res
        })
      }
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
          that.setData({alpha: nonwAp.firstLetter})
          that.setData({alphanetToast: nonwAp.firstLetter})
        }
      }
    }
  },
  handlerSelectCarSeries(e) {
    let carSeries = e.currentTarget.dataset.carseries;
    console.log(carSeries)
    let that = this;
    let {HTTPS_YMCAPI} = this.data;

    app.tradeService.getNavigatorForCarSeries({
      brandId: carSeries.id,
      success: function (res) {
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
      }
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
    if (app.userService.isLogin()) {
      const carsInfoKeyValueString = util.urlEncodeValueForKey('carsInfo', e.currentTarget.dataset.carsinfo)
      wx.navigateTo({
        url: '../carModels/carModels?' + carsInfoKeyValueString
      })
    } else {
      wx.navigateTo({
        url: '../login/login'
      })
    }
  },
  handlerMakePhoneCall() {
    let phone = '021-52559255,8902'

    wx.makePhoneCall({
      phoneNumber: phone
    })
  }
})
