import dict from '../localesDictionary.json'

const sentences = Object.keys(dict)

function useLocalesFilter(locale){
   return sentences.reduce((result, sentence)=> {
    result[sentence] = dict[sentence][locale]
    return result
  }, {})
}

export default useLocalesFilter