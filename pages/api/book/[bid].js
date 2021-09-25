import { fetchOneBook } from '../../../lib/db-admin'

// INPUT: bid (book id)
// OUTPUT: 特定の bid の書籍情報

const bookApiHandler = async (req, res) => {
  try {
    const book = await fetchOneBook(req.query.bid)
    res.status(200).json(book)
  } catch (error) {
    res.status(500).json({ error })
  }
}

export default bookApiHandler
