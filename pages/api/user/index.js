import { fetchUser } from '../../../lib/db-admin'
import { authAdmin } from '../../../lib/firebase-admin'

// INPUT: uid
// OUTPUT: users collection に含まれる、ユーザー情報

const userApiHandler = async (req, res) => {
  try {
    const { uid } = await authAdmin.verifyIdToken(req.headers.token)
    const user = await fetchUser(uid)
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ error })
  }
}

export default userApiHandler
