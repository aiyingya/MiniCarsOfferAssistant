import {
  $wuxToast
} from '../../components/wux'
import util from '../../utils/util'

let app = getApp()
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
    showSelectCharts: '',
    carsInfo: '',
    selectChartsLabel: false,
    selectColorData: [],
    selectColors: [],
    colorAllSelected: '',
    selectColorsId: '',
    selectColorTime: [{value: 12}, {value: 24}],
    timesAllSelected: '',
    selectTimes: '',
    selectTimesId: '',
    changeCharts: [],
    carModelsInfo: '',
    touchindex: '',
    selectTimesData: [],
    pageShare: false,
    options: ''
  },
  onLoad (options) {
    let carsInfo = util.urlDecodeValueForKeyFromOptions('carsInfo', options)
    let that = this
    try {
      let res = wx.getSystemInfoSync()
      this.pixelRatio = res.pixelRatio
      this.apHeight = 16
      this.offsetTop = 80
      this.windowWidth = res.windowWidth - 30
      this.setData({windowHeight: (res.windowHeight - 44) + 'px'})
    } catch (e) {

    }
    
    if (!app.userService.isLogin()) {
      setTimeout(function(){
        that.data.pageShare = true
      },1000)
      this.setData({carsInfo: carsInfo, options: options})
      wx.navigateTo({
        url: '../login/login'
      })
    }else {
      if (carsInfo) {
        // 设置NavigationBarTitle.
        wx.setNavigationBarTitle({
          title: carsInfo.name
        })
        this.setData({carsInfo: carsInfo, options: options})
        this.pagesloadRequest(carsInfo, true)
        
        wx.showShareMenu()      
      }
    }
  },
  onShow () {
    let options = this.data.options
    let pageShare = this.data.pageShare
    if(pageShare) {
      this.onLoad(options)
    }
  },
  /** 
   * 页面分享.
   */
  onShareAppMessage () {
    let carsInfo = this.data.carsInfo
    let carsInfoKeyValueString = util.urlEncodeValueForKey('carsInfo', carsInfo)
    return {
      title: '要卖车，更好用的卖车助手',
      path: `pages/carModels/carModels?${carsInfoKeyValueString}`,
      success(res) {
        // 分享成功
        
      },
      fail(res) {
        // 分享失败
      }
    }
  },
  pagesloadRequest(carsInfo, inStock) {
    let that = this
    let stock = inStock ? 'in_stock' : 'all'

    let stockSeclect = inStock ? 'selected' : ''

    app.saasService.requestSearchSpuByCarSeriesId(carsInfo.id, inStock, {
      success: function (res) {
        if (res) {
          let carModelsList = res.content
          let filters = res.filters
          let filtersData
          let showNodata = false
          let inStockData = []

          that.drawCanvas(carModelsList)

          for (let item of carModelsList) {

            let colors = []
            let hours = [{
              value: '全部',
              selected: 'selected'
            }]
            if (item.supply.colors) {
              let newColorKey = Object.keys(item.supply.colors)

              for (let color of newColorKey) {
                let colorItem = {
                  key: color,
                  value: item.supply.colors[color]
                }
                colors.push(colorItem)
              }
            }
            if(item.supply.hours.length > 0) {

              for(let hour of item.supply.hours) {
                let time = {
                  value: hour,
                  selected: ''
                }

                hours.push(time)
              }
            }
            item.colors = colors
            item.selectColors = []
            item.selectTimes = '全部' // 默认24
            item.hours = hours // 默认24

          }

          for (let item of filters) {
            filtersData = item.items
          }
          if (carModelsList.length === 0) {
            showNodata = true
          }
          console.log(carModelsList)
          that.setData({
            carModelsList: carModelsList,
            cacheCarModelsList: carModelsList,
            filtersData: filtersData,
            showNodata: showNodata,
            stock: stock,
            stockSeclect: stockSeclect
          })
        }
      }
    })
  },
  handleCheckCarsModele() {
    let weitch = this.data.showRmendCarFacade
    let carModelsList = this.data.carModelsList
    if (weitch) {
      columnCharts = null
      columnChartsList = []
      this.drawCanvas(carModelsList)
      this.setData({
        showRmendCarFacade: false,
        showCharts: true
      })
    } else {
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

    if (selectItem.name === '全部') {
      newModelsList = carModelsList
    } else {
      for (let item of carModelsList) {
        if (item.yearStyle === selectItem.name) {

          newModelsList.push(item)
        }
      }
    }
    for (let item of filtersData) {
      if (selectId === item.name) {
        item.selected = 'selected'
      } else {
        item.selected = ''
      }
    }
    if (newModelsList.length == 0) {
      showNodata = true
    }
    that.drawCanvas(newModelsList)
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

    if (that.data.stock === 'in_stock') {
      that.pagesloadRequest(carsInfo, false)
    } else {
      that.pagesloadRequest(carsInfo, true)
    }

  },
  handlerToCarSources (e) {
    let item = e.currentTarget.dataset.carmodelsinfo
    let carModelsInfoKeyValueString = util.urlEncodeValueForKey('carModelsInfo', item)
    let status = item.supply.status
    let that = this
    let carModelsList = this.data.carModelsList
    if (status === '暂无供货') {
      this.setData({
        showCharts: false
      })
      $wuxToast.show({
        type: false,
        timer: 2000,
        color: '#fff',
        text: '暂无供货'
      })
      setTimeout(function () {
        columnCharts = null
        columnChartsList = []
        that.drawCanvas(carModelsList)
        that.setData({
          showCharts: true
        })
      }, 2000)
      return
    }
    wx.navigateTo({
      url: '/pages/carSources/carSources?' + carModelsInfoKeyValueString
    })
  },
  headlerRemoveRmendCarFacade() {
    let carModelsList = this.data.carModelsList
    columnCharts = null
    columnChartsList = []
    this.drawCanvas(carModelsList)
    this.setData({
      showRmendCarFacade: false,
      showCharts: true
    })
  },
  handleCharttouch(e) {
    let id = e.target.dataset.id
    let carModelsInfo = e.target.dataset.carmodelsinfo
    let that = this
    this.setData({
      carModelsInfo: carModelsInfo
    })

    let res = wx.getSystemInfoSync()
    console.log(res.system.indexOf('Android'))
    if (res.system.indexOf('Android') >= 0) {
      return
    }

    if (columnChartsList.length > 0) {
      for (let item of columnChartsList) {
        if (item.id == id) {
          let index = item.chart.getCurrentDataIndex(e)
          let chartData = item.chart.chartData
          let config = item.chart.config
          let opts = item.chart.opts
          let context = item.chart.context
          let changeData = item.chart.changeData

          that.data.touchindex = index
          item.chart.drawChartShade(index, chartData, config, opts, context)
        }
      }
    }
  },
  handletouchmove(e) {
    this.handleCharttouch(e)
  },
  handletouchend(e) {
    let id = e.target.dataset.id
    let carModelsInfo = e.target.dataset.carmodelsinfo
    let carModelsInfoKeyValueString = util.urlEncodeValueForKey('carModelsInfo', carModelsInfo)
    let that = this
    let index = that.data.touchindex
    this.setData({
      carModelsInfo: carModelsInfo
    })

    if (columnChartsList.length > 0) {
      for (let item of columnChartsList) {
        if (item.id == id) {
          let chartData = item.chart.chartData
          let config = item.chart.config
          let opts = item.chart.opts
          let context = item.chart.context
          let changeData = item.chart.changeData;
          let callback = function (data) {
            console.log(data)
            if (data.y.length > 0) {
              let value = 0
              for (let item of data.y) {
                value += item
              }
              
              if (value <= 0) {
                return
              }
              that.setData({
                showPopCharts: true,
                showCharts: false
              })
              that.drawPopCharts(data)
              that.data.touchindex = ''
            }else {
              wx.navigateTo({
                url: '/pages/carSources/carSources?' + carModelsInfoKeyValueString
              })
            }
          }
          console.log(index)
          item.chart.drawChartShade(index, chartData, config, opts, context, callback)
        }
      }
    }
  },
  popupChartstouchMove(e) {
    console.log(e)
  },
  drawCanvas(list) {
    if (!list) {
      return
    }
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
    columnChartsList = []
    for (let item of data) {

      if (item.supply.chart) {
        columnCharts = new app.wxcharts({
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
            unitText: item.supply.chart.xAxisName
          },
          yAxis: {
            disabled: true,
            fontColor: '#333333',
            gridColor: '#333333',
            unitText: '（个）',
            min: 0,
            max: 20,
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
            area: ['风险', '适宜2.43~3.73', '偏贵'],
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
    if (!data) {
      return
    }
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
      animation: false,
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
        unitText: data.xAxisName
      },
      yAxis: {
        disabled: true,
        fontColor: '#333333',
        gridColor: '#333333',
        unitText: '（个）',
        min: 0,
        max: 10,
        format(val) {
          return val.toFixed(0)
        }
      },
      dataItem: {
        color: '#ECF0F7'
      },
      width: popWindow.windowWidth,
      height: 120,
      dataLabel: true,
      dataPointShape: false,
      extra: {
        area: ['风险', '适宜2.43~3.73', '偏贵']
      }
    })
  },
  handleClosePopup() {
    console.log('colse')
    let carModelsList = this.data.carModelsList
    columnCharts = null
    columnChartsList = []
    this.drawCanvas(carModelsList)
    this.setData({
      showPopCharts: false,
      showCharts: true
    })
    this.data.popCharts = null
    this.data.touchindex = ''
  },
  handleSelectTimes(e) {
    let that = this
    let hours = e.currentTarget.dataset.hours
    let selecttime = e.currentTarget.dataset.selecttime
    let selectTimesId = e.currentTarget.dataset.selectid
    let carModelsList = this.data.carModelsList

    for (let item of carModelsList) {
      if (item.carModelId === selectTimesId) {

        for (let times of hours) {
          if (times.value === selecttime) {
            times.selected = 'selected'
          } else {
            times.selected = ''
          }
        }
      }
    }

    this.setData({
      selectChartsLabel: true,
      changeSelectColors: false,
      changeSelectTimes: true,
      showCharts: false,
      selectTimesData: hours,
      selectTimesId: selectTimesId,
      selectTimes: selecttime
    })

  },
  handleChangeTimesItem(e) {
    let that = this
    let selectitem = e.currentTarget.dataset.selectitem
    let selectTimesId = that.data.selectTimesId
    let carModelsList = this.data.carModelsList

    for (let item of carModelsList) {
      if (item.carModelId === selectTimesId) {

        for (let times of item.hours) {
          if (times.value === selectitem) {
            times.selected = 'selected'
          } else {
            times.selected = ''
          }
        }
        item.selectTimes = selectitem.value
        that.getChangeCharts(selectTimesId, carModelsList, item)
      }
    }
  },
  handleSelectColor(e) {
    let colors = e.currentTarget.dataset.colors
    let selectColors = e.currentTarget.dataset.selectcolors
    let selectColorsId = e.currentTarget.dataset.selectcolorsid
    let newColors = []
    let allColorSelect = ''
    let carModelsList = this.data.carModelsList
    for (let item of colors) {
      if (item.value === '#FFFFFF') {
        item.style = 'border: 1rpx solid #333; width: 21rpx; height:21rpx;'
      }
      if (selectColors.length === 0) {
        allColorSelect = 'selected'
      } else {
        for (let select of selectColors) {
          if (item.key === select.key) {
            item.selected = 'selected'
          }
        }
      }
    }

    for (let item of carModelsList) {
      if (item.carModelId === selectColorsId) {
        item.selectColorsId = selectColorsId
        item.selectColors = selectColors
        this.setData({
          selectChartsLabel: true,
          changeSelectColors: true,
          changeSelectTimes: false,
          showCharts: false,
          selectColorData: colors,
          colorAllSelected: allColorSelect,
          selectColorsId: selectColorsId,
          selectColors: selectColors
        })
      }
    }
  },
  handleChangeColorItem(e) {
    let that = this
    let selectColors = e.currentTarget.dataset.selectcolors
    let selectItem = e.currentTarget.dataset.selectitem
    let selectColorsId = that.data.selectColorsId
    let carModelsList = that.data.carModelsList

    for (let item of carModelsList) {
      if (item.carModelId === selectColorsId) {
        if (typeof selectItem === 'object' && selectItem.selected !== 'selected') {

          selectColors.push(selectItem)
        } else if (selectItem === '全部') {
          selectColors = []
        }
        item.selectColors = selectColors

        that.getChangeCharts(selectColorsId, carModelsList, item)
      }
    }
  },
  getChangeCharts(sid, carModelsList, item) {
    let requestData
    let that = this
    let changeCharts = this.data.changeCharts
    let newCarModelsList = []
    let times = [{value: 24, selected: 'selected'}, {value: 12, selected: ''}]
    requestData = {
      
      inStock: false
    }

    let keys = []
    if (item.selectColors.length > 0) {
      for (let items of item.selectColors) {
        keys.push(items.key)
      }
    }
    if (keys.length > 0) {
      requestData.colors = keys.join(',')
    }
    if(item.selectTimes !== '全部') {
      requestData.hours = item.selectTimes
    }
    for (let changeTime of times) {
      if (item.selectTimes === changeTime.value) {
        changeTime.selected = 'selected'
      } else {
        changeTime.selected = ''
      }
    }
    app.saasService.requestSearchSpuBySpuId(sid, requestData, {
      success: function (res) {

        if (res.content.length > 0) {

          for (let change of carModelsList) {
            if (change.carModelId === res.content[0].carModelId) {
              let requestItem = res.content[0]

              requestItem.colors = item.colors
              requestItem.selectColors = item.selectColors
              requestItem.hours = item.hours
              requestItem.selectTimes = item.selectTimes
              requestItem.selectColorsId = sid,
              requestItem.supply.status = item.supply.status
              requestItem.supply.supplierCount = item.supply.supplierCount
              requestItem.supply.colors = item.supply.colors

              console.log(requestItem.supply, item.supply)
              change = requestItem
            }
            newCarModelsList.push(change)
          }
        }

        columnCharts = null
        columnChartsList = []
        that.drawCanvas(newCarModelsList)
        that.setData({
          carModelsList: newCarModelsList,
          selectColors: [],
          selectChartsLabel: false,
          showCharts: true
        })
      }
    })
  },
  handleClosePopupChange() {
    console.log('colse')
    let carModelsList = this.data.carModelsList
    columnCharts = null
    columnChartsList = []
    this.drawCanvas(carModelsList)
    this.setData({
      selectChartsLabel: false,
      showCharts: true
    })
  },
  forbidScrollView() {
    this.setData({
      scrollView: 'overflow: hidden;'
    })
  },
  allowScrollView() {
    this.setData({
      scrollView: 'overflow: auto;'
    })
  }

})
