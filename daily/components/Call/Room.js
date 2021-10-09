import React from 'react'
import VideoContainer from '../VideoContainer/VideoContainer'

import { Container } from './Container'
import { Header } from './Header'
import { VideoGrid } from './VideoGrid'

export function Room() {
  return (
    <Container>
      <Header />
      <VideoContainer>
        <VideoGrid />
      </VideoContainer>
    </Container>
  )
}

export default Room
