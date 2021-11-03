//Vercel
import Link from 'next/link'

// Assets
import { PlusIcon } from '@heroicons/react/solid'

// Components
import { ReservableRoomList } from '../List'

const ReservableRoomSection = () => {

  return(
    <section className="py-3 mt-10">
      <div className="flex justify-between items-center mb-4">
        <div className="flex-shrink-0">
          <h2 className="title-section onboarding-1">ルーム一覧</h2>
        </div>
        <div className="flex flex-1 justify-end">
          <Link href="/session/new" passHref>
            <a className="group flex items-center py-2 w-auto text-base font-bold hover:text-blue-700 text-tsundoku-blue-main onboarding-3">
              <PlusIcon className="inline-block mr-2 w-6 h-6" />
              <span>ルームを作成する</span>
            </a>
          </Link>
        </div>
      </div>

      <div
        className="overflow-y-auto h-full"
        aria-label="Directory"
      >
        <ReservableRoomList />
      </div>
    </section>
  )
}

export default ReservableRoomSection