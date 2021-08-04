import { Fragment, useState } from 'react'
import { Transition, RadioGroup, Listbox } from '@headlessui/react'
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import uselocalesFilter from '../utils/translate'
import Header from '../components/Header'
import FooterSmall from '../components/FooterSmall'

const genderSettings = [
  { name: 'Male'},
  { name: 'Female'},
  { name: 'LGBTQ'}
]

const countries = [
  { id: 1, name: 'Japan' },
  { id: 2, name: 'United State' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Onboarding1() {
  //InitialState
  const [genderSelected, setGenderSelected] = useState()
  const [countrySelected, setCountrySelected] = useState(countries[0])

  //Translate
  const { locale } = useRouter();
  const t = uselocalesFilter(locale)

  return (
    <div>

      <Head>
        <title>Onboarding-1</title>
        <meta name="description" content="一緒に読書してくれる誰かを探すためのマッチングサービス" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      {/* main content */}
      <div className="pb-16 bg-gray-50 overflow-hidden">
        <div className="sm:block sm:h-full sm:w-full" aria-hidden="true">
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
                  className="p-3 shadow-sm block w-full sm:text-sm border border-gray-300 focus:ring-tsundoku-brown-main focus:border-tsundoku-brown-main rounded-md"
                />
              </div>
            </div>
            <div className="py-3">
              <label htmlFor="Gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <RadioGroup className="mt-1" value={genderSelected} onChange={setGenderSelected}>
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
              <Listbox value={countrySelected} onChange={setCountrySelected}>
                {({ open }) => (
                  <>
                    <Listbox.Label className="block text-sm font-medium text-gray-700">Country</Listbox.Label>
                    <div className="mt-1 relative">
                      <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-tsundoku-brown-main focus:border-tsundoku-brown-main sm:text-sm">
                        <span className="block truncate">{countrySelected.name}</span>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
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
                          {countries.map((country) => (
                            <Listbox.Option
                              key={country.id}
                              className={({ active }) =>
                                classNames(
                                  active ? 'text-white bg-tsundoku-brown-main' : 'text-gray-900',
                                  'cursor-default select-none relative py-2 pl-8 pr-4'
                                )
                              }
                              value={country}
                            >
                              {({ selected, active }) => (
                                <>
                                  <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                    {country.name}
                                  </span>

                                  {selected ? (
                                    <span
                                      className={classNames(
                                        active ? 'text-white' : 'text-tsundoku-brown-main',
                                        'absolute inset-y-0 left-0 flex items-center pl-1.5'
                                      )}
                                    >
                                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
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
      {/* END main content */}

      <FooterSmall />

    </div>
  )
}
