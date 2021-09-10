import router, { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

// Components
import { LpHeader } from '../components/Header'
import { Footer } from '../components/Footer'

// Funtions
import { useAuth } from '../lib/auth'
import uselocalesFilter from '../utils/translate'

export default function Home() {
  // Auth
  const auth = useAuth()

  const { locale } = useRouter()

  const t = uselocalesFilter('LP', locale)

  return (
    <div>
      <Head>
        <title>Tsundoku</title>
        <meta
          name="description"
          content="Tsundoku (積ん読・ツンドク) は他の誰かと読書する、ペア読書サービスです。"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <LpHeader />

      {/* main content */}
      <div className="relative bg-gray-50 overflow-hidden font-NotoSansSerif">
        <div className="sm:block sm:h-full sm:w-full" aria-hidden="true">
          <main className="mx-auto max-w-7xl sm:mt-4">
            <div className="px-4 sm:px-6 lg:px-8 text-center md:text-left py-4 sm:py-12 md:flex">
              <div className="md:w-3/5 md:py-12">
                <h1 className="text-4xl leading-normal tracking-tight font-bold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="inline">読書に</span>
                  <span className="text-tsundoku-blue-main inline">没頭</span>
                  <span className="inline">する</span>
                  <span className="block sm:mt-2">時間をつくる</span>
                </h1>
                <p className="font-sans mt-5 max-w-md mx-auto text-sm text-gray-500 sm:text-lg md:mt-12 md:text-xl md:max-w-3xl">
                  誰かとゆるくつながるカフェのような環境で、 読書に集中
                </p>
                <div className="mt-6 sm:mt-12 max-w-md sm:flex sm:justify-start">
                  <div className="rounded-md shadow">
                    <Link href='/signin'>
                      <button
                        className="font-sans w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-md text-white bg-tsundoku-blue-main hover:bg-blue-600 md:py-4 md:text-lg md:px-10"
                      >
                        無料で始める
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="sm:max-w-sm md:max-w-none md:w-2/5 mx-auto flex items-center py-12 md:py-0">
                <Image
                  src="/img/mainvisual_circle_2160x2160.png"
                  alt="mainvisual"
                  width={2160}
                  height={2160}
                />
              </div>
            </div>

            <div className="mt-10">
              <div className="max-w-xl mx-auto px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                  <div className="col-span-1 lg:col-span-3 py-10">
                    <div className="mb-2">
                      <h2 className="text-gray-900 font-bold text-2xl lg:text-3xl leading-relaxed">
                        没頭する時間を取り戻す
                      </h2>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-900 text-lg leading-relaxed">
                          落ち着いて、じっくりと読書できないのは、現代人の悩みのひとつです。スマホの通知が鳴るときも、ふと家事を思い出したときにも、集中力が途切れてしまいがちです。
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-900 text-lg leading-relaxed">
                          没頭して読書する時間を取り戻したい。積ん読してる本を、Tsundoku
                          で消化しませんか。
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1 lg:col-span-3 py-10 lg:ml-8">
                    <div>
                      <p className="font-NotoSerif text-3xl text-gray-400">
                        ｢書物の新しいページを1ページ、1ページ読むごとに、私はより豊かに、より強く、より高くなっていく。｣
                        (アントン・チェーホフ)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-4 sm:py-12 bg-gray-50">
              <div className="max-w-xl mx-auto px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <div className="lg:text-center">
                  <h2 className="text-base sm:text-xl text-tsundoku-brown-main font-semibold tracking-wide">
                    Tsundoku とは
                  </h2>
                  <span className="block sm:inline mt-2 text-3xl leading-normal font-extrabold tracking-tight text-gray-900 lg:text-5xl">
                    ビデオ通話でつながる、ペア読書
                  </span>
                </div>

                <div className="mt-10">
                  <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                      {/* STEP 1 -- START */}
                      <div className="col-span-1 lg:col-span-2 py-10 px-4 sm:px-6 lg:px-8 sm:rounded-md border-double border-4 border-yellow-600">
                        <div className="mb-2">
                          <h2 className="text-gray-900 font-bold text-2xl leading-relaxed">
                            1 - ルームを予約
                          </h2>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-gray-900 text-lg leading-relaxed">
                              まずは、都合の良い時間帯に開催されるペア読書を予約しましょう。各回は30分~90分の長さです。
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-900 text-lg leading-relaxed">
                              ご希望の時間帯に開催されていない場合、ルームを作成することもできます。
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* STEP 1 -- END */}

                      {/* STEP 2 -- START */}
                      <div className="col-span-1 lg:col-span-2 py-10 px-4 sm:px-6 lg:px-8 sm:rounded-md border-double border-4 border-yellow-600">
                        <div className="mb-2">
                          <h2 className="text-gray-900 font-bold text-2xl leading-relaxed">
                            2 - 時間になったら、参加
                          </h2>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-gray-900 text-lg leading-relaxed">
                              ルームに参加すると、もう1人の参加者とつながります。軽く挨拶を済ませたら、じっくり読書しましょう。
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-900 text-lg leading-relaxed">
                              「映像オフ」の設定も、もちろん可能。また、マッチ対象となる性別の設定もできます。
                              <span className="text-sm">(開発中)</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* STEP 2 -- END */}

                      {/* STEP 3 -- START */}
                      <div className="col-span-1 lg:col-span-2 py-10 px-4 sm:px-6 lg:px-8 sm:rounded-md border-double border-4 border-yellow-600">
                        <div className="mb-2">
                          <h2 className="text-gray-900 font-bold text-2xl leading-relaxed">
                            3 - 没頭する時間
                          </h2>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-gray-900 text-lg leading-relaxed">
                              没頭する時間を過ごしたら、ルームを退室しましょう。
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-900 text-lg leading-relaxed">
                              人の集中力が続くのは最大でも90分と言われています。集中したら、休んだり、他のことをしましょう。
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* STEP 3 -- END */}
                    </div>
                  </div>
                </div>

                {/* <dl className="mt-10 mb-12 sm:mb-24">
                  <div>
                    <dt>
                      <p className="mt-12 sm:mt-24 text-lg lg:text-3xl leading-normal font-medium text-gray-900">
                        <span className="text-tsundoku-brown-main">○ </span>
                        落ち着いて読書に集中
                      </p>
                    </dt>
                    <dd className="font-sans mt-2 sm:mt-8 leading-normal text-sm sm:text-lg text-gray-500">
                      他人がいることで生まれる適度な緊張感(ソーシャルプレッシャー)により、他のことに
                      気をとられることなく、読書に集中できます。
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <p className="mt-12 sm:mt-24 text-right text-lg lg:text-3xl leading-normal font-medium text-gray-900">
                        <span className="text-tsundoku-brown-main">○ </span>
                        読書時間を確保
                      </p>
                    </dt>
                    <dd className="font-sans mt-2 sm:mt-8 sm:text-right leading-normal text-sm sm:text-lg text-gray-500">
                      読書する時間帯を事前に決めます。そうすることで、プレコミット効果により、高い生産性を実現できます。
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <p className="mt-12 sm:mt-24 text-lg lg:text-3xl leading-normal font-medium text-gray-900">
                        <span className="text-tsundoku-brown-main">○ </span>
                        孤独感を緩和
                      </p>
                    </dt>
                    <dd className="font-sans mt-2 sm:mt-8 leading-normal text-sm sm:text-lg text-gray-500">
                      黙々と読書に取り組んでいる間は、ときに孤独なもの。一緒に同じことをしている誰かがいるという安心感は、メンタルのケアにも役立ちます。
                    </dd>
                  </div>
                </dl> */}
              </div>
            </div>
            {/* 特徴：ソーシャル */}
            {/* <div className="px-4 mt-12 relative bg-gray-50 pt-16 pb-32 overflow-hidden">
              <div>
                <div className="max-w-xl mx-auto sm:px-6 lg:max-w-7xl lg:px-8">
                  <div className=s"text-right lg:text-center">
                    <h2 className="text-base text-tsundoku-brown-main font-semibold tracking-wide uppercase">FEATURE</h2>
                  </div>
                </div>
                <div className="lg:mt-6 lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:grid-flow-col-dense lg:gap-24">

                  <div className="max-w-xl mx-auto sm:px-6 lg:py-32 lg:max-w-none lg:mx-0 lg:px-0 lg:col-start-2">
                    <div>

                      <div className="mt-6">
                        <p className="mt-2 text-right lg:text-left text-3xl leading-10 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                          本からはじまる
                        </p>
                        <p className="mt-2 text-right lg:text-left text-3xl leading-10 font-extrabold text-gray-900 sm:text-4xl">
                          "ゆるい"つながり
                        </p>
                      </div>
                    </div>
                    <dl className="mt-10 space-y-10">
                      <div>
                        <dt>
                          <p className="mt-5 text-right lg:text-left text-lg leading-normal font-medium text-gray-900">本棚にはあなたが表れる</p>
                        </dt>
                        <dd className="mt-2 lg:text-left leading-normal text-sm text-gray-500">持っている本のリストが作成できます。ルーム内で公開することができるため、マッチした相手がどんな本を読んでいるか知ることができます。</dd>
                      </div>
                      <div>
                        <dt>
                          <p className="mt-5 text-right lg:text-left text-lg leading-normal font-medium text-gray-900">本の好みが近い人同士がマッチング</p>
                        </dt>
                        <dd className="mt-2 lg:text-left leading-normal text-sm text-gray-500">本のリストから、アルゴリズムにより本の内容やジャンルが近い人を自動でマッチングします。感性が似ている人同士で自然につながれます。</dd>
                      </div>
                      <div>
                        <dt>
                          <p className="mt-5  text-right lg:text-left text-lg leading-normal font-medium text-gray-900">フレンド機能なし。一期一会のつながり</p>
                        </dt>
                        <dd className="mt-2 lg:text-left leading-normal text-sm text-gray-500">他のユーザーをフォローしたりフレンドになる機能は提供していません。過度な人間関係は疲れるからです。SNSの"フレンド"はもう要りません。</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="mt-12 sm:mt-16 lg:mt-0 lg:col-start-1">
                    <div className="pr-4 -ml-48 sm:pr-6 md:-ml-16 lg:px-0 lg:m-0 lg:relative lg:h-full">
                      <img
                        className="w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 lg:absolute lg:right-0 lg:h-full lg:w-auto lg:max-w-none"
                        src="https://tailwindui.com/img/component-images/inbox-app-screenshot-2.jpg"
                        alt="Customer profile user interface"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </main>

          <div className="max-w-xl mx-auto px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            <div className="py-20">
              <div>
                <p className="font-NotoSerif text-3xl text-gray-400">
                  ｢宝島の海賊たちが盗んだ財宝よりも、本には多くの宝が眠っている。そして何よりも、宝を毎日味わうことができる。｣
                  (ウォルト・ディズニー)
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 md:py-10 md:px-8 md:flex md:items-center md:justify-between">
            <h2 className="font-sans font-bold tracking-tight md:text-4xl">
              <p className="block text-gray-900 text-3xl sm:text-4xl tracking-wider leading-normal mb-2">
                Tsundoku を使って、ペア読書
              </p>
            </h2>
            <div className="mt-8 flex md:mt-0 md:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <a
                  href="#"
                  className="font-sans inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-tsundoku-blue-main hover:bg-tsundoku-blue-main"
                >
                  無料で始める
                </a>
              </div>
            </div>
          </div>

          {/* 料金セクション */}
          {/* <div className="bg-white">
            <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
              <div className="sm:flex sm:flex-col sm:align-center">
                <h1 className="text-3xl font-extrabold text-gray-900 sm:text-center">料金プラン</h1>
                <p className="mt-5 text-base text-gray-500 sm:text-center">
                  無料でも利用できますが、最大限のパフォーマンスを得たい方は、ぜひスタンダードプランのご利用をおすすめ致します。
                </p>
                <div className="relative self-center mt-6 bg-gray-100 rounded-lg p-0.5 flex sm:mt-8">
                  <button
                    type="button"
                    className="relative w-1/2 bg-white border-gray-200 rounded-md shadow-sm py-2 text-sm font-medium text-gray-900 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-tsundoku-blue-main focus:z-10 sm:w-auto sm:px-8"
                  >
                    Monthly billing
                  </button>
                  <button
                    type="button"
                    className="ml-0.5 relative w-1/2 border border-transparent rounded-md py-2 text-sm font-medium text-gray-700 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-tsundoku-blue-main focus:z-10 sm:w-auto sm:px-8"
                  >
                    Yearly billing
                  </button>
                </div>
              </div>
              <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-4">
                {tiers.map((tier) => (
                  <div key={tier.name} className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
                    <div className="p-6">
                      <h2 className="text-lg leading-6 font-medium text-gray-900">{tier.name}</h2>
                      <p className="mt-4 text-sm text-gray-500">{tier.description}</p>
                      <p className="mt-8">
                        <span className="text-4xl font-extrabold text-gray-900">${tier.priceMonthly}</span>{' '}
                        <span className="text-base font-medium text-gray-500">/mo</span>
                      </p>
                      <a
                        href={tier.href}
                        className={classNames(
                          tier.name == "スタンダードプラン" ? 'text-white font-semibold bg-tsundoku-blue-main border border-tsundoku-blue-main hover:bg-blue-600' : 'text-tsundoku-blue-main bg-blue-50 border border-blue-50',
                          'mt-8 block w-full rounded-md py-2 text-sm  text-center '
                        )}
                      >
                        {tier.name}を選択
                      </a>
                    </div>
                    <div className="pt-6 pb-8 px-6">
                      <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">What's included</h3>
                      <ul className="mt-6 space-y-4">
                        {tier.includedFeatures.map((feature) => (
                          <li key={feature} className="flex space-x-3">
                            <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />
                            <span className="text-sm text-gray-500">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div> */}
          {/* 料金セクション END */}
        </div>
      </div>
      {/* END main content */}

      <Footer />
    </div>
  )
}
