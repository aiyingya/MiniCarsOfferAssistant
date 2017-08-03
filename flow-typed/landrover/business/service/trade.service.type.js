declare type SearchResult = {
  content: string,
  extra: SearchResultExtra,
  id: string,
  type: 'CAR_SERIES' | 'CAR_BRAND'
};

declare type SearchResultExtra = {
  seriesName: string,
  brandId: string,
  content: string,
  seriesId: string
};

declare type HotCarModel = {
  id: string,
  name: string,
  salePrice: number,
  guidePrice: number,
  description: string,
  phoneNumber: string,
  imgUrl: string
};

declare type HotCarBrand = {
  id: number,
  name: string,
  logoUrl: string
};

declare type CarBrand = {
  id: number,
  name: string,
  firstLetter: string,
  logoUrl: string,
  onSaleCount: number
};

declare type CarGroup = {
  name: string,
  title: string,
  key: string,
  slide: string,
  displayOrder: number,
  items: Array<CarBrand> | Array<CarModel>
};

declare type CarModel = {
  id: number,
  name: string,
  imgUrl: string,
  onSaleCount: number,
  parentId: number,
  brandId: number,
  brandName: string,
  brandDisplayOrder: number
};
