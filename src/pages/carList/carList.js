//index.js
import utils from '../../utils/util'
import { system, container } from '../../landrover/business/index'

Page({
  data: {
    hotCarLists: [],
    brandGroupList: [],
    alpha: '',
    windowHeight: '',
    windowWidth: '',
    drawerW: '',
    showCarSeries: '',
    showCarSeriesInner: '',
    showCarSeriesImageUrl: '',
    carManufacturerSeriesList: [],
    showNodata: false
  },
  onLoad() {
    const that = this
    this.setData({
      windowHeight: system.windowHeight,
      windowWidth: system.windowWidth,
      drawerW: system.windowWidth * 0.8
    })

    container.tradeService.getNavigatorForCarBrands()
      .then(function (res) {
        if (res) {
          that.setData({
            brandGroupList: res
          })
        }
      }, function (err) {
      })
  },
  onShow() {
  },
  handlerAlphaTap(e) {
    let { ap } = e.target.dataset
    let that = this
    that.setData({ alpha: ap })
    that.setData({ alphanetToast: ap })
  },
  handlerMove(e) {
    let { brandGroupList } = this.data
    let moveY = e.touches[0].clientY
    let rY = moveY - this.offsetTop
    let that = this
    if (rY >= 0) {
      let index = Math.ceil((rY - that.apHeight) / that.apHeight)
      if (0 <= index < brandGroupList.length) {
        let nonwAp = brandGroupList[index]
        if (nonwAp) {
          that.setData({ alpha: nonwAp.title })
          that.setData({ alphanetToast: nonwAp.title })
        }
      }
    }
  },
  handlerSelectCarSeries(e) {
    let carSeries = e.currentTarget.dataset.carseries;
    console.log(carSeries)
    let that = this;
    let { HTTPS_YMCAPI } = this.data;

    container.tradeService.getNavigatorForCarSeries(carSeries.id)
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
    const carsInfoKeyValueString = utils.urlEncodeValueForKey('carsInfo', e.currentTarget.dataset.carsinfo)
    if (container.userService.isLogin()) {
      wx.navigateTo({
        url: '../carModels/carModels?' + carsInfoKeyValueString
      })
    } else {
      wx.navigateTo({
        url: '../login/login'
      })
    }
  },
  handlePullDownRefresh() {
    console.log(2)
  },
})
