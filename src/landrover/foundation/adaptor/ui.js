
import * as wxapi from 'fmt-wxapp-promise'
import $wuxToast from '../../../components/toast/toast'

export default class UI {

  showToast(title: string, duration?: number = 1800): Promise<void> {
    $wuxToast.show({
      type: false,
      timer: 2000,
      color: '#fff',
      text: title
    })
  }

  hideToast(): Promise<void> {

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
