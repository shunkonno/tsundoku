import { isbn } from 'simple-isbn'

export const returnAmazonLink = (isbn13) => {
  // ISBN-13 を ISBN-10 に加工する
  const isValid = isbn.isValidIsbn13(isbn13)

  if (isValid) {
    const isbn10 = isbn.toIsbn10(isbn13)
    return 'https://www.amazon.co.jp/dp/' + isbn10
  } else {
    return '#'
  }
}
