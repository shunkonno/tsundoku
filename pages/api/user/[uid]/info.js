import { fetchUser } from '../../../../lib/db-admin'

// INPUT: uid
// OUTPUT: users collection に含まれる、ユーザー情報の一部

const infoApiHandler = async (req, res) => {
  try {
    const user = await fetchUser(req.query.uid)

    const info = { uid: user.uid, name: user.name, avatar: user.avatar, isReading: user.isReading }

    res.status(200).json(info)
  } catch (error) {
    res.status(500).json({ error })
  }
}

export default infoApiHandler
