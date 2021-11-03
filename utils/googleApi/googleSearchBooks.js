const googleSearchBooks = async (searchKeyword) => {
  // Google Books APIs のエンドポイント
  var endpoint = 'https://www.googleapis.com/books/v1'

  // 検索 API を叩く
  var res = await fetch(endpoint + '/volumes?q=' + searchKeyword)

  // JSON に変換
  var data = await res.json()

  // 必要なものだけ抽出
  var items = data.items.map((item) => {
    var vi = item.volumeInfo

    // ISBN13 を抽出
    var isbn13 = vi.industryIdentifiers?.filter(
      (identifiers) => identifiers.type === 'ISBN_13'
    )

    return {
      title: vi.title ? vi.title : '',
      authors: vi.authors && vi.authors.length > 0 ? vi.authors : '',
      isbn13: isbn13 && isbn13.length > 0 ? isbn13[0].identifier : '',
      image: vi.imageLinks ? vi.imageLinks.smallThumbnail : '',
      pageCount: vi.pageCount ? vi.pageCount : ''
    }
  })

  return items
}

export default googleSearchBooks