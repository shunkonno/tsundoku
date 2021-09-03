// ============================================================
// Imports
// ============================================================
import { Fragment, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import useSWR from 'swr'

// Components
import { AppHeader } from '../components/Header'
import { Footer } from '../components/Footer'
import { Disclosure, Transition } from '@headlessui/react'

//Assets
import { CheckCircleIcon, XIcon } from '@heroicons/react/solid'

// Functions
import uselocalesFilter from '../utils/translate'
import { useAuth } from '../lib/auth'
import fetcher from '../utils/fetcher'
import { updateSession } from '../lib/db'
import { fetchSessions } from '../lib/db-admin'

// ============================================================
// dummydata
// ============================================================
const dummySessions = [
  {
    sessionId: '1',
    ownerId: 'hofehofe',
    ownerName: 'Tom',
    guestId: 'pokepoke',
    guestName: 'unknown',
    datetime: '2020/8/17 PM 3:00',
    duration: '2 時間',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60'
  },
  {
    sessionId: '2',
    ownerId: 'hofehofe',
    ownerName: '炭治郎',
    guestId: 'MYGivaUNG9P1BKLF4F7qP3ALDSJ3',
    guestName: 'tomoki',
    datetime: '2020/8/28 AM 1:00',
    duration: '1 時間',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60'
  },
  {
    sessionId: '3',
    ownerId: 'MYGivaUNG9P1BKLF4F7qP3ALDSJ3',
    ownerName: 'tomoki',
    guestId: 'hogehoge',
    guestName: 'hugahuga',
    datetime: '2020/9/15 AM 9:00',
    duration: '15 分',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60'
  },
  {
    sessionId: '4',
    ownerId: 'tukutuku',
    ownerName: 'Mafin',
    guestId: 'tuntun',
    guestName: 'unknown',
    datetime: '2020/8/17 PM 3:00',
    duration: '2 時間',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60'
  },
  {
    sessionId: '5',
    ownerId: 'piopio',
    ownerName: 'Michael Sandel',
    guestId: 'MYGivaUNG9P1BKLF4F7qP3ALDSJ3',
    guestName: 'tomoki',
    datetime: '2020/8/28 AM 1:00',
    duration: '1 時間',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60'
  },
  {
    sessionId: '6',
    ownerId: 'togetoge',
    ownerName: 'Edison',
    guestId: 'MYGivaUNG9P1BKLF4F7qP3ALDSJ3',
    guestName: 'tomoki',
    datetime: '2020/9/15 AM 9:00',
    duration: '15 分',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60'
  }
]
// ============================================================
// Fetch static data
// ============================================================
export async function getStaticProps(context) {
  // Fetch all sessions
  const sessions = await fetchSessions()

  return {
    props: {
      sessions
    }
  }
}

export default function Dashboard(sessions) {
  // ============================================================
  // Initialize
  // ============================================================

  console.log(sessions)

  //Initial State
  const [createRoomAlertOpen, setCreateRoomAlertOpen] = useState(false)
  const [reserveRoomAlertOpen, setReserveRoomAlertOpen] = useState(false)

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

  useEffect(() => {
    if (router.query.successCreateRoom == 'true') {
      setCreateRoomAlertOpen(true)
    } else if (router.query.successReserveRoom == 'true') {
      setReserveRoomAlertOpen(true)
    }
  }, [])

  // Set locale
  const { locale } = useRouter()
  const t = uselocalesFilter('dashboard', locale)

  //checkJoinRoomExist すべてのセッションのguestIdからログイン中のguestIdが1つでも一致していればtrue。1つもなければfalse。
  const checkResult = dummySessions.some((session) => {
    return userInfo?.uid == session.guestId
  })

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
        pathname: '/dashboard',
        query: { successReserveRoom: true }
      })
    }
  }

  // Handle session reservation cancellation
  const cancelSession = async (session) => {
    // Update guestId to an empty string
    updateSession(session.sessionId, { guestId: '' })
  }

  // ============================================================
  // Return Page
  // ============================================================
  if (user === null || !userInfo) {
    return <div>Waiting..</div>
  }

  return (
    <div>
      <Head>
        <title>DASHBOARD</title>
        <meta
          name="description"
          content="一緒に読書してくれる誰かを探すためのマッチングサービス"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppHeader />

      {/* main content */}
      <div className="relative pb-16 bg-gray-50 overflow-hidden">
        {
          /* Alert */
          <>
            <Transition
              show={createRoomAlertOpen}
              as={Fragment}
              enter="transition duration-75"
              enterFrom="transform -translate-y-1/4 opacity-0"
              enterTo="transform -translate-y-0 opacity-100"
              leave="transition-opacity duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="absolute w-full px-4">
                <div className="mt-4 rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon
                        className="h-5 w-5 text-green-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        新しいルームを作成しました。
                      </p>
                    </div>
                    <div className="ml-auto pl-3">
                      <div className="-mx-1.5 -my-1.5">
                        <button
                          type="button"
                          className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
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
            </Transition>
            <Transition
              show={reserveRoomAlertOpen}
              as={Fragment}
              enter="transition duration-75"
              enterFrom="transform -translate-y-1/4 opacity-0"
              enterTo="transform -translate-y-0 opacity-100"
              leave="transition-opacity duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="absolute w-full px-4">
                <div className="mt-4 rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon
                        className="h-5 w-5 text-green-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        ルームの参加を予約しました。
                      </p>
                    </div>
                    <div className="ml-auto pl-3">
                      <div className="-mx-1.5 -my-1.5">
                        <button
                          type="button"
                          className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
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
            </Transition>
          </>
        }
        <div className="sm:block sm:h-full sm:w-full" aria-hidden="true">
          <main className="relative mt-16 mx-auto max-w-7xl px-4 sm:mt-24">
            {checkResult ? (
              <div className="py-3">
                <div className="bg-gray-200 rounded-sm px-4 py-2 mb-4">
                  参加予定のルーム
                </div>
                <ul
                  role="list"
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {dummySessions.map((session) =>
                    userInfo.uid == session.guestId ||
                    userInfo.uid == session.ownerId ? (
                      <Disclosure>
                        {({ open }) => (
                          <li>
                            <div
                              key={session.sessionId}
                              className="bg-white rounded-lg shadow divide-y divide-gray-200"
                            >
                              <div className="w-full flex items-center justify-between p-6 space-x-6">
                                <div className="flex-1 truncate">
                                  <div className="flex items-center space-x-3">
                                    <div className="flex items-center">
                                      {/* <img
                                        className="w-10 h-10 mr-4 mb-2 bg-gray-300 rounded-full flex-shrink-0"
                                        src={session.imageUrl}
                                        alt=""
                                      /> */}
                                      <h3 className="text-gray-900 text-sm font-medium truncate">
                                        {session.ownerName}
                                      </h3>
                                    </div>
                                  </div>
                                  <p className="mt-1 text-gray-500 text-sm truncate">
                                    開始日時 {session.datetime}
                                  </p>
                                  <p className="mt-1 text-gray-500 text-sm truncate">
                                    予定時間 {session.duration}
                                  </p>
                                </div>
                                <Disclosure.Button className="">
                                  <p className="text-gray-500 text-sm">
                                    予約取り消し
                                  </p>
                                </Disclosure.Button>
                              </div>
                              {open && (
                                <div>
                                  <Transition
                                    show={open}
                                    enter="transition duration-100 ease-out"
                                    enterFrom="transform scale-95 opacity-0"
                                    enterTo="transform scale-100 opacity-100"
                                    leave="transition duration-75 ease-out"
                                    leaveFrom="transform scale-100 opacity-100"
                                    leaveTo="transform scale-95 opacity-0"
                                  >
                                    <Disclosure.Panel className="text-gray-500">
                                      <div className="-mt-px p-2 flex justify-center divide-x divide-gray-200">
                                        <div className="-ml-px flex flex-col items-center">
                                          <p className="text-sm">
                                            このルームの予約を取り消しますか？
                                          </p>
                                          <div
                                            className="relative mt-2 border border-transparent rounded-br-lg hover:text-gray-500"
                                            onClick={() =>
                                              cancelSession(session)
                                            }
                                          >
                                            <span className="inline-block bg-blue-500 rounded-sm px-12 py-2 text-sm text-white font-medium">
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
                    ) : (
                      <></>
                    )
                  )}
                </ul>
              </div>
            ) : (
              <></>
            )}
            <div className="py-3">
              <div className="bg-gray-200 rounded-sm px-4 py-2 mb-4">
                空きルーム一覧
              </div>
              <ul
                role="list"
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {dummySessions.map((session) => (
                  <Disclosure>
                    {({ open }) => (
                      <li>
                        <div
                          key={session.sessionId}
                          className="bg-white rounded-lg shadow divide-y divide-gray-200"
                        >
                          <div className="w-full flex items-center justify-between p-6 space-x-6">
                            <div className="flex-1 truncate">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center">
                                  {/* <img
                                    className="w-10 h-10 mr-4 mb-2 bg-gray-300 rounded-full flex-shrink-0"
                                    src={session.imageUrl}
                                    alt=""
                                  /> */}
                                  <h3 className="text-gray-900 text-sm font-medium truncate">
                                    {session.ownerName}
                                  </h3>
                                </div>
                              </div>
                              <p className="mt-1 text-gray-500 text-sm truncate">
                                開始日時 {session.datetime}
                              </p>
                              <p className="mt-1 text-gray-500 text-sm truncate">
                                予定時間 {session.duration}
                              </p>
                            </div>
                            <Disclosure.Button className="">
                              <p className="text-blue-500">予約する</p>
                            </Disclosure.Button>
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
                                  <div className="-mt-px p-2 flex justify-center divide-x divide-gray-200">
                                    <div className="-ml-px flex flex-col items-center">
                                      <p className="text-sm">
                                        このルームを予約しますか？
                                      </p>
                                      <div
                                        className="relative mt-2 border border-transparent rounded-br-lg hover:text-gray-500"
                                        onClick={() => reserveSession(session)}
                                      >
                                        <span className="inline-block bg-blue-500 rounded-sm px-12 py-2 text-sm text-white font-medium">
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
          </main>
          {/* FixedCreateRoomButton */}
          <div
            className="z-10 w-full fixed bottom-0 shadow-lg"
            style={{ boxShadow: '0 -2px 4px 0 rgba(0, 0, 0, 0.06)' }}
          >
            <div className="bg-white px-6 py-4">
              <div className="flex justify-center">
                <Link href="/newRoom">
                  <a className="block w-full px-6 py-2 border border-transparent text-base text-center font-bold rounded-md shadow-sm text-white bg-tsundoku-blue-main hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tsundoku-blue-main">
                    ルームを作成する
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
