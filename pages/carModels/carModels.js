let modules = require('../../lib/modules.js');
let config = require('../../lib/config.js');
Page({
	data: {
		carModelsList: [],
		carSeriesName: '',
		windowHeight: ''
	},
	onLoad (options) {
		let carsInfo = JSON.parse(options.carsInfo);
		let HTTPS_YMCAPI = config.ymcServerHTTPSUrl;
		let that = this;
		try {
      var res = wx.getSystemInfoSync();
			console.log(res)
      this.pixelRatio = res.pixelRatio;
      this.apHeight = 16;
      this.offsetTop = 80;
      this.setData({windowHeight: res.windowHeight + 'px'})
    } catch (e) {
      
    }
		if (carsInfo) {
			// 设置NavigationBarTitle.
			wx.setNavigationBarTitle({
				title: carsInfo.seriesName
			})
			modules.request({
				url: HTTPS_YMCAPI + '/carModel/modelsPromotion', //仅为示例，并非真实的接口地址
				method: 'GET',
				data: {
					carSeriesId: carsInfo.id,
					cityId: '7d04e3a1-ee87-431c-9aa7-ac245014c51a'
				},
				success: function(res) {
					console.log(res);
					let carModelsList = [];
					let data = res.data.data;
					if(data) {
						let carSeriesPicUrl = data.carSeriesPicUrl;
						for(let item of data.carModelList) {
							for(let list of item.carModelModelList) {
								list.count = (list.officePrice - list.price).toFixed(2);
								list.carSeriesPicUrl = carSeriesPicUrl;
								carModelsList.push(list);
							}
						}
						console.log(carModelsList)
						that.setData({
							carSeriesName: data.carSeriesName,
							carModelsList: carModelsList
						})
					}
				}
			})
		}
	},
	onShow () {
		
	},
	handlerToCarSources (e) {
		let carModelsInfo = JSON.stringify(e.currentTarget.dataset.carmodelsinfo);
		wx.navigateTo({  
      url: '../carSources/carSources?carModelsInfo='+ carModelsInfo
    }) 
	},
	handlerPromptly (e) {
		let carModelsInfo = JSON.stringify(e.currentTarget.dataset.carmodelsinfo);
//		wx.navigateTo({  
//      url: '../carSources/carSources?carModelsInfo='+ carModelsInfo
//    }) 
	}
	
})