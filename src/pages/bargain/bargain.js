import {
  $bargainCancelDialog,
  $wuxToast
} from "../../components/wux"

import { container } from '../../landrover/business/index'

Page({
  data: {
    /**
     * tab 切换.
     */
    tabmenu: {
      menu: [
        { text: '活动进行中', active: 'active' },
        { text: '已核销活动', active: '' }
      ],
      lineActive: 'active_left'
    },
    /**
     * 砍价列表.
     */
    bargainListData: [],
    /**
     * 用户信息.
     */
    userAuth: {}
  },
  onLoad: function () {
    console.log(container.userService)
    this.getBargainData('running')
  },
  /**
   * 获取列表信息.
   */
  getBargainData(type) {
    let that = this
    let tenantId = container.userService.address.tenantId
    let manager = container.userService.role.roleInfo.tenants[0].manager
    let userId = container.userService.auth.userId
    console.log(container.userService)
    function makeUpZero(s) {
      return s < 10 ? `0${s}` : s;
    }

    container.saasService.getBargainData(
      tenantId,
      userId,
      type,
      manager
    )
      .then((res) => {
        if (res.length > 0) {
          for (let item of res) {
            let time = new Date(item.participateTime)
            let timeStr = `${makeUpZero(time.getMonth() + 1)}/${makeUpZero(time.getDate())} ${makeUpZero(time.getHours())}:${makeUpZero(time.getMinutes())}`
            let usedTime = ''
            let usedTimeStr = ''
            if (item.usedTime) {
              usedTime = new Date(item.usedTime)
              usedTimeStr = `${usedTime.getFullYear()}/${makeUpZero(usedTime.getMonth() + 1)}/${makeUpZero(usedTime.getDate())} ${makeUpZero(usedTime.getHours())}:${makeUpZero(usedTime.getMinutes())}`
            }
            item.participateTimeStr = timeStr
            item.usedTimeStr = usedTimeStr
            item.overStyle = ''
            item.cancelStyle = ''
            if (item.participateStatus === 'joined' || item.participateStatus === 'full') {
              item.overStyle = 'btn-active'
            } else if (item.participateStatus === 'completed') {
              item.cancelStyle = 'btn-active'
            }
          }
          console.log(res)
        }
        that.setData({
          bargainListData: res
        })
      })
      .catch(err => {

      })
  },
  /**
   * tab 切换.
   */
  handleTabmenu(e) {

    let tabmenu = e.currentTarget.dataset.tabmenu
    let tabmenuData = this.data.tabmenu.menu
    let lineActive = 'active_left'
    for (let item of tabmenuData) {
      item.active = ''
      if (tabmenu.text === item.text) {
        item.active = 'active'
      }
    }
    if (tabmenu.text === '已核销活动') {
      lineActive = 'active_right'
      this.getBargainData('used')
    } else {
      lineActive = 'active_left'
      this.getBargainData('running')
    }
    this.setData({
      'tabmenu.menu': tabmenuData,
      'tabmenu.lineActive': lineActive
    })
  },
  /**
   * 结束活动.
   */
  handleFinishActivity(e) {
    let that = this
    const ativity = e.currentTarget.dataset.activity
    const ativityId = ativity.participantId

    if (ativity.overStyle == '') { return }

    wx.showModal({
      title: '结束该活动？',
      content: '确认要结束该活动，结束后客户将无法继续砍价，并且获得优惠码',
      confirmColor: '#ED4149',
      confirmText: '确认',
      success: function (res) {
        if (res.confirm) {
          that.finishActivity(ativityId)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  finishActivity(id) {
    let that = this
    let tenantId = container.userService.address.tenantId
    let bargainListData = this.data.bargainListData
    if (id) {
      container.saasService.finishActivity({
        data: {
          activityId: id,
          targetId: tenantId
        }
      })
        .then((res) => {
          if (res.success) {
            for (let item of bargainListData) {
              if (id === item.participantId) {
                item.overStyle = ''
                item.cancelStyle = 'btn-active'
              }
            }
            that.setData({
              bargainListData: bargainListData
            })
          } else {
            $wuxToast.show({
              type: 'text',
              timer: 2000,
              color: '#fff',
              text: res.message
            })
            return
          }
        })
        .catch(err => {

        })
    }
  },
  /**
   * 核销优惠券.
   */
  handleCancelCoupon(e) {
    let that = this
    const ativity = e.currentTarget.dataset.activity

    if (ativity.cancelStyle == '') { return }
    $bargainCancelDialog.open({
      title: '核销优惠券！',
      content: '核销优惠码后，该用户将无法继续发起新的砍价活动',
      inputNumberPlaceholder: '输入用户优惠码',
      confirmText: '确认',
      cancelText: '取消',
      validate: (e) => {
        if (e.detail.value) {
          return true
        } else {
          return false
        }
      },
      confirm: (value) => {
        that.cancelCoupon(value, ativity.participantId)
      },
      cancel: () => {

      }
    })
  },
  cancelCoupon(val, id) {
    let that = this
    let bargainListData = this.data.bargainListData
    let newBargainListData = []
    if (val) {
      container.saasService.cancelCoupon(
        val
      )
        .then((res) => {
          if (res.success) {
            for (let item of bargainListData) {
              if (item.participantId !== id) {
                newBargainListData.push(item)
              }
            }
            that.setData({
              bargainListData: newBargainListData
            })
          } else {
            $wuxToast.show({
              type: 'text',
              timer: 2000,
              color: '#fff',
              text: res.message
            })
            return
          }
        })
        .catch(err => {

        })
    }
  }
})
