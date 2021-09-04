// ============================================================
// Import
// ============================================================
import { Fragment, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

// Assets
import { Listbox, Transition } from '@headlessui/react'
import {
  CheckIcon,
  SelectorIcon,
  ChevronDownIcon
} from '@heroicons/react/solid'

// Functions
import { useAuth } from '../../lib/auth'
import uselocalesFilter from '../../utils/translate'

// ============================================================
// Settings
// ============================================================
const navigation = {
  support: [
    { name: 'Pricing', href: '#' },
    { name: 'Guide', href: '#' }
  ],
  social: [
    {
      name: 'Twitter',
      href: '#',
      icon: (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      )
    }
  ]
}

const locales = [
  // { id: 2, localeCode: 'en', language: 'English' },
  { id: 1, localeCode: 'ja', language: '日本語' }
]

// ============================================================
// Helper Functions
// ============================================================
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function FindLocaleByLocaleCode(localeCode) {
  const localeObject = locales.find((locale) => {
    return locale.localeCode == localeCode
  })

  return localeObject
}

export default function Footer() {
  // ============================================================
  // Initialize
  // ============================================================

  // Auth
  const auth = useAuth()
  const user = auth.user

  // Routing
  const router = useRouter()

  // Set locale
  const currentLocale = FindLocaleByLocaleCode(router.locale)
  const [localeSelected, setLocaleSelected] = useState(currentLocale)

  // Function
  const handleLogout = () => {
    auth.signout()
    router.push('/')
  } 

  // localeSelectedが変更されると、そのlocaleのURLにリダイレクトする
  useEffect(() => {
    const { pathname } = router
    const { localeCode } = localeSelected
    if (currentLocale != localeSelected) {
      router.push(pathname, pathname, { locale: localeCode })
    }
  }, [localeSelected])

  const t = uselocalesFilter('footer', router.locale)

  // ============================================================
  // Return Page
  // ===========================================================
  return (
    <footer className="relative z-0 bg-tsundoku-blue-dark" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="pb-8 xl:grid xl:grid-cols-5 xl:gap-8">
          <div className="grid grid-cols-2 gap-8 xl:col-span-4">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {/* <div className="md:mt-0">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Support
                </h3>
                <ul className="mt-4 space-y-4">
                  {navigation.support.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-base text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div> */}
            </div>
          </div>

          <div className="mt-12">
            <Listbox value={localeSelected} onChange={setLocaleSelected}>
              {({ open }) => (
                <>
                  <Listbox.Label className="block font-medium text-gray-400">
                    言語
                  </Listbox.Label>
                  <div className="mt-1 relative">
                    <Listbox.Button className="relative w-full appearance-none block text-left bg-none bg-blueGray-700 border border-transparent rounded-md mt-4 py-2 pl-3 pr-10 text-base text-white focus:outline-none focus:ring-white focus:border-white sm:text-sm">
                      <span className="block truncate">
                        {localeSelected.language}
                      </span>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <SelectorIcon
                          className="h-5 w-5 text-gray-400"
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
                      <Listbox.Options
                        static
                        className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                      >
                        {locales.map((locale) => (
                          <Listbox.Option
                            key={locale.id}
                            className={({ active }) =>
                              classNames(
                                active
                                  ? 'text-white bg-tsundoku-blue-main'
                                  : 'text-gray-900',
                                'cursor-default select-none relative py-2 pl-8 pr-4'
                              )
                            }
                            value={locale}
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={classNames(
                                    selected ? 'font-semibold' : 'font-normal',
                                    'block truncate'
                                  )}
                                >
                                  {locale.language}
                                </span>

                                {selected ? (
                                  <span
                                    className={classNames(
                                      active
                                        ? 'text-white'
                                        : 'text-tsundoku-blue-main',
                                      'absolute inset-y-0 left-0 flex items-center pl-1.5'
                                    )}
                                  >
                                    <CheckIcon
                                      className="h-5 w-5"
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
                </>
              )}
            </Listbox>
          </div>
        </div>
        <div className="mt-8 mb-10 border-t border-blueGray-700 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            {navigation.social.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-400 hover:text-gray-300"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </a>
            ))}
          </div>
          <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
            &copy; 2021 Tsundoku All rights reserved.
          </p>
        </div>
      </div>

          {/* <div className="mt-12 bg-gray-500">
            <h2 id="debug">///Debug Area///</h2>
            <p>{t.TranslateTest}</p>
            <p>現在ログイン中のユーザーは、<br />[ { user ? user.email : "いません"} ]</p>
            <button
              className="text-white p-1 border border-gray-200"
              onClick={() => console.log(localeSelected)}
            >
              show current locale in console
            </button>
          </div>  */}
    </footer>
  )
}
