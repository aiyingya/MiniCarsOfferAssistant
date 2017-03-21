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
		showCharts: true,
    YMC_HTTPS_URL: app.config.ymcServerHTTPSUrl,
    pageIndex: 1,
    pageInfo: ''
  },
	onLoad() {
		let that = this
		let HTTPS_URL = app.config.tradeServerHTTPSUrl
		try {
      let res = wx.getSystemInfoSync()
			let carModelsHeight
      this.pixelRatio = res.pixelRatio
      this.apHeight = 16
      this.offsetTop = 80
			carModelsHeight = res.windowHeight - 55
      this.setData({
				windowHeight: res.windowHeight + 'px',
				carModelsHeight: carModelsHeight+ 'px',
				HTTPS_YMCAPI: HTTPS_URL
			})
    } catch (e) {

    }
    this.$wuxToast = app.wux(this).$wuxToast
	},
	handleSearchInput(e) {
		let val = e.detail.value;
		let that = this;
		let searchResults = [];
		if(val) {
			app.modules.request({
				url: that.data.HTTPS_YMCAPI + 'cgi/search/car/index',
				method: 'GET',
				loadingType: 'none',
				data: {
					text: val,
					n: 12
				},
				success: function(res) {
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
		if(results.type === 'CAR_SPU') {
			url = that.data.YMC_HTTPS_URL + 'supply/car/spu/'+results.id
		} else if (results.type === 'CAR_SERIES') {
			url = that.data.YMC_HTTPS_URL + 'supply/car/spu'
			data = {
				carSeriesId: results.id
			}
		}
		app.modules.request({
			url: url,
			method: 'GET',
			data: data,
			success: function(res) {
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
  getSearchConfirm(pageIndex) {
    let val = this.data.cacheSearchValue
		let that = this
    let searchNodata = false
    let searchResults = []
    app.modules.request({
			url: that.data.YMC_HTTPS_URL+ 'search/car/spu',
			method: 'GET',
			data: {
				text: val,
				pageIndex: pageIndex,
				pageSize: 10
			},
			success: function(res) {
        if(res.first) {
          searchNodata = res.content.length > 0 ? false : true
          searchResults = res.content
        } else {
          searchResults = that.data.searchResults
          for(let item of res.content) {
            searchResults.push(item)
          }
        }
        
        that.data.pageInfo = {
          first: res.first,
          hasNext: res.hasNext,
          hasPrevious: res.hasPrevious,
          last: res.last,
          number: res.number,
          numberOfElements: res.numberOfElements,
          size: res.size,
          totalElements: res.totalElements,
          totalPages: res.totalPages
        }
        that.drawCanvas(searchResults)
				that.setData({
					searchResults: searchResults,
					associateResults: [],
					showResultsSearch: false,
					searchNodata: searchNodata
				})
			}
		})
  },
	handleSearchConfirm(e) {
		let val = this.data.cacheSearchValue
		let that = this
		this.data.pageIndex = 1
    this.getSearchConfirm(this.data.pageIndex)
	},
  onReachBottom() {
    let that = this
    let searchPageInfo = that.data.pageInfo 
    if(!searchPageInfo.hasNext) return
    
    this.data.pageIndex++
    this.getSearchConfirm(this.data.pageIndex)
    console.log(searchPageInfo)
  },
	handlerToCarSources (e) {
    let item = e.currentTarget.dataset.carmodelsinfo
		let carModelsInfoKeyValueString = util.urlEncodeValueForKey('carModelsInfo', item)
		let status = item.supply.status
		let that = this
    let carModelsList = this.data.searchResults

		if(status === '暂无供货') {
      this.setData({
        showCharts: false
      })
			this.$wuxToast.show({
				type: false,
        timer: 2000,
        color: '#fff',
        text: '暂无供货'
			})
      setTimeout(function() {
        that.setData({
          showCharts: true
        })
        that.drawCanvas(carModelsList)
      },2000)
			return
		}
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
			that.windowWidth = res.windowWidth
    } catch (e) {

    }
		for (let item of data) {
			if(item.supply.chart) {
				new app.wxcharts({
					canvasId: item.carModelId,
					type: 'column',
					categories: item.supply.chart.x,
					animation: false,
					color: '#ECF0F7',
					legend: false,
					background: '#ECF0F7',
					series: [{
            name: '1',
            data: item.supply.chart.y,
            color: '#d2e1f6'
          }],
					xAxis: {
            disableGrid: true,
            fontColor: '#333333',
            gridColor: '#333333',
            unitText: '下(万)'
          },
          yAxis: {
            disabled: true,
            fontColor: '#333333',
            gridColor: '#333333',
            min: 10,
            max: 50,
            unitText: '（个）',
            format(val) {
              return val.toFixed(0)
            }
          },
          dataItem: {
            color: '#ECF0F7'
          },
          width: that.windowWidth,
          height: 120,
          dataLabel: true,
          dataPointShape: false,
          extra: {
            area: ['风险','适宜2.43~3.73','偏贵'],
            hint: item.supply.chart.hint,
            ratio: '0.4',
            index: item.supply.chart.priceIndex
          }
				})
			}
		}
	}
})
