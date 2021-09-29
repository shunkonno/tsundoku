// ============================================================
// Imports
// ============================================================
import Head from 'next/head'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import Script from 'next/script'

// Components
import { AppHeader } from '../../../components/Header'

// Functions
import { useAuth } from '../../../lib/auth'
import fetcher from '../../../utils/fetcher'

export default function Session() {
  // ============================================================
  // Initialize
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
  // Return Page
  // ============================================================
  return (
    <div>
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

      <main className="relative sm:py-4 px-4 mx-auto max-w-7xl">
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
