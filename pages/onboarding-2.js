import { useState } from 'react'
import { RadioGroup } from '@headlessui/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import uselocalesFilter from '../utils/translate'
import { AppHeader } from '../components/Header'
import { FooterSmall } from '../components/Footer'

const genderOfMatchSettings = [{ name: 'No Restriction' }, { name: 'Man Only' }]

const genreSettings = [
  {
    firstGenre: 'Bussiness',
    secondGenre: 'Economics'
  },
  {
    firstGenre: 'Art',
    secondGenre: 'Design'
  },
  {
    firstGenre: 'Technology',
    secondGenre: 'Science'
  },
  {
    firstGenre: 'Literature',
    secondGenre: 'Philosophy'
  },
  {
    firstGenre: 'Health',
    secondGenre: 'Sports'
  },
  {
    firstGenre: 'Sociology',
    secondGenre: 'History'
  }
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Onboarding2() {
  //InitialState
  const [selected, setSelected] = useState(genderOfMatchSettings[0])

  //Translate
  const { locale } = useRouter()
  const t = uselocalesFilter('Onboarding2', locale)

  return (
    <div>
      <Head>
        <title>Onboarding-2</title>
        <meta
          name="description"
          content="一緒に読書してくれる誰かを探すためのマッチングサービス"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppHeader />

      {/* main content */}
      <div className="relative pb-16 bg-gray-50 overflow-hidden">
        <div className="sm:block sm:h-full sm:w-full" aria-hidden="true">
          <main className="mx-auto max-w-7xl px-4 mt-16 sm:mt-20">
            <div className="py-3">
              <Link href="/onboarding-1">
                <a>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tsundoku-blue-main"
                  >
                    Back
                  </button>
                </a>
              </Link>
            </div>
            <div className="py-3">
              <h1 className="text-2xl font-bold">
                Tell us how you’d like to participate.
              </h1>
            </div>

            <div className="py-3">
              <label
                htmlFor="Gender"
                className="block text-sm font-medium text-gray-700"
              >
                GenderRestriction
              </label>
              <RadioGroup
                className="mt-1"
                value={selected}
                onChange={setSelected}
              >
                <RadioGroup.Label className="sr-only">
                  Gender setting
                </RadioGroup.Label>
                <div className="bg-white rounded-md -space-y-px">
                  {genderOfMatchSettings.map(
                    (gender, genderOfMatchSettingsIdx) => (
                      <RadioGroup.Option
                        key={gender.name}
                        value={gender}
                        className={({ checked }) =>
                          classNames(
                            genderOfMatchSettingsIdx === 0
                              ? 'rounded-tl-md rounded-tr-md'
                              : '',
                            genderOfMatchSettingsIdx ===
                              genderOfMatchSettings.length - 1
                              ? 'rounded-bl-md rounded-br-md'
                              : '',
                            checked
                              ? 'bg-tsundoku-brown-sub border-tsundoku-brown-main z-10'
                              : 'border-gray-200',
                            'relative border p-4 flex cursor-pointer focus:outline-none'
                          )
                        }
                      >
                        {({ active, checked }) => (
                          <>
                            <span
                              className={classNames(
                                checked
                                  ? 'bg-tsundoku-brown-main border-transparent'
                                  : 'bg-white border-gray-300',
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
                                className={classNames(
                                  checked ? 'text-orange-900' : 'text-gray-900',
                                  'block text-sm font-medium'
                                )}
                              >
                                {gender.name}
                              </RadioGroup.Label>
                            </div>
                          </>
                        )}
                      </RadioGroup.Option>
                    )
                  )}
                </div>
              </RadioGroup>
            </div>
            <div className="py-3">
              <label
                htmlFor="Genre"
                className="block text-sm font-medium text-gray-700"
              >
                What genres do interest you ?
              </label>
              <div className="grid grid-cols-2 gap-4 mt-3">
                {genreSettings.map((genre) => {
                  return (
                    <div
                      className="relative border border-gray-300 rounded-md aspect-w-1 aspect-h-1"
                      key={genre.firstGenre}
                    >
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
                <Link href="/dashboard">
                  <a>
                    <button
                      type="button"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-tsundoku-blue-main hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tsundoku-blue-main"
                    >
                      Next
                    </button>
                  </a>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
      {/* END main content */}

      <FooterSmall />
    </div>
  )
}
