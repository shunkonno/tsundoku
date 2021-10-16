import useSWR from 'swr'

import fetcher from '../utils/fetcher'

export const useOneUserInfo = (uid) => {

  // ユーザー情報
  const { data: oneUserInfo } = useSWR(
    uid ? '/api/user/' + uid + '/info' : null,
    fetcher,
    {
      onErrorRetry: ({ retryCount }) => {
        // エラー時には、10回まではリトライする
        if (retryCount >= 10) return
      }
    }
  )

  return oneUserInfo
}