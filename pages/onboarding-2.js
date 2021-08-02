import { Fragment, useState } from 'react'
import { Popover, Transition, RadioGroup } from '@headlessui/react'
import { MenuIcon, XIcon } from '@heroicons/react/outline'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import uselocalesFilter from '../utils/translate'

const navigation = [
  { name: 'How to work', href: '#' },
  { name: 'Features', href: '#' },
  { name: 'Pricing', href: '#' },
]

const genderSettings = [
  { name: 'Male'},
  { name: 'Female'},
  { name: 'LGBTQ'}

]
const genreSettings = [
  { 
    firstGenre: 'Bussiness',
    secondGenre: 'Economics',
  },
  { 
    firstGenre: 'Art',
    secondGenre: 'Design',
  },
  { 
    firstGenre: 'Technology',
    secondGenre: 'Science',
  },
  { 
    firstGenre: 'Literature',
    secondGenre: 'Philosophy',
  },
  { 
    firstGenre: 'Health',
    secondGenre: 'Sports',
  },
  { 
    firstGenre: 'Sociology',
    secondGenre: 'History',
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Onboarding2() {
  const [selected, setSelected] = useState(genderSettings[0])
  const { locale } = useRouter();

  const t = uselocalesFilter(locale)

  return (
    <div>
      <Head>
        <title>Onboarding-2</title>
        <meta name="description" content="一緒に読書してくれる誰かを探すためのマッチングサービス" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative bg-gray-50 overflow-hidden">
        <div className="relative pt-6 pb-16 sm:pb-24">
          <Popover>
            {({ open }) => (
              <>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <nav
                    className="relative flex items-center justify-between sm:h-10 md:justify-center"
                    aria-label="Global"
                  >
                    <div className="flex items-center flex-1 md:absolute md:inset-y-0 md:left-0">
                      <div className="flex items-center justify-between w-full md:w-auto">
                        <a href="#">
                          <span className="sr-only">Tsundoku</span>
                          <img
                            className="h-8 w-auto sm:h-10"
                            src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
                            alt=""
                          />
                        </a>
                        <div className="-mr-2 flex items-center md:hidden">
                          <Popover.Button className="bg-gray-50 rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                            <span className="sr-only">Open main menu</span>
                            <MenuIcon className="h-6 w-6" aria-hidden="true" />
                          </Popover.Button>
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:flex md:space-x-10">
                      {navigation.map((item) => (
                        <a key={item.name} href={item.href} className="font-medium text-gray-500 hover:text-gray-900">
                          {item.name}
                        </a>
                      ))}
                    </div>
                    <div className="hidden md:absolute md:flex md:items-center md:justify-end md:inset-y-0 md:right-0">
                      <span className="inline-flex rounded-md shadow">
                        <a
                          href="#"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
                        >
                          {t.LOGIN}
                        </a>
                      </span>
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
                    className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden"
                  >
                    <div className="rounded-lg shadow-md bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
                      <div className="px-5 pt-4 flex items-center justify-between">
                        <div>
                          <img
                            className="h-8 w-auto"
                            src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
                            alt=""
                          />
                        </div>
                        <div className="-mr-2">
                          <Popover.Button className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                            <span className="sr-only">Close menu</span>
                            <XIcon className="h-6 w-6" aria-hidden="true" />
                          </Popover.Button>
                        </div>
                      </div>
                      <div className="px-2 pt-2 pb-3">
                        {navigation.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                      <a
                        href="#"
                        className="block w-full px-5 py-3 text-center font-medium text-indigo-600 bg-gray-50 hover:bg-gray-100"
                      >
                        {t.LOGIN}
                      </a>
                    </div>
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>

          <main className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24">
            <div className="py-3">
              <h1 className="text-2xl font-bold">Tell us a little bit about you...</h1>
              <p className="text-base text-gray-500">(It takes 1 minute to finish this.)</p>
            </div>
            <div className="py-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  autoComplete="given-name"
                  className="p-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="py-3">
              <label htmlFor="Gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <RadioGroup className="mt-1" value={selected} onChange={setSelected}>
                <RadioGroup.Label className="sr-only">Gender setting</RadioGroup.Label>
                <div className="bg-white rounded-md -space-y-px">
                  {genderSettings.map((gender, genderSettingIdx) => (
                    <RadioGroup.Option
                      key={gender.name}
                      value={gender}
                      className={({ checked }) =>
                        classNames(
                          genderSettingIdx === 0 ? 'rounded-tl-md rounded-tr-md' : '',
                          genderSettingIdx === genderSettings.length - 1 ? 'rounded-bl-md rounded-br-md' : '',
                          checked ? 'bg-tsundoku-brown-sub border-tsundoku-brown-main z-10' : 'border-gray-200',
                          'relative border p-4 flex cursor-pointer focus:outline-none'
                        )
                      }
                    >
                      {({ active, checked }) => (
                        <>
                          <span
                            className={classNames(
                              checked ? 'bg-tsundoku-brown-main border-transparent' : 'bg-white border-gray-300',
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
                              className={classNames(checked ? 'text-orange-900' : 'text-gray-900', 'block text-sm font-medium')}
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
            <div className="py-3">
              <label htmlFor="Genre" className="block text-sm font-medium text-gray-700">
                What genres do interest you ?
              </label>
              <div className="grid grid-cols-2 gap-4 mt-3">
                {genreSettings.map((genre) => {
                  return (
                    <div className="relative border border-gray-300 rounded-md aspect-w-1 aspect-h-1" key={genre.firstGenre}>
                      <div className="absolute inset-1/2 w-3/4 h-12 text-center transform -translate-x-1/2 -translate-y-1/2">
                        <p>{genre.firstGenre}</p>
                        <p>{genre.secondGenre}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="py-3">
                <div className="flex justify-end">
                  <Link href="/onboarding-2"><a>
                    <button
                      type="button"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-tsundoku-blue-main hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tsundoku-blue-main"
                    >
                      Next
                    </button>
                  </a></Link>
                </div>
            </div>
          </main>
        </div>
      </div>

      <footer>
        <div className="flex text-blue-400">
          <div>
            <Link href="/onboarding-2" locale="en">
              <a>English</a>
            </Link>
          </div>
          <div className="ml-4">
            <Link href="/onboarding-2" locale="ja">
              <a>日本語</a>
            </Link>
          </div>
        </div>
        <div className="text-center">
          <div>Onboarding-2</div>
          <div>{t.TRANSLATE_TEST}</div>
        </div>
      </footer>
    </div>
  )
}
