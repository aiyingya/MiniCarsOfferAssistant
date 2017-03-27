/**
 * Created by David on 27/03/2017.
 */
// /**
//  * 关注一个供应商
//  * @param e
//  */
// handlerFollow(e) {
//   const that = this
//
//   const skuIndex = e.currentTarget.dataset.skuIndex
//   const carSourceIndex = e.currentTarget.dataset.carSourceIndex
//   const carSource = e.currentTarget.dataset.carSource
//   const supplier = e.currentTarget.dataset.supplier
//
//   this.requestFocusOrNotASupplier(supplier.id, !supplier.hasFocused, {
//     success: function (res) {
//       supplier.hasFocused = !supplier.hasFocused
//       carSource.supplier = supplier
//       that.updateTheCarSource(skuIndex, carSourceIndex, carSource)
//     },
//     fail: function () {
//
//     },
//     complete: function () {
//
//     }
//   })
// },
