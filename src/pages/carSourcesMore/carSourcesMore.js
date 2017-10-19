// @flow
import { container } from '../../landrover/business/index'
import utils from '../../utils/util'
import CarSourceManager from '../../components/carSource/carSource.manager'

const saasService: SAASService = container.saasService
const userService: UserService = container.userService
let carSourceManger: CarSourceManager | null = null

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
      carSourceId: options.carSourceId,
      carModelsInfo: utils.urlDecodeValueForKeyFromOptions('carModelsInfo', options),
    })
    this.getData(options.carSourceId)
  },
  onShow() {
  },
  getData(carSourceId) {
    let carSourceItem = this.data.carSourceItem
    saasService.getCarSourceMore(
      carSourceId,
      this.data.pageIndex,
      this.data.pageSize
    ).then(res => {
      res.content.length && res.content.forEach(({updateTime}, index) => {
        res.content[index].updateTimeStr = utils.getTimeStr(updateTime, 'YYYY/MM/DD HH:mm') // utils.getTimeStr(updateTime, "yyyy-MM-dd")
      })

      if (res.content && res.content.length > 0) {
        // 构建车源管理器
        let carModelsInfo = this.data.carModelsInfo
        const isShowDownPrice = !(carModelsInfo.carModelName.includes('宝马') || carModelsInfo.carModelName.includes('奥迪') || carModelsInfo.carModelName.toLowerCase().includes('mini'))
        const quotedMethod: QuotedMethod = isShowDownPrice ? 'PRICE' : 'POINTS'
        carSourceManger = new CarSourceManager(carModelsInfo.officialPrice, quotedMethod)
        res.content.forEach((content, index) => {
          let newItemDetial = Object.assign({}, carSourceItem)
          carSourceManger.processCarSourceItem(newItemDetial, content.price)
          res.content[index].viewModelKUserQuoted = newItemDetial.viewModelQuoted
        })
      }
      this.setData({
        infoItem: res,
        comments: res.content
      })
      console.log('eliya-data', res.content)
    })
  },
  quotedMethod(brandName){
    const isShowDownPrice = !(brandName.includes('宝马') || brandName.includes('奥迪') || brandName.toLowerCase().includes('mini'))
    const quotedMethod: QuotedMethod = isShowDownPrice ? 'PRICE' : 'POINTS'
    carSourceManger.quotedMethod = quotedMethod
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
