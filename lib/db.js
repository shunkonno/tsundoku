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

// Update book list without ISBN
export function updateBookListWithoutISBN(uid, data) {
  return firestore
    .collection('users')
    .doc(uid)
    .update({ bookListWithoutISBN: data })
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
export function addBook(bid, data) {
  return firestore.collection('books').doc(bid).set(data, { merge: true })
}

// Check if book already exists in db
export async function fetchBookInfo(isbn13) {
  const snapshot = await firestore
    .collection('books')
    .where('isbn13', '==', isbn13)
    .get()

  const bookInfo = []

  snapshot.forEach((doc) => {
    bookInfo.push(doc.data())
  })

  console.log(bookInfo)

  if (bookInfo.lenth == 0) {
    return null
  } else {
    return bookInfo[0]
  }
}

// Increment count for the number of times the book has been added to a list
export async function updateBookListCount(bid, data) {
  return firestore.collection('books').doc(bid).update({ bookListCount: data })
}
