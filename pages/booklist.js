// ============================================================
// Imports
// ===========================================================
import { useState } from 'react'
import { useRouter } from 'next/router'

// Assets
import { PlusSmIcon } from '@heroicons/react/solid'

// Components
import { SEO } from '../components/Meta'
import { AppHeader } from '../components/Header'
import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'
import { GeneralAlert } from '../components/Alert'
import { AddBookModal } from '../components/Modal'
import { IsReadingBookCard } from '../components/Card'
import { BooksGrid } from '../components/Books'

//Context
import { useUserInfo } from '../context/useUserInfo'

// Functions
import { useAuth } from '../lib/auth'
import uselocalesFilter from '../utils/translate'

export default function BookList() {

  // State
  let [modalOpen, setModalOpen] = useState(false)

  // Auth
  const auth = useAuth()
  const user = auth.user

  // ユーザー情報
  const { userInfo, error } = useUserInfo()

  // ============================================================
  // Routing
  // ============================================================
  const router = useRouter()

  // Localization
  const { locale } = router
  const t = uselocalesFilter('booklist', locale)

  // ============================================================
  // Return
  // ============================================================
  if (typeof window !== "undefined") {
    // windowを使う処理を記述
    // Internal Server Error 500 が出たら強制リロード
    if(error?.status === 500){
      window.location.reload()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <SEO
        title={"Tsundoku | ブックリスト"} 
        description={"Tsundoku (積ん読・ツンドク) は他の誰かと読書する、ペア読書サービスです。集中した読書は自己研鑽だけでなく、リラックス効果もあります。"} 
      />

      <GeneralAlert />

      <AddBookModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
      />

      <AppHeader />

      {/* main content */}
      <div className="relative flex-1 pb-16 bg-gray-50">
        <div className="sm:block sm:w-full sm:h-full" aria-hidden="true">
          <main className="relative sm:py-4 px-4 mx-auto max-w-7xl">
            <Navbar />

            <div>
              <section className="mt-6 sm:mt-12">
                <h1 className="subtitle-section">いま読んでいる本</h1>
                <IsReadingBookCard />
              </section>

              <section>
                <div className="flex justify-between py-5 mt-6 sm:mt-12">
                  <h1 className="title-section">ブックリスト</h1>
                  <button
                    className="flex items-center"
                    onClick={() => setModalOpen(true)}
                  >
                    <PlusSmIcon className="w-6 h-6 text-blue-500" />
                    <span className="text-sm text-blue-500">
                      リストに追加する
                    </span>
                  </button>
                </div>
                  
                <BooksGrid />
              </section>

            </div>
          </main>
        </div>
      </div>

      <Footer />

      {/* スマホ時、コンテンツとNavbarが重なるのを防ぐ */}
      <div className="sm:hidden h-16 bg-gray-50" />
    </div>
  )
}
