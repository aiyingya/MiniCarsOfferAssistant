/* search.js*/
let app = getApp();

const util = require('../../utils/util.js')

Page({
	data: {
		associateResults: [],
		searchResults: [],
		windowHeight: '',
		carModelsHeight: '',
		HTTPS_YMCAPI: '',
		searchValue:'',
		cacheSearchValue:'',
		widthToChange: '',
		showResultsSearch: true,
		searchNodata: false,
		showSearchBtn: false,
		showCharts: true
  },
	onLoad() {
		let that = this;
		let HTTPS_URL = app.config.ymcServerHTTPSUrl;
		try {
      let res = wx.getSystemInfoSync();
			let carModelsHeight;
      this.pixelRatio = res.pixelRatio;
      this.apHeight = 16;
      this.offsetTop = 80;
			carModelsHeight = res.windowHeight - 55;
      this.setData({
				windowHeight: res.windowHeight + 'px',
				carModelsHeight: carModelsHeight+ 'px',
				HTTPS_YMCAPI: HTTPS_URL
			})
    } catch (e) {
      
    }
	},
	handleSearchInput(e) {
		let val = e.detail.value;
		let that = this;
		let searchResults = [];
		if(val) {
			app.modules.request({
				url: that.data.HTTPS_YMCAPI + 'search/car/index', 
				method: 'GET',
				loadingType: 'none',
				data: {
					text: val,
					n: 12
				},
				success: function(res) {
					console.log(res)
					that.setData({
						associateResults: res,
						searchResults: [],
						showResultsSearch: true,
						searchNodata: false,
						showSearchBtn: true,
						cacheSearchValue: val
					})
				}
			})
		}else {
			that.setData({
				associateResults: [],
				searchResults: [],
				searchNodata: false,
				showSearchBtn: false,
				cacheSearchValue: val
			})
		}
	},
	handlerChooseResults (e) {
		let that = this
		let results = e.currentTarget.dataset.results
		let url 
		let data = {}
		let carModelsList = []
		let searchNodata = false
		console.log(results)	
		if(results.type === 'SPU') {
			url = that.data.HTTPS_YMCAPI + 'supply/car/spu/'+results.id
		}else {
			url = that.data.HTTPS_YMCAPI + 'supply/car/spu'
			data = {
				carSeriesId: results.id
			}
		}
		app.modules.request({
			url: url, 
			method: 'GET',
			data: data,
			success: function(res) {
				console.log(res)			
				carModelsList = res.content
				searchNodata = carModelsList.length > 0 ? false : true
				
				if(carModelsList) {
					that.drawCanvas(carModelsList)
					that.setData({
						searchResults: carModelsList,
						associateResults: [],
						searchValue: results.content,
						cacheSearchValue: results.content,
						showResultsSearch: false,
						searchNodata: searchNodata
					})
				}
			}
		})
	},
	handleSearchConfirm(e) {
		let val = this.data.cacheSearchValue
		let that = this
		let searchResults = []
		let searchNodata = false
		app.modules.request({
			url: that.data.HTTPS_YMCAPI+ 'search/car/spu', 
			method: 'GET',
			data: {
				text: val,
				pageIndex: 1,
				pageSize: 10
			},
			success: function(res) {
				console.log(res)
				if(res.content.length <= 0) {
					searchNodata = true
				}
				that.drawCanvas(res.content)
				that.setData({
					searchResults: res.content,
					associateResults: [],
					showResultsSearch: false,
					searchNodata: searchNodata
				})
			}
		})
	},
	handlerToCarSources (e) {
		const carModelsInfoKeyValueString = util.urlEncodeValueForKey('carModelsInfo', e.currentTarget.dataset.carmodelsinfo)
		wx.navigateTo({  
      url: '../carSources/carSources?' + carModelsInfoKeyValueString
    }) 
	},
	handlerPromptly (e) {
    const carModelsInfoKeyValueString = util.urlEncodeValueForKey('carModelsInfo', e.currentTarget.dataset.carmodelsinfo)
		wx.navigateTo({
      url: '../quote/quotationCreate/quotationCreate?' + carModelsInfoKeyValueString
    }) 
	},
	handleCancelSearch () {
		wx.navigateBack()
	},
	handleCancelSearchValue () {
		this.setData({
			associateResults: [],
			searchResults: [],
			showResultsSearch: false,
			searchNodata: false,
			showSearchBtn: false,
			searchValue: ''
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
								return `${val.toFixed(0)}`
						}
					}],
					xAxis: {
						disableGrid: false,
						fontColor: '#999999',
						gridColor: '#afafaf'
					},
					yAxis: {
						disabled: true,
						fontColor: '#4C6693',
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
	}
})