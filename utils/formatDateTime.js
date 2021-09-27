import moment from 'moment'

// ISOString を 月、日、時、分 に変換 (例：10月12日 12:45)
export const formatISOStringToDateTime = (IsoString) => {
  return moment(IsoString).format('M月D日 H:mm')
}

// ISOString を 月、日 に変換 (例：10月12日)
export const formatISOStringToDateTimeWithSlash = (IsoString) => {
  return moment(IsoString).format('YYYY/M/D H:mm')
}

// ISOString を 月、日 に変換 (例：10月12日)
export const formatISOStringToDate = (IsoString) => {
  return moment(IsoString).format('M月D日')
}

// ISOString を 時、分 に変換 (例：12:45)
export const formatISOStringToTime = (IsoString) => {
  return moment(IsoString).format('H:mm')
}
