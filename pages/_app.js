import '../styles/globals.css'
import { AuthProvider } from '../lib/auth'
import 'tailwindcss/tailwind.css'
import '../styles/globals.css'

//useContext
import { AppWrapper } from '../context/state'

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <AppWrapper>
        <Component {...pageProps} />
      </AppWrapper>
    </AuthProvider>
  )
}

export default MyApp
