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
import { Dialog, Menu, Transition } from '@headlessui/react'
import {
  PlusSmIcon,
  SearchIcon,
  XIcon,
  DotsVerticalIcon
} from '@heroicons/react/solid'
import { TrashIcon } from '@heroicons/react/outline'

// Functions
import { useAuth } from '../lib/auth'
import fetcher from '../utils/fetcher'
import uselocalesFilter from '../utils/translate'
import {
  updateBookList,
  addBook,
  addBookWithoutISBN,
  fetchBookInfo,
  updateBookListCount,
  updateBookListWithoutISBN
} from '../lib/db'
import { formatISOStringToDateTimeWithSlash } from '../utils/formatDateTime'

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

  // ブックリスト
  const { data: bookList } = useSWR(
    user ? '/api/user/' + user.uid + '/booklist' : null,
    fetcher,
    {
      onErrorRetry: ({ retryCount }) => {
        // Retry up to 10 times
        if (retryCount >= 10) return
      }
    }
  )
  console.log('bookList: ', bookList)

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
      // ISBN-13がないなら、books collection には追加しない
      const bid = nanoid(10)

      // bid を設定する
      book.bid = bid

      // booksWithoutISBN collection に追加する
      addBookWithoutISBN(bid, book)

      var updatedBookListWithoutISBN = userInfo.bookListWithoutISBN
      updatedBookListWithoutISBN[updatedBookListWithoutISBN.length] = {
        bid,
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
                    className="inline-flex items-center shadow-sm px-3 py-1 border border-blue-600 text-base leading-5 font-medium rounded-full text-blue-600 bg-white hover:border-blue-500 hover:bg-blue-500 hover:text-white"
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
                              className="focus:ring-tsundoku-blue-main focus:border-tsundoku-blue-main block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
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

            <div className="mb-24">
              <div className="flex justify-between sm:mt-12 py-5">
                <h1 className="title-section">ブックリスト</h1>
                <button
                  className="flex items-center"
                  onClick={() => setModalOpen(true)}
                >
                  <PlusSmIcon className="w-6 h-6 text-blue-500" />
                  <span className="text-blue-500 text-sm">
                    リストに追加する
                  </span>
                </button>
              </div>

              <div>
                {
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    {bookList?.map(({ bookInfo, date }) => (
                      <div
                        className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex space-x-6 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-tsundoku-blue-main"
                        key={bookInfo.bid}
                      >
                        <div className="flex-shrink-0">
                          <Image
                            className="h-full w-6"
                            width={90}
                            height={120}
                            src={bookInfo.image}
                            alt=""
                          />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex flex-col justify-between h-full">
                            <div className="focus:outline-none">
                              <p className="text-lg font-medium text-gray-900">
                                {bookInfo.title}
                              </p>
                              {Array.isArray(bookInfo.authors) &&
                                bookInfo.authors.map((author) => {
                                  return (
                                    <p
                                      className="text-sm text-gray-500 truncate"
                                      key={author}
                                    >
                                      {author}
                                    </p>
                                  )
                                })}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {formatISOStringToDateTimeWithSlash(date)} 追加
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex flex-col justify-between items-end">
                          <div className="text-rights">
                            <Menu as="div" className="relative inline-block">
                              <div>
                                <Menu.Button className="inline-flex">
                                  <DotsVerticalIcon className="w-8 h-8 text-gray-500 hover:bg-gray-100 p-1 rounded-full" />
                                </Menu.Button>
                              </div>
                              <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                              >
                                <Menu.Items className="absolute right-0 w-40 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                  <div className="px-1 py-1">
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          className={`${
                                            active ? 'bg-gray-100' : ''
                                          } group flex rounded-md text-red-500 items-center w-full px-2 py-2 text-sm text-right`}
                                        >
                                          <TrashIcon
                                            className="w-5 h-5 mr-2 text-red-500"
                                            aria-hidden="true"
                                          />
                                          リストから削除
                                        </button>
                                      )}
                                    </Menu.Item>
                                  </div>
                                </Menu.Items>
                              </Transition>
                            </Menu>
                          </div>
                          <div>
                            <Menu as="div" className="relative inline-block">
                              <div>
                                <Menu.Button className="inline-flex">
                                  <div className=" text-blue-500 hover:text-blue-400 text-lg rounded-lg">
                                    進捗
                                  </div>
                                </Menu.Button>
                              </div>
                              <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                              >
                                <Menu.Items className="absolute right-0 w-48 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                                  <div className="px-1 py-1">
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          className={`${
                                            active ? 'bg-gray-100' : ''
                                          } group flex rounded-md text-gray-900 items-center w-full px-2 py-2 text-sm text-right`}
                                        >
                                          <span
                                            className="w-5 h-5 mr-2 inline-block bg-tsundoku-blue-main rounded-full"
                                            aria-hidden="true"
                                          />
                                          完全に読んだ
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          className={`${
                                            active ? 'bg-gray-100' : ''
                                          } group flex rounded-md text-gray-900 items-center w-full px-2 py-2 text-sm text-right`}
                                        >
                                          <span
                                            className="w-5 h-5 mr-2 inline-block bg-blue-400 rounded-full"
                                            aria-hidden="true"
                                          />
                                          十分に読んだ
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          className={`${
                                            active ? 'bg-gray-100' : ''
                                          } group flex rounded-md text-gray-900 items-center w-full px-2 py-2 text-sm text-right`}
                                        >
                                          <span
                                            className="w-5 h-5 mr-2 inline-block bg-blue-300 rounded-full"
                                            aria-hidden="true"
                                          />
                                          まあまあ読んだ
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          className={`${
                                            active ? 'bg-gray-100' : ''
                                          } group flex rounded-md text-gray-900 items-center w-full px-2 py-2 text-sm text-right`}
                                        >
                                          <span
                                            className="w-5 h-5 mr-2 inline-block bg-blue-100 rounded-full"
                                            aria-hidden="true"
                                          />
                                          あまり読んでいない
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          className={`${
                                            active ? 'bg-gray-100' : ''
                                          } group flex rounded-md text-gray-900 items-center w-full px-2 py-2 text-sm text-right`}
                                        >
                                          <span
                                            className="w-5 h-5 mr-2 inline-block bg-white border border-gray-200 rounded-full"
                                            aria-hidden="true"
                                          />
                                          全く読んでいない
                                        </button>
                                      )}
                                    </Menu.Item>
                                  </div>
                                </Menu.Items>
                              </Transition>
                            </Menu>
                          </div>
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
      
      {/* スマホ時、コンテンツとNavbarが重なるのを防ぐ */}
      <div className="h-16 sm:hidden bg-gray" />
    </div>
  )
}
