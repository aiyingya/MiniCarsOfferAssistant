
import * as wxapi from 'fmt-wxapp-promise'

export default class UI {

  showToast(title: string, duration?: number = 1500): Promise<void> {
    const mask = false
    return wxapi.showToast({
      title,
      duration
    })
  }

  hideToast(): Promise<void> {
    return wxapi.hideToast()
  }

  showLoading(title: string): Promise<void> {
    const mask = false
    return wxapi.showLoading({ title, mask })
  }

  hideLoading(): Promise<void> {
    return wxapi.hideLoading()
  }

  showModal(title: string, content: string, showCancel?: boolean = true, cancelText?: string = '取消', confirmText?: string = '确认'): Promise<{confirm: boolean, cancel: boolean}> {
    const cancelColor = '#000000'
    const confirmColor = '#3CC51F'
    return wxapi.showModal({
      title,
      content,
      showCancel,
      cancelText,
      cancelColor,
      confirmText,
      confirmColor
    })
  }

}
