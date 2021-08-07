import { dbAdmin } from './firebase-admin'

// ============================================================
// User Data
// ============================================================

// Fetch user with uid
export async function fetchUser(uid) {
  const user = await dbAdmin.collection('users').doc(uid).get()

  return user.data()
}
