import React, { Fragment, useState, useMemo, useEffect, useRef } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import Tile from '../Tile'
import { WaveTile } from '../Tile'
import { DEFAULT_ASPECT_RATIO } from '../../constants'
import { useParticipants } from '../../contexts/ParticipantsProvider'
import { useDeepCompareMemo } from 'use-deep-compare'

import classNames from '../../../utils/classNames'

import Image from 'next/image'

import { useUserInfo } from '../../../context/useUserInfo'
import { useOneUserInfo } from '../../../context/useOneUserInfo'
import { useUserBookList } from '../../../context/useUserBookList'
import { useIsReadingBook } from '../../../context/useIsReadingBook'

import { Transition } from '@headlessui/react'

//Assets
import {
  MicrophoneIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LogoutIcon,
  XIcon
} from '@heroicons/react/outline'
import colors from 'tailwindcss/colors'

//Functions
import { useAuth } from '../../../lib/auth'
import { selectReadingBook } from '../../../utils/bookFunctions/selectReadingBook'
import { updateIsReading } from '../../../lib/db'
import { returnAmazonLink } from '../../../utils/amazonLink/book'
import fetcher from '../../../utils/fetcher'

/**
 * Basic unpaginated video tile grid, scaled by aspect ratio
 *
 * Note: this component is designed to work with automated track subscriptions
 * and is only suitable for small call sizes as it will show all participants
 * and not paginate.
 *
 * Note: this grid does not show screenshares (just participant cams)
 *
 * Note: this grid does not sort participants
 */
export const VideoGrid = ({ session }) => {
  // ============================================================
  // Initialize
  // ============================================================
  const [peerUserInfoState, setPeerUserInfo] = useState(null)
  const [peerBookListState, setPeerBookList] = useState([])
  const [peerIsReadingBookState, setPeerIsReadingBook] = useState(null)

  // Auth
  const auth = useAuth()
  const user = auth.user

  // mutateを定義
  const { mutate } = useSWRConfig()

  // ============================================================
  // スリープしないようにする
  // ============================================================
  let wakeLock = null

  if (
    typeof window !== 'undefined' &&
    typeof window.navigator !== 'undefined'
  ) {
    try {
      wakeLock = navigator.wakeLock.request('screen')
      console.log('Wake Lock is active')
    } catch (err) {
      console.error(`${err.name}, ${err.message}`)
    }
  }

  // ============================================================
  // Fetch Data
  // ============================================================

  // ユーザー情報
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
  // ユーザーのブックリスト取得
  const { data: bookList } = useSWR(
    userInfo?.uid ? '/api/user/' + userInfo?.uid + '/booklist' : null,
    fetcher,
    {
      onErrorRetry: ({ retryCount }) => {
        // Retry up to 10 times
        if (retryCount >= 10) return
      }
    }
  )

  const isReadingBook = bookList?.find((book) => {
    return book.bookInfo.bid == userInfo?.isReading
  })

  // マッチング相手のユーザー情報を取得
  // マッチング相手のユーザーのIDがguestIdかownerIdか識別
  const peerUid =
    userInfo?.uid === session?.ownerId ? session?.guestId : session?.ownerId

  // ユーザー情報
  const { data: peerUserInfo } = useSWR(
    peerUid ? '/api/user/' + peerUid + '/info' : null,
    fetcher,
    {
      onErrorRetry: ({ retryCount }) => {
        // エラー時には、10回まではリトライする
        if (retryCount >= 10) return
      }
    }
  )

  // ユーザーのブックリスト取得
  const { data: peerBookList } = useSWR(
    peerUid ? '/api/user/' + peerUid + '/booklist' : null,
    fetcher,
    {
      onErrorRetry: ({ retryCount }) => {
        // Retry up to 10 times
        if (retryCount >= 10) return
      }
    }
  )

  const peerIsReadingBook = peerBookList?.find((book) => {
    return book.bookInfo.bid == peerUserInfo?.isReading
  })

  useEffect(() => {
    setPeerUserInfo(peerUserInfo)
    setPeerBookList(peerBookList)
    setPeerIsReadingBook(peerIsReadingBook)
  }, [peerUserInfo, peerBookList, peerIsReadingBook])

  console.log('peerUserInfo:', peerUserInfoState)
  console.log('PeerBookList:', peerBookListState)
  console.log('PeerIsReadingBook:', peerIsReadingBookState)

  const [leftSlideOpen, setLeftSlideOpen] = useState(false)
  const [rightSlideOpen, setRightSlideOpen] = useState(false)

  const containerRef = useRef()
  const { participants } = useParticipants()

  const aspectRatio = DEFAULT_ASPECT_RATIO
  const tileCount = participants.length || 0
  // const tileCount = 2

  // Memoize our tile list to avoid unnecassary re-renders
  const tiles = useDeepCompareMemo(() => {
    return (
      <>
        <WaveTile key={userInfo?.uid} uid={userInfo?.uid} />
        {tileCount >= 2 && (
          <WaveTile key={peerUserInfo?.uid} uid={peerUserInfo?.uid} />
        )}
      </>
    )
  }, [participants])

  if (!participants.length) {
    return null
  }

  const selectReadingBook = async (e, user, bid) => {
    e.preventDefault()
    e.stopPropagation()

    await updateIsReading(user.uid, bid)

    mutate(['/api/user', user.token])
  }

  // ============================================================
  // Return Component
  // ============================================================
  return (
    <div
      className="main-area flex h-full items-center justify-center relative w-full"
      ref={containerRef}
    >
      <div
        id="left-sidebar"
        className=" hidden md:flex md:items-center flex-shrink-0 md:w-56 xl:w-64 2xl:w-72 h-full"
      >
        <Transition
          as={Fragment}
          show={!leftSlideOpen}
          enter="transition transform ease-in-out duration-300"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transition transform ease-in-out duration-300"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <div className="flex flex-col items-center py-2 px-4 mr-4 xl:mr-8 w-full h-64 lg:h-72 2xl:h-80 bg-white rounded-tr-lg rounded-br-lg">
            <div className="flex-shrink-0 py-2 w-full text-lg font-bold text-gray-500">
              いま読んでいる本
            </div>
            <div className="flex flex-col flex-1 w-full items-center mb-2 lg:mb-0 py-0 lg:py-2 space-y-2 lg:space-y-4">
              <div className="w-2/3 h-full">
                <div className="relative max-w-full h-full">
                  <Image
                    className="filter drop-shadow-lg"
                    src={
                      isReadingBook
                        ? isReadingBook?.bookInfo?.image
                        : '/img/placeholder/noimage_480x640.jpg'
                    }
                    objectFit={'contain'}
                    layout={'fill'}
                    placeholder="empty"
                    alt="Book Cover"
                  />
                </div>
              </div>
              <div className="text-black">{isReadingBook?.bookInfo.title}</div>
            </div>
            <div className="flex-shrink-0 w-full">
              <div
                className="inline-flex items-center"
                onClick={() => setLeftSlideOpen(!leftSlideOpen)}
              >
                <ChevronLeftIcon className="w-5 h-5 text-blue-400" />
                <button className="text-sm text-blue-400">本を変更する</button>
              </div>
            </div>
          </div>
        </Transition>
        <Transition
          as={Fragment}
          show={leftSlideOpen}
          enter="transition transform ease-in-out duration-300"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transition transform ease-in-out duration-300"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <div className="flex overflow-hidden absolute inset-y-0 flex-col md:w-56 xl:w-64 2xl:w-72 max-h-full bg-gray-50 rounded-tr-lg rounded-br-lg">
            <div className="flex flex-shrink-0 justify-end p-2 h-12 bg-blueGray-300">
              <XIcon
                className="w-8 h-8 text-gray-600"
                onClick={() => setLeftSlideOpen(!leftSlideOpen)}
              />
            </div>
            <div className="overflow-y-scroll flex-1 py-2">
              {bookList?.map(({ bookInfo, date }) => (
                <div
                  className={classNames(
                    bookInfo.bid == userInfo.isReading
                      ? 'ring-2 ring-tsundoku-blue-main'
                      : 'border border-gray-300',
                    'relative rounded-lg bg-white py-2 mb-2 mx-2 px-2 h-28 sm:px-3 shadow-sm flex hover:border-gray-400'
                  )}
                  key={bookInfo.bid}
                >
                  {bookInfo.bid == userInfo?.isReading && (
                    <span className="absolute bottom-0 left-0 z-10 py-1 px-2 mb-2 ml-2 text-xs text-white bg-blue-500 rounded-full">
                      選択中
                    </span>
                  )}
                  <div className="relative flex-shrink-0 w-10 sm:w-16">
                    <Image
                      className="object-contain"
                      layout={'fill'}
                      src={
                        bookInfo?.image
                          ? bookInfo?.image
                          : '/img/placeholder/noimage_480x640.jpg'
                      }
                      alt={bookInfo?.title}
                    />
                  </div>
                  <div className="overflow-hidden flex-1 ml-3">
                    <div className="flex flex-col justify-between h-full">
                      <div className="focus:outline-none">
                        <p className="overflow-y-hidden max-h-10 sm:max-h-16 text-base sm:text-sm font-medium leading-5 text-gray-900 overflow-ellipsis line-clamp-2">
                          {bookInfo.title}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 justify-center items-center">
                    <div>
                      <button
                        className="inline-flex items-center py-1 px-3 text-sm font-medium leading-5 text-blue-600 hover:text-white bg-white hover:bg-blue-500 rounded-full border border-blue-600 hover:border-blue-500 shadow-sm"
                        onClick={async (e) => {
                          await selectReadingBook(e, user, bookInfo.bid, mutate)
                          await setLeftSlideOpen(!leftSlideOpen)
                        }}
                      >
                        選択
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Transition>
      </div>
      <div
        className={classNames(
          !(tileCount >= 2) ? '' : '',
          'tiles flex-1 h-full'
        )}
      >
        <div
          className={classNames(
            !(tileCount >= 2)
              ? 'md:w-full lg:w-1/2 h-full grid-cols-1 mx-auto'
              : 'h-full lg:h-full lg:w-full mx-auto grid-cols-1 lg:grid-cols-2',
            'grid gap-4 lg:gap-6 xl:gap-8 2xl:gap-12 justify-center items-center'
          )}
        >
          {tiles}
        </div>
      </div>
      <div className="right-sidebar items-center hidden md:flex flex-shrink-0 md:w-56 xl:w-64 2xl:w-72 h-full">
        <Transition
          as={Fragment}
          show={!rightSlideOpen && tileCount >= 2}
          enter="transition transform ease-in-out duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transition transform ease-in-out duration-300"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <div className="flex flex-col items-center justify-end py-2 px-4 ml-4 xl:ml-8 w-full h-64 lg:h-72 2xl:h-80 bg-white rounded-tl-lg rounded-bl-lg">
            <div className="flex-shrink-0 py-2 w-full text-lg font-bold text-gray-500">
              いま読んでいる本
            </div>
            <div className="flex flex-col flex-1 items-center py-4 space-y-4 w-full h-full">
              <div className="w-2/3 h-full">
                <div className="relative max-w-full h-full">
                  <Image
                    className="filter drop-shadow-lg"
                    src={
                      peerIsReadingBook
                        ? peerIsReadingBook?.bookInfo?.image
                        : '/img/placeholder/noimage_480x640.jpg'
                    }
                    objectFit={'contain'}
                    layout={'fill'}
                    placeholder="empty"
                    alt="Book Cover"
                  />
                </div>
              </div>
              <div className="text-black">
                {peerIsReadingBook?.bookInfo.title}
              </div>
            </div>
            <div className="flex flex-shrink-0 self-end text-right">
              <div
                className="inline-flex items-center"
                onClick={() => setRightSlideOpen(!rightSlideOpen)}
              >
                <button className="text-sm text-blue-400">
                  ブックリストを見る
                </button>
                <ChevronRightIcon className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>
        </Transition>
        <Transition
          as={Fragment}
          show={rightSlideOpen}
          enter="transition transform ease-in-out duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transition transform ease-in-out duration-300"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <div className="flex overflow-y-scroll absolute inset-y-0 right-0 flex-col w-80 bg-gray-50 rounded-tl-lg rounded-bl-lg">
            <div className="flex flex-shrink-0 p-2 h-12 bg-blueGray-300">
              <XIcon
                className="w-8 h-8 text-gray-600"
                onClick={() => setRightSlideOpen(!rightSlideOpen)}
              />
            </div>
            <div className="overflow-y-auto flex-1 py-2">
              {peerBookList?.map(({ bookInfo, date }) => (
                <div
                  className="flex relative py-2 px-2 sm:px-3 mx-2 mb-2 h-28 bg-white rounded-lg border border-gray-300 hover:border-gray-400 shadow-sm"
                  key={bookInfo.bid}
                >
                  <div className="relative flex-shrink-0 w-10 sm:w-16">
                    <Image
                      className=" object-contain"
                      layout={'fill'}
                      src={
                        bookInfo?.image
                          ? bookInfo?.image
                          : '/img/placeholder/noimage_480x640.jpg'
                      }
                      alt={bookInfo?.title}
                    />
                  </div>
                  <div className="overflow-hidden flex-1 ml-3">
                    <div className="flex flex-col justify-between h-full">
                      <div className="focus:outline-none">
                        <p className="overflow-y-hidden max-h-10 sm:max-h-16 text-base sm:text-sm font-medium leading-5 text-gray-900 overflow-ellipsis line-clamp-2">
                          {bookInfo.title}
                        </p>
                      </div>
                      {bookInfo.isbn13 && (
                        <div className="text-right">
                          <a
                            href={returnAmazonLink(bookInfo.isbn13)}
                            className="text-sm text-blue-500"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Amazonで見る
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Transition>
      </div>
    </div>
  )
}

export default VideoGrid
