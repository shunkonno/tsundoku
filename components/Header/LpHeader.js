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
import { useAuth } from '../../lib/auth'
import uselocalesFilter from '../../utils/translate'
import fetcher from '../../utils/fetcher'

const navigation = [
  { name: 'How to work', href: '#' },
  { name: 'Features', href: '#' },
  { name: 'Pricing', href: '#' }
]

export default function LpHeader() {
  // ============================================================
  // Auth
  // ============================================================
  const auth = useAuth()
  const user = auth.user

  // ============================================================
  // Routing
  // ============================================================

  const router = useRouter()
  const { locale, pathname } = router
  const t = uselocalesFilter('header', locale)

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
  // Button Handlers
  // ============================================================

  // Logout Button
  const handleLogout = () => {
    auth.signout()
    router.push('/')
  }

  // ============================================================
  // Button Rendering
  // ============================================================

  const renderHeaderButton = () => {
    //ログインしているかどうか確認
    if (user) {
      return (
        <div className="flex">
          <span className="inline-flex items-center rounded-md shadow">
            <Link href="/home">
              <a className="inline-flex items-center py-2 px-4 text-base font-medium leading-6 bg-white hover:bg-gray-50 rounded-md border border-transparent text-tsundoku-blue-main">
                {t.TO_HOME}
              </a>
            </Link>
          </span>
        </div>
      )
    }
    //ログインしていなければ、ログインボタンを表示(/signinページ以外)
    else {
      if (pathname == '/signin') {
        return
      } else {
        return (
          <div className="justify-end items-center">
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
  }

  // ============================================================
  // Return
  // ============================================================
  return (
    <>
      <div className="relative bg-orange-50">
        <div className="relative py-4">
          <Popover>
            {({ open }) => (
              <>
                <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
                  <nav
                    className="flex relative justify-between items-center w-full h-10 sm:h-12"
                    aria-label="Global"
                  >
                    <div className="flex items-center flex-shrink-0 h-full">
                        <Link href="/">
                          <a className="h-full w-32">
                            <span className="sr-only">Tsundoku</span>
                            <span className="block relative h-full">
                              <Image
                                src={'/img/logos/tsundoku-logo-mark-and-typo.svg'}
                                alt="tsundoku-logo-mark-and-typo"
                                layout={'fill'}
                              />
                            </span>
                          </a>
                        </Link>
                    </div>
                    <div>
                      
                      {renderHeaderButton()}
                    </div>
                  </nav>
                </div>
              </>
            )}
          </Popover>
        </div>
      </div>
    </>
  )
}
