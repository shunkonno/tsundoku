
// Vercel
import Image from 'next/image'

// Components
import { AuthorsDescription } from '../Description'
import { BookProgress } from '../Books'
import { BookMenu } from '../Books'
import { BookOverlay } from '../Books'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

// Context
import { useUserInfo } from '../../context/useUserInfo'

// Functions
import classNames from '../../utils/classNames'
import { formatISOStringToDateTimeWithSlash } from '../../utils/formatDateTime'

export default function ListBookCard({ 
  bookInfo,
  date, 
  totalReadTime, 
  autoProgress, 
  manualProgress,
  bookCardsSelected,
  idx,
  toggleBookCardsSelected,
  loading
}) {

  const { userInfo, error } = useUserInfo()
  
  return(
    <>
    {loading ?
    <div className="relative flex rounded-lg py-4 px-2 sm:px-6 h-auto sm:h-36">
      <div className="relative flex-shrink-0 w-16 sm:w-20 h-20 sm:h-28">
        <Skeleton height="100%" />
      </div>
      <div className="flex-1 ml-3 sm:ml-6">
        <div className="flex flex-col justify-between h-full">
          <div className="focus:outline-none">
            <p className="max-h-10 sm:max-h-16 text-base sm:text-lg font-medium leading-5">
              <Skeleton />
            </p>
            <Skeleton width={"50%"} />
          </div>
          <div className="text-sm">
            <Skeleton width={"75%"} />
          </div>
        </div>
      </div>
  </div>
    :
    <div
      className={classNames(
        bookInfo.bid == userInfo.isReading
          ? 'ring-2 ring-tsundoku-blue-main'
          : 'border border-gray-300',
        'relative flex rounded-lg bg-white h-auto sm:h-40 py-4 px-2 sm:px-6 shadow-sm  hover:border-gray-400'
      )}
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
      <div className="flex flex-col flex-shrink-0 justify-between items-end">
        <BookMenu 
          bookInfo={bookInfo} 
          autoProgress={autoProgress} 
        />
        <BookProgress 
          bookInfo={bookInfo}
          totalReadTime={totalReadTime}
          autoProgress={autoProgress}
          manualProgress={manualProgress}
        />
      </div>
      <BookOverlay 
        bookInfo={bookInfo}
        toggleBookCardsSelected={toggleBookCardsSelected} 
        bookCardsSelected={bookCardsSelected} 
        idx={idx}
      />
    </div>
    }
    </>
  )
}