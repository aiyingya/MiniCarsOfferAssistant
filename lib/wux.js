import Dialog from 'dialog/dialog'

export default function(scope) {
  return {
    $wuxDialog: new Dialog(scope).$wuxDialog,
  }
}