import { fetchUser, fetchOneBook } from '../../../../lib/db-admin'

const booklistApiHandler = async (req, res) => {
  try {
    const userInfo = await fetchUser(req.query.uid)

    const bookList = userInfo.bookList

    const bookListDetail = []

    for (const item of bookList) {
      const bookInfo = await fetchOneBook(item.bid)
      bookListDetail.push(bookInfo)
    }

    res.status(200).json(bookListDetail)
  } catch (error) {
    res.status(500).json({ error })
  }
}

export default booklistApiHandler
