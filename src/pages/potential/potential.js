import utils from '../../utils/util'
import { container } from '../../landrover/business/index'
Page({
  data: {
    potentialListData: []
  },
  onLoad: function () {
    let that = this
    let tenantId = container.userService.address.tenantId
    container.saasService.getPotentialData(
      tenantId
    ).then((res) => {
      console.log(res)
      if (res.length > 0) {
        for (let item of res) {
          let time = new Date(item.joinTime)
          let timeStr = `${time.getFullYear()}/${utils.makeUpZero(time.getMonth() + 1)}/${utils.makeUpZero(time.getDate())} ${utils.makeUpZero(time.getHours())}:${utils.makeUpZero(time.getMinutes())}`

          item.joinTimeStr = timeStr
        }
      }
      that.setData({
        potentialListData: res
      })
    }, (err) => {

    })
  }
})
