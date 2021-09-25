// ============================================================
// Imports
// ===========================================================
import { Fragment, useEffect, useState } from 'react'
import Head from 'next/head'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import Image from 'next/image'
import debounce from 'lodash/debounce'
import { nanoid } from 'nanoid'

// Components
import { AppHeader } from '../components/Header'
import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'

// Assets
import { Dialog, Transition } from '@headlessui/react'
import { PlusSmIcon, SearchIcon, XIcon } from '@heroicons/react/solid'

// Functions
import { useAuth } from '../lib/auth'
import fetcher from '../utils/fetcher'
import uselocalesFilter from '../utils/translate'
import {
  updateBookList,
  addBook,
  fetchBookInfo,
  updateBookListCount,
  updateBookListWithoutISBN
} from '../lib/db'

//dummy
const books = [
  {
    bid: 1,
    title: 'ふああ',
    authors: ['稲船', '松延'],
    isbn: '',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    bid: 2,
    title: 'わわ',
    authors: ['棚川'],
    isbn: '',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    bid: 3,
    title: 'やや',
    authors: '',
    isbn: '',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
]

export default function BookList() {
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

  // ユーザー情報
  const { data: userInfo } = useSWR(
    user ? ['/api/user', user.token] : null,
    fetcher,
    {
      onErrorRetry: ({ retryCount }) => {
        // エラー時には、10回まではリトライする
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
        image: vi.imageLinks ? vi.imageLinks.smallThumbnail : ''
      }
    })

    console.log(items)
    setSearchedBooks(items)

    return items
  }

  const searchBooksDebounced = debounce(searchBooks, 300)

  // ============================================================
  // Button Handlers
  // ===========================================================

  const addBookToList = async (e, book) => {
    // 想定
    // ・ ISBNコードが存在する本のみ、追加することができる
    // ・ ISBN-13で本を管理することを想定している

    // 連携データ形式
    // book = {
    //   bid: 'XXX',
    //   title:'XXX',
    //   authors: ['X','Y'],
    //   isbn13: 'XXX',
    //   image: 'XXX'
    // }

    console.log(book)

    const date = new Date().toISOString()

    // ISBN-13があるならば、追加処理
    if (book.isbn13.length === 13) {
      // DB に本がすでに登録されている場合には、登録されている書籍情報が返却される
      // 未登録の場合には、null が返却される
      const bookInfo = await fetchBookInfo(book.isbn13)

      console.log(bookInfo)

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
        updatedBookList[updatedBookList.length] = { bid, date }

        // bookList を更新する
        updateBookList(user.uid, updatedBookList)
      } else {
        // すでにDBに存在する場合には、bookListCount に 1 を加算する
        // TODO: db-admin で increment を利用した実装に変更する
        var incrementBookListCount = bookInfo.bookListCount
        incrementBookListCount += 1

        // bookListCount を更新する
        updateBookListCount(bookInfo.bid, incrementBookListCount)

        // user collection の bookList array に、bid を追加する (bookInfo から取得)
        var updatedBookList = userInfo.bookList
        updatedBookList[updatedBookList.length] = { bid: bookInfo.bid, date }

        // bookList を更新する
        updateBookList(user.uid, updatedBookList)
      }
    } else {
      // ISBN-13がないなら、books collection には追加せず、user にのみ紐付ける
      var updatedBookListWithoutISBN = userInfo.bookListWithoutISBN
      updatedBookListWithoutISBN[updatedBookListWithoutISBN.length] = {
        bookInfo: book,
        date
      }

      updateBookListWithoutISBN(user.uid, updatedBookListWithoutISBN)
    }

    await router.push('/empty')
    await router.replace('/booklist')
  }

  // ============================================================
  // Render Function
  // ============================================================

  const renderSearchedBooks = (books) => {
    return (
      <div className="flow-root mt-6">
        <ul role="list" className="-my-5 divide-y divide-gray-200">
          {books.map((book) => (
            <li className="py-4" key={book.bid}>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Image
                    className="w-12 h-16"
                    width={90}
                    height={120}
                    src={
                      book.image
                        ? book.image
                        : '/img/placeholder/noimage_480x640.jpg'
                    }
                    alt={book.title}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {book.title}
                  </p>
                </div>
                <div>
                  <button
                    value={book}
                    className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                    onClick={(e) => {
                      addBookToList(e, book)
                    }}
                  >
                    追加
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

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
        <meta
          name="description"
          content="Tsundoku (積ん読・ツンドク) は他の誰かと読書する、ペア読書サービスです。集中した読書は自己研鑽だけでなく、リラックス効果もあります。"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Modal -- START */}
      <>
        <Transition appear show={modalOpen} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-10 overflow-y-scroll"
            onClose={() => setModalOpen(false)}
          >
            <div className="min-h-screen sm:px-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-gray-400 bg-opacity-50 transition-opacity" />
              </Transition.Child>

              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="relative inline-block w-full max-w-4xl h-80v p-6 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                  <div className="h-1/6">
                    <div className="flex justify-end h-1/5">
                      <XIcon
                        className="w-8 h-8 text-gray-500 hover:text-gray-600"
                        onClick={() => setModalOpen(false)}
                      />
                    </div>
                    <div className="flex flex-col justify-center h-4/5">
                      <div>
                        <Dialog.Title
                          as="h3"
                          className="text-xl font-medium leading-6 text-gray-900"
                        >
                          タイトル・著者名で検索
                        </Dialog.Title>
                        <div className="mt-2 ">
                          {/* book search component -- START */}
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
                          {/* book search component -- END */}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-5/6 overflow-y-auto">
                    {renderSearchedBooks(searchedBooks)}
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </>
      {/* Modal -- END */}

      <AppHeader />

      {/* main content */}
      <div className="relative pb-16 bg-gray-50 overflow-hidden">
        <div className="sm:block sm:h-full sm:w-full" aria-hidden="true">
          <main className="relative mx-auto max-w-7xl px-4 sm:py-4">
            <Navbar />

            <div>
              <div className="flex justify-between mt-12 py-5">
                <h1 className="title-section">ブックリスト</h1>
                <button
                  className="flex items-center"
                  onClick={() => setModalOpen(true)}
                >
                  <PlusSmIcon className="w-6 h-6 text-blue-500" />
                  <span className="text-blue-500 text-sm">本を追加する</span>
                </button>
              </div>

              <div>
                {
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {books.map((book) => (
                      <div
                        className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        key={book.bid}
                      >
                        <div className="flex-shrink-0">
                          <Image
                            className="h-10 w-10 rounded-full"
                            width={90}
                            height={120}
                            src={book.image}
                            alt=""
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <a href="#" className="focus:outline-none">
                            <span
                              className="absolute inset-0"
                              aria-hidden="true"
                            />
                            <p className="text-sm font-medium text-gray-900">
                              {book.title}
                            </p>
                            <div>著者</div>
                            {Array.isArray(book.authors) &&
                              book.authors.map((author) => {
                                return (
                                  <p
                                    className="text-sm text-gray-500 truncate"
                                    key={author}
                                  >
                                    {author}
                                  </p>
                                )
                              })}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </div>
            </div>
            {/* END - book search component */}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}
