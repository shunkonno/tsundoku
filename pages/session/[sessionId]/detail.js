// ============================================================
// Imports
// ============================================================
import { useState, useEffect, useContext } from 'react'
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

//Context
import { AppContext } from '../../../context/state'

//Assets
import { PlusSmIcon, ChevronLeftIcon } from '@heroicons/react/solid'

// Functions
import uselocalesFilter from '../../../utils/translate'
import { useAuth } from '../../../lib/auth'
import fetcher from '../../../utils/fetcher'
import {
  updateSession,
  deleteSession,
  addReadTime,
  addReadTimeToUserStats
} from '../../../lib/db'
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
  // Contexts
  // ============================================================
  const { setAlertAssort } = useContext(AppContext)

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

  // ============================================================
  // Helper Functions
  // ============================================================

  // Format datetime ISOString
  const formatDateTime = (datetimeIsoString) => {
    return moment(datetimeIsoString).format('M月D日 H:mm')
  }
  const formatTime = (datetimeIsoString) => {
    return moment(datetimeIsoString).format('H:mm')
  }

  const formatDateTimeForGoogleCalendarURL = (datetimeIsoString) => {
    return moment(datetimeIsoString).format('YYYYMMDDTHHmm00')
  }

  const startEvent = formatDateTimeForGoogleCalendarURL(session?.startDateTime)
  const endEvent = formatDateTimeForGoogleCalendarURL(session?.endDateTime)

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

    await setAlertAssort('cancel')

    await router.push({
      pathname: '/home'
    })
  }

  const deleteSessionData = async (e) => {
    e.preventDefault()

    // Delete guestId to an empty string
    await deleteSession(session?.sessionId)

    // Daily で作成されたルームを削除する
    const url = 'https://api.daily.co/v1/rooms/' + session?.sessionId
    const options = {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + process.env.DAILY_API_KEY
      }
    }

    await fetch(url, options)
      .then((res) => res.json())
      .catch((err) => console.error('error:' + err))

    await setAlertAssort('delete')

    await router.push({
      pathname: '/home'
    })
  }

  const joinSession = async () => {
    // e.preventDefault()

    // ユーザーが現在読んでいる本に、読書時間を加算する
    const bid = userInfo?.isReading

    if (bid) {
      // CONSIDER: join ページで退出した際に、加算したほうが精度は高まる
      addReadTime(user?.uid, bid, session?.duration)
    }

    // userStats の readTime に追加
    // CONSIDER: join ページで退出した際に、加算したほうが精度は高まる
    addReadTimeToUserStats(user?.uid, session?.duration)
  }

  // ============================================================
  // Return Page
  // ============================================================
  if (user === null || !userInfo || !session) {
    return <div>Waiting..</div>
  }

  return (
    <div>
      <Head>
        <title>Tsundoku | ルーム詳細</title>
        <meta
          name="description"
          content="Tsundoku (積ん読・ツンドク) は他の誰かと読書する、ペア読書サービスです。集中した読書は自己研鑽だけでなく、リラックス効果もあります。"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppHeader />

      {/* main content */}
      <div className="overflow-hidden relative pb-16 bg-gray-50">
        <div className="sm:block sm:w-full sm:h-full" aria-hidden="true">
          <main className="relative p-4 sm:py-8 mx-auto max-w-3xl">
            <div className="mb-6">
              <Link href="/home">
                <a className="">
                  <ChevronLeftIcon
                    className="inline-block mr-1 w-5 h-5 text-gray-900"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-gray-900">ホームへ戻る</span>
                </a>
              </Link>
            </div>
            <div className="flex justify-between py-5">
              <div>
                <h3 className="title-section">ルーム詳細</h3>
              </div>
              <div className="flex items-center">
                <PlusSmIcon className="w-6 h-6 text-blue-500" />
                <a
                  className="text-sm text-blue-500"
                  href={`https://www.google.com/calendar/event?action=TEMPLATE&dates=${startEvent}/${endEvent}&text=Tsundoku ${formatTime(
                    session?.startDateTime
                  )} 開催&details=https://tsundoku.live/ja/session/${
                    session?.sessionId
                  }/detail`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Googleカレンダーに予定を追加する
                </a>
              </div>
            </div>
            <div className="overflow-hidden bg-white sm:rounded-lg border border-black">
              <div className="sm:p-0 py-5 px-4 border-t border-gray-200">
                <dl className="p-4">
                  <div className="py-3">
                    <dt className="text-sm font-bold text-gray-900">
                      開始日時
                    </dt>
                    <dd className="sm:col-span-2 mt-1 sm:mt-0 text-base text-gray-900">
                      {formatDateTime(session?.startDateTime)}
                    </dd>
                  </div>
                  <div className="py-3">
                    <dt className="text-sm font-bold text-gray-900">
                      所要時間
                    </dt>
                    <dd className="sm:col-span-2 mt-1 sm:mt-0 text-base text-gray-900">
                      {session?.duration} 分
                    </dd>
                  </div>
                  <div className="py-3">
                    <dt className="text-sm font-bold text-gray-900">参加者</dt>
                    <dd className="sm:col-span-2 mt-1 sm:mt-1 text-base text-gray-900">
                      {`${session?.ownerName} (開催者)`}
                    </dd>
                    <dd className="sm:col-span-2 mt-1 sm:mt-1 text-base text-gray-900">
                      {session?.guestId ? (
                        <span>{session.guestName}</span>
                      ) : (
                        <span className="text-sm text-gray-900">ー</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="flex justify-between items-start py-6">
              <div className="flex">
                {enterRoomOpen ? (
                  <a
                    href={`/ja/session/${session?.sessionId}/join`}
                    onClick={() => joinSession()}
                  >
                    <span
                      type="button"
                      className="inline-flex items-center py-3 px-6 text-base font-medium text-white hover:bg-blue-600 rounded-md border border-transparent focus:ring-2 focus:ring-offset-2 shadow-sm cursor-pointer focus:outline-none bg-tsundoku-blue-main focus:ring-tsundoku-blue-main"
                    >
                      ルームに入室する
                    </span>
                  </a>
                ) : (
                  <div>
                    <span
                      type="button"
                      className="inline-flex items-center py-3 px-6 text-base font-medium text-gray-600 bg-gray-300 rounded-md border border-transparent focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 shadow-sm opacity-75 cursor-not-allowed focus:outline-none"
                    >
                      ルームに入室する
                    </span>
                    <div className="relative">
                      <p className="mt-2 text-sm text-center text-gray-800">
                        5分前から入室できます。
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {session?.ownerId == userInfo?.uid ? (
                <div>
                  <span
                    type="button"
                    className="text-sm text-red-600 hover:text-red-700 cursor-pointer"
                    onClick={(e) => deleteSessionData(e)}
                  >
                    ルームを削除する
                  </span>
                </div>
              ) : (
                <div>
                  <span
                    type="button"
                    className="text-sm text-red-600 hover:text-red-700 cursor-pointer"
                    onClick={(e) => cancelSession(e)}
                  >
                    予約を取り消す
                  </span>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}
