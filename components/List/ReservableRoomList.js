//Component
import { ReservableRoomCard } from '../Card'

//Functions
import { formatISOStringToDate } from '../../utils/formatDateTime'

export default function ReservableRoomList({reserveSession, sessions, uid }) {

  const startDates = sessions
      .filter((session) => {
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
            .filter((session) => {
              return (
                !(
                  session.ownerId == uid ||
                  session.guestId == uid
                ) && startDate == formatISOStringToDate(session.startDateTime)
              )
            })
            .map((session) => (
                  <li key={session?.sessionId} className="mb-5">
                    <ReservableRoomCard reserveSession={reserveSession} {...session} />
                  </li>
                
            ))}
        </ul>
      </div>
    ))
}
