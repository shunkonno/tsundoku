import React from 'react'
import Modal from '../Modal'
import { useUIState } from '../../contexts/UIStateProvider'
import Button from '../Button'
import DeviceSelect from '../DeviceSelect'

export const DEVICE_MODAL = 'device'

export const DeviceSelectModal = () => {
  const { currentModals, closeModal } = useUIState()

  return (
    <Modal
      title="マイク・スピーカー設定"
      isOpen={currentModals[DEVICE_MODAL]}
      onClose={() => closeModal(DEVICE_MODAL)}
      actions={[
        <Button key="close" fullWidth variant="outline">
          キャンセル
        </Button>,
        <Button key="update" fullWidth>
          更新
        </Button>
      ]}
    >
      <DeviceSelect />
    </Modal>
  )
}

export default DeviceSelectModal
