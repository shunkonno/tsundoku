// ============================================================
// Imports
// ============================================================
import { Fragment, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import moment from 'moment'

// Vercel
import useSWR from 'swr'
import Image from 'next/image'
import Link from 'next/link'

//Assets
import { PlusSmIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid'
import { TrashIcon, XCircleIcon } from '@heroicons/react/outline'

// Components
import { SEO } from '../../../components/Meta'
import { AppHeader } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { SelectPlannedReadingBookModal } from '../../../components/Modal'
import { Menu, Transition } from '@headlessui/react'

//Context
import { useAlertState } from '../../../context/AlertProvider'

// Context
import { useOneBookInfo } from '../../../context/useOneBookInfo'
import { useUserInfo } from '../../../context/useUserInfo'

// Functions
import uselocalesFilter from '../../../utils/translate'
import { useAuth } from '../../../lib/auth'
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
  // State
  // ============================================================
  const [count, setCount] = useState(0)
  const [enterRoomOpen, setEnterRoomOpen] = useState(false)
  const [ownerReadBook, setOwnerReadBook] = useState({})
  const [modalOpen, setModalOpen] = useState(false)

  console.log(ownerReadBook)

  // ============================================================
  // Auth
  // ============================================================
  const auth = useAuth()
  const user = auth.user

  // ============================================================
  // Fetch Data
  // ============================================================

  // ユーザー情報をfetch
  const userInfo = useUserInfo()

  // ownerのReadBookInfoをfetch
  const ownerBookInfo = useOneBookInfo(session?.ownerReadBookId)

  // ============================================================
  // Routing
  // ============================================================
  const router = useRouter()

  useEffect(() => {
    if (user === false) {
      // If the access isn't authenticated, redirect to index page
      router.push('/')
    }
  },[user,router])

  // Set locale
  const { locale } = router
  const t = uselocalesFilter('detail', locale)

  // ============================================================
  // Default OwnerReadingBook Setting
  // ============================================================
  useEffect(()=> {
    if(ownerBookInfo){
      setOwnerReadBook(ownerBookInfo)
    }else {
      setOwnerReadBook({})
    }
  },[ownerBookInfo])

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
        Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_DAILY_API_KEY
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

    // ユーザーが現在読んでいる本に、読書時間を加算する
    const bid = userInfo?.isReading

    if (bid) {
      // CONSIDER: join ページで退出した際に、加算したほうが精度は高まる
      await addReadTime(user?.uid, bid, session?.duration)
    }

    // userStats の readTime に追加
    // CONSIDER: join ページで退出した際に、加算したほうが精度は高まる
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
      <SEO
        title={'Tsundoku | ルーム詳細'}
        description={
          'Tsundoku (積ん読・ツンドク) は他の誰かと読書する、ペア読書サービスです。集中した読書は自己研鑽だけでなく、リラックス効果もあります。'
        }
      />

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
                  className="text-sm text-blue-500 hidden sm:block"
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
                <a
                  className="text-sm text-blue-500 block sm:hidden"
                  href={`https://www.google.com/calendar/event?action=TEMPLATE&dates=${startEvent}/${endEvent}&text=Tsundoku ${formatTime(
                    session?.startDateTime
                  )} 開催&details=https://tsundoku.live/ja/session/${
                    session?.sessionId
                  }/detail`}
                  target="_blank"
                  rel="noreferrer"
                >
                  カレンダーに追加
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
                                  ルームを削除する
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
                                  予約をキャンセルする
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
                  <div className="py-3">
                    <dt className="text-sm font-bold text-gray-900">このルームで読む予定の本</dt>
                    
                    {!(Object.keys(ownerReadBook).length === 0)?
                      <dd className="flex items-center mt-3 text-base p-4 text-gray-900 rounded-lg h-32 space-x-4">
                        <div className="flex flex-shrink-0 h-full">
                          <div className="relative flex-shrink-0 w-12 sm:w-20">
                            <Image
                              className="object-contain"
                              layout={'fill'}
                              src={
                                ownerReadBook.image
                                  ? ownerReadBook.image
                                  : '/img/placeholder/noimage_480x640.jpg'
                              }
                              alt="book cover"
                            />
                          </div>
                        </div>
                        <div className="flex-1 h-full">
                          <div>
                            <div className="font-bold text-sm">
                              タイトル
                            </div>
                            <div className="overflow-ellipsis line-clamp-2">
                              {ownerReadBook.title}
                            </div>
                          </div>
                        </div>
                        <div>
                        <div 
                          className="text-sm text-blue-500 inline-flex items-center cursor-pointer"
                          onClick={()=> setModalOpen(true)}
                        >
                          <span>変更する</span>
                        </div>
                        </div>
                      </dd>
                    :
                    <dd className="flex items-center mt-3 text-base pr-4 text-gray-900 rounded-lg h-20 space-x-4">
                      <div className="flex justify-between items-center w-full">
                          <p className="text-center text-gray-500">
                            {user?.uid == session?.ownerId ?
                              "読む予定の本を選択をできます。"
                            :
                              "開催者は読む予定の本を設定していません。"
                            }
                          </p>
                          <p 
                            className="text-center flex-shrink-0 text-blue-500 cursor-pointer mt-2"
                            onClick={()=> setModalOpen(true)}
                          >
                              選択する
                          </p>
                      </div>
                    </dd>
                    }
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
            </div>
            <SelectPlannedReadingBookModal 
              modalOpen={modalOpen} 
              setModalOpen={setModalOpen}
              setOwnerReadBook={setOwnerReadBook}
              sessionId={session?.sessionId}
            />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}
