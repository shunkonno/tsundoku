import '../styles/globals.css'
import { AuthProvider } from '../lib/auth'
import 'tailwindcss/tailwind.css'

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
