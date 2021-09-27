// ============================================================
// Imports
// ============================================================
import { Fragment, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import useSWR from 'swr'
import { Steps, Hints } from 'intro.js-react'

// Components
import { AppHeader } from '../components/Header'
import { Footer } from '../components/Footer'
import { Transition } from '@headlessui/react'
import { Navbar } from '../components/Navbar'
import { ReservedRoomCard } from '../components/Card'
import { ReservableRoomList } from '../components/List'

//Context
import { AppContext } from '../context/state'

// Assets
import {
  PlusIcon,
  CheckCircleIcon,
  ExclamationIcon,
  XIcon,
  PlusCircleIcon
} from '@heroicons/react/solid'
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

  console.log('bookList: ', bookList)

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
  // Alert Handlers
  // ============================================================

  // アラート
  useEffect(() => {
    if (alertAssort) {
      setAlertOpen(true)
      setTimeout(async () => {
        await setAlertOpen(false)
        await setAlertAssort('')
      }, 5000)
    } else {
      setAlertAssort('')
    }
  }, [alertAssort, setAlertAssort, setAlertOpen])

  // ============================================================
  // Button Handlers
  // ============================================================

  // セッション予約ボタン
  const reserveSession = async (sessionId, guestId) => {
    if (guestId) {
      // guestId がすでに設定されている場合、予約することができない

      // アラートの設定
      await setAlertAssort('failed')
      // ページのリフレッシュ
      await router.push({
        pathname: '/empty'
      })
      await router.replace({
        pathname: '/home'
      })
    } else {
      // guestId 未設定であれば、当ユーザーをIDを設定する

      // セッション情報の更新
      await updateSession(sessionId, {
        guestId: user.uid,
        guestName: userInfo.name
      })

      // アラートの設定
      await setAlertAssort('reserve')

      // ページのリフレッシュ
      await router.push({
        pathname: '/empty'
      })
      await router.replace({
        pathname: '/home'
      })
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

  const renderAlert = (alertAssort) => (
    <div className="relative w-full flex justify-center">
      <Transition
        show={alertOpen}
        as={Fragment}
        enter="transition duration-75"
        enterFrom="transform -translate-y-1/4 opacity-0"
        enterTo="transform -translate-y-0 opacity-95"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-95"
        leaveTo="opacity-0"
      >
        <div className="absolute z-10 w-full sm:w-1/3 px-4">
          <div className="opacity-95">
            <div
              className={classNames(
                (alertAssort == 'create' || alertAssort == 'reserve') &&
                  'bg-green-50',
                (alertAssort == 'cancel' || alertAssort == 'delete') &&
                  'bg-gray-200',
                alertAssort == 'failed' &&
                  'bg-yellow-50 border-yellow-400 border-l-4',
                'rounded-b-md p-4'
              )}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  {
                    ((alertAssort == 'create' || alertAssort == 'reserve') && (
                      <CheckCircleIcon
                        className="h-5 w-5 text-green-400"
                        aria-hidden="true"
                      />
                    ),
                    (alertAssort == 'cancel' || alertAssort == 'delete') && (
                      <CheckCircleIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    ),
                    alertAssort == 'failed' && (
                      <ExclamationIcon
                        className="h-5 w-5 text-yellow-400"
                        aria-hidden="true"
                      />
                    ))
                  }
                </div>
                <div className="ml-3">
                  <p
                    className={classNames(
                      (alertAssort == 'create' || alertAssort == 'reserve') &&
                        'text-green-800',
                      (alertAssort == 'cancel' || alertAssort == 'delete') &&
                        'text-gray-800',
                      alertAssort == 'failed' && 'text-yellow-800',
                      'text-sm font-medium'
                    )}
                  >
                    {alertAssort == 'create' && 'ルームを作成しました。'}
                    {alertAssort == 'reserve' && 'ルームの予約が完了しました。'}
                    {alertAssort == 'cancel' &&
                      'ルームの予約を取り消しました。'}
                    {alertAssort == 'delete' && 'ルームを削除しました。'}
                    {alertAssort == 'failed' &&
                      '選択したルームは満員のため予約できませんでした。申し訳ございません。'}
                  </p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      className={classNames(
                        (alertAssort == 'create' || alertAssort == 'reserve') &&
                          'bg-green-50  text-green-500 hover:bg-green-100 focus:ring-offset-green-50 focus:ring-green-600',
                        (alertAssort == 'cancel' || alertAssort == 'delete') &&
                          'bg-gray-200 text-gray-500 hover:bg-gray-100 focus:ring-offset-gray-50 focus:ring-gray-600',
                        alertAssort == 'failed' &&
                          'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-offset-green-50 focus:ring-yellow-600',
                        'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2'
                      )}
                      onClick={() => {
                        setAlertOpen(false)
                        setAlertAssort('')
                      }}
                    >
                      <span className="sr-only">Dismiss</span>
                      <XIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  )

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

      {renderAlert(alertAssort)}

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
      <div className="relative pb-16 bg-gray-50 overflow-hidden">
        <div className="sm:block sm:h-full sm:w-full" aria-hidden="true">
          <main className="relative mx-auto max-w-7xl px-4 sm:py-4">
            <Navbar />
            <div className="flex mt-8 sm:mt-16 gap-14">
              {/* 左カラム -- START */}
              <div className="max-w-7xl w-full sm:w-2/3">
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
                    <div className="text-center py-6 bg-gray-200 rounded-md">
                      現在、参加予定のルームはありません。
                    </div>
                  )}
                </section>
                <section className="py-3 mt-10">
                  <div className="flex justify-between items-center">
                    <div className="flex-shrink-0">
                      <h2 className="title-section onboarding-1">ルーム一覧</h2>
                    </div>
                    <div className="flex-1 flex justify-end">
                      <Link href="/session/new" passHref>
                        <a className="group inline-block w-auto py-2 text-base font-bold text-tsundoku-blue-main hover:text-blue-700 onboarding-3">
                          <PlusIcon className="w-6 h-6 inline-block mr-2" />
                          <span>ルームを作成する</span>
                        </a>
                      </Link>
                    </div>
                  </div>

                  {renderNoEmptyRoomStatement(sessions)}
                  <nav
                    className="h-full overflow-y-auto"
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
                <section className="mb-8 bg-white border border-gray-500 px-2 py-3 rounded-lg">
                  <Link href="/booklist">
                    <a className="flex justify-between items-center mb-2 px-2 py-2 rounded-lg hover:bg-gray-100">
                      <h3 className="subtitle-section">ブックリスト</h3>
                      <ChevronRightIcon className="w-6 h-6 -mr-1.5" />
                    </a>
                  </Link>
                  <ul className="px-2 mb-4">
                    {bookList?.map(({ bookInfo }) => {
                      return (
                        <li className="mb-2">
                          <div className="flex items-center">
                            <span
                              className="w-5 h-5 mr-2 inline-block bg-tsundoku-blue-main rounded-full"
                              aria-hidden="true"
                            />
                            <p className="text-gray-500">{bookInfo?.title}</p>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                  <div className="flex justify-end px-2">
                    <Link href="/booklist">
                      <a className="group flex items-center space-x-1">
                        <PlusCircleIcon className="w-5 h-5 text-gray-700 group-hover:text-gray-600" />
                        <span className="text-sm text-gray-500 group-hover:text-gray-400">
                          リストに追加する
                        </span>
                      </a>
                    </Link>
                  </div>
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
      <div className="h-16 sm:hidden bg-gray" />
    </div>
  )
}
