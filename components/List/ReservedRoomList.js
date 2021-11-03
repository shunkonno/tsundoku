// Basics
import { useState, useEffect } from 'react'

// Components
import { ReservedRoomCard } from '../Card'

// Functions
import { useUserInfo } from '../../context/useUserInfo'
import { useAllSessions } from '../../context/useAllSessions'

export default function ReservedRoomList() {
  let [loading, setLoading] = useState(true)

  //ユーザー情報
  const userInfo = useUserInfo()

  //セッション情報
  const sessions = useAllSessions()

  // ログインしているユーザーが、セッションのオーナー・ゲストか判定する
  var userIsOwnerOrGuest

  if (sessions) {
    userIsOwnerOrGuest = sessions.some((session) => {
      return (
        userInfo?.uid == session?.guestId || userInfo?.uid == session?.ownerId
      )
    })
  }

  // Loading
  useEffect(()=>{
    if (userInfo && sessions) {
      setLoading(false)
    }
  },[userInfo, sessions])

  return(
    <>
    {loading ?
      <ul>
        {[...Array(2)].map((empty, idx) => (
          <li key={idx} className="mb-5">
            <ReservedRoomCard loading={loading} />
          </li>
        ))}
      </ul>
      :
      userIsOwnerOrGuest ? (
        <ul role="list">
          {sessions.map((session) =>
            userInfo.uid == session.guestId ||
            userInfo.uid == session.ownerId ? (
              <li key={session?.sessionId} className="mb-5">
                <ReservedRoomCard {...session} loading={loading} />
              </li>
            ) : (
              <></>
            )
          )}
        </ul>
      ) : (
        <div className="py-6 text-center bg-gray-100 rounded-md">
          現在、参加予定のルームはありません。
        </div>
      )}
    </>
  )
}