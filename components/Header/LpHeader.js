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

const navigation = [
  { name: 'How to work', href: '#' },
  { name: 'Features', href: '#' },
  { name: 'Pricing', href: '#' }
]

export default function LpHeader() {

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
  console.log(userInfo)

  const router = useRouter()
  const { locale, pathname } = router
  const t = uselocalesFilter('header', locale)

  //Function
  const handleLogout = () => {
    auth.signout()
    router.push('/')
  } 

  const renderHeaderButton = () => {
    //ログインしているかどうか確認
    //ログインしていれば、ログアウトボタンを表示
    if(user) {
      return (
        <div className="flex">
          <span className="inline-flex items-center rounded-md shadow">
            <Link href="/dashboard">
              <a
                className="inline-flex leading-6 items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-tsundoku-blue-main bg-white hover:bg-gray-50"
              >
                {t.TODASHBOARD}
              </a>
            </Link>
          </span>
          <div className="text-right ml-8">
            <button
              className="inline-flex leading-6 items-center pl-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-500"
              onClick={(e) => handleLogout()}
            >
              {t.LOGOUT}
            </button>
          </div>
        </div>
      )
    }
    //ログインしていなければ、ログインボタンを表示(/signinページ以外)
    else {
      if(pathname == '/signin') {
        return
      }
      else {
        return (
          <div className="items-center justify-end">
            <span className="inline-flex rounded-md shadow">
              <Link href="/signin">
                <a
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-tsundoku-blue-main bg-white hover:bg-gray-50"
                >
                  {t.LOGIN}
                </a>
              </Link>
            </span>
          </div>
        )
      }
    }
  }

  // const renderHeaderButtonPopover = () => {
  //   if(user) {
  //     return(
  //       <>
  //         <div className="my-4 ml-2">
  //           <button
  //             className="text-gray-400 text-sm"
  //             onClick={(e) => handleLogout()}
  //           >
  //             {t.LOGOUT}
  //           </button>
  //         </div>
  //         <Link href="/dashboard">
  //           <a
  //             className="block w-full px-5 py-3 text-center font-medium text-tsundoku-blue-main bg-gray-50 hover:bg-gray-100"
  //           >
  //             {t.TODASHBOARD}
  //           </a>
  //         </Link>
  //       </>
  //     )
  //   }
  //   else {
  //     if(pathname == '/signin'){
  //       return
  //     }
  //     else {
  //       return(
  //         <Link href="/signin">
  //           <a
  //             className="block w-full px-5 py-3 text-center font-medium text-tsundoku-blue-main bg-gray-50 hover:bg-gray-100"
  //           >
  //             {t.LOGIN}
  //           </a>
  //         </Link>
  //       )
  //     }
  //   }
  // }

  // const renderNavigation = () => {
  //   return(
  //     <div className="hidden md:flex md:space-x-10">
  //       {navigation.map((item) => (
  //         <a
  //           key={item.name}
  //           href={item.href}
  //           className="font-medium text-gray-500 hover:text-gray-900"
  //         >
  //           {item.name}
  //         </a>
  //       ))}
  //     </div>
  //   )
  // }

  // const renderNavigationPopover = () => {
  //   return (
  //     <div className="px-2 pt-2 pb-3">
  //       {navigation.map((item) => (
  //         <a
  //           key={item.name}
  //           href={item.href}
  //           className="block px-3 py-4 text-right rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
  //         >
  //           {item.name}
  //         </a>
  //       ))}
  //     </div>
  //   )
  // }

  return (
    <>
      <div className="relative bg-gray-50">
        <div className="relative py-6">
          <Popover>
            {({ open }) => (
              <>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <nav
                    className="relative flex w-full items-center justify-between"
                    aria-label="Global"
                  >
                    <div className="flex items-center">
                      <div className="flex items-center justify-between md:w-auto">
                        <Link href="/">
                        <a>
                          <span className="sr-only">Tsundoku</span>
                          <picture>
                            <source className="h-8 w-auto sm:h-10" srcSet="/img/logos/tsundoku-logo-mark-and-typo.svg" media="(max-width: 639px)"/>
                            <source className="h-8 w-auto sm:h-10" srcSet="/img/logos/tsundoku-logo-mark-and-typo.svg" media="(min-width: 640px)"/>
                            <img
                               className="h-8 w-auto sm:h-10"
                              src="/img/logos/tsundoku-logo-mark-only.svg"
                              alt="tsundoku-logo-mark-only"
                            />
                          </picture>
                        </a>
                        </Link>
                      </div>
                    </div>
                    <div>
                      {/* <div className="-mr-2 flex items-center md:hidden">
                          <Popover.Button className="bg-gray-50 rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-tsundoku-blue-main">
                            <span className="sr-only">Open main menu</span>
                            <MenuIcon className="h-6 w-6" aria-hidden="true" />
                          </Popover.Button>
                        </div> */}
                      {/* {renderNavigation()} */}
                      {renderHeaderButton()}
                    </div>
                  </nav>
                </div>

                {/* <Transition
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
                    className="absolute z-10 top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden"
                  >
                    <div className="rounded-lg shadow-md bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
                      <div className="px-5 py-4 flex items-center justify-between">
                        <div>
                          <img
                            className="h-8 w-auto sm:h-10"
                            src="/img/logos/tsundoku-logo-mark-only.svg"
                            alt="tsundoku-logo-mark-only"
                          />
                        </div>
                        <div className="-mr-2">
                          <Popover.Button className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-tsundoku-blue-main">
                            <span className="sr-only">Close menu</span>
                            <XIcon className="h-6 w-6" aria-hidden="true" />
                          </Popover.Button>
                        </div>
                      </div>
                      {renderNavigationPopover()}
                      {renderHeaderButtonPopover()}
                    </div>
                  </Popover.Panel>
                </Transition> */}
              </>
            )}
          </Popover>
        </div>
      </div>
    </>
  )
}
