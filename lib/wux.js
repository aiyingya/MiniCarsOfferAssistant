import Dialog from 'dialog/dialog'
import Toast from 'toast/toast'
import Track from 'track'

export default function(scope) {
  return {
    $wuxDialog    : new Dialog(scope).$wuxDialog,
    $wuxToast     : new Toast(scope).$wuxToast,
    $wuxTrack     : new Track(scope).$TrackPush
  }
}