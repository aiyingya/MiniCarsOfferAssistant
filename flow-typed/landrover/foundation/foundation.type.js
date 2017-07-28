declare interface StorageVirtualClass {

  setItem(key: string, value: string | number | {[string]: any}): Promise<void>,
  setItemSync(key: string, value: string | number | {[string]: any}): boolean,

  getItem(key: string): Promise<any>,
  getItemSync(key: string): ?any,

  removeItem(key: string): Promise<void>,
  removeItemSync(key: string): boolean,

  clear(): Promise<void>,
  clearSync(): boolean,

}

declare interface RequestVirtualClass {

  request(url: string, method: RequestMethod, data: {[string]: any}, header: {[string]: string},): Promise<any>

}
