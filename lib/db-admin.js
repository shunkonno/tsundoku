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
  const sessions = await dbAdmin
    .collection('sessions')
    .orderBy('sessionDate', 'asc')
    .get()

  return sessions.data()
}
