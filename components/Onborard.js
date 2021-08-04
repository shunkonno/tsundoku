import { useState } from "react"

export default function Onboard({children}) {

  const [gender, setGender] = useState()

  return (
    <>
      {children}
    </>
  )
}