let app = getApp();
Page({
	data: {
		imgAliyuncsUrl: app.config.imgAliyuncsUrl,
		carModelsInfo: '',
		windowHeight: '',
		showRmendCarFacade:'',
		showQuoteView: '',
		carSkuList: [],
		cacheCarSkuList: [],
		QuoteCreateInfo: '',
		externalColor: [],
		internalColor: [],
		filters: [],
		filtersData: '',
		selectColorId: '0',
		selectExternalColorId: '0',
		selectExternalColorName: '全部外观',
		selectInternalColorId: '1',
		selectInternalColorName: '全部内饰'
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
				let filters = res.data.data.filters;
				let carSkuList = res.data.data.carSkuList;
				that.setData({
					carModelsInfo: carModelsInfo,
					carSkuList: carSkuList,
					cacheCarSkuList: carSkuList,
					filters: filters
				})
			}
		})
	},
	handlerAmendCarFacade(e) {
		let that = this;
		let type = e.currentTarget.dataset.type;
		let firstFilters = [{
			id: type,
			name: that.data.filters[type].name
		}];
		let filtersData = firstFilters.concat(that.data.filters[type].items);
		that.setData({
			showRmendCarFacade: true,
			selectColorId: type,
			filtersData: filtersData
		})
	},
	headlerRemoveRmendCarFacade() {
		this.setData({
			showRmendCarFacade: false
		})
	},
	headlerSelectColor(e) {
		let color = e.currentTarget.dataset.color;
		let that = this;
		let newCarSkuList = [];
		let searchCarSkuList = that.data.cacheCarSkuList;
		if(that.data.selectExternalColorId !== '0'  && that.data.selectInternalColorId !== '1') {
			searchCarSkuList = that.data.carSkuList;
		}
		console.log(searchCarSkuList, that.data.selectInternalColorId, that.data.selectExternalColorId)
		if(that.data.selectColorId === '0') {
			that.setData({
				selectExternalColorId: color.id,
				selectExternalColorName: color.name
			})
			for(let item of searchCarSkuList) {
				if(that.data.selectExternalColorId === item.externalColorId ) {
					newCarSkuList.push(item);
				}else if(that.data.selectExternalColorId === that.data.selectColorId) {
					newCarSkuList.push(item);
				}
			}
			that.setData({
				carSkuList: newCarSkuList
			})
		}else {
			that.setData({
				selectInternalColorId: color.id,
				selectInternalColorName: color.name
			})
			for(let item of searchCarSkuList) {
				if(that.data.selectInternalColorId === item.internalColorId ) {
					newCarSkuList.push(item);
				}else if(that.data.selectInternalColorId === that.data.selectColorId) {
					newCarSkuList.push(item);
				}
			}
			
			that.setData({
				carSkuList: newCarSkuList
			})
		}
		
		this.setData({
			carSkuList: newCarSkuList
		})
		that.headlerRemoveRmendCarFacade();
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