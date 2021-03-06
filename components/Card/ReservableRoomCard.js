
// Vercel
import { useSWRConfig } from 'swr'

//Component
import { Disclosure, Transition } from '@headlessui/react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

// Context
import { useAlertState } from '../../context/AlertProvider'
import { useUserInfo } from '../../context/useUserInfo'

//Functions
import { updateSession } from '../../lib/db'
import { formatISOStringToTime } from '../../utils/formatDateTime'

export default function ReservableRoomCard({sessionId, ownerName, guestId, startDateTime, endDateTime, duration, loading}) {

  // Context
  const { setAlertAssort } = useAlertState()

  // Mutate
  const { mutate } = useSWRConfig()

  // ユーザー情報
  const { userInfo, error } = useUserInfo()

  // セッション予約ボタン
  const reserveSession = async (sessionId, guestId) => {
    if (guestId) {
      // guestId がすでに設定されている場合、予約することができない

      // アラートの設定
      await setAlertAssort('failed')
    } else {
      // guestId 未設定であれば、当ユーザーをIDを設定する

      // セッション情報の更新
      await updateSession(sessionId, {
        guestId: userInfo.uid,
        guestName: userInfo.name
      })

      // 画面をリフレッシュ
      mutate('/api/session')

      // アラートの設定
      await setAlertAssort('reserve')
    }
  }

  if(loading) {
    return(
      <div className="w-full">
          <div className="p-4">
              <h3 className="session-card-date">
                <Skeleton width={140} />
              </h3>
              <div className="mt-1">
                <Skeleton />
              </div>
          </div>
        </div>
    )
  }

  return (
    <Disclosure>
      {({ open }) => (
        <div className="w-full bg-white rounded-md border border-gray-400 divide-y divide-gray-200">
          <div className="flex justify-between items-center p-4 space-x-6">
            <div className="flex-1 truncate">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <h3 className="session-card-date">
                    {formatISOStringToTime(
                      startDateTime
                    )}
                    &nbsp;〜&nbsp;
                    {formatISOStringToTime(
                      endDateTime
                    )}
                  </h3>
                </div>
              </div>
              <div className="mt-1">
                <span className="text-gray-500 session-card-duration">
                  {`${duration} 分間 / 開催者：${ownerName}`}
                </span>
              </div>
            </div>
            {open ? (
              <Disclosure.Button className="">
                <p className="py-2 px-8 text-black bg-gray-200 rounded-md">
                  閉じる
                </p>
              </Disclosure.Button>
            ) : (
              <Disclosure.Button className="">
                <p className="py-3 px-6 text-white bg-blue-500 rounded-md">
                  予約する
                </p>
              </Disclosure.Button>
            )}
          </div>
          {open && (
            <div>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel>
                  <div className="flex justify-end items-center p-3 -mt-px divide-x divide-gray-200">
                    <div className="flex items-center -ml-px">
                      <p className="mr-4 text-sm text-black">
                        このルームを予約しますか？
                      </p>
                      <div
                        className="relative hover:text-gray-500 rounded-br-lg border border-transparent cursor-pointer"
                        onClick={() => reserveSession(sessionId, guestId)}
                      >
                        <span className="inline-block py-2 px-10 text-base text-center text-white hover:bg-blue-700 rounded-md border border-transparent cursor-pointer focus:outline-none bg-tsundoku-blue-main focus:ring-tsundoku-blue-main">
                          確定
                        </span>
                      </div>
                    </div>
                  </div>
                </Disclosure.Panel>
              </Transition>
            </div>
          )}
        </div>
      )}
      </Disclosure>
  )
}