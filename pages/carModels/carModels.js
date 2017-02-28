let app = getApp()
Page({
	data: {
		carModelsList: [],
		windowHeight: '',
		windowWidth: ''
	},
	createSimulationData () {
			var categories = [];
			var data = [];
			for (var i = 0; i < 50; i++) {
					categories.push('2016-' + (i + 1));
					data.push(Math.random()*(20-10)+10);
			}

			return {
					categories: categories,
					data: data
			}
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
			this.windowWidth = res.windowWidth - 30
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
						
						for (let item of carModelsList) {
              item.count = Math.abs(((item.officialPrice - item.lowestPriceSku.price)/10000).toFixed(2))
							new app.wxcharts({
								canvasId: item.carModelId,
								type: 'area',
								categories: ['1-2','2-3','3-4','4-5','5-6'],
								animation: false,
								color: '#ECF0F7',
								legend: false,
								series: [{
									data: [2,6,2,3,1],
									format: function (val) {
											return `${val.toFixed(0)}人`
									}
								}],
								xAxis: {
									disableGrid: false,
									fontColor: '#999999',
									gridColor: '#f1f1f1'
								},
								yAxis: {
									disabled: true,
									fontColor: '#4C6693',
									min: 0,
									format(val) {
										return val.toFixed(0)
									}
								},
								dataItem: {
									color: '#ECF0F7'
								},
								width: that.windowWidth,
								height: 80,
								dataLabel: true,
								dataPointShape: false
							})
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