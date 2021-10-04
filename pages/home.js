// ============================================================
// Imports
// ============================================================
import { Fragment, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
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
import { PlusIcon, PlusCircleIcon } from '@heroicons/react/solid'
import { BookOpenIcon } from '@heroicons/react/outline'
import 'intro.js/introjs.css'

// Functions
import { useAuth } from '../lib/auth'
import { updateSession } from '../lib/db'
import fetcher from '../utils/fetcher'
import classNames from '../utils/classNames'
import uselocalesFilter from '../utils/translate'
import { ChevronRightIcon } from '@heroicons/react/outline'

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

  console.log('stats:', stats)

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

  console.log(monthlyReadTime())

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
        <div className="text-center">現在、予約可能なルームはありません。</div>
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
                        <a className="group flex inline-block items-center py-2 w-auto text-base font-bold hover:text-blue-700 text-tsundoku-blue-main onboarding-3">
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
                <section className="py-3 px-2 mb-8 bg-white rounded-lg border border-gray-500">
                  <Link href="/booklist">
                    <a className="flex justify-between items-center py-2 px-2 mb-2 hover:bg-gray-100 rounded-lg">
                      <h3 className="subtitle-section">ブックリスト</h3>
                      <ChevronRightIcon className="-mr-1.5 w-6 h-6" />
                    </a>
                  </Link>
                  <ul className="px-2 mb-4">
                    {bookList?.map(({ bookInfo }) => {
                      return (
                        <li className="mb-2" key={bookInfo.bid}>
                          <div className="flex items-center space-x-2">
                            <div className="flex flex-shrink-0 justify-center items-center">
                              {bookInfo.bid == userInfo.isReading ? (
                                <BookOpenIcon className="w-6 h-6 text-blue-500" />
                              ) : (
                                <span
                                  className="inline-block w-6 h-6"
                                  aria-hidden="true"
                                />
                              )}
                            </div>

                            <div className="overflow-hidden flex-1">
                              <p className="text-gray-500 truncate">
                                {bookInfo?.title}
                              </p>
                            </div>
                            {/* <div className="flex flex-shrink-0 justify-center items-center">
                              <div className="flex">
                                <svg
                                  className=" mr-1.5 w-1.5 h-6 text-blue-100"
                                  fill="currentColor"
                                  viewBox="0 0 5 20"
                                >
                                  <rect
                                    x="0"
                                    y="0"
                                    r="1"
                                    width="5"
                                    height="20"
                                  />
                                </svg>
                                <svg
                                  className=" mr-1.5 -ml-0.5 w-1.5 h-6 text-blue-200"
                                  fill="currentColor"
                                  viewBox="0 0 5 20"
                                >
                                  <rect
                                    x="0"
                                    y="0"
                                    r="1"
                                    width="5"
                                    height="20"
                                  />
                                </svg>
                                <svg
                                  className=" mr-1.5 -ml-0.5 w-1.5 h-6 text-blue-300"
                                  fill="currentColor"
                                  viewBox="0 0 5 20"
                                >
                                  <rect
                                    x="0"
                                    y="0"
                                    r="1"
                                    width="5"
                                    height="20"
                                  />
                                </svg>
                                <svg
                                  className=" mr-1.5 -ml-0.5 w-1.5 h-6 text-blue-400"
                                  fill="currentColor"
                                  viewBox="0 0 5 20"
                                >
                                  <rect
                                    x="0"
                                    y="0"
                                    r="1"
                                    width="5"
                                    height="20"
                                  />
                                </svg>
                                <svg
                                  className=" mr-1.5 -ml-0.5 w-1.5 h-6 text-blue-500"
                                  fill="currentColor"
                                  viewBox="0 0 5 20"
                                >
                                  <rect
                                    x="0"
                                    y="0"
                                    r="1"
                                    width="5"
                                    height="20"
                                  />
                                </svg>
                              </div>
                            </div> */}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                  {/* <div className="flex justify-end px-2">
                    <Link href="/booklist">
                      <a className="group flex items-center space-x-1">
                        <PlusCircleIcon className="w-5 h-5 text-gray-700 group-hover:text-gray-600" />
                        <span className="text-sm text-gray-500 group-hover:text-gray-400">
                          リストに追加する
                        </span>
                      </a>
                    </Link>
                  </div> */}
                </section>
                <section className="mb-8">
                  <h3 className="subtitle-section">みんなのリスト(人気)</h3>
                </section>
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
