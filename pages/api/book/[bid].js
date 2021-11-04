import { fetchOneBook, fetchOneBookWithoutISBN } from '../../../lib/db-admin'

// INPUT: bid (book id)
// OUTPUT: 特定の bid の書籍情報

const bookApiHandler = async (req, res) => {
  try {
    var book = await fetchOneBook(req.query.bid)

    // 返却値が undefined の場合は、ISBN のない書籍として再検索
    if (book === undefined) {
      book = await fetchOneBookWithoutISBN(req.query.bid)
    }

    res.status(200).json(book)
  } catch (error) {
    res.status(500).json({ error })
  }
}

export default bookApiHandler
