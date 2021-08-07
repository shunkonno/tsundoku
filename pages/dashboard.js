// ============================================================
// Imports
// ============================================================
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import useSWR from 'swr'

// Components
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

// Functions
import uselocalesFilter from '../utils/translate'
import { useAuth } from '../lib/auth'
import fetcher from '../utils/fetcher'

// ============================================================
// Helper Functions
// ============================================================
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Dashboard() {
  // ============================================================
  // Initialize
  // ============================================================

  // Auth
  const auth = useAuth()
  const user = auth.user

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

  console.log(userInfo)
  console.log(user)

  // Routing
  const router = useRouter()

  console.log(router.query.welcome)

  useEffect(() => {
    if (user === false) {
      // If the access isn't authenticated, redirect to index page
      router.push('/')
    } else if (
      userInfo &&
      !('name' in userInfo) &&
      router.query.welcome !== 'true'
    ) {
      // If the user signed in for the first time, they won't have a username
      // Redirect user to onboarding process, as long as the welcome parameter is not set to true
      // The welcome parameter is set to true when the user submits form in onboarding process
      router.push('/settings/new')
    }
  })

  // Set locale
  const { locale } = useRouter()
  const t = uselocalesFilter('dashboard', locale)

  // ============================================================
  // Return Page
  // ============================================================
  if (user === null || !userInfo) {
    return <div>Waiting..</div>
  }

  return (
    <div>
      <Head>
        <title>DASHBOARD</title>
        <meta
          name="description"
          content="一緒に読書してくれる誰かを探すためのマッチングサービス"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      {/* main content */}
      <div className="relative pb-16 bg-gray-50 overflow-hidden">
        <div className="sm:block sm:h-full sm:w-full" aria-hidden="true">
          <main className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24">
            <div className="py-3">
              <div className="bg-tsundoku-blue-light px-6 py-4">
                <div className="text-center mb-12">
                  Hi {userInfo?.name}, Let's Read.
                </div>
                <div className="flex justify-center mb-4">
                  <button
                    type="button"
                    className="block w-full px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-tsundoku-blue-main hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tsundoku-blue-main"
                  >
                    Start Session
                  </button>
                </div>
                <div className="text-center text-sm">
                  Last Session : (user.lastsessiondate)
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}
