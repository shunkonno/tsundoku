// Basics
import { useState, useEffect } from 'react'

// Components
import { ReservableRoomCard } from '../Card'

//Functions
import { useUserInfo } from '../../context/useUserInfo'
import { formatISOStringToDate } from '../../utils/formatDateTime'
import { useAllSessions } from '../../context/useAllSessions'

export default function ReservableRoomList() {
  // State
  let [loading, setLoading] = useState(true)

  // ユーザー情報
  const { userInfo, error } = useUserInfo()
  const uid = userInfo?.uid

  // セッション情報
  const sessions = useAllSessions()

  // Loading
  useEffect(()=>{
    if (userInfo && sessions) {
      setLoading(false)
    }
  },[userInfo, sessions])

  // Skeleton
  if(loading){
    return(
      <ul className="py-2">
        {[...Array(2)].map((a, idx) => (
          <li key={idx} className="mb-5">
            <ReservableRoomCard loading={loading}/>
          </li>
        ))}
      </ul>
    )
  }

  // ownerIdかguestIdにログインユーザーのuidが含まれていないsessionをフィルタリング
  var reservableList = sessions?.filter((session) => {
    return !(
      session?.ownerId == uid || session?.guestId == uid
    )
  })

if(reservableList.length){
  // 予約可能なセッションがあったら
  const startDates = sessions
  ?.filter((session) => {
    return !(
      session.ownerId == uid || session.guestId == uid
    )
  })
  .map((session) => {
    return formatISOStringToDate(session.startDateTime)
  })
  const duplicateDeletedStartDates = [...new Set(startDates)]

    return duplicateDeletedStartDates.map((startDate) => (
      <div key={startDate} className="relative">
        <div className="sticky top-0 z-10 py-0.5 mt-4 text-base font-bold bg-gray-50">
          <h3>{startDate}</h3>
        </div>
        <ul role="list" className="py-2">
          {sessions
            ?.filter((session) => {
              return (
                !(
                  session.ownerId == uid ||
                  session.guestId == uid
                ) && startDate == formatISOStringToDate(session.startDateTime)
              )
            })
            .map((session) => (
                  <li key={session?.sessionId} className="mb-5">
                    <ReservableRoomCard {...session} loading={loading}/>
                  </li>
                
            ))}
        </ul>
      </div>
    ))
}
else{
  //予約可能なセッションがなかったら
  return (
    <div className="py-6 text-center bg-gray-100 rounded-md">
      現在、予約可能のルームはありません。
    </div>
  )
}

}
