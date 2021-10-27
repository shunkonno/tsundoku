import { Fragment } from 'react'
import Image from 'next/image'

//Assets
import {
  ChevronRightIcon,
  XIcon
} from '@heroicons/react/outline'

import { Transition } from '@headlessui/react'

import { returnAmazonLink } from '../../../utils/amazonLink/book'

export const RightBookListSidebar = ({rightSlideOpen, setRightSlideOpen, tileCount, peerUserInfo, peerBookList, peerIsReadingBook}) => {
  
  return (
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
            {
            peerUserInfo?.isReading == "" ?
            <div className="flex flex-1 items-center">
              <div>
                <p className="text-center text-sm text-gray-500">
                  『いま読んでいる本』が選択されていません。
                </p>
              </div>
            </div>
            :
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
            }
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
        <div className="flex overflow-y-scroll absolute inset-y-0 right-0 flex-col w-72 bg-gray-50 rounded-tl-lg rounded-bl-lg z-90">
          <div className="flex flex-shrink-0 p-2 h-12 bg-blueGray-300">
            <XIcon
              className="w-8 h-8 text-gray-600"
              onClick={() => setRightSlideOpen(!rightSlideOpen)}
            />
          </div>
          <div className="overflow-y-auto flex-1 py-2">
            {peerBookList?.length == 0 ?
            <div className="px-2 text-sm text-center text-gray-500">
              <p>ブックリストに</p>
              <p>本がありません。</p>
            </div>
            :
            peerBookList?.map(({ bookInfo, date }) => (
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
  )
}

export default RightBookListSidebar