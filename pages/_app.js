import '../styles/globals.css'
import { AuthProvider } from '../lib/auth'
import GlobalStyle from '../daily/components/GlobalStyle'
import 'tailwindcss/tailwind.css'

//useContext
import { AppWrapper } from '../context/state'

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <AppWrapper>
        <GlobalStyle />
        <Component
          asides={MyApp.asides}
          modals={MyApp.modals}
          customTrayComponent={MyApp.customTrayComponent}
          customAppComponent={MyApp.customAppComponent}
          {...pageProps}
        />
      </AppWrapper>
    </AuthProvider>
  )
}

MyApp.asides = []
MyApp.modals = []
MyApp.customTrayComponent = null
MyApp.customAppComponent = null

export default MyApp
