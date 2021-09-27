// ============================================================
// Imports
// ============================================================
import Head from 'next/head'
import { useRouter } from 'next/router'
// import useSWR from 'swr'
import Script from 'next/script'

// Functions
// import { useAuth } from '../../../lib/auth'
// import fetcher from '../../../utils/fetcher'

export default function Session() {
  // ============================================================
  // Initialize
  // ============================================================
  const router = useRouter()
  const { sessionId } = router.query

  // ============================================================
  // Auth
  // ============================================================

  // const auth = useAuth()
  // const user = auth.user

  // ============================================================
  // Fetch Data
  // ============================================================

  // // Fetch logged user info on client side
  // const { data: userInfo } = useSWR(
  //   user ? ['/api/user', user.token] : null,
  //   fetcher,
  //   {
  //     onErrorRetry: ({ retryCount }) => {
  //       // Retry up to 10 times
  //       if (retryCount >= 10) return
  //     }
  //   }
  // )

  // ============================================================
  // Initialize Video Call
  // ============================================================
  if (typeof window !== 'undefined') {
    callDailyIframe()
    // if (userInfo) {
    //   callDailyIframe(userInfo.name)
    // }
  }

  function callDailyIframe() {
    const callFrame = window.DailyIframe.createFrame({
      // TODO: Change language based on locale (https://docs.daily.co/reference#properties)
      url: 'https://tsundoku.daily.co/' + sessionId,
      lang: 'jp',
      showLeaveButton: true,
      // showLocalVideo: false,
      // videoSource: false,
      iframeStyle: { position: 'fixed', width: '100%', height: '100%' }
    })

    // TODO: Set domain config with REST API (redirect_on_meeting_exit)
    // callFrame.join({
    //   userName: userName
    // })
    callFrame.join()
  }

  // ============================================================
  // Return Page
  // ============================================================
  return (
    <div>
      {/* Import Daily for video chat */}
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
    </div>
  )
}
