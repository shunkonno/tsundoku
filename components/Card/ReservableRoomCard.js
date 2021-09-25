
//Component
import { Disclosure, Transition } from '@headlessui/react'

//Functions
import { formatISOStringToTime } from '../../utils/formatDateTime'

export default function ReservableRoomCard({reserveSession, sessionId, ownerName, guestId, startDateTime, endDateTime, duration}) {

  return (
    <Disclosure>
      {({ open }) => (
        <div className="w-full bg-white rounded-md border border-gray-400 divide-y divide-gray-200">
          <div className="flex items-center justify-between p-4 space-x-6">
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
                <span className="session-card-duration text-gray-500">
                  {`${duration} 分間 / 開催者：${ownerName}`}
                </span>
              </div>
            </div>
            {open ? (
              <Disclosure.Button className="">
                <p className="px-8 py-2 bg-gray-200 text-black rounded-md">
                  閉じる
                </p>
              </Disclosure.Button>
            ) : (
              <Disclosure.Button className="">
                <p className="text-white text-bold bg-blue-500 py-3 px-6 rounded-md">
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
                  <div className="-mt-px p-3 flex justify-end items-center divide-x divide-gray-200">
                    <div className="-ml-px flex items-center">
                      <p className="text-sm text-black mr-4">
                        このルームを予約しますか？
                      </p>
                      <div
                        className="cursor-pointer relative border border-transparent rounded-br-lg hover:text-gray-500"
                        onClick={() => reserveSession(sessionId, guestId)}
                      >
                        <span className="inline-block px-10 py-2 border border-transparent text-base text-center rounded-md text-white cursor-pointer bg-tsundoku-blue-main hover:bg-blue-700 focus:outline-none focus:ring-tsundoku-blue-main">
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