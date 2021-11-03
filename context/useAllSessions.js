import useSWR from 'swr'
import { useAuth } from '../lib/auth'
import fetcher from '../utils/fetcher'

export const useAllSessions = () => {
  // Auth
  const auth = useAuth()
  const user = auth.user

  const { data: sessions } = useSWR(user ? '/api/session' : null, fetcher, {
    onErrorRetry: ({ retryCount }) => {
      // Retry up to 10 times
      if (retryCount >= 10) return
    }
  })

  return sessions
}