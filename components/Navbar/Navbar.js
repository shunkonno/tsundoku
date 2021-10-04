import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  HomeIcon,
  BookOpenIcon,
  TrendingUpIcon
} from '@heroicons/react/outline'

import classNames from '../../utils/classNames'

var tabs = [
  { id: 'home', text: 'ホーム', href: '/home', icon: HomeIcon },
  {
    id: 'booklist',
    text: 'ブックリスト',
    href: '/booklist',
    icon: BookOpenIcon
  },
  { id: 'trend', text: '人気の本', href: '/trend', icon: TrendingUpIcon }
]

export default function Navbar() {
  const [currentPage, setCurrentPage] = useState()

  useEffect(() => {
    var lastPathName

    if (typeof window !== 'undefined') {
      // windowを使う処理を記述
      lastPathName = window.location.pathname.split('/').slice(-1)[0]
    }
    setCurrentPage(lastPathName)
  }, [currentPage])

  return (
    <div>
      <div className="block sm:hidden fixed bottom-0 z-20 -mx-4 w-full bg-white">
        <nav className="flex">
          {tabs.map((tab) => (
            <div key={tab.text} className="group w-1/3 sm:w-1/4">
              <Link href={tab.href}>
                <a
                  className={classNames(
                    tab.id == currentPage
                      ? 'border-tsundoku-blue-main text-tsundoku-blue-main'
                      : 'border-transparent text-gray-500 group-hover:text-gray-700 group-hover:border-gray-300',
                    'flex flex-col sm:flex-row items-center justify-center py-2 border-t-2 sm:border-b-2 border-gray-200 font-medium text-sm'
                  )}
                  aria-current={tab.current ? 'page' : undefined}
                >
                  <tab.icon
                    className={classNames(
                      tab.id == currentPage
                        ? 'text-tsundoku-blue-main'
                        : 'text-gray-500 group-hover:text-gray-700',
                      'block sm:inline-block -ml-0.5 sm:mr-2 w-7 h-7 sm:h-5 sm:w-5'
                    )}
                    aria-hidden="true"
                  />
                  <span className="block text-xs">{tab.text}</span>
                </a>
              </Link>
            </div>
          ))}
        </nav>
      </div>
      <div className="hidden sm:block">
        <nav className="flex justify-center -mb-px" aria-label="Tabs">
          {tabs.map((tab) => (
            <div key={tab.text} className="group w-1/4">
              <Link href={tab.href}>
                <a
                  className={classNames(
                    tab.id == currentPage
                      ? 'border-tsundoku-blue-main text-tsundoku-blue-main'
                      : 'border-transparent text-gray-500 group-hover:text-gray-700 group-hover:border-gray-300',
                    'flex items-center justify-center py-2 border-b-2 border-gray-200 font-medium text-sm'
                  )}
                  aria-current={tab.current ? 'page' : undefined}
                >
                  <tab.icon
                    className={classNames(
                      tab.id == currentPage
                        ? 'text-tsundoku-blue-main'
                        : 'text-gray-500 group-hover:text-gray-700',
                      'inline-block -ml-0.5 mr-2 h-5 w-5'
                    )}
                    aria-hidden="true"
                  />
                  <span>{tab.text}</span>
                </a>
              </Link>
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}
