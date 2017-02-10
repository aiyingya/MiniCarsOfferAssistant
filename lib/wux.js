import Dialog from 'dialog/dialog'
import Toast from 'toast/toast'

export default function(scope) {
  return {
    $wuxDialog    : new Dialog(scope).$wuxDialog,
    $wuxToast     : new Toast(scope).$wuxToast
  }
}