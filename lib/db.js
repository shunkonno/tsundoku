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

// ============================================================
// Session Data
// ============================================================

// Save new session
export function addSession(sessionId, data) {
  return firestore
    .collection('sessions')
    .doc(sessionId)
    .set(data, { merge: true })
}

// Update session
export function updateSession(sessionId, data) {
  return firestore.collection('sessions').doc(sessionId).update(data)
}

// Delete session
export function deleteSession(sessionId) {
  return firestore.collection('sessions').doc(sessionId).delete()
}
