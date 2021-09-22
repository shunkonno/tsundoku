// ============================================================
// Imports
// ===========================================================
import Head from 'next/head'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import debounce from 'lodash/debounce'

// Components
import { AppHeader } from '../components/Header'
import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'

// Assets
import { SearchIcon } from '@heroicons/react/solid'

// Functions
import { useAuth } from '../lib/auth'
import fetcher from '../utils/fetcher'
import uselocalesFilter from '../utils/translate'

export default function BookList() {
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
  // Google Books API
  // ============================================================

  const searchBooks = async (searchKeyword) => {
    // Google Books APIs のエンドポイント
    var endpoint = 'https://www.googleapis.com/books/v1'

    // 検索 API を叩く
    var res = await fetch(endpoint + '/volumes?q=' + searchKeyword)

    // JSON に変換
    var data = await res.json()

    // 必要なものだけ抽出
    var items = data.items.map((item) => {
      var vi = item.volumeInfo

      // ISBN13 を抽出
      var isbn13 = vi.industryIdentifiers.filter(
        (identifiers) => identifiers.type === 'ISBN_13'
      )

      return {
        title: vi.title,
        authors: vi.authors,
        isbn13: isbn13.length > 0 ? isbn13[0].identifier : '',
        image: vi.imageLinks ? vi.imageLinks.smallThumbnail : ''
      }
    })

    console.log(items)
    return items
  }

  const searchBooksDebounced = debounce(searchBooks, 300)

  // ============================================================
  // Routing
  // ============================================================
  const router = useRouter()

  // ============================================================
  // Localization
  // ============================================================
  const { locale } = router
  const t = uselocalesFilter('booklist', locale)

  // ============================================================
  // Return
  // ============================================================
  if (user === null || !userInfo) {
    return <div>Waiting..</div>
  }

  return (
    <div>
      <Head>
        <title>Tsundoku | ブックリスト</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppHeader />

      {/* main content */}
      <div className="relative pb-16 bg-gray-50 overflow-hidden">
        <div className="sm:block sm:h-full sm:w-full" aria-hidden="true">
          <main className="relative mx-auto max-w-7xl px-4 sm:py-4">
            <Navbar />

            {/* book search component */}
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="ここに入力"
                onInput={(input) =>
                  input.target.value.length > 1
                    ? searchBooksDebounced(input.target.value)
                    : null
                }
              />
            </div>

            {/* END - book search component */}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}
