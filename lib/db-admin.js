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

// Increment count for the number of times the book has been added to a list
// export async function incrementBookListCount(isbn13) {
//   return db
//     .collection('books')
//     .doc(isbn13)
//     .update({ bookListCount: FieldValue.increment(1) })
// }
