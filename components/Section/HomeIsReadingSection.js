// Basic
import { useState, useEffect } from 'react'

// Vercel
import Image from 'next/image'
import Link from 'next/link'

//Component
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

// Function
import { useUserInfo } from '../../context/useUserInfo'
import { useUserBookList } from '../../context/useUserBookList'

const HomeIsReadingSection = () => {
  let [loading, setLoading] = useState(true)

  const { userInfo, error} = useUserInfo()
  const bookList = useUserBookList(userInfo?.uid)
  
  // Loading
  useEffect(()=>{
    if (userInfo && bookList) {
      setLoading(false)
    }
  },[userInfo, bookList])

  return(
    <section className="py-5 sm:py-6 px-4 sm:px-6 my-8 bg-gray-100 rounded-md">
      <h3 className="mb-4 subtitle-section">いま読んでいる本</h3>
      <div>
        {loading ?
        <div>
          <div className="relative mx-auto w-24 h-32">
            <Skeleton height="100%"/>
          </div>
          <dl className="mt-4">
            <dt className="text-sm font-bold">
              タイトル
            </dt>
            <dd><Skeleton /></dd>
            <dt className="mt-2 text-sm font-bold">
              著者
            </dt>
            <Skeleton count={2} width="50%"/>
          </dl>
        </div>
        :
        userInfo.isReading && bookList ? (
          <>
            {bookList.filter(({ bookInfo }) => {
                return bookInfo.bid == userInfo.isReading
              })
              .map(({ bookInfo }) => {
                return (
                  <div key={bookInfo.bid}>
                    <div className="relative mx-auto w-24 h-32">
                      <Image
                        className="object-contain filter drop-shadow-md"
                        layout={'fill'}
                        src={
                          bookInfo.image
                            ? bookInfo.image
                            : '/img/placeholder/noimage_480x640.jpg'
                        }
                        alt="book-cover"
                      />
                    </div>
                    <dl className="mt-4">
                      <dt className="text-sm font-bold">
                        タイトル
                      </dt>
                      <dd>{bookInfo.title}</dd>
                      <dt className="mt-2 text-sm font-bold">
                        著者
                      </dt>
                      {bookInfo.authors.map((author) => {
                        return <dd key={author}>{author}</dd>
                      })}
                    </dl>
                  </div>
                )
              })}
          </>
        ) : (
          <div className="text-center">
            <p className="text-sm sm:text-base text-gray-900">
              『いま読んでいる本』は選択されていません。
            </p>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              <Link href="/booklist">
                <a className="text-blue-500">ブックリスト</a>
              </Link>
              から選択できます。
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default HomeIsReadingSection