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
    // 下拉菜单筛选
    dropDownFilters: [],
    dropDownFiltersData: '',
		selectedFilterIndex: -1,
		selectedCarColorId: '-1',
		selectedCarColorName: '全部外观',
		selectedSourceRegionId: '-1',
		selectedSourceRegionName: '全部区域',
    // 横向滚动菜单筛选
    scrollFilters: [],
    scrollFiltersData: [],
    selectedScrollFilterIndex: -1,
    scrollFiltersSelectedIndexes: [],
    carSourcesBySkuInSpuList: [],
		logisticsList: [],
		cacheCarSourcesBySkuInSpuList: [],
    selectedSectionIndex: -1,
	},
	onLoad (options) {
		const that = this
    const carModelsInfo = JSON.parse(options.carModelsInfo)
		console.log(carModelsInfo)
    const HTTPS_YMCAPI = app.config.ymcServerHTTPSUrl
		try {
      const res = wx.getSystemInfoSync();
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
            const carSourcesItem = carSourcesBySkuInSpuItem.carSourcesList[j]
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
    const list = this.data.carSourcesBySkuInSpuList
    list[skuIndex].carSourcesList[carSourceIndex] = carSource
    this.setData({
      carSourcesBySkuInSpuList: list
    })
  },
  getIdWithFiltersIndex(index) {
    console.log(this.data.scrollFiltersSelectedIndexes)
    console.log(this.data.scrollFilters)
    const selectedIndex = this.data.scrollFiltersSelectedIndexes[index]
    if (selectedIndex === -1) {
      return '-1'
    } else {
      return this.data.scrollFilters[index].items[selectedIndex].id
    }
  },
  updateSearchResult(object) {
    const that = this
    console.log(object)
    let searchCarSkuList = that.data.cacheCarSourcesBySkuInSpuList;

    const selectedColor = object.color || this.data.selectedCarColorId
    const selectedSourceRegion = object.sourceRegion || this.data.selectedSourceRegionId
    const selectedSourcePublishDate = object.sourcePublishDate || this.getIdWithFiltersIndex(0)
    const selectedExpectedDeliveryDate = object.expectedDeliveryDate || this.getIdWithFiltersIndex(1)
    const selectedLogistics = object.logistics || this.getIdWithFiltersIndex(2)

    console.log("selected color:" + selectedColor)
    console.log("selected source region:" + selectedSourceRegion)
    console.log("selected source publish date:" + selectedSourcePublishDate)
    console.log("selected expected delivery date:" + selectedExpectedDeliveryDate)
    console.log("selected logistics:" + selectedLogistics)
    //
    // let newCarSkuList = [];
    // let carSourcesBySkuInSpuList = this.data.cacheCarSourcesBySkuInSpuList
    // // TODO: 处理剩余逻辑
    //
    // for (let i = 0; i < searchCarSkuList.length; i++) {
    //   let carSourcesBySkuInSpuItem = searchCarSkuList[i]
    //   // SKU 分区搜索
    //
    //   for (let j = 0; j < carSourcesBySkuInSpuItem.carSourcesList.length; j++) {
    //     // 具体每个SKU内部的筛选
    //
    //     let carSourcesItem = carSourcesBySkuInSpuItem.carSourcesList[j]
    //     if (carSourcesItem.logistics.length) {
    //       carSourcesItem.selectedLogistics = carSourcesItem.logistics[0]
    //       carSourcesItem.selectedLogisticsIndex = 0;
    //     } else {
    //       carSourcesItem.selectedLogistics = {};
    //       carSourcesItem.selectedLogisticsIndex = -1;
    //     }
    //   }
    //   carSourcesBySkuInSpuList.push(carSourcesBySkuInSpuItem)
    // }

    // FIXME: 老搜索逻辑
    // for (let i = 0; i < searchCarSkuList.length; i++) {
    // 	let item = searchCarSkuList[i]
    // 	if(selectExternal === item.externalColorId &&  selectInternal === '1') {
    // 		newCarSkuList.push(item)
    // 	} else if(selectInternal === item.internalColorId && selectExternal === '0') {
    // 		newCarSkuList.push(item)
    // 	} else if(selectExternal === item.externalColorId && selectInternal === item.internalColorId) {
    // 		newCarSkuList.push(item)
    // 	} else if(selectExternal === '0' && selectInternal === '1') {
    // 		newCarSkuList.push(item)
    // 	}
    // }

    // that.setData({
    //   carSourcesBySkuInSpuList: newCarSkuList
    // })
  },
  handlerAmendCarFacade(e) {
    const that = this;
    const selectedFilterIndex = e.currentTarget.dataset.selectedFilterIndex;
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
      const dropDownFiltersData = firstFilters.concat(that.data.dropDownFilters[selectedFilterIndex].items);
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
    const filterItem = e.currentTarget.dataset.filterItem;
    const that = this;
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
    const selectedCarColor = that.data.selectedCarColorId
    const selectedSourceRegion = that.data.selectedSourceRegionId

    that.updateSearchResult({color: selectedCarColor, sourceRegion: selectedSourceRegion})
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
    const that = this
    console.log(e)

    const scrollFilterIndex = e.currentTarget.dataset.scrollFilterIndex
    const scrollFilterItem = e.currentTarget.dataset.scrollFilterItem
    const filterIndex = e.currentTarget.dataset.filterIndex
    const filterItem = e.currentTarget.dataset.filterItem

    let selectedFilterId = filterItem.id
    const scrollFiltersSelectedIndexes = this.data.scrollFiltersSelectedIndexes
    const selectedFilterIndex = scrollFiltersSelectedIndexes[scrollFilterIndex]

      if (selectedFilterIndex === filterIndex) {
        scrollFiltersSelectedIndexes[scrollFilterIndex] = -1
        // 如果是点击已经选中的按钮， 则直接进入全部选择
        selectedFilterId = '-1'
      } else {
        scrollFiltersSelectedIndexes[scrollFilterIndex] = filterIndex
      }

    this.setData({
      scrollFiltersSelectedIndexes: scrollFiltersSelectedIndexes
    })

    if (scrollFilterIndex == 0) {
      // 车源发布时间
      that.updateSearchResult({sourcePublishDate: selectedFilterId})
    } else if (scrollFilterIndex == 1) {
      // 预计车辆到达时间
      that.updateSearchResult({expectedDeliveryDate: selectedFilterId})
    } else if (scrollFilterIndex == 2) {
      // 是否包邮
      that.updateSearchResult({logistics: selectedFilterId})
    }
  },
  /**
	 * 选择 SKU 分区
   * @param e
   */
  handlerSelectSku(e) {
    const index = e.currentTarget.dataset.skuIndex
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

    const skuIndex = e.currentTarget.dataset.skuIndex
    const carSourceIndex = e.currentTarget.dataset.carSourceIndex
    const carSource = e.currentTarget.dataset.carSource
    const logisticsIndex = e.currentTarget.dataset.logisticsIndex
    const logistics = e.currentTarget.dataset.logistics

		if (logisticsIndex !== carSource.selectedLogisticsIndex) {
      carSource.selectedLogisticsIndex = logisticsIndex
      carSource.selectedLogistics = logistics
      this.updateTheCarSource(skuIndex, carSourceIndex, carSource)

		} else {
			// 如果索引相同， 不作任何事情
		}
	},
  /**
	 * 关注一个供应商
   * @param e
   */
  handlerFollow(e) {
    const that = this

    console.log(e)
    const skuIndex = e.currentTarget.dataset.skuIndex
    const carSourceIndex = e.currentTarget.dataset.carSourceIndex
    const carSource = e.currentTarget.dataset.carSource
    const supplier = e.currentTarget.dataset.supplier

    this.requestFocusOrNotASupplier(supplier.id, !supplier.hasFocused,{
      success: function (res) {
        supplier.hasFocused = !supplier.hasFocused
        carSource.supplier = supplier
        that.updateTheCarSource(skuIndex, carSourceIndex, carSource)
      },
      fail: function() {

      },
      complete: function () {

      }
    })
	},
  /**
	 * 评价某一个供应商是否靠谱
   * @param e
   */
  handlerReliable(e) {
    const that = this;

    const skuIndex = e.currentTarget.dataset.skuIndex
    const carSourceIndex = e.currentTarget.dataset.carSourceIndex
    const carSource = e.currentTarget.dataset.carSource
    const supplier = e.currentTarget.dataset.supplier
    const spuId = this.data.carModelsInfo.carModelId

		this.requestReliableOrNotASupplier(spuId, carSource.id, supplier.id, !supplier.hasBeenReliable, {
			success: function (res) {
			  supplier.hasBeenReliable = !supplier.hasBeenReliable
        carSource.supplier = supplier
        that.updateTheCarSource(skuIndex, carSourceIndex, carSource)
			},
      fail: function() {

      },
      complete: function () {

      }
		})
  },
  /**
	 * 联系电话
   * @param e
   */
  handlerContact(e) {
    const carSource = e.currentTarget.dataset.carSource;
    const contact = carSource.supplier.contact;
    wx.makePhoneCall({
      phoneNumber: contact
    })
	},
	// 非编辑态下的订车按钮
  handlerBookCar(e) {
    const that = this

    const sku = e.currentTarget.dataset.skuItem
    // FIXME: 这里的 skuId 并不能确保获得
    const skuId = sku.skuId;

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
      const method = focusOrNot? 'POST': 'DELETE'
      app.modules.request({
        url: app.config.ucServerHTTPSUrl + 'cgi/user/' + app.userInfo().userId + '/focus',
        data: {
          type: 'supplier',
          targetId: supplierId
        },
        loadingType: 'none',
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
	requestReliableOrNotASupplier(spuId, carSourceId, supplierId, reliableOrNot, object) {
    this.requestAddOrRemoveTagnameForASupplier(spuId, carSourceId, '靠谱', supplierId, reliableOrNot, object);
	},
  /**
   * 打标签接口
   * @param spuId
   * @param carSourceId
   * @param tagName
   * @param supplierId
   * @param addOrRemove
   * @param object
   */
  requestAddOrRemoveTagnameForASupplier(spuId, carSourceId, tagName, supplierId, addOrRemove, object) {
    if (spuId && typeof spuId === 'string'
      && carSourceId && typeof carSourceId === 'string'
      && tagName && typeof tagName === 'string'
      && supplierId && typeof supplierId === 'string') {
      const method = addOrRemove ? 'POST' : 'DELETE'
      app.modules.request({
        url: app.config.ymcServerHTTPSUrl + 'product/car/spu/' + spuId + '/source/' + carSourceId + '/tag',
        data: {
          tagName: tagName,
          userId: app.userInfo().userId,
          supplierId: supplierId,
        },
        loadingType: 'none',
        method: method,
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