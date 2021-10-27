import React, { memo, Fragment, useEffect, useState, useRef } from 'react'
import { ReactComponent as IconMicMute } from '../../icons/mic-off-sm.svg'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { DEFAULT_ASPECT_RATIO } from '../../constants'
import { ReactComponent as Avatar } from './avatar.svg'

import Image from 'next/image'
import {useOneUserInfo} from '../../../context/useOneUserInfo'
import Wave from 'react-wavify'
import { Dialog, Transition } from '@headlessui/react'

//Assets
import {
  MicrophoneIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LogoutIcon,
  XIcon
} from '@heroicons/react/outline'
import colors from 'tailwindcss/colors'

export const WaveTile = memo(
  ({uid}) => {
    const [ isApper, setIsAppear] = useState(false)

    //初回のみアニメーションを実行するため、マウント時isAppearをfalseからtrueに切り替える。
    useEffect(()=>{
      setIsAppear(true)
    },[])

    const userInfo = useOneUserInfo(uid)

    // 波の速さを0.10から0.15の範囲でランダムで決定
    const waveSpeed = (Math.random() * (0.150 - 0.100) + 0.100)

    return(
      <Transition
        
        show={isApper}
        enter="transition ease-out duration-300"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-200"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div className="overflow-hidden relative w-48 sm:w-72 md:w-80 mx-auto lg:w-full rounded-lg">
          <div className="aspect-w-1 aspect-h-1 bg-gradient-to-b from-blue-400 to-green-400">
            <div className="absolute bottom-0 transform translate-y-full w-full h-1/2">
              <Wave
                fill="url(#gradient-self)"
                className="h-full"
                paused={false}
                options={{
                  amplitude: 30,
                  speed: waveSpeed,
                  points: 3
                }}
              >
                <defs>
                  <linearGradient
                    id="gradient-self"
                    gradientTransform="rotate(90)"
                  >
                    <stop offset="10%" stopColor={colors.green['300']} />
                    <stop offset="90%" stopColor={colors.cyan['300']} />
                  </linearGradient>
                </defs>
              </Wave>
            </div>
            <div className="absolute">
              <div className="relative w-full h-full">
                <div className="absolute w-full top-1/2 md:top-1/4 transform -translate-y-1/2 md:-translate-y-0">
                  <div className="mx-auto relative w-16 sm:w-20 h-16 sm:h-20">
                    <Image
                      className="rounded-full"
                      src={
                        userInfo?.avatar
                          ? userInfo?.avatar
                          : '/img/placeholder/noimage_480x640.jpg'
                      }
                      layout={'fill'}
                      objectFit={"cover"}
                      alt="Avatar"
                    />
                  </div>
                  <p className="w-full mt-0 md:mt-2 px-4 truncate text-center text-gray-800">
                    {userInfo ? userInfo.name : 'noname'}
                  </p>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </Transition>
    )
  }
)

export default WaveTile