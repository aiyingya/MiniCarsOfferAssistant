let app = getApp();
Page({
	data: {
		// 全局视图
    windowHeight: '',
		// 头部 SPU 信息视图
		imgAliyuncsUrl: app.config.imgAliyuncsUrl,
		carModelsInfo: '',
		// 筛选下拉视图
		showRmendCarFacade:'',
    filters: [],
    dropDownFilters: [],
    dropDownFiltersData: '',
    scrollFilters: [],
    scrollFiltersSelectedIndexes: [],
		selectedFilterIndex: -1,
		selectedCarColorId: '-1',
		selectedCarColorName: '全部外观',
		selectedSourceRegionId: '-1',
		selectedSourceRegionName: '全部区域',
		// 列表视图
    carSourcesBySkuInSpuList: [],
		logisticsList: [],
		cacheCarSourcesBySkuInSpuList: [],
    selectedSectionIndex: -1,
	},
	onLoad (options) {
		let that = this
		let carModelsInfo = JSON.parse(options.carModelsInfo)
		console.log(carModelsInfo)
		let HTTPS_YMCAPI = app.config.ymcServerHTTPSUrl
		try {
      let res = wx.getSystemInfoSync();
      this.pixelRatio = res.pixelRatio;
      this.apHeight = 16;
      this.offsetTop = 80;
      this.setData({windowHeight: res.windowHeight + 'px'})
    } catch (e) {
      
    }
		app.modules.request({
			url: HTTPS_YMCAPI + 'product/car/spu/' + carModelsInfo.carModelId + '/sources',
			method: 'GET',
			success: function(res) {
				console.log(res)
				let carSourcesBySkuInSpuList = []

				for (let i = 0; i < res.carSourcesBySkuInSpuList.length; i++) {
        	let carSourcesBySkuInSpuItem = res.carSourcesBySkuInSpuList[i]
					//item.count = Math.abs(((res.officialPrice - item.price)/10000).toFixed(2))
					for (let j = 0; j < carSourcesBySkuInSpuItem.carSourcesList.length ; j++) {
						let carSourcesItem = carSourcesBySkuInSpuItem.carSourcesList[j]
						if (carSourcesItem.logistics.length) {
              carSourcesItem.selectedLogistics = carSourcesItem.logistics[0]
							carSourcesItem.selectedLogisticsIndex = 0
            } else {
							carSourcesItem.selectedLogistics = {}
							carSourcesItem.selectedLogisticsIndex = -1
						}
					}
          carSourcesBySkuInSpuList.push(carSourcesBySkuInSpuItem)
				}

        let filters = res.filters
				let dropDownFilters = []
        let scrollFilters = []
        let scrollFiltersSelectedIndexes = []
        for (let i = 0; i < filters.length; i++) {
				  let filter = filters[i]
          if (i === 0 || i ===1 ) {
            dropDownFilters.push(filter)
          } else {
				    scrollFilters.push(filter)
            scrollFiltersSelectedIndexes.push(-1)
          }
        }

        console.log(scrollFilters)
				
				that.setData({
					carModelsInfo: carModelsInfo,
          carSourcesBySkuInSpuList: carSourcesBySkuInSpuList,
					cacheCarSourcesBySkuInSpuList: carSourcesBySkuInSpuList,
					filters: filters,
          dropDownFilters: dropDownFilters,
          scrollFilters: scrollFilters,
          scrollFiltersSelectedIndexes: scrollFiltersSelectedIndexes
				})
			}
		})

    /// 初始化自定义组件
    this.$wuxDialog = app.wux(this).$wuxDialog
	},
  /**
   * 由于更新一个二维数组中的 carSource 对象暂时没有更好的办法，所以只能通过全量
   * 更新 this.data 中的二维数组才能达到目的
   *
   * @param skuIndex        sku 列表索引
   * @param carSourceIndex  车源列表索引
   * @param carSource       车源实体
   */
  updateTheCarSource(skuIndex, carSourceIndex, carSource) {
    let list = this.data.carSourcesBySkuInSpuList
    list[skuIndex].carSourcesList[carSourceIndex] = carSource
    this.setData({
      carSourcesBySkuInSpuList: list
    })
  },
	handlerAmendCarFacade(e) {
		let that = this;
    let selectedFilterIndex = e.currentTarget.dataset.selectedFilterIndex;
		if (selectedFilterIndex !== this.data.selectedFilterIndex) {
      let firstFilters = []
      if (selectedFilterIndex == 0) {
        firstFilters.push({
          id: '-1',
          name: "全部外观"
        })
      } else if (selectedFilterIndex == 1) {
        firstFilters.push({
          id: '-1',
          name: "全部区域"
        })
      }
      console.log(firstFilters)
      let dropDownFiltersData = firstFilters.concat(that.data.dropDownFilters[selectedFilterIndex].items);
      that.setData({
        showRmendCarFacade: true,
        selectedFilterIndex: selectedFilterIndex,
        dropDownFiltersData: dropDownFiltersData
      })
		} else {
			this.setData({
				showRmendCarFacade: !this.data.showRmendCarFacade
			})
		}
	},
	headlerRemoveRmendCarFacade() {
		this.setData({
			showRmendCarFacade: false
		})
	},
  /**
   * 搜索入口方法，收集所有的搜索条件，合并后得出结果
   * @param e
   */
  handlerSelectItem(e) {
		let filterItem = e.currentTarget.dataset.filterItem;
		let that = this;
		let newCarSkuList = [];
		let searchCarSkuList = that.data.cacheCarSourcesBySkuInSpuList;
		if(that.data.selectedFilterIndex === '0') {
      // 选择外观的筛选框
			that.setData({
        selectedCarColorId: filterItem.id,
        selectedCarColorName: filterItem.name
			})
		} else if (that.data.selectedFilterIndex === '1') {
			// 选择区域的筛选框
			that.setData({
        selectedSourceRegionId: filterItem.id,
        selectedSourceRegionName: filterItem.name
			})
		} else {
			// 其他
		}
		let selectedCarColor = that.data.selectedCarColorId;
		let selectedSourceRegion = that.data.selectedSourceRegionId;

    for (let i = 0; i < searchCarSkuList.length; i++) {
      let carSourcesBySkuInSpuItem = searchCarSkuList[i]
			// SKU 分区搜索

      for (let j = 0; j < carSourcesBySkuInSpuItem.carSourcesList.length; j++) {
      	// 具体每个SKU内部的筛选

        let carSourcesItem = carSourcesBySkuInSpuItem.carSourcesList[j]
        if (carSourcesItem.logistics.length) {
          carSourcesItem.selectedLogistics = carSourcesItem.logistics[0]
					carSourcesItem.selectedLogisticsIndex = 0;
        } else {
          carSourcesItem.selectedLogistics = {};
          carSourcesItem.selectedLogisticsIndex = -1;
        }
      }
      carSourcesBySkuInSpuList.push(carSourcesBySkuInSpuItem)
    }

		// for (var i = 0; i < searchCarSkuList.length; i++) {
		// 	let item =
		// 	let item = searchCarSkuList[i]
		// 	if(selectExternal === item.externalColorId &&  selectInternal === '1') {
		// 		newCarSkuList.push(item)
		// 	}else if(selectInternal === item.internalColorId && selectExternal === '0') {
		// 		newCarSkuList.push(item)
		// 	}else if(selectExternal === item.externalColorId && selectInternal === item.internalColorId) {
		// 		newCarSkuList.push(item)
		// 	}else if(selectExternal === '0' && selectInternal === '1') {
		// 		newCarSkuList.push(item)
		// 	}
		// }

		that.setData({
      carSourcesBySkuInSpuList: newCarSkuList
		})
		that.headlerRemoveRmendCarFacade()
	},
	handlerMakePhoneCall() {
		let phone = '021-52559255,8902'
		wx.makePhoneCall({
			phoneNumber: phone
		})
	},
  /**
   * 横向滚动栏筛选项目点击行为
   * @param e
   */
  handlerFilterSelected(e) {
    let scrollFilterIndex = e.currentTarget.dataset.scrollFilterIndex
    let scrollFilterItem = e.currentTarget.dataset.scrollFilterItem
    let filterIndex = e.currentTarget.dataset.filterIndex
    let filterItem = e.currentTarget.dataset.filterItem

    let scrollFiltersSelectedIndexes = this.data.scrollFiltersSelectedIndexes
    let selectedFilterIndex = scrollFiltersSelectedIndexes[scrollFilterIndex]
    if (selectedFilterIndex === filterIndex) {
      scrollFiltersSelectedIndexes[scrollFilterIndex] = -1
    } else {
      scrollFiltersSelectedIndexes[scrollFilterIndex] = filterIndex
    }

    this.setData({
      scrollFiltersSelectedIndexes: scrollFiltersSelectedIndexes
    })
    // TODO 搜索子集
  },
  /**
	 * 选择 SKU 分区
   * @param e
   */
  handlerSelectSku(e) {
		let index = e.currentTarget.dataset.skuIndex
		if (index === this.data.selectedSectionIndex) {
			this.setData({
        selectedSectionIndex: -1
			})
		} else {
      this.setData({
        selectedSectionIndex: index
      })
    }
	},
  /**
	 * 选择不同的物流终点
   * @param e
   */
  handlerSelectLogisticsBlock(e) {
		// 选择物流行为

		let skuIndex = e.currentTarget.dataset.skuIndex
		let carSourceIndex = e.currentTarget.dataset.carSourceIndex
    let carSource = e.currentTarget.dataset.carSource
		let logisticsIndex = e.currentTarget.dataset.logisticsIndex
		let logistics = e.currentTarget.dataset.logistics

		if (logisticsIndex !== carSource.selectedLogisticsIndex) {
      carSource.selectedLogisticsIndex = logisticsIndex
      carSource.selectedLogistics = logistics
      this.updateTheCarSource(skuIndex, carSourceIndex, carsource)

		} else {
			// 如果索引相同， 不作任何事情
		}
	},
  /**
	 * 关注一个供应商
   * @param e
   */
  handlerFollow(e) {
    let that = this

    let skuIndex = e.currentTarget.dataset.skuIndex
    let carSourceIndex = e.currentTarget.dataset.carSourceIndex
    let carSource = e.currentTarget.dataset.carSource
		let supplier = e.currentTarget.dataset.supplier

    this.requestFocusOrNotASupplier(supplier.supplierId, supplier.hasFocused,{
      success (res) {
        supplier.hasFocused = !supplier.hasFocused
        carSource.supplier = supplier
        that.updateTheCarSource(skuIndex, carSourceIndex, carSource)
      }
    })
	},
  /**
	 * 评价某一个供应商是否靠谱
   * @param e
   */
  handlerReliable(e) {
    let that = this;

    let skuIndex = e.currentTarget.dataset.skuIndex
    let carSourceIndex = e.currentTarget.dataset.carSourceIndex
    let carSource = e.currentTarget.dataset.carSource
    let supplier = e.currentTarget.dataset.supplier

		this.requestReliableOrNoteASupplier(supplier.supplierId, {
			success (res) {
			  supplier.hasBeenReliable = true
        carSource.supplier = supplier
        that.updateTheCarSource(skuIndex, carSourceIndex, carSource)
			}
		})
  },
  /**
	 * 联系电话
   * @param e
   */
  handlerContact(e) {
		let carSource = e.currentTarget.dataset.carSource;
		let contact = carSource.supplier.contact;
    wx.makePhoneCall({
      phoneNumber: contact
    })
	},
	// 非编辑态下的订车按钮
  handlerBookCar(e) {
    let that = this

    let sku = e.currentTarget.dataset.skuItem
    // FIXME: 这里的 skuId 并不能确保获得
    let skuId = sku.skuId;

    const hideDialog = this.$wuxDialog.open({
      title: '发起定车后， 将会有工作人员与您联系',
      content: '',
      inputNumberPlaceholder: '输入您的手机号',
      confirmText: '发起定车',
      cancelText: '取消',
      validate: function (e) {
        let mobile = e.detail.value
        return mobile.length === 11
      },
      confirm: (res) => {
        let mobile = res.inputNumber
				// FIXME: 这里的 skuIds 需要提供
				that.requestBookCar(skuId, mobile, '',{
					success (res){
						wx.showModal({
							title: '提示',
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
							title: '提示',
							content: err.alertMessage,
							success: function(res) {
								if (res.confirm) {
									that.headlerRemoveQuoteView()
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
  },
  /**
   * 对某一个供应商关注/取消操作
   * @param supplierId
   * @param object
   */
  requestFocusOrNotASupplier(supplierId, focusOrNot, object) {
    if (supplierId && typeof supplierId === 'string') {
      let method = focusOrNot? 'DELETE': 'POST'
      app.modules.request({
        url: app.config.ucServerHTTPSUrl + 'cgi/user/' + app.userinfo.userId + '/focus',
        data: {
          type: 'supplier',
          targetId: supplierId
        },
        method: method,
        success: object.success,
        fail: object.fail,
        complete: object.complete
      })
    } else {
      object.fail()
      object.complete()
    }
  },
  /**
	 * 对某一个供应商的某一个货源做靠谱操作
   * @param supplierId
   * @param object
   */
	requestReliableOrNoteASupplier(supplierId, object) {
    if (supplierId && typeof supplierId === 'string') {
      app.modules.request({
        url: app.config.ucServerHTTPSUrl + 'cgi/user/' + app.userinfo.userId + '/focus',
        data: {
          type: 'supplier',
          targetId: supplierId
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