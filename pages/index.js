import router, { useRouter } from 'next/router'
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
import { isBuffer } from 'lodash'
import { useEffect } from 'react'

export default function Top() {
  // ============================================================
  // Auth
  // ============================================================

  const auth = useAuth()

  // ============================================================
  // Routing
  // ============================================================

  const router = useRouter()
  const { locale, pathname } = router
  const t = uselocalesFilter('LP', locale)

  //暫定的に"https://tsundoku.live/"にアクセスしたら、"https://tsundoku.live/ja/"にアクセスするようにする
  useEffect(()=>{
    if(pathname != '/ja'){
      router.replace('/ja')
    }
  },[locale])
  

  // ============================================================
  // Return Page
  // ============================================================

  return (
    <div className="h-full">
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
            <div className="px-0 py-0 md:px-12 md:py-12 md:w-1/2">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold sm:tracking-wide leading-normal text-center sm:text-left text-gray-900">
                <span className="inline">音でつながる</span>
                <span className="block sm:mt-2">オンライン読書</span>
              </h1>
              <div className="mt-8 md:mt-12 max-w-md md:max-w-xl text-sm sm:text-base md:text-lg text-center md:text-left text-gray-900">
                <p >ボイスチャットで誰かとつながりながら、</p>
                <span>読書に集中できる環境を。</span>
              </div>
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
            <div className="px-0 py-12 md:px-4 md:py-0 mx-auto md:w-1/2 sm:max-w-lg">
              <Image
                src="/img/topvisual.jpg"
                alt="main visual"
                width={1400}
                height={900}
                className="rounded-xl"
                objectFit={'cover'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 音声でつながり、読書に集中 */}
      <div className="h-full bg-white">
        <div className="py-16 sm:py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl h-full">
          <div className="md:flex md:justify-between items-center h-full space-x-24">
            {/* 説明文 */}
            <div className="md:max-w-lg h-full">
              <div className="mb-2">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  <span className="block sm:inline leading-10"> 読書に没頭できる空間</span>
                  <span className="block sm:inline leading-10"></span>
                </h2>
              </div>
              {/* 画像 SP位置 -- START */}
              <div className="block md:hidden relative my-12 w-full">
                <Image
                  src="/img/tsundoku_room.jpg"
                  width={960}
                  height={560}
                  className="rounded-xl"
                  alt="tsundoku room"
                  objectFit={'cover'}
                />
              </div>
            {/* 画像 SP位置 - END */}
              <div className="space-y-8 sm:space-y-4 leading-relaxed">
                <div className="mt-8 sm:mt-4">
                  <p className="text-lg text-gray-900">
                    Tsundokuは、本を読む人同士をマッチングし、音声チャットで繋がりながら読書する場所です。お互いに、別々の本を読んでもかまいません。
                  </p>
                </div>
                <div>
                  <p className="text-lg text-gray-700">
                    適度な緊張感(<span className="text-tsundoku-brown-main"> ピアプレッシャー</span>)
                    によって、カフェにいるときのような集中力をもたらします。 充実感とリラックスの時間を取り戻しましょう。
                  </p>
                </div>
              </div>
              <div className="p-6 mt-8 sm:mt-8 bg-blue-50 rounded-lg">
                <div className="text-base font-bold text-gray-900">
                  ピアプレッシャーとは
                </div>
                <div className="text-base text-gray-900 mt-2">
                  お互いに相手のことを意識することで生まれるその場の緊張感。それをポジティブに利用し、「相手もやっているから自分もやろう」という動機が自然と生まれます。
                </div>
              </div>
            </div>
            {/* 説明文 - END */}
            {/* 画像 PC位置 -- START */}
            <div className="flex justify-end w-full h-full">
              <div className="hidden md:block relative">
                <Image
                  src="/img/tsundoku_room.jpg"
                  width={960}
                  height={560}
                  className="rounded-xl"
                  alt="tsundoku room"
                  objectFit={'cover'}
                />
              </div>
            </div>
            {/* 画像 PC位置 - END */}
          </div>
        </div>
      </div>

      {/* 「ちょうどいい」つながり */}
      <div className="bg-white">
        <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <div className="block md:flex md:justify-between items-center">
            {/* PC画像 - START */}
            <div className="hidden md:block md:py-0 relative md:w-1/2 h-full p-8">
              <Image
                src="/img/flowchart.svg"
                width={500}
                height={500}
                className=""
                alt="video matching"
              />
            </div>
            {/* PC画像 - END */}
            {/* 説明文 */}
            <div className="md:w-1/2">
              <div className="mb-2">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  <span className="block md:inline leading-8">音声のみだから、</span>
                  <span className="block md:inline leading-8">疲れない</span>
                  
                </h2>
              </div>
              {/* PC画像 - START */}
              <div className="block md:hidden md:py-0 relative md:w-1/2 h-full p-0 md:p-4">
                <Image
                  src="/img/flowchart.jpg"
                  width={500}
                  height={500}
                  className=""
                  alt="video matching"
                />
              </div>
              {/* PC画像 - END */}
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
        <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <div className="md:flex md:justify-between items-center">
      {/* 説明文 */}
      <div className="md:max-w-lg">
              <div className="mb-2">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  読書時間を自動で把握
                </h2>
              </div>
              {/* PC画像 - START */}
              <div className="block md:hidden">
                <Image
                  src="/img/automation.jpg"
                  width={600}
                  height={500}
                  className=""
                  alt="video matching"
                />
              </div>
              {/* PC画像 - END */}
              <div className="space-y-4 leading-relaxed">
                <div className="mt-4">
                  <p className="text-lg text-gray-900">
                    読書時間や、読んでいる本の管理もできます。読書量を可視化することで、他の予定で埋まってしまいがちな読書時間をしっかり確保しましょう。
                  </p>
                </div>
              </div>
              <div className="p-6 mt-8 sm:mt-8 bg-blue-50 rounded-lg">
                <div className="text-base font-bold text-gray-900 ">
                  読書をカレンダー登録
                </div>
                <div className="mt-2 text-base text-gray-900">
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
      <div className="hidden md:block">
        <Image
          src="/img/automation.jpg"
          width={600}
          height={500}
          className=""
          alt="video matching"
        />
      </div>
      {/* 画像 - END */}
      </div>
    </div>
  </div>

      {/* 利用の流れ */}
      <div className=" border-t border-b border-gray-200">
        <div className="py-16 sm:py-24">
          <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-xl lg:max-w-7xl">
            <h2 className="sr-only">ご利用の流れ</h2>
            <h2 className="pb-12 text-2xl sm:text-4xl font-bold text-left sm:text-center text-gray-900">
              Tsundoku を始める
            </h2>
            <dl className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-10 lg:space-y-0">
              {/* ステップ 1 */}
              <div>
                <dt>
                <div className="flex justify-center sm:justify-start">
                    <div className="relative flex-1">
                      <span className="absolute top-1/2 left-0 w-5/6 h-0.5 bg-gray-200"/>
                    </div>
                    <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 text-blue-500 rounded-full border border-blue-500">
                      <span className="font-bold">1</span>
                    </div>
                    <div className="relative flex-1">
                      <span className="absolute top-1/2 right-0 w-5/6 h-0.5 bg-gray-200"/>
                    </div>
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
                  <div className="flex justify-center sm:justify-start">
                    <div className="relative flex-1">
                      <span className="absolute top-1/2 left-0 w-5/6 h-0.5 bg-gray-200"/>
                    </div>
                    <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 text-blue-500 rounded-full border border-blue-500">
                      <span className="font-bold">2</span>
                    </div>
                    <div className="relative flex-1">
                      <span className="absolute top-1/2 right-0 w-5/6 h-0.5 bg-gray-200"/>
                    </div>
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
                <div className="flex justify-center sm:justify-start">
                    <div className="relative flex-1">
                      <span className="absolute top-1/2 left-0 w-5/6 h-0.5 bg-gray-200"/>
                    </div>
                    <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 text-blue-500 rounded-full border border-blue-500">
                      <span className="font-bold">3</span>
                    </div>
                    <div className="relative flex-1">
                      <span className="absolute top-1/2 right-0 w-5/6 h-0.5 bg-gray-200"/>
                    </div>
                  </div>
                  <p className="mt-5 text-lg font-bold leading-6 text-gray-900">
                    参加
                  </p>
                </dt>
                <dd className="mt-2 text-base text-gray-900">
                  <div>
                    <span>
                      ルームに参加すると、もう1人の参加者とボイスチャットでつながります。軽く挨拶を済ませたら、じっくり読書しましょう。
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
      <div className="md:flex md:justify-between md:items-center py-20 md:py-10 px-4 sm:px-6 md:px-8 sm:my-10 mx-auto max-w-7xl">
        <h2 className="md:text-4xl font-bold tracking-tight">
          <p className="block text-2xl sm:text-4xl tracking-wider leading-normal text-gray-900">
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
