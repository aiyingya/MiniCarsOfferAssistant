let app = getApp()
let util = require('../../utils/util.js')

Page({
	data: {
		carModelsList: [],
		cacheCarModelsList: [],
		windowHeight: '',
		windowWidth: '',
		showRmendCarFacade: false,
		filtersData: [],
		CarsModeleText: '全部车款',
		CarsModeleSelectId: 0,
		showCharts: true // 是否展示charts图表，解决弹出层无法点击问题
	},
	onLoad (options) {
		let carsInfo = util.urlDecodeValueForKeyFromOptions('carsInfo', options)
		let HTTPS_YMCAPI = app.config.ymcServerHTTPSUrl
		let that = this
		try {
      let res = wx.getSystemInfoSync()
      this.pixelRatio = res.pixelRatio
      this.apHeight = 16
      this.offsetTop = 80
			this.windowWidth = res.windowWidth - 30
      this.setData({windowHeight: (res.windowHeight-44) + 'px'})
    } catch (e) {
      
    }
		this.$wuxToast = app.wux(this).$wuxToast
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
						
						that.drawCanvas(carModelsList)
						for(let item of filters) {
							filtersData = item.items
						}
						
						that.setData({
							carModelsList: carModelsList,
							cacheCarModelsList: carModelsList,
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
		let carModelsList = this.data.carModelsList
		if(weitch) {
			this.drawCanvas(carModelsList)
			this.setData({
				showRmendCarFacade: false,
				showCharts: true
			})
		}else {
			this.setData({
				showRmendCarFacade: true,
				showCharts: false
			})
		}
	},
	handleSelectCarsModele(e) {
		let selectItem = e.currentTarget.dataset.select
		let selectId = e.currentTarget.dataset.id
		let carModelsList = this.data.cacheCarModelsList
		let newModelsList = []
		if(selectItem.name === '全部') {
			newModelsList = carModelsList
		}else {
			for(let item of carModelsList) {
				if(item.yearStyle === selectItem.name) {
					
					newModelsList.push(item)
				}
			}
		}
		this.drawCanvas(newModelsList)
		this.setData({
			CarsModeleText: selectItem.name,
			CarsModeleSelectId: selectId,
			carModelsList: newModelsList,
			showRmendCarFacade: false,
			showCharts: true
		})
	},
	handlerToCarSources (e) {
		let item = e.currentTarget.dataset.carmodelsinfo
		let carModelsInfoKeyValueString = util.urlEncodeValueForKey('carModelsInfo', item)
		let status = item.supply.status
		
		if(status === '暂无供货') {
			this.$wuxToast.show({
				type: false,
        timer: 2000,
        color: '#fff',
        text: '暂无供货',
			})
			return
		}
		wx.navigateTo({
      url: '../carSources/carSources?' + carModelsInfoKeyValueString
    }) 
	},
	handlerPromptly (e) {

		let carModelsInfoKeyValueString =  util.urlEncodeValueForKey('carModelsInfo', e.currentTarget.dataset.carmodelsinfo)
		
		wx.navigateTo({  
      url: '../quote/quotationCreate/quotationCreate?' + carModelsInfoKeyValueString
    }) 
	},
	headlerRemoveRmendCarFacade() {
		let carModelsList = this.data.carModelsList
		this.drawCanvas(carModelsList)
		this.setData({
			showRmendCarFacade: false,
			showCharts: true
		})
	},
	drawCanvas(list) {
		if (!list) {return}
		let data = list
		let that = this
		try {
      let res = wx.getSystemInfoSync()
      that.pixelRatio = res.pixelRatio
      that.apHeight = 16
      that.offsetTop = 80
			that.windowWidth = res.windowWidth - 30
    } catch (e) {
      
    }
		for (let item of data) {
			if(item.supply.supplierCount > 0) {
				new app.wxcharts({
					canvasId: item.carModelId,
					type: 'line',
					categories: item.supply.chart.x,
					animation: false,
					color: '#ECF0F7',
					legend: false,
					background: '#ECF0F7',
					series: [{
						data: item.supply.chart.y,
						format: function (val) {
								return `${val.toFixed(0)}`
						}
					}],
					xAxis: {
						disableGrid: true,
						fontColor: '#999999',
						gridColor: '#afafaf'
					},
					yAxis: {
						disabled: true,
						fontColor: '#4C6693',
						format(val) {
							return val.toFixed(2)
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
	}
	
})
