// ============================================================
// Imports
// ===========================================================
import { Fragment, useEffect, useState, useContext } from 'react'
import Head from 'next/head'
import useSWR, { useSWRConfig } from 'swr'
import { useRouter } from 'next/router'
import Image from 'next/image'
import debounce from 'lodash/debounce'
import { nanoid } from 'nanoid'

// Components
import { AppHeader } from '../components/Header'
import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'
import { GeneralAlert } from '../components/Alert'
import { AddBookModal } from '../components/Modal'
import { BookProgressIcon } from '../components/Icon'

//Context
import { useAlertState } from '../context/AlertProvider'

// Assets
import { Menu, Transition } from '@headlessui/react'
import { PlusSmIcon, DotsVerticalIcon } from '@heroicons/react/solid'
import {
  BookOpenIcon,
  ChartBarIcon,
  XCircleIcon,
  TrashIcon,
  ExclamationIcon,
  ChartSquareBarIcon,
  ClipboardListIcon
} from '@heroicons/react/outline'

// Functions
import { useAuth } from '../lib/auth'
import fetcher from '../utils/fetcher'
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
import { formatISOStringToDateTimeWithSlash } from '../utils/formatDateTime'
import classNames from '../utils/classNames'

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
  let [bookCardsSelected, setBookCardSelected] = useState([])

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

  useEffect(() => {
    setBookCardSelected(Array(bookList?.length).fill(false))
  }, [bookList])

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

  const selectReadingBook = async (e, bid) => {
    e.preventDefault()
    e.stopPropagation()

    await updateIsReading(user.uid, bid)

    await setAlertAssort('updateIsReading')

    mutate(['/api/user', user.token])
  }

  const selectManualProgress = async (e, bid, manualProgress) => {
    e.preventDefault()

    await updateManualProgress(user.uid, bid, manualProgress)

    mutate('/api/user/' + user.uid + '/booklist')
  }

  const selectAutoProgress = async (e, bid) => {
    e.preventDefault()

    await turnOnAutoProgress(user.uid, bid)

    mutate('/api/user/' + user.uid + '/booklist')
  }

  const toggleBookCardsSelected = (e, idx, bool) => {
    e.preventDefault()
    e.stopPropagation()

    const newBookCardsSelected = bookCardsSelected.slice() //Stateの配列をコピー
    newBookCardsSelected.fill(false) //すべてをfalseで初期化
    newBookCardsSelected[idx] = bool // 選択したbookCardのstateをtrueにする
    setBookCardSelected(newBookCardsSelected)
  }

  // ============================================================
  // Render Function
  // ============================================================
  const renderAuthors = (authors) => {
    //3人以上著者がいたら、3人目以降を省略し、"・他"を付け加えて表示する。
    if (authors.length > 2) {
      return (
        <div className="overflow-hidden mt-1 sm:mt-0 max-h-10">
          {
            //authorsの配列の3人目以降を削除
            authors.slice(0, 2).map((author, idx) => {
              //今の項目が2番目(最後)だったら、inline-blockにする。それ以外ならblockにする。
              if (idx != 1) {
                return (
                  <span
                    className="block text-xs sm:text-sm leading-4 text-gray-500 truncate"
                    key={author}
                  >
                    {author}
                  </span>
                )
              } else {
                return (
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
          <span className="inline-block text-xs sm:text-sm leading-4 text-gray-500 truncate">
            ・他
          </span>
        </div>
      )
    }
    //2人以下なら全員を並べて表示するのみ
    else {
      return authors.map((author) => {
        return (
          <div className="overflow-hidden mt-1 sm:mt-0 max-h-10" key={author}>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {author}
            </p>
          </div>
        )
      })
    }
  }

  const renderAutoProgress = (totalReadTime, pageCount) => {
    // 進捗割合 = 読書時間(totalReadTime) × 平均読書速度(400文字/分) ÷ 平均的な文字数(600文字/ページ) ÷ 当該書籍のページ数(pageCount)
    let progress
    if (pageCount != 0) {
      progress = (totalReadTime * 400) / 600 / pageCount
    }

    return (
      <div className="group">
        <div className="flex items-center space-x-1 text-xs text-left text-gray-500 group-hover:text-blue-400 rounded-lg">
          {pageCount == 0 && (
            <span className="flex relative w-2 h-2">
              <span className="absolute w-full h-full bg-yellow-300 rounded-full opacity-75 animate-ping"></span>
              <span className="w-2 h-2 bg-yellow-300 rounded-full"></span>
            </span>
          )}
          <span>読了度</span>
        </div>
        <div className="mt-1">
          <BookProgressIcon progress={progress} />
        </div>
      </div>
    )
  }

  const renderManualProgress = (manualProgess) => {
    return (
      <div className="group">
        <div className="text-xs text-left text-gray-500 group-hover:text-blue-400 rounded-lg">
          読了度(手動)
        </div>
        <div className="mt-1">
          <BookProgressIcon progress={manualProgess} />
        </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mt-4 h-32">
                  {userInfo?.isReading && bookList ? (
                    <>
                      {bookList
                        .filter(({ bookInfo }) => {
                          return bookInfo.bid == userInfo.isReading
                        })
                        .map(({ bookInfo, date }) => (
                          <div
                            className="flex relative py-4 px-2 sm:px-6 bg-white rounded-lg border border-gray-300 hover:border-gray-400 shadow-sm"
                            key={bookInfo.bid}
                          >
                            <div className="relative flex-shrink-0 w-16 sm:w-20">
                              <Image
                                className="object-contain"
                                layout={'fill'}
                                src={
                                  bookInfo.image
                                    ? bookInfo.image
                                    : '/img/placeholder/noimage_480x640.jpg'
                                }
                                alt=""
                              />
                            </div>
                            <div className="overflow-hidden flex-1 ml-3 sm:ml-6">
                              <div className="flex flex-col justify-between h-full">
                                <div className="focus:outline-none">
                                  <p className="overflow-y-hidden max-h-10 sm:max-h-16 text-base sm:text-lg font-medium leading-5 text-gray-900 overflow-ellipsis line-clamp-2">
                                    {bookInfo.title}
                                  </p>
                                  {Array.isArray(bookInfo.authors) &&
                                    renderAuthors(bookInfo.authors)}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                  {formatISOStringToDateTimeWithSlash(date)}{' '}
                                  追加
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </>
                  ) : (
                    <div className="flex relative justify-center items-center py-4 px-2 sm:px-6 text-center bg-white rounded-lg border border-gray-300 hover:border-gray-400 shadow-sm">
                      <div>
                        <p className="text-sm sm:text-base text-black">
                          『いま読んでいる本』は選択されていません。
                        </p>
                        <p className="mt-2 text-xs sm:text-sm text-gray-500">
                          下のブックリストから選択できます。
                        </p>
                      </div>
                    </div>
                  )}
                </div>
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
                {
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                    {bookList?.map(
                      (
                        {
                          bookInfo,
                          date,
                          totalReadTime,
                          autoProgress,
                          manualProgress
                        },
                        idx
                      ) => (
                        <div
                          className={classNames(
                            bookInfo.bid == userInfo.isReading
                              ? 'ring-2 ring-tsundoku-blue-main'
                              : 'border border-gray-300',
                            'relative flex rounded-lg bg-white py-4 px-2 sm:px-6 shadow-sm  hover:border-gray-400'
                          )}
                          key={bookInfo.bid}
                        >
                          {bookInfo.bid == userInfo?.isReading && (
                            <span className="absolute bottom-0 left-0 z-10 py-1 px-2 mb-2 ml-2 text-xs text-white bg-blue-500 rounded-full">
                              選択中
                            </span>
                          )}
                          <div
                            className="flex flex-1"
                            onClick={(e) =>
                              toggleBookCardsSelected(e, idx, true)
                            }
                          >
                            <div className="relative flex-shrink-0 w-16 sm:w-20">
                              <Image
                                className="object-contain"
                                layout={'fill'}
                                src={
                                  bookInfo.image
                                    ? bookInfo.image
                                    : '/img/placeholder/noimage_480x640.jpg'
                                }
                                alt=""
                              />
                            </div>
                            <div className="overflow-hidden flex-1 ml-3 sm:ml-6">
                              <div className="flex flex-col justify-between h-full">
                                <div className="focus:outline-none">
                                  <p className="overflow-y-hidden max-h-10 sm:max-h-16 text-base sm:text-lg font-medium leading-5 text-gray-900 overflow-ellipsis line-clamp-2">
                                    {bookInfo.title}
                                  </p>
                                  {Array.isArray(bookInfo.authors) &&
                                    renderAuthors(bookInfo.authors)}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                  {formatISOStringToDateTimeWithSlash(date)}{' '}
                                  追加
                                </div>
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
                                  <Menu.Items
                                    className={classNames(
                                      bookInfo.bid == userInfo.isReading
                                        ? 'w-72'
                                        : 'w-64',
                                      'absolute right-0 z-20  bg-white rounded-md divide-y divide-gray-100 ring-1 ring-black ring-opacity-5 shadow-lg origin-top-right focus:outline-none'
                                    )}
                                  >
                                    <div className="py-1 px-1">
                                      {!(bookInfo.bid == userInfo.isReading) ? (
                                        <Menu.Item>
                                          {({ active }) => (
                                            <button
                                              className={`${
                                                active ? 'bg-gray-100' : ''
                                              } group flex rounded-md text-gray-900 items-center w-full px-2 py-2 text-sm text-right`}
                                              onClick={(e) =>
                                                selectReadingBook(
                                                  e,
                                                  bookInfo.bid
                                                )
                                              }
                                            >
                                              <BookOpenIcon
                                                className="mr-2 w-5 h-5 text-gray-900"
                                                aria-hidden="true"
                                              />
                                              『いま読んでいる本』にする
                                            </button>
                                          )}
                                        </Menu.Item>
                                      ) : (
                                        <Menu.Item>
                                          {({ active }) => (
                                            <button
                                              className={`${
                                                active ? 'bg-gray-100' : ''
                                              } group flex rounded-md text-gray-900 items-center w-full px-2 py-2 text-sm text-right`}
                                              onClick={(e) =>
                                                selectReadingBook(e, '')
                                              }
                                            >
                                              <XCircleIcon
                                                className="mr-2 w-5 h-5 text-gray-900"
                                                aria-hidden="true"
                                              />
                                              『いま読んでいる本』から除外する
                                            </button>
                                          )}
                                        </Menu.Item>
                                      )}
                                      {autoProgress && (
                                        <Menu.Item>
                                          {({ active }) => (
                                            <button
                                              className={`${
                                                active ? 'bg-gray-100' : ''
                                              } group flex rounded-md text-gray-900 items-center w-full px-2 py-2 text-sm text-right`}
                                              onClick={(e) => {
                                                selectManualProgress(
                                                  e,
                                                  bookInfo.bid,
                                                  0
                                                )
                                              }}
                                            >
                                              <ClipboardListIcon
                                                className="mr-2 w-5 h-5 text-gray-900"
                                                aria-hidden="true"
                                              />
                                              『読了度』を手動で管理する
                                            </button>
                                          )}
                                        </Menu.Item>
                                      )}
                                      {!autoProgress && bookInfo.pageCount && (
                                        <Menu.Item>
                                          {({ active }) => (
                                            <button
                                              className={`${
                                                active ? 'bg-gray-100' : ''
                                              } group flex rounded-md text-gray-900 items-center w-full px-2 py-2 text-sm text-right`}
                                              onClick={(e) => {
                                                selectAutoProgress(
                                                  e,
                                                  bookInfo.bid
                                                )
                                              }}
                                            >
                                              <ChartSquareBarIcon
                                                className="mr-2 w-5 h-5 text-gray-900"
                                                aria-hidden="true"
                                              />
                                              『読了度』を自動で管理する
                                            </button>
                                          )}
                                        </Menu.Item>
                                      )}
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            className={`${
                                              active ? 'bg-gray-100' : ''
                                            } group flex rounded-md text-red-500 items-center w-full px-2 py-2 text-sm text-right`}
                                            onClick={(e) => {
                                              removeBookFromList(
                                                e,
                                                bookInfo.bid
                                              )
                                            }}
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
                                    {/* autoProgress=true かつ pageCount が存在する場合、進捗表示を自動計算する */}
                                    {autoProgress &&
                                      bookInfo.pageCount &&
                                      renderAutoProgress(
                                        totalReadTime,
                                        bookInfo.pageCount
                                      )}

                                    {/* autoProgress=true かつ pageCount が存在しない場合 */}
                                    {autoProgress &&
                                      !bookInfo.pageCount &&
                                      renderAutoProgress(totalReadTime, 0)}

                                    {/* autoProgress=false かつ pageCount が存在する場合、ユーザーが登録した進捗を表示する */}
                                    {!autoProgress &&
                                      renderManualProgress(manualProgress)}
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
                                  <Menu.Items className="absolute right-0 z-20 w-56 bg-white rounded-md divide-y divide-gray-100 ring-1 ring-black ring-opacity-5 shadow-lg origin-top-right focus:outline-none">
                                    <div className="py-1 px-1">
                                      {autoProgress && bookInfo.pageCount && (
                                        <Menu.Item>
                                          <div className="flex flex-col items-center py-2 px-2 w-full text-sm text-right text-gray-900 rounded-md">
                                            <p className="text-sm text-center text-gray-700">
                                              この本は読了度が
                                            </p>
                                            <p className="text-sm text-center text-gray-700">
                                              自動で管理されています。
                                            </p>
                                            <button
                                              className="py-2 px-3 mt-3 rounded-lg border border-gray-400"
                                              onClick={(e) => {
                                                selectManualProgress(
                                                  e,
                                                  bookInfo.bid,
                                                  0
                                                )
                                              }}
                                            >
                                              手動で管理する
                                            </button>
                                          </div>
                                        </Menu.Item>
                                      )}
                                      {autoProgress && !bookInfo.pageCount && (
                                        <Menu.Item>
                                          <div className="flex flex-col items-center py-2 px-2 w-full text-sm text-right text-gray-900 rounded-md">
                                            <div className="flex">
                                              <ExclamationIcon className="mr-0.5 w-6 h-6 text-yellow-500" />
                                              <div>
                                                <p className="text-sm leading-6 text-left text-gray-700">
                                                  この本は読了度を自動で
                                                </p>
                                                <p className="text-sm text-left text-gray-700">
                                                  計測できません。
                                                </p>
                                              </div>
                                            </div>
                                            <button
                                              className="py-2 px-3 mt-3 rounded-lg border border-gray-400"
                                              onClick={(e) => {
                                                selectManualProgress(
                                                  e,
                                                  bookInfo.bid,
                                                  0
                                                )
                                              }}
                                            >
                                              手動で管理する
                                            </button>
                                          </div>
                                        </Menu.Item>
                                      )}
                                      {!autoProgress && (
                                        <>
                                          <Menu.Item>
                                            {({ active }) => (
                                              <button
                                                className={`${
                                                  active ? 'bg-gray-100' : ''
                                                } group flex rounded-md text-gray-900 items-center w-full px-2 py-2 text-sm text-right`}
                                                onClick={(e) => {
                                                  selectManualProgress(
                                                    e,
                                                    bookInfo.bid,
                                                    1
                                                  )
                                                }}
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
                                                onClick={(e) => {
                                                  selectManualProgress(
                                                    e,
                                                    bookInfo.bid,
                                                    0.7
                                                  )
                                                }}
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
                                                onClick={(e) => {
                                                  selectManualProgress(
                                                    e,
                                                    bookInfo.bid,
                                                    0.4
                                                  )
                                                }}
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
                                                onClick={(e) => {
                                                  selectManualProgress(
                                                    e,
                                                    bookInfo.bid,
                                                    0.2
                                                  )
                                                }}
                                              >
                                                <span
                                                  className="inline-block mr-2 w-5 h-5 bg-blue-100 rounded-full"
                                                  aria-hidden="true"
                                                />
                                                少しだけ読んだ
                                              </button>
                                            )}
                                          </Menu.Item>
                                        </>
                                      )}
                                    </div>
                                  </Menu.Items>
                                </Transition>
                              </Menu>
                            </div>
                          </div>

                          <Transition
                            show={
                              bookCardsSelected[idx]
                                ? bookCardsSelected[idx]
                                : false
                            }
                            as={'div'}
                            enter="transition ease-in-out duration-100 transfrom"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-50 scale-100"
                            leave="transition ease-in duration-75 transfrom"
                            leaveFrom="opacity-50 scale-100"
                            leaveTo="opacity-0 scale-95"
                            className="flex absolute top-1/2 left-1/2 items-center px-2 sm:px-6 w-full h-full bg-white bg-opacity-95 rounded-lg transform -translate-x-1/2 -translate-y-1/2"
                          >
                            {!(bookInfo.bid == userInfo.isReading) ? (
                              <div className="flex flex-col justify-center items-center space-y-4 w-full">
                                <p className="flex-1 text-sm sm:text-base">
                                  『現在読んでいる本』にしますか？
                                </p>
                                <div className="flex gap-4 justify-center items-center">
                                  <button
                                    className="inline-block flex-shrink-0 py-2 px-4 text-base text-center text-gray-600 bg-gray-100 rounded-md cursor-pointer"
                                    onClick={(e) =>
                                      toggleBookCardsSelected(e, idx, false)
                                    }
                                  >
                                    選択しない
                                  </button>
                                  <button
                                    className="inline-block flex-shrink-0 py-2 px-8 text-base text-center text-white hover:bg-blue-700 rounded-md border border-transparent cursor-pointer focus:outline-none bg-tsundoku-blue-main focus:ring-tsundoku-blue-main"
                                    onClick={(e) => {
                                      selectReadingBook(e, bookInfo.bid)
                                      toggleBookCardsSelected(e, idx, false)
                                    }}
                                  >
                                    選択
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col justify-center items-center space-y-4 w-full">
                                <p className="flex-1 text-sm sm:text-base">
                                  『現在読んでいる本』から除外しますか？
                                </p>
                                <div className="flex gap-4 justify-center items-center">
                                  <button
                                    className="inline-block flex-shrink-0 py-2 px-4 text-sm text-center text-gray-600 bg-gray-100 rounded-md cursor-pointer"
                                    onClick={(e) =>
                                      toggleBookCardsSelected(e, idx, false)
                                    }
                                  >
                                    除外しない
                                  </button>
                                  <button
                                    className="inline-block flex-shrink-0 py-2 px-6 text-sm text-center text-white bg-red-400 hover:bg-red-500 rounded-md border border-transparent focus:ring-red-400 cursor-pointer focus:outline-none"
                                    onClick={(e) => {
                                      selectReadingBook(e, '')
                                      toggleBookCardsSelected(e, idx, false)
                                    }}
                                  >
                                    除外する
                                  </button>
                                </div>
                              </div>
                            )}
                          </Transition>
                        </div>
                      )
                    )}
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
