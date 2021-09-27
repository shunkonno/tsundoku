import React, { useState, useEffect, useContext, createContext } from 'react'
import firebase from './firebase'
import { checkUserExist, createUser } from './db'

// ============================================================
// Initialize
// ============================================================
const authContext = createContext()

export function AuthProvider({ children }) {
  const auth = useProvideAuth()
  return <authContext.Provider value={auth}>{children}</authContext.Provider>
}

// ============================================================
// Export React Context
// ============================================================
export const useAuth = () => {
  return useContext(authContext)
}

// ============================================================
// Define functions
// ============================================================
function useProvideAuth() {
  const [user, setUser] = useState(null)

  const handleUser = async (rawUser) => {
    if (rawUser) {
      // 必要な情報を抽出
      const user = await formatUser(rawUser)

      // トークンを除外した Object を作成 (userWithoutToken)
      var { token, ...userWithoutToken } = user

      // すでにユーザーが登録されているか確認
      const userExists = await checkUserExist(user.uid)

      if (userExists) {
        // すでに存在する場合
        userWithoutToken['isNewUser'] = false
        createUser(user.uid, userWithoutToken)
      } else {
        // 新規ユーザーの場合
        userWithoutToken['isNewUser'] = true
        createUser(user.uid, userWithoutToken)
      }

      setUser(user)
      return user
    } else {
      setUser(false)
      return false
    }
  }

  const signInWithGoogle = async () => {
    const response = await firebase
      .auth()
      .signInWithPopup(new firebase.auth.GoogleAuthProvider())

    return await handleUser(response.user)
  }

  const signout = async () => {
    await firebase.auth().signOut()

    return await handleUser(false)
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
