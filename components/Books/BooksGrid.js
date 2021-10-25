// React
import { Fragment, useState, useEffect } from 'react'

// Vercel
import useSWR, { useSWRConfig } from 'swr'
import Image from 'next/image'

// Components
import { RenderAuthorsDescription } from '../Description'
import { BookProgressIcon } from '../../components/Icon'

import { Menu, Transition } from '@headlessui/react'

// Assets
import { PlusSmIcon } from '@heroicons/react/solid'
import {
  BookOpenIcon,
  ChartBarIcon,
  XCircleIcon,
  TrashIcon,
  ExclamationIcon,
  ChartSquareBarIcon,
  ClipboardListIcon,
  DotsVerticalIcon,
} from '@heroicons/react/outline'

// Context
import { useUserBookList } from "../../context/useUserBookList"
import { useUserInfo } from "../../context/useUserInfo"

// Function
import { useAuth } from '../../lib/auth'
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
} from '../../lib/db'
import { selectReadingBook } from '../../utils/bookFunctions/selectReadingBook'
import classNames from "../../utils/classNames"
import { formatISOStringToDateTimeWithSlash } from '../../utils/formatDateTime'

export default function BooksGrid({removeBookFromList}) {

  // State
  let [bookCardsSelected, setBookCardSelected] = useState([])

  // SWR
  const { mutate } = useSWRConfig()

  // ============================================================
  // Auth
  // ============================================================
  const auth = useAuth()
  const user = auth.user

  // ユーザー情報
  const { userInfo, error } = useUserInfo()

  // ブックリスト
  const bookList = useUserBookList(userInfo?.uid)

  // ブックリストの長さ分の、falseで埋められた空配列を用意する。
  useEffect(() => {
    setBookCardSelected(Array(bookList?.length).fill(false))
  }, [bookList])

  // ============================================================
  // Button Handlers
  // ============================================================

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
  // Return Component
  // ============================================================

  return(
    <>
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
                        RenderAuthorsDescription(bookInfo.authors)}
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
                                      user,
                                      bookInfo.bid,
                                      mutate
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
                                    selectReadingBook(
                                      e,
                                      user,
                                      '',
                                      mutate
                                    )
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

                        {/* autoProgress=falseの場合、ユーザーが登録した進捗を表示する */}
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
                          selectReadingBook(
                            e,
                            user,
                            bookInfo.bid,
                            mutate
                          )
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
                          selectReadingBook(e, user, '', mutate)
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
    </>
  )
}