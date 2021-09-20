import { createContext, useState } from 'react'

export const AppContext = createContext()

export function AppWrapper({ children }) {
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertAssort, setAlertAssort] = useState('') // create, reserve, cancel, failed
  let globalState = {
    alertOpen,
    setAlertOpen,
    alertAssort,
    setAlertAssort
  }

  return (
    <AppContext.Provider value={globalState}>{children}</AppContext.Provider>
  )
}
