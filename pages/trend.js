// ============================================================
// Imports
// ===========================================================
import Head from 'next/head'
import { useRouter } from 'next/router'
import useSWR from 'swr'

// Components
import { AppHeader } from '../components/Header'
import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'

// Functions
import { useAuth } from '../lib/auth'
import fetcher from '../utils/fetcher'
import uselocalesFilter from '../utils/translate'

export default function Trend() {
  // ============================================================
  // Auth
  // ============================================================

  const auth = useAuth()
  const user = auth.user

  // ============================================================
  // Fetch Data
  // ============================================================

  // Fetch logged user info on client side
  const { data: userInfo } = useSWR(
    user ? ['/api/user', user.token] : null,
    fetcher,
    {
      onErrorRetry: ({ retryCount }) => {
        // Retry up to 10 times
        if (retryCount >= 10) return
      }
    }
  )
  // ============================================================
  // Routing
  // ============================================================
  const router = useRouter()

  // ============================================================
  // Localization
  // ============================================================
  const { locale } = router
  const t = uselocalesFilter('trend', locale)

  // ============================================================
  // Return
  // ============================================================
  if (user === null || !userInfo || !sessions) {
    return <div>Waiting..</div>
  }

  return (
    <div>
      <Head>
        <title>Tsundoku | 人気の本</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppHeader />

      {/* main content */}
      <div className="relative pb-16 bg-gray-50 overflow-hidden">
        <div className="sm:block sm:h-full sm:w-full" aria-hidden="true">
          <main className="relative mx-auto max-w-7xl px-4 sm:py-4">
            <Navbar />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}
