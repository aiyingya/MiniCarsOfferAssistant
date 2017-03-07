let app = getApp();
let util = require('../../utils/util.js')

Page({
	data: {
	  // 有无数据 init/data/none
    nodata: "init",
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
    dropDownSubFiltersData: '',
    // 选择哪一个数据筛选集合
		selectedFilterIndex: -1,
    selectedExternalCarColorIndex: -1,
		selectedExternalCarColorId: '-1',
		selectedExternalCarColorName: '全部',
    selectedInternalCarColorIndex: -1,
    selectedInternalCarColorId: '-1',
    selectedInternalCarColorName: '全部',
    // 横向滚动菜单筛选
    scrollFilters: [],
    scrollFiltersData: [],
    selectedScrollFilterIndex: -1,
    scrollFiltersSelectedIndexes: [],
    carSourcesBySkuInSpuList: [],
		logisticsList: [],
		cacheCarSourcesBySkuInSpuList: [],
    selectedSectionIndex: -1,
    app: app
	},
	onLoad (options) {
		const that = this

    const carModelsInfo = util.urlDecodeValueForKeyFromOptions('carModelsInfo', options);

    this.setData({
      carModelsInfo: carModelsInfo
    })
    const HTTPS_YMCAPI = app.config.ymcServerHTTPSUrl
		try {
      const res = wx.getSystemInfoSync();
      this.pixelRatio = res.pixelRatio;
      this.apHeight = 16;
      this.offsetTop = 80;
      this.setData({windowHeight: res.windowHeight + 'px'})
    } catch (e) {
      
    }

    console.log(app.globalData)

    const locationIds = app.globalData.location.map(function(a) {return a.locationId;});
    const locationIdsString = locationIds.join(',')

    app.modules.request({
			url: HTTPS_YMCAPI + 'product/car/spu/' + carModelsInfo.carModelId + '/sources',
			method: 'GET',
      data: {
			  userId: app.userInfo().userId,
        locationIds: locationIdsString
      },
			success: function(res) {
				console.log(res)
				let carSourcesBySkuInSpuList = []

				for (let i = 0; i < res.carSourcesBySkuInSpuList.length; i++) {
        	let carSourcesBySkuInSpuItem = res.carSourcesBySkuInSpuList[i]
					//item.count = Math.abs(((res.officialPrice - item.price)/10000).toFixed(2))
          const tagsCollection = []
          let priceFixedFlag = false
          let supplierSelfSupportFlag = false;

					for (let j = 0; j < carSourcesBySkuInSpuItem.carSourcesList.length ; j++) {
            const carSourcesItem = carSourcesBySkuInSpuItem.carSourcesList[j]
            // 默认选择第一个物流选项项
            that.selectLogistics(carSourcesItem, 0);
            if (carSourcesItem.priceFixed) {
              if (!priceFixedFlag) {
                tagsCollection.push("一口价")
                priceFixedFlag = true
              }
            }
            if (carSourcesItem.supplierSelfSupport) {
              if (!supplierSelfSupportFlag) {
                tagsCollection.push("垫资拿车")
                supplierSelfSupportFlag = true
              }
            }
					}

					carSourcesBySkuInSpuItem.carSku.viewModelTagCollection = tagsCollection.join(" ");
          carSourcesBySkuInSpuList.push(carSourcesBySkuInSpuItem)
				}

        let filters = res.filters
				let dropDownFilters = []
        let scrollFilters = []
        let scrollFiltersSelectedIndexes = []

        let sourcePublishDateFilterId
        for (let i = 0; i < filters.length; i++) {
				  let filter = filters[i]
          // FIXME: 这里的问题是使用了不严谨的方法获取数据
          if (i === 0) {
            dropDownFilters.push(filter)
          } else if (i == 1) {
				    // 车源发布信息， 默认为 24小时
            scrollFilters.push(filter)
            scrollFiltersSelectedIndexes.push(1)
            if (filter.items && filter.items.length) {
              sourcePublishDateFilterId = filter.items[1].id
            }
          } else {
				    scrollFilters.push(filter)
            scrollFiltersSelectedIndexes.push(-1)
          }
        }

				that.setData({
				  nodata: carSourcesBySkuInSpuList.length !== 0? 'data': 'none',
					cacheCarSourcesBySkuInSpuList: carSourcesBySkuInSpuList,
					filters: filters,
          dropDownFilters: dropDownFilters,
          scrollFilters: scrollFilters,
          scrollFiltersSelectedIndexes: scrollFiltersSelectedIndexes
				})

        that.updateSearchResult({sourcePublishDate: sourcePublishDateFilterId})
			}
		})

    /// 初始化自定义组件
    this.$wuxDialog = app.wux(this).$wuxDialog
    this.$wuxReliableDialog = app.wux(this).$wuxReliableDialog
    this.$wuxNormalDialog = app.wux(this).$wuxNormalDialog
	},
  onShow() {
    const that = this
    console.log("page show")
    const valueString = wx.getStorageSync('recent_contact')
    if (valueString && typeof valueString === 'string') {

      const value = JSON.parse(valueString)
      console.log(value)

      const spuId = value.spuId
      const carSource = value.carSource
      const supplier = carSource.supplier
      const skuIndex = value.skuIndex
      const carSourceIndex = value.carSourceIndex
      console.log("dsafda1")
      console.log(spuId)
      if (typeof value === 'object') {
        const now = new Date()
        const contactDate = new Date(value.dateString)
        if (now - contactDate < 60 * 60 * 1000 * 24) {
          // 24 小时以内， 弹框走起
          const hideDialog = this.$wuxReliableDialog.open({
            spuId: spuId,
            carSource: carSource,
            close: (updatedCarSource) => {
                console.log(updatedCarSource)
                if (updatedCarSource.hasBeenReliableByUser) {
                  that.requestReliableOrNotASupplier(spuId, carSource.id, updatedCarSource.supplier.id, updatedCarSource.hasBeenReliableByUser, {
                    success: function () {
                      carSource.hasBeenReliableByUser = updatedCarSource.hasBeenReliableByUser
                      that.updateTheCarSource(skuIndex, carSourceIndex, carSource)
                    },
                    fail: function () {
                    },
                    complete: function () {
                    }
                  })
                } else if (updatedCarSource.hasBeenUnReliableByUser) {
                  that.requestUnReliableOrNotASupplier(spuId, carSource.id, updatedCarSource.supplier.id, updatedCarSource.hasBeenUnReliableByUser, {
                    success: function () {
                      carSource.hasBeenUnReliableByUser = updatedCarSource.hasBeenUnReliableByUser
                      that.updateTheCarSource(skuIndex, carSourceIndex, carSource)
                    },
                    fail: function () {
                    },
                    complete: function () {
                    }
                  })
                }
            },
            follow: (updatedSupplier) => {
              // 关注与否
              console.log(supplier)
              console.log(updatedSupplier)
              console.log("111")
                this.requestFocusOrNotASupplier(updatedSupplier.id, updatedSupplier.hasFocused, {
                  success: function () {
                    carSource.supplier.hasFocused = updatedSupplier.hasFocused
                    that.updateTheCarSource(skuIndex, carSourceIndex, carSource)
                  },
                  fail: function () {
                  },
                  complete: function () {
                  }
                })
            }
          })
        } else {
          // 24 小时以外
        }

        try {
          wx.removeStorageSync('recent_contact')
        } catch (e) {
          wx.removeStorage({
            key: 'recent_contact',
            success: function (res) {
              // success
            },
            fail: function () {
              // fail
            },
            complete: function () {
              // complete
            }
          })
        }
      }
    }
  },
  /**
   * 该方法不会生成新的车源对象
   * @param carSourceItem
   * @param selectedLogisticsIndex
   * @return {*}
   */
  selectLogistics(carSourceItem, selectedLogisticsIndex) {
    if (carSourceItem.logistics && carSourceItem.logistics.length) {
      if (carSourceItem.logistics[selectedLogisticsIndex]) {
        carSourceItem.selectedLogistics = carSourceItem.logistics[selectedLogisticsIndex]
        carSourceItem.selectedLogisticsIndex = selectedLogisticsIndex
        carSourceItem.viewModelPrice = carSourceItem.price + carSourceItem.selectedLogistics.logisticsFee
        carSourceItem.viewModelPriceDesc = util.priceStringWithUnit(carSourceItem.viewModelPrice)
        carSourceItem.viewModelDiscount = util.downPrice(carSourceItem.viewModelPrice, this.data.carModelsInfo.officialPrice)
        carSourceItem.viewModelDiscountDesc = util.priceStringWithUnit(carSourceItem.viewModelDiscount)
        console.log(carSourceItem)
        return carSourceItem;
      }
    }
    carSourceItem.selectedLogistics = null;
    carSourceItem.selectedLogisticsIndex = -1;
    carSourceItem.viewModelPrice = carSourceItem.price;
    carSourceItem.viewModelPriceDesc = util.priceStringWithUnit(carSourceItem.viewModelPrice);
    carSourceItem.viewModelDiscount = util.downPrice(carSourceItem.viewModelPrice, this.data.carModelsInfo.officialPrice);
    carSourceItem.viewModelDiscountDesc = util.priceStringWithUnit(carSourceItem.viewModelDiscount);
    return carSourceItem
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
    const currentCarSource = list[skuIndex].carSourcesList[carSourceIndex]
    if (currentCarSource.id === carSource.id) {
      list[skuIndex].carSourcesList[carSourceIndex] = carSource
      this.setData({
        carSourcesBySkuInSpuList: list
      })
    } else {
      console.log("车源对象不符合， 不提供更新功能")
    }
  },
  /**
   * 更新 sku 分区数据
   * @param skuIndex
   */
  updateTheSkuSection(skuIndex) {
    const list = this.data.carSourcesBySkuInSpuList
    const section = this.data.carSourcesBySkuInSpuList[skuIndex]
    for (let i = 0; i < section.carSourcesList.length; i++) {
      const carSource = section.carSourcesList[i]
      const publishDate = util.dateCompatibility(carSource.publishDate)
      carSource.viewModelPublishDateDesc = util.dateDiff(publishDate)
    }

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
  /**
   * 页面数据主入口，由于该页面有筛选条件，所以页面的初始数据也必须走这个接口以保证初始的筛选条件无误
   * @param object
   */
  updateSearchResult(object) {
    const that = this

    const selectedExternalCarColorName = this.data.selectedExternalCarColorName
    const selectedInternalCarColorName = this.data.selectedInternalCarColorName
    const selectedSourcePublishDate = object.sourcePublishDate || this.getIdWithFiltersIndex(0)
    //const selectedExpectedDeliveryDays = object.expectedDeliveryDays || this.getIdWithFiltersIndex(2)
    const selectedLogistics = object.logistics || this.getIdWithFiltersIndex(1)

    console.log("selected color: ex:" + selectedExternalCarColorName + "in:" + selectedInternalCarColorName)
    console.log("selected source publish date:" + selectedSourcePublishDate)
    //console.log("selected expected delivery date:" + selectedExpectedDeliveryDays)
    console.log("selected logistics:" + selectedLogistics)

    const selectedSourcePublishDateFilter = function (filterId, carSource) {
      const now = new Date().getTime();
      const publishDate = util.dateCompatibility(carSource.publishDate)
      const diff = now - publishDate

      const minute = 1000 * 60
      const hour = minute * 60

      const _hour = diff/hour

      if (filterId === '-1') {
        return true
      } else if (filterId === '0') {
        return _hour <= 12
      } else if (filterId === '1') {
        return _hour <= 24
      } else if (filterId === '2') {
        return _hour > 24
      }
      return true;
    }

    const selectedLogisticsFilter = function (filterId, carSource) {
      if (filterId === '-1') {
        return true
      } else if (filterId === '0') {
        return carSource.logisticsFree
      }
      return true
    }

    const selectedColorFilter = function (externalColorName,
                                          internalColorName,
                                          carSourcesBySku) {
      if (externalColorName === '全部') {
        return true
      } else {
        if (externalColorName === carSourcesBySku.carSku.externalColorName) {
          if (internalColorName === '全部') {
            return true
          } else {
            if (internalColorName === carSourcesBySku.carSku.internalColorName) {
              return true
            } else {
              return false
            }
          }
        } else {
          return false
        }
      }
    }

    const carSourcesBySkuInSpuList = this.data.cacheCarSourcesBySkuInSpuList
    const newCarSourcesBySkuInSpuList = []
    for (let i = 0; i < carSourcesBySkuInSpuList.length; i++) {
      const carSourcesBySkuItem = carSourcesBySkuInSpuList[i]

      const newCarSourcesList = []
      for (let j = 0; j < carSourcesBySkuItem.carSourcesList.length; j++) {
        const carSourceItem = carSourcesBySkuItem.carSourcesList[j]
        if (selectedColorFilter(selectedExternalCarColorName, selectedInternalCarColorName, carSourcesBySkuItem)) {
          if (selectedLogisticsFilter(selectedLogistics, carSourceItem)
            && selectedSourcePublishDateFilter(selectedSourcePublishDate, carSourceItem)) {
            newCarSourcesList.push(carSourceItem)
          }
        }
      }

      if (newCarSourcesList.length) {
        // 如果有值
        const newCarSourcesBySkuItem = {}
        newCarSourcesBySkuItem.carSku = {}
        newCarSourcesBySkuItem.carSourcesList = newCarSourcesList
        newCarSourcesBySkuItem.carSku.externalColorId = carSourcesBySkuItem.carSku.externalColorId
        newCarSourcesBySkuItem.carSku.externalColorName = carSourcesBySkuItem.carSku.externalColorName
        newCarSourcesBySkuItem.carSku.internalColorId = carSourcesBySkuItem.carSku.internalColorId
        newCarSourcesBySkuItem.carSku.internalColorName = carSourcesBySkuItem.carSku.internalColorName
        newCarSourcesBySkuItem.carSku.skuId = carSourcesBySkuItem.carSku.skuId
        newCarSourcesBySkuInSpuList.push(newCarSourcesBySkuItem)
      } else {

      }
    }

    this.setData({
      carSourcesBySkuInSpuList: newCarSourcesBySkuInSpuList,
      // 重置选择
      selectedSectionIndex: -1,
    })
  },
  handlerAmendCarFacade(e) {
    const that = this;
    const selectedFilterIndex = e.currentTarget.dataset.selectedFilterIndex;
		if (selectedFilterIndex !== this.data.selectedFilterIndex) {
      // 父级
		  let firstFilters = []
      if (selectedFilterIndex == 0) {
        firstFilters.push({
          id: '-1',
          name: "全部"
        })
      }
      const dropDownFiltersData = firstFilters.concat(this.data.dropDownFilters[selectedFilterIndex].items);

      // 子级
      let subFirstFilters = []
      subFirstFilters.push({
        id: '-1',
        name: '全部'
      })

      let dropDownSubFiltersData;
      if (this.data.selectedExternalCarColorIndex != -1) {
        const filter = this.data.dropDownFilters[selectedFilterIndex].items[this.data.selectedExternalCarColorIndex]
        if (filter.items) {
          dropDownSubFiltersData = subFirstFilters.concat(filter.items)
        }
      } else {
        dropDownSubFiltersData = subFirstFilters
      }

      that.setData({
        showRmendCarFacade: true,
        selectedFilterIndex: selectedFilterIndex,
        dropDownFiltersData: dropDownFiltersData,
        dropDownSubFiltersData: dropDownSubFiltersData,
      })
		} else {
			this.setData({
				showRmendCarFacade: !this.data.showRmendCarFacade
			})
		}
	},
	headlerRemoveRmendCarFacade() {
    this.updateSearchResult({color: -1})
		this.setData({
			showRmendCarFacade: false
		})
	},
  /**
   * 搜索入口方法，收集所有的搜索条件，合并后得出结果
   * @param e
   */
  handlerSelectItem(e) {
    const filterItem = e.currentTarget.dataset.filterItem
    const superFilterItem = e.currentTarget.dataset.superFilterItem
    const filterIndex = e.currentTarget.dataset.filterIndex
    const filterPosition = e.currentTarget.dataset.filterPosition
    const superFilterPosition = e.currentTarget.dataset.superFilterPosition

    const that = this
    if (filterPosition === 'left') {

      // 子级
      let subFirstFilters = []
      subFirstFilters.push({
        id: '-1',
        name: '全部'
      })

      let dropDownSubFiltersData;
      console.log(filterItem)
      if (filterIndex != -1) {
        if (filterItem.items) {
          dropDownSubFiltersData = subFirstFilters.concat(filterItem.items)
        } else {
          dropDownSubFiltersData = subFirstFilters
        }
      } else {
        dropDownSubFiltersData = subFirstFilters
      }

      this.setData({
        selectedExternalCarColorIndex: filterIndex,
        selectedExternalCarColorId: filterItem.id,
        selectedExternalCarColorName: filterItem.name,
        selectedInternalCarColorIndex: '-1',
        selectedInternalCarColorId: '-1',
        selectedInternalCarColorName: '全部',
        dropDownSubFiltersData: dropDownSubFiltersData
      })
    } else if (filterPosition === 'right') {
      this.setData({
        selectedInternalCarColorIndex: filterIndex,
        selectedInternalCarColorId: filterItem.id,
        selectedInternalCarColorName: filterItem.name
      })

      that.headlerRemoveRmendCarFacade()
    }
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
      // 是否包邮
      that.updateSearchResult({logistics: selectedFilterId})
    }
    // FIXME: 被 larray 移除
    // } else if (scrollFilterIndex == 2) {
    //   that.updateSearchResult({expectedDeliveryDays: selectedFilterId})
      // 预计车辆到达时间
    // }
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
      this.updateTheSkuSection(index);
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
    let carSource = e.currentTarget.dataset.carSource
    const logisticsIndex = e.currentTarget.dataset.logisticsIndex
    const logistics = e.currentTarget.dataset.logistics

		if (logisticsIndex !== carSource.selectedLogisticsIndex) {
      carSource = this.selectLogistics(carSource, logisticsIndex);
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
   * 展示价格文案文案
   * @param e
   */
  handlerShowTips(e) {
    const carSource = e.currentTarget.dataset.carSource;

    let content = ''

    if (carSource.supplierSelfSupport && carSource.priceFixed) {
      content = '70多个品牌全网一口价、所见即所得。承诺无就赔、慢就赔，7天内到货'
    } else if (carSource.supplierSelfSupport && !carSource.priceFixed) {
      content = '加盟门店可享支付定金拿车，详情请电话联系'
    }

    if (content !== '') {
      const hideDialog = this.$wuxNormalDialog.open({
        title: content,
        content: '',
        showCancel: false,
        confirmText: '确定',
        confirm: (res) => {

        }
      })
    }
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

		this.requestReliableOrNotASupplier(spuId, carSource.id, supplier.id, !carSource.hasBeenReliableByUserByUser, {
			success: function (res) {
			  carSource.hasBeenReliableByUser = !carSource.hasBeenReliableByUser
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
    const carModelsInfo = this.data.carModelsInfo
    const skuIndex = e.currentTarget.dataset.skuIndex
    const carSourceIndex = e.currentTarget.dataset.carSourceIndex
    const carSource = e.currentTarget.dataset.carSource
    const supplier = carSource.supplier
    const contact = carSource.supplier.contact;

    wx.makePhoneCall({
      phoneNumber: contact,
      success: function(res) {
        if (!carSource.supplierSelfSupport) {
          // 非自营的供货商才可以评价靠谱与否
          const now = new Date()
          const value = {
            skuIndex: skuIndex,
            carSourceIndex: carSourceIndex,
            spuId: carModelsInfo.carModelId,
            carSource: carSource,
            dateString: now.toDateString()
          }
          wx.setStorageSync('recent_contact', JSON.stringify(value))
        }
      }
    })
	},
	// 非编辑态下的订车按钮
  handlerBookCar(e){
    const that = this

    const skuItem = e.currentTarget.dataset.skuItem
    const carSourceItem = e.currentTarget.dataset.carSource
    const skuId = skuItem.carSku.skuId;
    const contact = app.globalData.mobile

    const hideDialog = this.$wuxDialog.open({
      title: '发起定车后， 将会有工作人员与您联系',
      content: '',
      inputNumber: contact,
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
				that.requestBookCar([skuId], mobile, '',{
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
	  console.log("dsafda")
    this.requestAddOrRemoveTagnameForASupplier(spuId, carSourceId, '靠谱', supplierId, reliableOrNot, object);
	},
  requestUnReliableOrNotASupplier(spuId, carSourceId, supplierId, UnReliableOrNot, object) {
    this.requestAddOrRemoveTagnameForASupplier(spuId, carSourceId, '不靠谱', supplierId, UnReliableOrNot, object);
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