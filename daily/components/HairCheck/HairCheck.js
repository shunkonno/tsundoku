import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Button from '../Button'
import { DEVICE_MODAL } from '../DeviceSelectModal/DeviceSelectModal'
import { TextInput } from '../Input'
import Loader from '../Loader'
import DeviceSelect from '../DeviceSelect'
import MuteButton from '../MuteButton'
import Tile from '../Tile'
import { ACCESS_STATE_LOBBY } from '../../constants'
import { useCallState } from '../../contexts/CallProvider'
import { useMediaDevices } from '../../contexts/MediaDeviceProvider'
import { useParticipants } from '../../contexts/ParticipantsProvider'
import { useUIState } from '../../contexts/UIStateProvider'
import {
  DEVICE_STATE_BLOCKED,
  DEVICE_STATE_NOT_FOUND,
  DEVICE_STATE_IN_USE,
  DEVICE_STATE_PENDING,
  DEVICE_STATE_LOADING,
  DEVICE_STATE_GRANTED
} from '../../contexts/useDevices'
import IconSettings from '../../icons/settings-sm.svg'

import { useDeepCompareMemo } from 'use-deep-compare'

import { useUserInfo } from '../../../context/useUserInfo'

/**
 * Hair check
 * ---
 * - Setup local media devices to see how you look / sound
 * - Toggle mute state of camera and mic
 * - Set user name and join call / request access
 */
export const HairCheck = () => {

  const userInfo = useUserInfo()

  const { callObject, join } = useCallState()
  const { localParticipant } = useParticipants()
  const { deviceState, camError, micError, isCamMuted, isMicMuted } =
    useMediaDevices()
  const { openModal } = useUIState()
  const [waiting, setWaiting] = useState(false)
  const [joining, setJoining] = useState(false)
  const [denied, setDenied] = useState()
  const [userName, setUserName] = useState('')

  useEffect(()=>{
    setUserName(userInfo?.name)
  },[userInfo])

  useEffect(()=>{
    setTimeout(()=>{
      callObject.setLocalVideo(false)
    }, 1000)
  },[callObject])

  // Initialise devices (even though we're not yet in a call)
  useEffect(() => {
    if (!callObject) return
    callObject.startCamera()
  }, [callObject])

  const joinCall = async () => {
    if (!callObject) return

    // Disable join controls
    setJoining(true)

    // Set the local participants name
    await callObject.setUserName(userName)

    // Async request access (this will block until the call owner responds to the knock)
    const { access } = callObject.accessState()
    await callObject.join()

    // If we we're in the lobby, wait for the owner to let us in
    if (access?.level === ACCESS_STATE_LOBBY) {
      setWaiting(true)
      const { granted } = await callObject.requestAccess({
        name: userName,
        access: {
          level: 'full'
        }
      })

      if (granted) {
        // Note: we don't have to do any thing here as the call state will mutate
        console.log('👋 Access granted')
      } else {
        console.log('❌ Access denied')
        setDenied(true)
      }
    }
  }

  // Memoize the to prevent unnecassary re-renders
  const tileMemo = useDeepCompareMemo(
    () => (
      <Tile
        participant={localParticipant}
        mirrored
        showAvatar
        showName={false}
      />
    ),
    [localParticipant]
  )

  const isLoading = useMemo(
    () => deviceState === DEVICE_STATE_LOADING,
    [deviceState]
  )

  const hasError = useMemo(() => {
    if (
      !deviceState ||
      [
        DEVICE_STATE_LOADING,
        DEVICE_STATE_PENDING,
        DEVICE_STATE_GRANTED
      ].includes(deviceState)
    ) {
      return false
    }
    return true
  }, [deviceState])

  const camErrorVerbose = useMemo(() => {
    switch (camError) {
      case DEVICE_STATE_BLOCKED:
        return 'Camera blocked by user'
      case DEVICE_STATE_NOT_FOUND:
        return 'Camera not found'
      case DEVICE_STATE_IN_USE:
        return 'Device in use'
      default:
        return 'unknown'
    }
  }, [camError])

  return (
    <>
      <main className="haircheck">
        <div className="absolute mt-2 ml-4 top-0 left-0">
        <Image
          src="/img/logos/tsundoku-logo-mark-and-typo-text-wh.svg"
          alt="tsundoku-logo"
          width={132}
          height={58}
        />
        </div>
        <div className="panel text-center text-black border border-gray-100 bg-white bg-opacity-80 rounded-lg px-12 py-8">
          <header>
            <h2 className="">
              <p>準備がよろしければ</p>
              <p>『参加』を押してください。</p>
            </h2>
          </header>
          {/* <div className="text-left py-6">
            <DeviceSelect />
          </div> */}
          <div className="tile-container">
            <div className="content">
              <Button
                className="device-button"
                size="medium-square"
                variant="blur"
                onClick={() => openModal(DEVICE_MODAL)}
              >
                <IconSettings />
              </Button>

              {isLoading && (
                <div className="overlay-message">
                  読み込み中…
                </div>
              )}
              {hasError && (
                <>
                  {camError && (
                    <div className="overlay-message">{camErrorVerbose}</div>
                  )}
                  {micError && (
                    <div className="overlay-message">{micError}</div>
                  )}
                </>
              )}
            </div>
            <div className="mute-buttons">
              {/* DISABLE CAMERA TOGGLE */}
              {/* <MuteButton isMuted={isCamMuted} /> */}
              {/* DISABLE CAMERA TOGGLE - END*/}

              <MuteButton mic isMuted={isMicMuted} />
            </div>
            {/* {tileMemo} */}
          </div>
          <footer>
            {waiting ? (
              <div className="waiting">
                <Loader />
                {denied ? (
                  <span>Call owner denied request</span>
                ) : (
                  <span>Waiting for host to grant access</span>
                )}
              </div>
            ) : (
              <>
                <p className="p-4 w-full rounded-lg bg-white bg-opacity-20 text-left text-white">{userName}</p>
                <Button
                  disabled={joining}
                  onClick={() => joinCall(userName)}
                >
                  参加
                </Button>
              </>
            )}
          </footer>
        </div>

        <style jsx>{`
          .haircheck {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            width: 100%;
            background: url('/assets/pattern-bg.png') center center no-repeat;
            background-size: 100%;
          }

          .haircheck .panel {
            width: 580px;
          }

          .haircheck .tile-container {
            border-radius: var(--radius-md);
            -webkit-mask-image: -webkit-radial-gradient(white, black);
            position: relative;
          }

          .haircheck footer:before {
            top: 0px;
            bottom: auto;
            border-radius: 0px 0px 6px 6px;
          }

          .haircheck header h2 {
            margin: 0px;
          }

          .haircheck .content {
            position: relative;
            top: 0px;
            left: 0px;
            right: 0px;
            bottom: 0px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99;
          }

          .haircheck .mute-buttons {
            position: relative;
            bottom: 0px;
            left: 0px;
            right: 0px;
            z-index: 99;
            padding: var(--spacing-xs);
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-xs);
          }

          

          .haircheck .overlay-message {
            color: var(--reverse);
            padding: var(--spacing-xxs) var(--spacing-xs);
            background: rgba(0, 0, 0, 0.35);
            border-radius: var(--radius-sm);
          }

          .haircheck footer {
            position: relative;
            border-radius: 0 0 var(--radius-md) var(--radius-md);
            display: grid;
            grid-template-columns: 1fr auto;
            grid-column-gap: var(--spacing-xs);
          }

          .waiting {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .waiting span {
            margin-left: var(--spacing-xxs);
          }
        `}</style>
      </main>
    </>
  )
}

export default HairCheck
