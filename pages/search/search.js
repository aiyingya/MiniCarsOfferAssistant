/* search.js*/
let app = getApp();
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
		showSearchBtn: false
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
			url = that.data.HTTPS_YMCAPI + 'product/car/spu/'+results.id
		}else {
			url = that.data.HTTPS_YMCAPI + 'product/car/spu'
			data = {
				carSeriesId: results.id
			}
		}
		app.modules.request({
			url: url, 
			method: 'GET',
			data: data,
			success: function(res) {
				if(!(res instanceof Array)) {
					carModelsList.push(res)
				}else {
					carModelsList = res
				}
				searchNodata = carModelsList.length > 0 ? false : true
				
				if(carModelsList) {
					for (var i = 0; i < carModelsList.length; i++) {
						let item = carModelsList[i]
						item.count = Math.abs(((item.officialPrice - item.lowestPriceSku.price)/10000).toFixed(2));
					}
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
			url: that.data.HTTPS_YMCAPI+ '/search/car/spu', 
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
				for (var i = 0; i < res.content.length; i++) {
					let item = res.content[i]
					item.count = Math.abs(((item.officialPrice - item.lowestPriceSku.price)/10000).toFixed(2));
				}
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
	},
	headlerCancelSearch () {
		console.log(111)
		wx.navigateBack()
	}
})