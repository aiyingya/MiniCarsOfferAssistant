// @flow
import { container } from '../../landrover/business/index'
const saasService: SAASService = container.saasService
const userService: UserService = container.userService
import util from '../../utils/util'

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
    showCarModelName: '', // 要显示的车款标题
    showColorName: '', // 要显示的内外饰颜色
    itemId: 0, // 商品id
    carSourceItem: {} // 车源信息吧
  },
  onLoad(options) {
    this.setData({
      carSourceItem : util.urlDecodeValueForKeyFromOptions('carSourceItem', options),
      showCarModelName : options.showCarModelName,
      showColorName : options.showColorName,
      itemId : options.itemId
    })
    this.getData(options.itemId)
  },
  onShow() {
  },
  getData(itemId) {
    saasService.getCarSourceMore(
      itemId,
      this.data.pageIndex,
      this.data.pageSize
    ).then(res => {
      res.content.length && res.content.forEach(({updateTime}, index) => {
        res.content[index].updateTimeStr = util.getTimeStr(updateTime, 'YYYY/MM/DD hh:mm') // util.getTimeStr(updateTime, "yyyy-MM-dd")
      })
      this.setData({
        comments: res.content
      })
    })
  }
})
