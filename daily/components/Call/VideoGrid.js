import React, { useState, useMemo, useEffect, useRef } from 'react'
import Tile from '../Tile'
import { WaveTile } from '../Tile'
import { DEFAULT_ASPECT_RATIO } from '../../constants'
import { useParticipants } from '../../contexts/ParticipantsProvider'
import { useDeepCompareMemo } from 'use-deep-compare'

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
export const VideoGrid = React.memo(
  () => {
    const containerRef = useRef()
    const { participants } = useParticipants()

    const aspectRatio = DEFAULT_ASPECT_RATIO
    // const tileCount = participants.length || 0
    const tileCount = 2

    console.log(tileCount)

    // Memoize our tile list to avoid unnecassary re-renders
    const tiles = useDeepCompareMemo(
      () =>
        participants.map((p) => (
          // <Tile
          //   participant={p}
          //   key={p.id}
          //   mirrored
          // />
          <>
          <WaveTile 
            participant={p}
            key={p.id}
            mirrored
          />
          <WaveTile 
            participant={p}
            key={p.id}
            mirrored
          />
          
          </>
        )),
      [participants]
    )

    if (!participants.length) {
      return null
    }

    return (
      <div className="main-area flex h-full items-center justify-center relative w-full" ref={containerRef}>
        <div className="left-sidebar hidden md:block flex-shrink-0 md:w-56 xl:w-64 2xl:w-72 bg-blue-500 h-full"></div>
        <div className={classNames(
          !(tileCount >= 2) ?
          ""
          :
          "",
          "tiles flex-1 h-full"
          )}
        >
          <div className={classNames(
          !(tileCount >= 2) ?
          "w-1/2 grid-cols-1 mx-auto"
          :
          "h-full lg:h-full lg:w-full mx-auto grid-cols-1 lg:grid-cols-2",
          "grid gap-4 justify-center items-center"
          )}>
            {tiles}
          </div>
        </div>
        <div className="right-sidebar hidden md:block flex-shrink-0 md:w-56 xl:w-64 2xl:w-72 bg-blue-500 h-full"></div>
      </div>
    )
  },
  () => true
)

export default VideoGrid
