// Basic
import React, { Fragment, useState, useMemo, useEffect, useRef } from 'react'

// Vercel
import useSWR, { useSWRConfig } from 'swr'
import Image from 'next/image'

// Components
import { WaveTile } from '../Tile'
import { Transition } from '@headlessui/react'
import { LeftBookListSidebar } from '../Sidebar'
import { RightBookListSidebar } from '../Sidebar'

// Settings
import { DEFAULT_ASPECT_RATIO } from '../../constants'

// Context
import { useParticipants } from '../../contexts/ParticipantsProvider'
import { useDeepCompareMemo } from 'use-deep-compare'

import { useUserInfo } from '../../../context/useUserInfo'
import { useOneUserInfo } from '../../../context/useOneUserInfo'
import { useUserBookList } from '../../../context/useUserBookList'
import { useIsReadingBook } from '../../../context/useIsReadingBook'

// Functions
import { useAuth } from '../../../lib/auth'
import fetcher from '../../../utils/fetcher'
import classNames from '../../../utils/classNames'

/**
 * Basic unpaginated video tile grid, scaled by aspect ratio
 *
 * Note: this component is designed to work with automated track subscriptions
 * and is only suitable for small call sizes as it will show all participants
 * and not paginate.
 *
 * Note: this grid does not show screenshares (just participant cams)
 *
 * Note: this grid does not sort participants
 */
export const VideoGrid = ({ session }) => {
  // ============================================================
  // Initialize
  // ============================================================
  // Auth
  const auth = useAuth()
  const user = auth.user

  // mutateを定義
  const { mutate } = useSWRConfig()

  // ============================================================
  // スリープしないようにする
  // ============================================================
  let wakeLock = null

  if (
    typeof window !== 'undefined' &&
    typeof window.navigator !== 'undefined'
  ) {
    try {
      wakeLock = navigator.wakeLock.request('screen')
      console.log('Wake Lock is active')
    } catch (err) {
      console.error(`${err.name}, ${err.message}`)
    }
  }

  // ============================================================
  // Fetch Data
  // ============================================================

  // ユーザー情報
  const { data: userInfo } = useSWR(
    user ? ['/api/user', user.token] : null,
    fetcher,
    {
      onErrorRetry: ({ retryCount }) => {
        // Retry up to 10 times
        if (retryCount >= 10) return
      }
    }
  )

  // ピアユーザー情報を取得
  // ピアユーザーのIDがguestIdかownerIdか識別
  const peerUid =
    userInfo?.uid === session?.ownerId ? session?.guestId : session?.ownerId

  // ピアユーザー情報
  const { data: peerUserInfo } = useSWR(
    peerUid ? '/api/user/' + peerUid + '/info' : null,
    fetcher,
    {
      onErrorRetry: ({ retryCount }) => {
        // エラー時には、10回まではリトライする
        if (retryCount >= 10) return
      }
    }
  )

  // ピアユーザーのブックリスト取得
  const { data: peerBookList } = useSWR(
    peerUid ? '/api/user/' + peerUid + '/booklist' : null,
    fetcher,
    {
      onErrorRetry: ({ retryCount }) => {
        // Retry up to 10 times
        if (retryCount >= 10) return
      }
    }
  )

  const peerIsReadingBook = peerBookList?.find((book) => {
    return book.bookInfo.bid == peerUserInfo?.isReading
  })

  const [leftSlideOpen, setLeftSlideOpen] = useState(false)
  const [rightSlideOpen, setRightSlideOpen] = useState(false)

  const { participants } = useParticipants()

  // const aspectRatio = DEFAULT_ASPECT_RATIO
  // const tileCount = participants.length || 0
  const tileCount = 2

  // Memoize our tile list to avoid unnecassary re-renders
  const tiles = useDeepCompareMemo(() => {
    return (
      <>
        <WaveTile key={userInfo?.uid} uid={userInfo?.uid} />
        {tileCount >= 2 && (
          <WaveTile key={peerUserInfo?.uid} uid={peerUserInfo?.uid} />
        )}
      </>
    )
  }, [participants, peerUserInfo])

  if (!participants.length) {
    return null
  }

  // ============================================================
  // Return Component
  // ============================================================
  return (
    <div
      className="main-area flex h-full items-center justify-center relative w-full"
    >
      <LeftBookListSidebar leftSlideOpen={leftSlideOpen} setLeftSlideOpen={setLeftSlideOpen} />
      <div id='tiles' className='flex-1 h-full'>
        <div
          className={classNames(
            !(tileCount >= 2)
              ? 'md:w-full lg:w-1/2 h-full grid-cols-1 mx-auto'
              : 'h-full lg:h-full lg:w-full mx-auto grid-cols-1 lg:grid-cols-2',
            'grid gap-4 lg:gap-6 xl:gap-8 2xl:gap-12 justify-center items-center'
          )}
        >
          {tiles}
        </div>
      </div>
      <RightBookListSidebar 
        rightSlideOpen={rightSlideOpen} 
        setRightSlideOpen={setRightSlideOpen} 
        tileCount={tileCount}
        peerUserInfo={peerUserInfo}
        peerBookList={peerBookList}
        peerIsReadingBook={peerIsReadingBook}
      />
    </div>
  )
}

export default VideoGrid
