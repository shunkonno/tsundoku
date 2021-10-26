// Basic
import { Fragment } from 'react'

// Vercel
import { useSWRConfig } from 'swr'

// Component
import { Menu, Transition } from '@headlessui/react'

// Assets
import {
  BookOpenIcon,
  XCircleIcon,
  TrashIcon,
  ChartSquareBarIcon,
  ClipboardListIcon,
  DotsVerticalIcon,
} from '@heroicons/react/outline'

// Context
import { useUserInfo } from '../../context/useUserInfo'

// Function
import { useAuth } from '../../lib/auth'
import { 
  updateIsReading,
  removeItemFromBookList,
  updateManualProgress,
  turnOnAutoProgress
} from '../../lib/db'
import { selectReadingBook } from '../../utils/bookFunctions/selectReadingBook'
import classNames from '../../utils/classNames'

export default function BookMenu({bookInfo, autoProgress}){
  
  // Auth
  const auth = useAuth()
  const user = auth.user

  // SWR
  const { mutate } = useSWRConfig()

  // User
  const { userInfo, error } =  useUserInfo() 


  // ============================================================
  // Button Handler
  // ============================================================

  const removeBookFromList = async (e, bid) => {
    e.preventDefault()

    //削除する本がisReadingだったら現在読んでいる本を空にする
    if (bid == userInfo.isReading) {
      await updateIsReading(user.uid, '')
      mutate(['/api/user', user.token])
    }

    // 特定の bid の書籍をリストから削除
    await removeItemFromBookList(user.uid, bid)

    // 画面をリフレッシュ
    mutate('/api/user/' + user.uid + '/booklist')
  }

  const selectManualProgress = async (e, bid, manualProgress) => {
    e.preventDefault()

    await updateManualProgress(user.uid, bid, manualProgress)

    mutate('/api/user/' + user.uid + '/booklist')
  }

  const selectAutoProgress = async (e, bid) => {
    e.preventDefault()

    await turnOnAutoProgress(user.uid, bid)

    mutate('/api/user/' + user.uid + '/booklist')
  }
  // ============================================================
  // Return Component
  // ============================================================
  return(
    <Menu as="div" className="inline-block relative">
      <div>
        <Menu.Button className="inline-flex">
          <DotsVerticalIcon className="p-1 w-8 h-8 text-gray-500 hover:bg-gray-100 rounded-full" />
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
        <Menu.Items
          className={classNames(
            bookInfo.bid == userInfo.isReading
              ? 'w-72'
              : 'w-64',
            'absolute right-0 z-20  bg-white rounded-md divide-y divide-gray-100 ring-1 ring-black ring-opacity-5 shadow-lg origin-top-right focus:outline-none'
          )}
        >
          <div className="py-1 px-1">
            {!(bookInfo.bid == userInfo.isReading) ? (
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } group flex rounded-md text-gray-900 items-center w-full px-2 py-2 text-sm text-right`}
                    onClick={(e) =>
                      selectReadingBook(
                        e,
                        user,
                        bookInfo.bid,
                        mutate
                      )
                    }
                  >
                    <BookOpenIcon
                      className="mr-2 w-5 h-5 text-gray-900"
                      aria-hidden="true"
                    />
                    『いま読んでいる本』にする
                  </button>
                )}
              </Menu.Item>
            ) : (
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } group flex rounded-md text-gray-900 items-center w-full px-2 py-2 text-sm text-right`}
                    onClick={(e) =>
                      selectReadingBook(
                        e,
                        user,
                        '',
                        mutate
                      )
                    }
                  >
                    <XCircleIcon
                      className="mr-2 w-5 h-5 text-gray-900"
                      aria-hidden="true"
                    />
                    『いま読んでいる本』から除外する
                  </button>
                )}
              </Menu.Item>
            )}
            {autoProgress && (
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
                        0
                      )
                    }}
                  >
                    <ClipboardListIcon
                      className="mr-2 w-5 h-5 text-gray-900"
                      aria-hidden="true"
                    />
                    『読了度』を手動で管理する
                  </button>
                )}
              </Menu.Item>
            )}
            {!autoProgress && bookInfo.pageCount && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } group flex rounded-md text-gray-900 items-center w-full px-2 py-2 text-sm text-right`}
                    onClick={(e) => {
                      selectAutoProgress(
                        e,
                        bookInfo.bid
                      )
                    }}
                  >
                    <ChartSquareBarIcon
                      className="mr-2 w-5 h-5 text-gray-900"
                      aria-hidden="true"
                    />
                    『読了度』を自動で管理する
                  </button>
                )}
              </Menu.Item>
            )}
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } group flex rounded-md text-red-500 items-center w-full px-2 py-2 text-sm text-right`}
                  onClick={(e) => {
                    removeBookFromList(
                      e,
                      bookInfo.bid
                    )
                  }}
                >
                  <TrashIcon
                    className="mr-2 w-5 h-5 text-red-500"
                    aria-hidden="true"
                  />
                  リストから削除
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}