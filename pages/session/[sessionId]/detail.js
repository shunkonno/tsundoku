// ============================================================
// Imports
// ============================================================
import { Fragment, useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import useSWR from 'swr'
import moment from 'moment'
import PropTypes from 'prop-types'

// Components
import { AppHeader } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { Disclosure, Menu, Transition } from '@headlessui/react'

//Context
import { useAlertState } from '../../../context/AlertProvider'

//Assets
import { PlusSmIcon, ChevronLeftIcon } from '@heroicons/react/solid'
import { TrashIcon, XCircleIcon } from '@heroicons/react/outline'

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
import { DotsVerticalIcon } from '@heroicons/react/outline'
import classNames from '../../../utils/classNames'

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
  const { setAlertAssort } = useAlertState()

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
    return moment(datetimeIsoString).format('M???D??? H:mm')
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

    // Daily ??????????????????????????????????????????
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

  const joinSession = async (e) => {
    e.preventDefault()

    // ????????????????????????????????????????????????????????????????????????
    const bid = userInfo?.isReading

    if (bid) {
      // CONSIDER: join ????????????????????????????????????????????????????????????????????????
      await addReadTime(user?.uid, bid, session?.duration)
    }

    // userStats ??? readTime ?????????
    // CONSIDER: join ????????????????????????????????????????????????????????????????????????
    await addReadTimeToUserStats(user?.uid, session?.duration)

    router.push({ pathname: '/session/' + session?.sessionId + '/join' })
  }

  // ============================================================
  // Return Page
  // ============================================================
  if (user === null || !userInfo || !session) {
    return <div>Waiting..</div>
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Head>
        <title>Tsundoku | ???????????????</title>
        <meta
          name="description"
          content="Tsundoku (????????????????????????) ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppHeader />

      {/* main content */}
      <div className="relative flex-1 pb-16 bg-gray-50">
        <div className="sm:block sm:w-full sm:h-full" aria-hidden="true">
          <main className="relative p-4 sm:py-8 mx-auto max-w-3xl">
            <div className="mb-6">
              <Link href="/home">
                <a className="">
                  <ChevronLeftIcon
                    className="inline-block mr-1 w-5 h-5 text-gray-900"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-gray-900">??????????????????</span>
                </a>
              </Link>
            </div>
            <div className="flex justify-between py-5">
              <div>
                <h3 className="title-section">???????????????</h3>
              </div>
              <div className="flex items-center">
                <PlusSmIcon className="w-6 h-6 text-blue-500" />
                <a
                  className="text-sm text-blue-500 hidden sm:block"
                  href={`https://www.google.com/calendar/event?action=TEMPLATE&dates=${startEvent}/${endEvent}&text=Tsundoku ${formatTime(
                    session?.startDateTime
                  )} ??????&details=https://tsundoku.live/ja/session/${
                    session?.sessionId
                  }/detail`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Google???????????????????????????????????????
                </a>
                <a
                  className="text-sm text-blue-500 block sm:hidden"
                  href={`https://www.google.com/calendar/event?action=TEMPLATE&dates=${startEvent}/${endEvent}&text=Tsundoku ${formatTime(
                    session?.startDateTime
                  )} ??????&details=https://tsundoku.live/ja/session/${
                    session?.sessionId
                  }/detail`}
                  target="_blank"
                  rel="noreferrer"
                >
                  ????????????????????????
                </a>
              </div>
            </div>
            <div className="overflow-hidden bg-white sm:rounded-lg border border-black">
              <div className="py-5 px-4 relative">
                <div className="absolute right-0 mr-4">
                  <Menu as={'div'} className="relative">
                    <Menu.Button
                      as="div"
                      className="inline-block relative cursor-pointer"
                    >
                      <DotsVerticalIcon className="w-6 h-6 text-gray-500" />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items
                        className={classNames(
                          'absolute w-48 right-0 z-20 bg-white rounded-md divide-y divide-gray-100 ring-1 ring-black ring-opacity-5 shadow-lg origin-top-right focus:outline-none'
                        )}
                      >
                        <div className="px-2 py-2">
                          <Menu.Item>
                            {session?.ownerId == userInfo?.uid ? (
                              <div
                                className="group flex items-center space-x-2"
                                onClick={(e) => deleteSessionData(e)}
                              >
                                <TrashIcon className="w-5 h-5 text-red-600 group-hover:text-red-700" />
                                <span
                                  type="button"
                                  className="text-sm text-red-600 group-hover:text-red-700 cursor-pointer"
                                >
                                  ????????????????????????
                                </span>
                              </div>
                            ) : (
                              <div
                                className="group flex items-center space-x-2"
                                onClick={(e) => cancelSession(e)}
                              >
                                <XCircleIcon className="w-5 h-5 text-red-600 group-hover:text-red-700" />
                                <span
                                  type="button"
                                  className="text-sm text-red-600 group-hover:text-red-700 cursor-pointer"
                                >
                                  ??????????????????????????????
                                </span>
                              </div>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
                <dl className="">
                  <div className="pb-3">
                    <dt className="text-sm font-bold text-gray-900">
                      ????????????
                    </dt>
                    <dd className="sm:col-span-2 mt-1 sm:mt-0 text-base text-gray-900">
                      {formatDateTime(session?.startDateTime)}
                    </dd>
                  </div>
                  <div className="py-3">
                    <dt className="text-sm font-bold text-gray-900">
                      ????????????
                    </dt>
                    <dd className="sm:col-span-2 mt-1 sm:mt-0 text-base text-gray-900">
                      {session?.duration} ???
                    </dd>
                  </div>
                  <div className="py-3">
                    <dt className="text-sm font-bold text-gray-900">?????????</dt>
                    <dd className="sm:col-span-2 mt-1 sm:mt-1 text-base text-gray-900">
                      {`${session?.ownerName} (?????????)`}
                    </dd>
                    <dd className="sm:col-span-2 mt-1 sm:mt-1 text-base text-gray-900">
                      {session?.guestId ? (
                        <span>{session.guestName}</span>
                      ) : (
                        <span className="text-sm text-gray-900">???</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="flex justify-center items-start py-6">
              <div className="flex">
                {enterRoomOpen ? (
                  <a onClick={(e) => joinSession(e)}>
                    <span
                      type="button"
                      className="inline-flex items-center py-3 px-6 text-base font-medium text-white hover:bg-blue-600 rounded-md border border-transparent focus:ring-2 focus:ring-offset-2 shadow-sm cursor-pointer focus:outline-none bg-tsundoku-blue-main focus:ring-tsundoku-blue-main"
                    >
                      ????????????????????????
                    </span>
                  </a>
                ) : (
                  <div>
                    <span
                      type="button"
                      className="inline-flex items-center py-3 px-6 text-base font-medium text-gray-600 bg-gray-300 rounded-md border border-transparent focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 shadow-sm opacity-75 cursor-not-allowed focus:outline-none"
                    >
                      ????????????????????????
                    </span>
                    <div className="relative">
                      <p className="mt-2 text-sm text-center text-gray-800">
                        5?????????????????????????????????
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}
