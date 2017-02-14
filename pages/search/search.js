/* search.js*/
let app = getApp();
Page({
	data: {
		associateResults: [],
		searchResults: [],
		windowHeight: '',
		carModelsHeight: '',
		HTTPS_YMCAPI: ''
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
						associateResults: res
					})
				}
			})
		}else {
			that.setData({
				associateResults: []
			})
		}
		
		
//		if(val) {
//			for (var i = 0; i < that.data.newSearchResults.length; i++) {
//				let item = that.data.newSearchResults[i]
//				if(item.val.indexOf(val) != -1) {
//					searchResults.push(item);
//				}
//			}	
//		}
//		that.setData({
//			searchResults: searchResults
//		})
//		console.log(val,searchResults)
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