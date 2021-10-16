// ============================================================
// Import
// ============================================================
import Link from 'next/link'

//Assets
import { ChevronRightIcon } from '@heroicons/react/outline'

//Functions
import { formatISOStringToDateTime, formatISOStringToTime } from '../../utils/formatDateTime'



export default function ReservedRoomCard({sessionId, ownerName, startDateTime, endDateTime, duration}) {

  return (
    <div className="w-full bg-white rounded-md border border-gray-400 divide-y divide-gray-200">
      <div className="flex justify-between items-center p-4 space-x-6">
        <div className="flex-1 truncate">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <h3 className="session-card-date">
                {formatISOStringToDateTime(startDateTime)}
                &nbsp;〜&nbsp;
                {formatISOStringToTime(endDateTime)}
              </h3>
            </div>
          </div>
          <div className="mt-1">
            <span className="text-gray-500 session-card-duration">
              {`${duration} 分間 / 開催者：${ownerName}`}
            </span>
          </div>
        </div>
        <Link
          href={`/session/${sessionId}/detail`}
          key={sessionId}
        >
          <a className="flex items-center hover:text-gray-700">
            <p>詳細</p>
            <ChevronRightIcon className=" w-6 h-6" />
          </a>
        </Link>
      </div>
    </div>
  )
}
