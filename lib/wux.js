import Dialog from 'dialog/dialog'
import ReliableDialog from 'dialog/reliableDialog'
import Toast from 'toast/toast'
import Track from 'track'

export default function(scope) {
  return {
    $wuxDialog    : new Dialog(scope).$wuxDialog,
    $wuxReliableDialog : new ReliableDialog(scope).$wuxReliableDialog,
    $wuxToast     : new Toast(scope).$wuxToast,
    $wuxTrack     : new Track(scope).$TrackPush
  }
}