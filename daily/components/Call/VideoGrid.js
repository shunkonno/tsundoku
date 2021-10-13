import React, { Fragment, useState, useMemo, useEffect, useRef } from 'react'
import Tile from '../Tile'
import { WaveTile } from '../Tile'
import { DEFAULT_ASPECT_RATIO } from '../../constants'
import { useParticipants } from '../../contexts/ParticipantsProvider'
import { useDeepCompareMemo } from 'use-deep-compare'

import classNames from '../../../utils/classNames'

import Image from 'next/image'

import { useUserInfo } from '../../../context/useUserInfo'
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
export const VideoGrid = React.memo(
  () => {

    const userInfo = useUserInfo()
    const bookList = useUserBookList(userInfo?.uid)
    console.log(bookList)
    let isReadingBook
    if(bookList && userInfo){
      isReadingBook = useIsReadingBook(bookList, userInfo.isReading)
    }

    const [leftSlideOpen, setLeftSlideOpen] = useState(false)
    const [rightSlideOpen, setRightSlideOpen] = useState(false)

    const containerRef = useRef()
    const { participants } = useParticipants()

    const aspectRatio = DEFAULT_ASPECT_RATIO
    const tileCount = participants.length || 0
    // const tileCount = 2

    console.log(tileCount)

    // Memoize our tile list to avoid unnecassary re-renders
    const tiles = useDeepCompareMemo(
      () =>
        participants.map((p) => (
          // <Tile
          //   participant={p}
          //   key={p.id}
          //   mirrored
          // />
          <>
          <WaveTile 
            participant={p}
            key={p.id}
            mirrored
          />
          </>
        )),
      [participants]
    )

    if (!participants.length) {
      return null
    }

    return (
      <div className="main-area flex h-full items-center justify-center relative w-full" ref={containerRef}>
        <div id="left-sidebar" className=" hidden md:flex md:items-center flex-shrink-0 md:w-56 xl:w-64 2xl:w-72 bg-blue-500 h-full">
       
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
                  <div className="text-black">
                    {isReadingBook?.bookInfo.title}
                  </div>
                </div>
                <div className="flex-shrink-0 w-full">
                  <div
                    className="inline-flex items-center"
                    onClick={() => setLeftSlideOpen(!leftSlideOpen)}
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-blue-400" />
                    <button className="text-sm text-blue-400">
                      本を変更する
                    </button>
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
                              await selectReadingBook(e, bookInfo.bid)
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
        <div className={classNames(
          !(tileCount >= 2) ?
          ""
          :
          "",
          "tiles flex-1 h-full"
          )}
        >
          <div className={classNames(
          !(tileCount >= 2) ?
          "md:w-full lg:w-1/2 h-full grid-cols-1 mx-auto"
          :
          "h-full lg:h-full lg:w-full mx-auto grid-cols-1 lg:grid-cols-2",
          "grid gap-4 lg:gap-6 xl:gap-8 2xl:gap-12 justify-center items-center"
          )}>
            {tiles}
          </div>
        </div>
        <div className="right-sidebar hidden md:block flex-shrink-0 md:w-56 xl:w-64 2xl:w-72 bg-blue-500 h-full">

        </div>
      </div>
    )
  },
  () => true
)

export default VideoGrid
