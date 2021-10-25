// ============================================================
// Imports
// ===========================================================
import { useState } from 'react'
import Head from 'next/head'
import { useSWRConfig } from 'swr'
import { useRouter } from 'next/router'
import debounce from 'lodash/debounce'
import { nanoid } from 'nanoid'

// Components
import { AppHeader } from '../components/Header'
import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'
import { GeneralAlert } from '../components/Alert'
import { AddBookModal } from '../components/Modal'
import { IsReadingBookCard } from '../components/Card'
import { BooksGrid } from '../components/Books'

//Context
import { useUserInfo } from '../context/useUserInfo'
import { useUserBookList } from '../context/useUserBookList'
import { useAlertState } from '../context/AlertProvider'

// Assets
import { PlusSmIcon } from '@heroicons/react/solid'

// Functions
import { useAuth } from '../lib/auth'
import uselocalesFilter from '../utils/translate'
import {
  updateBookList,
  addBook,
  addBookWithoutISBN,
  fetchBookInfo,
  updateManualProgress,
  updateBookListCount,
  updateBookListWithoutISBN,
  updateIsReading,
  removeItemFromBookList,
  turnOnAutoProgress
} from '../lib/db'

export default function BookList() {
  // ============================================================
  // Contexts
  // ============================================================
  const { alertOpen, setAlertOpen, alertAssort, setAlertAssort } =
    useAlertState()

  // ============================================================
  // Initial State
  // ============================================================
  const [searchedBooks, setSearchedBooks] = useState([])
  let [modalOpen, setModalOpen] = useState(false)
  // ============================================================
  // Auth
  // ============================================================

  const auth = useAuth()
  const user = auth.user

  // ============================================================
  // Fetch Data
  // ============================================================

  // mutateを定義
  const { mutate } = useSWRConfig()

  // ユーザー情報
  const { userInfo, error } = useUserInfo()

  // ブックリスト
  const bookList = useUserBookList(userInfo?.uid)

  // ============================================================
  // Routing
  // ============================================================
  const router = useRouter()

  // Localization
  const { locale } = router
  const t = uselocalesFilter('booklist', locale)

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
      var isbn13 = vi.industryIdentifiers?.filter(
        (identifiers) => identifiers.type === 'ISBN_13'
      )

      return {
        title: vi.title ? vi.title : '',
        authors: vi.authors && vi.authors.length > 0 ? vi.authors : '',
        isbn13: isbn13 && isbn13.length > 0 ? isbn13[0].identifier : '',
        image: vi.imageLinks ? vi.imageLinks.smallThumbnail : '',
        pageCount: vi.pageCount ? vi.pageCount : ''
      }
    })

    setSearchedBooks(items)

    return items
  }

  const searchBooksDebounced = debounce(searchBooks, 300)

  // ============================================================
  // Button Handlers
  // ===========================================================

  const addBookToList = async (e, book) => {
    const date = new Date().toISOString()

    // ISBN-13があるならば、追加処理
    if (book.isbn13.length === 13) {
      // DB に本がすでに登録されている場合には、登録されている書籍情報が返却される
      // 未登録の場合には、null が返却される
      const bookInfo = await fetchBookInfo(book.isbn13)

      // 本が book collection に未登録ならば、bookListCount を 1 にしたうえで、追加する
      if (!bookInfo) {
        const bid = nanoid(10)

        // はじめて追加されるので、bid を設定する
        book.bid = bid

        // はじめて追加されるので、1 を設定する
        book.bookListCount = 1

        // DB に追加する
        addBook(bid, book)

        // user collection の bookList array に、新たに発行した bid を追加する
        // TODO: db-admin で arrayUnion() を利用した実装に変更する
        var updatedBookList = userInfo.bookList
        updatedBookList[updatedBookList.length] = {
          bid,
          date,
          totalReadTime: 0,
          autoProgress: true
        }

        // bookList を更新する
        await updateBookList(user.uid, updatedBookList)
      } else {
        // すでにDBに存在する場合には、bookListCount に 1 を加算する
        // TODO: db-admin で increment を利用した実装に変更する
        var incrementBookListCount = bookInfo.bookListCount
        incrementBookListCount += 1

        // bookListCount を更新する
        updateBookListCount(bookInfo.bid, incrementBookListCount)

        // user collection の bookList array に、bid を追加する (bookInfo から取得)
        var updatedBookList = userInfo.bookList
        updatedBookList[updatedBookList.length] = {
          bid: bookInfo.bid,
          date,
          totalReadTime: 0,
          autoProgress: true
        }

        // bookList を更新する
        await updateBookList(user.uid, updatedBookList)
      }

      setAlertAssort('updateBookList')

      // 画面をリフレッシュ
      mutate('/api/user/' + user.uid + '/booklist')
    } else {
      // ISBN-13がないなら、books collection には追加しない
      const bid = nanoid(10)

      // bid を設定する
      book.bid = bid

      // booksWithoutISBN collection に追加する
      addBookWithoutISBN(bid, book)

      var updatedBookListWithoutISBN = userInfo.bookListWithoutISBN
      updatedBookListWithoutISBN[updatedBookListWithoutISBN.length] = {
        bid,
        date,
        totalReadTime: 0,
        autoProgress: true
      }

      // bookListWithoutISBN を更新する
      await updateBookListWithoutISBN(user.uid, updatedBookListWithoutISBN)

      setAlertAssort('updateBookList')

      // 画面をリフレッシュ
      mutate('/api/user/' + user.uid + '/booklist')
    }
  }

  const removeBookFromList = async (e, bid) => {
    e.preventDefault()

    //削除する本がisReadingだったら現在読んでいる本を空にする
    if (bid == userInfo.isReading) {
      await updateIsReading(user.uid, '')
      mutate(['/api/user', user.token])
    }

    // 特定の bid の書籍をリストから削除
    await removeItemFromBookList(user.uid, bid)

    // 画面をリフレッシュ
    mutate('/api/user/' + user.uid + '/booklist')
  }

  

  // ============================================================
  // Return
  // ============================================================
  if (user === null || !userInfo) {
    return <div>Waiting..</div>
  }

  if (typeof window !== "undefined") {
    // windowを使う処理を記述
    if(error?.status === 500){
      window.location.reload()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Head>
        <title>Tsundoku | ブックリスト</title>
        <meta
          name="description"
          content="Tsundoku (積ん読・ツンドク) は他の誰かと読書する、ペア読書サービスです。集中した読書は自己研鑽だけでなく、リラックス効果もあります。"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <GeneralAlert
        alertOpen={alertOpen}
        alertAssort={alertAssort}
        setAlertOpen={setAlertOpen}
        setAlertAssort={setAlertAssort}
      />

      <AddBookModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        searchBooksDebounced={searchBooksDebounced}
        addBookToList={addBookToList}
        searchedBooks={searchedBooks}
      />

      <AppHeader />

      {/* main content */}
      <div className="relative flex-1 pb-16 bg-gray-50">
        <div className="sm:block sm:w-full sm:h-full" aria-hidden="true">
          <main className="relative sm:py-4 px-4 mx-auto max-w-7xl">
            <Navbar />

            <div className="mb-24">
              <div className="mt-6 sm:mt-12">
                <h1 className="subtitle-section">いま読んでいる本</h1>
                <IsReadingBookCard />
              </div>

              <div className="flex justify-between py-5 mt-6 sm:mt-12">
                <h1 className="title-section">ブックリスト</h1>
                <button
                  className="flex items-center"
                  onClick={() => setModalOpen(true)}
                >
                  <PlusSmIcon className="w-6 h-6 text-blue-500" />
                  <span className="text-sm text-blue-500">
                    リストに追加する
                  </span>
                </button>
              </div>

              <div>
                  <BooksGrid removeBookFromList={removeBookFromList}/>
              </div>
            </div>
            {/* END - book search component */}
          </main>
        </div>
      </div>

      <Footer />

      {/* スマホ時、コンテンツとNavbarが重なるのを防ぐ */}
      <div className="sm:hidden h-16 bg-gray" />
    </div>
  )
}
