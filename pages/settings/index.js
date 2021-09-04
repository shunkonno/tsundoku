// ============================================================
// Import
// ============================================================
import { Fragment, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import useSWR from 'swr'

// Components
import { AppHeader } from '../../components/Header'
import { Footer } from '../../components/Footer'

// Assets
import { Transition, RadioGroup } from '@headlessui/react'
import { CheckCircleIcon, XIcon } from '@heroicons/react/solid'

// Functions
import { useAuth } from '../../lib/auth'
import uselocalesFilter from '../../utils/translate'
import { updateUser } from '../../lib/db'
import fetcher from '../../utils/fetcher'

// ============================================================
// Settings
// ============================================================
const genderSettings = [
  { label: 'Male', name: '男性' },
  { label: 'Female', name: '女性' },
  { label: 'Other', name: 'その他' },
  { label: 'No Answer', name: '回答しない' }
]

const genderOfMatchSettings = [{ name: '制限なし' }, { name: '女性のみ' }]

// ============================================================
// Helper Functions
// ============================================================
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function UserSettings() {
  // ============================================================
  // Initialize
  // ============================================================

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

  // InitialState
  const [userName, setUserName] = useState("")
  const [genderSelected, setGenderSelected] = useState()
  const [genderOfMatchSelected, setGenderOfMatchSelected] = useState(
    genderOfMatchSettings[0]
  )

  const [updateUserSettingsAlertOpen, setUpdateUserSettingsAlertOpen] = useState(false)

  useEffect(() => {
    if (user === false) {
      // If the access isn't authenticated, redirect to index page
      router.push('/')
    } else if (userInfo) {
      userInfo.name ?
      setUserName(userInfo.name)
      :
      setUserName("")

      setGenderSelected(userInfo?.gender)
    }
  },[userInfo])

  useEffect(() => {
    if (router.query.successUpdateUserSettings == 'true') {
      setUpdateUserSettingsAlertOpen(true)
      setTimeout(() => {
        setUpdateUserSettingsAlertOpen(false)
      }, 3000)
    } 
  }, [])

  // Translate
  const t = uselocalesFilter('userSettings', router.locale)

  // Handle form submit
  const handleSubmit = async(e) => {
    e.preventDefault()

    await updateUser(user.uid, {
      name: userName,
      gender: genderSelected
    })

    await router.push({
      pathname: '/empty',
    })
    await router.push({
      pathname: '/settings',
      query: { successUpdateUserSettings: true }
    })
  }

  // ============================================================
  // Return Page
  // ===========================================================
  return (
    <div>
      <Head>
        <title>Settings</title>
        <meta
          name="description"
          content="一緒に読書してくれる誰かを探すためのマッチングサービス"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppHeader />

      {/* main content */}
      <div className="pb-16 bg-gray-50 overflow-hidden">
      {
        /* Alert */
          <Transition
            show={updateUserSettingsAlertOpen}
            as={Fragment}
            enter="transition duration-75"
            enterFrom="transform -translate-y-1/4 opacity-0"
            enterTo="transform -translate-y-0 opacity-100"
            leave="transition-opacity duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute w-full px-4">
              <div className="mt-4 rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon
                      className="h-5 w-5 text-green-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      ユーザー設定を更新しました。
                    </p>
                  </div>
                  <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                      <button
                        type="button"
                        className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                        onClick={() => setUpdateUserSettingsAlertOpen(false)}
                      >
                        <span className="sr-only">Dismiss</span>
                        <XIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        }
        <div className="sm:block sm:h-full sm:w-full" aria-hidden="true">
          <main className="mt-16 mx-auto max-w-xl px-4 sm:mt-12">
            <div className="py-3">
              <h1 className="text-2xl font-bold">ユーザー設定</h1>
            </div>
            <div className="py-3">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                名前(ニックネーム)
              </label>
              <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      autoComplete="given-name"
                      value={userName}
                      className="p-3 shadow-sm block w-full sm:text-sm border border-gray-300 focus:ring-tsundoku-brown-main focus:border-tsundoku-brown-main rounded-md"
                      onChange={(e) => {
                        setUserName(e.target.value)
                      }}
                    />
                
              </div>
            </div>

            {/* 性別 */}
            <div className="py-3">
              <label
                htmlFor="Gender"
                className="block text-sm font-medium text-gray-700"
              >
                性別
              </label>
              <RadioGroup
                className="mt-1"
                value={genderSelected}
                onChange={setGenderSelected}
              >
                <RadioGroup.Label className="sr-only">
                  Gender setting
                </RadioGroup.Label>
                <div className="bg-white rounded-md -space-y-px">
                  {genderSettings.map((gender, genderSettingIdx) => (
                    <RadioGroup.Option
                      key={gender.name}
                      value={gender.label}
                      className={({ checked }) =>
                        classNames(
                          genderSettingIdx === 0
                            ? 'rounded-tl-md rounded-tr-md'
                            : '',
                          genderSettingIdx === genderSettings.length - 1
                            ? 'rounded-bl-md rounded-br-md'
                            : '',
                          checked
                            ? 'bg-tsundoku-brown-sub border-tsundoku-brown-main z-10'
                            : 'border-gray-200',
                          gender.label == genderSelected
                            ? 'bg-tsundoku-brown-sub border-tsundoku-brown-main z-10'
                            : 'border-gray-200',
                          'relative border p-4 flex cursor-pointer focus:outline-none'
                        )
                      }
                    >
                      {({ active, checked }) => (
                        <>
                          <span
                            className={classNames(
                              checked
                                ? 'bg-tsundoku-brown-main border-transparent'
                                : 'bg-white border-gray-300',
                              gender == genderSelected
                                ? 'bg-tsundoku-brown-main border-transparent'
                                : 'bg-white border-gray-300',
                              active ? '' : '',
                              'h-4 w-4 mt-0.5 cursor-pointer rounded-full border flex items-center justify-center'
                            )}
                            aria-hidden="true"
                          >
                            <span className="rounded-full bg-white w-1.5 h-1.5" />
                          </span>
                          <div className="ml-3 flex flex-col">
                            <RadioGroup.Label
                              as="span"
                              className={classNames(
                                checked ? 'text-orange-900' : 'text-gray-900',
                                gender == genderSelected ? 'text-orange-900' : 'text-gray-900',
                                'block text-sm font-medium'
                              )}
                            >
                              {gender.name}
                            </RadioGroup.Label>
                          </div>
                        </>
                      )}
                    </RadioGroup.Option>
                  ))}
                </div>
              </RadioGroup>
            </div>
            {/* 性別 END */}
            
            {/* <Transition
              show={genderSelected?.label == 'Female'}
              as={Fragment}
              enter="transition duration-300"
              enterFrom="transform -translate-y-1/4 opacity-0"
              enterTo="transform -translate-y-0 opacity-100"
              leave="transition duration-300"
              leaveFrom="transform -translate-y-0 opacity-100"
              leaveTo="transform -translate-y-1/4 opacity-0"
            >
              <div className="py-6">
                <label
                  htmlFor="Gender"
                  className="block text-sm font-medium text-gray-700"
                >
                  マッチング制限
                </label>
                <div className="py-3 text-sm">
                  <p>女性の方は、マッチングする対象を限定できます。</p>
                  <p className="text-gray-500">
                    (この設定はあとから変更できます。)
                  </p>
                </div>
                <RadioGroup
                  className="mt-1"
                  value={genderOfMatchSelected}
                  onChange={setGenderOfMatchSelected}
                >
                  <RadioGroup.Label className="sr-only">
                    Gender setting
                  </RadioGroup.Label>
                  <div className="bg-white rounded-md -space-y-px">
                    {genderOfMatchSettings.map(
                      (gender, genderOfMatchSettingsIdx) => (
                        <RadioGroup.Option
                          key={gender.name}
                          value={gender}
                          className={({ checked }) =>
                            classNames(
                              genderOfMatchSettingsIdx === 0
                                ? 'rounded-tl-md rounded-tr-md'
                                : '',
                              genderOfMatchSettingsIdx ===
                                genderOfMatchSettings.length - 1
                                ? 'rounded-bl-md rounded-br-md'
                                : '',
                              checked
                                ? 'bg-tsundoku-brown-sub border-tsundoku-brown-main z-10'
                                : 'border-gray-200',
                              'relative border p-4 flex cursor-pointer focus:outline-none'
                            )
                          }
                        >
                          {({ active, checked }) => (
                            <>
                              <span
                                className={classNames(
                                  checked
                                    ? 'bg-tsundoku-brown-main border-transparent'
                                    : 'bg-white border-gray-300',
                                  active ? '' : '',
                                  'h-4 w-4 mt-0.5 cursor-pointer rounded-full border flex items-center justify-center'
                                )}
                                aria-hidden="true"
                              >
                                <span className="rounded-full bg-white w-1.5 h-1.5" />
                              </span>
                              <div className="ml-3 flex flex-col">
                                <RadioGroup.Label
                                  as="span"
                                  className={classNames(
                                    checked
                                      ? 'text-orange-900'
                                      : 'text-gray-900',
                                    'block text-sm font-medium'
                                  )}
                                >
                                  {gender.name}
                                </RadioGroup.Label>
                              </div>
                            </>
                          )}
                        </RadioGroup.Option>
                      )
                    )}
                  </div>
                </RadioGroup>
              </div>
            </Transition> */}

            <div className="py-6">
              <div className="flex justify-end">
                <p
                  type="button"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-tsundoku-blue-main hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tsundoku-blue-main"
                  onClick={(e) => handleSubmit(e)}
                >
                  保存
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
      {/* END main content */}

      <Footer />
    </div>
  )
}
