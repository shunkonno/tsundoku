import { createContext, useState, useContext } from 'react'

export const AlertContext = createContext()

export function AlertProvider({ children }) {
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertAssort, setAlertAssort] = useState('') // create, reserve, cancel, failed
  let AlertState = {
    alertOpen,
    setAlertOpen,
    alertAssort,
    setAlertAssort
  }

  return (
    <AlertContext.Provider value={AlertState}>{children}</AlertContext.Provider>
  )
}


export const useAlertState = () => useContext(AlertContext)
