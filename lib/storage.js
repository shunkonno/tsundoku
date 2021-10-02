import firebase from './firebase'
import 'firebase/storage'

const storageRef = firebase.storage().ref()

// ============================================================
// User Data
// ============================================================

// ユーザー画像(アバター)の追加
export async function addAvatar(uid, file) {
  const ref = storageRef.child('avatars/' + uid + '/' + file.name)

  await ref.put(file)

  const url = await ref.getDownloadURL()

  return url
}
