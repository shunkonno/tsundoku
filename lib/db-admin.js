import { dbAdmin } from './firebase-admin'

// ============================================================
// User Data
// ============================================================

// Fetch user with uid
export async function fetchUser(uid) {
  const user = await dbAdmin.collection('users').doc(uid).get()

  return user.data()
}

// ============================================================
// User Stats
// ===========================================================

// ユーザーに紐づく userStats を取得する
// INPUT: uid(String)
export async function fetchUserStats(uid) {
  const userStats = await dbAdmin.collection('userStats').doc(uid).get()

  return userStats.data()
}

// ============================================================
// Session Data
// ============================================================

// Fetch all sessions
export async function fetchAllSessions() {
  const currentDateTime = new Date().toISOString()

  const snapshot = await dbAdmin
    .collection('sessions')
    .where('endDateTime', '>', currentDateTime)
    .orderBy('endDateTime', 'asc')
    .get()

  const allSessions = []

  snapshot.forEach((doc) => {
    allSessions.push(doc.data())
  })

  return allSessions
}

// Fetch session with sessionId
export async function fetchOneSession(sessionId) {
  const session = await dbAdmin.collection('sessions').doc(sessionId).get()

  return session.data()
}

// ============================================================
// Book Data
// ============================================================

// Fetch book with bid (book id)
export async function fetchOneBook(bid) {
  const book = await dbAdmin.collection('books').doc(bid).get()

  return book.data()
}

// ============================================================
// Book (Without ISBN) Data
// ============================================================
// Fetch book with bid (book id)
export async function fetchOneBookWithoutISBN(bid) {
  const book = await dbAdmin.collection('booksWithoutISBN').doc(bid).get()
  return book.data()
}
