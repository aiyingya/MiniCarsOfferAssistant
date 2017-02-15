let app = getApp();
Page({
	data: {
		imgAliyuncsUrl: app.config.imgAliyuncsUrl,
		carModelsInfo: '',
		quotation: '',
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
		cacheColor: '',
		selectColorId: '0',
		selectExternalColorId: '0',
		selectExternalColorName: '全部外观',
		selectInternalColorId: '1',
		selectInternalColorName: '全部内饰',
		carStatus: 'all',
		carStatusAll: 'all',
		carStatusName: '全部',
		carSKUInfo: ''
	},
	onLoad (options) {
		let that = this

		let HTTPS_YMCAPI = app.config.ymcServerHTTPSUrl
    try {
      let res = wx.getSystemInfoSync()
      this.pixelRatio = res.pixelRatio
      this.apHeight = 16
      this.offsetTop = 80
      this.setData({windowHeight: res.windowHeight + 'px'})
    } catch (e) {

    }

		if (options.quotation) {
      let quotation = JSON.parse(options.quotation)

			// 从报价单详情页面过来
      app.modules.request({
        url: HTTPS_YMCAPI + 'product/car/sku',
        method: 'GET',
				data: {
					carSkuId: quotation.quotationItems[0].itemNumber
				},
        success: function(res) {
          let filters = res.filters
          let carSkuList = []
					let carSKUInfo
          for (var i = 0; i < res.carSkuList.length; i++) {
          	let item = res.carSkuList[i]
            item.count = Math.abs(((res.officialPrice - item.price)/10000).toFixed(2))
            carSkuList.push(item)

						if (item.skuId === quotation.quotationItems[0].itemNumber) {
          		// 临时设置 lowestPriceSku 字段
          		carSKUInfo = item
							res.lowestPriceSku = carSKUInfo
						}
          }

          that.setData({
          	quotation: quotation,
						carModelsInfo: res,
            carSkuList: carSkuList,
            cacheCarSkuList: carSkuList,
            filters: filters,
						carSKUInfo: carSKUInfo
          })
        }
      })
		} else if (options.carModelsInfo && options.carSKUInfo) {
			// 从车源或者车系页面过来
      let carModelsInfo = JSON.parse(options.carModelsInfo)
      let carSKUInfo = JSON.parse(options.carSKUInfo)

      app.modules.request({
        url: HTTPS_YMCAPI + 'product/car/sku',
        method: 'GET',
        data: {
          carSpuId: carModelsInfo.carModelId
        },
        success: function(res) {
          let filters = res.filters
          let carSkuList = []

          for (var i = 0; i < res.carSkuList.length; i++) {
            let item = res.carSkuList[i]
            item.count = Math.abs(((res.officialPrice - item.price)/10000).toFixed(2))
            carSkuList.push(item)
          }

          that.setData({
            carModelsInfo: carModelsInfo,
            carSkuList: carSkuList,
            cacheCarSkuList: carSkuList,
            filters: filters,
            carSKUInfo: carSKUInfo
          })
        }
      })
		}

    /// 初始化自定义组件
    this.$wuxDialog = app.wux(this).$wuxDialog
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
		if(that.data.selectColorId === '0') {
			that.setData({
				selectExternalColorId: color.id,
				selectExternalColorName: color.name
			})
		}else {
			that.setData({
				selectInternalColorId: color.id,
				selectInternalColorName: color.name
			})
		}
		let selectExternal = that.data.selectExternalColorId;
		let selectInternal = that.data.selectInternalColorId;
		let carStatus = that.data.carStatus;
		for(let item of searchCarSkuList) {
			if(selectExternal === item.externalColorId &&  selectInternal === '1') {
				newCarSkuList.push(item)
			}else if(selectInternal === item.internalColorId && selectExternal === '0') {
				newCarSkuList.push(item)
			}else if(selectExternal === item.externalColorId && selectInternal === item.internalColorId) {
				newCarSkuList.push(item)
			}else if(selectExternal === '0' && selectInternal === '1') {
				newCarSkuList.push(item)
			}
		}	
		that.setData({
			carSkuList: newCarSkuList
		})
		that.headlerRemoveRmendCarFacade()
	},
	handlerSwitchCarStatus() {
		let that = this
		let carStatus = that.data.carStatus;
		let stock, stockName, carStatusAll
		if(carStatus === 'all') {
			stock = 'in_stock'
			stockName = '有货'
			carStatusAll = 'no_stock'
		}else {
			stock = 'all'
			stockName = '全部'
			carStatusAll = 'all'
		}
		that.setData({
			carStatus: stock,
			carStatusName: stockName,
			carStatusAll: carStatusAll
		})
	},
	handlerChangeCarColor (e) {
		let carsInfo = e.currentTarget.dataset.quoteinfo
		
		wx.setStorage({
			key:"changeCarsColorSTUInfo",
			data: carsInfo
		})
		wx.navigateBack()
	}
})
