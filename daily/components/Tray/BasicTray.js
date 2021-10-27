import React from 'react'
import { NETWORK_ASIDE } from '../Aside/NetworkAside'
import { PEOPLE_ASIDE } from '../Aside/PeopleAside'
import { DEVICE_MODAL } from '../DeviceSelectModal'
import { useCallState } from '../../contexts/CallProvider'
import { useMediaDevices } from '../../contexts/MediaDeviceProvider'
import { useUIState } from '../../contexts/UIStateProvider'
import { ReactComponent as IconCameraOff } from '../../icons/camera-off-md.svg'
import { ReactComponent as IconCameraOn } from '../../icons/camera-on-md.svg'
import { ReactComponent as IconLeave } from '../../icons/leave-md.svg'
import { ReactComponent as IconMicOff } from '../../icons/mic-off-md.svg'
import { ReactComponent as IconMicOn } from '../../icons/mic-on-md.svg'
import { ReactComponent as IconNetwork } from '../../icons/network-md.svg'
import { ReactComponent as IconPeople } from '../../icons/people-md.svg'
import { ReactComponent as IconSettings } from '../../icons/settings-md.svg'
import { Tray, TrayButton } from './Tray'

export const BasicTray = () => {
  const { callObject, leave } = useCallState()
  const { customTrayComponent, openModal, toggleAside } = useUIState()
  const { isCamMuted, isMicMuted } = useMediaDevices()

  const toggleCamera = (newState) => {
    if (!callObject) return false
    return callObject.setLocalVideo(newState)
  }

  const toggleMic = (newState) => {
    if (!callObject) return false
    return callObject.setLocalAudio(newState)
  }

  return (
    <Tray>
      {/* DISABLE CAMERA TOGGLE */}
      {/* <TrayButton
        label="Camera"
        onClick={() => toggleCamera(isCamMuted)}
        orange={isCamMuted}
      >
        {isCamMuted ? <IconCameraOff /> : <IconCameraOn />}
      </TrayButton> */}
      {/* DISABLE CAMERA TOGGLE - END */}

      <TrayButton
        label="マイク"
        onClick={() => toggleMic(isMicMuted)}
        orange={isMicMuted}
      >
        {isMicMuted ? <IconMicOff /> : <IconMicOn />}
      </TrayButton>
      <TrayButton label="デバイス" onClick={() => openModal(DEVICE_MODAL)}>
        <IconSettings />
      </TrayButton>
      {/* <TrayButton label="Network" onClick={() => toggleAside(NETWORK_ASIDE)}>
        <IconNetwork />
      </TrayButton> */}
      {/* <TrayButton label="People" onClick={() => toggleAside(PEOPLE_ASIDE)}>
        <IconPeople />
      </TrayButton> */}

      {customTrayComponent}

      <span className="divider" />

      <TrayButton label="退室" onClick={() => leave()} orange>
        <IconLeave />
      </TrayButton>
    </Tray>
  )
}
export default BasicTray
