// ============================================================
// Imports
// ============================================================
import { Fragment } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import useSWR from 'swr'

//Assets
import { Popover, Transition } from '@headlessui/react'
import { MenuIcon, XIcon } from '@heroicons/react/outline'

// Functions
import uselocalesFilter from '../../utils/translate'
import { useAuth } from '../../lib/auth'
import fetcher from '../../utils/fetcher'

const navigation = [{ name: '設定', href: '/settings' }]

export default function AppHeader() {
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

  const router = useRouter()
  const { locale, pathname } = router
  const t = uselocalesFilter('header', locale)

  // ============================================================
  // Button Handler
  // ============================================================

  const handleLogout = () => {
    auth.signout()
    router.push('/')
  }

  // ============================================================
  // Render Function
  // ============================================================
  const renderHeaderButton = () => {
    //ログインしているかどうか確認
    if (user) {
      return <></>
    }
    //ログインしていなければ、ログインボタンを表示(ログインしていなければ/index.jsに飛ばされるので本来必要ないが念の為)
    else {
      return (
        <div className="hidden md:flex">
          <span className="inline-flex rounded-md shadow">
            <Link href="/signin">
              <a className="inline-flex items-center py-2 px-4 text-base font-medium bg-white hover:bg-gray-50 rounded-md border border-transparent text-tsundoku-blue-main">
                {t.LOGIN}
              </a>
            </Link>
          </span>
        </div>
      )
    }
  }

  const renderHeaderButtonPopover = () => {
    if (user) {
      if (pathname == '/home') {
        return (
          <div className="my-4 ml-5">
            <button
              className="text-sm text-gray-400"
              onClick={(e) => handleLogout()}
            >
              {t.LOGOUT}
            </button>
          </div>
        )
      } else {
        return (
          <>
            <div className="my-4 ml-5">
              <button
                className="text-sm text-gray-400"
                onClick={(e) => handleLogout()}
              >
                {t.LOGOUT}
              </button>
            </div>
          </>
        )
      }
    } else {
      return (
        <Link href="/signin">
          <a className="block py-3 px-5 w-full font-medium text-center bg-gray-50 hover:bg-gray-100 text-tsundoku-blue-main">
            {t.LOGIN}
          </a>
        </Link>
      )
    }
  }

  const renderNavigation = () => {
    if (user) {
      return (
        <div className="hidden md:flex md:space-x-10">
          {navigation.map((item) => (
            <Link href={item.href} key={item.name}>
              <a className="font-medium text-gray-500 hover:text-gray-900">
                {item.name}
              </a>
            </Link>
          ))}
        </div>
      )
    } else {
      return
    }
  }

  const renderNavigationPopover = () => {
    if (user) {
      return (
        <div className="px-2 pt-2 pb-3">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <a className="block py-4 px-3 text-base font-medium text-right text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                {item.name}
              </a>
            </Link>
          ))}
        </div>
      )
    } else {
      return
    }
  }

  // ============================================================
  // Return Component
  // ============================================================
  return (
    <>
      <div className="relative bg-gray-50">
        <div className="relative py-4">
          <Popover>
            {({ open }) => (
              <>
                <div className="px-4 sm:px-6 mx-auto max-w-7xl">
                  <nav
                    className=" flex relative justify-between items-center w-full sm:h-10"
                    aria-label="Global"
                  >
                    <div className="flex items-center">
                      <div className="flex justify-between items-center md:w-auto">
                        <Link href="/home">
                          <a>
                            <span className="sr-only">Tsundoku</span>
                            <picture className="flex items-center">
                              <source
                                className="w-auto h-8 sm:h-10"
                                srcSet="/img/logos/tsundoku-logo-mark-and-typo.svg"
                                media="(max-width: 639px)"
                              />
                              <source
                                className="w-auto h-8 sm:h-10"
                                srcSet="/img/logos/tsundoku-logo-mark-and-typo.svg"
                                media="(min-width: 640px)"
                              />
                              <Image
                                className="w-auto h-8 sm:h-10"
                                src="/img/logos/tsundoku-logo-mark-and-typo.svg"
                                alt="tsundoku-logo-mark-and-typo"
                                width={120}
                                height={32}
                              />
                            </picture>
                          </a>
                        </Link>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex md:hidden items-center -mr-2">
                        <Popover.Button className="inline-flex justify-center items-center p-2 text-gray-400 hover:text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-md focus:ring-2 focus:ring-inset focus:outline-none focus:ring-tsundoku-blue-main">
                          <span className="sr-only">Open main menu</span>
                          <MenuIcon className="w-6 h-6" aria-hidden="true" />
                        </Popover.Button>
                      </div>
                      {renderNavigation()}
                      {renderHeaderButton()}
                    </div>
                  </nav>
                </div>

                <Transition
                  show={open}
                  as={Fragment}
                  enter="duration-150 ease-out"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="duration-100 ease-in"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Popover.Panel
                    focus
                    static
                    className="md:hidden absolute inset-x-0 top-0 z-10 p-2 transition transform origin-top-right"
                  >
                    <div className="overflow-hidden bg-white rounded-lg ring-1 ring-black ring-opacity-5 shadow-md">
                      <div className="flex justify-between items-center px-5 pt-4">
                        <div>
                          <Link href="/home">
                            <a>
                              <Image
                                className="w-auto h-8 sm:h-10"
                                src="/img/logos/tsundoku-logo-mark-only.svg"
                                alt="tsundoku-logo-mark-only"
                                width={32}
                                height={32}
                              />
                            </a>
                          </Link>
                        </div>
                        <div className="-mr-2">
                          <Popover.Button className="inline-flex justify-center items-center p-2 text-gray-400 hover:text-gray-500 bg-white hover:bg-gray-100 rounded-md focus:ring-2 focus:ring-inset focus:outline-none focus:ring-tsundoku-blue-main">
                            <span className="sr-only">Close menu</span>
                            <XIcon className="w-6 h-6" aria-hidden="true" />
                          </Popover.Button>
                        </div>
                      </div>
                      {renderNavigationPopover()}
                      {renderHeaderButtonPopover()}
                    </div>
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
        </div>
      </div>
    </>
  )
}
