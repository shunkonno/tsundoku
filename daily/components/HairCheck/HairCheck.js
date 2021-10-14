import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
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

//Assets
import {
  MicrophoneIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LogoutIcon,
  XIcon
} from '@heroicons/react/outline'

/**
 * Hair check
 * ---
 * - Setup local media devices to see how you look / sound
 * - Toggle mute state of camera and mic
 * - Set user name and join call / request access
 */
export const HairCheck = ({session}) => {

  const router = useRouter()

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

  // ============================================================
  // Button Handler
  // ============================================================

  const handleBackToDetailOrHome = (e) => {
    e.preventDefault()

    const currentDateTime = new Date().toISOString()

    if(session.endDateTime > currentDateTime){
      //現在が終了時間を過ぎていたら
      router.push(`/session/${session.sessionId}/detail`)
    }else{
      router.replace(`/home`)
    }
    
  }

  // ============================================================
  // Return Component
  // ============================================================

  return (
    <>
      <main className="haircheck relative flex items-center justify-center w-full h-full ">
        <div className="absolute mt-2 ml-4 top-0 left-0">
        <Image
          src="/img/logos/tsundoku-logo-mark-and-typo-text-wh.svg"
          alt="tsundoku-logo"
          width={132}
          height={58}
        />
        </div>
        <div 
          className="text-center text-black border border-gray-100 bg-white bg-opacity-80 rounded-lg px-8 py-6"
          style={{ width: '580px' }}
        >
          <header className="relative">
            <h2>
              <p>準備がよろしければ</p>
              <p>『参加』を押してください。</p>
            </h2>
            <div className="absolute top-0 left-0">
              <button 
                onClick={(e)=>{
                  handleBackToDetailOrHome(e)
              }}>
              <ChevronLeftIcon 
                className="inline-block mr-1 w-5 h-5 text-gray-900"
                aria-hidden="true"
              />
                <span className="text-sm text-gray-900">戻る</span>
              </button>
            </div>
          </header>
          <div className="text-left mt-6">
            <DeviceSelect />
          </div>
          <div className="rounded-lg relative;">
            <div className="relative inset-0 flex items-center justify-items-center z-90">
              {/* <Button
                className="device-button"
                size="medium-square"
                variant="blur"
                onClick={() => openModal(DEVICE_MODAL)}
              >
                <IconSettings />
              </Button> */}

              {isLoading && (
                <div className="absolute top-1/2 left-1/2 overlay-message text-gray-900 bg-gray-400 rounded-md py-3 px-4">
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
            <div className="flex items-center justify-center gap-4 py-2 mb-6">
              {/* DISABLE CAMERA TOGGLE */}
              {/* <MuteButton isMuted={isCamMuted} /> */}
              {/* DISABLE CAMERA TOGGLE - END*/}

              <MuteButton mic isMuted={isMicMuted} />
              <p>マイクの状態 : {isMicMuted ? 'オフ' : 'オン'}</p>
            </div>
            {/* {tileMemo} */}
          </div>
          <footer>
            {waiting ? (
              <div className="flex items-center justify-center">
                <Loader />
                {denied ? (
                  <span className="ml-4">Call owner denied request</span>
                ) : (
                  <span className="ml-4">Waiting for host to grant access</span>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center">
                  
                <Button
                  disabled={joining}
                  onClick={() => joinCall(userName)}
                >
                  参加する
                </Button>
              </div>
            )}
          </footer>
        </div>

        <style jsx>{`
          .haircheck {
            background: url('/assets/pattern-bg.png') center center no-repeat;
            background-size: 100%;
          }
        `}</style>
      </main>
    </>
  )
}

export default HairCheck
