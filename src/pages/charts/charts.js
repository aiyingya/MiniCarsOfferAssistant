let app = getApp()

Page({
	data: {

	},
	onLoad (options) {
		this.drawCanvas()
	},
	onShow () {

	},
	drawCanvas(list) {

		let that = this
		try {
      let res = wx.getSystemInfoSync()
      that.pixelRatio = res.pixelRatio
      that.apHeight = 16
      that.offsetTop = 80
			that.windowWidth = res.windowWidth
    } catch (e) {

    }

    new app.wxcharts({
      canvasId: 'canvas',
      type: 'column',
      categories: ['12.33','16.33','18.33','12.33','16.33','18.33'],
      animation: false,
      color: '#ECF0F7',
      legend: false,
      background: '#ECF0F7',
      series: [{
        name: '1',
        data: [0,8,3,6,2,1],
        color: '#7cb5ec'
      }],
      xAxis: {
        disableGrid: true,
        fontColor: '#999999',
        gridColor: '#afafaf'
      },
      yAxis: {
        disabled: true,
        fontColor: '#4C6693',
        min: 10,
        max: 50,
        format(val) {
          return val.toFixed(0)
        }
      },
      dataItem: {
        color: '#ECF0F7'
      },
      width: that.windowWidth,
      height: 110,
      dataLabel: true,
      dataPointShape: false,
      extra: {
        area: ['风险','适宜2.43~3.73','偏贵']
      }
    })
	}
})
