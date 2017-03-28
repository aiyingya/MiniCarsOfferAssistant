let app = getApp()
let util = require('../../utils/util')
var columnCharts = null
var columnChartsList = []
Page({
	data: {
		carModelsList: [],
    inStockData: [],
		cacheCarModelsList: [],
		windowHeight: '',
		windowWidth: '',
		showRmendCarFacade: false,
		filtersData: [],
		CarsModeleText: '全部',
		CarsModeleSelectId: 0,
		showCharts: true, // 是否展示charts图表，解决弹出层无法点击问题
    HTTPS_YMCAPI: app.config.tradeServerHTTPSUrl,
    showNodata: false,
    showPopCharts: false,
    popCharts: null,
    active: '',
    stock: 'in_stock',
    stockText: '有货',
    stockSeclect: 'selected',
    // 图表时间筛选.
    selectTime: {
      selectId: '0', // 全部.
      selectText: '全部'
    },
    carsInfo: ''
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
      this.setData({carsInfo: carsInfo})
			this.pagesloadRequest(carsInfo,true)
		}
	},
  pagesloadRequest(carsInfo,inStock) {
    let that = this
    let stock = inStock ? 'in_stock' : 'all'
    let stockText = inStock ? '有货' : '全部'
    let stockSeclect = inStock ? 'selected' : ''
    app.modules.request({
      url: app.config.ymcServerHTTPSUrl + 'supply/car/spu',
      method: 'GET',
      data: {
        carSeriesId: carsInfo.id,
        inStock: inStock // 默认显示有货.
      },
      success: function(res) {
        if(res) {
          let carModelsList = res.content
          let filters = res.filters
          let filtersData
          let showNodata = false
          let inStockData = []
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
            showNodata: showNodata,
            stock: stock,
            stockText: stockText,
            stockSeclect: stockSeclect
          })
        }
      }
    })
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
		let newModelsList = []
    let filtersData = this.data.filtersData
    let that = this
    let carModelsList = this.data.cacheCarModelsList
    let showNodata = false
		if(selectItem.name === '全部') {
			newModelsList = carModelsList
		}else {
			for(let item of carModelsList) {
				if(item.yearStyle === selectItem.name) {

					newModelsList.push(item)
				}
			}
		}
    for(let item of filtersData) {
      if(selectId === item.name) {
        item.selected = 'selected'
      }else {
        item.selected = ''
      }
    }
    if(newModelsList.length == 0) {
      showNodata = true
    }
		this.drawCanvas(newModelsList)
		this.setData({
			CarsModeleText: selectItem.name,
			CarsModeleSelectId: selectId,
			carModelsList: newModelsList,
			showRmendCarFacade: false,
			showCharts: true,
      filtersData: filtersData,
      showNodata: showNodata
		})
	},
  handleSelectInstore() {
    let that = this
    let carsInfo = that.data.carsInfo
    let cacheCarModelsList = that.data.cacheCarModelsList
    let newCarModelsList = []
    
    if(that.data.stock === 'in_stock') {
      that.pagesloadRequest(carsInfo,false)
    }else {
      that.pagesloadRequest(carsInfo,true)
    }
    
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
	headlerRemoveRmendCarFacade() {
		let carModelsList = this.data.carModelsList
		this.drawCanvas(carModelsList)
		this.setData({
			showRmendCarFacade: false,
			showCharts: true
		})
	},
  handleCharttouch(e) {
    let id =  e.target.dataset.id
    let that = this
    if(columnChartsList.length > 0) {
      for(let item of columnChartsList) {
        if(item.id == id) {
          let index = item.chart.getCurrentDataIndex(e)
          let chartData = item.chart.chartData
          let config = item.chart.config
          let opts = item.chart.opts
          let context = item.chart.context
          let changeData = item.chart.changeData;
          let callback = function(data) {
            if(data) {
              let value = 0
              for(let item of data.y) {
                value+=item
              }
              console.log(value)
              if(value <= 0) {return}
              that.setData({
                showPopCharts: true,
                showCharts: false
              })
              that.drawPopCharts(data)
            }
          }
          item.chart.drawChartShade(index,chartData,config,opts,context,callback)
        }
      }
    }
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
    columnCharts = null
		for (let item of data) {
      
			if(item.supply.chart) {
				columnCharts =  new app.wxcharts({
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
            color: '#77A0E9'
          }],
					xAxis: {
            disableGrid: false,
            fontColor: '#333333',
            gridColor: '#333333',
            unitText: '下(万)'
          },
          yAxis: {
            disabled: true,
            fontColor: '#333333',
            gridColor: '#333333',
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
          dataLabel: false,
          dataPointShape: false,
          xScale: item.supply.chart.scale,
          extra: {
            area: ['风险','适宜2.43~3.73','偏贵'],
            hint: item.supply.chart.hint,
            ratio: '0.4',
            index: item.supply.chart.priceIndex
          }
				})
        
        let chartItem = {
          id: item.carModelId,
          chart: columnCharts
        }
        columnChartsList.push(chartItem)
			}
		}
	},
  drawPopCharts(data) {
    if(!data) {return}
    let popWindow = {}
    
		try {
      let res = wx.getSystemInfoSync()
      
			popWindow.windowWidth = res.windowWidth 
    } catch (e) {

    }
    this.data.popCharts = new app.wxcharts({
      canvasId: 'popCharts',
      type: 'column',
      categories: data.x,
      animation: true,
      color: '#ECF0F7',
      legend: false,
      background: '#ECF0F7',
      series: [{
        name: '1',
        data: data.y,
        color: '#77A0E9'
      }],
      xAxis: {
        disableGrid: false,
        fontColor: '#333333',
        gridColor: '#333333',
        unitText: '下(万)'
      },
      yAxis: {
        disabled: true,
        fontColor: '#333333',
        gridColor: '#333333',
        unitText: '（个）',
        min: 0,
        format(val) {
          return val.toFixed(0)
        }
      },
      dataItem: {
        color: '#ECF0F7'
      },
      width: popWindow.windowWidth,
      height: 120,
      dataLabel: false,
      dataPointShape: false,
      extra: {
        area: ['风险','适宜2.43~3.73','偏贵']
      }
    })
  },
  handleClosePopup() {
    console.log('colse')
    let carModelsList = this.data.carModelsList
		this.drawCanvas(carModelsList)
    this.setData({
      showPopCharts: false,
      showCharts: true
    })
    this.data.popCharts = null
  },
  handleSelectTime() {
    
  }

})
