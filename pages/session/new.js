// ============================================================
// Imports
// ============================================================
import { Fragment, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import moment from 'moment'
import DayPicker from 'react-day-picker'

// Components
import { SEO } from '../../components/Meta'
import { AppHeader } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { Listbox, Transition } from '@headlessui/react'

// Context
import { useAlertState } from '../../context/AlertProvider'

//Assets
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'
import 'react-day-picker/lib/style.css'

// Functions
import uselocalesFilter from '../../utils/translate'
import { useAuth } from '../../lib/auth'
import fetcher from '../../utils/fetcher'
import { addSession } from '../../lib/db'
import { formatISOStringToTime } from '../../utils/formatDateTime'

// ============================================================
// Constants
// ============================================================
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
  '4:00',
  '4:15',
  '4:30',
  '4:45',
  '5:00',
  '5:15',
  '5:30',
  '5:45',
  '6:00',
  '6:15',
  '6:30',
  '6:45',
  '7:00',
  '7:15',
  '7:30',
  '7:45',
  '8:00',
  '8:15',
  '8:30',
  '8:45',
  '9:00',
  '9:15',
  '9:30',
  '9:45',
  '10:00',
  '10:15',
  '10:30',
  '10:45',
  '11:00',
  '11:15',
  '11:30',
  '11:45',
  '12:00',
  '12:15',
  '12:30',
  '12:45',
  '13:00',
  '13:15',
  '13:30',
  '13:45',
  '14:00',
  '14:15',
  '14:30',
  '14:45',
  '15:00',
  '15:15',
  '15:30',
  '15:45',
  '16:00',
  '16:15',
  '16:30',
  '16:45',
  '17:00',
  '17:15',
  '17:30',
  '17:45',
  '18:00',
  '18:15',
  '18:30',
  '18:45',
  '19:00',
  '19:15',
  '19:30',
  '19:45',
  '20:00',
  '20:15',
  '20:30',
  '20:45',
  '21:00',
  '21:15',
  '21:30',
  '21:45',
  '22:00',
  '22:15',
  '22:30',
  '22:45',
  '23:00',
  '23:15',
  '23:30',
  '23:45'
]

const durationData = [30, 45, 60, 90]

export default function NewSession() {
  // ============================================================
  // Helper Functions
  // ============================================================
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }

  // ============================================================
  // State
  // ============================================================

  const [selectedDay, setSelectedDay] = useState(new Date())
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [duration, setDuration] = useState(durationData[2])
  const [ownerReadBookId, setOwnerReadBookId] = useState('')

  // ============================================================
  // Context
  // ============================================================
  const { setAlertAssort } = useAlertState()

  // ============================================================
  // Auth
  // ============================================================

  const auth = useAuth()
  const user = auth.user

  // ============================================================
  // Fetch Data
  // ============================================================

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

  // ============================================================
  // Routing
  // ============================================================

  const router = useRouter()

  useEffect(() => {
    if (user === false) {
      // If the access isn't authenticated, redirect to index page
      router.push('/')
    }
  })

  // Set locale
  const { locale } = useRouter()
  const t = uselocalesFilter('sessionNew', locale)

  // ============================================================
  // Manage DateTime Form
  // ============================================================

  useEffect(()=> {
    // デフォルトの開始時刻を設定する
    const now = new Date()

    //現在の時刻から分数を切り上げ(2:37なら3:00)して、デフォルトの値としてセット
    const hourNumber = Number(moment(now).format('H')) + 1
    const hour = hourNumber.toString()

    const defaultTime = `${hour}:00`

    setStartTime(defaultTime)
  },[setStartTime])

  useEffect(() => {
    // フォームで選択された日付を state にセット
    const dt = moment(selectedDay.toDateString(), 'ddd MMM DD YYYY')

    const Y = dt.year()
    const M = dt.month() + 1
    const D = dt.date()

    setSelectedYear(Y)
    setSelectedMonth(M)
    setSelectedDate(D)
  }, [selectedDay])

  // ============================================================
  // React-Day-Picker Settings
  // ============================================================

  const WEEKDAYS_SHORT = {
    ja: ['日', '月', '火', '水', '木', '金', '土']
  }

  const WEEKDAYS_LONG = {
    ja: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']
  }
  const MONTHS = {
    ja: [
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
      '9月',
      '10月',
      '11月',
      '12月'
    ]
  }

  const LABELS = {
    ja: { nextMonth: '来月', previousMonth: '先月' }
  }

  // ============================================================
  // Helper Function
  // ============================================================
  // HH:mm を ISOStringに変換する。(addtionalMinitesがあったら、その分数を追加して変換する)
  const formatTimeToISOString = useCallback((time, additionalMinutes) => {
    // Get hour and minute values from form input
    const hourAndMinute = time.split(':')
    const hour = hourAndMinute[0]
    const minute = hourAndMinute[1]
    
    // NOTE: Months are 0 indexed, so input should be decreased by 1
    var momentObject =  moment({
      year: Number(selectedYear),
      month: Number(selectedMonth) - 1,
      day: Number(selectedDate),
      hour: Number(hour),
      minute: Number(minute)
    })

    var isoString

    if(additionalMinutes){
      isoString  = momentObject
                    .add(additionalMinutes, 'minutes')
                    .toISOString()
    }
    else{
      isoString = momentObject.toISOString()
    }

    return isoString
  },[selectedYear, selectedMonth, selectedDate])

  // This adds the duration to startDateTime, to calculate expected end
  useEffect(()=>{
    const calculateEndDateTime = () => {
      // startTime(HH:mm) をduration(分)を追加して、ISOStringに変換する。
      const endDateTimeISOString = formatTimeToISOString(startTime, duration)

      // ISOStringを、HH:mmに戻す
      const formatedEndTime = formatISOStringToTime(endDateTimeISOString)
  
      setEndTime(formatedEndTime)
    }

    calculateEndDateTime()
  },[startTime, duration, formatTimeToISOString])
  
  console.log(startTime)
  console.log(endTime)

  // ============================================================
  // Button Handlers
  // ============================================================

  const createSession = async (e) => {
    e.preventDefault()

    // Set startDateTime for session
    var startDateTime = formatTimeToISOString(startTime)

    // Set hideDateTime for session (startTime + duration)
    var endDateTime = formatTimeToISOString(startTime, duration)

    // Create Daily Room
    const url = 'https://api.daily.co/v1/rooms'

    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_DAILY_API_KEY
      }
    }

    await fetch(url, options)
      .then((res) => res.json())
      .then((sessionInfo) => {
        addSession(sessionInfo.name, {
          sessionId: sessionInfo.name,
          ownerId: user.uid,
          ownerName: userInfo.name,
          guestId: '',
          guestName: '',
          startDateTime,
          endDateTime,
          // ownerReadBookId: ownerReadBookId,
          duration
        })

        setAlertAssort('create')

        router.push({
          pathname: '/home'
        })
      })
      .catch((err) => console.error('error:' + err))
  }

  // ============================================================
  // Return
  // ============================================================
  if (user === null || !userInfo) {
    return <div>Waiting..</div>
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <SEO
        title={"Tsundoku | ルーム新規作成"} 
        description={"Tsundoku (積ん読・ツンドク) は他の誰かと読書する、ペア読書サービスです。集中した読書は自己研鑽だけでなく、リラックス効果もあります。"} 
      />

      <AppHeader />

      <div className="relative flex-1 pb-16 bg-gray-50">
        <div className="sm:block sm:w-full sm:h-full" aria-hidden="true">
          <main className="relative sm:py-4 px-4 mx-auto max-w-2xl">
            <div className="pb-2 mb-4">
              <h1 className="title-section">ルームを作成する</h1>
            </div>
            {/* 選択された日程 */}
            <div className="mt-8 bg-white border-2 border-blue-500 px-6 py-4 rounded-lg">
                <div>
                  <h2 className="subtitle-section">開催する日程</h2>
                </div>
                <div className="block sm:flex">
                  <div className="w-full sm:w-5/12">
                    <div  className="text-gray-500 text-sm mt-4">日付</div>
                    <div className="pl-4 text-xl mt-1">
                        {`${selectedYear}年 ${selectedMonth}月 ${selectedDate}日`}
                    </div>
                  </div>
                  <div className="w-full sm:w-4/12">
                    <div className="text-gray-500 text-sm mt-4">開催時間</div>
                    <div className="pl-4 text-xl mt-1">
                        {`${startTime} 〜 ${endTime}`}
                    </div>
                  </div>
                  <div className="w-full sm:w-3/12">
                    <div className="text-gray-500 text-sm mt-4">長さ</div>
                    <div className="pl-4 text-xl mt-1">
                        {`${duration}分間`}
                    </div>
                  </div>
                </div>
              </div>
              {/* 選択された日程 - END */}
            <div className="flex flex-row flex-wrap mt-8 sm:mt-8">
              <div className="w-full sm:w-1/2">
                {/* 日付選択 */}
                <DayPicker
                  selectedDays={selectedDay}
                  onDayClick={(e) => setSelectedDay(e)}
                  locale={locale}
                  months={MONTHS[locale]}
                  weekdaysLong={WEEKDAYS_LONG[locale]}
                  weekdaysShort={WEEKDAYS_SHORT[locale]}
                  labels={LABELS[locale]}
                  className="w-full bg-white rounded-md border"
                />
                {/* 日付選択 - END */}
              </div>
              <div className="sm:pl-8 w-full sm:w-1/2">
                {/* 開始時刻 */}
                <Listbox value={startTime} onChange={setStartTime}>
                  {({ open }) => (
                    <div className="pb-3 mt-8 sm:mt-0">
                      <Listbox.Label className="block text-sm font-bold text-gray-900">
                        開始時刻
                      </Listbox.Label>
                      <div className="relative mt-1">
                        <Listbox.Button className="relative py-2 pr-10 pl-3 w-full sm:text-sm text-left bg-white rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm cursor-default focus:outline-none">
                          <span className="block truncate">{startTime}</span>
                          <span className="flex absolute inset-y-0 right-0 items-center pr-2 pointer-events-none">
                            <SelectorIcon
                              className="w-5 h-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </span>
                        </Listbox.Button>

                        <Transition
                          show={open}
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="overflow-auto absolute z-10 py-1 mt-1 w-full max-h-60 text-base sm:text-sm bg-white rounded-md ring-1 ring-black ring-opacity-5 shadow-lg focus:outline-none">
                            {timeData.map((selectStartTime) => (
                              <Listbox.Option
                                key={selectStartTime}
                                className={({ active }) =>
                                  classNames(
                                    active
                                      ? 'text-white bg-blue-500'
                                      : 'text-gray-900',
                                    'cursor-default select-none relative py-2 pl-8 pr-4'
                                  )
                                }
                                value={selectStartTime}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span
                                      className={classNames(
                                        selected
                                          ? 'font-semibold'
                                          : 'font-normal',
                                        'block truncate'
                                      )}
                                    >
                                      {selectStartTime}
                                    </span>

                                    {selected ? (
                                      <span
                                        className={classNames(
                                          active
                                            ? 'text-white'
                                            : 'text-blue-500',
                                          'absolute inset-y-0 left-0 flex items-center pl-1.5'
                                        )}
                                      >
                                        <CheckIcon
                                          className="w-5 h-5"
                                          aria-hidden="true"
                                        />
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

                {/* 予定時間 */}
                <Listbox value={duration} onChange={setDuration}>
                  {({ open }) => (
                    <div className="py-3">
                      <Listbox.Label className="block text-sm font-bold text-gray-900">
                        所要時間
                      </Listbox.Label>
                      <div className="relative mt-1">
                        <Listbox.Button className="relative py-2 pr-10 pl-3 w-full sm:text-sm text-left bg-white rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm cursor-default focus:outline-none">
                          <span className="block truncate">{`${duration} 分`}</span>
                          <span className="flex absolute inset-y-0 right-0 items-center pr-2 pointer-events-none">
                            <SelectorIcon
                              className="w-5 h-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </span>
                        </Listbox.Button>

                        <Transition
                          show={open}
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="overflow-auto absolute z-10 py-1 mt-1 w-full max-h-60 text-base sm:text-sm bg-white rounded-md ring-1 ring-black ring-opacity-5 shadow-lg focus:outline-none">
                            {durationData.map((duration) => (
                              <Listbox.Option
                                key={duration}
                                className={({ active }) =>
                                  classNames(
                                    active
                                      ? 'text-white bg-blue-500'
                                      : 'text-gray-900',
                                    'cursor-default select-none relative py-2 pl-8 pr-4'
                                  )
                                }
                                value={duration}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span
                                      className={classNames(
                                        selected
                                          ? 'font-semibold'
                                          : 'font-normal',
                                        'block truncate'
                                      )}
                                    >
                                      {`${duration} 分`}
                                    </span>

                                    {selected ? (
                                      <span
                                        className={classNames(
                                          active
                                            ? 'text-white'
                                            : 'text-blue-500',
                                          'absolute inset-y-0 left-0 flex items-center pl-1.5'
                                        )}
                                      >
                                        <CheckIcon
                                          className="w-5 h-5"
                                          aria-hidden="true"
                                        />
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
                {/* 予定時間 - END */}
              </div>
            </div>
            <div>
              

              <div>
                
              </div>

              {/* 作成ボタン */}
              <div className="py-8">
                <div className="flex justify-end">
                  <span
                    type="button"
                    className="inline-flex items-center py-3 px-6 text-base font-medium text-white hover:bg-blue-600 rounded-md border border-transparent focus:ring-2 focus:ring-offset-2 shadow-sm cursor-pointer focus:outline-none bg-tsundoku-blue-main focus:ring-tsundoku-blue-main"
                    onClick={(e) => createSession(e)}
                  >
                    作成する
                  </span>
                </div>
              </div>
              {/* 作成ボタン - END */}
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}
