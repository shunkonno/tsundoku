export const useIsReadingBook = (bookList, isReading) => {

  const isReadingBook = bookList?.find((book) => {
    return book.bookInfo.bid == isReading
  })

  return isReadingBook
}