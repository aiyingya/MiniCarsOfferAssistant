
import {
  $wuxTrack,
  $wuxToast
} from '../../components/wux'
import utils from '../../utils/util'
import * as wxapi from 'fmt-wxapp-promise'
import { system, container } from '../../landrover/business/index'

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
    firstLoadFlag: true,
    visitorInfo: {
      status: 'none',
      times: {
        hours: '',
        days: '',
        minutes: '',
        seconds: ''
      }
    },
    guestTimeIntervalHandler: null,
    searchBarPlaceholder: '🔍 输入指导价/车款名 快速查找',
    searchBarValue: '',
  },
  //事件处理函数
  searchCarType() {
    console.log('To Search')
    if (container.userService.isLogin()) {
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
      const res = wx.getSystemInfoSync()
      Object.assign(system, res)
    } catch (e) {
      console.log('同步获取 system info 错误')
    }

    let that = this
    this.setData({
      windoweight: system.windowHeight,
      windowWidth: system.windowWidth,
      drawerW: system.windowWidth * 0.8
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


    if (wx.showShareMenu) {
      wx.showShareMenu()
    }
  },
  onShow() {
    // 下拉刷新
    if (!this.data.firstLoadFlag) {
      this.reloadIndexData()
        .then(res => {
        })
        .catch(err => {
        })
    }
    this.data.firstLoadFlag = false

    // 傅斌: 微信登陆成功后得到 sessionId 才可以获取访客信息
    // 该接口首页启动时只掉一次, 此后每当用户进入用户中心页面时会刷新一次
    container.userService.promiseForWeixinLogin
      .then(res => {
        return this.getGuestUserInfo()
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
    return container.tradeService.getHotPushBrands()
      .then((res) => {
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
    return container.tradeService.getHotPushCarModels()
      .then((res) => {
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
  /**
   * 倒计时.
   */
  getTimeRemaining(endtime) {
    var t = Date.parse(endtime) - Date.parse(new Date());
    var seconds = Math.floor((t / 1000) % 60);
    var minutes = Math.floor((t / 1000 / 60) % 60);
    var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    var days = Math.floor(t / (1000 * 60 * 60 * 24));
    return {
      'total': t,
      'days': days,
      'hours': hours,
      'minutes': minutes,
      'seconds': seconds
    };
  },
  initializeClock(endtime, status) {
    // 每次进入该方法都要清除上次的定时器, 确保始终只有一个定时器运转
    if (this.data.guestTimeIntervalHandler != null) {
      clearInterval(this.data.guestTimeIntervalHandler)
      this.data.guestTimeIntervalHandler = null
    }

    const updateClock = () => {
      var t = this.getTimeRemaining(endtime)

      var days =  t.days
      var hours = (t.hours)
      var minutes = (t.minutes)
      var seconds = (t.seconds)
      //console.log(days,hours,minutes,seconds)
      var times = {
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds
      }

      if (t.total <= 0) {
        // 当超时, 清除定时器
        clearInterval(this.data.guestTimeIntervalHandler)
        this.data.guestTimeIntervalHandler = null
        wx.showModal({
          title: '提示',
          content: '很抱歉，您的有效期已到期，可联系何先生 15821849025获取权限',
          cancelColor: '#ED4149',
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              container.userService.logout()
              this.setData({
                'visitorInfo.status': 'none'
              })
            }
          }
        })
      } else {
        this.setData({
          'visitorInfo.status': status,
          'visitorInfo.times': times
        })
      }
    }
    updateClock()
    this.data.guestTimeIntervalHandler = setInterval(updateClock, 1000)
  },
  /**
   * 获取访客信息.
   */
  getGuestUserInfo() {
    if (container.userService.auth == null) {
      this.setData({
        'visitorInfo.status': 'none'
      })
      return Promise.reject(new Error('没有登录状态, 重置'))
    } else {
      return container.userService.getRoleInformation()
        .then((res) => {
          if (res.roleName === 'guest') {
            const roleInfo = res.roleInfo
            if (roleInfo.status !== 'none') {
              let date = roleInfo.expireTime.replace(/-/g, '/')
              let deadline = new Date(Date.parse(date))
              this.initializeClock(deadline, roleInfo.status)
            } else {
              this.setData({
                'visitorInfo.status': 'none'
              })
            }
          }
        })
        .catch((err) => {
          this.setData({
            'visitorInfo.status': 'none'
          })
          return Promise.reject(new Error('发生错误, 重置'))
        })
    }
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
    })
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
    if (container.userService.isLogin()) {
      const carsInfoKeyValueString = utils.urlEncodeValueForKey('carsInfo', e.currentTarget.dataset.carsinfo)
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
    const phoneNumber = e.currentTarget.dataset.phone //'18621016627'
    wxapi.makePhoneCall({ phoneNumber: phoneNumber })
      .catch(err => {
        console.error(err)
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
          }
        }
      })
    // 这里打给何先生 不需要上报手机
  }
})
