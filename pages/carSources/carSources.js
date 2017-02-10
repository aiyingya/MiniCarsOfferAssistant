let app = getApp();
Page({
	data: {
		imgAliyuncsUrl: app.config.imgAliyuncsUrl,
		carModelsInfo: '',
		windowHeight: '',
		showRmendCarFacade:'',
		showQuoteView: '',
		carSkuList: [],
		QuoteCreateInfo: ''
	},
	onLoad (options) {
		let that = this;
		let carModelsInfo = JSON.parse(options.carModelsInfo);
		let HTTPS_YMCAPI = app.config.ymcServerHTTPSUrl;
		try {
      var res = wx.getSystemInfoSync();
      this.pixelRatio = res.pixelRatio;
      this.apHeight = 16;
      this.offsetTop = 80;
      this.setData({windowHeight: res.windowHeight + 'px'})
    } catch (e) {
      
    }
		app.modules.request({
			url: HTTPS_YMCAPI + 'product/car/sku', 
			method: 'GET',
			data: {
				carSpuId: carModelsInfo.carModelId
			},
			success: function(res) {
				let carSkuList = res.data.data.carSkuList;
				that.setData({
					carModelsInfo: carModelsInfo,
					carSkuList: carSkuList
				})
			}
		})
	},
	handlerAmendCarFacade(e) {
		let that = this;
		that.setData({
			showRmendCarFacade: true
		})
	},
	headlerRemoveRmendCarFacade() {
		this.setData({
			showRmendCarFacade: false
		})
	},
	handlerShowQuoteView(e) {
		let quoteinfo = e.currentTarget.dataset.quoteinfo;		
		this.setData({
			showQuoteView: true,
			QuoteCreateInfo: quoteinfo
		})
	},
	headlerRemoveQuoteView() {
		this.setData({
			showQuoteView: false
		})
	},
	handlerMakePhoneCall() {
		let phone = '021-52559255,8902'
		wx.makePhoneCall({
			phoneNumber: phone
		})
	},
	handlerQuoteCreate(e) {
		let that = this;
		wx.navigateTo({  
      url: '../quote/quotationCreate/quotationCreate?carInfo=' + JSON.stringify(that.data.QuoteCreateInfo)
    })
	}
})