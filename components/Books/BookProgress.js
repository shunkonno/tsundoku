import { Fragment } from 'react'

import { useSWRConfig } from 'swr'

// Component
import { Menu, Transition } from '@headlessui/react'
import { BookProgressIcon } from '../Icon'

//Assets
import { ExclamationIcon } from '@heroicons/react/outline'

// Function
import { useAuth } from '../../lib/auth'
import { 
  updateManualProgress
} from '../../lib/db'

export default function BookProgress ({bookInfo, totalReadTime, autoProgress, manualProgress}) {
  // Auth
  const auth = useAuth()
  const user = auth.user

  //Mutate
  const { mutate } = useSWRConfig()

  // ============================================================
  // Button Handler
  // ============================================================
  const selectManualProgress = async (e, bid, manualProgress) => {
    e.preventDefault()

    await updateManualProgress(user.uid, bid, manualProgress)

    mutate('/api/user/' + user.uid + '/booklist')
  }

  // ============================================================
  // Render Function
  // ============================================================
  const renderAutoProgress = (totalReadTime, pageCount) => {
    // 進捗割合 = 読書時間(totalReadTime) × 平均読書速度(400文字/分) ÷ 平均的な文字数(600文字/ページ) ÷ 当該書籍のページ数(pageCount)
    let progress
    if (pageCount != 0) {
      progress = (totalReadTime * 400) / 600 / pageCount
    }

    return (
      <div className="group">
        <div className="flex items-center space-x-1 text-xs text-left text-gray-500 group-hover:text-blue-400 rounded-lg">
          {pageCount == 0 && (
            <span className="flex relative w-2 h-2">
              <span className="absolute w-full h-full bg-yellow-300 rounded-full opacity-75 animate-ping"></span>
              <span className="w-2 h-2 bg-yellow-300 rounded-full"></span>
            </span>
          )}
          <span>読了度</span>
        </div>
        <div className="mt-1">
          <BookProgressIcon progress={progress} />
        </div>
      </div>
    )
  }

  const renderManualProgress = (manualProgess) => {
    return (
      <div className="group">
        <div className="text-xs text-left text-gray-500 group-hover:text-blue-400 rounded-lg">
          読了度(手動)
        </div>
        <div className="mt-1">
          <BookProgressIcon progress={manualProgess} />
        </div>
      </div>
    )
  }

  return(
    <Menu as="div" className="inline-block relative">
      <div>
        <Menu.Button className="">
          {/* autoProgress=true かつ pageCount が存在する場合、進捗表示を自動計算する */}
          {autoProgress &&
            bookInfo.pageCount &&
            renderAutoProgress(
              totalReadTime,
              bookInfo.pageCount
            )}

          {/* autoProgress=true かつ pageCount が存在しない場合 */}
          {autoProgress &&
            !bookInfo.pageCount &&
            renderAutoProgress(totalReadTime, 0)}

          {/* autoProgress=falseの場合、ユーザーが登録した進捗を表示する */}
          {!autoProgress &&
            renderManualProgress(manualProgress)}
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-20 w-56 bg-white rounded-md divide-y divide-gray-100 ring-1 ring-black ring-opacity-5 shadow-lg origin-top-right focus:outline-none">
          <div className="py-1 px-1">
            {autoProgress && bookInfo.pageCount && (
              <Menu.Item>
                <div className="flex flex-col items-center py-2 px-2 w-full text-sm text-right text-gray-900 rounded-md">
                  <p className="text-sm text-center text-gray-700">
                    この本は読了度が
                  </p>
                  <p className="text-sm text-center text-gray-700">
                    自動で管理されています。
                  </p>
                  <button
                    className="py-2 px-3 mt-3 rounded-lg border border-gray-400"
                    onClick={(e) => {
                      selectManualProgress(
                        e,
                        bookInfo.bid,
                        0
                      )
                    }}
                  >
                    手動で管理する
                  </button>
                </div>
              </Menu.Item>
            )}
            {autoProgress && !bookInfo.pageCount && (
              <Menu.Item>
                <div className="flex flex-col items-center py-2 px-2 w-full text-sm text-right text-gray-900 rounded-md">
                  <div className="flex">
                    <ExclamationIcon className="mr-0.5 w-6 h-6 text-yellow-500" />
                    <div>
                      <p className="text-sm leading-6 text-left text-gray-700">
                        この本は読了度を自動で
                      </p>
                      <p className="text-sm text-left text-gray-700">
                        計測できません。
                      </p>
                    </div>
                  </div>
                  <button
                    className="py-2 px-3 mt-3 rounded-lg border border-gray-400"
                    onClick={(e) => {
                      selectManualProgress(
                        e,
                        bookInfo.bid,
                        0
                      )
                    }}
                  >
                    手動で管理する
                  </button>
                </div>
              </Menu.Item>
            )}
            {!autoProgress && (
              <>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } group flex rounded-md text-gray-900 items-center w-full px-2 py-2 text-sm text-right`}
                      onClick={(e) => {
                        selectManualProgress(
                          e,
                          bookInfo.bid,
                          1
                        )
                      }}
                    >
                      <span
                        className="inline-block mr-2 w-5 h-5 rounded-full bg-tsundoku-blue-main"
                        aria-hidden="true"
                      />
                      完全に読んだ
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } group flex rounded-md text-gray-900 items-center w-full px-2 py-2 text-sm text-right`}
                      onClick={(e) => {
                        selectManualProgress(
                          e,
                          bookInfo.bid,
                          0.7
                        )
                      }}
                    >
                      <span
                        className="inline-block mr-2 w-5 h-5 bg-blue-400 rounded-full"
                        aria-hidden="true"
                      />
                      十分に読んだ
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } group flex rounded-md text-gray-900 items-center w-full px-2 py-2 text-sm text-right`}
                      onClick={(e) => {
                        selectManualProgress(
                          e,
                          bookInfo.bid,
                          0.4
                        )
                      }}
                    >
                      <span
                        className="inline-block mr-2 w-5 h-5 bg-blue-300 rounded-full"
                        aria-hidden="true"
                      />
                      まあまあ読んだ
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } group flex rounded-md text-gray-900 items-center w-full px-2 py-2 text-sm text-right`}
                      onClick={(e) => {
                        selectManualProgress(
                          e,
                          bookInfo.bid,
                          0.2
                        )
                      }}
                    >
                      <span
                        className="inline-block mr-2 w-5 h-5 bg-blue-100 rounded-full"
                        aria-hidden="true"
                      />
                      少しだけ読んだ
                    </button>
                  )}
                </Menu.Item>
              </>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}