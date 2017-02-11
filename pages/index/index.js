//index.js
let app = getApp();
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
		carManufacturerSeriesList:[]
  },
  //事件处理函数
  searchCarType() {
		console.log('To Search')
		wx.navigateTo({
			url: '../search/search'
		})
	},
  onLoad() {
    let that = this;
		let HTTPS_URL = app.config.ymcServerHTTPSUrl;
		try {
      var res = wx.getSystemInfoSync();
      this.pixelRatio = res.pixelRatio;
      this.apHeight = 16;
      this.offsetTop = 80;
      this.setData({windowHeight: res.windowHeight + 'px'})
    } catch (e) {
      
    }
		that.setData({
			HTTPS_YMCAPI: HTTPS_URL
		})
		// 获取页面数据.
		
		app.modules.request({
			url: HTTPS_URL + 'carBrand/brandGroupsRecommend', //仅为示例，并非真实的接口地址
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
				let data = res;
				let recommendCarBrandList = data.recommendCarBrandList;
				let brandGroupList = data.brandGroupList;
				that.setData({
					hotCarLists: recommendCarBrandList,
					brandGroupList: brandGroupList
				})
			}
		})
		
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
  },
	handlerAlphaTap(e) {
    let {ap} = e.target.dataset;
		let that = this;
    that.setData({alpha: ap});
    that.setData({alphanetToast: ap});
  },
  handlerMove(e) {
    let {brandGroupList} = this.data;
    let moveY = e.touches[0].clientY;
    let rY = moveY - this.offsetTop;
		let that = this;
    if(rY >= 0) {
      let index = Math.ceil((rY - that.apHeight)/ that.apHeight);
      if(0 <= index < brandGroupList.length) {
        let nonwAp = brandGroupList[index];
				if(nonwAp) {
					that.setData({alpha: nonwAp.firstLetter});
					that.setData({alphanetToast: nonwAp.firstLetter});
				}
      } 
    }
  },
	handlerSelectCarSeries(e) {
		let carSeries = e.currentTarget.dataset.carseries;
		let that = this;
		let {HTTPS_YMCAPI} = this.data;
		
		app.modules.request({
			url: HTTPS_YMCAPI + '/carSeries/seriesPromotion', //仅为示例，并非真实的接口地址
			method: 'GET',
			data: {
				carBrandId: carSeries.id,
				cityId: '7d04e3a1-ee87-431c-9aa7-ac245014c51a'
			},
			header: {
					'content-type': 'application/json'
			},
			success: function(res) {
				let data = res;
				that.setData({
					showCarSeriesImageUrl: data.logoUrl,
					carManufacturerSeriesList: data.carManufacturerSeriesList
				})
			}
		})
		that.setData({showCarSeries: carSeries});
		that.setData({showMask: 'showMask'});
		that.setData({showCarSeriesInner: 'rightToLeft'});
	},
	removeCarSeriesInner(e) {
		let that = this;
		that.setData({
			showCarSeries: '',
			carManufacturerSeriesList: []
		});
	},
	handlerToCarsModels(e) {
		let carsInfo = JSON.stringify(e.currentTarget.dataset.carsinfo);
		wx.navigateTo({  
      url: '../carModels/carModels?carsInfo='+ carsInfo
    }) 
	}
})
