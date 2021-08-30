// ============================================================
// Imports
// ============================================================
import { Fragment, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import useSWR from 'swr'
import moment from 'moment'

// Components
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { Listbox, Transition } from '@headlessui/react'

//Assets
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'

// Functions
import uselocalesFilter from '../utils/translate'
import { useAuth } from '../lib/auth'
import fetcher from '../utils/fetcher'
import { addSession } from '../lib/db'

// ============================================================
// datetime data
// ============================================================
const yearData = [
  '2021',
  '2022'
]

const monthData = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
]
const dayData = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
]

const timeData = [
  '0:00',
  '0:15',
  '0:30',
  '0:45',
  '1:00',
  '1:15',
  '1:30',
  '1:45',
  '2:00',
  '2:15',
  '2:30',
  '2:45',
  '3:00',
  '3:15',
  '3:30',
  '3:45',
]

// ============================================================
// Helper Functions
// ============================================================
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Dashboard() {
  // ============================================================
  // Initialize
  // ============================================================

  //State
  const [year, setYear] = useState('2021')
  const [month, setMonth] = useState(monthData[3])
  const [day, setDay] = useState(dayData[3])
  const [startTime, setStartTime] = useState(timeData[4])
  const [endTime, setEndTime] = useState(timeData[8])

  // Auth
  const auth = useAuth()
  const user = auth.user

  // Fetch logged user info on client side
  const { data: userInfo } = useSWR(
    user ? ['/api/user', user.token] : null,
    fetcher,
    {
      onErrorRetry: ({ retryCount }) => {
        // Retry up to 10 times
        if (retryCount >= 10) return
      }
    }
  )

  // Routing
  const router = useRouter()

  useEffect(() => {
    if (user === false) {
      // If the access isn't authenticated, redirect to index page
      router.push('/')
    }
  })

  // Set locale
  const { locale } = useRouter()
  const t = uselocalesFilter('newRoom', locale)

  // ============================================================
  // Button Handler
  // ============================================================

  const createSession = async (e) => {
    e.preventDefault()

    const hoursAndMinutes = startTime.split(':')
    const hours = hoursAndMinutes[0]
    const minutes = hoursAndMinutes[1]

    const dateTime = moment({years: year, months: month, days: day, hours: hours, minutes: minutes, seconds: 0}).toISOString()

    console.log(dateTime)

    const url = 'https://api.daily.co/v1/rooms'

    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_DAILY_API_KEY
      }
    }

    fetch(url, options)
      .then((res) => res.json())
      .then((sessionInfo) => {
        addSession(sessionInfo.name, {
          sessionId: sessionInfo.name,
          ownerId: user.uid
        })
        console.log(sessionInfo)
      })
      .catch((err) => console.error('error:' + err))
  }

  // ============================================================
  // Return Page
  // ============================================================
  if (user === null || !userInfo) {
    return <div>Waiting..</div>
  }

  return (
    <div>
      <Head>
        <title>Create New Room</title>
        <meta
          name="description"
          content="一緒に読書してくれる誰かを探すためのマッチングサービス"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      {/* main content */}
      <div className="relative pb-16 bg-gray-50">
        <div className="sm:block sm:w-full" aria-hidden="true">
          <main className="py-12 mx-auto max-w-7xl px-4 sm:mt-24">
            <h1 className="text-xl font-bold py-3">
              新しいルームを作成する
            </h1>
            <div className="py-3">
              <label className="text-sm font-medium text-gray-700">実施日</label>
              <div className="grid grid-cols-2">
                {/* 月 */}
                <Listbox value={month} onChange={setMonth}>
                  {({ open }) => (
                    <div className="flex">
                      <div className="mt-1 relative w-3/4">
                        <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                          <span className="block truncate">{month}</span>
                          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </span>
                        </Listbox.Button>

                        <Transition
                          show={open}
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                            {monthData.map((monthName) => (
                              <Listbox.Option
                                key={monthName}
                                className={({ active }) =>
                                  classNames(
                                    active ? 'text-white bg-indigo-600' : 'text-gray-900',
                                    'cursor-default select-none relative py-2 pl-8 pr-4'
                                  )
                                }
                                value={monthName}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                      {monthName}
                                    </span>

                                    {selected ? (
                                      <span
                                        className={classNames(
                                          active ? 'text-white' : 'text-indigo-600',
                                          'absolute inset-y-0 left-0 flex items-center pl-1.5'
                                        )}
                                      >
                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                        
                      </div>
                      <div className="flex justify-center items-center w-1/4">
                        <Listbox.Label className="text-base font-medium text-gray-700">月</Listbox.Label>
                      </div>
                    </div>
                  )}
                </Listbox>
                {/* 月 END */}

                {/* 日 */}
                <Listbox value={day} onChange={setDay}>
                  {({ open }) => (
                    <div className="flex">
                      <div className="mt-1 relative w-3/4">
                        <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                          <span className="block truncate">{day}</span>
                          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </span>
                        </Listbox.Button>

                        <Transition
                          show={open}
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                            {dayData.map((dayName) => (
                              <Listbox.Option
                                key={dayName}
                                className={({ active }) =>
                                  classNames(
                                    active ? 'text-white bg-indigo-600' : 'text-gray-900',
                                    'cursor-default select-none relative py-2 pl-8 pr-4'
                                  )
                                }
                                value={dayName}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                      {dayName}
                                    </span>

                                    {selected ? (
                                      <span
                                        className={classNames(
                                          active ? 'text-white' : 'text-indigo-600',
                                          'absolute inset-y-0 left-0 flex items-center pl-1.5'
                                        )}
                                      >
                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                      <div className="flex justify-center items-center w-1/4">
                        <Listbox.Label className="text-base font-medium text-gray-700">日</Listbox.Label>
                      </div>
                    </div>
                  )}
                </Listbox>
                {/* 日 END */}
              </div>
            </div>
          {/* 開始時刻 */}
          <Listbox value={startTime} onChange={setStartTime}>
            {({ open }) => (
              <div className="py-3">
                <Listbox.Label className="block text-sm font-medium text-gray-700">開始時刻</Listbox.Label>
                <div className="mt-1 relative">
                  <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <span className="block truncate">{startTime}</span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </Listbox.Button>

                  <Transition
                    show={open}
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {timeData.map((selectStartTime) => (
                        <Listbox.Option
                          key={selectStartTime}
                          className={({ active }) =>
                            classNames(
                              active ? 'text-white bg-indigo-600' : 'text-gray-900',
                              'cursor-default select-none relative py-2 pl-8 pr-4'
                            )
                          }
                          value={selectStartTime}
                        >
                          {({ selected, active }) => (
                            <>
                              <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                {selectStartTime}
                              </span>

                              {selected ? (
                                <span
                                  className={classNames(
                                    active ? 'text-white' : 'text-indigo-600',
                                    'absolute inset-y-0 left-0 flex items-center pl-1.5'
                                  )}
                                >
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </div>
            )}
          </Listbox>
          {/* 開始時刻 END */}

          {/* 終了時刻 */}
          <Listbox value={endTime} onChange={setEndTime}>
            {({ open }) => (
              <div className="py-3">
                <Listbox.Label className="block text-sm font-medium text-gray-700">終了時刻(予定)</Listbox.Label>
                <div className="mt-1 relative">
                  <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <span className="block truncate">{endTime}</span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </Listbox.Button>

                  <Transition
                    show={open}
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {timeData.map((selectEndTime) => (
                        <Listbox.Option
                          key={selectEndTime}
                          className={({ active }) =>
                            classNames(
                              active ? 'text-white bg-indigo-600' : 'text-gray-900',
                              'cursor-default select-none relative py-2 pl-8 pr-4'
                            )
                          }
                          value={selectEndTime}
                        >
                          {({ selected, active }) => (
                            <>
                              <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                {selectEndTime}
                              </span>

                              {selected ? (
                                <span
                                  className={classNames(
                                    active ? 'text-white' : 'text-indigo-600',
                                    'absolute inset-y-0 left-0 flex items-center pl-1.5'
                                  )}
                                >
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </div>
            )}
          </Listbox>
          {/* 終了時刻 END */}

          {/* 作成ボタン */}
          <div className="py-6">
              <div className="flex justify-end">
                <p
                  type="button"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-tsundoku-blue-main hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tsundoku-blue-main"
                  onClick={(e) => createSession(e)}
                >
                  作成
                </p>
              </div>
            </div>

          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}
