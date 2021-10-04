// ============================================================
// Imports
// ============================================================
import { Fragment, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import useSWR, { useSWRConfig } from 'swr'
import Script from 'next/script'

// Components
import { AppHeader } from '../../../components/Header'
import Wave from 'react-wavify'
import { Transition } from '@headlessui/react'

//Assets
import {
  MicrophoneIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LogoutIcon,
  XIcon
} from '@heroicons/react/outline'
import colors from 'tailwindcss/colors'

// Functions
import { useAuth } from '../../../lib/auth'
import fetcher from '../../../utils/fetcher'
import { fetchOneSession, fetchAllSessions } from '../../../lib/db-admin'
import { updateIsReading } from '../../../lib/db'
import {
  formatISOStringToTime,
  formatISOStringToDateTimeWithSlash
} from '../../../utils/formatDateTime'
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

export default function Session({ session }) {
  console.log(session)
  // ============================================================
  // Initialize
  // ============================================================

  // State
  const [chatMessage, setChatMessage] = useState('')
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(true)
  const [leftSlideOpen, setLeftSlideOpen] = useState(false)
  const [rightSlideOpen, setRightSlideOpen] = useState(false)

  // Routing
  const router = useRouter()
  const { sessionId } = router.query

  // auth
  const auth = useAuth()
  const user = auth.user

  // ============================================================
  // Fetch Data
  // ============================================================

  //mutateを定義
  const { mutate } = useSWRConfig()

  // ユーザー情報
  const { data: userInfo } = useSWR(
    user ? ['/api/user', user.token] : null,
    fetcher,
    {
      onErrorRetry: ({ retryCount }) => {
        // エラー時には、10回まではリトライする
        if (retryCount >= 10) return
      }
    }
  )
  console.log(userInfo)

  // マッチング相手のユーザー情報を取得
  // マッチング相手のユーザーのIDがguestIdかownerIdか識別
  const peerUid =
    user?.uid === session?.ownerId ? session?.guestId : session?.ownerId

  console.log('PeerUid is : ', peerUid)

  const { data: peerUserInfo } = useSWR(
    peerUid ? '/api/user/' + peerUid + '/info' : null,
    fetcher,
    {
      onErrorRetry: ({ retryCount }) => {
        // エラー時には、10回まではリトライする
        if (retryCount >= 10) return
      }
    }
  )

  console.log('peerUserInfo:', peerUserInfo)

  // ユーザーのブックリスト取得
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

  // マッチング相手のブックリスト取得
  const { data: peerBookList } = useSWR(
    peerUid ? '/api/user/' + peerUid + '/booklist' : null,
    fetcher,
    {
      onErrorRetry: ({ retryCount }) => {
        // Retry up to 10 times
        if (retryCount >= 10) return
      }
    }
  )

  console.log('peerBookList: ', peerBookList)

  const isReadingBook = bookList?.find((book) => {
    return book.bookInfo.bid == userInfo.isReading
  })

  const peerIsReadingBook = peerBookList?.find((book) => {
    return book.bookInfo.bid == peerUserInfo?.isReading
  })

  console.log('isReadingBook is: ', isReadingBook)
  console.log('peerIsReadingBook is: ', peerIsReadingBook)

  // ============================================================
  // Initialize Video Call
  // ============================================================

  if (typeof window !== 'undefined') {
    dailyMain()
  }

  // function callDailyIframe() {
  //   const callFrame = window.DailyIframe.createFrame({
  //     // TODO: Change language based on locale (https://docs.daily.co/reference#properties)
  //     url: 'https://tsundoku.daily.co/' + sessionId,
  //     lang: 'jp',
  //     showLeaveButton: true,
  //     // showLocalVideo: false,
  //     // videoSource: false,
  //     iframeStyle: { position: 'fixed', width: '100%', height: '100%' }
  //   })

  //   // TODO: Set domain config with REST API (redirect_on_meeting_exit)
  //   // callFrame.join({
  //   //   userName: userName
  //   // })
  //   callFrame.join()
  // }

  // ============================================================
  // Daily - Main
  // ============================================================

  async function dailyMain() {
    const ROOM_URL = 'https://tsundoku.daily.co/' + sessionId

    window.call = DailyIframe.createCallObject({
      url: ROOM_URL,
      audioSource: true,
      videoSource: false,
      dailyConfig: {
        experimentalChromeVideoMuteLightOff: true
      }
    })

    call.on('joined-meeting', updateParticipants)
    call.on('error', (e) => console.error(e))

    call.on('track-started', playTrack)
    call.on('track-stopped', destroyTrack)

    call.on('participant-joined', updateParticipants)
    call.on('participant-left', updateParticipants)
  }

  // ============================================================
  // Daily - Functions
  // ============================================================

  // セッションに参加する
  async function joinRoom() {
    console.log('join')
    await call.join()
  }

  // セッションを終了する
  async function leaveRoom() {
    await call.leave()
    let el = document.getElementById('participants')
    el.innerHTML = ``
  }

  // オーディオトラックを再生
  function playTrack(evt) {
    console.log(
      '[TRACK STARTED]',
      evt.participant && evt.participant.session_id
    )

    // オーディオトラックが存在することを確認する
    if (!(evt.track && evt.track.kind === 'audio')) {
      console.error('!!! playTrack called without an audio track !!!', evt)
      return
    }

    // ローカルのオーディオトラックは再生しない (自分の声)
    if (evt.participant.local) {
      return
    }

    // audio element を作成
    let audioEl = document.createElement('audio')
    document.body.appendChild(audioEl)
    audioEl.srcObject = new MediaStream([evt.track])
    audioEl.play()
  }

  // 参加者に変化があった際に制御
  function updateParticipants(evt) {
    console.log('[PARTICIPANT(S) UPDATED]', evt)
    let el = document.getElementById('participants')
    let count = Object.entries(call.participants()).length
    el.innerHTML = `Participant count: ${count}`
  }

  // オーディオトラックの破棄
  function destroyTrack(evt) {
    console.log(
      '[TRACK STOPPED]',
      (evt.participant && evt.participant.session_id) || '[left meeting]'
    )

    let els = Array.from(document.getElementsByTagName('video')).concat(
      Array.from(document.getElementsByTagName('audio'))
    )

    for (let el of els) {
      if (el.srcObject && el.srcObject.getTracks()[0] === evt.track) {
        el.remove()
      }
    }
  }

  // ============================================================
  // Helper Function
  // ============================================================

  const toggleIsMicrophoneOn = (e) => {
    e.preventDefault()

    setIsMicrophoneOn((isMicrophoneOn) => !isMicrophoneOn)
  }

  // ============================================================
  // Button Handler
  // ============================================================
  const selectReadingBook = async (e, bid) => {
    e.preventDefault()

    await updateIsReading(user.uid, bid)

    mutate(['/api/user', user.token])
  }

  // ============================================================
  // Return Page
  // ============================================================
  return (
    <div className="min-h-screen bg-blueGray-800">
      <Script
        crossOrigin
        src="https://unpkg.com/@daily-co/daily-js"
        strategy="beforeInteractive"
      />

      <Head>
        <title>Tsundoku | ルーム</title>
        <meta
          name="description"
          content="Tsundoku (積ん読・ツンドク) は他の誰かと読書する、ペア読書サービスです。集中した読書は自己研鑽だけでなく、リラックス効果もあります。"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppHeader />

      <main className="relative text-white">
        <section className=" py-6 px-8">
          <div className="flex justify-center">
            <div className="flex-shrink-0 w-72">
              <div className="py-4">
                <button
                  id="leave"
                  className="flex items-center py-3 px-6 space-x-2 text-base font-medium text-white bg-red-600 rounded-md opacity-90"
                  onClick={leaveRoom}
                >
                  <LogoutIcon className="w-6 h-6 opacity-100 transform rotate-180" />
                  <span>退出する</span>
                </button>
              </div>
            </div>
            <div className="flex w-full max-w-7xl">
              <div className="flex-shrink-0 text-center">
                <p>開始時刻</p>
                <p>{formatISOStringToTime(session?.startDateTime)}</p>
              </div>
              <div className="flex-1 border-b border-gray-100"></div>
              <div className="flex-shrink-0 text-center">
                <p>終了時刻</p>
                <p>{formatISOStringToTime(session?.endDateTime)}</p>
              </div>
            </div>
            <div className="flex-shrink-0 w-72"></div>
          </div>
        </section>
        <div className="flex">
          <section
            id="left-column"
            className="flex flex-shrink-0 items-center w-72 bg-blue-10"
          >
            <Transition
              as={Fragment}
              show={!leftSlideOpen}
              enter="transition transform ease-in-out duration-300"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition transform ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="flex flex-col items-center mr-8 w-full h-80 bg-white px-4 py-2 rounded-tr-lg rounded-br-lg">
                <div className="flex-shrink-0 py-2 w-full text-lg font-bold text-gray-500">
                  いま読んでいる本
                </div>
                <div className="flex flex-col flex-1 items-center py-4 space-y-4">
                  <div className="relative w-24 h-32 shadow-md">
                    <Image
                      src={
                        isReadingBook?.bookInfo?.image
                          ? isReadingBook?.bookInfo.image
                          : '/img/placeholder/noimage_480x640.jpg'
                      }
                      layout={'fill'}
                      alt="Book cover"
                    />
                  </div>
                  <div className="text-black">
                    {isReadingBook?.bookInfo.title}
                  </div>
                </div>
                <div className="flex-shrink-0 w-full">
                  <div
                    className="inline-flex items-center"
                    onClick={() => setLeftSlideOpen(true)}
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-blue-400" />
                    <button className="text-sm text-blue-400">
                      本を変更する
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
            <Transition
              as={Fragment}
              show={leftSlideOpen}
              enter="transition transform ease-in-out duration-300"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition transform ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="fixed inset-y-0 w-80 bg-gray-50 rounded-tr-lg rounded-br-lg">
                <div className="flex justify-end p-2 h-12">
                  <XIcon
                    className="w-9 h-9 text-gray-500"
                    onClick={() => setLeftSlideOpen(false)}
                  />
                </div>
                {bookList?.map(({ bookInfo, date }) => (
                  <div
                    className={classNames(
                      bookInfo.bid == userInfo.isReading
                        ? 'ring-2 ring-tsundoku-blue-main'
                        : 'border border-gray-300',
                      'relative rounded-lg bg-white py-2 mb-2 mx-2 px-2 h-28 sm:px-3 shadow-sm flex hover:border-gray-400'
                    )}
                    key={bookInfo.bid}
                  >
                    {bookInfo.bid == userInfo?.isReading && (
                      <span className="absolute bottom-0 left-0 z-10 py-1 px-2 mb-2 ml-2 text-xs text-white bg-blue-500 rounded-full">
                        選択中
                      </span>
                    )}
                    <div className="relative flex-shrink-0 w-10 sm:w-16">
                      <Image
                        className="object-contain"
                        layout={'fill'}
                        src={
                          bookInfo?.image
                            ? bookInfo?.image
                            : '/img/placeholder/noimage_480x640.jpg'
                        }
                        alt={bookInfo?.title}
                      />
                    </div>
                    <div className="overflow-hidden flex-1 ml-3">
                      <div className="flex flex-col justify-between h-full">
                        <div className="focus:outline-none">
                          <p className="overflow-y-hidden max-h-10 sm:max-h-16 text-base sm:text-sm font-medium leading-5 text-gray-900 overflow-ellipsis line-clamp-2">
                            {bookInfo.title}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 justify-center items-center">
                      <div>
                        <button
                          className="inline-flex items-center py-1 px-3 text-sm font-medium leading-5 text-blue-600 hover:text-white bg-white hover:bg-blue-500 rounded-full border border-blue-600 hover:border-blue-500 shadow-sm"
                          onClick={async (e) => {
                            await selectReadingBook(e, bookInfo.bid)
                            await setLeftSlideOpen(false)
                          }}
                        >
                          選択
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Transition>
          </section>
          <section id="center-column" className="flex-1 p-8 bg-green-10">
            <div
              id="main-vc"
              className="flex items-center mx-auto max-w-screen-2xl h-full bg-orange-10"
            >
              <div className="flex justify-between items-center space-x-8 w-full h-full">
                <div className="overflow-hidden relative w-1/2 rounded-lg">
                  <div className="bg-gradient-to-b from-blue-400 to-green-400 aspect-w-1 aspect-h-1"></div>
                  <div className="absolute bottom-0 w-full h-1/2">
                    <Wave
                      fill="url(#gradient-self)"
                      className="h-full"
                      paused={false}
                      options={{
                        amplitude: 30,
                        speed: 0.15,
                        points: 3
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="gradient-self"
                          gradientTransform="rotate(90)"
                        >
                          <stop offset="10%" stopColor={colors.green['300']} />
                          <stop offset="90%" stopColor={colors.cyan['300']} />
                        </linearGradient>
                      </defs>
                    </Wave>
                  </div>
                  <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Image
                      className=" rounded-full"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      width={80}
                      height={80}
                      alt="Avatar"
                    />
                    <p className="text-center text-gray-800">
                      {userInfo?.name}
                    </p>
                  </div>
                </div>
                <div className="overflow-hidden relative w-1/2 rounded-lg">
                  <div className="bg-gradient-to-b from-yellow-400 to-orange-400 rounded-lg aspect-w-1 aspect-h-1"></div>
                  <div className="absolute bottom-0 w-full h-1/2">
                    <Wave
                      fill="url(#gradient-other)"
                      className="h-full"
                      paused={false}
                      options={{
                        amplitude: 20,
                        speed: 0.2,
                        points: 3
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="gradient-other"
                          gradientTransform="rotate(90)"
                        >
                          <stop offset="10%" stopColor={colors.orange['300']} />
                          <stop offset="90%" stopColor={colors.yellow['300']} />
                        </linearGradient>
                      </defs>
                    </Wave>
                  </div>
                  <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Image
                      className=" rounded-full"
                      src={
                        peerUserInfo?.avatar
                          ? peerUserInfo?.avatar
                          : '/img/placeholder/noimage_480x640.jpg'
                      }
                      width={80}
                      height={80}
                      alt="Avatar"
                    />
                    <p className="text-center text-gray-800">
                      {peerUserInfo?.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section
            id="right-column"
            className="flex flex-shrink-0 items-center w-72 bg-yellow-10"
          >
            <div className="flex flex-col items-center py-2 px-4 ml-8 w-full h-80 bg-white rounded-tl-lg rounded-bl-lg">
              <div className="flex-shrink-0 py-2 w-full text-lg font-bold text-gray-500">
                いま読んでいる本
              </div>
              <div className="flex flex-col flex-1 items-center py-4 space-y-4">
                <div className="relative w-24 h-32 shadow-md">
                  <Image
                    src={
                      peerIsReadingBook
                        ? peerIsReadingBook?.bookInfo?.image
                        : '/img/placeholder/noimage_480x640.jpg'
                    }
                    layout={'fill'}
                    alt="Book Cover"
                  />
                </div>
                <div className="text-black">
                  {peerIsReadingBook?.bookInfo.title}
                </div>
              </div>
              <div className="flex flex-shrink-0 self-end text-right">
                <div
                  className="inline-flex items-center"
                  onClick={() => setRightSlideOpen(true)}
                >
                  <button className="text-sm text-blue-400">
                    ブックリストを見る
                  </button>
                  <ChevronRightIcon className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </div>
            <Transition
              as={Fragment}
              show={rightSlideOpen}
              enter="transition transform ease-in-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition transform ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="fixed inset-y-0 -mx-8 w-80 bg-gray-50 rounded-tl-lg rounded-bl-lg">
                <div className="flex p-2 h-12">
                  <XIcon
                    className="w-9 h-9 text-gray-500"
                    onClick={() => setRightSlideOpen(false)}
                  />
                </div>
                {peerBookList?.map(({ bookInfo, date }) => (
                  <div
                    className="relative rounded-lg bg-white py-2 mb-2 mx-2 px-2 h-28 sm:px-3 border border-gray-300 shadow-sm flex hover:border-gray-400"
                    key={bookInfo.bid}
                  >
                    <div className="relative flex-shrink-0 w-10 sm:w-16">
                      <Image
                        className="object-contain"
                        layout={'fill'}
                        src={
                          bookInfo?.image
                            ? bookInfo?.image
                            : '/img/placeholder/noimage_480x640.jpg'
                        }
                        alt={bookInfo?.title}
                      />
                    </div>
                    <div className="overflow-hidden flex-1 ml-3">
                      <div className="flex flex-col justify-between h-full">
                        <div className="focus:outline-none">
                          <p className="overflow-y-hidden max-h-10 sm:max-h-16 text-base sm:text-sm font-medium leading-5 text-gray-900 overflow-ellipsis line-clamp-2">
                            {bookInfo.title}
                          </p>
                        </div>
                        <div className="text-right">
                          <a href="#" className="text-blue-500 text-sm">
                            Amazonで見る
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Transition>
          </section>
        </div>
        <div
          id="contorol-interface-area"
          className=" flex justify-center bg-purple-10"
        >
          <div className="w-1/3 max-w-7xl h-10">
            <div className="flex items-center space-x-2 h-full">
              <div className="flex relative justify-center items-center p-2 mr-2 h-full bg-white rounded-lg">
                <div
                  className="relative"
                  id="toggle-mic"
                  onClick={(e) => {
                    toggleIsMicrophoneOn(e)
                    call.setLocalAudio(!call.localAudio())
                  }}
                >
                  <MicrophoneIcon
                    className={classNames(
                      isMicrophoneOn ? 'text-green-500' : 'text-red-500',
                      'w-6 h-6 z-10'
                    )}
                  />
                  {isMicrophoneOn ? (
                    <></>
                  ) : (
                    <Image
                      src="/img/Icons/DisableSlash.svg"
                      layout={'fill'}
                      alt="Disable slash"
                    />
                  )}
                </div>
                <div className=" absolute -bottom-6 text-xs whitespace-nowrap">
                  {isMicrophoneOn ? (
                    <p className="text-blueGray-400">マイクの状態 : オン</p>
                  ) : (
                    <p className="text-blueGray-600">マイクの状態 : オフ</p>
                  )}
                </div>
              </div>
              <div className="relative items-center w-full h-full bg-white rounded-lg">
                <input
                  type="text"
                  name="chat"
                  id="chat"
                  value={chatMessage}
                  className="block absolute inset-y-0 left-0 z-10 px-0 pr-14 pl-4 w-full h-full sm:text-sm text-black rounded-lg border-none focus:ring-1 focus:ring-green-400 focus:outline-none"
                  placeholder="ここにメッセージを入力"
                  onChange={(e) => {
                    setChatMessage(e.target.value)
                  }}
                />
                <div className="absolute inset-y-0 right-0 z-10 pr-4">
                  <button className="h-full text-blue-500 align-middle">
                    送信
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="local-controls">
          <div className="py-4">
            <button
              id="join"
              className="items-center py-3 px-6 text-base font-medium text-white bg-tsundoku-blue-main"
              onClick={joinRoom}
            >
              ルームに参加する
            </button>
          </div>
          <div id="participants"></div>
        </div>
      </main>
    </div>
  )
}
