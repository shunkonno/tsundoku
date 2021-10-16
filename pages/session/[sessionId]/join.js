import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'

// Functions
import { fetchOneSession, fetchAllSessions } from '../../../lib/db-admin'

// Daily
import { CallProvider } from '../../../daily/contexts/CallProvider'
import { MediaDeviceProvider } from '../../../daily/contexts/MediaDeviceProvider'
import { ParticipantsProvider } from '../../../daily/contexts/ParticipantsProvider'
import { TracksProvider } from '../../../daily/contexts/TracksProvider'
import { UIStateProvider } from '../../../daily/contexts/UIStateProvider'
import { WaitingRoomProvider } from '../../../daily/contexts/WaitingRoomProvider'
import getDemoProps from '../../../daily/lib/demoProps'
import PropTypes from 'prop-types'
import App from '../../../daily/components/App'
import CreatingRoom from '../../../daily/components/Prejoin/CreatingRoom'
import Intro from '../../../daily/components/Prejoin/Intro'
import NotConfigured from '../../../daily/components/Prejoin/NotConfigured'

/**
 * Index page
 * ---
 * - Checks configuration variables are set in local env
 * - Optionally obtain a meeting token from Daily REST API (./pages/api/token)
 * - Set call owner status
 * - Finally, renders the main application loop
 */

export default function SessionJoin({
  session,
  domain,
  isConfigured = false,
  forceFetchToken = false,
  forceOwner = false,
  subscribeToTracksAutomatically = true,
  demoMode = false,
  asides,
  modals,
  customTrayComponent,
  customAppComponent
}) {
  // ============================================================
  // Initialize
  // ============================================================

  // State
  const [roomName, setRoomName] = useState()
  const [fetchingToken, setFetchingToken] = useState(false)
  const [token, setToken] = useState()
  const [tokenError, setTokenError] = useState()

  // Routing
  const router = useRouter()
  const { sessionId } = router.query

  // ============================================================
  // Setup
  // ============================================================

  const getMeetingToken = useCallback(async (room, isOwner = false) => {
    if (!room) {
      return false
    }

    setFetchingToken(true)

    // Fetch token from serverside method (provided by Next)
    const res = await fetch('/api/daily/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ roomName: room, isOwner })
    })

    const resJson = await res.json()

    if (!resJson?.token) {
      setTokenError(resJson?.error || true)
      setFetchingToken(false)
      return false
    }

    console.log(`🪙 Token received`)

    setFetchingToken(false)

    setToken(resJson.token)

    // Setting room name will change ready state
    setRoomName(room)

    return true
  }, [])

  // ============================================================
  // Get Token
  // ============================================================

  useEffect(() => {
    if (!sessionId) return

    getMeetingToken(sessionId, true)
  }, [getMeetingToken, sessionId])

  const isReady = !!(isConfigured && roomName)

  if (!isReady) {
    return (
      <main>
        {(() => {
          // if (!isConfigured) return <NotConfigured />
          // if (demoMode) return <CreatingRoom onCreated={getMeetingToken} />

          if (!sessionId) return

          return (
            <Intro
              forceFetchToken={forceFetchToken}
              forceOwner={forceOwner}
              title={process.env.PROJECT_TITLE}
              room={roomName}
              error={tokenError}
              fetching={fetchingToken}
              domain={domain}
              onJoin={(room, isOwner, fetchToken) =>
                fetchToken ? getMeetingToken(room, isOwner) : setRoomName(room)
              }
            />
          )
        })()}

        <style jsx>{`
          height: 100vh;
          display: grid;
          grid-template-columns: 640px;
          align-items: center;
          justify-content: center;
        `}</style>
      </main>
    )
  }

  // ============================================================
  // Call UI
  // ============================================================
  return (
    <UIStateProvider
      asides={asides}
      modals={modals}
      customTrayComponent={customTrayComponent}
    >
      <CallProvider
        domain={domain}
        room={roomName}
        token={token}
        subscribeToTracksAutomatically={subscribeToTracksAutomatically}
      >
        <ParticipantsProvider>
          <TracksProvider>
            <MediaDeviceProvider>
              <WaitingRoomProvider>
                {customAppComponent || <App session={session} />}
              </WaitingRoomProvider>
            </MediaDeviceProvider>
          </TracksProvider>
        </ParticipantsProvider>
      </CallProvider>
    </UIStateProvider>
  )
}

SessionJoin.propTypes = {
  isConfigured: PropTypes.bool,
  domain: PropTypes.string,
  asides: PropTypes.arrayOf(PropTypes.func),
  modals: PropTypes.arrayOf(PropTypes.func),
  customTrayComponent: PropTypes.node,
  customAppComponent: PropTypes.node,
  forceFetchToken: PropTypes.bool,
  forceOwner: PropTypes.bool,
  subscribeToTracksAutomatically: PropTypes.bool,
  demoMode: PropTypes.bool
}

// ============================================================
// Fetch static data
// ============================================================
export async function getStaticProps(context) {
  const defaultProps = getDemoProps()
  // Fetch session info
  const session = await fetchOneSession(context.params.sessionId)

  return {
    props: {
      session,
      domain: defaultProps.domain,
      isConfigured: defaultProps.isConfigured,
      subscribeToTracksAutomatically:
        defaultProps.subscribeToTracksAutomatically,
      demoMode: defaultProps.demoMode
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
