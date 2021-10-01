import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

// Components
import { LpHeader } from '../components/Header'
import { LpFooter } from '../components/Footer'

// Assets
import { BookmarkIcon } from '@heroicons/react/outline'

// Funtions
import { useAuth } from '../lib/auth'
import uselocalesFilter from '../utils/translate'

export default function Home() {
  // ============================================================
  // Auth
  // ============================================================

  const auth = useAuth()

  // ============================================================
  // Routing
  // ============================================================

  const { locale } = useRouter()
  const t = uselocalesFilter('LP', locale)

  // ============================================================
  // Return Page
  // ============================================================

  return (
    <div>
      <Head>
        <title>Tsundoku</title>
        <meta
          name="description"
          content="Tsundoku (積ん読・ツンドク) は他の誰かと読書する、ペア読書サービスです。集中した読書は自己研鑽だけでなく、リラックス効果もあります。"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <LpHeader />

      {/* ヘッダー */}
      <div className="bg-orange-50">
        <div className="py-4 sm:py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <div className="md:flex items-center">
            <div className="md:py-12 md:w-3/5">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold sm:tracking-wide leading-normal text-gray-900">
                <span className="inline">読書に</span>
                <span className="inline text-tsundoku-blue-main">没頭</span>
                <span className="inline">する</span>
                <span className="block sm:mt-2">時間をつくる</span>
              </h1>
              <p className="mt-5 md:mt-12 max-w-md md:max-w-xl text-sm sm:text-base md:text-lg text-gray-900">
                誰かとゆるくつながるカフェのような環境で、 読書に集中できます。
                ｢読みたいけど、読めてない本｣ を消化しましょう。
              </p>
              <div className="sm:flex sm:justify-start mt-6 sm:mt-12 max-w-md">
                <div className="rounded-md shadow">
                  <Link href="/signin" passHref>
                    <button className="flex justify-center items-center py-3 md:py-4 px-8 md:px-10 w-full hover:bg-blue-600 rounded-md border border-transparent bg-tsundoku-blue-main">
                      <span className=" text-sm md:text-base font-bold text-white">
                        無料で始める
                      </span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="py-12 md:py-0 mx-auto md:w-2/5 sm:max-w-sm">
              <Image
                src="/img/mainvisual_circle_2160x2160.png"
                alt="main visual"
                width={2160}
                height={2160}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 音声でつながり、読書に集中 */}
      <div className="bg-white">
        <div className="py-12 sm:py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <div className="md:flex md:justify-between">
            {/* 説明文 */}
            <div className="md:max-w-lg">
              <div className="mb-2">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  音声でつながり、読書に集中
                </h2>
              </div>
              <div className="space-y-4 leading-relaxed">
                <div className="mt-4">
                  <p className="text-lg text-gray-900">
                    Tsundokuは、本を読む人同士をマッチングし、音声チャットで繋がりながら読書する場所です。簡単な挨拶を済ませたら、それぞれ読書に集中しましょう。
                  </p>
                </div>
                <div>
                  <p className="text-lg text-gray-700">
                    適度な緊張感 (ソーシャル・プレッシャー)
                    によって、カフェにいるときのような集中力を発揮することができます。フロー状態を誘い、充実感に加え、リラックス効果もあります。
                  </p>
                </div>
              </div>
              <div className="mt-4 sm:mt-8">
                <div className="text-base font-bold text-gray-900">
                  フロー状態について
                </div>
                <div className="text-base text-gray-900">
                  フロー状態とは・・・
                </div>
                <div className="flex items-center mt-2 space-x-2">
                  <div>
                    <BookmarkIcon
                      className="w-4 h-4 text-gray-900"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <a
                      className="text-base text-gray-500"
                      href="https://www.amazon.co.jp/dp/4790714799"
                    >
                      フロー体験入門―楽しみと創造の心理学
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* 説明文 - END */}
            {/* 画像 */}
            <div className="hidden md:block md:max-w-sm">
              <Image
                src="/img/video-matching.png"
                width={400}
                height={400}
                className=""
                alt="video matching"
              />
            </div>
            {/* 画像 - END */}
          </div>
        </div>
      </div>

      {/* 「ちょうどいい」つながり */}
      <div className="bg-white">
        <div className="py-12 sm:py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <div className="md:flex md:justify-between">
            {/* 画像 */}
            <div className="md:py-0 pb-12 sm:max-w-sm">
              <Image
                src="/img/video-matching.png"
                width={400}
                height={400}
                className=""
                alt="video matching"
              />
            </div>
            {/* 画像 - END */}
            {/* 説明文 */}
            <div className="md:max-w-lg">
              <div className="mb-2">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  ｢ちょうどいい｣ つながり
                </h2>
              </div>
              <div className="space-y-4 leading-relaxed">
                <div className="mt-4">
                  <p className="text-lg text-gray-900">
                    音声チャットのみのため、マッチングした人の顔 (映像)
                    が映ることはありません。パジャマでも、ノーメイクでも、関係なし。
                  </p>
                </div>
                <div>
                  <p className="text-lg text-gray-900">
                    適度な雑音として、一息つくための雑談相手として、「ちょうどいい」つながりを追求しています。
                  </p>
                </div>
              </div>
            </div>
            {/* 説明文 - END */}
          </div>
        </div>
      </div>

      {/* 読書管理も */}
      <div className="bg-white">
        <div className="py-12 sm:py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <div className="md:flex md:justify-between">
            {/* 説明文 */}
            <div className="md:max-w-lg">
              <div className="mb-2">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  読書管理も
                </h2>
              </div>
              <div className="space-y-4 leading-relaxed">
                <div className="mt-4">
                  <p className="text-lg text-gray-900">
                    読書時間や、ブックリストの管理もできます。読書量を可視化することで、他の予定で埋まってしまいがちな読書時間をしっかり確保しましょう。
                  </p>
                </div>
              </div>
              <div className="mt-4 sm:mt-8">
                <div className="text-base font-bold text-gray-900">
                  読書をカレンダー登録
                </div>
                <div className="text-base text-gray-900">
                  Tsundoku
                  では、集中して読書する時間を可視化することに加え、カレンダーに簡単に追加することもできます。読書を生活に組み込み、習慣化します。
                </div>
                <div className="flex items-center mt-2 space-x-2">
                  <div>
                    <BookmarkIcon
                      className="w-4 h-4 text-gray-900"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <a
                      className="text-base text-gray-500"
                      href="https://www.amazon.co.jp/dp/B07HQ41FSN"
                    >
                      習慣が10割
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* 説明文 - END */}
            {/* 画像 */}
            <div className="hidden md:block md:max-w-sm">
              <Image
                src="/img/video-matching.png"
                width={400}
                height={400}
                className=""
                alt="video matching"
              />
            </div>
            {/* 画像 - END */}
          </div>
        </div>
      </div>

      {/* 利用の流れ */}
      <div className=" bg-orange-50">
        <div className="py-12 sm:py-24">
          <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-xl lg:max-w-7xl">
            <h2 className="sr-only">利用の流れ</h2>
            <h2 className="pb-12 text-3xl sm:text-4xl font-bold text-center text-gray-900">
              Tsundoku を始める
            </h2>
            <dl className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-10 lg:space-y-0">
              {/* ステップ 1 */}
              <div>
                <dt>
                  <div className="flex justify-center items-center w-12 h-12 text-white bg-blue-500 rounded-md">
                    <span className="font-bold text-white">1</span>
                  </div>
                  <p className="mt-5 text-lg font-bold leading-6 text-gray-900">
                    Google アカウントでログイン
                  </p>
                </dt>
                <dd className="mt-2 text-base text-gray-900">
                  <div>
                    <span>
                      普段利用されている、Google
                      アカウントでログインしてください。
                    </span>
                  </div>
                  <div className="mt-2">
                    <Link href="/signin">
                      <a className="text-tsundoku-blue-main">ログインする</a>
                    </Link>
                  </div>
                </dd>
              </div>
              {/* ステップ 1 - END*/}

              {/* ステップ 2 */}
              <div>
                <dt>
                  <div className="flex justify-center items-center w-12 h-12 text-white bg-blue-500 rounded-md">
                    <span className="font-bold text-white">2</span>
                  </div>
                  <p className="mt-5 text-lg font-bold leading-6 text-gray-900">
                    ルームを予約
                  </p>
                </dt>
                <dd className="mt-2 text-base text-gray-900">
                  <div>
                    <span>
                      都合の良い時間帯に開催されるペア読書を予約しましょう。各回は30分~90分の長さです。ご希望の時間帯に開催されていない場合は、ルームを作成しましょう。
                    </span>
                  </div>
                </dd>
              </div>
              {/* ステップ 2 - END*/}

              {/* ステップ 3 */}
              <div>
                <dt>
                  <div className="flex justify-center items-center w-12 h-12 text-white bg-blue-500 rounded-md">
                    <span className="font-bold text-white">3</span>
                  </div>
                  <p className="mt-5 text-lg font-bold leading-6 text-gray-900">
                    参加
                  </p>
                </dt>
                <dd className="mt-2 text-base text-gray-900">
                  <div>
                    <span>
                      ルームに参加すると、もう1人の参加者とつながります。軽く挨拶を済ませたら、じっくり読書しましょう。
                    </span>
                  </div>
                  <div className="mt-2">
                    <span>
                      人の集中力が続くのは最大でも90分と言われています。終わったら、休んだり、他のことをしましょう。
                    </span>
                  </div>
                </dd>
              </div>
              {/* ステップ 3 - END*/}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA (フッター) */}
      <div className="md:flex md:justify-between md:items-center py-8 md:py-10 px-4 sm:px-6 md:px-8 sm:my-10 mx-auto max-w-7xl">
        <h2 className="md:text-4xl font-bold tracking-tight">
          <p className="block text-3xl sm:text-4xl tracking-wider leading-normal text-gray-900">
            もっと充実した読書時間を
          </p>
        </h2>
        <div className="flex md:flex-shrink-0 mt-8 md:mt-0">
          <div className="inline-flex rounded-md shadow">
            <Link href="/signin">
              <a className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-white rounded-md border border-transparent bg-tsundoku-blue-main hover:bg-tsundoku-blue-main">
                無料で始める
              </a>
            </Link>
          </div>
        </div>
      </div>

      <LpFooter />
    </div>
  )
}
