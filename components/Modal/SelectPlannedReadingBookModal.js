import { Fragment, useRef } from 'react'

// Vercel
import { useSWRConfig } from 'swr'
import Image from 'next/image'
import Link from 'next/link'

// Assets
import { SearchIcon, XIcon } from '@heroicons/react/outline'
import 'react-day-picker/lib/style.css'

// Components

// Context
import { Dialog, Transition } from '@headlessui/react'
import { useUserInfo } from '../../context/useUserInfo'
import { useUserBookList } from '../../context/useUserBookList'

// Functions
import { updateSession } from '../../lib/db'

const SelectPlannedReadingBookModal = ({modalOpen, setModalOpen, setOwnerReadBook, sessionId}) => {

  // State
  let closeModalButtonRef = useRef(null)

  // Mutate
  const { mutate } = useSWRConfig()

  // ユーザー情報をfetch
  const { userInfo, error } = useUserInfo()

  const bookList = useUserBookList(userInfo?.uid)


  // Button Handler
  const handleOwnerReadBook = async(e, bid) => {
    e.preventDefault()

    if(sessionId){
      // sessionIdが渡されていれば、そのsessionのownerReadBookIdを更新する
      console.log('runed')

      await updateSession(sessionId, {
        ownerReadBookId: bid,
      })

      // 画面をリフレッシュ
      await mutate('/api/book/' + bid)
    }
    let readBook = {}
  
    readBook = bookList?.filter((book) => {
      return book.bookInfo.bid === bid
    })
    if(readBook){
      await setOwnerReadBook(readBook[0].bookInfo)
    }

    await setModalOpen(false)
  }

  return(
    <Transition show={modalOpen} as={Fragment}>
      <Dialog
        as="div"
        initialFocus={closeModalButtonRef}
        className="overflow-y-scroll fixed inset-0 z-10"
        onClose={() => setModalOpen(false)}
      >
        <div className="sm:px-4 min-h-screen text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-400 bg-opacity-50 transition-opacity" />
          </Transition.Child>

          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            
            <div className="inline-block relative p-6 w-full overflow-y-hidden max-w-4xl h-80v text-left align-middle bg-white rounded-2xl shadow-xl transition-all transform">
              <div className="flex-shrink-0">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-lg">
                    ブックリストから選ぶ
                  </div>
                  <button
                    ref={closeModalButtonRef}
                    onClick={() => setModalOpen(false)}
                  >
                    <XIcon
                      className="w-8 h-8 text-gray-500 hover:text-gray-600"
                    />
                  </button>
                </div>
                {/* <div className="flex flex-col flex-1 justify-center h-4/5">
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-medium leading-6 text-gray-900"
                    >
                      タイトル・著者名で検索
                    </Dialog.Title>
                    <div className=" mt-2">

                      <div className="relative mt-1 rounded-md shadow-sm">
                        <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                          <SearchIcon
                            className="w-5 h-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </div>
                        <input
                          type="text"
                          className="block pl-10 w-full sm:text-sm rounded-md border-gray-300 focus:ring-tsundoku-blue-main focus:border-tsundoku-blue-main"
                          placeholder="ここに入力"
                          onInput={(input) =>
                            input.target.value.length > 1
                              ? searchBooksDebounced(input.target.value)
                              : null
                          }
                        />
                      </div>

                    </div>
                  </div>
                </div> */}
              </div>
              <div className="overflow-y-auto flex-1 h-full">
                <div className="flow-root mt-6">
                  {bookList?.length > 0 ?
                    <ul role="list" className="divide-y divide-gray-200">
                      {bookList?.map(({bookInfo}) => (
                        <li className="py-4" key={bookInfo.bid}>
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <Image
                                className="w-12 h-16"
                                width={90}
                                height={120}
                                src={
                                  bookInfo.image
                                    ? bookInfo.image
                                    : '/img/placeholder/noimage_480x640.jpg'
                                }
                                alt={bookInfo.title}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {bookInfo.title}
                              </p>
                            </div>
                            <div>
                              <button
                                value={bookInfo.bid}
                                className="inline-flex items-center py-1 px-3 text-base font-medium leading-5 text-blue-600 hover:text-white bg-white hover:bg-blue-500 rounded-full border border-blue-600 hover:border-blue-500 shadow-sm"
                                onClick={(e) => handleOwnerReadBook(e, bookInfo.bid)}
                              >
                                選択
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  :
                  <div className="flex justify-center items-center w-full">
                    <div>
                      <p className="text-center text-gray-500">ブックリストに本がありません。</p>
                      <Link href='/booklist'>
                      <a 
                        className="inline-block text-center text-blue-500 mt-2 text-sm"
                      >
                          『ブックリスト』から本を追加する
                      </a>
                      </Link>
                    </div>
                  </div>
                  }
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

export default SelectPlannedReadingBookModal