// @flow
import {
  $wuxToast
} from "../../components/wux"
import util from '../../utils/util'
import { container, system } from '../../landrover/business/index'

var columnCharts = null
var columnChartsList = []

Page({
  data: {
    associateResults: [],
    searchResults: [],
    searchValue: '',
    cacheSearchValue: '',
    widthToChange: '',
    showResultsSearch: true,
    searchNodata: false,
    showSearchBtn: false,
    showCharts: true,
    showPopupMarketCharts: false,
    pageIndex: 1,
    pageInfo: '',
    popCharts: null,
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
    selectColorTime: [{
      value: 12
    }, {
      value: 24
    }],
    timesAllSelected: '',
    selectTimes: '',
    selectTimesId: '',
    changeCharts: [],
    carModelsInfo: '',
    touchindex: '',
    searchHistory: [],
    showSearchHistory: true,
    popMarketCharts: '',
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
      // 天数计算`
      recentDaysOfData: [
        { id: 0, days: 90, selected: false },
        { id: 1, days: 60, selected: true },
        { id: 2, days: 30, selected: false }
      ],
      res: {}
    }
  },
  onLoad() {
    this.getSearchHistory()
  },
  handleSearchInput(e) {
    let val = e.detail.value;
    let that = this;
    let searchResults = [];
    if (val) {
      container.tradeService.searchInput(val, 12)
        .then(function (res) {
          that.setData({
            associateResults: res,
            searchResults: [],
            showResultsSearch: true,
            searchNodata: false,
            showSearchBtn: true,
            cacheSearchValue: val
          })
        }, function (err) {

        })
    } else {
      that.setData({
        associateResults: [],
        searchResults: [],
        searchNodata: false,
        showSearchBtn: false,
        cacheSearchValue: val,
        showSearchHistory: true
      })
    }
  },
  handlerChooseResults(e) {
    let that = this
    let results = e.currentTarget.dataset.results
    let url
    let data = {}
    let carModelsList = []
    let searchNodata = false
    console.log(results)
    container.saasService.requireCarSpu(results.id, {}, results.type, false, {
      success(res) {
        carModelsList = res.content
        searchNodata = carModelsList.length > 0 ? false : true
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
          item.colors = colors
          item.selectColors = []
          item.selectTimes = '全部' // 默认24
          item.hours = hours // 默认24
        }
        if (carModelsList) {
          that.drawCanvas(carModelsList)
          that.setData({
            searchResults: carModelsList,
            associateResults: [],
            searchValue: results.content,
            cacheSearchValue: results.content,
            showResultsSearch: false,
            searchNodata: searchNodata,
            showSearchHistory: false
          })

          console.log(carModelsList)
          that.postUserSearchHistory(results.content)
        }
      }
    })
  },
  getSearchConfirm(pageIndex) {
    let val = this.data.cacheSearchValue
    let that = this
    let searchNodata = false
    let searchResults = []

    container.saasService.requestSearchCarSpu(val, pageIndex, 10, {
      success: function (res) {
        if (res.first) {
          searchNodata = res.content.length > 0 ? false : true
          searchResults = res.content
        } else {
          searchResults = that.data.searchResults
          for (let item of res.content) {
            searchResults.push(item)
          }
        }

        for (let item of searchResults) {

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
          item.colors = colors
          item.selectColors = []
          item.selectTimes = '全部' // 默认24
          item.hours = hours // 默认24
        }

        that.data.pageInfo = {
          first: res.first,
          hasNext: res.hasNext,
          hasPrevious: res.hasPrevious,
          last: res.last,
          number: res.number,
          numberOfElements: res.numberOfElements,
          size: res.size,
          totalElements: res.totalElements,
          totalPages: res.totalPages
        }
        that.drawCanvas(searchResults)
        that.setData({
          searchResults: searchResults,
          associateResults: [],
          showResultsSearch: false,
          searchNodata: searchNodata,
          showSearchHistory: false
        })
        that.postUserSearchHistory(val)
      }
    })
  },
  handleSearchConfirm(e) {
    let val = this.data.cacheSearchValue
    let that = this
    this.data.pageIndex = 1
    this.getSearchConfirm(this.data.pageIndex)
  },
  onReachBottom() {
    let that = this
    let searchPageInfo = that.data.pageInfo
    if (!searchPageInfo.hasNext) return

    this.data.pageIndex++
    this.getSearchConfirm(this.data.pageIndex)
    console.log(searchPageInfo)
  },
  handleSearchHistory(e) {
    let val = e.currentTarget.dataset.text
    this.data.cacheSearchValue = val
    this.setData({
      searchValue: val
    })
    this.data.pageIndex = 1
    this.getSearchConfirm(this.data.pageIndex)
  },
  handlerToCarSources(e) {
    let item = e.currentTarget.dataset.carmodelsinfo
    let carModelsInfoKeyValueString = util.urlEncodeValueForKey('carModelsInfo', item)
    let status = item.supply.status
    let that = this
    let carModelsList = this.data.searchResults
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
        that.setData({
          showCharts: true
        })
        that.drawCanvas(carModelsList)
      }, 2000)
      return
    }
    wx.navigateTo({
      url: '../carSources/carSources?' + carModelsInfoKeyValueString
    })
  },
  handlerPromptly(e) {
    const carModelsInfoKeyValueString = util.urlEncodeValueForKey('carModelsInfo', e.currentTarget.dataset.carmodelsinfo)
    wx.navigateTo({
      url: '../quote/quotationCreate/quotationCreate?' + carModelsInfoKeyValueString
    })
  },
  handleCancelSearch() {
    wx.navigateBack()
  },
  handleCancelSearchValue() {
    this.setData({
      associateResults: [],
      searchResults: [],
      showResultsSearch: false,
      searchNodata: false,
      showSearchBtn: false,
      searchValue: '',
      showSearchHistory: true
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
          let changeData = item.chart.changeData;
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
    this.setData({
      carModelsInfo: carModelsInfo
    })

    if (columnChartsList.length > 0) {
      for (let item of columnChartsList) {
        if (item.id == id) {
          let index = that.data.touchindex
          let chartData = item.chart.chartData
          let config = item.chart.config
          let opts = item.chart.opts
          let context = item.chart.context
          let changeData = item.chart.changeData;
          let callback = function (data) {
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
          item.chart.drawChartShade(index, chartData, config, opts, context, callback)
        }
      }
    }
  },
  drawCanvas(list) {
    if (!list) {
      return
    }
    let data = list
    let that = this
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
        unitText: data.xAxisName,
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
    let carModelsList = this.data.searchResults
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
    let carModelsList = this.data.searchResults

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
    let carModelsList = this.data.searchResults

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
    let carModelsList = this.data.searchResults
    for (let item of colors) {
      if (item.value === '#FFFFFF') {
        item.style = 'border: 1rpx solid #333; width: 21rpx; height:21rpx;'
      }
      if (selectColors.length === 0) {
        allColorSelect = 'selected'
      } else {
        for (let select of selectColors) {
          if (item.key === select.key) {
            console.log(item)
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
    let carModelsList = that.data.searchResults

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
    let newCarModelsList = []
    let times = [{
      value: 24,
      selected: 'selected'
    }, {
      value: 12,
      selected: ''
    }]
    requestData = {
      carSeriesId: sid,
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

    container.saasService.requestSearchSpuBySpuId(sid, requestData, {
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
              change = requestItem
            }

            newCarModelsList.push(change)
          }
        }

        columnCharts = null
        columnChartsList = []
        that.drawCanvas(newCarModelsList)
        that.setData({
          searchResults: newCarModelsList,
          selectColors: [],
          selectChartsLabel: false,
          showCharts: true
        })
      }
    })
  },
  handleClosePopupChange() {

    let carModelsList = this.data.searchResults
    columnCharts = null
    columnChartsList = []
    this.drawCanvas(carModelsList)
    this.setData({
      selectChartsLabel: false,
      showCharts: true
    })
  },
  popupChartstouchMove(e) {
    console.log(e)
  },
  getSearchHistory() {
    container.tradeService.getUserSearchHistory()
      .then(res => {
        console.log(res)
        this.setData({
          searchHistory: res
        })
      })
  },
  postUserSearchHistory(text) {
    let searchHistory = this.data.searchHistory
    container.tradeService.postUserSearchHistory(text)
      .then(res => {
        for (var i = 0; i < searchHistory.length; i++) {
          if (searchHistory[i] === text) {
            searchHistory.splice(i, 1);
            break;
          }
        }
        searchHistory.unshift(text)
        this.setData({
          searchHistory: searchHistory
        })
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
      width: system.windowWidth,
      height: 120,
      setPadding: setPadding,
      extra: {
        lineStyle: 'curve'
      }
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
      item: ChartDataItem,
      max: number,
      min: number
    } => {
      const item: ChartDataItem = {
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
      let max = - Number.MAX_VALUE
      for (let priceTrendItem of priceTrendList) {
        i = i + 1
        if (i > 90 - days) {
          let val = ''
          let companyCount = ''
          if (priceTrendItem && priceTrendItem.discount) {
            val = util.priceAbsStringWithUnitNumber(priceTrendItem.discount)
            if (Number(val) > max) { max = Number(val) }
            if (Number(val) < min) { min = Number(val) }
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
      return {
        item,
        max,
        min
      }
    }

    let { item, max, min } = chartItemGenerator(res.lowestPriceTrend, days)
    item.color = "#ED4149"
    item.name = ''
    item.topno = 1
    series.push(item)

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
      })
  },
  /**
   * 关闭行情走势.
  */
  handleClosePopupMarket() {
    columnCharts = null
    columnChartsList = []

    let carModelsList = this.data.searchResults
    this.drawCanvas(carModelsList)
    this.setData({
      'marketCharts.recentDaysOfData': [
        { id: 0, days: 90, selected: true },
        { id: 1, days: 60, selected: false },
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
    console.log(index, this.data.popMarketCharts);
    this.data.popMarketCharts.showToolTip(e, {
      background: '#333333'
    });
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

    for (let item of series) {
      if (item.topno == topno) {
        if (item.switch) {
          item.switch = false
          topnoData[index].style = "icon-nobg"
        } else {
          item.switch = true
          topnoData[index].style = ""
        }
      }
    }
    for (let item of series) {
      if (item.switch) {
        updata.push(item)
      }
    }
    if (updata.length <= 0) { return }
    console.log(series, index, updata)

    this.data.marketCharts.series = series
    this.setData({
      'marketCharts.topnoData': topnoData
    })
    this.data.popMarketCharts.updateData({
      series: updata
    });
  }
})
