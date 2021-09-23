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

// Update book list
export function updateBookList(uid, data) {
  return firestore.collection('users').doc(uid).update({ bookList: data })
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

// ============================================================
// Book Data
// ============================================================

// Save new book
export function addBook(data) {
  return firestore
    .collection('books')
    .doc(data.isbn13)
    .set(data, { merge: true })
}

// Check if book already exists in db
export async function checkBookExists(isbn13) {
  const doc = await db.collection('books').doc(isbn13).get()

  if (!doc.exists) {
    return false
  } else {
    return true
  }
}

// Increment count for the number of times the book has been added to a list
export async function incrementBookListCount(isbn13) {
  return db
    .collection('books')
    .doc(isbn13)
    .update({ bookListCount: FieldValue.increment(1) })
}
