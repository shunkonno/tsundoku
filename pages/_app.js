import '../styles/globals.css'
import { AuthProvider } from '../lib/auth'
import GlobalStyle from '../daily/components/GlobalStyle'
import 'tailwindcss/tailwind.css'

//useContext
import { AlertProvider } from '../context/AlertProvider'

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <AlertProvider>
        <GlobalStyle />
        <Component
          asides={MyApp.asides}
          modals={MyApp.modals}
          customTrayComponent={MyApp.customTrayComponent}
          customAppComponent={MyApp.customAppComponent}
          {...pageProps}
        />
      </AlertProvider>
    </AuthProvider>
  )
}

MyApp.asides = []
MyApp.modals = []
MyApp.customTrayComponent = null
MyApp.customAppComponent = null

export default MyApp
