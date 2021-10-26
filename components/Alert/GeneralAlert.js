
// ============================================================
// Import
// ============================================================
import { Fragment, useEffect } from 'react'

//Component
import { Transition } from '@headlessui/react'

//Assets
import {
  CheckCircleIcon,
  ExclamationIcon,
  XIcon,
} from '@heroicons/react/solid'

// Context
import { useAlertState } from '../../context/AlertProvider'

//Functions
import classNames from '../../utils/classNames'

export default function GeneralAlert() {

  //Context
  const { alertOpen, setAlertOpen, alertAssort, setAlertAssort } =
  useAlertState()

  // ============================================================
  // Alert Handlers
  // ============================================================
  useEffect(() => {
    if (alertAssort) {
      setAlertOpen(true)
      setTimeout(async () => {
        await setAlertOpen(false)
        await setAlertAssort('')
      }, 5000)
    } else {
      setAlertAssort('')
    }
  }, [alertAssort, setAlertAssort, setAlertOpen])

  const expectedFlag = (alertAssort == 'create' || alertAssort == 'reserve' || alertAssort == 'updateUserSetting' || alertAssort == 'updateBookList' || alertAssort == 'updateIsReading')
  const normalFlag = (alertAssort == 'cancel' || alertAssort == 'delete')
  const warningFlag = alertAssort == 'failed'

  const renderAlertSentence = (alertAssort) => {
    switch (alertAssort) {
      case 'create' :
        return 'ルームを作成しました。'

      case 'reserve' :
        return 'ルームの予約が完了しました。'

      case 'cancel' :
        return 'ルームの予約を取り消しました。'

      case 'delete' :
        return 'ルームを削除しました。'

      case 'failed' :
        return '選択したルームは満員のため予約できませんでした。申し訳ございません。'

      case 'updateUserSetting' :
        return 'ユーザー設定を保存しました。'

      case 'updateBookList' :
        return 'ブックリストに本を追加しました。'

      case 'updateIsReading' :
        return '『現在読んでいる本』を設定しました。'

      default:
        return
    }
    
  }

  return (
    <div className="flex fixed z-10 justify-center w-full">
      <Transition
        show={alertOpen}
        as={Fragment}
        enter="transition duration-75"
        enterFrom="transform -translate-y-1/4 opacity-0"
        enterTo="transform -translate-y-0 opacity-95"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-95"
        leaveTo="opacity-0"
      >
        <div className="absolute z-10 px-4 w-full sm:w-1/3">
          <div className="opacity-95">
            <div
              className={classNames(
                expectedFlag &&
                  'bg-green-50',
                normalFlag &&
                  'bg-gray-200',
                warningFlag &&
                  'bg-yellow-50 border-yellow-400 border-l-4',
                'rounded-b-md p-4'
              )}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  {
                    expectedFlag && (
                      <CheckCircleIcon
                        className="w-5 h-5 text-green-400"
                        aria-hidden="true"
                      />
                    )
                  }
                  {
                    normalFlag && (
                      <CheckCircleIcon
                        className="w-5 h-5 text-gray-400"
                        aria-hidden="true"
                      />
                    )
                  }
                  {
                    warningFlag && (
                      <ExclamationIcon
                        className="w-5 h-5 text-yellow-400"
                        aria-hidden="true"
                      />
                    )
                  }
                </div>
                <div className="ml-3">
                  <p
                    className={classNames(
                      expectedFlag &&
                        'text-green-800',
                      normalFlag &&
                        'text-gray-800',
                      warningFlag && 'text-yellow-800',
                      'text-sm font-medium'
                    )}
                  >
                    {renderAlertSentence(alertAssort)}
                  </p>
                </div>
                <div className="pl-3 ml-auto">
                  <div className="-my-1.5 -mx-1.5">
                    <button
                      type="button"
                      className={classNames(
                        expectedFlag &&
                          'bg-green-50  text-green-500 hover:bg-green-100 focus:ring-offset-green-50 focus:ring-green-600',
                        normalFlag &&
                          'bg-gray-200 text-gray-500 hover:bg-gray-100 focus:ring-offset-gray-50 focus:ring-gray-600',
                        warningFlag &&
                          'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-offset-green-50 focus:ring-yellow-600',
                        'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2'
                      )}
                      onClick={() => {
                        setAlertOpen(false)
                        setAlertAssort('')
                      }}
                    >
                      <span className="sr-only">Dismiss</span>
                      <XIcon className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  )
}
