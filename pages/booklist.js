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
import { BookOpenIcon, TrashIcon } from '@heroicons/react/outline'

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
  updateBookListWithoutISBN,
  updateIsReading
} from '../lib/db'
import { formatISOStringToDateTimeWithSlash } from '../utils/formatDateTime'
import classNames from '../utils/classNames'

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
    // 想定
    // ・ ISBNコードが存在する本のみ、追加することができる
    // ・ ISBN-13で本を管理することを想定している

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
        updatedBookList[updatedBookList.length] = {
          bid,
          date,
          totalReadTime: 0
        }

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
        updatedBookList[updatedBookList.length] = {
          bid: bookInfo.bid,
          date,
          totalReadTime: 0
        }

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
        date,
        totalReadTime: 0
      }

      updateBookListWithoutISBN(user.uid, updatedBookListWithoutISBN)
    }

    await router.push('/empty')
    await router.replace('/booklist')
  }

  const selectReadingBook = async (e, bid) => {
    e.preventDefault()

    await updateIsReading(user.uid, bid)

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
                    className="inline-flex items-center py-1 px-3 text-base font-medium leading-5 text-blue-600 hover:text-white bg-white hover:bg-blue-500 rounded-full border border-blue-600 hover:border-blue-500 shadow-sm"
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

  const renderAuthors = (authors) => {
    //3人以上著者がいたら、3人目以降を省略し、"・他"を付け加えて表示する。
    if(authors.length > 2){
      return(
        <div className="overflow-hidden mt-1 sm:mt-0 max-h-10">
          {
            //authorsの配列の3人目以降を削除
            authors.slice(0,2).map((author, idx) => {
              //今の項目が2番目(最後)だったら、inline-blockにする。それ以外ならblockにする。
              if(idx != 1){
                return (
                  <span
                    className="block text-xs sm:text-sm leading-4 text-gray-500 truncate"
                    key={author}
                  >
                    {author}
                  </span>
                )
              }else{
                return(
                  <span 
                    className="inline-block text-xs sm:text-sm leading-4 text-gray-500 truncate"
                    key={author}
                  >
                    {author}
                  </span>
                )
              }
            })
          }
        {/* 2人目の著者の右に "・他" を描画する */}
        <span className="inline-block text-xs sm:text-sm leading-4 text-gray-500 truncate">・他</span>
        </div>
      )
    }
    //2人以下なら全員を並べて表示するのみ
    else {
      return(
        authors.map((author) => {
          return (
            <div className="overflow-hidden mt-1 sm:mt-0 max-h-10" key={author}>
              <p
                className="text-xs sm:text-sm text-gray-500 truncate"
              >
                {author}
              </p>
            </div>
            
          )
        })
      )
    }
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
            className="overflow-y-scroll fixed inset-0 z-10"
            onClose={() => setModalOpen(false)}
          >
            <div className="sm:px-4 min-h-screen text-center">
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
                <div className="inline-block relative p-6 w-full max-w-4xl h-80v text-left align-middle bg-white rounded-2xl shadow-xl transition-all transform">
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
                        <div className=" mt-2">
                          {/* book search component -- START */}
                          <div className="relative mt-1 rounded-md shadow-sm">
                            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                              <SearchIcon
                                className="w-5 h-5 text-gray-400"
                                aria-hidden="true"
                              />
                            </div>
                            <input
                              type="text"
                              className="block pl-10 w-full sm:text-sm rounded-md border-gray-300 focus:ring-tsundoku-blue-main focus:border-tsundoku-blue-main"
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
                  <div className="overflow-y-auto h-5/6">
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
      <div className="overflow-hidden relative pb-16 bg-gray-50">
        <div className="sm:block sm:w-full sm:h-full" aria-hidden="true">
          <main className="relative sm:py-4 px-4 mx-auto max-w-7xl">
            <Navbar />

            <div className="mb-24">
              <div className="flex justify-between py-5 sm:mt-12">
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
                {
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {bookList?.map(({ bookInfo, date }) => (
                      <div
                        className={classNames(
                          bookInfo.bid == userInfo.isReading
                            ? 'ring-2 ring-tsundoku-blue-main'
                            : 'border border-gray-300',
                          'relative rounded-lg bg-white py-4 px-2 sm:px-6 shadow-sm flex hover:border-gray-400'
                        )}
                        key={bookInfo.bid}
                      >
                        {bookInfo.bid == userInfo?.isReading && (
                          
                          
                            <BookOpenIcon className="absolute bottom-0 left-0 z-10 p-1 mb-2 ml-2 w-8 h-8 text-white bg-blue-500 rounded-full" />
                          
                        )}
                        <div className="relative flex-shrink-0 w-16 sm:w-20">
                          <Image
                            className="object-contain"
                            layout={'fill'}
                            src={bookInfo.image}
                            alt=""
                          />
                        </div>
                        <div className="overflow-hidden flex-1 ml-3 sm:ml-6">
                          <div className="flex flex-col justify-between h-full">
                            <div className="focus:outline-none">
                              <p className="overflow-y-hidden max-h-10 text-base sm:text-lg font-medium leading-5 text-gray-900 overflow-ellipsis">
                                {bookInfo.title}
                              </p>
                              {Array.isArray(bookInfo.authors) &&
                                renderAuthors(bookInfo.authors)
                              }
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {formatISOStringToDateTimeWithSlash(date)} 追加
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col flex-shrink-0 justify-between items-end">
                          <div className="text-rights">
                            <Menu as="div" className="inline-block relative">
                              <div>
                                <Menu.Button className="inline-flex">
                                  <DotsVerticalIcon className="p-1 w-8 h-8 text-gray-500 hover:bg-gray-100 rounded-full" />
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
                                <Menu.Items className="absolute right-0 z-20 w-64 bg-white rounded-md divide-y divide-gray-100 ring-1 ring-black ring-opacity-5 shadow-lg origin-top-right focus:outline-none">
                                  <div className="py-1 px-1">
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          className={`${
                                            active ? 'bg-gray-100' : ''
                                          } group flex rounded-md text-gray-900 items-center w-full px-2 py-2 text-sm text-right`}
                                          onClick={(e) =>
                                            selectReadingBook(e, bookInfo.bid)
                                          }
                                        >
                                          <BookOpenIcon
                                            className="mr-2 w-5 h-5 text-gray-900"
                                            aria-hidden="true"
                                          />
                                          『現在読んでいる本』にする
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          className={`${
                                            active ? 'bg-gray-100' : ''
                                          } group flex rounded-md text-red-500 items-center w-full px-2 py-2 text-sm text-right`}
                                        >
                                          <TrashIcon
                                            className="mr-2 w-5 h-5 text-red-500"
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
                            <Menu as="div" className="inline-block relative">
                              <div>
                                <Menu.Button className="">
                                  <div className="text-xs text-left text-gray-500 hover:text-blue-400 rounded-lg">
                                    読了度
                                  </div>
                                  <div className="flex mt-1">
                                  <svg
                                    className=" mr-1.5 w-1.5 h-6 text-blue-100"
                                    fill="currentColor"
                                    viewBox="0 0 5 20"
                                  >
                                    <rect x="0" y="0" r="1"  width="5" height="20"/>
                                  </svg>
                                  <svg
                                    className=" mr-1.5 -ml-0.5 w-1.5 h-6 text-blue-200"
                                    fill="currentColor"
                                    viewBox="0 0 5 20"
                                  >
                                    <rect x="0" y="0" r="1"  width="5" height="20"/>
                                  </svg>
                                  <svg
                                    className=" mr-1.5 -ml-0.5 w-1.5 h-6 text-blue-300"
                                    fill="currentColor"
                                    viewBox="0 0 5 20"
                                  >
                                    <rect x="0" y="0" r="1"  width="5" height="20"/>
                                  </svg>
                                  <svg
                                    className=" mr-1.5 -ml-0.5 w-1.5 h-6 text-blue-400"
                                    fill="currentColor"
                                    viewBox="0 0 5 20"
                                  >
                                    <rect x="0" y="0" r="1"  width="5" height="20"/>
                                  </svg>
                                  <svg
                                    className=" mr-1.5 -ml-0.5 w-1.5 h-6 text-blue-500"
                                    fill="currentColor"
                                    viewBox="0 0 5 20"
                                  >
                                    <rect x="0" y="0" r="1"  width="5" height="20"/>
                                  </svg>
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
                                <Menu.Items className="absolute right-0 z-20 w-48 bg-white rounded-md divide-y divide-gray-100 ring-1 ring-black ring-opacity-5 shadow-lg origin-top-right focus:outline-none">
                                  <div className="py-1 px-1">
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          className={`${
                                            active ? 'bg-gray-100' : ''
                                          } group flex rounded-md text-gray-900 items-center w-full px-2 py-2 text-sm text-right`}
                                        >
                                          <span
                                            className="inline-block mr-2 w-5 h-5 rounded-full bg-tsundoku-blue-main"
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
                                            className="inline-block mr-2 w-5 h-5 bg-blue-400 rounded-full"
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
                                            className="inline-block mr-2 w-5 h-5 bg-blue-300 rounded-full"
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
                                            className="inline-block mr-2 w-5 h-5 bg-blue-100 rounded-full"
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
                                            className="inline-block mr-2 w-5 h-5 bg-white rounded-full border border-gray-200"
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
      <div className="sm:hidden h-16 bg-gray" />
    </div>
  )
}
