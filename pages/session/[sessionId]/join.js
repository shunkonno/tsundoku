// ============================================================
// Imports
// ============================================================
import Head from 'next/head'
import { useRouter } from 'next/router'
import Script from 'next/script'

export default function Session() {
  // ============================================================
  // Initialize
  // ============================================================
  const router = useRouter()
  const { sessionId } = router.query

  // ============================================================
  // Initialize Video Call
  // ============================================================
  if (typeof window !== 'undefined') {
    callDailyIframe()
  }

  function callDailyIframe() {
    const callFrame = window.DailyIframe.createFrame({
      // TODO: Change language based on locale (https://docs.daily.co/reference#properties)
      lang: 'jp',
      showLeaveButton: true,
      iframeStyle: { position: 'fixed', width: '100%', height: '100%' }
    })

    // TODO: Set domain config with REST API (redirect_on_meeting_exit)
    callFrame.join({ url: 'https://tsundoku.daily.co/' + sessionId })
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
        <title>DASHBOARD</title>
        <meta
          name="description"
          content="一緒に読書してくれる誰かを探すためのマッチングサービス"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </div>
  )
}
