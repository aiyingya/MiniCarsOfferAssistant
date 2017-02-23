let app = getApp();
Page({
	data: {
		carModelsList: [],
		windowHeight: ''
	},
	onLoad (options) {
		let carsInfo = JSON.parse(options.carsInfo)
		let HTTPS_YMCAPI = app.config.ymcServerHTTPSUrl
		let that = this
		try {
      let res = wx.getSystemInfoSync()
      this.pixelRatio = res.pixelRatio
      this.apHeight = 16
      this.offsetTop = 80
      this.setData({windowHeight: res.windowHeight + 'px'})
    } catch (e) {
      
    }
		if (carsInfo) {
			// 设置NavigationBarTitle.
			wx.setNavigationBarTitle({
				title: carsInfo.seriesName
			})
			app.modules.request({
				url: HTTPS_YMCAPI + 'product/car/spu', 
				method: 'GET',
				data: {
					carSeriesId: carsInfo.seriesId
				},
				success: function(res) {
					let carModelsList = res;
					if(carModelsList) {

						for (var i = 0; i < carModelsList.length; i++) {
						  let item = carModelsList[i]
              item.count = Math.abs(((item.officialPrice - item.lowestPriceSku.price)/10000).toFixed(2))
            }
						that.setData({
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
		wx.navigateTo({  
      url: '../quote/quotationCreate/quotationCreate?carModelsInfo='+ carModelsInfo
    }) 
	}
	
})