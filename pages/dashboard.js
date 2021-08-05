import { useRouter } from 'next/router'
import Head from 'next/head'
import uselocalesFilter from '../utils/translate'
import Header from '../components/Header'
import Footer from '../components/Footer'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Onboarding2() {
  //Translate
  const { locale } = useRouter();
  const t = uselocalesFilter("dashboard",locale)

  return (
    <div>
      <Head>
        <title>DASHBOARD</title>
        <meta name="description" content="一緒に読書してくれる誰かを探すためのマッチングサービス" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      {/* main content */}
      <div className="relative pb-16 bg-gray-50 overflow-hidden">
        <div className="sm:block sm:h-full sm:w-full" aria-hidden="true">
          <main className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24">
            <div className="py-3">
              <div className="bg-tsundoku-blue-light px-6 py-4">
                <div className="text-center mb-12">Hi (user.name), Let's Read.</div>
                <div className="flex justify-center mb-4">
                  <button
                    type="button"
                    className="block w-full px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-tsundoku-blue-main hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tsundoku-blue-main"
                  >
                    Start Session
                  </button>
                </div>
                <div className="text-center text-sm">Last Session : (user.lastsessiondate)</div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Footer />

    </div>
  )
}
