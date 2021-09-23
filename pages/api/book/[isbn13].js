import { fetchOneBook } from '../../../lib/db-admin'

const bookApiHandler = async (req, res) => {
  try {
    const book = await fetchOneBook(req.query.isbn13)
    res.status(200).json(book)
  } catch (error) {
    res.status(500).json({ error })
  }
}

export default bookApiHandler
