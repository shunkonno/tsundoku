//Vercel
import { useSWRConfig } from 'swr'

// Components
import { Transition } from '@headlessui/react'

// Context
import { useUserInfo } from "../../context/useUserInfo"

// Functions
import { useAuth } from '../../lib/auth'
import { selectReadingBook } from '../../utils/bookFunctions/selectReadingBook'


export default function BookOverlay ({bookInfo, toggleBookCardsSelected, bookCardsSelected ,idx}) {

  // ============================================================
  // Auth
  // ============================================================
  const auth = useAuth()
  const user = auth.user

  //ユーザー情報
  const { userInfo, error } = useUserInfo()

  const { mutate } = useSWRConfig()

  return(
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
  )
}