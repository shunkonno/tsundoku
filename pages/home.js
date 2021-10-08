// ============================================================
// Imports
// ============================================================
import { Fragment, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import useSWR, { useSWRConfig } from 'swr'
import { Steps, Hints } from 'intro.js-react'

// Components
import { AppHeader } from '../components/Header'
import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'
import { ReservedRoomCard } from '../components/Card'
import { ReservableRoomList } from '../components/List'
import { GeneralAlert } from '../components/Alert'

//Context
import { AppContext } from '../context/state'

// Assets
import { PlusIcon, PlusCircleIcon,ArrowSmUpIcon } from '@heroicons/react/solid'
import { BookOpenIcon } from '@heroicons/react/outline'
import 'intro.js/introjs.css'

// Functions
import { useAuth } from '../lib/auth'
import { updateSession } from '../lib/db'
import fetcher from '../utils/fetcher'
import classNames from '../utils/classNames'
import uselocalesFilter from '../utils/translate'
import { ChevronRightIcon } from '@heroicons/react/outline'
import { toPath } from 'lodash'

export default function Home() {
  // ============================================================
  // Contexts
  // ============================================================
  const { alertOpen, setAlertOpen, alertAssort, setAlertAssort } =
    useContext(AppContext)

  // ============================================================
  // Auth
  // ============================================================

  const auth = useAuth()
  const user = auth.user

  // ============================================================
  // Fetch Data
  // ============================================================

  const { mutate } = useSWRConfig()

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

  // セッション情報
  const { data: sessions } = useSWR(user ? '/api/session' : null, fetcher, {
    onErrorRetry: ({ retryCount }) => {
      // Retry up to 10 times
      if (retryCount >= 10) return
    }
  })

  // ブックリスト
  const { data: bookList } = useSWR(
    user ? '/api/user/' + user.uid + '/booklist' : null,
    fetcher,
    {
      onErrorRetry: ({ retryCount }) => {
        // Retry up to 10 times
        if (retryCount >= 10) return
      }
    }
  )
  console.log(bookList)
  console.log(userInfo?.isReading)

  // 利用情報
  const { data: stats } = useSWR(
    user ? '/api/user/' + user.uid + '/stats' : null,
    fetcher,
    {
      onErrorRetry: ({ retryCount }) => {
        // Retry up to 10 times
        if (retryCount >= 10) return
      }
    }
  )

  console.log('stats:', stats?.readTime)

  // ============================================================
  // Routing
  // ============================================================

  const router = useRouter()

  useEffect(() => {
    if (user === false) {
      // 認証されていないユーザーは、index へリダイレクト
      router.push('/')
    } else if (userInfo?.isNewUser) {
      // はじめてログインしたユーザーを設定画面へリダイレクト
      router.push('/settings/new')
    }
  })

  // ============================================================
  // Localization
  // ============================================================
  const { locale } = router
  const t = uselocalesFilter('home', locale)

  // ============================================================
  // Onboarding Steps (intro.js)
  // ============================================================
  const introjsSteps = [
    {
      element: '.onboarding-1',
      intro: 'この一覧から、参加するルームを予約することができます。'
    },
    {
      element: '.onboarding-2',
      intro: '予約したルームはここに表示されます。'
    },
    {
      element: '.onboarding-3',
      intro: '都合の合うルームがなかったら、ルームを作成しましょう。'
    }
  ]

  const introjsInitialStep = 0

  // 初期設定が完了し、home に ?welcome=true でリダイレクトされたときに、イントロダクションを起動する
  const introjsStepsEnabled = router.query.welcome === 'true' ? true : false

  // intro.js 設定
  const introjsOptions = {
    nextLabel: '次へ',
    prevLabel: '戻る',
    doneLabel: '完了',
    hidePrev: true
  }

  const introjsOnExit = () => {
    return
  }

  // ============================================================
  // User-related States
  // ============================================================

  // ログインしているユーザーが、セッションのオーナー・ゲストか判定する
  var userIsOwnerOrGuest

  if (sessions) {
    userIsOwnerOrGuest = sessions.some((session) => {
      return (
        userInfo?.uid == session?.guestId || userInfo?.uid == session?.ownerId
      )
    })
  }

  // ============================================================
  // Helper Functions
  // ===========================================================
  const monthlyReadTime = () => {
    const currentDateTime = new Date()
    const currentYear = currentDateTime.getFullYear()
    const currentMonth = currentDateTime.getMonth() + 1

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
  const lastMonthReadTime = () => {
    const currentDateTime = new Date()
    const currentYear = currentDateTime.getFullYear()
    const lastMonth = currentDateTime.getMonth()

    const readTime = stats?.readTime

    if (readTime?.[currentYear]?.[lastMonth]) {
      // 先月の月のデータが存在する場合
      var lastMonthReadTime = 0

      // 先月分を array に集約
      const readTimeArray = Object.values(readTime[currentYear][lastMonth])

      // lastMonthReadTime に加算
      readTimeArray.forEach((readTime) => {
        lastMonthReadTime += readTime
      })

      return lastMonthReadTime
    } else {
      // 先月の月のデータが存在しない場合 (=先月未利用)
      const lastMonthReadTime = 0
      return lastMonthReadTime
    }
  }

  console.log(monthlyReadTime())
  console.log(lastMonthReadTime())

  // ============================================================
  // Button Handlers
  // ============================================================

  // セッション予約ボタン
  const reserveSession = async (sessionId, guestId) => {
    if (guestId) {
      // guestId がすでに設定されている場合、予約することができない

      // アラートの設定
      await setAlertAssort('failed')
    } else {
      // guestId 未設定であれば、当ユーザーをIDを設定する

      // セッション情報の更新
      await updateSession(sessionId, {
        guestId: user.uid,
        guestName: userInfo.name
      })

      // 画面をリフレッシュ
      mutate('/api/session')

      // アラートの設定
      await setAlertAssort('reserve')
    }
  }

  // ============================================================
  // Render Function
  // ============================================================

  const renderNoEmptyRoomStatement = (sessions) => {
    const filteredList = sessions.filter((session) => {
      return !(
        session?.ownerId == userInfo?.uid || session?.guestId == userInfo?.uid
      )
    })

    if (!filteredList.length) {
      return (
        <div className="mt-4 text-center">現在、予約可能なルームはありません。</div>
      )
    }
  }

  // ============================================================
  // Return
  // ============================================================
  if (user === null || !userInfo || !sessions) {
    return <div>Waiting..</div>
  }

  return (
    <div>
      <Head>
        <title>Tsundoku | ホーム</title>
        <meta
          name="description"
          content="Tsundoku (積ん読・ツンドク) は他の誰かと読書する、ペア読書サービスです。集中した読書は自己研鑽だけでなく、リラックス効果もあります。"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <GeneralAlert
        alertOpen={alertOpen}
        alertAssort={alertAssort}
        setAlertOpen={setAlertOpen}
        setAlertAssort={setAlertAssort}
      />

      <AppHeader />

      {/* intro.js */}
      <Steps
        enabled={introjsStepsEnabled}
        steps={introjsSteps}
        options={introjsOptions}
        initialStep={introjsInitialStep}
        onExit={introjsOnExit}
      />

      {/* main content */}
      <div className="overflow-hidden relative pb-16 bg-gray-50">
        <div className="sm:block sm:w-full sm:h-full" aria-hidden="true">
          <main className="relative sm:py-4 px-4 mx-auto max-w-7xl">
            <Navbar />
            <div className="flex gap-14 mt-8 sm:mt-16">
              {/* 左カラム -- START */}
              <div className="w-full sm:w-2/3 max-w-7xl">
                <section className="pb-3">
                  <div className="pb-2 mb-4">
                    <h2 className="title-section onboarding-2">
                      参加予定のルーム
                    </h2>
                  </div>
                  {userIsOwnerOrGuest ? (
                    <ul role="list" className="">
                      {sessions.map((session) =>
                        userInfo.uid == session.guestId ||
                        userInfo.uid == session.ownerId ? (
                          <li key={session?.sessionId} className="mb-5">
                            <ReservedRoomCard {...session} />
                          </li>
                        ) : (
                          <></>
                        )
                      )}
                    </ul>
                  ) : (
                    <div className="py-6 text-center bg-gray-200 rounded-md">
                      現在、参加予定のルームはありません。
                    </div>
                  )}
                </section>
                <section className="py-3 mt-10">
                  <div className="flex justify-between items-center">
                    <div className="flex-shrink-0">
                      <h2 className="title-section onboarding-1">ルーム一覧</h2>
                    </div>
                    <div className="flex flex-1 justify-end">
                      <Link href="/session/new" passHref>
                        <a className="group flex items-center py-2 w-auto text-base font-bold hover:text-blue-700 text-tsundoku-blue-main onboarding-3">
                          <PlusIcon className="inline-block mr-2 w-6 h-6" />
                          <span>ルームを作成する</span>
                        </a>
                      </Link>
                    </div>
                  </div>

                  {renderNoEmptyRoomStatement(sessions)}
                  <nav
                    className="overflow-y-auto h-full"
                    aria-label="Directory"
                  >
                    <ReservableRoomList
                      reserveSession={reserveSession}
                      sessions={sessions}
                      {...userInfo}
                    />
                  </nav>
                </section>
              </div>
              {/* 左カラム -- END */}

              {/* 右カラム -- START */}
              <div className="hidden sm:block sm:w-1/3">
                <section className="px-4 sm:px-6 bg-white rounded-lg border border-gray-500">
                <div className="grid grid-cols-1 divide-y">
                  <div className="py-5 sm:py-6">
                    <dt className="text-base font-normal text-gray-900">
                      今月の読書時間
                    </dt>
                    <dd className="flex md:block lg:flex justify-between items-baseline mt-1">
                      <div className="flex items-baseline text-2xl font-semibold text-tsundoku-brown-main">
                        {monthlyReadTime()}
                        <span className="ml-2 text-lg font-normal text-gray-900">
                          分 :
                        </span>
                        <span className="ml-2 text-sm font-medium text-gray-500">
                          先月 {lastMonthReadTime()} 分
                        </span>
                      </div>

                      <div className="inline-flex items-baseline py-0.5 px-2.5 md:mt-2 lg:mt-0 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                        
                        <ArrowSmUpIcon className="flex-shrink-0 self-center mr-0.5 -ml-1 w-5 h-5 text-green-500" />
                        <span className="sr-only">
                          Increased by
                        </span>
                        {Math.round(monthlyReadTime() / lastMonthReadTime() * 100 - 100)}%
                      </div>
                    </dd>
                  </div>
                  <div  className="py-5 sm:py-6">
                    <dt className="text-base font-normal text-gray-900">
                      今月の読書ページ数(推定)
                    </dt>
                    <dd className="flex md:block lg:flex justify-between items-baseline mt-1">
                      <div className="flex items-baseline text-2xl font-semibold text-tsundoku-brown-main">
                        ---
                        <span className="ml-2 text-sm font-medium text-gray-500">
                          先月 ---
                        </span>
                      </div>

                      <div className="inline-flex items-baseline py-0.5 px-2.5 md:mt-2 lg:mt-0 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                        
                        <ArrowSmUpIcon className="flex-shrink-0 self-center mr-0.5 -ml-1 w-5 h-5 text-green-500" />
                        <span className="sr-only">
                          Increased by
                        </span>
                        999%
                      </div>
                    </dd>
                  </div>
                </div>
                </section>
                <section className="py-3 px-4 my-8 bg-white rounded-lg border border-gray-500">
                    <h3 className="mb-4 subtitle-section">いま読んでいる本</h3>
                  <div className="">
                  {userInfo?.isReading && bookList ?
                  <>
                    {bookList?.filter(({bookInfo})=>{
                      return bookInfo.bid == userInfo.isReading
                    })
                    .map(({ bookInfo }) => {
                      console.log(bookInfo)
                      return (
                        <div className="" key={bookInfo.bid}>
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
                            <dt className="text-sm font-bold">タイトル</dt>
                            <dd>{bookInfo.title}</dd>
                            <dt className="mt-2 text-sm font-bold">著者</dt>
                          {bookInfo.authors.map((author) => {
                            return <dd key="author">{author}</dd>
                          })
                          }
                          
                          </dl>
                        </div>
                      )
                    })}
                    </>
                    :
                    <div className="text-center">
                      <p className="text-sm sm:text-base text-gray-900">
                          『いま読んでいる本』は選択されていません。
                        </p>
                        <p className="mt-2 text-xs sm:text-sm text-gray-500">
                          <Link href="/booklist"><a className="text-blue-500">ブックリスト</a></Link>から選択できます。
                        </p>
                    </div>
                    }
                  </div>
                  
                </section>
                {/* 新規機能:みんなのリストが実装されたら解放*/}
                {/* <section className="mb-8">
                  <h3 className="subtitle-section">みんなのリスト(人気)</h3>
                </section> */}
              </div>
              {/* 右カラム -- START */}
            </div>
          </main>
        </div>
      </div>

      <Footer />

      {/* スマホ時、コンテンツとNavbarが重なるのを防ぐ */}
      <div className="sm:hidden h-16 bg-gray" />
    </div>
  )
}
