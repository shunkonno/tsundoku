// ============================================================
// Imports
// ============================================================
import { useRouter } from 'next/router'
import Image from 'next/image'

// Components
import { SEO } from '../components/Meta'
import { LpHeader } from '../components/Header'
import { LpFooter } from '../components/Footer'

// Funtions
import { useAuth } from '../lib/auth'

export default function SignIn() {
  // ============================================================
  // Auth
  // ============================================================

  const auth = useAuth()
  const user = auth.user

  // ============================================================
  // Routing
  // ============================================================
  const router = useRouter()

  if (user) {
    router.push('/home')
  }

  // ============================================================
  // Return
  // ============================================================

  return (
    <div>
      <SEO
        title={"ログイン"} 
        description={"Tsundoku (積ん読・ツンドク) は他の誰かと読書する、ペア読書サービスです。集中した読書は自己研鑽だけでなく、リラックス効果もあります。"} 
      />
      <LpHeader />

      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-0 min-h-screen bg-gray-50">
        <main>
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center">
              <Image
                src="/img/logos/tsundoku-logo-mark-only.svg"
                alt="tsundoku-logo-mark-only"
                width={32}
                height={32}
                layout="fixed"
              />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
              サインイン
            </h2>
          </div>

          <div className="sm:mx-auto mt-8 sm:w-full sm:max-w-md">
            <div className="py-8 px-4 sm:px-10 bg-white sm:rounded-lg shadow">
              <div>
                <div className="relative">
                  <div className="flex absolute inset-0 items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="flex relative justify-center text-sm">
                    <span className="px-2 text-gray-500 bg-white">
                      アカウントをお選びください
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={(e) => {
                      auth.signInWithGoogle()
                    }}
                    className="inline-flex justify-center py-3 px-4 w-full text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 rounded-md border border-gray-300 shadow-sm"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
                    </svg>
                    <span className="ml-4">Google でログイン</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <LpFooter />
    </div>
  )
}
