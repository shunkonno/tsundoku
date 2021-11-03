// Basic
import { useState, useEffect } from 'react'

// Components
import { ListBookCard } from '../Card'

// Context
import { useUserBookList } from "../../context/useUserBookList"
import { useUserInfo } from "../../context/useUserInfo"

export default function BooksGrid() {

  // State
  let [loading, setLoading] = useState(true)
  let [bookCardsSelected, setBookCardSelected] = useState([])

  // ユーザー情報
  const { userInfo, error } = useUserInfo()

  // ブックリスト
  const bookList = useUserBookList(userInfo?.uid)

  // ブックリストの長さ分の、falseで埋められた空配列を用意する。
  useEffect(() => {
    setBookCardSelected(Array(bookList?.length).fill(false))
  }, [bookList])

  // ============================================================
  // Button Handlers
  // ============================================================

  const toggleBookCardsSelected = (e, idx, bool) => {
    e.preventDefault()
    e.stopPropagation()

    const newBookCardsSelected = bookCardsSelected.slice() //Stateの配列をコピー
    newBookCardsSelected.fill(false) //すべてをfalseで初期化
    newBookCardsSelected[idx] = bool // 選択したbookCardのstateをtrueにする
    setBookCardSelected(newBookCardsSelected)
  }

  // ============================================================
  // Loading
  // ============================================================
  useEffect(()=> {
    if(userInfo && bookList){
      setLoading(false)
    }
  },[userInfo, bookList])

  // Render Skeleton
  const renderSkeleton = (loading) => {

    return(
      [...Array(6)].map((empty, idx)=>{
        return(
          <ListBookCard
            key={idx}
            loading={loading}
          />
        )
      }
      )
    )
  }

  // ============================================================
  // Return Component
  // ============================================================

  return(
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
        {loading ?
        renderSkeleton(loading)
        :
        bookList?.map(
          (
            {
              bookInfo,
              date,
              totalReadTime,
              autoProgress,
              manualProgress
            },
            idx
          ) => (
            <ListBookCard 
              bookInfo={bookInfo}
              date={date}
              totalReadTime={totalReadTime}
              autoProgress={autoProgress}
              manualProgress={manualProgress}
              bookCardsSelected={bookCardsSelected}
              idx={idx}
              toggleBookCardsSelected={toggleBookCardsSelected}
              key={bookInfo.bid}
            />
          )
        )}
      </div>
    </>
  )
}