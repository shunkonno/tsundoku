import useSWR from 'swr'

import { useAuth } from '../lib/auth'
import fetcher from '../utils/fetcher'

export const useUserInfo = () => {

  const auth = useAuth()
  const user = auth.user

  // ユーザー情報
  const { data: userInfo, error } = useSWR(
    user ? ['/api/user', user.token] : null,
    fetcher,
    {
      onErrorRetry: ({ retryCount }) => {
        // Retry up to 10 times
        if (retryCount >= 10) return
      }
    }
  )

  return { userInfo, error }
}