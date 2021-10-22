//Function
import { updateIsReading } from '../../lib/db'

export const selectReadingBook = async (e, user, bid, mutate) => {
  e.preventDefault()
  e.stopPropagation()

  await updateIsReading(user.uid, bid)

  mutate(['/api/user', user.token])
}