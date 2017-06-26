
import {
  $wuxTrack
} from '../../components/wux'
import util from '../../utils/util'
import YMC from '../../services/YMC'

// import moment from 'moment'


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
    showNodata: false,
    anewReload: false
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
    wx.switchTab({
      url: '../carList/carList'
    })
  },
  onLoad() {

    let that = this
    try {
      //测试代码
      // let beginTime = moment("2017-04-19 09:02:04").format("MM/DD HH:mm")
      // console.log("LLLLLLL",beginTime)
      let res = wx.getSystemInfoSync()
      this.pixelRatio = res.pixelRatio
      this.apHeight = 16
      this.offsetTop = 80
      this.setData({
        windowHeight: res.windowHeight + 'px'
      })
    } catch (e) {

    }

    wx.showToast({
      title: '正在加载',
      icon: 'loading',
      duration: 10000,
      mask: true
    })
    const promise = that.reloadIndexData()
    promise.then(res => {
      wx.hideToast()
    }, err => {
      
      wx.hideToast()
    })

    wx.showShareMenu()
  },
  onShow() { },
  onPullDownRefresh() {
    // 下拉刷新
    const promise = this.reloadIndexData()
    promise.then(res => {
      wx.stopPullDownRefresh()
    }, err => {
      wx.stopPullDownRefresh()
    })
  },
  onShareAppMessage () {
    return {
      title: '要卖车，更好用的卖车助手',
      path: 'pages/index/index',
      success(res) {
        // 分享成功
      },
      fail(res) {
        // 分享失败
      }
    }
  },
  /**
   * 首页所有数据加载方法
   *
   * @returns {Promise}
   */
  reloadIndexData() {
    const promise1 = this.getHotPushBrands()
    const promise2 = this.getHotPushCarModels()
    const promise = Promise.race([promise1, promise2])
    return promise
  },
  /**
   * 获取热推车牌
   *
   * @returns {Promise}
   */
  getHotPushBrands() {
    const that = this
    return app.tradeService.getHotPushBrands().then((res) => {
      if (res) {
        that.setData({
          hotCarLists: res
        })
      }
    }, (err) => {
      that.setData({
        anewReload: true
      })
    })
  },
  /**
   * 获取热推车型
   *
   * @returns {Promise}
   */
  getHotPushCarModels() {
    const that = this
    return app.tradeService.getHotPushCarModels().then((res) => {
      let depreciate
      for (let item of res) {
        item.depreciate = (item.guidePrice - item.salePrice)
        item.depreciateSTR = (Math.abs(item.guidePrice - item.salePrice) / 10000).toFixed(2)
        item.guidePriceSTR = (item.guidePrice / 100).toFixed(0)
      }
      that.setData({
        hotCarsTypes: res
      })
    }, (err) => {

    })
  },
  handlerAlphaTap(e) {
    let {
      ap
    } = e.target.dataset
    let that = this
    that.setData({
      alpha: ap
    })
    that.setData({
      alphanetToast: ap
    })
  },
  handlerMove(e) {
    let {
      brandGroupList
    } = this.data
    let moveY = e.touches[0].clientY
    let rY = moveY - this.offsetTop
    let that = this
    if (rY >= 0) {
      let index = Math.ceil((rY - that.apHeight) / that.apHeight)
      if (0 <= index < brandGroupList.length) {
        let nonwAp = brandGroupList[index]
        if (nonwAp) {
          that.setData({
            alpha: nonwAp.firstLetter
          })
          that.setData({
            alphanetToast: nonwAp.firstLetter
          })
        }
      }
    }
  },
  handlerSelectCarSeries(e) {
    let carSeries = e.currentTarget.dataset.carseries;
    console.log(carSeries)
    let that = this;
    let {
      HTTPS_YMCAPI
    } = this.data;

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
  handlerMakePhoneCall(e) {
    let phone =  e.currentTarget.dataset.phone //'18621016627'

    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  onTouchMoveWithCatch() {
    // 拦截触摸移动事件， 阻止透传
  }
})
