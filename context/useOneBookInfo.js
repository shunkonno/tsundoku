import useSWR from 'swr'

import fetcher from '../utils/fetcher'

export const useOneBookInfo = (bid) => {
  // ユーザー情報
  const { data: oneBookInfo } = useSWR(
    bid ? '/api/book/' + bid : null,
    fetcher,
    {
      onErrorRetry: ({ retryCount }) => {
        // エラー時には、10回まではリトライする
        if (retryCount >= 10) return
      }
    }
  )

  return oneBookInfo
}
