import util from '../../utils/util'
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
          let timeStr = `${time.getFullYear()}/${util.makeUpZero(time.getMonth() + 1)}/${util.makeUpZero(time.getDate())} ${util.makeUpZero(time.getHours())}:${util.makeUpZero(time.getMinutes())}`

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
