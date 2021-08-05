import { dict } from '../LocalesDictionary.js'

function useLocalesFilter(filterName, locale){
  //filterName("dashboard"や"header"など)によってフィルターする
  const filteredSentences = dict.filter((dic) => {
    return  Object.keys(dic)[0] == filterName
  })

  //filterName以下のオブジェクト＝翻訳ソースを抜き出す
  const targetSentences =  filteredSentences.map((sentence)=> {
    return sentence[filterName]
  })

  //翻訳ソースとなるオブジェクト(=targetSentenses[0])のキーを一覧にし配列に入れる。
  const sentenceNames = Object.keys(targetSentences[0])

  //翻訳ソースとなるオブジェクトをlocaleでフィルターする。(locale="ja"の場合、キーが"ja"以外を削除)
  const result = sentenceNames.reduce(( accum, sentenceName ) => {
    accum[sentenceName] = targetSentences[0][sentenceName][locale]
    return accum
  },{})

  return result
}

export default useLocalesFilter