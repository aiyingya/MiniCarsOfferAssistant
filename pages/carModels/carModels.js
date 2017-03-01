let app = getApp()
Page({
	data: {
		carModelsList: [],
		windowHeight: '',
		windowWidth: '',
		showRmendCarFacade: false,
		filtersData: [],
		CarsModeleText: '全部车款',
		CarsModeleSelectId: 0
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
				url: HTTPS_YMCAPI + 'supply/car/spu', 
				method: 'GET',
				data: {
					carSeriesId: carsInfo.seriesId
				},
				success: function(res) {
					let carModelsList = res.content
					let filters = res.filters
					let filtersData 
					if(carModelsList) {
						for (let item of carModelsList) {
              if(item.supply) {
              	new app.wxcharts({
									canvasId: item.carModelId,
									type: 'line',
									categories: item.supply.chart.x,
									animation: false,
									color: '#ECF0F7',
									legend: false,
									series: [{
										data: item.supply.chart.y,
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
										max: 50,
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
            }
						
						for(let item of filters) {
							filtersData = item.items
						}
						
						that.setData({
							carModelsList: carModelsList,
							filtersData: filtersData
						})
					}
				}
			})
		}
	
	},
	onShow () {
		
	},
	handleCheckCarsModele() {
		let weitch = this.data.showRmendCarFacade
		if(weitch) {
			this.setData({
				showRmendCarFacade: false
			})
		}else {
			this.setData({
				showRmendCarFacade: true
			})
		}
	},
	handleSelectCarsModele(e) {
		
		let selectItem = e.currentTarget.dataset.select
		let selectId = e.currentTarget.dataset.id
		
		console.log(selectItem,selectId)
		this.setData({
			CarsModeleText: selectItem.name,
			CarsModeleSelectId: selectId
		})
	},
	handlerToCarSources (e) {
		let carModelsInfo = JSON.stringify(e.currentTarget.dataset.carmodelsinfo);
		wx.navigateTo({
      url: '../carSources/carSources?carModelsInfo='+ carModelsInfo
    }) 
	},
	handlerPromptly (e) {
		let carModelsInfo = JSON.stringify(e.currentTarget.dataset.carmodelsinfo)
		console.log(carModelsInfo)
		wx.navigateTo({  
      url: '../quote/quotationCreate/quotationCreate?carModelsInfo='+ carModelsInfo
    }) 
	}
	
})