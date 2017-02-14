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
		widthToChange: ''
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
	headlerSearchInput(e) {
		let val = e.detail.value;
		let that = this;
		let searchResults = [];
		if(val) {
			app.modules.request({
				url: that.data.HTTPS_YMCAPI + 'search/car/index', 
				method: 'GET',
				data: {
					text: val
				},
				success: function(res) {
					console.log(res)
					that.setData({
						associateResults: res,
						searchResults: []
					})
				}
			})
		}else {
			that.setData({
				associateResults: [],
				searchResults: []
			})
		}
		that.setData({
			widthToChange: 'widthToChange'
		})
	},
	handlerChooseResults (e) {
		let that = this
		let results = e.currentTarget.dataset.results
		
		app.modules.request({
			url: that.data.HTTPS_YMCAPI + 'product/car/spu', 
			method: 'GET',
			data: {
				carSeriesId: results.id
			},
			success: function(res) {
				let carModelsList = res;
				if(carModelsList) {

					for (var i = 0; i < carModelsList.length; i++) {
						let item = carModelsList[i]
						item.count = Math.abs(((item.officialPrice - item.lowestPriceSku.price)/10000).toFixed(2));
					}

					console.log(carModelsList)
					that.setData({
						searchResults: carModelsList,
						associateResults: [],
						searchValue: results.content
					})
				}
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