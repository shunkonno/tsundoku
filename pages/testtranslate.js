import { useRouter } from 'next/router'
import useLocalesFilter from '../utils/translate'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

export default function TestTranslate() {
  const router = useRouter()
  const t = useLocalesFilter('footer', router.locale)
  return (
    <>
      <Header />
      <Footer />
    </>
  )
}
