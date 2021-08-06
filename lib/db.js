import firebase from './firebase'
import 'firebase/firestore'

const firestore = firebase.firestore()

// ============================================================
// User Data
// ============================================================

// Create new user record
export function createUser(uid, data) {
  return firestore.collection('users').doc(uid).set(data, { merge: true })
}

// Update user info
export function updateUser(uid, data) {
  return firestore.collection('users').doc(uid).update(data)
}
