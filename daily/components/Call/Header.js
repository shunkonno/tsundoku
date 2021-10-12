import React, { useMemo } from 'react'
import Image from 'next/image'
import HeaderCapsule from '../HeaderCapsule'
import { useParticipants } from '../../contexts/ParticipantsProvider'
import { useUIState } from '../../contexts/UIStateProvider'

export const Header = () => {
  const { participantCount } = useParticipants()
  const { customCapsule } = useUIState()

  return useMemo(
    () => (
      <header className="room-header">
        <Image
          src="/img/logos/tsundoku-logo-mark-and-typo-text-wh.svg"
          alt="tsundoku-logo"
          className="logo"
          width={132}
          height={58}
        />

        <HeaderCapsule>
          {`現在の参加者:${participantCount}`}
        </HeaderCapsule>
        {/* {customCapsule && (
          <HeaderCapsule variant={customCapsule.variant}>
            {customCapsule.variant === 'recording' && <span />}
            {customCapsule.label}
          </HeaderCapsule>
        )} */}

        <style jsx>{`
          .room-header {
            display: flex;
            flex: 0 0 auto;
            column-gap: var(--spacing-xxs);
            box-sizing: border-box;
            padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-xxs)
              var(--spacing-sm);
            align-items: center;
            width: 100%;
          }

          .logo {
            margin-right: var(--spacing-xs);
          }
        `}</style>
      </header>
    ),
    [participantCount, customCapsule]
  )
}

export default Header
