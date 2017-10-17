// @flow
import { container } from '../../landrover/business/index'
import utils from '../../utils/util'

const saasService: SAASService = container.saasService
const userService: UserService = container.userService

Page({
  data: {
    pageIndex: 1,
    pageSize: 10,
    comments: [{
      price: 0,
      content: '', // 备注
      userPhone: '', // 18888*****
      updateTime: '', // 更新时间
      tags: [] // 标签列表
    }],
    infoItem: {},
    showCarModelName: '', // 要显示的车款标题
    showColorName: '', // 要显示的内外饰颜色
    carSourceId: 0, // 商品id
    carSourceItem: {} // 车源信息吧
  },
  onLoad(options) {
    this.setData({
      carSourceItem: utils.urlDecodeValueForKeyFromOptions('carSourceItem', options),
      showCarModelName: options.showCarModelName,
      showColorName: options.showColorName,
      carSourceId: options.carSourceId
    })
    this.getData(options.carSourceId)
  },
  onShow() {
  },
  getData(carSourceId) {
    saasService.getCarSourceMore(
      carSourceId,
      this.data.pageIndex,
      this.data.pageSize
    ).then(res => {
      res.content.length && res.content.forEach(({updateTime}, index) => {
        res.content[index].updateTimeStr = utils.getTimeStr(updateTime, 'YYYY/MM/DD hh:mm') // utils.getTimeStr(updateTime, "yyyy-MM-dd")
      })
      this.setData({
        infoItem: res,
        comments: res.content
      })
    })
  },
  handlerLoadMore() {
    let newPageIndex = this.data.pageIndex + 1
    saasService.getCarSourceMore(
      this.data.carSourceId,
      newPageIndex,
      this.data.pageSize
    ).then(res => {
      res.content.length && res.content.forEach(({updateTime}, index) => {
        res.content[index].updateTimeStr = utils.getTimeStr(updateTime, 'YYYY/MM/DD hh:mm') // utils.getTimeStr(updateTime, "yyyy-MM-dd")
      })
      this.setData({
        infoItem: res,
        comments: this.data.comments.concat(res.content)
      })
    })
  },
})
