//index.js
const util = require('../../utils/util.js')

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
		imageDomain: 'http://produce.oss-cn-hangzhou.aliyuncs.com/ops',
		HTTPS_YMCAPI: '',
		showCarSeriesImageUrl: '',
		carManufacturerSeriesList:[],
		userInfo: ''
  },
  //事件处理函数
  searchCarType() {
		console.log('To Search')
		let userInfo = app.userInfo()
		if(userInfo) {
			wx.navigateTo({
				url: '../search/search'
			})
		}else {
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
		let HTTPS_URL = app.config.ymcServerHTTPSUrl
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
			url: HTTPS_URL + 'carBrand/brandGroupsRecommend', 
			method: 'GET',
			data: {
				cityId: '7d04e3a1-ee87-431c-9aa7-ac245014c51a',
				recommendPositionCode: 'sy004',
				num: '10'
			},
			header: {
					'content-type': 'application/json'
			},
			success: function(res) {
				if(res){
					let data = res
					let recommendCarBrandList = data.recommendCarBrandList
					let brandGroupList = data.brandGroupList

          for (var i = 0; i < recommendCarBrandList.length; i++) {
						let item = recommendCarBrandList[i]
						item.carBrandLogoUrl = that.data.imageDomain + item.carBrandLogoUrl
          }
					
					that.setData({
						hotCarLists: recommendCarBrandList,
						brandGroupList: brandGroupList
					})
				}
				
			}
		})
		
		// 获取热推车型.
		that.getHotpushCars()
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
		
		/// 初始化自定义组件
    this.$wuxTrack = app.wux(this).$wuxTrack
		
//		const push = this.$wuxTrack.push({
//			appVersion: '1.0.1'
//		})
  },
	onShow() {
		// 刷新用户信息.
		
		app.getNewAccessToken()
		// 获取locationId
		app.getLocationId()
		
		
	},
	getHotpushCars () {
		let that = this
		let HTTPS_URL = app.config.ymcServerHTTPSUrl
		
		app.modules.request({
			url: HTTPS_URL + 'recommend/goods', 
			method: 'GET',
			data: {
				channel: 'wxapp',
				pageIndex: '1',
				pageSize: '10'
			},
			success: function(res) {
				let data = res.content
				that.setData({
					hotCarsTypes: data
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
    if(rY >= 0) {
      let index = Math.ceil((rY - that.apHeight)/ that.apHeight)
      if(0 <= index < brandGroupList.length) {
        let nonwAp = brandGroupList[index]
				if(nonwAp) {
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
		
		app.modules.request({
			url: HTTPS_YMCAPI + 'product/car/series', //仅为示例，并非真实的接口地址
			method: 'GET',
			data: {
				brandId: carSeries.id
			},
			success: function(res) {
				if(res) {
					let data = res;
					that.setData({
						showCarSeriesImageUrl: that.data.imageDomain + data.brandLogoUrl,
						carManufacturerSeriesList: data.manufacturers
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
			showCarSeriesImageUrl: ''
		});
	},
	handlerToCarsModels(e) {
		let carsInfoKeyValueString = url.urlEncodeValueForKey('carsInfo', e.currentTarget.dataset.carsinfo)
		let userInfo = app.userInfo()
		
		if(userInfo) {
			wx.navigateTo({  
				url: '../carModels/carModels?' + carsInfoKeyValueString
			}) 
		}else {
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
