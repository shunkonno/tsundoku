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
      name: 'Facebook',
      href: '#',
      icon: (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
            clipRule="evenodd"
          />
        </svg>
      )
    },
    {
      name: 'Instagram',
      href: '#',
      icon: (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
            clipRule="evenodd"
          />
        </svg>
      )
    },
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
  { id: 1, localeCode: 'en', language: 'English' },
  { id: 2, localeCode: 'ja', language: '日本語' }
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
  }, [localeSelected])

  const t = uselocalesFilter('footer', router.locale)

  // ============================================================
  // Return Page
  // ===========================================================
  return (
    <footer className="bg-tsundoku-blue-dark" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="pb-8 xl:grid xl:grid-cols-5 xl:gap-8">
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
                <button
                  className="mt-4 text-gray-400"
                  onClick={(e) => {
                    auth.signout()
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <Listbox value={localeSelected} onChange={setLocaleSelected}>
              {({ open }) => (
                <>
                  <Listbox.Label className="block font-medium text-gray-400">
                    Language
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
        <div className="mt-8 border-t border-blueGray-700 pt-8 md:flex md:items-center md:justify-between">
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

          <div className="mt-12 bg-gray-500">
            <h2 id="debug">///Debug Area///</h2>
            <p>{t.TranslateTest}</p>
            <p>現在ログイン中のユーザーは、<br />[ { user ? user.email : "いません"} ]</p>
            <button
              className="text-white p-1 border border-gray-200"
              onClick={() => console.log(localeSelected)}
            >
              show current locale in console
            </button>
          </div> 
    </footer>
  )
}
