
import { HomeIcon, BookOpenIcon, UserGroupIcon } from '@heroicons/react/outline'
import Link from 'next/link'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

var currentPage
if (typeof window !== "undefined") {
  // windowを使う処理を記述
  currentPage = window.location.pathname.split('/').slice(-1)[0]
}


console.log(currentPage)

const tabs = [
  { name: 'ホーム', href: '/home', icon: HomeIcon, current: currentPage == 'home' },
  { name: 'ブックリスト', href: '/booklist', icon: BookOpenIcon, current: currentPage == 'booklist' },
  { name: '人気の本', href: '/trend', icon: UserGroupIcon, current: currentPage == 'trend' },
]

export default function Navbar() {
  return (
    <div>
      <div className="hidden sm:block">
        <div className="">
          <nav className="-mb-px flex justify-center" aria-label="Tabs">
            {tabs.map((tab) => (
              <div key={tab.name} className="group w-1/4">
                <Link href={tab.href}>
                <a
                  className={classNames(
                    tab.current
                      ? 'border-tsundoku-blue-main text-tsundoku-blue-main'
                      : 'border-transparent text-gray-500 group-hover:text-gray-700 group-hover:border-gray-300',
                    'flex items-center justify-center py-4  border-b-2 border-gray-200 font-medium text-sm'
                  )}
                  aria-current={tab.current ? 'page' : undefined}
                >
                  <tab.icon
                    className={classNames(
                      tab.current ? 'text-tsundoku-blue-main' : 'text-gray-500 group-hover:text-gray-700',
                      'inline-block -ml-0.5 mr-2 h-5 w-5'
                    )}
                    aria-hidden="true"
                  />
                  <span>{tab.name}</span>
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
