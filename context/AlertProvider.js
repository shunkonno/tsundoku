import { createContext, useState } from 'react'

export const AlertContext = createContext()

export function AlertProvider({ children }) {
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertAssort, setAlertAssort] = useState('') // create, reserve, cancel, failed
  let globalState = {
    alertOpen,
    setAlertOpen,
    alertAssort,
    setAlertAssort
  }

  return (
    <AlertContext.Provider value={globalState}>{children}</AlertContext.Provider>
  )
}
