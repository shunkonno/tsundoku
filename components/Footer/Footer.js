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
import { SocialAccounts } from '../../AccountsInfo'

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

  // localeSelectedが変更されると、そのlocaleのURLにリダイレクトする
  useEffect(() => {
    const { pathname } = router
    const { localeCode } = localeSelected
    if (currentLocale != localeSelected) {
      router.push(pathname, pathname, { locale: localeCode })
    }
  }, [currentLocale, localeSelected, router])

  const t = uselocalesFilter('footer', router.locale)

  // ============================================================
  // Button Handler
  // ============================================================

  const handleLogout = () => {
    auth.signout()
    router.push('/')
  }

  // ============================================================
  // Return Component
  // ===========================================================
  return (
    <footer
      className="relative z-0 bg-gray-50"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <div className=" px-4 sm:px-6 lg:px-4 mx-auto max-w-7xl">
        {/* <div className="pb-8 xl:grid xl:grid-cols-5 xl:gap-8">
          <div className="grid grid-cols-2 gap-8 xl:col-span-4">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div className="md:mt-0">
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
              </div>
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
        </div> */}
        <div className="md:flex md:justify-end md:items-center pt-4 mt-8 sm:border-t border-blueGray-700">
          {/* <p className="mt-8 md:mt-0 text-base text-gray-400">
            &copy; 2021 Tsundoku All rights reserved.
          </p> */}
          <div className="flex items-center">
            <div className="hidden sm:block my-4">
              {user ? (
                <button
                  className="text-sm text-gray-400"
                  onClick={(e) => handleLogout()}
                >
                  {t.LOGOUT}
                </button>
              ) : (
                <></>
              )}
            </div>
            <div className="hidden sm:block my-4 ml-4 sm:ml-8">
              {SocialAccounts.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-gray-300"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="sr-only">{item.name}</span>

                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
