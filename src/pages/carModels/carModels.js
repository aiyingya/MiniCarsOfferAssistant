// @flow
import {
  $wuxTrack,
  $wuxToast
} from '../../components/wux'
import * as wxapi from 'fmt-wxapp-promise'
import utils from '../../utils/util'
import { container, system } from '../../landrover/business/index'

var columnCharts = null
var columnChartsList = []

Page({
  data: {
    pageId: 'carModels',
    pageName: '车款列表',
    pageParameters: {},
    carModelsList: [],
    inStockData: [],
    cacheCarModelsList: [],
    showRmendCarFacade: false,
    filtersData: [],
    CarsModeleText: '全部',
    CarsModeleSelectId: 0,
    showCharts: true, // 是否展示charts图表，解决弹出层无法点击问题
    showNodata: false,
    showPopCharts: false,
    popCharts: null,
    popMarketCharts: null,
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
    selectColorTime: [{ value: 12 }, { value: 24 }],
    timesAllSelected: '',
    selectTimes: '',
    selectTimesId: '',
    changeCharts: [],
    carModelsInfo: '',
    touchindex: '',
    selectTimesData: [],
    pageShare: false,
    options: '',
    showPopupMarketCharts: false,
    marketCharts: {
      series: [],
      topnoData: [
        { text: 'Top.1', style: '' },
        { text: 'Top.2', style: '' },
        { text: 'Top.3', style: '' }
      ],
      switchTopno1: true,
      switchTopno2: true,
      switchTopno3: true,
      unit: '',
      // 天数计算
      recentDaysOfData: [
        { id: 0, days: 90, selected: false },
        { id: 1, days: 60, selected: true },
        { id: 2, days: 30, selected: false }
      ],
      res: {}
    },
    carModelLabel: {
      unfold: ''
    },
    praiseModels: []
  },
  onLoad(options) {
    let carsInfo = utils.urlDecodeValueForKeyFromOptions('carsInfo', options)
    let that = this

    if (!container.userService.isLogin()) {
      setTimeout(function () {
        that.data.pageShare = true
      }, 1000)
      this.setData({ carsInfo: carsInfo, options: options })
      wx.navigateTo({
        url: '../login/login'
      })
    } else {
      if (carsInfo) {
        // 设置NavigationBarTitle.
        wx.setNavigationBarTitle({
          title: carsInfo.name
        })
        this.setData({ carsInfo: carsInfo, options: options })
        wx.showLoading({ title: '加载中...', icon: 'loading', mask: true })
        this.pagesloadRequest(carsInfo, true)
          .then(() => { wx.hideLoading() })
          .catch(() => { wx.hideLoading() })
        if (wx.showShareMenu) {
          wx.showShareMenu()
        }
      }
    }
  },
  onShow() {
    const event = {
      eventAction: 'pageShow',
      eventLabel: `页面展开`
    }
    $wuxTrack.push(event)

    let options = this.data.options
    let pageShare = this.data.pageShare
    if (pageShare) {
      this.onLoad(options)
    }
  },
  /**
   * 页面分享.
   */
  onShareAppMessage() {
    let carsInfo = this.data.carsInfo
    let carsInfoKeyValueString = utils.urlEncodeValueForKey('carsInfo', carsInfo)
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
    const stock = inStock ? 'in_stock' : 'all'
    const stockSeclect = inStock ? 'selected' : ''

    return container.saasService.requestSearchSpuByCarSeriesId(carsInfo.id, inStock)
      .then((res: CarModelsResponse) => {
        if (res) {
          let carModelsList = res.content
          let filters = res.filters
          let filtersData
          let showNodata = false
          let inStockData = []

          this.drawCanvas(carModelsList)
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
            if (item.supply.hours.length > 0) {
              for (let hour of item.supply.hours) {
                let time = {
                  value: hour,
                  selected: ''
                }
                hours.push(time)
              }
            }
            // davidfu 这里的四个属性都是后期加入的
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
          const praiseModels = res.praiseModels
          this.setData({
            carModelsList: carModelsList,
            cacheCarModelsList: carModelsList,
            filtersData: filtersData,
            showNodata: showNodata,
            stock: stock,
            stockSeclect: stockSeclect,
            praiseModels: praiseModels
          })
        }
      })
      .catch(err => {
        console.log(err)
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

    console.log(newModelsList)
    this.setData({
      CarsModeleText: selectItem.name,
      CarsModeleSelectId: selectId,
      carModelsList: newModelsList,
      showRmendCarFacade: false,
      showCharts: true,
      filtersData: filtersData,
      showNodata: showNodata
    })
    that.drawCanvas(newModelsList)
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
  handlerToCarSources(e) {
    let item = e.currentTarget.dataset.carmodelsinfo
    let carModelsInfoKeyValueString = utils.urlEncodeValueForKey('carModelsInfo', item)
    let status = item.supply.status
    let that = this
    let carModelsList = this.data.carModelsList
    if (status === '暂无供货') {
      this.setData({
        showCharts: false
      })
      $wuxToast.show({
        type: 'text',
        timer: 2000,
        color: '#fff',
        text: '暂无供货'
      })
      setTimeout(function () {
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
    let carModelsInfoKeyValueString = utils.urlEncodeValueForKey('carModelsInfo', carModelsInfo)
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
          let changeData = item.chart.changeData
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
            } else {
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
  /**
   * 绘出第一层图表的内容
   *
   * @param {any} list
   * @returns
   */
  drawCanvas(list) {
    if (!list) {
      return
    }
    let data = list
    columnCharts = null
    columnChartsList = []
    for (let item of data) {
      if (item.supply.chart) {
        columnCharts = new container.chart({
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
          width: system.windowWidth,
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
  /**
   * 绘出第二层弹出的图表的内容
   *
   * @param {any} data
   * @returns
   */
  drawPopCharts(data) {
    if (!data) {
      return
    }
    let popWindow = {}
    popWindow.windowWidth = system.windowWidth
    this.data.popCharts = new container.chart({
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
  drawMarketPopCharts(
    maxPrice,
    minPrice,
    categories,
    xScale,
    series,
    setPadding
  ) {
    this.data.popMarketCharts = new container.chart({
      canvasId: 'popMarketCharts',
      type: 'line',
      categories: categories,
      color: '#ECF0F7',
      legend: false,
      background: '#ECF0F7',
      animation: false,
      series: series,
      xAxis: {
        disableGrid: true,
        fontColor: '#333333',
        gridColor: '#333333',
        unitText: '日期',
        type: 'calibration'
      },
      yAxis: {
        disabled: true,
        fontColor: '#333333',
        gridColor: '#333333',
        unitText: '（个）',
        min: minPrice,
        max: maxPrice,
        format(val) {
          return val.toFixed(2)
        }
      },
      xScale: xScale,
      dataLabel: false,
      dataPointShape: false,
      width: (system.screenHeight - 106 - 15 * 2 - 12 * 2),
      height: (system.screenWidth - 12 * 2),
      setPadding: setPadding,
      extra: {
        lineStyle: 'curve'
      },
      landscape: true
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
    let times = [{ value: 24, selected: 'selected' }, { value: 12, selected: '' }]
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
    if (item.selectTimes !== '全部') {
      requestData.hours = item.selectTimes
    }
    for (let changeTime of times) {
      if (item.selectTimes === changeTime.value) {
        changeTime.selected = 'selected'
      } else {
        changeTime.selected = ''
      }
    }
    container.saasService.requestSearchSpuBySpuId(sid, requestData)
      .then(res => {
        if (res.content.length > 0) {
          for (let change of carModelsList) {
            if (change.carModelId === res.content[0].carModelId) {
              let requestItem = res.content[0]

              requestItem.colors = item.colors
              requestItem.selectColors = item.selectColors
              requestItem.hours = item.hours
              requestItem.selectTimes = item.selectTimes
              requestItem.selectColorsId = sid
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
  },
  /**
   * 查看行情走势.
  */
  chartDataGenerator(
    res: SPUMarketTrendEntity,
    days: number = 60,
    xScaleRange: number = 5
  ): {
    max: number,
    min: number,
    categories: Array<string>,
    xScale: Array<string>,
    series: Array<ChartDataItem>
  } {
    const categories = []
    const xScale = []
    let i = 0
    for (let priceTrendItem of res.lowestPriceTrend) {
      i = i + 1
      if (i > 90 - days) {
        categories.push(priceTrendItem.priceDateString)
        if (i == 0) {
          xScale.push(priceTrendItem.priceDateString)
        } else if (i % xScaleRange === 0) {
          xScale.push(priceTrendItem.priceDateString)
        } else if (i === (categories.length - 1)) {
          xScale.push(priceTrendItem.priceDateString)
        }
      }
    }

    const series = []

    const chartItemGenerator = (
      priceTrendList: Array<PriceTrendEntity>,
      days: number
    ): {
      item: ChartDataItem | null,
      max: number,
      min: number
    } => {
      let item: ChartDataItem | null = {
        days: days,
        topno: null,
        name: null,
        color: null,
        data: [],
        switch: true,
        companyCount: []
      }
      let i = 0
      let min = Number.MAX_VALUE
      let max = -Number.MAX_VALUE
      let flag = false
      for (let priceTrendItem of priceTrendList) {
        i = i + 1
        if (i > 90 - days) {
          let val = ''
          let companyCount = ''
          if (priceTrendItem && priceTrendItem.discount) {
            val = utils.priceAbsStringWithUnitNumber(priceTrendItem.discount)
            if (Number(val) > max) { max = Number(val) }
            if (Number(val) < min) { min = Number(val) }
            flag = true
          } else {
            val = null
          }

          if (priceTrendItem && priceTrendItem.companyCount) {
            companyCount = priceTrendItem.companyCount
          } else {
            companyCount = null
          }
          item.data.push(val)
          if (item.companyCount != null) {
            item.companyCount.push(companyCount)
          }
        }
      }
      if (flag != true) {
        item = null
        max = 0
        min = 0
      }
      return {
        item,
        max,
        min
      }
    }

    let { item, max, min } = chartItemGenerator(res.lowestPriceTrend, days)
    if (item != null) {
      item.color = '#ED4149'
      item.name = ''
      item.topno = 1
      series.push(item)
    }

    min = Number((min - (max - min) * 0.25).toFixed(2))

    return {
      max,
      min,
      categories,
      xScale,
      series
    }
  },
  handleCheckMarket(e) {
    let spuId = e.currentTarget.dataset.selectid
    let carModelsInfo = e.target.dataset.carmodelsinfo
    let popWindow = {}
    popWindow.windowWidth = system.windowWidth
    let xAxisName = carModelsInfo.supply.chart.xAxisName
    let unitText = xAxisName.indexOf('万') >= 0 ? '万' : '点'

    container.saasService.gettingMarketTrend(spuId)
      .then((res: SPUMarketTrendEntity) => {
        const { max, min, categories, xScale, series } = this.chartDataGenerator(res)

        if (series.length > 0) {
          const setPadding = max.toString().length >= 5 ? 13 : 10

          this.setData({
            showPopupMarketCharts: true,
            showCharts: false,
            carModelsInfo: carModelsInfo,
            'marketCharts.res': res,
            'marketCharts.unit': unitText,
            'marketCharts.series': series
          })

          this.drawMarketPopCharts(max, min, categories, xScale, series, setPadding)
        } else {
          $wuxToast.show({
            type: 'text',
            timer: 2000,
            color: '#fff',
            text: '该车款暂无行情数据'
          })
        }
      })
  },
  /**
   * 关闭行情走势.
  */
  handleClosePopupMarket() {
    columnCharts = null
    columnChartsList = []

    let carModelsList = this.data.carModelsList
    this.drawCanvas(carModelsList)
    this.setData({
      'marketCharts.recentDaysOfData': [
        { id: 0, days: 90, selected: false },
        { id: 1, days: 60, selected: true },
        { id: 2, days: 30, selected: false }
      ],
      'marketCharts.res': {},
      showPopupMarketCharts: false,
      showCharts: true
    })
    this.data.popMarketCharts = null
    this.data.touchindex = ''
  },
  handleMarketTouch(e) {
    let that = this
    let index = this.data.popMarketCharts.getCurrentDataIndex(e)
    console.log(index, this.data.popMarketCharts)
    this.data.popMarketCharts.showToolTip(e, {
      background: '#333333'
    })
  },
  handleMarketUpdateDataWithDays(e) {
    const id = e.currentTarget.dataset.id

    const recentDaysOfData = this.data.marketCharts.recentDaysOfData
    for (let item of recentDaysOfData) {
      if (item.id == id) {
        if (item.selected === true) {
          return
        } else {
          item.selected = true
        }
      } else {
        item.selected = false
      }
    }

    const days = e.currentTarget.dataset.days
    const res = this.data.marketCharts.res
    const { max, min, categories, xScale, series } = this.chartDataGenerator(res, days)
    const setPadding = max.toString().length >= 5 ? 13 : 10

    this.setData({
      'marketCharts.recentDaysOfData': recentDaysOfData,
      'marketCharts.series': series
    })

    this.drawMarketPopCharts(max, min, categories, xScale, series, setPadding)
  },
  handleMarketUpdateData(e) {
    let index = e.currentTarget.dataset.topno
    let topno = index + 1
    let series = this.data.marketCharts.series
    let updata = []
    let topnoData = this.data.marketCharts.topnoData
    let isSwitch = false
    for (let item of series) {
      if (item.topno == topno) {
        if (item.switch) {
          item.switch = false
          topnoData[index].style = 'icon-nobg'
        } else {
          item.switch = true
          topnoData[index].style = ''
        }
      }
    }
    for (let item of series) {
      if (item.switch) {
        updata.push(item)
        for (let val of item.data) {
          if (val != null) {
            isSwitch = true
          }
        }
      }
    }

    if (updata.length <= 0 || !isSwitch) { return }

    this.data.marketCharts.series = series
    this.setData({
      'marketCharts.topnoData': topnoData
    })
    this.data.popMarketCharts.updateData({
      series: updata
    })
  },
  handleSwitchShow() {
    let carModelLabel = this.data.carModelLabel
    if (carModelLabel.unfold !== '') {
      this.setData({
        'carModelLabel.unfold': ''
      })
    } else {
      this.setData({
        'carModelLabel.unfold': 'show'
      })
    }
  }
})
