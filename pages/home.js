// ============================================================
// Imports
// ============================================================
import { Fragment, useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import useSWR from 'swr'
import moment from 'moment'
import { Steps, Hints } from 'intro.js-react'

// Components
import { AppHeader } from '../components/Header'
import { Footer } from '../components/Footer'
import { Disclosure, Transition } from '@headlessui/react'
import { Navbar } from '../components/Navbar'

//Context
import { AppContext } from '../context/state'

// Assets
import { PlusIcon, CheckCircleIcon, ExclamationIcon, XIcon, ChevronRightIcon } from '@heroicons/react/solid'
import 'intro.js/introjs.css'

// Functions
import { useAuth } from '../lib/auth'
import { updateSession } from '../lib/db'
import fetcher from '../utils/fetcher'
import classNames from '../utils/classNames'
import uselocalesFilter from '../utils/translate'

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

  // Fetch logged user info on client side
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

  // Fetch all sessions
  const { data: sessions } = useSWR(user ? '/api/session' : null, fetcher, {
    onErrorRetry: ({ retryCount }) => {
      // Retry up to 10 times
      if (retryCount >= 10) return
    }
  })

  // ============================================================
  // Routing
  // ============================================================

  const router = useRouter()

  useEffect(() => {
    if (user === false) {
      // If the access isn't authenticated, redirect to index page
      router.push('/')
    } else if (userInfo && !('name' in userInfo)) {
      // If the user signed in for the first time, they won't have a username
      // Redirect user to onboarding process
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
      intro: '都合の合うルームがなかったら、ルームを作成しましょう。'
    }
  ]

  const introjsInitialStep = 0

  // stepsEnabled when user finishes initial setup
  const introjsStepsEnabled = router.query.welcome === 'true' ? true : false

  // intro.js options
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

  // Check if the user is an owner or guest of any upcoming sessions
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

  // Hanldle alert state
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
  // Helper Functions
  // ============================================================

  // dateTimeISOString to datetime formatter
  const formatISOStringToDateTime = (datetimeIsoString) => {
    return moment(datetimeIsoString).format('M月D日 H:mm')
  }
  // dateTimeISOString to date formatter
  const formatISOStringToDate = (datetimeIsoString) => {
    return moment(datetimeIsoString).format('M月D日')
  }

  // ============================================================
  // Button Handlers
  // ============================================================

  // Handle session reservation
  const reserveSession = async (session) => {
    // If guestId has already been set, the user can't reserve the session
    // Redirect and show alert banner
    if (session.guestId) {
      await router.push({
        pathname: '/home',
        query: { successReserveRoom: false }
      })
    } else {
      // Set user's uid to guestId
      await updateSession(session.sessionId, {
        guestId: user.uid,
        guestName: userInfo.name
      })
      await setAlertAssort('reserve')
      await router.push({
        pathname: '/empty'
      })
      await router.replace({
        pathname: '/home',
        query: { successReserveRoom: true }
      })
    }
  }

  // ============================================================
  // Render Function
  // ============================================================

  const renderNoReserveRoomStatement = (sessions) => {
    return (
      <div className="text-center">現在、参加予定のルームはありません。</div>
    )
  }

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

  const renderSessionsGrid = (sessions) => {
    const startDates = sessions
      .filter((session) => {
        return !(
          session.ownerId == userInfo?.uid || session.guestId == userInfo?.uid
        )
      })
      .map((session) => {
        return moment(session.startDateTime).format('M月D日')
      })

    const duplicateDeletedStartDates = [...new Set(startDates)]

    return duplicateDeletedStartDates.map((startDate) => (
      <div key={startDate} className="relative">
        <div className="z-10 sticky top-0 bg-gray-50 mt-4 py-0.5 text-base font-bold">
          <h3>{startDate}</h3>
        </div>
        <ul
          role="list"
          className="py-2"
        >
          {sessions
            .filter((session) => {
              return (
                !(
                  session.ownerId == userInfo?.uid ||
                  session.guestId == userInfo?.uid
                ) && startDate == formatISOStringToDate(session.startDateTime)
              )
            })
            .map((session) => (
              <Disclosure key={session.sessionId}>
                {({ open }) => (
                  <li key={session.sessionId}>
                    <div className="w-full mb-5 bg-white rounded-lg border border-black divide-y divide-gray-200">
                      <div className="flex items-center justify-between p-4 space-x-6">
                        <div className="flex-1 truncate">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              <h3 className="session-card-date">
                                {formatISOStringToDateTime(
                                  session.startDateTime
                                )}
                                &nbsp;〜
                              </h3>
                            </div>
                          </div>
                          <div className="mt-1">
                            <span className="session-card-duration text-gray-500">
                              {`${session.duration} 分間 / 開催者：${session.ownerName}`} 
                            </span>
                          </div>
                        </div>
                        {open ? (
                          <Disclosure.Button className="">
                            <p className="px-8 py-2 bg-gray-200 text-black rounded-sm">閉じる</p>
                          </Disclosure.Button>
                        ) : (
                          <Disclosure.Button className="">
                            <p className="text-white text-bold bg-blue-500 py-3 px-6 rounded-sm">予約する</p>
                          </Disclosure.Button>
                        )}
                      </div>
                      {open && (
                        <div>
                          <Transition
                            enter="transition duration-100 ease-out"
                            enterFrom="transform scale-95 opacity-0"
                            enterTo="transform scale-100 opacity-100"
                            leave="transition duration-75 ease-out"
                            leaveFrom="transform scale-100 opacity-100"
                            leaveTo="transform scale-95 opacity-0"
                          >
                            <Disclosure.Panel>
                              <div className="-mt-px p-3 flex justify-end items-center divide-x divide-gray-200">
                                <div className="-ml-px flex items-center">
                                  
                                    <p className="text-sm text-black mr-4">
                                      このルームを予約しますか？
                                    </p>
                                    <div
                                      className="cursor-pointer relative border border-transparent rounded-br-lg hover:text-gray-500"
                                      onClick={() => reserveSession(session)}
                                    >
                                      <span className="inline-block px-10 py-2 border border-transparent text-base text-center rounded-sm text-white cursor-pointer bg-tsundoku-blue-main hover:bg-blue-700 focus:outline-none focus:ring-tsundoku-blue-main">
                                        確定
                                      </span>
                                    </div>
                                  
                                </div>
                              </div>
                            </Disclosure.Panel>
                          </Transition>
                        </div>
                      )}
                    </div>
                  </li>
                )}
              </Disclosure>
            ))}
        </ul>
      </div>
    ))
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
        <title>Tsundoku | ダッシュボード</title>
        <meta
          name="description"
          content="一緒に読書してくれる誰かを探すためのマッチングサービス"
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
            <div className="flex mt-12">
              <div className="max-w-7xl sm:w-full sm:px-12">
                <div className="py-3">
                  <div className="py-2 mb-4">
                    <h2 className="title-section">参加予定のルーム</h2>
                  </div>
                  {userIsOwnerOrGuest ? (
                  <ul
                    role="list"
                    className=""
                  >
                    
                    {sessions.map((session) =>
                      userInfo.uid == session.guestId ||
                      userInfo.uid == session.ownerId ? (
                        
                          <li key={session.sessionId}>
                            <div className="w-full mb-5 bg-white rounded-lg border border-black divide-y divide-gray-200">
                              <div className="flex items-center justify-between p-4 space-x-6">
                                <div className="flex-1 truncate">
                                  <div className="flex items-center space-x-3">
                                    <div className="flex items-center">
                                      <h3 className="session-card-date">
                                        {formatISOStringToDateTime(
                                          session.startDateTime
                                        )}
                                        &nbsp;〜
                                      </h3>
                                    </div>
                                  </div>
                                  <div className="mt-1">
                                    <span className="session-card-duration text-gray-500">
                                      {`${session.duration} 分間 / 開催者：${session.ownerName}`} 
                                    </span>
                                  </div>
                                </div>
                                <Link
                                  href={`/session/${session.sessionId}/detail`}
                                  key={session.sessionId}
                                >
                                  <a className="flex items-center py-3 px-6 hover:bg-gray-50">
                                    <p className="text-bold rounded-sm">詳細</p>
                                    <ChevronRightIcon className="w-6 h-6 " />
                                  </a>
                                </Link>
                              </div>
                            </div>
                          </li>
                          
                      ) : (
                        <></>
                      )
                    )}
                  </ul>
                  ) : (
                    <div className="text-center py-6 bg-gray-200 rounded-md">現在、参加予定のルームはありません。</div>
                  )}
                </div>
                <div className="py-3 mt-10">
                  <div className="flex sm:justify-end">
                    <div className="py-2 mb-4 sm:w-1/3">
                      <h2 className="title-section">ルーム一覧</h2>
                    </div>
                    <div className="w-full fixed z-50 -mx-4 sm:mx-0 bottom-0 shadow-lg sm:shadow-none sm:static">
                      <div className="bg-white sm:bg-gray-50 px-6 sm:px-0 py-4 sm:py-0">
                        <div className="flex justify-center sm:justify-end">
                          <Link href="/session/new">
                            <div className="block sm:inline-block w-full sm:w-auto px-6 py-2 border border-transparent text-base text-center font-bold rounded-md bg-gray-50 cursor-pointer text-tsundoku-blue-main hover:text-blue-700 focus:outline-none focus:ring-tsundoku-blue-main">
                              <div className="flex">
                                <PlusIcon className="w-6 h-6 inline-block mr-2" />
                                <span>ルームを作成する</span>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {renderNoEmptyRoomStatement(sessions)}
                  <nav className="h-full overflow-y-auto" aria-label="Directory">
                    {renderSessionsGrid(sessions)}
                  </nav>
                </div>
              </div>
              <div className="sm:w-96">
                  <div className="px-4 py-6 border border-black rounded-md">
                    <h3>ブックリスト</h3>
                  </div>
                  <div className="mt-4 px-4 py-6 border border-black rounded-md">
                    <h3>みんなのリスト(人気)</h3>
                  </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}