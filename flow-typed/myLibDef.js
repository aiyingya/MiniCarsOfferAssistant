declare type ChartDataItem = {
  data: Array<string | number | null>,
  color: string | null,
  name: string | null,
  topno?: number | null,
  switch?: boolean,
  companyCount?: Array<number | null>,
  days: number | null
};

declare type PaginationList<T> = {
  list: Array<T> | null,
  pagination: Pagination<T> | null,
  loadingMore: boolean
};


declare type CarSPUForQuotation = {
  officialPrice: number,
  carModelName: string,
  capacity: number,
  isElectricCar: boolean,
  pic?: string,
  lowestPriceSku?: CarSKUForQuotation
};

declare type CarSKUForQuotation = {
  externalColorName: string,
  internalColorName: string,
  showPrice: number,
  supplierSelfSupport: boolean,
  skuId?: string,
  officialPrice?: number,
  skuPic?: string,
  metallicPaintAmount?: number,
};
