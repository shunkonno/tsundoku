// Components
import { ReservedRoomList } from '../List'

const ReservedRoomSection = () => {

  return(
    <section className="pb-3">
      <div className="mb-4">
        <h2 className="title-section onboarding-2">
          参加予定のルーム
        </h2>
      </div>
      <ReservedRoomList />
    </section>
  )
}

export default ReservedRoomSection