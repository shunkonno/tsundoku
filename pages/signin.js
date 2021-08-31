// ============================================================
// Imports
// ============================================================
import { useRouter } from 'next/router'

// Components
import { LpHeader } from '../components/Header'

// Funtions
import { useAuth } from '../lib/auth'

export default function SignIn() {
  // ============================================================
  // Initialize
  // ============================================================

  // Auth
  const auth = useAuth()
  const user = auth.user

  // Routing
  const router = useRouter()

  if (user) {
    router.push('/dashboard')
  }

  // ============================================================
  // Return Page
  // ============================================================

  return (
    <div>
      <LpHeader />

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-0">
        <main>
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <img
              className="mx-auto h-12 w-auto"
              src="/img/logos/tsundoku-logo-mark-only.svg"
              alt="Makeport"
            />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              サインイン
            </h2>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      アカウントをお選びください
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={(e) => {
                      auth.signInWithGoogle()
                    }}
                    className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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
    </div>
  )
}
