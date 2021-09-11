// ============================================================
// Imports
// ============================================================
import { Fragment, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import useSWR from 'swr'
import moment from 'moment'

// Components
import { AppHeader } from '../components/Header'
import { Footer } from '../components/Footer'
import { Disclosure, Transition } from '@headlessui/react'

//Assets
import { CheckCircleIcon, ExclamationIcon, XIcon } from '@heroicons/react/solid'

// Functions
import uselocalesFilter from '../utils/translate'
import { useAuth } from '../lib/auth'
import fetcher from '../utils/fetcher'
import { updateSession } from '../lib/db'
import classNames from '../utils/classNames'

export default function Dashboard() {
  // ============================================================
  // Initialize
  // ============================================================

  //Initial State
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertAssort, setAlertAssort] = useState('') // create, reserve, cancel, failed

  // Auth
  const auth = useAuth()
  const user = auth.user

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

  console.log(sessions)

  // Routing
  const router = useRouter()

  useEffect(() => {
    if (user === false) {
      // If the access isn't authenticated, redirect to index page
      router.push('/')
    } else if (
      userInfo &&
      !('name' in userInfo) &&
      router.query.welcome !== 'true'
    ) {
      // If the user signed in for the first time, they won't have a username
      // Redirect user to onboarding process, as long as the welcome parameter is not set to true
      // The welcome parameter is set to true when the user submits form in onboarding process
      router.push('/settings/new')
    }
  })

  // Function
  const alertControl = async (alertAssort) => {
    await setAlertOpen(true)
    await setAlertAssort(alertAssort)
    setTimeout(async () => {
      await setAlertOpen(false)
    }, 5000)
  }

  //alertControl by parameter
  useEffect(() => {
    if (router.query.successCreateRoom == 'true') {
      alertControl('create')
    } else if (router.query.successReserveRoom == 'true') {
      alertControl('reserve')
    } else if (router.query.successReserveRoom == 'false') {
      alertControl('failed')
    } else if (router.query.successCancelRoom == 'true') {
      alertControl('cancel')
    } else {
      setAlertAssort('')
    }
  }, [])

  // Function
  const formatDateTime = (datetimeIsoString) => {
    return moment(datetimeIsoString).format('M月D日 H:mm')
  }

  // Set locale
  const { locale } = router
  const t = uselocalesFilter('dashboard', locale)

  //checkJoinRoomExist すべてのセッションのguestIdからログイン中のguestIdが1つでも一致していればtrue。1つもなければfalse。
  let checkResult
  if (sessions) {
    checkResult = sessions.some((session) => {
      return (
        userInfo?.uid == session.guestId || userInfo?.uid == session.ownerId
      )
    })
  }

  // ============================================================
  // Render Function
  // ============================================================

  const renderNoRoomStatement = (sessions) => {
    const filteredList = sessions.filter((session) => {
      return !(
        session.ownerId == userInfo?.uid || session.guestId == userInfo?.uid
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
                alertAssort == 'create' ||
                  (alertAssort == 'reserve' && 'bg-green-50'),
                alertAssort == 'cancel' && 'bg-gray-200',
                alertAssort == 'failed' &&
                  'bg-yellow-50 border-yellow-400 border-l-4',
                'rounded-b-md p-4'
              )}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon
                    className={classNames(
                      alertAssort == 'create' ||
                        (alertAssort == 'reserve' && 'text-green-400'),
                      alertAssort == 'cancel' && 'text-gray-400',
                      alertAssort == 'failed' && 'text-yellow-400',
                      'h-5 w-5'
                    )}
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <p
                    className={classNames(
                      alertAssort == 'create' ||
                        (alertAssort == 'reserve' && 'text-green-800'),
                      alertAssort == 'cancel' && 'text-gray-800',
                      alertAssort == 'failed' && 'text-yellow-800',
                      'text-sm font-medium'
                    )}
                  >
                    {alertAssort == 'create' ||
                      (alertAssort == 'reserve' &&
                        'ルームの予約が完了しました。')}
                    {alertAssort == 'cancel' &&
                      'ルームの予約を取り消しました。'}
                    {alertAssort == 'failed' &&
                      '選択したルームは満員のため予約できませんでした。申し訳ございません。'}
                  </p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      className={classNames(
                        alertAssort == 'create' ||
                          (alertAssort == 'reserve' &&
                            'bg-green-50  text-green-500 hover:bg-green-100 focus:ring-offset-green-50 focus:ring-green-600'),
                        alertAssort == 'cancel' &&
                          'bg-gray-200 text-gray-500 hover:bg-gray-100 focus:ring-offset-gray-50 focus:ring-gray-600',
                        alertAssort == 'failed' &&
                          'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-offset-green-50 focus:ring-yellow-600',
                        'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2'
                      )}
                      onClick={() => setAlertOpen(false)}
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
  // Button Handler
  // ============================================================

  // Handle session reservation
  const reserveSession = async (session) => {
    // If guestId has already been set, the user can't reserve the session
    // Redirect and show alert banner
    if (session.guestId) {
      await router.push({
        pathname: '/dashboard',
        query: { successReserveRoom: false }
      })
    } else {
      // Set user's uid to guestId
      await updateSession(session.sessionId, { guestId: user.uid })
      await router.push({
        pathname: '/empty'
      })
      await router.replace({
        pathname: '/dashboard',
        query: { successReserveRoom: true }
      })
    }
  }

  // ============================================================
  // Return Page
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

      {/* main content */}
      <div className="relative pb-16 bg-gray-50 overflow-hidden">
        <div className="sm:block sm:h-full sm:w-full" aria-hidden="true">
          <main className="relative mx-auto max-w-5xl px-4 sm:py-8">
            <div className="w-full fixed z-10 -mx-4 sm:mx-0 bottom-0 shadow-lg sm:shadow-none sm:static">
              <div className="bg-white sm:bg-gray-50 px-6 sm:px-0 py-4 sm:py-0">
                <div className="flex justify-center sm:justify-end">
                  <Link href="/session/new">
                    <a className="block w-full sm:w-auto px-6 py-2 border border-transparent text-base text-center font-bold rounded-md shadow-sm text-white bg-tsundoku-blue-main hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tsundoku-blue-main">
                      ルームを作成する
                    </a>
                  </Link>
                </div>
              </div>
            </div>
            {checkResult ? (
              <div className="py-3">
                <div className="border-b-2 border-blue-700 py-2 mb-4">
                  <h2 className="title-section">参加予定のルーム</h2>
                </div>
                <ul
                  role="list"
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {sessions.map((session) =>
                    userInfo.uid == session.guestId ||
                    userInfo.uid == session.ownerId ? (
                      <Link
                        href={`/session/${session.sessionId}/detail`}
                        key={session.sessionId}
                      >
                        <a>
                          <li>
                            <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
                              <div className="w-full flex items-center justify-between p-6 space-x-6">
                                <div className="flex-1 truncate">
                                  <div className="flex items-center space-x-3">
                                    <div className="flex items-center">
                                      {/* <img
                                        className="w-10 h-10 mr-4 mb-2 bg-gray-300 rounded-full flex-shrink-0"
                                        src={session.imageUrl}
                                        alt=""
                                      /> */}
                                      <h3 className="session-card-date">
                                        {formatDateTime(session.startDateTime)}
                                        &nbsp;〜
                                      </h3>
                                    </div>
                                  </div>
                                  <div className="mt-1">
                                    <p className="session-card-duration">
                                      予定時間：{session.duration} 分間
                                    </p>
                                  </div>
                                  <div className="mt-4">
                                    <p className="session-card-owner">
                                      ルーム作成者：{session.ownerName}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        </a>
                      </Link>
                    ) : (
                      <></>
                    )
                  )}
                </ul>
              </div>
            ) : (
              <></>
            )}
            <div className="py-3 mt-4">
              <div className="border-b-2 border-gray-900 py-2 mb-4">
                <h2 className="title-section">空きルーム一覧</h2>
              </div>
              <ul
                role="list"
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {sessions
                  .filter((session) => {
                    return !(
                      session.ownerId == userInfo?.uid ||
                      session.guestId == userInfo?.uid
                    )
                  })
                  .map((session) => (
                    <Disclosure key={session.sessionId}>
                      {({ open }) => (
                        <li key={session.sessionId}>
                          <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
                            <div className="w-full flex items-center justify-between p-6 space-x-6">
                              <div className="flex-1 truncate">
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center">
                                    {/* <img
                                      className="w-10 h-10 mr-4 mb-2 bg-gray-300 rounded-full flex-shrink-0"
                                      src={session.imageUrl}
                                      alt=""
                                    /> */}
                                    <h3 className="session-card-date">
                                      {formatDateTime(session.startDateTime)}
                                      &nbsp;〜
                                    </h3>
                                  </div>
                                </div>
                                <div className="mt-1">
                                  <p className="session-card-duration">
                                    予定時間：{session.duration} 分間
                                  </p>
                                </div>
                                <div className="mt-4">
                                  <p className="session-card-owner">
                                    開催者：{session.ownerName}
                                  </p>
                                </div>
                              </div>
                              {open ? (
                                <Disclosure.Button className="">
                                  <p className="text-gray-500">閉じる</p>
                                </Disclosure.Button>
                              ) : (
                                <Disclosure.Button className="">
                                  <p className="text-blue-500">予約する</p>
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
                                  <Disclosure.Panel className="text-gray-500">
                                    <div className="-mt-px p-3 flex justify-center divide-x divide-gray-200">
                                      <div className="-ml-px flex flex-col items-center">
                                        <p className="text-sm">
                                          このルームを予約しますか？
                                        </p>
                                        <div
                                          className="relative mt-3 border border-transparent rounded-br-lg hover:text-gray-500"
                                          onClick={() =>
                                            reserveSession(session)
                                          }
                                        >
                                          <span className="inline-block bg-blue-500 rounded-sm px-16 py-3 text-sm text-white font-medium">
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
              {renderNoRoomStatement(sessions)}
            </div>
          </main>
          {/* FixedCreateRoomButton */}
          {/* <div
            className="sm:hidden z-10 w-full fixed bottom-0 shadow-lg"
            style={{ boxShadow: '0 -2px 4px 0 rgba(0, 0, 0, 0.06)' }}
          >
            <div className="bg-white px-6 py-4">
              <div className="flex justify-center">
                <Link href="/session/new">
                  <a className="block w-full px-6 py-2 border border-transparent text-base text-center font-bold rounded-md shadow-sm text-white bg-tsundoku-blue-main hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tsundoku-blue-main">
                    ルームを作成する
                  </a>
                </Link>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      <Footer />
    </div>
  )
}
