import { useRouter } from 'next/router'
import Head from 'next/head'
import uselocalesFilter from '../utils/translate'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { 
  GlobeAltIcon, 
  LightningBoltIcon, 
  ScaleIcon } 
from '@heroicons/react/outline'
import { CheckIcon } from '@heroicons/react/solid'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Home() {
  const { locale } = useRouter();

  const t = uselocalesFilter("LP", locale)

  const flows = [
    {
      name: '1on1の読書ルームに参加する',
      description:
        '1対1のボイスチャットルームを立ち上げて参加します。難しい設定は一切なし。ルームに参加するボタンを押すだけです。',
      icon: GlobeAltIcon,
    },
    {
      name: '本を読みたい人を自動でマッチング',
      description:
        'いま本を読みたい人を自動で検索し、マッチングします。マッチングしたらボイスチャットが開始され、任意でビデオをオンにすることも可能。',
      icon: ScaleIcon,
    },
    {
      name: '落ち着いて読書に集中できる',
      description:
        '近くに人がいるときの適度な緊張感はパフォーマンスを向上させると言われています。エビデンス(根拠)はこちらにまとめました。',
      icon: LightningBoltIcon,
    },
  ]

  const tiers = [
    {
      name: 'フリープラン',
      href: '#',
      priceMonthly: 0,
      description: 'All the basics for starting a new business',
      includedFeatures: ['Potenti felis, in cras at at ligula nunc.', 'Orci neque eget pellentesque.'],
    },
    {
      name: 'スタンダードプラン',
      href: '#',
      priceMonthly: 12,
      description: 'All the basics for starting a new business',
      includedFeatures: [
        'Potenti felis, in cras at at ligula nunc. ',
        'Orci neque eget pellentesque.',
        'Donec mauris sit in eu tincidunt etiam.',
      ],
    },
  ]

  return (
    <div>

      <Head>
        <title>Tsundoku</title>
        <meta 
          name="description" 
          content="一緒に読書してくれる誰かを探すためのマッチングサービス" 
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      {/* main content */}
      <div className="relative bg-gray-50 overflow-hidden">
        <div className="sm:block sm:h-full sm:w-full" aria-hidden="true">
          <main className="mx-auto max-w-7xl sm:mt-24">
            <div className="px-4 text-center py-12">
              <h1 className="text-4xl leading-normal tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">気持ちよく</span>
                <span className="text-tsundoku-blue-main xl:inline">本に集中</span>
                <span className="inline">しよう</span>
              </h1>
              <p className="mt-5 max-w-md mx-auto text-sm text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                読書がうまく進みませんか？
              </p>
              <p className="mt-2 max-w-md mx-auto text-sm text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                それなら、一緒に本を読む"誰か"を見つけよう。
              </p>
              <div className="mt-6 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <a
                    href="#"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-tsundoku-blue-main hover:bg-blue-600 md:py-4 md:text-lg md:px-10"
                  >
                    Googleアカウントで無料ではじめる
                  </a>
                </div>
                
              </div>
            </div>
            <div className="py-12 bg-gray-50">
              <div className="max-w-xl mx-auto px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <div className="">
                  <h2 className="text-center text-base text-tsundoku-brown-main font-semibold tracking-wide uppercase">積んドクとは</h2>
                  <p className="mt-4 text-sm lg:text-center leading-relaxed text-gray-900 sm:text-base">
                    積んドクは、誰かと一緒に本を読むことで生まれる集中力によって、より持続的で効果的な読書体験を提供するWebサービスです。
                  </p>
                  
                </div>
              </div>
            </div>
            
            <div className="py-12 bg-gray-50">
              <div className="max-w-xl mx-auto px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <div className="lg:text-center">
                  <h2 className="text-base text-tsundoku-brown-main font-semibold tracking-wide uppercase">得られるメリット</h2>
                  <p className="mt-2 text-3xl leading-normal font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                    高いモチベーションを維持する
                  </p>
                  <p className="mt-4 max-w-2xl text-base text-gray-500 lg:mx-auto">
                    自宅にいてもカフェにいるときの集中力を
                  </p>
                </div>
                <dl className="mt-10 space-y-10 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
                  {flows.map((flow) => (
                    <div key={flow.name}>
                      <dt>
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-tsundoku-brown-main text-white">
                          <flow.icon className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <p className="mt-5 text-lg leading-normal font-medium text-gray-900">{flow.name}</p>
                      </dt>
                      <dd className="mt-2 leading-normal text-sm text-gray-500">{flow.description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className="px-4 mt-12 relative bg-gray-50 pt-16 pb-32 overflow-hidden">
              <div>
                <div className="max-w-xl mx-auto sm:px-6 lg:max-w-7xl lg:px-8">
                  <div className="text-right lg:text-center">
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
            </div>
          </main>

          <div className="bg-tsundoku-brown-sub">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-24 lg:px-8 lg:flex lg:items-center lg:justify-between">
              <h2 className="font-extrabold tracking-tight md:text-4xl">
                <p className="block text-tsundoku-brown-main text-3xl leading-normal mb-2">1分で準備完了。</p>
                <p className="block text-white text-xl leading-normal">複雑な設定はありません。</p>
                <p className="block text-white text-xl leading-normal">気軽に始めてみてください。</p>
              </h2>
              <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                <div className="inline-flex rounded-md shadow">
                  <a
                    href="#"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-tsundoku-brown-main hover:bg-tsundoku-brown-main"
                  >
                    Googleアカウントで無料ではじめる
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white">
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
          </div>
        </div>
      </div>
      {/* END main content */}

      <Footer />

    </div>
  )
}
