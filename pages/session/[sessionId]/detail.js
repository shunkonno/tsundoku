// ============================================================
// Imports
// ============================================================
import { Fragment, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import useSWR from 'swr'
import moment from 'moment'
import PropTypes from 'prop-types'

// Components
import { AppHeader } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { Disclosure, Transition } from '@headlessui/react'

//Assets
import { TrashIcon, ChevronLeftIcon } from '@heroicons/react/solid'

// Functions
import uselocalesFilter from '../../../utils/translate'
import { useAuth } from '../../../lib/auth'
import fetcher from '../../../utils/fetcher'
import { updateSession } from '../../../lib/db'
import { fetchOneSession, fetchAllSessions } from '../../../lib/db-admin'

// ============================================================
// Fetch static data
// ============================================================
export async function getStaticProps(context) {
  // Fetch session info
  const session = await fetchOneSession(context.params.sessionId)

  return {
    props: {
      session
    }
  }
}

export async function getStaticPaths() {
  const sessions = await fetchAllSessions()

  const paths = sessions.map((session) => ({
    params: {
      sessionId: session.sessionId
    }
  }))

  return { paths, fallback: true }
}

export default function SessionDetail({ session }) {
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

  // ============================================================
  // Routing
  // ============================================================
  const router = useRouter()

  useEffect(() => {
    if (user === false) {
      // If the access isn't authenticated, redirect to index page
      router.push('/')
    }
  })

  // Set locale
  const { locale } = router
  const t = uselocalesFilter('detail', locale)

  // ============================================================
  // Initialize State
  // ============================================================
  const [count, setCount] = useState(0)
  const [enterRoomOpen, setEnterRoomOpen] = useState(false)

  // Filter Current session by sessionId
  // const session = sessions.find((session) => {
  //   return session.sessionId == sessionId

  // })

  // ============================================================
  // Helper Functions
  // ============================================================

  // Format datetime ISOString
  const formatDateTime = (datetimeIsoString) => {
    return moment(datetimeIsoString).format('M月D日 H:mm')
  }

  // Calculate current time and determine whether the room should be open or not
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1)
    }, 1000)

    const baseTime = new Date()

    const unixBaseTime = moment(baseTime).unix()
    const unixStartDateTime = moment(session?.startDateTime).unix()

    const differenceTime = unixStartDateTime - unixBaseTime
    const thresholdOfEnterRoom = 5 * 60 // 5 minutes

    if (differenceTime >= thresholdOfEnterRoom) {
      setEnterRoomOpen(false)
    } else {
      setEnterRoomOpen(true)
    }

    return () => clearInterval(id)
  }, [count, session?.startDateTime])

  // ============================================================
  // Button Handler
  // ============================================================

  // Handle session reservation cancellation
  const cancelSession = async (e) => {
    e.preventDefault()

    // Update guestId to an empty string
    await updateSession(session?.sessionId, { guestId: '' })

    await router.push({
      pathname: '/dashboard',
      query: { successCancelRoom: true }
    })
  }

  const deleteSession = async (e) => {
    e.preventDefault()

    // Delete guestId to an empty string
    await deleteSession(session?.sessionId)

    await router.push({
      pathname: '/dashboard',
      query: { successDeleteRoom: true }
    })
  }

  // ============================================================
  // Return Page
  // ============================================================
  return (
    <div>
      <Head>
        <title>Tsundoku | ルーム詳細</title>
        <meta
          name="description"
          content="一緒に読書してくれる誰かを探すためのマッチングサービス"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppHeader />

      {/* main content */}
      <div className="relative pb-16 bg-gray-50 overflow-hidden">
        <div className="sm:block sm:h-full sm:w-full" aria-hidden="true">
          <main className="relative mx-auto max-w-3xl px-4 sm:py-8">
            <div className="mb-6">
              <Link href="/dashboard">
                <a className="">
                  <ChevronLeftIcon
                    className="inline-block h-5 w-5 text-gray-900 mr-1"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-gray-900">戻る</span>
                </a>
              </Link>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    ルーム詳細
                  </h3>
                  {session?.ownerId == userInfo?.uid ? (
                    <>
                      <span
                        type="button"
                        className="text-sm cursor-pointer text-red-600 hover:text-red-700"
                        onClick={(e) => deleteSession(e)}
                      >
                        ルームを削除する
                      </span>
                    </>
                  ) : (
                    <span
                      type="button"
                      className="text-sm cursor-pointer text-red-600 hover:text-red-700"
                      onClick={(e) => cancelSession(e)}
                    >
                      予約を取り消す
                    </span>
                  )}
                </div>
                {/* <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and application.</p> */}
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-base font-medium text-gray-500">
                      ルーム作成者
                    </dt>
                    <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
                      {session?.ownerName}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-base font-medium text-gray-500">
                      開始日時
                    </dt>
                    <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatDateTime(session?.startDateTime)}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-base font-medium text-gray-500">
                      所要時間
                    </dt>
                    <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
                      {session?.duration} 分
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-base font-medium text-gray-500">
                      参加者
                    </dt>
                    <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
                      {session?.guestId ? (
                        <span>{session.guestName}</span>
                      ) : (
                        <span className="text-sm text-gray-500">ー</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="py-6">
                <div className="flex justify-center">
                  {enterRoomOpen ? (
                    <a href={`/session/${session?.sessionId}/join`}>
                      <span
                        type="button"
                        className="cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-tsundoku-blue-main hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tsundoku-blue-main"
                      >
                        ルームに入室する
                      </span>
                    </a>
                  ) : (
                    <div>
                      <span
                        type="button"
                        className="cursor-not-allowed inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-gray-600 opacity-75 bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                      >
                        ルームに入室する
                      </span>
                      <p className="text-center text-sm text-gray-800 mt-2">
                        5分前から入室できます。
                      </p>
                    </div>
                  )}
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
