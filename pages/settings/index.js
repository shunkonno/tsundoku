// ============================================================
// Import
// ============================================================
import { Fragment, useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import useSWR, { useSWRConfig } from 'swr'

// Assets
import { RadioGroup } from '@headlessui/react'

// Components
import { AppHeader } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { GeneralAlert } from '../../components/Alert'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

//Context
import { useAlertState } from '../../context/AlertProvider'

// Functions
import { useAuth } from '../../lib/auth'
import uselocalesFilter from '../../utils/translate'
import { updateUser } from '../../lib/db'
import fetcher from '../../utils/fetcher'
import { addAvatar } from '../../lib/storage'

// ============================================================
// Settings
// ============================================================
const genderSettings = [
  { label: 'male', name: '男性' },
  { label: 'female', name: '女性' },
  { label: 'other', name: 'その他' },
  { label: 'noAnswer', name: '回答しない' }
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
  // State
  // ============================================================
  const [userName, setUserName] = useState('')
  const [genderSelected, setGenderSelected] = useState()
  const [genderOfMatchSelected, setGenderOfMatchSelected] = useState(
    genderOfMatchSettings[0]
  )
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("")

  // ============================================================
  // Contexts
  // ============================================================
  const { alertOpen, setAlertOpen, alertAssort, setAlertAssort } = useAlertState()

  // ============================================================
  // State
  // ============================================================
  let [loading, setLoading] = useState(true)
  // ============================================================
  // Auth
  // ============================================================
  const auth = useAuth()
  const user = auth.user

  // ============================================================
  // Fetch Data
  // ============================================================

  //mutateを定義
  const { mutate } = useSWRConfig()

  // ユーザー情報
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
      // 認証されていないユーザーは、index へリダイレクト
      router.push('/')
    } else if (userInfo) {
      // 認証されているなら、ユーザー情報を state に反映
      userInfo.name ? setUserName(userInfo.name) : setUserName('')
      setGenderSelected(userInfo.gender)
    }
  }, [router, user, userInfo])

  // Translate
  const t = uselocalesFilter('userSettings', router.locale)

  // ============================================================
  // Handle Avatar Image
  // ============================================================

  //avatarのinput fileがchangeしたときに、即座にプレビューを表示する(DBにアップロードする前)
  const handleAvatarFileChange = (e) => {
    setAvatarFile(e.target.files[0])

    let reader = new FileReader()

    reader.onloadend = () => {
      setAvatarPreviewUrl(reader.result);
      console.log('preview', avatarPreviewUrl)
    }
    reader.readAsDataURL(e.target.files[0])
  }

  // ============================================================
  // Handle Form Submit
  // ============================================================

  // 設定更新ボタン
  const handleSubmit = async (e) => {
    e.preventDefault()

    // TODO: 項目が選択されていない場合はエラーを返す
    // 性別を選択せずに保存しようとするとエラーになったため

    if (avatarFile) {
      // アバター画像が選択された場合は、アップロードする
      const avatarUrl = await addAvatar(user?.uid, avatarFile)

      await updateUser(user.uid, {
        name: userName,
        gender: genderSelected,
        avatar: avatarUrl
      })
    } else {
      // アバターがアップロードされなかった場合
      await updateUser(user.uid, {
        name: userName,
        gender: genderSelected
      })
    }

    // アラートの設定
    await setAlertAssort('updateUserSetting')

    // リダイレクト
    router.push({
      pathname: '/home'
    })
  }

  // ============================================================
  // Loading
  // ===========================================================
  useEffect(()=> {
    if(userInfo){
      setLoading(false)
    }
  },[userInfo])

  // ===========================================================
  // Return Page
  // ===========================================================
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Head>
        <title>Tsundoku | 設定</title>
        <meta
          name="description"
          content="Tsundoku (積ん読・ツンドク) は他の誰かと読書する、ペア読書サービスです。集中した読書は自己研鑽だけでなく、リラックス効果もあります。"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <GeneralAlert
        alertOpen={alertOpen}
        alertAssort={alertAssort}
        setAlertOpen={setAlertOpen}
        setAlertAssort={setAlertAssort}
      />

      <AppHeader />

      {/* main content */}
      <div className="relative flex-1 pb-16 bg-gray-50">
        <div className="sm:block sm:w-full sm:h-full" aria-hidden="true">
          <main className="sm:py-8 px-4 mx-auto max-w-xl">
            <div className="py-3 mb-12">
              <h1 className="text-2xl font-bold">ユーザー設定</h1>
            </div>
            <div>
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  プロフィール
                </h3>
               
              </div>

              <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5 sm:border-t sm:border-gray-200">
                  <label htmlFor="username" className="block sm:pt-2 sm:mt-px text-sm font-medium text-gray-700">
                    ユーザーネーム
                  </label>
                  <div className="sm:col-span-2 mt-1 sm:mt-0">
                    <div className="flex max-w-lg rounded-md shadow-sm">
                      
                      <input 
                        type="text" 
                        name="username" 
                        id="username" 
                        autoComplete="username" 
                        value={userName}
                        className="block p-3 w-full sm:text-sm rounded-md border border-gray-300 shadow-sm focus:ring-tsundoku-brown-main focus:border-tsundoku-brown-main"
                        onChange={(e) => {
                          setUserName(e.target.value)
                        }} />
                    </div>
                  </div>
                </div>

                {/* <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5 sm:border-t sm:border-gray-200">
                  <label htmlFor="about" className="block sm:pt-2 sm:mt-px text-sm font-medium text-gray-700">
                    自己紹介
                  </label>
                  <div className="sm:col-span-2 mt-1 sm:mt-0">
                    <textarea id="about" name="about" rows="3" className="block w-full max-w-lg sm:text-sm rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"></textarea>
                    <p className="mt-2 text-sm text-gray-500">好きな本やジャンルについて紹介してみましょう。</p>
                  </div>
                </div> */}

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center sm:pt-5 sm:border-t sm:border-gray-200">
                  <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
                    プロフィール画像
                  </label>
                  <div className="sm:col-span-2 mt-1 sm:mt-0">
                    <div className="flex items-center space-x-3">
                      {loading ?
                      <span className="relative w-20 h-20">
                        <Skeleton circle height="100%"/>
                      </span>
                      :
                      <span className="overflow-hidden relative w-20 h-20 bg-orange-100 rounded-full">
                        <Image 
                          src={avatarPreviewUrl ?
                            avatarPreviewUrl
                            :
                            userInfo?.avatar ?
                            userInfo.avatar
                            :
                            "/img/avatar/avatar-placeholder.png"
                          } 
                          layout={'fill'} 
                          alt="profile-image" 
                        />
                      </span>
                      }
                      <div>
                        <span className="block mb-3 text-sm text-gray-500">推奨：縦360px 横360px 比率1：1 </span>
                        <label
                          className="py-2 px-3 text-sm font-medium leading-4 text-gray-700 bg-white hover:bg-gray-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm focus:outline-none"
                          htmlFor="avatar"
                        >
                          <input 
                            type="file" 
                            id="avatar"
                            name="avatar"
                            accept="image/png, image/jpeg"
                            className="sr-only"
                            onChange={(e) => handleAvatarFileChange(e)}
                          />
                          変更
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center sm:pt-5 sm:border-t sm:border-gray-200">
                  <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
                    性別
                  </label>
                  <div className="sm:col-span-2 mt-1 sm:mt-0">
                    <RadioGroup
                      className="mt-1"
                      value={genderSelected}
                      onChange={setGenderSelected}
                    >
                      <RadioGroup.Label className="sr-only">
                        Gender setting
                      </RadioGroup.Label>
                      <div className="-space-y-px bg-white rounded-md">
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
                                  ? 'bg-tsundoku-brown-sub  z-10'
                                  : 'border-gray-200',
                                gender.label == genderSelected
                                  ? 'bg-tsundoku-brown-sub  z-10'
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
                                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                                </span>
                                <div className="flex flex-col ml-3">
                                  <RadioGroup.Label
                                    as="span"
                                    className={classNames(
                                      checked ? 'text-orange-900' : 'text-gray-900',
                                      gender == genderSelected
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
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                
              </div>
            </div>

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
                <span
                  type="button"
                  className="inline-flex items-center py-3 px-6 text-base font-medium text-white hover:bg-blue-600 rounded-md border border-transparent focus:ring-2 focus:ring-offset-2 shadow-sm cursor-pointer focus:outline-none bg-tsundoku-blue-main focus:ring-tsundoku-blue-main"
                  onClick={(e) => handleSubmit(e)}
                >
                  保存
                </span>
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
