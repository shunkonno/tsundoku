// ============================================================
// Imports
// ============================================================
import Head from 'next/head'
import Script from 'next/script'

export default function Session() {
  // ============================================================
  // Initialize Video Call
  // ============================================================
  if (typeof window !== 'undefined') {
    callDailyIframe()
  }

  function callDailyIframe() {
    const callFrame = window.DailyIframe.createFrame({
      // TODO: Change language based on locale (https://docs.daily.co/reference#properties)
      lang: 'en',
      showLeaveButton: true,
      iframeStyle: { position: 'fixed', width: '100%', height: '100%' }
    })

    // TODO: Dynamically generate room url
    // TODO: Set domain config with REST API (redirect_on_meeting_exit)
    callFrame.join({ url: 'https://tsundoku.daily.co/new-prebuilt-test' })
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
