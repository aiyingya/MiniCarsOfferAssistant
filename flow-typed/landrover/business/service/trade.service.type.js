declare type ExtraType1 = {
  brandId: string,
  content: string,
  seriesId: string,
  seriesName: string
};

declare type ExtraType2 = {
  brandId: string,
  content: string,
  seriesName: string
};

declare type SearchResult = {
  content: string,
  extra: ExtraType1 | ExtraType2,
  id: string,
  type: 'CAR_SERIES' | 'CAR_SPU'
}
