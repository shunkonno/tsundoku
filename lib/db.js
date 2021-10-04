import firebase from './firebase'
import 'firebase/firestore'

const firestore = firebase.firestore()

// ============================================================
// User Collection - User Data
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

// ユーザーがすでに存在するか確認する
// INPUT: uid(String)
export async function checkUserExist(uid) {
  const user = await firestore.collection('users').doc(uid).get()
  if (!user.exists) {
    return false
  } else {
    return true
  }
}

// ユーザーが現在読んでいる本を登録・更新する
// INPUT: uid(String), bid(String)
export function updateIsReading(uid, bid) {
  return firestore
    .collection('users')
    .doc(uid)
    .set({ isReading: bid }, { merge: true })
}

// ============================================================
// UserStats Collection
// ============================================================

// ユーザーの stats を初期化する
// INPUT: uid(String), data(Object)
export function initializeUserStats(uid, data) {
  return firestore.collection('userStats').doc(uid).set(data, { merge: true })
}

// ユーザーの stats を更新する
// INPUT: uid(String), duration(int)
export async function addReadTimeToUserStats(uid, duration) {
  const userStats = await firestore.collection('userStats').doc(uid).get()

  // stats object を取得
  const stats = userStats.data()

  // readTime object を取得
  var readTime = stats.readTime ? stats.readTime : { readTime: {} }

  // 年月日を取得
  const currentDateTime = new Date()
  const currentYear = currentDateTime.getFullYear()
  const currentMonth = currentDateTime.getMonth() + 1
  const currentDate = currentDateTime.getDate()

  if (!readTime?.[currentYear]?.[currentMonth]?.[currentDate]) {
    // 値が存在しない場合は、追加する
    // Nested Object の undefined を想定するため、if 文で制御
    if (!readTime) {
      readTime = { [currentYear]: {} }
    }

    if (!readTime[currentYear]) {
      readTime[currentYear] = { [currentMonth]: {} }
    }

    if (!readTime[currentYear][currentMonth]) {
      readTime[currentYear][currentMonth] = { [currentDate]: {} }
    }

    if (!readTime[currentYear][currentMonth][currentDate]) {
      readTime[currentYear][currentMonth][currentDate] = duration
    } else {
      readTime[currentYear][currentMonth][currentDate] += duration
    }

    return firestore
      .collection('userStats')
      .doc(uid)
      .set({ readTime }, { merge: true })
  } else {
    // 値が存在する場合は、すでにある値に追加する
    readTime[currentYear][currentMonth][currentDate] += duration

    return firestore
      .collection('userStats')
      .doc(uid)
      .set({ readTime }, { merge: true })
  }
}

// ============================================================
// User Collection - Booklist Data
// ============================================================

// ブックリストを更新する
// INPUT: uid(String), bookList(Object)
export function updateBookList(uid, data) {
  return firestore
    .collection('users')
    .doc(uid)
    .set({ bookList: data }, { merge: true })
}

// ISBNのない本のリスト (bookListWithoutISBN) を更新する
// INPUT: uid(String), bookListWithoutISBN(Object)
export function updateBookListWithoutISBN(uid, data) {
  return firestore
    .collection('users')
    .doc(uid)
    .set({ bookListWithoutISBN: data }, { merge: true })
}

// 特定の本の読書時間をカウントアップ
// INPUT: uid(String), bid(String), duration(int)
export async function addReadTime(uid, bid, duration) {
  const user = await firestore.collection('users').doc(uid).get()
  const userInfo = user.data()

  // 各ブックリスト
  var bookList = userInfo.bookList
  var bookListWithoutISBN = userInfo.bookListWithoutISBN

  // チェック変数
  var done = false

  // bookList があれば、確認する
  if (bookList.length > 0) {
    for (const item of bookList) {
      if (item.bid === bid) {
        item.totalReadTime += duration
        done = true
      }
    }
  }

  // 読書時間の追加を完了していないなら、非ISBNのリストも確認する
  if (bookListWithoutISBN.length > 0 && !done) {
    for (const item of bookListWithoutISBN) {
      if (item.bid === bid) {
        item.totalReadTime += duration
      }
    }
  }

  return firestore
    .collection('users')
    .doc(uid)
    .set({ bookList, bookListWithoutISBN }, { merge: true })
}

// 特定の本の manualProgress を更新
// INPUT: uid(String), bid(String), manualProgress(int)
export async function updateManualProgress(uid, bid, manualProgress) {
  const user = await firestore.collection('users').doc(uid).get()
  const userInfo = user.data()

  // 各ブックリスト
  var bookList = userInfo.bookList
  var bookListWithoutISBN = userInfo.bookListWithoutISBN

  // チェック変数
  var done = false

  // bookList があれば、確認する
  if (bookList.length > 0) {
    for (const item of bookList) {
      if (item.bid === bid) {
        // autoProgress を false に変更
        item.autoProgress = false

        // manualProgess に進捗割合をセット
        item.manualProgress = manualProgress

        done = true
      }
    }
  }

  // 読書時間の追加を完了していないなら、非ISBNのリストも確認する
  if (bookListWithoutISBN.length > 0 && !done) {
    for (const item of bookListWithoutISBN) {
      if (item.bid === bid) {
        // autoProgress を false に変更
        item.autoProgress = false

        // manualProgess に進捗割合をセット
        item.manualProgress = manualProgress
      }
    }
  }

  return firestore
    .collection('users')
    .doc(uid)
    .set({ bookList, bookListWithoutISBN }, { merge: true })
}

// ============================================================
// Sessions Collection - Session Data
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
  return firestore
    .collection('sessions')
    .doc(sessionId)
    .set(data, { merge: true })
}

// セッションを削除する
// INPUT: sessionId(String)
export function deleteSession(sessionId) {
  return firestore.collection('sessions').doc(sessionId).delete()
}

// ============================================================
// Books Collection - Book Data
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
  return firestore
    .collection('books')
    .doc(bid)
    .set({ bookListCount: count }, { merge: true })
}

// ============================================================
// BooksWithoutISBN Collection - Book (Without ISBN) Data
// ============================================================

// ISBNのない本を保存する (bid のみで管理するため、重複が発生する)
// INPUT: bid(String), bookInfo(Object)
export function addBookWithoutISBN(bid, data) {
  return firestore
    .collection('booksWithoutISBN')
    .doc(bid)
    .set(data, { merge: true })
}
