// ============================================================
// Imports
// ============================================================
import { useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import Script from 'next/script'

// Components
import { AppHeader } from '../../../components/Header'
import Wave from 'react-wavify'

//Assets
import { MicrophoneIcon, ChevronLeftIcon } from '@heroicons/react/outline'

// Functions
import { useAuth } from '../../../lib/auth'
import fetcher from '../../../utils/fetcher'
import { fetchOneSession, fetchAllSessions } from '../../../lib/db-admin'
import { formatISOStringToTime } from '../../../utils/formatDateTime'
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

export default function Session({session}) {
  console.log(session)
  // ============================================================
  // Initial State
  // ============================================================
  const [chatMessage, setChatMessage] = useState('')
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(true)
  // ============================================================
  // Routing
  // ============================================================

  const router = useRouter()
  const { sessionId } = router.query

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
        // エラー時には、10回まではリトライする
        if (retryCount >= 10) return
      }
    }
  )

  console.log(userInfo)

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

  const isReadingBook = bookList?.find((book)=>{
    return book.bookInfo.bid == userInfo.isReading
  })

  console.log('isReadingBook is: ',isReadingBook)

  const dummyUser = [{
    bookList: [],
    bookListWithoutISBN: [],
    email: 'inafune@gmail.com',
    gender: "male",
    isNewUser: false,
    isReading: "MkB7wTNguw",
    name: "inafune",
    provider: "google.com",
    uid: "dnanbfkjabsdfjasjdkbflajkb",

  }]

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

    if(isMicrophoneOn) {
      setIsMicrophoneOn(false)
    }
    else {
      setIsMicrophoneOn(true)
    }
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

        <section id="time-line" className="py-6 px-8 mx-auto max-w-7xl">
          <div className="flex">
            <div className="flex-shrink-0 text-center">
              <p>開始時刻</p>
              <p>{formatISOStringToTime(session?.startDateTime)}</p>
            </div>
            <div className="flex-1 border-b border-gray-100">

            </div>
            <div className="flex-shrink-0 text-center">
              <p>終了時刻</p>
              <p>{formatISOStringToTime(session?.endDateTime)}</p>
            </div>

            
            
          </div>
        </section>
        <div className="flex">
          <section id="left-column" className="flex flex-shrink-0 items-center w-72 bg-blue-10">
            <div className="flex flex-col items-center mr-8 w-full h-80 bg-white rounded-tr-lg rounded-br-lg px-4 py-2">
              <div className="text-gray-500 font-bold py-2 text-lg flex-shrink-0 w-full">いま読んでいる本</div>
              <div className="flex flex-col py-4 space-y-4 items-center flex-1">
                <div className="relative w-24 h-32 shadow-md">
                  <Image src={isReadingBook ? isReadingBook?.bookInfo.image :'/img/placeholder/noimage_480x640.jpg' } layout={'fill'} />
                </div>
                <div className="text-black">{isReadingBook?.bookInfo.title}</div>
              </div>
              <div className="flex-shrink-0 w-full flex">
                <ChevronLeftIcon className="w-5 h-5 text-blue-400" />
                <button className="text-sm text-blue-400">
                  本を変更する
                </button>
              </div>
            </div>

          </section>
          <section id="center-column" className="flex-1 p-8 bg-green-10">
            <div id="main-vc" className="flex items-center mx-auto max-w-screen-2xl h-full bg-orange-10">
              <div className="flex justify-between items-center space-x-8 w-full h-full">
                <div className="w-full">
                  <div className="bg-gradient-to-b to-green-400 from-blue-400 rounded-lg aspect-w-2 aspect-h-1 overflow-hidden">
                  <Wave fill='url(#gradient)'
                    paused={false}
                    options={{
                      height: 300,
                      amplitude: 20,
                      speed: 0.15,
                      points: 3
                    }}
                  >
                    <defs>
                      <linearGradient id="gradient" gradientTransform="rotate(90)">
                        <stop offset="10%"  stopColor="#67E8F9" />
                        <stop offset="90%" stopColor="#14B8A6" />
                      </linearGradient>
                    </defs>
                  </Wave>
                  </div>
                </div>
                {/* <div className="w-1/2">
                  <div className="bg-white rounded-lg aspect-w-1 aspect-h-1">

                  </div>
                </div> */}
              </div>
              
            </div>
          </section>
          <section id="right-column" className="flex flex-shrink-0 items-center w-72 bg-yellow-10">
            <div className="ml-8 w-full h-80 bg-white rounded-tl-lg rounded-bl-lg">

            </div>
          </section>
        </div>
        <div id="contorol-interface-area" className=" flex justify-center bg-purple-10">
          
          <div className="w-1/3 max-w-7xl h-10">
                <div className="flex items-center space-x-2 h-full">
                
                  <div className="flex justify-center items-center p-2 mr-2 h-full bg-white rounded-lg">
                    <div 
                      className="relative" 
                      onClick={(e)=> {
                        toggleIsMicrophoneOn(e)
                        call.setLocalAudio(!call.localAudio())
                      }}
                    >
                      <MicrophoneIcon 
                        className={classNames(
                          isMicrophoneOn ?
                          'text-green-500'
                          :
                          'text-red-500',
                          'w-6 h-6 z-10'
                        )}
                        
                      />
                      {isMicrophoneOn ? <></> :
                        <Image src='/img/Icons/DisableSlash.svg' layout={'fill'} />
                      }
                    </div>
                  </div>
                  <div className="relative items-center w-full h-full bg-white rounded-lg">
                    
                  <input 
                      type="text"
                      name="chat"
                      id="chat"
                      value={chatMessage} 
                      className="absolute inset-y-0 left-0 pl-4 pr-14 z-10 rounded-lg block px-0 w-full h-full sm:text-sm text-black border-none focus:outline-none focus:ring-1 focus:ring-green-400" placeholder="ここにメッセージを入力"
                      onChange={(e)=> {
                        setChatMessage(e.target.value)
                      }}
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 z-10">
                      <button className="text-blue-500 h-full align-middle">
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

          <div className="py-4">
            <button
              id="leave"
              className="items-center py-3 px-6 text-base font-medium text-white bg-red-500"
              onClick={leaveRoom}
            >
              退出する
            </button>
          </div>
          <div className="py-4">
            <button
              id="toggle-mic"
              onClick={() => {
                call.setLocalAudio(!call.localAudio())
              }}
            >
              toggle mic state
            </button>
          </div>
          <div id="participants"></div>
        </div>
      </main>
    </div>
  )
}
