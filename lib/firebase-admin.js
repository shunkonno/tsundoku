import admin from 'firebase-admin'

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY,
      project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    })
  })
}

const dbAdmin = admin.firestore()
const authAdmin = admin.auth()

// Utilities
const increment = admin.firestore.FieldValue.increment(1)
const decrement = admin.firestore.FieldValue.increment(-1)

export { dbAdmin, authAdmin, increment, decrement }
