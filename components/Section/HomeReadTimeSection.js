// Basic
import { useState, useEffect } from 'react'

// Vercel
import useSWR from 'swr'

// Assets
import { ArrowSmUpIcon } from '@heroicons/react/solid'

//Component
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

// Function
import fetcher from '../../utils/fetcher'
import { useUserInfo } from '../../context/useUserInfo'
import { useUserBookList } from '../../context/useUserBookList'

const HomeReadTimeSection = () => {
  let [loading, setLoading] = useState(true)

  const { userInfo, error} = useUserInfo()
  const bookList = useUserBookList(userInfo?.uid)

  // 利用情報
  const { data: stats } = useSWR(
    userInfo ? '/api/user/' + userInfo?.uid + '/stats' : null,
    fetcher,
    {
      onErrorRetry: ({ retryCount }) => {
        // Retry up to 10 times
        if (retryCount >= 10) return
      }
    }
  )

  // ============================================================
  // Helper Functions
  // ===========================================================
  const rateOfReadTime = (currentMonthReadTime, lastMonthReadTime) => {
    let result

    if (lastMonthReadTime != 0) {
      result = Math.round((currentMonthReadTime / lastMonthReadTime) * 100 - 100)
    } else {
      result = 0
    }

    return result
  }

  const monthlyReadTime = (monthDifference) => {
    //monthDifference=1で今月、0で先月、2で来月のReadTimeを取得
    const currentDateTime = new Date()
    const currentYear = currentDateTime.getFullYear()
    const currentMonth = currentDateTime.getMonth() + monthDifference

    const readTime = stats?.readTime

    if (readTime?.[currentYear]?.[currentMonth]) {
      // 現在の月のデータが存在する場合
      var monthlyReadTime = 0

      // 今月分を array に集約
      const readTimeArray = Object.values(readTime[currentYear][currentMonth])

      // monthlyReadTime に加算
      readTimeArray.forEach((readTime) => {
        monthlyReadTime += readTime
      })

      return monthlyReadTime
    } else {
      // 現在の月のデータが存在しない場合 (=今月未利用)
      const monthlyReadTime = 0
      return monthlyReadTime
    }
  }

  // ============================================================
  // Render Function
  // ============================================================

  const renderIncreasedRate = () => {
    let increasedRate = rateOfReadTime(
      monthlyReadTime(1),
      monthlyReadTime(0)
    )

    if (increasedRate > 0) {
      return (
        <div className="inline-flex items-baseline py-0.5 px-2.5 md:mt-2 lg:mt-0 text-sm font-medium text-green-800 bg-green-100 rounded-full">
          <ArrowSmUpIcon className="flex-shrink-0 self-center mr-0.5 -ml-1 w-5 h-5 text-green-500" />
          <span className="sr-only">Increased by</span>
          {rateOfReadTime(monthlyReadTime(1), monthlyReadTime(0))}%
        </div>
      )
    } else {
      return
    }
  }
  
  // Loading
  useEffect(()=>{
    if (userInfo && bookList) {
      setLoading(false)
    }
  },[userInfo, bookList])

  return(
    <section className="px-4 sm:px-6 bg-gray-100 rounded-md">
      <div className="grid grid-cols-1 divide-y">
        <div className="py-5 sm:py-6">
          <dt className="subtitle-section mb-2">今月の読書時間</dt>
          {loading ?
          <Skeleton width={"33%"}/>
          :
          <dd className="flex md:block lg:flex justify-between items-baseline">
            <div className="flex items-baseline text-2xl font-semibold text-tsundoku-brown-main">
              {monthlyReadTime(1)}
              <span className="ml-2 text-lg font-normal text-gray-900">
                分&nbsp;
              </span>
              <span className="ml-2 text-sm font-medium text-gray-500">
                先月 {monthlyReadTime(0)} 分
              </span>
            </div>

            {renderIncreasedRate()}
          </dd>
          }
        </div>
        
      </div>
    </section>
  )
}

export default HomeReadTimeSection