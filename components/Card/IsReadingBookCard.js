import { useState, useEffect } from 'react'

//Nextjs
import Image from 'next/image'

//Context
import { useUserInfo } from "../../context/useUserInfo"
import { useUserBookList } from "../../context/useUserBookList"

//Components
import { AuthorsDescription } from "../Description"
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

//Functions
import { formatISOStringToDateTimeWithSlash } from "../../utils/formatDateTime"

export default function IsReadingBookCard () {
  let [loading, setLoading] = useState(true)

  const {userInfo, error } = useUserInfo()
  const bookList = useUserBookList(userInfo?.uid)

  //Loading
  useEffect(()=> {
    if(userInfo && bookList){
      setLoading(false)
    }
  },[userInfo, bookList])

  // 『いま読んでいる本』を抽出
  const isReadingBook = bookList
    ?.filter(({ bookInfo }) => {
      return bookInfo.bid == userInfo.isReading
    })

  return(
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mt-4">
      {loading ?
      <div className="flex relative py-4 px-2 sm:px-6 h-auto sm:h-36">
        <div className="relative flex-shrink-0 w-16 sm:w-20 h-20 sm:h-28">
          <Skeleton height="100%" />
        </div>
        <div className="overflow-hidden flex-1 ml-3 sm:ml-6">
          <div className="flex flex-col justify-between h-full">
            <div className="focus:outline-none">
              <p className="overflow-y-hidden max-h-10 sm:max-h-16">
              <Skeleton />
              </p>
              {<Skeleton width={"50%"} />}
            </div>
            <div className="text-sm">
              <Skeleton width={"75%"} />
            </div>
          </div>
        </div>
      </div>
      :
      userInfo?.isReading && isReadingBook ? (
        <>
          {isReadingBook
            .map(({ bookInfo, date }) => (
              <div
                className="flex relative py-4 px-2 sm:px-6 h-auto sm:h-40 bg-white rounded-lg border border-gray-300 hover:border-gray-400 shadow-sm"
                key={bookInfo.bid}
              >
                <div className="flex flex-1">
                  <div className="relative flex-shrink-0 w-16 sm:w-20">
                    <Image
                      className="object-contain"
                      layout={'fill'}
                      src={
                        bookInfo.image
                          ? bookInfo.image
                          : '/img/placeholder/noimage_480x640.jpg'
                      }
                      alt="book cover"
                    />
                  </div>
                  <div className="overflow-hidden flex-1 ml-3 sm:ml-6">
                    <div className="flex flex-col justify-between h-full">
                      <div className="focus:outline-none">
                        <p className="overflow-y-hidden max-h-10 sm:max-h-16 text-base sm:text-lg font-medium leading-5 text-gray-900 overflow-ellipsis line-clamp-2">
                          {bookInfo.title}
                        </p>
                        {Array.isArray(bookInfo.authors) &&
                          AuthorsDescription(bookInfo.authors)}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {formatISOStringToDateTimeWithSlash(date)}{' '}
                        追加
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </>
      ) : (
        <div className="flex relative justify-center items-center h-28 sm:h-36 py-4 px-2 sm:px-6 text-center bg-white rounded-lg border border-gray-300 hover:border-gray-400 shadow-sm">
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
  )
}