
import { Fragment, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import debounce from 'lodash/debounce'

import { Dialog, Transition } from '@headlessui/react'

import { SearchIcon, XIcon } from '@heroicons/react/outline'

export default function Modal({modalOpen, setModalOpen, searchBooksDebounced, addBookToList, searchedBooks}) {

  const renderSearchedBooks = (books) => {
    return (
      <div className="flow-root mt-6">
        <ul role="list" className="-my-5 divide-y divide-gray-200">
          {books.map((book) => (
            <li className="py-4" key={book.bid}>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Image
                    className="w-12 h-16"
                    width={90}
                    height={120}
                    src={
                      book.image
                        ? book.image
                        : '/img/placeholder/noimage_480x640.jpg'
                    }
                    alt={book.title}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {book.title}
                  </p>
                </div>
                <div>
                  <button
                    value={book}
                    className="inline-flex items-center py-1 px-3 text-base font-medium leading-5 text-blue-600 hover:text-white bg-white hover:bg-blue-500 rounded-full border border-blue-600 hover:border-blue-500 shadow-sm"
                    onClick={(e) => {
                      addBookToList(e, book)
                      setModalOpen(false)
                    }}
                  >
                    追加
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <>
        <Transition appear show={modalOpen} as={Fragment}>
          <Dialog
            as="div"
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
                <div className="inline-block relative p-6 w-full max-w-4xl h-80v text-left align-middle bg-white rounded-2xl shadow-xl transition-all transform">
                  <div className="h-1/6">
                    <div className="flex justify-end h-1/5">
                      <XIcon
                        className="w-8 h-8 text-gray-500 hover:text-gray-600"
                        onClick={() => setModalOpen(false)}
                      />
                    </div>
                    <div className="flex flex-col justify-center h-4/5">
                      <div>
                        <Dialog.Title
                          as="h3"
                          className="text-xl font-medium leading-6 text-gray-900"
                        >
                          タイトル・著者名で検索
                        </Dialog.Title>
                        <div className=" mt-2">
                          {/* book search component -- START */}
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
                          {/* book search component -- END */}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-y-auto h-5/6">
                    {renderSearchedBooks(searchedBooks)}
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </>
  )
}
