import React, { useMemo } from 'react'
import ExpiryTimer from '../ExpiryTimer'
import { useCallState } from '../../contexts/CallProvider'
import { useCallUI } from '../../hooks/useCallUI'

import PropTypes from 'prop-types'
import Room from '../Call/Room'
import { Asides } from './Asides'
import { Modals } from './Modals'

export const App = ({ customComponentForState, session }) => {
  const { roomExp, state } = useCallState()

  const componentForState = useCallUI({
    state,
    session,
    room: <Room session={session}/>,
    ...customComponentForState
  })

  // Memoize children to avoid unnecassary renders from HOC
  return useMemo(
    () => (
      <>
        {roomExp && <ExpiryTimer expiry={roomExp} />}
        <div className="app">
          {componentForState()}
          <Modals />
          <Asides />
          <style jsx>{`
            color: white;
            height: 100vh;
            display: flex;
            align-items: center;
            background-color: #303C5B;
            justify-content: center;

            .loader {
              margin: 0 auto;
            }
          `}</style>
        </div>
      </>
    ),
    [componentForState, roomExp]
  )
}

App.propTypes = {
  customComponentForState: PropTypes.any
}

export default App
