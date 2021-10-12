import { createContext, useState } from 'react'

export const UserContext = createContext()

export function UserProvider({ children }) {

  const [alertOpen, setAlertOpen] = useState(false)
  const [alertAssort, setAlertAssort] = useState('') // create, reserve, cancel, failed
  let userInfo = {
    alertOpen,
    setAlertOpen,
    alertAssort,
    setAlertAssort
  }

  return (
    <UserContext.Provider value={globalState}>{children}</UserContext.Provider>
  )
}
