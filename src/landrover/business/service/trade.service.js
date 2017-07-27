import Service from './base.service'

export default class TradeService extends Service {

  /**
   *
   *
   * @param {string} searchText
   * @param {number} n
   * @returns {Promise<Array<SearchResult>>}
   * @memberof TradeService
   */
  retrieveSearchResult(
    searchText: string,
    n: number
  ): Promise<Array<SearchResult>> {
    const text = searchText
    return this.request(
      'cgi/search/car/index',
      'GET',
      {
        text,
        n
      }
    )
  }

}
