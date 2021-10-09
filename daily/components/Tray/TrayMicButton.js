import React from 'react'
import { TrayButton } from '../Tray'
import { useAudioLevel } from '../../hooks/useAudioLevel'
import { ReactComponent as IconMicOff } from '../../icons/mic-off-md.svg'
import { ReactComponent as IconMicOn } from '../../icons/mic-on-md.svg'

import PropTypes from 'prop-types'

export const TrayMicButton = ({ isMuted, onClick }) => {
  const audioLevel = useAudioLevel('local')

  return (
    <TrayButton label="Mic" onClick={onClick} orange={isMuted}>
      {isMuted ? <IconMicOff /> : <IconMicOn />}
    </TrayButton>
  )
}

TrayMicButton.propTypes = {
  isMuted: PropTypes.bool,
  onClick: PropTypes.func.isRequired
}

export default TrayMicButton
