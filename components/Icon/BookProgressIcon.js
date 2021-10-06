import classNames from "../../utils/classNames"

export default function BookProgressIcon({progress}) {
  return(
    <div className="flex">
      <svg
        className={classNames(
          progress >= 0.2 ?
          "text-blue-100"
          :
          "text-gray-100",
          "mr-1 w-1.5 h-6"
        )}
        fill="currentColor"
        viewBox="0 0 5 20"
      >
        <rect x="0" y="0" r="1" width="5" height="20" />
      </svg>
      <svg
        className={classNames(
          progress >= 0.4 ?
          "text-blue-200"
          :
          "text-gray-100",
          "mr-1 w-1.5 h-6"
        )}
        fill="currentColor"
        viewBox="0 0 5 20"
      >
        <rect x="0" y="0" r="1" width="5" height="20" />
      </svg>
      <svg
        className={classNames(
          progress >= 0.6 ?
          "text-blue-300"
          :
          "text-gray-100",
          "mr-1 w-1.5 h-6"
        )}
        fill="currentColor"
        viewBox="0 0 5 20"
      >
        <rect x="0" y="0" r="1" width="5" height="20" />
      </svg>
      <svg
        className={classNames(
          progress >= 0.8 ?
          "text-blue-400"
          :
          "text-gray-100",
          "mr-1 w-1.5 h-6"
        )}
        fill="currentColor"
        viewBox="0 0 5 20"
      >
        <rect x="0" y="0" r="1" width="5" height="20" />
      </svg>
      <svg
        className={classNames(
          progress >= 1 ?
          "text-blue-500"
          :
          "text-gray-100",
          "mr-1 w-1.5 h-6"
        )}
        fill="currentColor"
        viewBox="0 0 5 20"
      >
        <rect x="0" y="0" r="1" width="5" height="20" />
      </svg>
    </div>
  )
}