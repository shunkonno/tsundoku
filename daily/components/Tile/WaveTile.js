import React, { memo, useEffect, useState, useRef } from 'react'
import { ReactComponent as IconMicMute } from '../../icons/mic-off-sm.svg'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { DEFAULT_ASPECT_RATIO } from '../../constants'
import { ReactComponent as Avatar } from './avatar.svg'

import Image from 'next/image'
import {useUserInfo} from '../../../context/useUserInfo'
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
  ({
    participant,
    ...props
  }) => {

    const userInfo = useUserInfo()

    return(
      
      <div className="overflow-hidden relative w-48 sm:w-72 md:w-80 mx-auto lg:w-full rounded-lg">
        <div className="aspect-w-1 aspect-h-1 bg-gradient-to-b from-blue-400 to-green-400">
          <div className="absolute bottom-0 transform translate-y-full w-full h-1/2">
            <Wave
              fill="url(#gradient-self)"
              className="h-full"
              paused={false}
              options={{
                amplitude: 30,
                speed: 0.15,
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
              <div  className="absolute  w-20 h-20 top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Image
              className="rounded-full"
              src={
                userInfo?.avatar
                  ? userInfo?.avatar
                  : '/img/placeholder/noimage_480x640.jpg'
              }
              width={80}
              height={80}
              objectFit={"cover"}
              alt="Avatar"
            />
            
            <p className="text-center text-gray-800">
              {userInfo ? userInfo.name : 'noname'}
            </p>
            </div>
            </div>
          </div>
        </div>
      </div>
      
    )
  }
)

export default WaveTile