
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { HomeIcon, BookOpenIcon, UserGroupIcon } from '@heroicons/react/outline'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

var tabs = [
  { id:"home", text: 'ホーム', href: '/home', icon: HomeIcon },
  { id:"booklist", text: 'ブックリスト', href: '/booklist', icon: BookOpenIcon },
  { id:"trend", text: '人気の本', href: '/trend', icon: UserGroupIcon },
]

export default function Navbar() {
  const [currentPage, setCurrentPage] = useState()

  useEffect(() => {
    var lastPathName
    
    if (typeof window !== "undefined") {
      // windowを使う処理を記述
      lastPathName = window.location.pathname.split('/').slice(-1)[0]
    }
    setCurrentPage(lastPathName)

  },[currentPage])

  return (
    <div>
      <div className="hidden sm:block">
        <div className="">
          <nav className="-mb-px flex justify-center" aria-label="Tabs">
            {tabs.map((tab) => (
              <div key={tab.text} className="group w-1/4">
                <Link href={tab.href}>
                  <a
                    className={classNames(
                      tab.id == currentPage
                        ? 'border-tsundoku-blue-main text-tsundoku-blue-main'
                        : 'border-transparent text-gray-500 group-hover:text-gray-700 group-hover:border-gray-300',
                      'flex items-center justify-center py-4  border-b-2 border-gray-200 font-medium text-sm'
                    )}
                    aria-current={tab.current ? 'page' : undefined}
                  >
                    <tab.icon
                      className={classNames(
                        tab.id == currentPage ? 'text-tsundoku-blue-main' : 'text-gray-500 group-hover:text-gray-700',
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
    </div>
  )
}
