import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import uselocalesFilter from '../utils/translate'


export default function Home() {
  const { locale } = useRouter();

  const t = uselocalesFilter(locale)

  return (
    <div>
      <Head>
        <title>Tsundoku</title>
        <meta name="description" content="一緒に本を読んでくれる誰かとマッチングするプラットフォーム" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="flex text-blue-400">
          <div>
            <Link href="/" locale="en">
              <a>English</a>
            </Link>
          </div>
          <div className="ml-4">
            <Link href="/" locale="ja">
              <a>日本語</a>
            </Link>
          </div>
        </div>
        <div className="text-center">
          <div>{t.GREETING}</div>
          <div>{t.CATCHCOPY}</div>
        </div>
      </main>
    </div>
  )
}
