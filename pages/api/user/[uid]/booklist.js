import {
  fetchUser,
  fetchOneBook,
  fetchOneBookWithoutISBN
} from '../../../../lib/db-admin'

// INPUT: uid
// OUTPUT: ユーザーのブックリストをもとに、各書籍の詳細情報を返却

const booklistApiHandler = async (req, res) => {
  try {
    // user collection からデータ取得
    const userInfo = await fetchUser(req.query.uid)

    // bookList を抽出
    const bookList = userInfo.bookList
    const bookListWithoutISBN = userInfo.bookListWithoutISBN

    // 空のリストを作成
    const bookListDetail = []

    // bookList の書籍詳細を取得し、リストに追加
    if (bookList.length > 0) {
      for (const item of bookList) {
        const bookInfo = await fetchOneBook(item.bid)
        bookListDetail.push({ bookInfo: bookInfo, date: item.date })
      }
    }

    // ISBN のない本の情報をリストに追加
    if (bookListWithoutISBN.length > 0) {
      for (const item of bookListWithoutISBN) {
        const bookInfo = await fetchOneBookWithoutISBN(item.bid)
        bookListDetail.push({ bookInfo: bookInfo, date: item.date })
      }
    }

    // ISBN の有無を問わず、リスト追加日順に並び替え
    bookListDetail.sort((a, b) => {
      return a.date - b.date
    })

    res.status(200).json(bookListDetail)
  } catch (error) {
    res.status(500).json({ error })
  }
}

export default booklistApiHandler
