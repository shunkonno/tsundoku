// ============================================================
// Imports
// ============================================================
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Steps, Hints } from 'intro.js-react'

// Components
import { SEO } from '../components/Meta'
import { AppHeader } from '../components/Header'
import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'
import { ReservedRoomSection } from '../components/Section'
import { ReservableRoomSection } from '../components/Section'
import { GeneralAlert } from '../components/Alert'
import { HomeIsReadingSection } from '../components/Section'
import { HomeReadTimeSection } from '../components/Section'

//Context
import { useUserInfo } from '../context/useUserInfo'

// Assets
import 'intro.js/introjs.css'

// Functions
import { useAuth } from '../lib/auth'
import uselocalesFilter from '../utils/translate'

export default function Home() {
  // ============================================================
  // Auth
  // ============================================================
  const auth = useAuth()
  const user = auth.user

  // ユーザー情報
  const { userInfo, error } = useUserInfo()

  // ============================================================
  // Routing
  // ============================================================
  const router = useRouter()

  useEffect(() => {
    if (user === false) {
      // 認証されていないユーザーは、index へリダイレクト
      router.push('/')
    } else if (userInfo?.isNewUser) {
      // はじめてログインしたユーザーを設定画面へリダイレクト
      router.push('/settings/new')
    }
  },[router, user, userInfo])

  // ============================================================
  // Localization
  // ============================================================
  const { locale } = router
  const t = uselocalesFilter('home', locale)

  // ============================================================
  // Onboarding Steps (intro.js)
  // ============================================================
  const introjsSteps = [
    {
      element: '.onboarding-1',
      intro: 'この一覧から、参加するルームを予約することができます。'
    },
    {
      element: '.onboarding-2',
      intro: '予約したルームはここに表示されます。'
    },
    {
      element: '.onboarding-3',
      intro: '都合の合うルームがなかったら、ルームを作成しましょう。'
    }
  ]

  const introjsInitialStep = 0

  // 初期設定が完了し、home に ?welcome=true でリダイレクトされたときに、イントロダクションを起動する
  const introjsStepsEnabled = router.query.welcome === 'true' ? true : false

  // intro.js 設定
  const introjsOptions = {
    nextLabel: '次へ',
    prevLabel: '戻る',
    doneLabel: '完了',
    hidePrev: true
  }

  const introjsOnExit = () => {
    return
  }

  // ============================================================
  // Return
  // ============================================================

  if (typeof window !== 'undefined') {
    // windowを使う処理を記述
    if (error?.status === 500) {
      window.location.reload()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <SEO
        title={"Tsundoku | ホーム"} 
        description={"Tsundoku (積ん読・ツンドク) は他の誰かと読書する、ペア読書サービスです。集中した読書は自己研鑽だけでなく、リラックス効果もあります。"} 
      />

      <GeneralAlert />

      <AppHeader />

      {/* intro.js */}
      {userInfo &&
      <Steps
        enabled={introjsStepsEnabled}
        steps={introjsSteps}
        options={introjsOptions}
        initialStep={introjsInitialStep}
        onExit={introjsOnExit}
      />
    }

      {/* main content */}
      <div className="relative flex-1 pb-16 bg-gray-50">
        <div className="sm:block sm:w-full sm:h-full" aria-hidden="true">
          <main className="relative sm:py-4 px-4 mx-auto max-w-7xl">
            <Navbar />
            <div className="flex gap-14 mt-8 sm:mt-16">
              {/* 左カラム -- START */}
              <div className="w-full sm:w-2/3 max-w-7xl">
                <ReservedRoomSection />
                <ReservableRoomSection />
              </div>
              {/* 左カラム -- END */}

              {/* 右カラム -- START */}
              <div className="hidden sm:block sm:w-1/3">
                <HomeReadTimeSection />
                <HomeIsReadingSection />
              </div>
              {/* 右カラム -- START */}
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
