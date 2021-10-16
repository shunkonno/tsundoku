import useSWR from 'swr'

import fetcher from '../utils/fetcher'

export const useUserBookList = (uid) => {

  // ユーザーのブックリスト取得
  const { data: bookList } = useSWR(
    uid ? '/api/user/' + uid + '/booklist' : null,
    fetcher,
    {
      onErrorRetry: ({ retryCount }) => {
        // Retry up to 10 times
        if (retryCount >= 10) return
      }
    }
  )

  return bookList
}