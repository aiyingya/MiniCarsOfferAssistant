let app = getApp()
let util = require('../../utils/util')

Page({
	data: {
		carModelsList: [],
		cacheCarModelsList: [],
		windowHeight: '',
		windowWidth: '',
		showRmendCarFacade: false,
		filtersData: [],
		CarsModeleText: '全部车款',
		CarsModeleSelectId: 0,
		showCharts: true, // 是否展示charts图表，解决弹出层无法点击问题
    HTTPS_YMCAPI: app.config.tradeServerHTTPSUrl,
    showNodata: false
	},
	onLoad (options) {
		let carsInfo = util.urlDecodeValueForKeyFromOptions('carsInfo', options)
		let HTTPS_YMCAPI =this.data.HTTPS_YMCAPI
		let that = this
		try {
      let res = wx.getSystemInfoSync()
      this.pixelRatio = res.pixelRatio
      this.apHeight = 16
      this.offsetTop = 80
			this.windowWidth = res.windowWidth - 30
      this.setData({windowHeight: (res.windowHeight-44) + 'px'})
    } catch (e) {
      
    }
		this.$wuxToast = app.wux(this).$wuxToast
		if (carsInfo) {
      console.log(carsInfo)
			// 设置NavigationBarTitle.
			wx.setNavigationBarTitle({
				title: carsInfo.name
			})
			app.modules.request({
				url: app.config.ymcServerHTTPSUrl + 'supply/car/spu',
				method: 'GET',
				data: {
					carSeriesId: carsInfo.id
				},
				success: function(res) {
          if(res) {
            let carModelsList = res.content
            let filters = res.filters
            let filtersData 
            let showNodata = false
            that.drawCanvas(carModelsList)
						for(let item of filters) {
							filtersData = item.items
						}
						if(carModelsList.length === 0) {
						  showNodata = true
						}
						that.setData({
							carModelsList: carModelsList,
							cacheCarModelsList: carModelsList,
							filtersData: filtersData,
              showNodata: showNodata
						})
          }
				}
			})
		}
	},
	onShow () {
		
	},
	handleCheckCarsModele() {
		let weitch = this.data.showRmendCarFacade
		let carModelsList = this.data.carModelsList
		if(weitch) {
			this.drawCanvas(carModelsList)
			this.setData({
				showRmendCarFacade: false,
				showCharts: true
			})
		}else {
			this.setData({
				showRmendCarFacade: true,
				showCharts: false
			})
		}
	},
	handleSelectCarsModele(e) {
		let selectItem = e.currentTarget.dataset.select
		let selectId = e.currentTarget.dataset.id
		let carModelsList = this.data.cacheCarModelsList
		let newModelsList = []
		if(selectItem.name === '全部') {
			newModelsList = carModelsList
		}else {
			for(let item of carModelsList) {
				if(item.yearStyle === selectItem.name) {
					
					newModelsList.push(item)
				}
			}
		}
		this.drawCanvas(newModelsList)
		this.setData({
			CarsModeleText: selectItem.name,
			CarsModeleSelectId: selectId,
			carModelsList: newModelsList,
			showRmendCarFacade: false,
			showCharts: true
		})
	},
	handlerToCarSources (e) {
		let item = e.currentTarget.dataset.carmodelsinfo
		let carModelsInfoKeyValueString = util.urlEncodeValueForKey('carModelsInfo', item)
		let status = item.supply.status
		let that = this
    let carModelsList = this.data.carModelsList
    
		if(status === '暂无供货') {
      this.setData({
        showCharts: false
      })
			this.$wuxToast.show({
				type: false,
        timer: 2000,
        color: '#fff',
        text: '暂无供货'
			})
      setTimeout(function() {
        that.drawCanvas(carModelsList)
        that.setData({
          showCharts: true
        })
      },2000)
			return
		}
		wx.navigateTo({
      url: '../carSources/carSources?' + carModelsInfoKeyValueString
    }) 
	},
	handlerPromptly (e) {

		let carModelsInfoKeyValueString =  util.urlEncodeValueForKey('carModelsInfo', e.currentTarget.dataset.carmodelsinfo)
		
		wx.navigateTo({  
      url: '../quote/quotationCreate/quotationCreate?' + carModelsInfoKeyValueString
    }) 
	},
	headlerRemoveRmendCarFacade() {
		let carModelsList = this.data.carModelsList
		this.drawCanvas(carModelsList)
		this.setData({
			showRmendCarFacade: false,
			showCharts: true
		})
	},
	drawCanvas(list) {
		if (!list) {return}
		let data = list
		let that = this
		try {
      let res = wx.getSystemInfoSync()
      that.pixelRatio = res.pixelRatio
      that.apHeight = 16
      that.offsetTop = 80
			that.windowWidth = res.windowWidth
    } catch (e) {
      
    }
		for (let item of data) {
			if(item.supply.supplierCount > 0) {
				new app.wxcharts({
					canvasId: item.carModelId,
					type: 'column',
					categories: item.supply.chart.x,
					animation: false,
					color: '#ECF0F7',
					legend: false,
					background: '#ECF0F7',
					series: [{
            name: '1',
            data: item.supply.chart.y,
            color: '#d2e1f6'
          }],
					xAxis: {
            disableGrid: true,
            fontColor: '#333333',
            gridColor: '#333333',
            unitText: '（万）'
          },
          yAxis: {
            disabled: true,
            fontColor: '#333333',
            gridColor: '#333333',
            min: 10,
            max: 50,
            unitText: '（个）',
            format(val) {
              return val.toFixed(0)
            }
          },
          dataItem: {
            color: '#ECF0F7'
          },
          width: that.windowWidth,
          height: 120,
          dataLabel: true,
          dataPointShape: false,
          extra: {
            area: ['风险','适宜2.43~3.73','偏贵'],
            hint: item.supply.chart.hint,
            ratio: '0.4',
            index: item.supply.chart.priceIndex 
          }
				})
			}
		}
	}
	
})