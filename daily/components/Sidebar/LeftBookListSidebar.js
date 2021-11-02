// Basic
import { Fragment } from 'react'

// Vercel
import { useSWRConfig } from 'swr'
import Image from 'next/image'

//Components
import { Transition } from '@headlessui/react'

// Assets
import {
  ChevronLeftIcon,
  XIcon
} from '@heroicons/react/outline'

// Context
import { useUserInfo } from '../../../context/useUserInfo'
import { useUserBookList } from '../../../context/useUserBookList'

// Functions
import { useAuth } from '../../../lib/auth'
import { selectReadingBook } from '../../../utils/bookFunctions/selectReadingBook'
import classNames from '../../../utils/classNames'

export const LeftBookListSidebar = ({leftSlideOpen, setLeftSlideOpen}) => {

  // Auth
  const auth = useAuth()
  const user = auth.user

  // Mutate
  const { mutate } = useSWRConfig()

  // ユーザー情報
  const { userInfo, error } = useUserInfo()
  
  // ブックリスト
  const bookList = useUserBookList(userInfo?.uid)

  // いま読んでいる本
  const isReadingBook = bookList?.find((book) => {
    return book.bookInfo.bid == userInfo?.isReading
  })

  return (
    <div
      id="left-sidebar"
      className="hidden md:flex md:items-center flex-shrink-0 md:w-56 xl:w-64 2xl:w-72 h-full relative z-10"
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
          <div className="flex flex-col flex-1 w-full items-center mb-2 lg:mb-0 py-0 lg:py-2 space-y-2">
            {userInfo?.isReading == "" ?
              <div className="flex flex-1 items-center">
                <div>
                  <p className="text-center text-sm text-gray-500">
                    『いま読んでいる本』が選択されていません。
                  </p>
                  <p 
                    className="mt-4 text-blue-400 text-sm text-center cursor-pointer hover:text-blue-500"
                    onClick={() => setLeftSlideOpen(!leftSlideOpen)}
                  >
                    本を選択する
                  </p>
                </div>
              </div>
              :
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
            }
            <div className="h-16 w-full">
              <div className="text-black overflow-ellipsis text-center line-clamp-2">{isReadingBook?.bookInfo.title}</div>
            </div>
          </div>
          <div className="flex-shrink-0 w-full">
            {userInfo?.isReading == "" ?
            <>
            </>
            :
            <div
              className="group inline-flex items-center cursor-pointer"
              onClick={() => setLeftSlideOpen(!leftSlideOpen)}
            >
              <ChevronLeftIcon className="w-5 h-5 text-blue-400 group-hover:text-blue-500" />
              <button className="text-sm text-blue-400 group-hover:text-blue-500">本を変更する</button>
            </div>
            }
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
        <div className="flex overflow-hidden absolute inset-y-0 flex-col w-72 max-h-full bg-gray-50 rounded-tr-lg rounded-br-lg">
          <div className="flex flex-shrink-0 justify-end p-2 h-12 bg-blueGray-300">
            <XIcon
              className="w-8 h-8 text-gray-600"
              onClick={() => setLeftSlideOpen(!leftSlideOpen)}
            />
          </div>
          <div className="overflow-y-scroll flex-1 py-2">
            {bookList?.length == 0 ?
            <div className="px-2 text-sm text-center text-gray-500">
              <p>ブックリストに</p>
              <p>本がありません。</p>
            </div>
            :
            bookList?.map(({ bookInfo, date }) => (
              <div
                className={classNames(
                  bookInfo.bid == userInfo.isReading
                    ? 'ring-2 ring-tsundoku-blue-main'
                    : 'border border-gray-300',
                  'relative rounded-lg bg-white py-2 mb-2 mx-2 px-2 h-28 sm:px-3 shadow-sm flex hover:border-blue-400 cursor-pointer'
                )}
                onClick={async (e) => {
                  await selectReadingBook(e, user, bookInfo.bid, mutate)
                  await setLeftSlideOpen(!leftSlideOpen)
                }}
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
                      <p className="overflow-y-hidden text-base sm:text-sm font-medium leading-5 text-gray-900 overflow-ellipsis line-clamp-4">
                        {bookInfo.title}
                      </p>
                    </div>
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

export default LeftBookListSidebar