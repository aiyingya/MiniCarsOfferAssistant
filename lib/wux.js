import Dialog from 'dialog/dialog'
import ReliableDialog from '../pages/carSources/reliableDialog/reliableDialog'
import NormalDialog from 'dialog/normalDialog'
import CarSourceDialog from '../pages/carSources/carSourceDetail/carSourceDetail'
import Toast from 'toast/toast'
import Track from 'track'

export default function(scope) {
  return {
    $wuxDialog    : new Dialog(scope).$wuxDialog,
    $wuxReliableDialog : new ReliableDialog(scope).$wuxReliableDialog,
    $wuxNormalDialog : new NormalDialog(scope).$wuxNormalDialog,
    $wuxCarSourceDetailDialog : new CarSourceDialog(scope).$wuxCarSourceDetailDialog,
    $wuxToast     : new Toast(scope).$wuxToast,
    $wuxTrack     : new Track(scope).$TrackPush
  }
}