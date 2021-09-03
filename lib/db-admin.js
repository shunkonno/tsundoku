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
export async function fetchSessions() {
  const snapshot = await dbAdmin
    .collection('sessions')
    .orderBy('startDateTime', 'asc')
    .get()

  const allSessions = []

  snapshot.forEach((doc) => {
    allSessions.push(doc.data())
  })

  console.log(allSessions)

  return allSessions
}
