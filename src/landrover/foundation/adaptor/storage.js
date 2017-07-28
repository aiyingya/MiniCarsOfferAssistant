// @flow
import * as wxapi from 'fmt-wxapp-promise'

export default class Storage implements StorageVirtualClass {

  setItem(key: string, value: string | number | {[string]: any}): Promise<void> {
    return wxapi.setStorage(key, value)
  }

  setItemSync(key: string, value: string | number | {[string]: any}): boolean {
    try {
      wx.setStorageSync(key, value)
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  getItem(key: string): Promise<any> {
    return wxapi.getStorage(key)
  }

  getItemSync(key: string): ?any {
    try {
      return wx.getStorageSync(key)
    } catch (e) {
      console.error(e)
      return null
    }
  }

  removeItem(key: string): Promise<void> {
    return wxapi.removeItem(key)
  }

  removeItemSync(key: string): boolean {
    try {
      wx.removeStorageSync(key)
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  clear(): Promise<void> {
    return wxapi.clearStorage()
  }

  clearSync(): boolean {
    try {
      wx.clearStorageSync()
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }
}
