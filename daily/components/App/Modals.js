import React from 'react'
import DeviceSelectModal from '../DeviceSelectModal/DeviceSelectModal'
import { useUIState } from '../../contexts/UIStateProvider'

export const Modals = () => {
  const { modals } = useUIState()

  return (
    <>
      <DeviceSelectModal />
      {modals.map((ModalComponent) => (
        <ModalComponent key={ModalComponent.name} />
      ))}
    </>
  )
}

export default Modals
