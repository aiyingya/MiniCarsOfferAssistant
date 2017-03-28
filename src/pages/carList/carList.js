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
		imageDomain: 'http://produce.oss-cn-hangzhou.aliyuncs.com/ops',
		HTTPS_YMCAPI: '',
		showCarSeriesImageUrl: '',
		carManufacturerSeriesList:[],
    showNodata: false
  },
  onLoad() {
    let that = this
		let HTTPS_URL = app.config.tradeServerHTTPSUrl
		try {
      let res = wx.getSystemInfoSync()
      this.pixelRatio = res.pixelRatio
      this.apHeight = 16
      this.offsetTop = 80
      this.setData({windowHeight: res.windowHeight + 'px'})
    } catch (e) {

    }
		that.setData({
			HTTPS_YMCAPI: HTTPS_URL
		})
		// 获取页面数据.

		app.modules.request({
			url: HTTPS_URL + 'cgi/navigate/brands/query',
			method: 'POST',
			data: {
				"code": "0",
        "deleted": false,
        "group": true,
        "joinOnSaleCount": true,
        "level": 1
			},
			header: {
					'content-type': 'application/json'
			},
			success: function(res) {
				if(res){
					that.setData({
						brandGroupList: res
					})
				}

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
    if(rY >= 0) {
      let index = Math.ceil((rY - that.apHeight)/ that.apHeight)
      if(0 <= index < brandGroupList.length) {
        let nonwAp = brandGroupList[index]
				if(nonwAp) {
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

		app.modules.request({
			url: HTTPS_YMCAPI + 'cgi/navigate/models/query',
			method: 'POST',
			data: {
				brandId: carSeries.id,
        deleted: false,
        group: true,
        joinOnSaleCount: true,
        level: 1
			},
			success: function(res) {
				if(res) {
					let data = res
          let showNodata = false
          if(data.length === 0) {
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
			showMask: 'showMask',
			showCarSeriesInner: 'rightToLeft'
		})
	},
	removeCarSeriesInner(e) {
		let that = this;
		that.setData({
			showCarSeries: '',
			carManufacturerSeriesList: [],
			showCarSeriesImageUrl: '',
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
  }
})
