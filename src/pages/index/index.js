
import {
  $wuxTrack
} from '../../components/wux'
import util from '../../utils/util'
import YMC from '../../services/YMC'
import config from '../../config'

// import moment from 'moment'


let app = getApp()
Page({
  data: {
    hotCarLists: [],
    hotCarsTypes: [],
    brandGroupList: [],
    alpha: '',
    windowHeight: '',
    windowWidth: '',
    drawerW: '',
    showCarSeries: '',
    showMask: '',
    showCarSeriesInner: '',
    showCarSeriesImageUrl: '',
    carManufacturerSeriesList: [],
    showNodata: false,
    anewReload: false,
    firstLoadFlag: true
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

    try {
      let res = wx.getSystemInfoSync()
      config.system = res
    } catch (e) {

    }

    let that = this
    this.setData({
      windowHeight: config.system.windowHeight,
      windowWidth: config.system.windowWidth,
      drawerW: config.system.windowWidth * 0.8
    })

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

    this.data.firstLoadFlag = false

    wx.showShareMenu()
  },
  onShow() {
    // 下拉刷新
    if (!this.data.firstLoadFlag) {
      const promise = this.reloadIndexData()
      console.log(promise)
      promise.then(res => {
      }, err => {
      })
    }
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
    let { HTTPS_YMCAPI } = this.data;

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

    // 新的添加抽屉代码
    const animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    });
    this.animation = animation;
    animation.translateX(-this.data.drawerW).step();
    this.setData({
        showDrawerFlag: true,
        showCarSeries: carSeries,
        showCarSeriesImageUrl: carSeries.logoUrl,
        animationData: animation.export()
    });
  },
  // 新的移除抽屉的代码
  removeCarSeriesInner(e) {
    this.setData({
      showCarSeries: '',
      showCarSeriesImageUrl: '',
      carManufacturerSeriesList: [],
      showNodata: false
    });

    const animation = wx.createAnimation({
      duration: 600,
      timingFunction: "linear",
      delay: 0
    });
    this.animation = animation;

    animation.translateX(this.data.drawerW).step();
    this.setData({
      animationData: animation.export()
    })
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
  }
})
