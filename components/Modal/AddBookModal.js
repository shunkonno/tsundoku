
//Basic
import { Fragment, useState } from 'react'
import debounce from 'lodash/debounce'
import { nanoid } from 'nanoid'

//Vercel
import { useSWRConfig } from 'swr'
import Image from 'next/image'

// Component
import { Dialog, Transition } from '@headlessui/react'

// Assets
import { SearchIcon, XIcon } from '@heroicons/react/outline'

// Context
import { useUserInfo } from '../../context/useUserInfo'
import { useAlertState } from '../../context/AlertProvider'

// Function
import { useAuth } from '../../lib/auth'
import {
  updateBookList,
  addBook,
  addBookWithoutISBN,
  fetchBookInfo,
  updateBookListCount,
  updateBookListWithoutISBN,
  updateIsReading,
} from '../../lib/db'
import googleSearchBooks from '../../utils/googleApi/googleSearchBooks'
import { useUserBookList } from '../../context/useUserBookList'

export default function Modal({modalOpen, setModalOpen}) {

  // State
  const [searchedBooks, setSearchedBooks] = useState([])

  // Context
  const { setAlertAssort } = useAlertState()

  // Mutate
  const { mutate } = useSWRConfig()

  // Auth
  const auth = useAuth()
  const user = auth.user

  //ユーザー情報
  const { userInfo, error } = useUserInfo()

  //ブックリスト
  const bookList = useUserBookList(userInfo?.uid)

  const searchBooks = async (searchKeyword) => {
    // GoogleBookSearchAPI
    let items = await googleSearchBooks(searchKeyword)
    await setSearchedBooks(items)
    return items
  }

  // Debouncedで実行間隔を調整
  const searchBooksDebounced = debounce(searchBooks, 300)

  // Button Handler
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

        // bookListが0で1冊目として追加する場合、isReadingにセットする
        if(bookList.length === 0 ){
          await updateIsReading(user.uid, bid)
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

        // bookListが0で1冊目として追加する場合、isReadingにセットする
        if(bookList.length === 0 ){
          await updateIsReading(user.uid, bookInfo.bid)
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

      // bookListが0で1冊目として追加する場合、isReadingにセットする
      if(bookList.length === 0 ){
        await updateIsReading(user.uid, bid)
      }

      // bookListWithoutISBN を更新する
      await updateBookListWithoutISBN(user.uid, updatedBookListWithoutISBN)

      setAlertAssort('updateBookList')

      // 画面をリフレッシュ
      mutate('/api/user/' + user.uid + '/booklist')
    }
  }

  const handleAddBookToList = async(e, book) => {
    e.preventDefault()
    e.stopPropagation()

    await addBookToList(e, book)

    await setModalOpen(false)
  }
  // Render Function
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
                    onClick={(e) => {handleAddBookToList(e, book)}}
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

  //return Component
  return (
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
  )
}
