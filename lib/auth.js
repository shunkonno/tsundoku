import React, { useState, useEffect, useContext, createContext } from 'react'
import firebase from './firebase'
import { createUser } from './db'
import Router from 'next/router'

// ==============================
// Initialize
// ==============================
const authContext = createContext()

export function AuthProvider({ children }) {
  const auth = useProvideAuth()
  return <authContext.Provider value={auth}>{children}</authContext.Provider>
}

// ==============================
// Export React Context
// ==============================
export const useAuth = () => {
  return useContext(authContext)
}

// ==============================
// Define functions
// ==============================
function useProvideAuth() {
  const [user, setUser] = useState(null)

  const handleUser = async (rawUser) => {
    if (rawUser) {
      const user = await formatUser(rawUser)

      const { token, ...userWithoutToken } = user

      createUser(user.uid, userWithoutToken)

      setUser(user)
      return user
    } else {
      setUser(false)
      return false
    }
  }

  const signInWithGoogle = () => {
    return firebase
      .auth()
      .signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then((response) => {
        handleUser(response.user)

        Router.push('/')
      })
  }

  const signout = () => {
    return firebase
      .auth()
      .signOut()
      .then(() => handleUser(false))
  }

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        handleUser(user)
      } else {
        handleUser(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const formatUser = async (user) => {
    const token = await user.getIdToken()

    return {
      uid: user.uid,
      email: user.email,
      provider: user.providerData[0].providerId,
      token
    }
  }

  return {
    user,
    signInWithGoogle,
    signout
  }
}
