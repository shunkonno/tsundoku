import firebase from './firebase'
import 'firebase/firestore'

const firestore = firebase.firestore()

// ============================================================
// User Data
// ============================================================

// ユーザーを追加する
// INPUT: uid(String), userInfo(Object)
export function createUser(uid, data) {
  return firestore.collection('users').doc(uid).set(data, { merge: true })
}

// ユーザー情報を更新する
// INPUT: uid(String), userInfo(Object)
export function updateUser(uid, data) {
  return firestore.collection('users').doc(uid).update(data)
}

// ブックリストを更新する
// INPUT: uid(String), bookList(Object)
export function updateBookList(uid, data) {
  return firestore.collection('users').doc(uid).update({ bookList: data })
}

// ISBNのない本のリスト (bookListWithoutISBN) を更新する
// INPUT: uid(String), bookListWithoutISBN(Object)
export function updateBookListWithoutISBN(uid, data) {
  return firestore
    .collection('users')
    .doc(uid)
    .update({ bookListWithoutISBN: data })
}

// ユーザーが現在読んでいる本を登録・更新する
// INPUT: uid(String), bid(String)
export function updateIsReading(uid, bid) {
  return firestore.collection('users').doc(uid).update({ isReading: bid })
}

// ============================================================
// Session Data
// ============================================================

// 新たなセッション情報を保存する
// INPUT: sessionId(String), sessionInfo(Object)
export function addSession(sessionId, data) {
  return firestore
    .collection('sessions')
    .doc(sessionId)
    .set(data, { merge: true })
}

// セッション情報を更新する
// INPUT: sessionId(String), sessionInfo(Object)
export function updateSession(sessionId, data) {
  return firestore.collection('sessions').doc(sessionId).update(data)
}

// セッションを削除する
// INPUT: sessionId(String)
export function deleteSession(sessionId) {
  return firestore.collection('sessions').doc(sessionId).delete()
}

// ============================================================
// Book Data
// ============================================================

// 本を追加する
// INPUT: bid(String), bookInfo(Object)
export function addBook(bid, data) {
  return firestore.collection('books').doc(bid).set(data, { merge: true })
}

// ISBNをもとに、本の情報を取得する
// INPUT: ISBN-13(String)
export async function fetchBookInfo(isbn13) {
  const snapshot = await firestore
    .collection('books')
    .where('isbn13', '==', isbn13)
    .get()

  const bookInfo = []

  snapshot.forEach((doc) => {
    bookInfo.push(doc.data())
  })

  if (bookInfo.lenth == 0) {
    return null
  } else {
    return bookInfo[0]
  }
}

// 特定の本がブックリストに追加されたカウントを更新する
// INPUT: bid(String), count(int)
export async function updateBookListCount(bid, count) {
  return firestore.collection('books').doc(bid).update({ bookListCount: count })
}

// ============================================================
// Book (Without ISBN) Data
// ============================================================

// ISBNのない本を保存する (bid のみで管理するため、重複が発生する)
// INPUT: bid(String), bookInfo(Object)
export function addBookWithoutISBN(bid, data) {
  return firestore
    .collection('booksWithoutISBN')
    .doc(bid)
    .set(data, { merge: true })
}
