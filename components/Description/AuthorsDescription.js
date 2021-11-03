
export default function AuthorsDescription(authors) {
  //3人以上著者がいたら、3人目以降を省略し、"・他"を付け加えて表示する。
  if (authors.length > 2) {
    return (
      <div className="overflow-hidden mt-1 sm:mt-0 max-h-10">
        {
          //authorsの配列の3人目以降を削除
          authors.slice(0, 2).map((author, idx) => {
            //今の項目が2番目(最後)だったら、inline-blockにする。それ以外ならblockにする。
            if (idx != 1) {
              return (
                <span
                  className="block text-xs sm:text-sm leading-4 text-gray-500 truncate"
                  key={author}
                >
                  {author}
                </span>
              )
            } else {
              return (
                <span
                  className="inline-block text-xs sm:text-sm leading-4 text-gray-500 truncate"
                  key={author}
                >
                  {author}
                </span>
              )
            }
          })
        }
        {/* 2人目の著者の右に "・他" を描画する */}
        <span className="inline-block text-xs sm:text-sm leading-4 text-gray-500 truncate">
          ・他
        </span>
      </div>
    )
  }
  //2人以下なら全員を並べて表示するのみ
  else {
    return authors.map((author) => {
      return (
        <div className="overflow-hidden mt-1 sm:mt-0 max-h-10" key={author}>
          <p className="text-xs sm:text-sm text-gray-500 truncate">
            {author}
          </p>
        </div>
      )
    })
  }
}