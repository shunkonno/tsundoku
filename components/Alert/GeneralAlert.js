
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

//Functions
import classNames from '../../utils/classNames'


export default function GeneralAlert({ alertOpen, alertAssort, setAlertOpen, setAlertAssort}) {

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

  return (
    <div className="flex relative justify-center w-full">
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
                (alertAssort == 'create' || alertAssort == 'reserve' || alertAssort == 'updateUserSetting') &&
                  'bg-green-50',
                (alertAssort == 'cancel' || alertAssort == 'delete') &&
                  'bg-gray-200',
                alertAssort == 'failed' &&
                  'bg-yellow-50 border-yellow-400 border-l-4',
                'rounded-b-md p-4'
              )}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  {
                    ((alertAssort == 'create' || alertAssort == 'reserve' || alertAssort == 'updateUserSetting') && (
                      <CheckCircleIcon
                        className="w-5 h-5 text-green-400"
                        aria-hidden="true"
                      />
                    ),
                    (alertAssort == 'cancel' || alertAssort == 'delete') && (
                      <CheckCircleIcon
                        className="w-5 h-5 text-gray-400"
                        aria-hidden="true"
                      />
                    ),
                    alertAssort == 'failed' && (
                      <ExclamationIcon
                        className="w-5 h-5 text-yellow-400"
                        aria-hidden="true"
                      />
                    ))
                  }
                </div>
                <div className="ml-3">
                  <p
                    className={classNames(
                      (alertAssort == 'create' || alertAssort == 'reserve' || alertAssort == 'updateUserSetting') &&
                        'text-green-800',
                      (alertAssort == 'cancel' || alertAssort == 'delete') &&
                        'text-gray-800',
                      alertAssort == 'failed' && 'text-yellow-800',
                      'text-sm font-medium'
                    )}
                  >
                    {alertAssort == 'create' && 'ルームを作成しました。'}
                    {alertAssort == 'reserve' && 'ルームの予約が完了しました。'}
                    {alertAssort == 'cancel' &&
                      'ルームの予約を取り消しました。'}
                    {alertAssort == 'delete' && 'ルームを削除しました。'}
                    {alertAssort == 'failed' &&
                      '選択したルームは満員のため予約できませんでした。申し訳ございません。'}
                    {alertAssort == 'updateUserSetting' && 'ユーザー設定を保存しました。'}
                  </p>
                </div>
                <div className="pl-3 ml-auto">
                  <div className="-my-1.5 -mx-1.5">
                    <button
                      type="button"
                      className={classNames(
                        (alertAssort == 'create' || alertAssort == 'reserve' || alertAssort == 'updateUserSetting') &&
                          'bg-green-50  text-green-500 hover:bg-green-100 focus:ring-offset-green-50 focus:ring-green-600',
                        (alertAssort == 'cancel' || alertAssort == 'delete') &&
                          'bg-gray-200 text-gray-500 hover:bg-gray-100 focus:ring-offset-gray-50 focus:ring-gray-600',
                        alertAssort == 'failed' &&
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
