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
		cacheColor: '',
		selectColorId: '0',
		selectExternalColorId: '0',
		selectExternalColorName: '全部外观',
		selectInternalColorId: '1',
		selectInternalColorName: '全部内饰',
		carStatus: 'in_stock',
		carStatusName: '有货'
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
					filters: filters
				})
			}
		})

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
		for (var i = 0; i < searchCarSkuList.length; i++) {
			let item = searchCarSkuList[i]
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
		let that = this;
		let carStatus = that.data.carStatus;
		let stock, stockName;
		if(carStatus === 'in_stock') {
			stock = 'no_stock';
			stockName = '无货';
		}else {
			stock = 'in_stock';
			stockName = '有货'
		}
		that.setData({
			carStatus: stock,
			carStatusName: stockName
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
		let that = this
		wx.navigateTo({  
      url: '../quote/quotationCreate/quotationCreate?carInfo=' + JSON.stringify(that.data.QuoteCreateInfo)+'&carModelsInfo='+JSON.stringify(that.data.carModelsInfo)
    })
		that.headlerRemoveQuoteView()
	},
	// 非编辑态下的订车按钮
  handlerBookCar(e) {
    let that = this
		let skuid = [that.data.QuoteCreateInfo.skuId]
    const hideDialog = this.$wuxDialog.open({
      title: '发起订车后， 将会有工作人员与您联系',
      content: '',
      inputNumberPlaceholder: '输入您的手机号',
      confirmText: '发起订车',
      cancelText: '取消',
      validate: function (e) {
        let mobile = e.detail.value
        return mobile.length === 11
      },
      confirm: (res) => {
        let mobile = res.inputNumber
				// FIXME: 这里的 skuIds 需要提供
				that.requestBookCar(skuid, mobile, '',{
					success (res){
						wx.showModal({
							content: '提交成功，请保持通话畅通',
							success: function(res) {
								if (res.confirm) {
									that.headlerRemoveQuoteView()
								}
							}
						})
					},
					fail (err) {
						wx.showModal({
							title: '错误',
							content: err.alertMessage,
							success: function(res) {
								if (res.confirm) {
									console.log('用户点击确定')
								}
							}
						})
					},
					complete () {

					}
				})
      },
      cancel: () => {
        // TODO: 取消
      }
    })
  },
  /**
   * 发起订车行为
   *
   * @param skuIds					[String]
   * @param quotationId     可选
   * @param customerMobile  可选
   * @param object
   */
  requestBookCar(skuIds, customerMobile, quotationId, object) {
    if (skuIds && typeof skuIds === 'object' && customerMobile && customerMobile !== '') {
      app.modules.request({
        url: app.config.ymcServerHTTPSUrl + 'sale/quotation/order',
        data: {
					skuIds: skuIds,
          mobile: customerMobile,
          quotationId: quotationId
        },
        method: 'POST',
        success: object.success,
        fail: object.fail,
        complete: object.complete
      })
    } else {
      object.fail()
      object.complete()
    }
  }
	
})
